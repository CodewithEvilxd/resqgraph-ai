import { respondersRepository } from './responders.repository.js';
import { auditService } from '../audit/audit.service.js';
import { realtimeService } from '../../services/realtime.service.js';
import { Responder, Team, Assignment } from '../../contracts/types/responder.js';
import { AuthTokenPayload } from '../../contracts/types/user.js';
import {
  UpdateResponderStatusInput,
  CreateAssignmentInput,
  UpdateAssignmentStatusInput,
} from '../../contracts/schemas/responder.schema.js';
import { REALTIME_EVENTS, AUDIT_ACTIONS } from '../../contracts/constants/events.js';
import { generateUUID } from '../../utils/crypto.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { dbStore } from '../../db/index.js';

export class RespondersService {
  async listResponders(organizationId: string): Promise<Responder[]> {
    return respondersRepository.findAllResponders(organizationId);
  }

  async listTeams(organizationId: string): Promise<Team[]> {
    return respondersRepository.findAllTeams(organizationId);
  }

  async updateResponderStatus(
    id: string,
    input: UpdateResponderStatusInput,
    user: AuthTokenPayload
  ): Promise<Responder> {
    const responder = await respondersRepository.findResponderById(id);
    if (!responder || responder.organizationId !== user.organizationId) {
      throw new NotFoundError(`Responder ${id} not found`);
    }

    // Only self or dispatchers/commanders can update status
    const isSelf = responder.userId === user.userId;
    const isDispatcher = ['dispatcher', 'commander', 'admin'].includes(user.role);
    if (!isSelf && !isDispatcher) {
      throw new ForbiddenError('Not authorized to update this responder status');
    }

    const updated = await respondersRepository.updateResponderStatus(
      id,
      input.status,
      input.currentLocation,
      input.batteryLevel
    );

    realtimeService.broadcastToOrg(user.organizationId, REALTIME_EVENTS.RESPONDER_STATUS, updated);
    if (input.currentLocation) {
      realtimeService.broadcastToOrg(user.organizationId, REALTIME_EVENTS.RESPONDER_LOCATION, {
        responderId: id,
        location: input.currentLocation,
        batteryLevel: input.batteryLevel,
      });
    }

    return updated;
  }

  async createAssignment(input: CreateAssignmentInput, user: AuthTokenPayload): Promise<Assignment> {
    if (!['dispatcher', 'commander', 'admin'].includes(user.role)) {
      throw new ForbiddenError('Assigning responders requires dispatcher or commander privileges');
    }

    const incident = dbStore.incidents.get(input.incidentId);
    if (!incident || incident.organizationId !== user.organizationId) {
      throw new NotFoundError(`Incident ${input.incidentId} not found`);
    }

    const id = generateUUID();
    const now = new Date().toISOString();

    const assignment: Assignment = {
      id,
      incidentId: input.incidentId,
      organizationId: user.organizationId,
      teamId: input.teamId,
      responderId: input.responderId,
      status: 'dispatched',
      approvedByUserId: user.userId,
      approvalReason: input.approvalReason,
      dispatchedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const created = await respondersRepository.createAssignment(assignment);

    // Update responder/team status to 'assigned'
    if (input.responderId) {
      await respondersRepository.updateResponderStatus(input.responderId, 'assigned');
    }

    await auditService.record({
      organizationId: user.organizationId,
      userId: user.userId,
      userEmail: user.email,
      userRole: user.role,
      action: AUDIT_ACTIONS.ASSIGNMENT_CREATE,
      targetEntity: 'assignment',
      targetEntityId: created.id,
      details: { incidentId: input.incidentId, responderId: input.responderId, teamId: input.teamId },
    });

    realtimeService.broadcastToOrg(user.organizationId, REALTIME_EVENTS.ASSIGNMENT_CREATED, created);
    realtimeService.broadcastToIncident(input.incidentId, REALTIME_EVENTS.ASSIGNMENT_CREATED, created);

    return created;
  }

  async updateAssignmentStatus(
    id: string,
    input: UpdateAssignmentStatusInput,
    user: AuthTokenPayload
  ): Promise<Assignment> {
    const assignment = await respondersRepository.findAssignmentById(id);
    if (!assignment || assignment.organizationId !== user.organizationId) {
      throw new NotFoundError(`Assignment ${id} not found`);
    }

    const updated = await respondersRepository.updateAssignmentStatus(id, input.status);

    // If completed or cancelled, free responder
    if (['completed', 'cancelled'].includes(input.status) && assignment.responderId) {
      await respondersRepository.updateResponderStatus(assignment.responderId, 'available');
    }

    realtimeService.broadcastToOrg(user.organizationId, REALTIME_EVENTS.ASSIGNMENT_UPDATED, updated);
    realtimeService.broadcastToIncident(assignment.incidentId, REALTIME_EVENTS.ASSIGNMENT_UPDATED, updated);

    return updated;
  }

  async listAssignmentsForIncident(incidentId: string): Promise<Assignment[]> {
    return respondersRepository.findAssignmentsByIncident(incidentId);
  }

  async listAllAssignments(organizationId: string): Promise<Assignment[]> {
    return respondersRepository.findAllAssignments(organizationId);
  }
}

export const respondersService = new RespondersService();
