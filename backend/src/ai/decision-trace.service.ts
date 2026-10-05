import { AIDecisionTrace } from '../contracts/types/ai.js';
import { NotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { AuditService } from '../modules/audit/audit.service.js';
import { dbStore } from '../db/index.js';

export class DecisionTraceService {
  private traces: Map<string, AIDecisionTrace> = new Map();

  constructor(private readonly auditService?: AuditService) {}

  async findAll(_organizationId?: string): Promise<AIDecisionTrace[]> {
    for (const [id, trace] of dbStore.decisionTraces.entries()) {
      if (!this.traces.has(id)) {
        this.traces.set(id, trace);
      }
    }
    const list = Array.from(this.traces.values());
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async recordTrace(trace: AIDecisionTrace): Promise<AIDecisionTrace> {
    this.traces.set(trace.id, trace);
    logger.info('Recorded AI decision trace', {
      traceId: trace.id,
      incidentId: trace.incidentId,
      recommendationType: trace.recommendationType,
      confidence: trace.confidenceScore,
      uncertainty: trace.uncertaintyScore,
    });
    return trace;
  }

  async findById(id: string): Promise<AIDecisionTrace | null> {
    return this.traces.get(id) || null;
  }

  async findByIncidentId(incidentId: string): Promise<AIDecisionTrace[]> {
    const list: AIDecisionTrace[] = [];
    for (const trace of this.traces.values()) {
      if (trace.incidentId === incidentId) {
        list.push(trace);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async reviewTrace(
    id: string,
    review: { isApproved: boolean; humanReviewerId: string; organizationId: string; humanOverrideReason?: string },
  ): Promise<AIDecisionTrace> {
    const trace = await this.findById(id);
    if (!trace) {
      throw new NotFoundError(`Decision trace ${id} not found`);
    }

    trace.isApprovedByHuman = review.isApproved;
    trace.humanReviewerId = review.humanReviewerId;
    trace.humanOverrideReason = review.humanOverrideReason;

    this.traces.set(id, trace);

    logger.info('AI decision trace reviewed by human operator', {
      traceId: id,
      incidentId: trace.incidentId,
      isApproved: review.isApproved,
      reviewerId: review.humanReviewerId,
    });

    if (this.auditService) {
      await this.auditService.record({
        organizationId: review.organizationId,
        userId: review.humanReviewerId,
        action: 'incident:update',
        targetEntity: 'decision_trace',
        targetEntityId: id,
        details: {
          isApproved: review.isApproved,
          humanOverrideReason: review.humanOverrideReason,
          recommendationType: trace.recommendationType,
        },
      });
    }

    return trace;
  }
}
