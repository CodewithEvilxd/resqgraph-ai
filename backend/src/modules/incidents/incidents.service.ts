import { incidentsRepository, IncidentFilter } from './incidents.repository.js';
import { auditService } from '../audit/audit.service.js';
import { realtimeService } from '../../services/realtime.service.js';
import { Incident } from '../../contracts/types/incident.js';
import { AuthTokenPayload } from '../../contracts/types/user.js';
import { CreateIncidentInput, UpdateIncidentInput } from '../../contracts/schemas/incident.schema.js';
import { IncidentStatus } from '../../contracts/constants/incident-status.js';
import { REALTIME_EVENTS, AUDIT_ACTIONS } from '../../contracts/constants/events.js';
import { generateIncidentCode, generateUUID } from '../../utils/crypto.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { dbStore } from '../../db/index.js';

export class IncidentsService {
  async create(input: CreateIncidentInput, user: AuthTokenPayload): Promise<Incident> {
    const id = generateUUID();
    const count = dbStore.incidents.size + 1;
    const code = generateIncidentCode(count);
    const now = new Date().toISOString();

    const incident: Incident = {
      id,
      organizationId: user.organizationId,
      code,
      title: input.title,
      description: input.description,
      status: 'reported',
      priority: input.priority,
      hazardType: input.hazardType,
      confidenceScore: 0.6,
      location: input.location,
      affectedPeopleEstimate: input.affectedPeopleEstimate || 0,
      reporterCount: 1,
      evidenceCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const created = await incidentsRepository.create(incident);

    // Record audit event
    await auditService.record({
      organizationId: user.organizationId,
      userId: user.userId,
      userEmail: user.email,
      userRole: user.role,
      action: AUDIT_ACTIONS.INCIDENT_CREATE,
      targetEntity: 'incident',
      targetEntityId: created.id,
      details: { code: created.code, title: created.title, priority: created.priority },
    });

    // Broadcast to organization
    realtimeService.broadcastToOrg(user.organizationId, REALTIME_EVENTS.INCIDENT_CREATED, created);

    return created;
  }

  async getById(id: string, organizationId: string): Promise<Incident> {
    const incident = await incidentsRepository.findById(id);
    if (!incident || incident.organizationId !== organizationId) {
      throw new NotFoundError(`Incident ${id} not found`);
    }
    return incident;
  }

  async list(filter: IncidentFilter): Promise<{ items: Incident[]; total: number }> {
    return incidentsRepository.findAll(filter);
  }

  async update(id: string, updates: UpdateIncidentInput, user: AuthTokenPayload): Promise<Incident> {
    const existing = await this.getById(id, user.organizationId);

    const updated = await incidentsRepository.update(id, updates);

    await auditService.record({
      organizationId: user.organizationId,
      userId: user.userId,
      userEmail: user.email,
      userRole: user.role,
      action: AUDIT_ACTIONS.INCIDENT_UPDATE,
      targetEntity: 'incident',
      targetEntityId: id,
      details: { updates, previousTitle: existing.title },
    });

    realtimeService.broadcastToOrg(user.organizationId, REALTIME_EVENTS.INCIDENT_UPDATED, updated);
    realtimeService.broadcastToIncident(id, REALTIME_EVENTS.INCIDENT_UPDATED, updated);

    return updated;
  }

  async transitionStatus(
    id: string,
    newStatus: IncidentStatus,
    reason: string | undefined,
    user: AuthTokenPayload
  ): Promise<Incident> {
    await this.getById(id, user.organizationId);

    // High impact status transitions require dispatcher/commander/admin role
    if (['dispatched', 'contained', 'resolved', 'closed', 'dismissed'].includes(newStatus)) {
      if (!['dispatcher', 'commander', 'admin'].includes(user.role)) {
        throw new ForbiddenError(`Role '${user.role}' cannot transition incident to '${newStatus}'`);
      }
    }

    const { incident, history } = await incidentsRepository.updateStatus(
      id,
      newStatus,
      user.userId,
      reason
    );

    await auditService.record({
      organizationId: user.organizationId,
      userId: user.userId,
      userEmail: user.email,
      userRole: user.role,
      action: AUDIT_ACTIONS.INCIDENT_STATUS_CHANGE,
      targetEntity: 'incident',
      targetEntityId: id,
      details: {
        previousStatus: history.previousStatus,
        newStatus: history.newStatus,
        reason,
      },
    });

    realtimeService.broadcastToOrg(user.organizationId, REALTIME_EVENTS.INCIDENT_STATUS_CHANGED, {
      incidentId: id,
      status: newStatus,
      history,
    });
    realtimeService.broadcastToIncident(id, REALTIME_EVENTS.INCIDENT_STATUS_CHANGED, {
      incidentId: id,
      status: newStatus,
      history,
    });

    return incident;
  }

  async merge(
    targetIncidentId: string,
    sourceIncidentIds: string[],
    reason: string,
    user: AuthTokenPayload
  ): Promise<Incident> {
    if (!['commander', 'admin'].includes(user.role)) {
      throw new ForbiddenError(`Merging incidents requires commander or admin role`);
    }

    await this.getById(targetIncidentId, user.organizationId);

    const merged = await incidentsRepository.merge(
      targetIncidentId,
      sourceIncidentIds,
      user.userId,
      reason
    );

    await auditService.record({
      organizationId: user.organizationId,
      userId: user.userId,
      userEmail: user.email,
      userRole: user.role,
      action: AUDIT_ACTIONS.INCIDENT_MERGE,
      targetEntity: 'incident',
      targetEntityId: targetIncidentId,
      details: { sourceIncidentIds, reason },
    });

    realtimeService.broadcastToOrg(user.organizationId, REALTIME_EVENTS.INCIDENT_MERGED, {
      targetIncidentId,
      sourceIncidentIds,
      mergedIncident: merged,
    });

    return merged;
  }
}

export const incidentsService = new IncidentsService();
