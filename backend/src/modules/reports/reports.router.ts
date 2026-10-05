import { FastifyInstance } from 'fastify';
import { reportsService } from './reports.service.js';
import {
  createReportSchema,
  verifyReportSchema,
  CreateReportInput,
  VerifyReportInput,
} from '../../contracts/schemas/report.schema.js';
import { authenticate } from '../../api/middlewares/auth.middleware.js';
import { validateBody } from '../../api/middlewares/validate.middleware.js';

export async function reportsRouter(fastify: FastifyInstance): Promise<void> {
  // 1. List Reports
  fastify.get('/api/v1/reports', { preHandler: authenticate }, async (request, reply) => {
    const user = request.user!;
    const query = request.query as { limit?: string; offset?: string };

    const result = await reportsService.list(
      user.organizationId,
      query.limit ? parseInt(query.limit, 10) : 50,
      query.offset ? parseInt(query.offset, 10) : 0
    );

    return reply.status(200).send({
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
      },
    });
  });

  // 2. Get Report by ID
  fastify.get<{ Params: { id: string } }>(
    '/api/v1/reports/:id',
    { preHandler: authenticate },
    async (request, reply) => {
      const user = request.user!;
      const report = await reportsService.getById(request.params.id, user.organizationId);

      return reply.status(200).send({
        success: true,
        data: report,
      });
    }
  );

  // 3. Get Reports by Incident ID
  fastify.get<{ Params: { incidentId: string } }>(
    '/api/v1/reports/incident/:incidentId',
    { preHandler: authenticate },
    async (request, reply) => {
      const reports = await reportsService.listByIncident(request.params.incidentId);

      return reply.status(200).send({
        success: true,
        data: reports,
      });
    }
  );

  // 4. Ingest Report
  fastify.post<{ Body: CreateReportInput }>(
    '/api/v1/reports',
    { preHandler: [authenticate, validateBody(createReportSchema)] },
    async (request, reply) => {
      const user = request.user!;
      const result = await reportsService.create(request.body, user);

      return reply.status(result.isDuplicate ? 200 : 201).send({
        success: true,
        data: result.report,
        isDuplicate: result.isDuplicate,
      });
    }
  );

  // 5. Verify Report
  fastify.post<{ Params: { id: string }; Body: VerifyReportInput }>(
    '/api/v1/reports/:id/verify',
    { preHandler: [authenticate, validateBody(verifyReportSchema)] },
    async (request, reply) => {
      const user = request.user!;
      const updated = await reportsService.verify(
        request.params.id,
        request.body.isVerified,
        user
      );

      return reply.status(200).send({
        success: true,
        data: updated,
      });
    }
  );
}
