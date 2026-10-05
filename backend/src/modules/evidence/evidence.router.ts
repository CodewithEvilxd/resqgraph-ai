import { FastifyInstance } from 'fastify';
import { evidenceService } from './evidence.service.js';
import {
  createEvidenceSchema,
  linkEvidenceSchema,
  CreateEvidenceInput,
  LinkEvidenceInput,
} from '../../contracts/schemas/evidence.schema.js';
import { authenticate } from '../../api/middlewares/auth.middleware.js';
import { validateBody } from '../../api/middlewares/validate.middleware.js';

export async function evidenceRouter(fastify: FastifyInstance): Promise<void> {
  // 0. List All Evidence
  fastify.get('/api/v1/evidence', { preHandler: authenticate }, async (request, reply) => {
    const user = request.user!;
    const items = await evidenceService.listAll(user.organizationId);
    return reply.status(200).send({
      success: true,
      data: items,
    });
  });

  // 1. List Evidence by Incident
  fastify.get<{ Params: { incidentId: string } }>(
    '/api/v1/evidence/incident/:incidentId',
    { preHandler: authenticate },
    async (request, reply) => {
      const items = await evidenceService.listByIncident(request.params.incidentId);
      return reply.status(200).send({
        success: true,
        data: items,
      });
    }
  );

  // 2. Create Evidence
  fastify.post<{ Body: CreateEvidenceInput }>(
    '/api/v1/evidence',
    { preHandler: [authenticate, validateBody(createEvidenceSchema)] },
    async (request, reply) => {
      const user = request.user!;
      const evidence = await evidenceService.create(request.body, user);

      return reply.status(201).send({
        success: true,
        data: evidence,
      });
    }
  );

  // 3. Link Evidence (Supports / Contradicts)
  fastify.post<{ Body: LinkEvidenceInput }>(
    '/api/v1/evidence/link',
    { preHandler: [authenticate, validateBody(linkEvidenceSchema)] },
    async (request, reply) => {
      const user = request.user!;
      const link = await evidenceService.link(request.body, user);

      return reply.status(201).send({
        success: true,
        data: link,
      });
    }
  );

  // 4. Verify Evidence
  fastify.post<{ Params: { id: string }; Body: { isVerified: boolean } }>(
    '/api/v1/evidence/:id/verify',
    { preHandler: authenticate },
    async (request, reply) => {
      const user = request.user!;
      const updated = await evidenceService.verify(request.params.id, request.body.isVerified, user);

      return reply.status(200).send({
        success: true,
        data: updated,
      });
    }
  );
}
