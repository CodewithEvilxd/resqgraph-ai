import { dbStore, generateUUID } from '../../db/index.js';
import { Incident, IncidentStatusHistory } from '../../contracts/types/incident.js';
import { IncidentStatus, VALID_STATUS_TRANSITIONS } from '../../contracts/constants/incident-status.js';
import { IncidentPriority } from '../../contracts/constants/priorities.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';

export interface IncidentFilter {
  organizationId: string;
  status?: IncidentStatus;
  priority?: IncidentPriority;
  limit?: number;
  offset?: number;
}

export class IncidentsRepository {
  async create(incident: Incident): Promise<Incident> {
    dbStore.incidents.set(incident.id, incident);
    return incident;
  }

  async findById(id: string): Promise<Incident | null> {
    const incident = dbStore.incidents.get(id);
    return incident || null;
  }

  async findAll(filter: IncidentFilter): Promise<{ items: Incident[]; total: number }> {
    let all = Array.from(dbStore.incidents.values()).filter(
      (inc) => inc.organizationId === filter.organizationId
    );

    if (filter.status) {
      all = all.filter((inc) => inc.status === filter.status);
    }
    if (filter.priority) {
      all = all.filter((inc) => inc.priority === filter.priority);
    }

    // Sort descending by created_at
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = all.length;
    const offset = filter.offset || 0;
    const limit = filter.limit || 50;
    const items = all.slice(offset, offset + limit);

    return { items, total };
  }

  async update(id: string, updates: Partial<Incident>): Promise<Incident> {
    const existing = dbStore.incidents.get(id);
    if (!existing) {
      throw new NotFoundError(`Incident with ID ${id} not found`);
    }

    const updated: Incident = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    dbStore.incidents.set(id, updated);
    return updated;
  }

  async updateStatus(
    id: string,
    newStatus: IncidentStatus,
    changedByUserId: string,
    reason?: string
  ): Promise<{ incident: Incident; history: IncidentStatusHistory }> {
    const existing = dbStore.incidents.get(id);
    if (!existing) {
      throw new NotFoundError(`Incident with ID ${id} not found`);
    }

    if (existing.status === newStatus) {
      throw new ConflictError(`Incident is already in status '${newStatus}'`);
    }

    const allowedNext = VALID_STATUS_TRANSITIONS[existing.status];
    if (!allowedNext.includes(newStatus)) {
      throw new ConflictError(
        `Invalid status transition from '${existing.status}' to '${newStatus}'. Allowed: ${allowedNext.join(', ') || 'none'}`
      );
    }

    const now = new Date().toISOString();
    const historyEntry: IncidentStatusHistory = {
      id: generateUUID(),
      incidentId: id,
      previousStatus: existing.status,
      newStatus,
      changedByUserId,
      reason,
      timestamp: now,
    };

    const updatedIncident: Incident = {
      ...existing,
      status: newStatus,
      updatedAt: now,
      ...(newStatus === 'verified' && !existing.verifiedAt ? { verifiedAt: now } : {}),
      ...(newStatus === 'closed' ? { closedAt: now } : {}),
    };

    dbStore.incidents.set(id, updatedIncident);

    return { incident: updatedIncident, history: historyEntry };
  }

  async merge(
    targetIncidentId: string,
    sourceIncidentIds: string[],
    _changedByUserId: string,
    _reason: string
  ): Promise<Incident> {
    const target = dbStore.incidents.get(targetIncidentId);
    if (!target) {
      throw new NotFoundError(`Target incident ${targetIncidentId} not found`);
    }

    const now = new Date().toISOString();
    let additionalReports = 0;
    let additionalEvidence = 0;

    for (const sourceId of sourceIncidentIds) {
      if (sourceId === targetIncidentId) {
        throw new ConflictError('Cannot merge an incident into itself');
      }

      const source = dbStore.incidents.get(sourceId);
      if (!source) {
        throw new NotFoundError(`Source incident ${sourceId} not found`);
      }

      // Re-point source reports and evidence to target
      for (const report of dbStore.reports.values()) {
        if (report.incidentId === sourceId) {
          report.incidentId = targetIncidentId;
          report.updatedAt = now;
          additionalReports++;
        }
      }

      for (const ev of dbStore.evidence.values()) {
        if (ev.incidentId === sourceId) {
          ev.incidentId = targetIncidentId;
          ev.updatedAt = now;
          additionalEvidence++;
        }
      }

      // Mark source incident as merged
      const mergedSource: Incident = {
        ...source,
        status: 'merged',
        mergedIntoIncidentId: targetIncidentId,
        updatedAt: now,
      };
      dbStore.incidents.set(sourceId, mergedSource);
    }

    const updatedTarget: Incident = {
      ...target,
      reporterCount: target.reporterCount + additionalReports,
      evidenceCount: target.evidenceCount + additionalEvidence,
      updatedAt: now,
    };

    dbStore.incidents.set(targetIncidentId, updatedTarget);
    return updatedTarget;
  }
}

export const incidentsRepository = new IncidentsRepository();
