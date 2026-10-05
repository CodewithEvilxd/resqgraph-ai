import { z } from 'zod';
import { locationPointSchema } from './incident.schema.js';

export const updateResponderStatusSchema = z.object({
  status: z.enum(['available', 'assigned', 'en_route', 'on_scene', 'offline']),
  currentLocation: locationPointSchema.optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
});

export type UpdateResponderStatusInput = z.infer<typeof updateResponderStatusSchema>;

export const createAssignmentSchema = z.object({
  incidentId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
  responderId: z.string().uuid().optional(),
  approvalReason: z.string().max(500).optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export const updateAssignmentStatusSchema = z.object({
  status: z.enum(['dispatched', 'en_route', 'on_scene', 'completed', 'cancelled']),
  note: z.string().max(500).optional(),
});

export type UpdateAssignmentStatusInput = z.infer<typeof updateAssignmentStatusSchema>;
