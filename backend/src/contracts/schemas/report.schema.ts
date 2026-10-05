import { z } from 'zod';
import { SOURCE_TYPES } from '../constants/priorities.js';
import { locationPointSchema } from './incident.schema.js';

export const createReportSchema = z.object({
  incidentId: z.string().uuid().optional(),
  clientEventId: z.string().uuid().optional(),
  sourceType: z.enum([
    SOURCE_TYPES.CITIZEN,
    SOURCE_TYPES.RESPONDER,
    SOURCE_TYPES.DISPATCHER,
    SOURCE_TYPES.IOT_DEVICE,
    SOURCE_TYPES.CCTV_VISION,
    SOURCE_TYPES.GOVERNMENT_FEED,
    SOURCE_TYPES.WEATHER_ALERT,
  ]),
  rawContent: z.string().min(3).max(5000),
  location: locationPointSchema.optional(),
  mediaUrls: z.array(z.string().url()).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

export const verifyReportSchema = z.object({
  isVerified: z.boolean(),
  notes: z.string().max(500).optional(),
});

export type VerifyReportInput = z.infer<typeof verifyReportSchema>;
