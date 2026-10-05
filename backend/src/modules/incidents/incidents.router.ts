import { FastifyInstance } from 'fastify';
import { incidentsService } from './incidents.service.js';
import {
  createIncidentSchema,
  updateIncidentSchema,
  statusTransitionSchema,
  mergeIncidentsSchema,
  CreateIncidentInput,
  UpdateIncidentInput,
  StatusTransitionInput,
  MergeIncidentsInput,
} from '../../contracts/schemas/incident.schema.js';
import { IncidentStatus } from '../../contracts/constants/incident-status.js';
import { IncidentPriority } from '../../contracts/constants/priorities.js';
import { authenticate, requireRole } from '../../api/middlewares/auth.middleware.js';
import { validateBody } from '../../api/middlewares/validate.middleware.js';

export async function incidentsRouter(fastify: FastifyInstance): Promise<void> {
  // 1. List Incidents
  fastify.get('/api/v1/incidents', { preHandler: authenticate }, async (request, reply) => {
    const user = request.user!;
    const query = request.query as {
      status?: IncidentStatus;
      priority?: IncidentPriority;
      limit?: string;
      offset?: string;
    };

    const result = await incidentsService.list({
      organizationId: user.organizationId,
      status: query.status,
      priority: query.priority,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
      offset: query.offset ? parseInt(query.offset, 10) : 0,
    });

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

  // 2. Get Incident by ID
  fastify.get<{ Params: { id: string } }>(
    '/api/v1/incidents/:id',
    { preHandler: authenticate },
    async (request, reply) => {
      const user = request.user!;
      const incident = await incidentsService.getById(request.params.id, user.organizationId);

      return reply.status(200).send({
        success: true,
        data: incident,
      });
    }
  );

  // 3. Create Incident
  fastify.post<{ Body: CreateIncidentInput }>(
    '/api/v1/incidents',
    { preHandler: [authenticate, validateBody(createIncidentSchema)] },
    async (request, reply) => {
      const user = request.user!;
      const incident = await incidentsService.create(request.body, user);

      return reply.status(201).send({
        success: true,
        data: incident,
      });
    }
  );

  // 4. Update Incident
  fastify.patch<{ Params: { id: string }; Body: UpdateIncidentInput }>(
    '/api/v1/incidents/:id',
    { preHandler: [authenticate, validateBody(updateIncidentSchema)] },
    async (request, reply) => {
      const user = request.user!;
      const incident = await incidentsService.update(request.params.id, request.body, user);

      return reply.status(200).send({
        success: true,
        data: incident,
      });
    }
  );

  // 5. Update Status
  const handleStatusTransition = async (request: any, reply: any) => {
    const user = request.user!;
    const incident = await incidentsService.transitionStatus(
      request.params.id,
      request.body.status,
      request.body.reason,
      user
    );

    return reply.status(200).send({
      success: true,
      data: incident,
    });
  };

  fastify.post<{ Params: { id: string }; Body: StatusTransitionInput }>(
    '/api/v1/incidents/:id/status',
    { preHandler: [authenticate, validateBody(statusTransitionSchema)] },
    handleStatusTransition
  );

  fastify.patch<{ Params: { id: string }; Body: StatusTransitionInput }>(
    '/api/v1/incidents/:id/status',
    { preHandler: [authenticate, validateBody(statusTransitionSchema)] },
    handleStatusTransition
  );

  // 6. Merge Incidents
  fastify.post<{ Body: MergeIncidentsInput }>(
    '/api/v1/incidents/merge',
    {
      preHandler: [
        authenticate,
        requireRole(['commander', 'admin']),
        validateBody(mergeIncidentsSchema),
      ],
    },
    async (request, reply) => {
      const user = request.user!;
      const merged = await incidentsService.merge(
        request.body.targetIncidentId,
        request.body.sourceIncidentIds,
        request.body.reason,
        user
      );

      return reply.status(200).send({
        success: true,
        data: merged,
      });
    }
  );
}
