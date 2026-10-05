import { FastifyInstance } from 'fastify';
import { auditService } from './audit.service.js';
import { authenticate, requireRole } from '../../api/middlewares/auth.middleware.js';

export async function auditRouter(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/api/v1/audit',
    {
      preHandler: [authenticate, requireRole(['commander', 'admin'])],
    },
    async (request, reply) => {
      const user = request.user!;
      const query = request.query as { limit?: string; offset?: string };

      const result = await auditService.list(
        user.organizationId,
        query.limit ? parseInt(query.limit, 10) : 100,
        query.offset ? parseInt(query.offset, 10) : 0
      );

      return reply.status(200).send({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          limit: query.limit ? parseInt(query.limit, 10) : 100,
          offset: query.offset ? parseInt(query.offset, 10) : 0,
        },
      });
    }
  );
}
