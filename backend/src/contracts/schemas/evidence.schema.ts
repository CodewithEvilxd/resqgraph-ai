import { z } from 'zod';
import { SOURCE_TYPES } from '../constants/priorities.js';
import { locationPointSchema } from './incident.schema.js';

export const createEvidenceSchema = z.object({
  incidentId: z.string().uuid(),
  reportId: z.string().uuid().optional(),
  sourceType: z.enum([
    SOURCE_TYPES.CITIZEN,
    SOURCE_TYPES.RESPONDER,
    SOURCE_TYPES.DISPATCHER,
    SOURCE_TYPES.IOT_DEVICE,
    SOURCE_TYPES.CCTV_VISION,
    SOURCE_TYPES.GOVERNMENT_FEED,
    SOURCE_TYPES.WEATHER_ALERT,
  ]),
  mediaType: z.enum(['text', 'image', 'audio', 'video', 'sensor_telemetry']),
  mediaUrl: z.string().url().optional(),
  mimeType: z.string().optional(),
  fileSizeBytes: z.number().int().positive().optional(),
  location: locationPointSchema.optional(),
  locationConfidence: z.number().min(0).max(1).default(0.8),
  extractionConfidence: z.number().min(0).max(1).default(0.8),
  observations: z.array(
    z.object({
      label: z.string(),
      confidence: z.number().min(0).max(1),
      boundingBox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
    })
  ).default([]),
  contradictionFlags: z.array(z.string()).default([]),
});

export type CreateEvidenceInput = z.infer<typeof createEvidenceSchema>;

export const linkEvidenceSchema = z.object({
  evidenceIdA: z.string().uuid(),
  evidenceIdB: z.string().uuid(),
  relationType: z.enum(['supports', 'contradicts', 'duplicates', 'corroborates']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(3).max(500),
});

export type LinkEvidenceInput = z.infer<typeof linkEvidenceSchema>;
