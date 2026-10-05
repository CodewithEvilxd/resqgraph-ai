import { FastifyInstance } from 'fastify';
import { respondersService } from './responders.service.js';
import {
  updateResponderStatusSchema,
  createAssignmentSchema,
  updateAssignmentStatusSchema,
  UpdateResponderStatusInput,
  CreateAssignmentInput,
  UpdateAssignmentStatusInput,
} from '../../contracts/schemas/responder.schema.js';
import { authenticate } from '../../api/middlewares/auth.middleware.js';
import { validateBody } from '../../api/middlewares/validate.middleware.js';

export async function respondersRouter(fastify: FastifyInstance): Promise<void> {
  // 1. List Responders
  fastify.get('/api/v1/responders', { preHandler: authenticate }, async (request, reply) => {
    const user = request.user!;
    const responders = await respondersService.listResponders(user.organizationId);
    return reply.status(200).send({
      success: true,
      data: responders,
    });
  });

  // 2. Update Responder Status
  fastify.patch<{ Params: { id: string }; Body: UpdateResponderStatusInput }>(
    '/api/v1/responders/:id/status',
    { preHandler: [authenticate, validateBody(updateResponderStatusSchema)] },
    async (request, reply) => {
      const user = request.user!;
      const updated = await respondersService.updateResponderStatus(
        request.params.id,
        request.body,
        user
      );

      return reply.status(200).send({
        success: true,
        data: updated,
      });
    }
  );

  // 3. List Teams
  fastify.get('/api/v1/teams', { preHandler: authenticate }, async (request, reply) => {
    const user = request.user!;
    const teams = await respondersService.listTeams(user.organizationId);
    return reply.status(200).send({
      success: true,
      data: teams,
    });
  });

  // 4. List All Assignments
  fastify.get('/api/v1/assignments', { preHandler: authenticate }, async (request, reply) => {
    const user = request.user!;
    const assignments = await respondersService.listAllAssignments(user.organizationId);
    return reply.status(200).send({
      success: true,
      data: assignments,
    });
  });

  // 4b. List Assignments by Incident
  fastify.get<{ Params: { incidentId: string } }>(
    '/api/v1/assignments/incident/:incidentId',
    { preHandler: authenticate },
    async (request, reply) => {
      const assignments = await respondersService.listAssignmentsForIncident(request.params.incidentId);
      return reply.status(200).send({
        success: true,
        data: assignments,
      });
    }
  );

  // 5. Create Assignment (Human Gate)
  fastify.post<{ Body: CreateAssignmentInput }>(
    '/api/v1/assignments',
    { preHandler: [authenticate, validateBody(createAssignmentSchema)] },
    async (request, reply) => {
      const user = request.user!;
      const assignment = await respondersService.createAssignment(request.body, user);
      return reply.status(201).send({
        success: true,
        data: assignment,
      });
    }
  );

  // 6. Update Assignment Status
  fastify.patch<{ Params: { id: string }; Body: UpdateAssignmentStatusInput }>(
    '/api/v1/assignments/:id/status',
    { preHandler: [authenticate, validateBody(updateAssignmentStatusSchema)] },
    async (request, reply) => {
      const user = request.user!;
      const updated = await respondersService.updateAssignmentStatus(
        request.params.id,
        request.body,
        user
      );

      return reply.status(200).send({
        success: true,
        data: updated,
      });
    }
  );
}
