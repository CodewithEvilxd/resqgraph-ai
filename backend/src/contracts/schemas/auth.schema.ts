import { z } from 'zod';
import { USER_ROLES } from '../constants/roles.js';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(100),
  organizationId: z.string().uuid(),
  role: z.enum([
    USER_ROLES.CITIZEN,
    USER_ROLES.RESPONDER,
    USER_ROLES.DISPATCHER,
    USER_ROLES.COMMANDER,
    USER_ROLES.ADMIN,
  ]),
  phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
