import { AuditAction } from '../constants/events.js';

export interface AuditEvent {
  id: string;
  organizationId: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: AuditAction;
  targetEntity: string;
  targetEntityId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}
