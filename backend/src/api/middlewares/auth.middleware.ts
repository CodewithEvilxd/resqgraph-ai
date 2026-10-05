import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../../services/auth.service.js';
import { UserRole } from '../../contracts/constants/roles.js';
import { AuthTokenPayload } from '../../contracts/types/user.js';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthTokenPayload;
  }
}

export async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }

  const token = authHeader.substring(7).trim();
  const payload = authService.verifyToken(token);
  request.user = payload;
}

export function requirePermission(permission: string) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const hasAccess = authService.hasPermission(request.user.role as UserRole, permission);
    if (!hasAccess) {
      throw new ForbiddenError(`User role '${request.user.role}' lacks required permission: ${permission}`);
    }
  };
}

export function requireRole(allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(request.user.role as UserRole)) {
      throw new ForbiddenError(`Access restricted to roles: ${allowedRoles.join(', ')}`);
    }
  };
}
