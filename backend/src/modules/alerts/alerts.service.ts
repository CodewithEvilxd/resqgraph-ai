import { alertsRepository } from './alerts.repository.js';
import { Alert, CreateAlertInput } from '../../contracts/types/alert.js';
import { AuthTokenPayload } from '../../contracts/types/user.js';
import { auditService } from '../audit/audit.service.js';
import { generateUUID } from '../../utils/crypto.js';

export class AlertsService {
  async listAlerts(organizationId: string): Promise<Alert[]> {
    return alertsRepository.findAll(organizationId);
  }

  async createAlert(input: CreateAlertInput, user: AuthTokenPayload): Promise<Alert> {
    const now = new Date().toISOString();
    const alert: Alert = {
      id: generateUUID(),
      organizationId: user.organizationId,
      title: input.title,
      severity: input.severity,
      targetArea: input.targetArea,
      message: input.message,
      isActive: true,
      issuedByUserId: user.userId,
      createdAt: now,
      updatedAt: now,
    };

    const created = await alertsRepository.create(alert);

    await auditService.record({
      organizationId: user.organizationId,
      userId: user.userId,
      action: 'incident:create',
      targetEntity: 'alert',
      targetEntityId: created.id,
      details: { title: created.title, severity: created.severity },
    });

    return created;
  }

  async toggleStatus(id: string, isActive: boolean, user: AuthTokenPayload): Promise<Alert> {
    const updated = await alertsRepository.updateStatus(id, isActive);

    await auditService.record({
      organizationId: user.organizationId,
      userId: user.userId,
      action: 'incident:update',
      targetEntity: 'alert',
      targetEntityId: id,
      details: { isActive },
    });

    return updated;
  }
}

export const alertsService = new AlertsService();
