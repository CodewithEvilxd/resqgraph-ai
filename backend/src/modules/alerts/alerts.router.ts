import { FastifyInstance } from 'fastify';
import { alertsService } from './alerts.service.js';
import { authenticate, requireRole } from '../../api/middlewares/auth.middleware.js';
import { USER_ROLES } from '../../contracts/constants/roles.js';
import { z } from 'zod';

const createAlertSchema = z.object({
  title: z.string().min(3),
  severity: z.enum(['CRITICAL', 'WARNING', 'ADVISORY']),
  targetArea: z.string().min(2),
  message: z.string().min(5),
});

export async function alertsRouter(fastify: FastifyInstance): Promise<void> {
  // 1. List Alerts
  fastify.get('/api/v1/alerts', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const user = request.user!;
    const alerts = await alertsService.listAlerts(user.organizationId);
    return reply.status(200).send({
      success: true,
      data: alerts,
    });
  });

  // 2. Broadcast/Create Alert (Commander, Dispatcher, Admin)
  fastify.post('/api/v1/alerts', {
    preHandler: [
      authenticate,
      requireRole([USER_ROLES.COMMANDER, USER_ROLES.DISPATCHER, USER_ROLES.ADMIN]),
    ],
  }, async (request, reply) => {
    const input = createAlertSchema.parse(request.body);
    const user = request.user!;
    const alert = await alertsService.createAlert(input, user);
    return reply.status(201).send({
      success: true,
      data: alert,
    });
  });

  // 3. Toggle Status
  fastify.patch('/api/v1/alerts/:id/status', {
    preHandler: [
      authenticate,
      requireRole([USER_ROLES.COMMANDER, USER_ROLES.DISPATCHER, USER_ROLES.ADMIN]),
    ],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { isActive } = request.body as { isActive: boolean };
    const user = request.user!;
    const alert = await alertsService.toggleStatus(id, isActive, user);
    return reply.status(200).send({
      success: true,
      data: alert,
    });
  });
}
