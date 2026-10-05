export const INCIDENT_PRIORITIES = {
  P1_CRITICAL: 'P1_CRITICAL',
  P2_HIGH: 'P2_HIGH',
  P3_MEDIUM: 'P3_MEDIUM',
  P4_LOW: 'P4_LOW',
} as const;

export type IncidentPriority = (typeof INCIDENT_PRIORITIES)[keyof typeof INCIDENT_PRIORITIES];

export const HAZARD_TYPES = {
  FIRE: 'fire',
  FLOOD: 'flood',
  COLLAPSE: 'building_collapse',
  HAZMAT: 'hazmat_leak',
  GAS_LEAK: 'gas_leak',
  ROAD_BLOCKED: 'road_blocked',
  POWER_OUTAGE: 'power_outage',
  MEDICAL_EMERGENCY: 'mass_casualty',
  OTHER: 'other',
} as const;

export type HazardType = (typeof HAZARD_TYPES)[keyof typeof HAZARD_TYPES];

export const SOURCE_TYPES = {
  CITIZEN: 'citizen',
  RESPONDER: 'responder',
  DISPATCHER: 'dispatcher',
  IOT_DEVICE: 'iot_device',
  CCTV_VISION: 'cctv_vision',
  GOVERNMENT_FEED: 'government_feed',
  WEATHER_ALERT: 'weather_alert',
} as const;

export type SourceType = (typeof SOURCE_TYPES)[keyof typeof SOURCE_TYPES];
