import { z } from 'zod';
import { locationPointSchema } from './incident.schema.js';

export const extractFactsSchema = z.object({
  text: z.string().max(10000).optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(['image', 'audio', 'video', 'text']).optional(),
  locationHint: locationPointSchema.optional(),
}).refine(data => data.text || data.mediaUrl, {
  message: 'Either text or mediaUrl must be provided',
});

export type ExtractFactsInput = z.infer<typeof extractFactsSchema>;

export const checkDuplicatesSchema = z.object({
  incidentId: z.string().uuid(),
  candidateIncidentIds: z.array(z.string().uuid()).optional(),
  maxDistanceMeters: z.number().positive().max(50000).default(500),
  maxTimeDeltaMinutes: z.number().positive().max(1440).default(180),
});

export type CheckDuplicatesInput = z.infer<typeof checkDuplicatesSchema>;

export const fuseEvidenceSchema = z.object({
  incidentId: z.string().uuid(),
});

export type FuseEvidenceInput = z.infer<typeof fuseEvidenceSchema>;

export const reviewDecisionTraceSchema = z.object({
  isApproved: z.boolean(),
  humanOverrideReason: z.string().max(1000).optional(),
});

export type ReviewDecisionTraceInput = z.infer<typeof reviewDecisionTraceSchema>;
