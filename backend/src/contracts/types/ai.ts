import { IncidentPriority, HazardType } from '../constants/priorities.js';

export interface DecisionTraceFactor {
  name: string;
  weight: number;
  score: number;
  evidenceReferenceIds: string[];
  explanation: string;
}

export interface AIDecisionTrace {
  id: string;
  incidentId: string;
  recommendationType: 'priority_assignment' | 'resource_dispatch' | 'duplicate_merge' | 'route_warning';
  recommendedAction: string;
  confidenceScore: number;
  uncertaintyScore: number;
  factors: DecisionTraceFactor[];
  citedEvidenceIds: string[];
  provider: string;
  model: string;
  modelVersion: string;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  isApprovedByHuman?: boolean;
  humanReviewerId?: string;
  humanOverrideReason?: string;
  createdAt: string;
}

export interface DuplicateMatchResult {
  candidateIncidentId: string;
  duplicateProbability: number;
  relatedProbability: number;
  spatialDistanceMeters: number;
  temporalDeltaMinutes: number;
  semanticSimilarityScore: number;
  matchingEntities: string[];
  conflictingSignals: string[];
  explanation: string;
}

export interface EvidenceFusionResult {
  incidentId: string;
  aggregatedHazardType: HazardType;
  aggregatedPriority: IncidentPriority;
  aggregatedConfidence: number;
  peopleAffectedEstimate: number;
  unresolvedContradictions: Array<{
    factor: string;
    evidenceAId: string;
    claimA: string;
    evidenceBId: string;
    claimB: string;
  }>;
  consensusSummary: string;
}

export interface ExtractedFactsResult {
  detectedHazards: HazardType[];
  severityScore: number;
  urgencyLevel: IncidentPriority;
  estimatedCasualties: number;
  trappedPeopleCount: number;
  infrastructureStatus: {
    roadBlocked: boolean;
    powerOutage: boolean;
    waterFlooding: boolean;
    structuralDamage: boolean;
  };
  keyEntities: string[];
  confidence: number;
  uncertaintyScore: number;
  summary: string;
  suggestedIncidentTitle?: string;
  modelMetadata: {
    provider: string;
    model: string;
    latencyMs: number;
  };
}
