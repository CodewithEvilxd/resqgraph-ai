import { FastifyInstance } from 'fastify';
import { authService } from '../../services/auth.service.js';
import { loginSchema, registerSchema, LoginInput, RegisterInput } from '../../contracts/schemas/auth.schema.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { dbStore } from '../../db/index.js';
import { NotFoundError } from '../../utils/errors.js';

export async function authRouter(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: LoginInput }>(
    '/api/v1/auth/login',
    { preHandler: validateBody(loginSchema) },
    async (request, reply) => {
      const session = await authService.login(request.body);
      return reply.status(200).send({
        success: true,
        data: session,
      });
    }
  );

  fastify.post<{ Body: RegisterInput }>(
    '/api/v1/auth/register',
    { preHandler: validateBody(registerSchema) },
    async (request, reply) => {
      const session = await authService.register(request.body);
      return reply.status(201).send({
        success: true,
        data: session,
      });
    }
  );

  fastify.get(
    '/api/v1/auth/me',
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = request.user!.userId;
      const userWithHash = dbStore.users.get(userId);
      if (!userWithHash) {
        throw new NotFoundError('User profile not found');
      }

      const org = dbStore.organizations.get(userWithHash.organizationId);
      const { passwordHash: _hash, ...user } = userWithHash;

      return reply.status(200).send({
        success: true,
        data: {
          user,
          organization: org,
        },
      });
    }
  );

  fastify.get(
    '/api/v1/users',
    { preHandler: authenticate },
    async (request, reply) => {
      const orgId = request.user!.organizationId;
      const users = Array.from(dbStore.users.values())
        .filter((u) => u.organizationId === orgId)
        .map(({ passwordHash: _hash, ...user }) => user);

      return reply.status(200).send({
        success: true,
        data: users,
      });
    }
  );
}
