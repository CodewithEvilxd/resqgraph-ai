import { z } from 'zod';
import { locationPointSchema } from './incident.schema.js';
import { HAZARD_TYPES } from '../constants/priorities.js';

export const createRoadSegmentSchema = z.object({
  name: z.string().min(2).max(100),
  status: z.enum(['open', 'closed', 'restricted', 'flooded', 'blocked']),
  blockedReason: z.string().max(250).optional(),
  hazardType: z.enum([
    HAZARD_TYPES.FIRE,
    HAZARD_TYPES.FLOOD,
    HAZARD_TYPES.COLLAPSE,
    HAZARD_TYPES.HAZMAT,
    HAZARD_TYPES.GAS_LEAK,
    HAZARD_TYPES.ROAD_BLOCKED,
    HAZARD_TYPES.POWER_OUTAGE,
    HAZARD_TYPES.MEDICAL_EMERGENCY,
    HAZARD_TYPES.OTHER,
  ]).optional(),
  startPoint: locationPointSchema,
  endPoint: locationPointSchema,
  lengthMeters: z.number().positive(),
  speedLimitKmh: z.number().positive().default(50),
});

export type CreateRoadSegmentInput = z.infer<typeof createRoadSegmentSchema>;

export const calculateRouteSchema = z.object({
  origin: locationPointSchema,
  destination: locationPointSchema,
  vehicleType: z.string().optional(),
  avoidHazards: z.boolean().default(true),
});

export type CalculateRouteInput = z.infer<typeof calculateRouteSchema>;
