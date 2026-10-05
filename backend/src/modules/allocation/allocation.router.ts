import { FastifyInstance } from 'fastify';
import { allocationService } from './allocation.service.js';
import { authenticate, requireRole } from '../../api/middlewares/auth.middleware.js';
import { validateParams, validateBody } from '../../api/middlewares/validate.middleware.js';
import { USER_ROLES } from '../../contracts/constants/roles.js';
import { z } from 'zod';

const incidentIdParam = z.object({ id: z.string().uuid() });

const dispatchTeamSchema = z.object({
  incidentId: z.string().uuid(),
  teamId: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export async function allocationRouter(fastify: FastifyInstance): Promise<void> {
  // 1. Team Allocation Recommendations
  fastify.get('/api/v1/allocation/incidents/:id/recommendations', {
    preHandler: [authenticate, validateParams(incidentIdParam)],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const recommendations = await allocationService.recommendTeams(id);
    return reply.status(200).send({
      success: true,
      data: recommendations,
    });
  });

  // 2. Human-Authorized Team Dispatch
  fastify.post('/api/v1/allocation/dispatch', {
    preHandler: [
      authenticate,
      requireRole([USER_ROLES.COMMANDER, USER_ROLES.DISPATCHER, USER_ROLES.ADMIN]),
      validateBody(dispatchTeamSchema),
    ],
  }, async (request, reply) => {
    const input = request.body as z.infer<typeof dispatchTeamSchema>;
    const user = request.user!;

    const result = await allocationService.dispatchTeam(
      input.incidentId,
      input.teamId,
      user,
      input.notes,
    );

    return reply.status(200).send({
      success: true,
      data: result,
    });
  });
}
