import { Incident } from '../../contracts/types/incident.js';
import { Evidence } from '../../contracts/types/evidence.js';
import {
  ExtractedFactsResult,
  DuplicateMatchResult,
  EvidenceFusionResult,
  AIDecisionTrace,
  DecisionTraceFactor,
} from '../../contracts/types/ai.js';
import { ExtractFactsInput } from '../../contracts/schemas/ai.schema.js';

export interface GenerateTraceParams {
  incident: Incident;
  recommendationType: AIDecisionTrace['recommendationType'];
  recommendedAction: string;
  factors: DecisionTraceFactor[];
  citedEvidenceIds: string[];
  confidenceScore: number;
  uncertaintyScore: number;
}

export interface AIModelAdapter {
  readonly providerName: string;
  readonly modelName: string;
  readonly modelVersion: string;

  extractFacts(input: ExtractFactsInput): Promise<ExtractedFactsResult>;
  assessDuplicate(candidateA: Incident, candidateB: Incident): Promise<DuplicateMatchResult>;
  fuseEvidence(incident: Incident, evidenceList: Evidence[]): Promise<EvidenceFusionResult>;
  generateDecisionTrace(params: GenerateTraceParams): Promise<AIDecisionTrace>;
}
