import { FastifyInstance } from 'fastify';
import { riskService } from './risk.service.js';
import { authenticate } from '../../api/middlewares/auth.middleware.js';
import { validateParams } from '../../api/middlewares/validate.middleware.js';
import { z } from 'zod';

const incidentIdParam = z.object({ id: z.string().uuid() });

export async function riskRouter(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/v1/incidents/:id/risk', {
    preHandler: [authenticate, validateParams(incidentIdParam)],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const assessment = await riskService.assessIncidentRisk(id);
    return reply.status(200).send({
      success: true,
      data: assessment,
    });
  });
}
