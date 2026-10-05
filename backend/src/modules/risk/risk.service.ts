import { RiskEngine } from './risk.engine.js';
import { IncidentsRepository, incidentsRepository } from '../incidents/incidents.repository.js';
import { EvidenceRepository, evidenceRepository } from '../evidence/evidence.repository.js';
import { DecisionTraceService } from '../../ai/decision-trace.service.js';
import { decisionTraceService } from '../../ai/ai.router.js';
import { IncidentRiskAssessment } from '../../contracts/types/graph.js';
import { NotFoundError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';
import { generateUUID } from '../../utils/crypto.js';

export class RiskService {
  private engine = new RiskEngine();

  constructor(
    private readonly incidentsRepo: IncidentsRepository = incidentsRepository,
    private readonly evidenceRepo: EvidenceRepository = evidenceRepository,
    private readonly traceService: DecisionTraceService = decisionTraceService,
  ) {}

  async assessIncidentRisk(incidentId: string): Promise<IncidentRiskAssessment> {
    const incident = await this.incidentsRepo.findById(incidentId);
    if (!incident) {
      throw new NotFoundError(`Incident ${incidentId} not found`);
    }

    const evidenceList = await this.evidenceRepo.findByIncident(incidentId);
    const assessment = this.engine.calculateRisk(incident, evidenceList);

    // Record advisory decision trace
    await this.traceService.recordTrace({
      id: generateUUID(),
      incidentId: incident.id,
      recommendationType: 'priority_assignment',
      recommendedAction: assessment.recommendedPriority !== incident.priority
        ? `Recommend escalating priority from ${incident.priority} to ${assessment.recommendedPriority} based on composite risk score ${assessment.compositeRiskScore}/100.`
        : `Confirmed priority ${incident.priority} aligns with composite risk score ${assessment.compositeRiskScore}/100.`,
      confidenceScore: parseFloat((1 - assessment.uncertaintyScore).toFixed(2)),
      uncertaintyScore: assessment.uncertaintyScore,
      factors: assessment.factors.map(f => ({
        name: f.name,
        weight: f.weight,
        score: f.score / 100,
        evidenceReferenceIds: f.evidenceIds || [],
        explanation: f.description,
      })),
      citedEvidenceIds: evidenceList.map(e => e.id),
      provider: 'resqgraph-risk-engine',
      model: 'multi-factor-risk-v1',
      modelVersion: '2026.10.1',
      latencyMs: 5,
      createdAt: new Date().toISOString(),
    });

    logger.info('Incident risk evaluated', {
      incidentId,
      score: assessment.compositeRiskScore,
      tier: assessment.riskTier,
      recommendedPriority: assessment.recommendedPriority,
    });

    return assessment;
  }
}

export const riskService = new RiskService();
