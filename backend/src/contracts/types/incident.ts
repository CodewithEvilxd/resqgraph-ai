import { IncidentStatus } from '../constants/incident-status.js';
import { IncidentPriority, HazardType } from '../constants/priorities.js';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracyMeters?: number;
  address?: string;
  landmark?: string;
}

export interface Incident {
  id: string;
  organizationId: string;
  code: string; // e.g. INC-2026-1024
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  hazardType: HazardType;
  confidenceScore: number; // 0.0 - 1.0 (derived deterministically or from evidence fusion)
  location: LocationPoint;
  affectedPeopleEstimate?: number;
  reporterCount: number;
  evidenceCount: number;
  verifiedAt?: string;
  closedAt?: string;
  mergedIntoIncidentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentStatusHistory {
  id: string;
  incidentId: string;
  previousStatus: IncidentStatus;
  newStatus: IncidentStatus;
  changedByUserId: string;
  reason?: string;
  timestamp: string;
}
