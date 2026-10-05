import { IncidentPriority } from '../constants/priorities.js';

export type GraphNodeType =
  | 'incident'
  | 'report'
  | 'evidence'
  | 'responder'
  | 'team'
  | 'resource'
  | 'hazard'
  | 'road_segment';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  status?: string;
  severity?: string;
  location?: { latitude: number; longitude: number };
  metadata?: Record<string, unknown>;
}

export type GraphEdgeRelation =
  | 'linked_to'
  | 'reported'
  | 'corroborates'
  | 'contradicts'
  | 'supports'
  | 'assigned_to'
  | 'allocated_to'
  | 'blocks_route'
  | 'threatens';

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: GraphEdgeRelation;
  confidence?: number;
  label?: string;
}

export interface IncidentGraphView {
  incidentId: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  summary: {
    totalReports: number;
    totalEvidence: number;
    totalResponders: number;
    contradictionCount: number;
  };
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
  evidenceIds?: string[];
}

export interface IncidentRiskAssessment {
  incidentId: string;
  compositeRiskScore: number;
  riskTier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  recommendedPriority: IncidentPriority;
  uncertaintyScore: number;
  factors: RiskFactor[];
  summary: string;
  assessedAt: string;
}

export interface AllocationRecommendation {
  id: string;
  incidentId: string;
  teamId: string;
  teamName: string;
  responderIds: string[];
  capabilityMatchScore: number;
  distanceMeters: number;
  estimatedArrivalMinutes: number;
  currentStatus: string;
  reasons: string[];
  requiredEquipment: string[];
  isRecommended: boolean;
}
