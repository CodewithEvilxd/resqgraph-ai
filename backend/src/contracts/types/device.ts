import { LocationPoint } from './incident.js';

export type DeviceType = 'sos_button' | 'environmental_sensor' | 'drone' | 'cctv_gateway' | 'beacon';

export interface Device {
  id: string;
  hardwareUid: string;
  organizationId: string;
  name: string;
  deviceType: DeviceType;
  firmwareVersion: string;
  batteryPercentage?: number;
  lastHeartbeatAt: string;
  status: 'online' | 'offline' | 'degraded' | 'tampered';
  assignedLocation?: LocationPoint;
  isRevoked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceTelemetry {
  temperatureCelsius?: number;
  smokePpm?: number;
  waterLevelCm?: number;
  vibrationG?: number;
  batteryVoltage?: number;
  rawSignalDbm?: number;
}

export interface DeviceEvent {
  id: string;
  deviceId: string;
  hardwareUid: string;
  organizationId: string;
  clientEventId: string; // client UUID for idempotency
  eventType: 'sos_trigger' | 'threshold_breach' | 'heartbeat' | 'tamper_alert';
  timestamp: string;
  location?: LocationPoint;
  telemetry: DeviceTelemetry;
  signature?: string; // HMAC-SHA256 signature
  acknowledgedByServerAt: string;
  associatedIncidentId?: string;
}
