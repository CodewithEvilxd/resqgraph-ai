import { FastifyInstance } from 'fastify';
import { syncService } from './sync.service.js';
import { authenticate } from '../../api/middlewares/auth.middleware.js';
import { validateBody } from '../../api/middlewares/validate.middleware.js';
import {
  syncBatchRequestSchema,
  SyncBatchRequestInput,
} from '../../contracts/schemas/sync.schema.js';

export async function syncRouter(fastify: FastifyInstance): Promise<void> {
  fastify.post('/api/v1/sync/batch', {
    preHandler: [authenticate, validateBody(syncBatchRequestSchema)],
  }, async (request, reply) => {
    const input = request.body as SyncBatchRequestInput;
    const user = request.user!;
    const response = await syncService.processBatch(input, user);
    return reply.status(200).send({
      success: true,
      data: response,
    });
  });
}
