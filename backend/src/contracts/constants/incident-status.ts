export const INCIDENT_STATUSES = {
  REPORTED: 'reported',
  VERIFIED: 'verified',
  TRIAGED: 'triaged',
  DISPATCHED: 'dispatched',
  ACTIVE: 'active',
  CONTAINED: 'contained',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  MERGED: 'merged',
  DISMISSED: 'dismissed',
} as const;

export type IncidentStatus = (typeof INCIDENT_STATUSES)[keyof typeof INCIDENT_STATUSES];

export const VALID_STATUS_TRANSITIONS: Record<IncidentStatus, readonly IncidentStatus[]> = {
  reported: ['verified', 'triaged', 'dispatched', 'dismissed', 'merged'],
  verified: ['triaged', 'dispatched', 'active', 'dismissed', 'merged'],
  triaged: ['dispatched', 'active', 'dismissed', 'merged'],
  dispatched: ['active', 'contained', 'resolved'],
  active: ['contained', 'resolved', 'dispatched'],
  contained: ['resolved', 'active'],
  resolved: ['closed', 'active'],
  closed: ['active'],
  merged: [],
  dismissed: [],
};
