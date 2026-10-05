import { dbStore } from '../../db/index.js';
import { Responder, Team, Assignment, ResponderStatus } from '../../contracts/types/responder.js';
import { LocationPoint } from '../../contracts/types/incident.js';
import { NotFoundError } from '../../utils/errors.js';

export class RespondersRepository {
  async findAllResponders(organizationId: string): Promise<Responder[]> {
    return Array.from(dbStore.responders.values()).filter(
      (r) => r.organizationId === organizationId
    );
  }

  async findResponderById(id: string): Promise<Responder | null> {
    return dbStore.responders.get(id) || null;
  }

  async findResponderByUserId(userId: string): Promise<Responder | null> {
    for (const responder of dbStore.responders.values()) {
      if (responder.userId === userId) {
        return responder;
      }
    }
    return null;
  }

  async updateResponderStatus(
    id: string,
    status: ResponderStatus,
    currentLocation?: LocationPoint,
    batteryLevel?: number
  ): Promise<Responder> {
    const responder = dbStore.responders.get(id);
    if (!responder) {
      throw new NotFoundError(`Responder ${id} not found`);
    }

    responder.status = status;
    if (currentLocation) {
      responder.currentLocation = currentLocation;
    }
    if (batteryLevel !== undefined) {
      responder.batteryLevel = batteryLevel;
    }
    responder.lastSeenAt = new Date().toISOString();
    responder.updatedAt = new Date().toISOString();

    dbStore.responders.set(id, responder);
    return responder;
  }

  async findAllTeams(organizationId: string): Promise<Team[]> {
    return Array.from(dbStore.teams.values()).filter(
      (t) => t.organizationId === organizationId
    );
  }

  async findTeamById(id: string): Promise<Team | null> {
    return dbStore.teams.get(id) || null;
  }

  async createAssignment(assignment: Assignment): Promise<Assignment> {
    dbStore.assignments.set(assignment.id, assignment);
    return assignment;
  }

  async findAssignmentById(id: string): Promise<Assignment | null> {
    return dbStore.assignments.get(id) || null;
  }

  async findAssignmentsByIncident(incidentId: string): Promise<Assignment[]> {
    return Array.from(dbStore.assignments.values())
      .filter((a) => a.incidentId === incidentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findAllAssignments(organizationId: string): Promise<Assignment[]> {
    return Array.from(dbStore.assignments.values())
      .filter((a) => a.organizationId === organizationId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateAssignmentStatus(
    id: string,
    status: 'dispatched' | 'en_route' | 'on_scene' | 'completed' | 'cancelled'
  ): Promise<Assignment> {
    const assignment = dbStore.assignments.get(id);
    if (!assignment) {
      throw new NotFoundError(`Assignment ${id} not found`);
    }

    const now = new Date().toISOString();
    assignment.status = status;
    assignment.updatedAt = now;

    if (status === 'dispatched' && !assignment.dispatchedAt) {
      assignment.dispatchedAt = now;
    } else if (status === 'on_scene' && !assignment.arrivedAt) {
      assignment.arrivedAt = now;
    } else if (status === 'completed' && !assignment.completedAt) {
      assignment.completedAt = now;
    }

    dbStore.assignments.set(id, assignment);
    return assignment;
  }
}

export const respondersRepository = new RespondersRepository();
