export const REALTIME_EVENTS = {
  INCIDENT_CREATED: 'incident:created',
  INCIDENT_UPDATED: 'incident:updated',
  INCIDENT_STATUS_CHANGED: 'incident:status_changed',
  INCIDENT_MERGED: 'incident:merged',
  REPORT_CREATED: 'report:created',
  REPORT_VERIFIED: 'report:verified',
  EVIDENCE_ADDED: 'evidence:added',
  EVIDENCE_CONTRADICTED: 'evidence:contradicted',
  RESPONDER_LOCATION: 'responder:location',
  RESPONDER_STATUS: 'responder:status',
  ASSIGNMENT_CREATED: 'assignment:created',
  ASSIGNMENT_UPDATED: 'assignment:updated',
  ROUTE_CHANGED: 'route:changed',
  HAZARD_ALERT: 'hazard:alert',
  DEVICE_EVENT: 'device:event',
  AI_RECOMMENDATION_READY: 'ai:recommendation_ready',
} as const;

export type RealtimeEvent = (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

export const AUDIT_ACTIONS = {
  USER_LOGIN: 'user:login',
  INCIDENT_CREATE: 'incident:create',
  INCIDENT_UPDATE: 'incident:update',
  INCIDENT_STATUS_CHANGE: 'incident:status_change',
  INCIDENT_MERGE: 'incident:merge',
  ASSIGNMENT_CREATE: 'assignment:create',
  ASSIGNMENT_OVERRIDE: 'assignment:override',
  AI_RECOMMENDATION_APPROVE: 'ai:recommendation_approve',
  AI_RECOMMENDATION_REJECT: 'ai:recommendation_reject',
  DEVICE_REGISTER: 'device:register',
  DEVICE_REVOKE: 'device:revoke',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
