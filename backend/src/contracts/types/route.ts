import { LocationPoint } from './incident.js';
import { HazardType } from '../constants/priorities.js';

export interface RoadSegment {
  id: string;
  name: string;
  status: 'open' | 'closed' | 'restricted' | 'flooded' | 'blocked';
  blockedReason?: string;
  hazardType?: HazardType;
  startPoint: LocationPoint;
  endPoint: LocationPoint;
  lengthMeters: number;
  speedLimitKmh: number;
  reportedAt: string;
}

export interface RouteWaypoint {
  latitude: number;
  longitude: number;
  order: number;
  instruction?: string;
  segmentId?: string;
}

export interface RouteSafetyAssessment {
  safetyScore: number; // 0.0 - 1.0 (1.0 = completely safe, no known hazards)
  isPassable: boolean;
  warnings: string[];
  hazardsEncountered: string[];
  alternativeSuggested: boolean;
}

export interface Route {
  id: string;
  incidentId: string;
  origin: LocationPoint;
  destination: LocationPoint;
  distanceMeters: number;
  estimatedDurationSeconds: number;
  waypoints: RouteWaypoint[];
  safety: RouteSafetyAssessment;
  createdAt: string;
  updatedAt: string;
}
