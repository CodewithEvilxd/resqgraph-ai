import { FastifyInstance } from 'fastify';
import { MultimodalExtractorService } from './extraction/multimodal-extractor.service.js';
import { DuplicateDetectorService } from './clustering/duplicate-detector.service.js';
import { EvidenceFusionService } from './fusion/evidence-fusion.service.js';
import { DecisionTraceService } from './decision-trace.service.js';
import { incidentsRepository } from '../modules/incidents/incidents.repository.js';
import { evidenceRepository } from '../modules/evidence/evidence.repository.js';
import { auditService } from '../modules/audit/audit.service.js';
import { authenticate, requireRole } from '../api/middlewares/auth.middleware.js';
import { validateBody, validateParams } from '../api/middlewares/validate.middleware.js';
import { USER_ROLES } from '../contracts/constants/roles.js';
import {
  extractFactsSchema,
  checkDuplicatesSchema,
  reviewDecisionTraceSchema,
  ExtractFactsInput,
  CheckDuplicatesInput,
  ReviewDecisionTraceInput,
} from '../contracts/schemas/ai.schema.js';
import { z } from 'zod';

export const decisionTraceService = new DecisionTraceService(auditService);
export const multimodalExtractorService = new MultimodalExtractorService();
export const duplicateDetectorService = new DuplicateDetectorService(incidentsRepository);
export const evidenceFusionService = new EvidenceFusionService(
  incidentsRepository,
  evidenceRepository,
  decisionTraceService,
);

const idParamSchema = z.object({ id: z.string().uuid() });

export async function aiRouter(fastify: FastifyInstance): Promise<void> {
  // 1. Multimodal Fact Extraction
  fastify.post('/api/v1/ai/extract', {
    preHandler: [authenticate, validateBody(extractFactsSchema)],
  }, async (request, reply) => {
    const input = request.body as ExtractFactsInput;
    const result = await multimodalExtractorService.extractFacts(input);
    return reply.status(200).send({
      success: true,
      data: result,
    });
  });

  // 2. Duplicate Detection
  fastify.post('/api/v1/ai/duplicates/check', {
    preHandler: [
      authenticate,
      requireRole([USER_ROLES.COMMANDER, USER_ROLES.DISPATCHER, USER_ROLES.ADMIN]),
      validateBody(checkDuplicatesSchema),
    ],
  }, async (request, reply) => {
    const input = request.body as CheckDuplicatesInput;
    const result = await duplicateDetectorService.checkDuplicates(input);
    return reply.status(200).send({
      success: true,
      data: result,
    });
  });

  // 3. Evidence Fusion & Contradiction Detection
  fastify.post('/api/v1/ai/incidents/:id/fuse', {
    preHandler: [
      authenticate,
      requireRole([USER_ROLES.COMMANDER, USER_ROLES.DISPATCHER, USER_ROLES.ADMIN]),
      validateParams(idParamSchema),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await evidenceFusionService.fuseIncidentEvidence(id);
    return reply.status(200).send({
      success: true,
      data: result,
    });
  });

  // 4. Incident Decision Traces
  fastify.get('/api/v1/ai/incidents/:id/decision-traces', {
    preHandler: [authenticate, validateParams(idParamSchema)],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const traces = await decisionTraceService.findByIncidentId(id);
    return reply.status(200).send({
      success: true,
      data: traces,
    });
  });

  // 4b. All Decision Traces for Organization
  fastify.get('/api/v1/ai/decision-traces', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const user = request.user!;
    const traces = await decisionTraceService.findAll(user.organizationId);
    return reply.status(200).send({
      success: true,
      data: traces,
    });
  });

  // 5. Human-in-the-Loop Review of Decision Trace
  fastify.post('/api/v1/ai/decision-traces/:id/review', {
    preHandler: [
      authenticate,
      requireRole([USER_ROLES.COMMANDER, USER_ROLES.DISPATCHER, USER_ROLES.ADMIN]),
      validateParams(idParamSchema),
      validateBody(reviewDecisionTraceSchema),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = request.body as ReviewDecisionTraceInput;
    const user = request.user!;

    const reviewedTrace = await decisionTraceService.reviewTrace(id, {
      isApproved: input.isApproved,
      humanReviewerId: user.userId,
      organizationId: user.organizationId,
      humanOverrideReason: input.humanOverrideReason,
    });

    return reply.status(200).send({
      success: true,
      data: reviewedTrace,
    });
  });
}
