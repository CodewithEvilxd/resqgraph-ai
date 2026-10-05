import { dbStore } from '../../db/index.js';
import { IncidentsRepository, incidentsRepository } from '../incidents/incidents.repository.js';
import { RespondersRepository, respondersRepository } from '../responders/responders.repository.js';
import { AuditService, auditService } from '../audit/audit.service.js';
import { realtimeService } from '../../services/realtime.service.js';
import { AllocationRecommendation } from '../../contracts/types/graph.js';
import { AuthTokenPayload } from '../../contracts/types/user.js';
import { Assignment, ResourceCategory } from '../../contracts/types/responder.js';
import { HAZARD_TYPES } from '../../contracts/constants/priorities.js';
import { REALTIME_EVENTS } from '../../contracts/constants/events.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { calculateDistanceMeters } from '../../utils/spatial.js';
import { generateUUID } from '../../utils/crypto.js';
import { logger } from '../../utils/logger.js';

export class AllocationService {
  constructor(
    private readonly incidentsRepo: IncidentsRepository = incidentsRepository,
    private readonly respondersRepo: RespondersRepository = respondersRepository,
    private readonly audit: AuditService = auditService,
  ) {}

  async recommendTeams(incidentId: string): Promise<AllocationRecommendation[]> {
    const incident = await this.incidentsRepo.findById(incidentId);
    if (!incident) {
      throw new NotFoundError(`Incident ${incidentId} not found`);
    }

    const recommendations: AllocationRecommendation[] = [];
    const allTeams = Array.from(dbStore.teams.values()).filter(
      t => t.organizationId === incident.organizationId,
    );

    // Determine target category and equipment based on hazard type
    let targetCategory: ResourceCategory = 'rescue';
    const requiredEquipment: string[] = [];

    switch (incident.hazardType) {
      case HAZARD_TYPES.FIRE:
        targetCategory = 'fire';
        requiredEquipment.push('Water tender engine', 'SCBA breathing apparatus', 'Thermal imaging camera');
        break;
      case HAZARD_TYPES.FLOOD:
        targetCategory = 'rescue';
        requiredEquipment.push('Inflatable rescue boat', 'PFD life vests', 'Submersible dewatering pump');
        break;
      case HAZARD_TYPES.COLLAPSE:
        targetCategory = 'heavy_equipment';
        requiredEquipment.push('Hydraulic spreader/cutter', 'Acoustic search sensors', 'Shoring equipment');
        break;
      case HAZARD_TYPES.MEDICAL_EMERGENCY:
        targetCategory = 'medical';
        requiredEquipment.push('ALS ambulance', 'Defibrillator monitor', 'Trauma immobilization kit');
        break;
      case HAZARD_TYPES.GAS_LEAK:
      case HAZARD_TYPES.HAZMAT:
        targetCategory = 'rescue';
        requiredEquipment.push('Level A Hazmat suits', 'Multi-gas detector', 'Neutralization foam');
        break;
      default:
        targetCategory = 'rescue';
        requiredEquipment.push('First responder kit', 'High-visibility barrier gear');
    }

    for (const team of allTeams) {
      const reasons: string[] = [];

      // Category matching
      const hasDirectCategory = team.category === targetCategory;
      let capabilityMatchScore = hasDirectCategory ? 0.95 : 0.60;
      if (hasDirectCategory) {
        reasons.push(`Direct category match: ${team.category.toUpperCase()} unit`);
      } else {
        reasons.push(`Cross-functional assistance: ${team.category.toUpperCase()} unit`);
      }

      // Proximity (using team currentLocation or incident default fallback)
      const teamLocation = team.currentLocation || incident.location;
      const distanceMeters = calculateDistanceMeters(
        incident.location.latitude,
        incident.location.longitude,
        teamLocation.latitude,
        teamLocation.longitude,
      );

      // Average 35 km/h urban speed = ~9.7 m/s
      const estimatedArrivalMinutes = Math.max(3, Math.round(distanceMeters / (9.7 * 60)));
      reasons.push(`${(distanceMeters / 1000).toFixed(1)} km from incident location (~${estimatedArrivalMinutes} min ETA)`);

      // Availability check across responders
      const teamResponders = Array.from(dbStore.responders.values()).filter(
        r => r.teamId === team.id,
      );
      const availableCount = teamResponders.filter(r => r.status === 'available').length;

      if (availableCount > 0) {
        reasons.push(`${availableCount}/${teamResponders.length} personnel available immediately`);
      } else {
        reasons.push('Team currently deployed or offline');
        capabilityMatchScore *= 0.5;
      }

      const compositeScore = parseFloat(
        (0.50 * capabilityMatchScore + 0.35 * Math.max(0, 1.0 - distanceMeters / 15000) + 0.15 * (availableCount > 0 ? 1 : 0)).toFixed(2),
      );

      recommendations.push({
        id: generateUUID(),
        incidentId: incident.id,
        teamId: team.id,
        teamName: team.name,
        responderIds: teamResponders.map(r => r.id),
        capabilityMatchScore: compositeScore,
        distanceMeters,
        estimatedArrivalMinutes,
        currentStatus: availableCount > 0 ? 'available' : 'busy',
        reasons,
        requiredEquipment,
        isRecommended: compositeScore >= 0.65 && availableCount > 0,
      });
    }

    recommendations.sort((a, b) => b.capabilityMatchScore - a.capabilityMatchScore);

    logger.info('Generated team allocation recommendations', {
      incidentId,
      teamsEvaluated: allTeams.length,
      topTeam: recommendations[0]?.teamName,
      topScore: recommendations[0]?.capabilityMatchScore,
    });

    return recommendations;
  }

  async dispatchTeam(
    incidentId: string,
    teamId: string,
    user: AuthTokenPayload,
    notes?: string,
  ): Promise<{ assignments: Assignment[]; teamName: string }> {
    if (!['dispatcher', 'commander', 'admin'].includes(user.role)) {
      throw new ForbiddenError('Only dispatchers or commanders may execute team dispatches');
    }

    const incident = await this.incidentsRepo.findById(incidentId);
    if (!incident) {
      throw new NotFoundError(`Incident ${incidentId} not found`);
    }

    const team = dbStore.teams.get(teamId);
    if (!team) {
      throw new NotFoundError(`Team ${teamId} not found`);
    }

    const responders = Array.from(dbStore.responders.values()).filter(r => r.teamId === team.id);
    if (responders.length === 0) {
      throw new NotFoundError(`No responders found for team ${teamId}`);
    }

    const assignments: Assignment[] = [];
    const now = new Date().toISOString();

    for (const responder of responders) {
      const assignmentId = generateUUID();
      const assignment: Assignment = {
        id: assignmentId,
        incidentId: incident.id,
        organizationId: user.organizationId,
        teamId: team.id,
        responderId: responder.id,
        status: 'dispatched',
        approvedByUserId: user.userId,
        approvalReason: notes || `Dispatched with team ${team.name}`,
        dispatchedAt: now,
        createdAt: now,
        updatedAt: now,
      };

      dbStore.assignments.set(assignmentId, assignment);
      await this.respondersRepo.updateResponderStatus(responder.id, 'en_route');
      assignments.push(assignment);
    }

    // Update incident status to 'dispatched' if currently 'verified' or 'reported'
    if (incident.status === 'verified' || incident.status === 'reported') {
      await this.incidentsRepo.updateStatus(incident.id, 'dispatched', user.userId, 'Team dispatched to scene');
    }

    // Record audit event
    await this.audit.record({
      organizationId: user.organizationId,
      userId: user.userId,
      action: 'assignment:create',
      targetEntity: 'team_dispatch',
      targetEntityId: team.id,
      details: {
        incidentId: incident.id,
        teamId: team.id,
        teamName: team.name,
        assignedCount: assignments.length,
        notes,
      },
    });

    // Realtime notification
    realtimeService.broadcastToOrg(user.organizationId, REALTIME_EVENTS.ASSIGNMENT_CREATED, {
      incidentId: incident.id,
      teamId: team.id,
      teamName: team.name,
      assignments,
    });

    logger.info('Team successfully dispatched to incident', {
      incidentId: incident.id,
      teamId: team.id,
      teamName: team.name,
      dispatchedCount: assignments.length,
    });

    return {
      assignments,
      teamName: team.name,
    };
  }
}

export const allocationService = new AllocationService();
