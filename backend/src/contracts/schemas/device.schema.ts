import { z } from 'zod';
import { locationPointSchema } from './incident.schema.js';

export const registerDeviceSchema = z.object({
  hardwareUid: z.string().min(6).max(64),
  name: z.string().min(2).max(100),
  deviceType: z.enum(['sos_button', 'environmental_sensor', 'drone', 'cctv_gateway', 'beacon']),
  firmwareVersion: z.string().min(1).max(32),
  assignedLocation: locationPointSchema.optional(),
});

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;

export const deviceEventSchema = z.object({
  deviceId: z.string().uuid(),
  hardwareUid: z.string().min(6).max(64),
  clientEventId: z.string().uuid(),
  eventType: z.enum(['sos_trigger', 'threshold_breach', 'heartbeat', 'tamper_alert']),
  timestamp: z.string().datetime(),
  location: locationPointSchema.optional(),
  telemetry: z.object({
    temperatureCelsius: z.number().optional(),
    smokePpm: z.number().optional(),
    waterLevelCm: z.number().optional(),
    vibrationG: z.number().optional(),
    batteryVoltage: z.number().optional(),
    rawSignalDbm: z.number().optional(),
  }).default({}),
  signature: z.string().optional(),
});

export type DeviceEventInput = z.infer<typeof deviceEventSchema>;

export const deviceHeartbeatSchema = z.object({
  deviceId: z.string().uuid(),
  hardwareUid: z.string().min(6).max(64),
  batteryPercentage: z.number().min(0).max(100).optional(),
  firmwareVersion: z.string().optional(),
  location: locationPointSchema.optional(),
  timestamp: z.string().datetime(),
});

export type DeviceHeartbeatInput = z.infer<typeof deviceHeartbeatSchema>;
