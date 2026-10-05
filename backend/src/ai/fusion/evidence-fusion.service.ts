import { AIModelAdapter } from '../adapters/model-adapter.interface.js';
import { getAIAdapter } from '../adapters/adapter.factory.js';
import { IncidentsRepository } from '../../modules/incidents/incidents.repository.js';
import { EvidenceRepository } from '../../modules/evidence/evidence.repository.js';
import { DecisionTraceService } from '../decision-trace.service.js';
import { EvidenceFusionResult, AIDecisionTrace, DecisionTraceFactor } from '../../contracts/types/ai.js';
import { NotFoundError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export class EvidenceFusionService {
  constructor(
    private readonly incidentsRepo: IncidentsRepository,
    private readonly evidenceRepo: EvidenceRepository,
    private readonly traceService: DecisionTraceService,
    private readonly adapter: AIModelAdapter = getAIAdapter(),
  ) {}

  async fuseIncidentEvidence(incidentId: string): Promise<{
    fusionResult: EvidenceFusionResult;
    decisionTrace: AIDecisionTrace;
  }> {
    const incident = await this.incidentsRepo.findById(incidentId);
    if (!incident) {
      throw new NotFoundError(`Incident ${incidentId} not found`);
    }

    const evidenceList = await this.evidenceRepo.findByIncident(incidentId);

    logger.info('Executing evidence fusion', {
      incidentId,
      evidenceCount: evidenceList.length,
    });

    const fusionResult = await this.adapter.fuseEvidence(incident, evidenceList);

    // Build factor weights for explainable trace
    const factors: DecisionTraceFactor[] = [];
    const citedEvidenceIds: string[] = evidenceList.map(e => e.id);

    // Factor 1: Evidence volume & source corroboration
    factors.push({
      name: 'corroborating_evidence_count',
      weight: 0.35,
      score: Math.min(1.0, evidenceList.length / 3),
      evidenceReferenceIds: citedEvidenceIds,
      explanation: `${evidenceList.length} evidence observation(s) evaluated.`,
    });

    // Factor 2: Contradiction penalty
    const contradictionScore = fusionResult.unresolvedContradictions.length > 0
      ? Math.max(0.1, 1.0 - 0.4 * fusionResult.unresolvedContradictions.length)
      : 1.0;

    factors.push({
      name: 'contradiction_clearance',
      weight: 0.40,
      score: contradictionScore,
      evidenceReferenceIds: fusionResult.unresolvedContradictions.flatMap(c => [c.evidenceAId, c.evidenceBId]),
      explanation: fusionResult.unresolvedContradictions.length > 0
        ? `Found ${fusionResult.unresolvedContradictions.length} direct contradiction(s) requiring human verification.`
        : 'Zero conflicting claims across verified evidence.',
    });

    // Factor 3: Hazard severity alignment
    factors.push({
      name: 'hazard_severity_alignment',
      weight: 0.25,
      score: fusionResult.aggregatedConfidence,
      evidenceReferenceIds: citedEvidenceIds.slice(0, 2),
      explanation: `Harmonized hazard classification to ${fusionResult.aggregatedHazardType} with priority ${fusionResult.aggregatedPriority}.`,
    });

    const uncertaintyScore = parseFloat((1.0 - fusionResult.aggregatedConfidence).toFixed(2));

    const decisionTrace = await this.adapter.generateDecisionTrace({
      incident,
      recommendationType: 'priority_assignment',
      recommendedAction: fusionResult.unresolvedContradictions.length > 0
        ? `Maintain priority ${fusionResult.aggregatedPriority} with high uncertainty (${uncertaintyScore}) due to unverified contradictions.`
        : `Confirm priority ${fusionResult.aggregatedPriority} for incident ${incident.code}.`,
      factors,
      citedEvidenceIds,
      confidenceScore: fusionResult.aggregatedConfidence,
      uncertaintyScore,
    });

    await this.traceService.recordTrace(decisionTrace);

    logger.info('Evidence fusion completed', {
      incidentId,
      confidence: fusionResult.aggregatedConfidence,
      uncertainty: uncertaintyScore,
      contradictionsCount: fusionResult.unresolvedContradictions.length,
      traceId: decisionTrace.id,
    });

    return {
      fusionResult,
      decisionTrace,
    };
  }
}
