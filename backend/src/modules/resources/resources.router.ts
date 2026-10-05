import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { resourcesService } from './resources.service.js';
import { locationPointSchema } from '../../contracts/schemas/incident.schema.js';
import { authenticate, requireRole } from '../../api/middlewares/auth.middleware.js';
import { validateBody } from '../../api/middlewares/validate.middleware.js';

const createResourceSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.enum(['medical', 'fire', 'rescue', 'police', 'heavy_equipment', 'drone', 'shelter']),
  quantity: z.number().int().positive(),
  availableQuantity: z.number().int().nonnegative(),
  location: locationPointSchema.optional(),
  isDeployable: z.boolean().default(true),
});

type CreateResourceInput = z.infer<typeof createResourceSchema>;

export async function resourcesRouter(fastify: FastifyInstance): Promise<void> {
  // 1. List Resources
  fastify.get('/api/v1/resources', { preHandler: authenticate }, async (request, reply) => {
    const user = request.user!;
    const resources = await resourcesService.list(user.organizationId);
    return reply.status(200).send({
      success: true,
      data: resources,
    });
  });

  // 2. Get Resource by ID
  fastify.get<{ Params: { id: string } }>(
    '/api/v1/resources/:id',
    { preHandler: authenticate },
    async (request, reply) => {
      const user = request.user!;
      const resource = await resourcesService.getById(request.params.id, user.organizationId);
      return reply.status(200).send({
        success: true,
        data: resource,
      });
    }
  );

  // 3. Create Resource
  fastify.post<{ Body: CreateResourceInput }>(
    '/api/v1/resources',
    {
      preHandler: [
        authenticate,
        requireRole(['commander', 'admin']),
        validateBody(createResourceSchema),
      ],
    },
    async (request, reply) => {
      const user = request.user!;
      const created = await resourcesService.create(request.body, user);
      return reply.status(201).send({
        success: true,
        data: created,
      });
    }
  );
}
