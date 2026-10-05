import { z } from 'zod';
import { INCIDENT_STATUSES } from '../constants/incident-status.js';
import { INCIDENT_PRIORITIES, HAZARD_TYPES } from '../constants/priorities.js';

export const locationPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitude: z.number().optional(),
  accuracyMeters: z.number().positive().optional(),
  address: z.string().max(250).optional(),
  landmark: z.string().max(250).optional(),
});

export const createIncidentSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(10).max(2000),
  priority: z.enum([
    INCIDENT_PRIORITIES.P1_CRITICAL,
    INCIDENT_PRIORITIES.P2_HIGH,
    INCIDENT_PRIORITIES.P3_MEDIUM,
    INCIDENT_PRIORITIES.P4_LOW,
  ]),
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
  ]),
  location: locationPointSchema,
  affectedPeopleEstimate: z.number().int().nonnegative().optional(),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;

export const updateIncidentSchema = z.object({
  title: z.string().min(5).max(150).optional(),
  description: z.string().min(10).max(2000).optional(),
  priority: z.enum([
    INCIDENT_PRIORITIES.P1_CRITICAL,
    INCIDENT_PRIORITIES.P2_HIGH,
    INCIDENT_PRIORITIES.P3_MEDIUM,
    INCIDENT_PRIORITIES.P4_LOW,
  ]).optional(),
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
  location: locationPointSchema.optional(),
  affectedPeopleEstimate: z.number().int().nonnegative().optional(),
});

export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;

export const statusTransitionSchema = z.object({
  status: z.enum([
    INCIDENT_STATUSES.REPORTED,
    INCIDENT_STATUSES.VERIFIED,
    INCIDENT_STATUSES.TRIAGED,
    INCIDENT_STATUSES.DISPATCHED,
    INCIDENT_STATUSES.ACTIVE,
    INCIDENT_STATUSES.CONTAINED,
    INCIDENT_STATUSES.RESOLVED,
    INCIDENT_STATUSES.CLOSED,
    INCIDENT_STATUSES.MERGED,
    INCIDENT_STATUSES.DISMISSED,
  ]),
  reason: z.string().min(3).max(500).optional(),
});

export type StatusTransitionInput = z.infer<typeof statusTransitionSchema>;

export const mergeIncidentsSchema = z.object({
  targetIncidentId: z.string().uuid(),
  sourceIncidentIds: z.array(z.string().uuid()).min(1),
  reason: z.string().min(5).max(500),
});

export type MergeIncidentsInput = z.infer<typeof mergeIncidentsSchema>;
