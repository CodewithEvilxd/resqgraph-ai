import { dbStore, generateUUID } from '../../db/index.js';
import { AuditEvent } from '../../contracts/types/audit.js';
import { AuditAction } from '../../contracts/constants/events.js';
import { logger } from '../../utils/logger.js';

const log = logger.child('AuditService');

export interface CreateAuditInput {
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
}

export class AuditService {
  async record(input: CreateAuditInput): Promise<AuditEvent> {
    const event: AuditEvent = {
      id: generateUUID(),
      organizationId: input.organizationId,
      userId: input.userId,
      userEmail: input.userEmail,
      userRole: input.userRole,
      action: input.action,
      targetEntity: input.targetEntity,
      targetEntityId: input.targetEntityId,
      details: input.details,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      timestamp: new Date().toISOString(),
    };

    dbStore.auditEvents.push(event);
    log.info('Audit event recorded', {
      action: event.action,
      targetEntity: event.targetEntity,
      targetEntityId: event.targetEntityId,
      userId: event.userId,
    });

    return event;
  }

  async list(organizationId: string, limit: number = 100, offset: number = 0): Promise<{ items: AuditEvent[]; total: number }> {
    const events = dbStore.auditEvents
      .filter((e) => e.organizationId === organizationId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = events.length;
    const items = events.slice(offset, offset + limit);

    return { items, total };
  }
}

export const auditService = new AuditService();
