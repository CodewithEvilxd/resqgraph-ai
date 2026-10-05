import { env } from '../config/env.js';
import { dbStore, generateUUID } from '../db/index.js';
import { User, AuthSession, AuthTokenPayload } from '../contracts/types/user.js';
import { UserRole, ROLE_PERMISSIONS } from '../contracts/constants/roles.js';
import { LoginInput, RegisterInput } from '../contracts/schemas/auth.schema.js';
import { UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors.js';
import { hashPassword, verifyPassword, signJwt, verifyJwt } from '../utils/crypto.js';
import { logger } from '../utils/logger.js';

const log = logger.child('AuthService');

export class AuthService {
  async login(input: LoginInput): Promise<AuthSession> {
    const userWithHash = Array.from(dbStore.users.values()).find(
      (u) => u.email.toLowerCase() === input.email.toLowerCase()
    );

    if (!userWithHash || !userWithHash.isActive) {
      log.warn('Failed login attempt: user not found or inactive', { email: input.email });
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = verifyPassword(input.password, userWithHash.passwordHash);
    if (!isMatch) {
      log.warn('Failed login attempt: invalid password', { email: input.email });
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken({
      userId: userWithHash.id,
      organizationId: userWithHash.organizationId,
      email: userWithHash.email,
      role: userWithHash.role,
    });

    // Sanitize user object (omit passwordHash)
    const { passwordHash: _hash, ...user } = userWithHash;

    log.info('User successfully authenticated', { userId: user.id, role: user.role });
    return {
      user: user as User,
      token,
      expiresIn: 86400, // 24 hours
    };
  }

  async register(input: RegisterInput): Promise<AuthSession> {
    const existing = Array.from(dbStore.users.values()).find(
      (u) => u.email.toLowerCase() === input.email.toLowerCase()
    );

    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const org = dbStore.organizations.get(input.organizationId);
    if (!org) {
      throw new NotFoundError('Organization not found');
    }

    const userId = generateUUID();
    const passwordHash = hashPassword(input.password);
    const now = new Date().toISOString();

    const newUser: User & { passwordHash: string } = {
      id: userId,
      organizationId: input.organizationId,
      email: input.email.toLowerCase(),
      passwordHash,
      fullName: input.fullName,
      role: input.role,
      phone: input.phone,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    dbStore.users.set(userId, newUser);

    const token = this.generateToken({
      userId,
      organizationId: input.organizationId,
      email: newUser.email,
      role: newUser.role,
    });

    const { passwordHash: _hash, ...user } = newUser;
    log.info('New user registered', { userId, role: user.role });

    return {
      user: user as User,
      token,
      expiresIn: 86400,
    };
  }

  generateToken(payload: AuthTokenPayload): string {
    return signJwt(payload as unknown as Record<string, unknown>, env.JWT_SECRET, 86400);
  }

  verifyToken(token: string): AuthTokenPayload {
    try {
      return verifyJwt<AuthTokenPayload>(token, env.JWT_SECRET);
    } catch {
      throw new UnauthorizedError('Invalid or expired authentication token');
    }
  }

  hasPermission(role: UserRole, requiredPermission: string): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    if (!permissions) return false;
    if (permissions.includes('*')) return true;
    return permissions.includes(requiredPermission);
  }
}

export const authService = new AuthService();
