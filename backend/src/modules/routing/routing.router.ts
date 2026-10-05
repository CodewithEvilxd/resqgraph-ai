import { FastifyInstance } from 'fastify';
import { routingService } from './routing.service.js';
import { authenticate, requireRole } from '../../api/middlewares/auth.middleware.js';
import { validateBody } from '../../api/middlewares/validate.middleware.js';
import { USER_ROLES } from '../../contracts/constants/roles.js';
import {
  calculateRouteSchema,
  createRoadSegmentSchema,
  CalculateRouteInput,
  CreateRoadSegmentInput,
} from '../../contracts/schemas/route.schema.js';

export async function routingRouter(fastify: FastifyInstance): Promise<void> {
  // 1. Calculate Hazard-Aware Route
  fastify.post('/api/v1/routes/calculate', {
    preHandler: [authenticate, validateBody(calculateRouteSchema)],
  }, async (request, reply) => {
    const input = request.body as CalculateRouteInput;
    const route = await routingService.calculateRoute(input);
    return reply.status(200).send({
      success: true,
      data: route,
    });
  });

  // 2. List Road Segments & Closures
  fastify.get('/api/v1/routes/segments', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const query = request.query as { status?: string };
    const segments = await routingService.listRoadSegments(query.status);
    return reply.status(200).send({
      success: true,
      data: segments,
    });
  });

  // 3. Create / Report Road Segment Status
  fastify.post('/api/v1/routes/segments', {
    preHandler: [
      authenticate,
      requireRole([USER_ROLES.COMMANDER, USER_ROLES.DISPATCHER, USER_ROLES.ADMIN]),
      validateBody(createRoadSegmentSchema),
    ],
  }, async (request, reply) => {
    const input = request.body as CreateRoadSegmentInput;
    const segment = await routingService.createRoadSegment(input);
    return reply.status(201).send({
      success: true,
      data: segment,
    });
  });
}
