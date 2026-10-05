import { LocationPoint } from './incident.js';

export type ResponderStatus = 'available' | 'assigned' | 'en_route' | 'on_scene' | 'offline';
export type ResourceCategory = 'medical' | 'fire' | 'rescue' | 'police' | 'heavy_equipment' | 'drone' | 'shelter';

export interface Responder {
  id: string;
  userId: string;
  organizationId: string;
  teamId?: string;
  badgeNumber: string;
  capabilities: string[];
  status: ResponderStatus;
  currentLocation?: LocationPoint;
  lastSeenAt: string;
  batteryLevel?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  category: ResourceCategory;
  leaderResponderId?: string;
  status: ResponderStatus;
  memberCount: number;
  currentLocation?: LocationPoint;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  organizationId: string;
  name: string;
  category: ResourceCategory;
  quantity: number;
  availableQuantity: number;
  location?: LocationPoint;
  isDeployable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  incidentId: string;
  organizationId: string;
  teamId?: string;
  responderId?: string;
  status: 'proposed' | 'dispatched' | 'en_route' | 'on_scene' | 'completed' | 'cancelled';
  proposedByAIJobId?: string;
  approvedByUserId?: string;
  approvalReason?: string;
  overrideReason?: string;
  dispatchedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
