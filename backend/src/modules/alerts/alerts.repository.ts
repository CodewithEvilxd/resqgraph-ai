import { dbStore } from '../../db/index.js';
import { Alert } from '../../contracts/types/alert.js';
import { NotFoundError } from '../../utils/errors.js';

export class AlertsRepository {
  async findAll(organizationId: string): Promise<Alert[]> {
    return Array.from(dbStore.alerts.values())
      .filter((a) => a.organizationId === organizationId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findById(id: string): Promise<Alert | null> {
    return dbStore.alerts.get(id) || null;
  }

  async create(alert: Alert): Promise<Alert> {
    dbStore.alerts.set(alert.id, alert);
    return alert;
  }

  async updateStatus(id: string, isActive: boolean): Promise<Alert> {
    const alert = dbStore.alerts.get(id);
    if (!alert) {
      throw new NotFoundError(`Alert ${id} not found`);
    }
    alert.isActive = isActive;
    alert.updatedAt = new Date().toISOString();
    dbStore.alerts.set(id, alert);
    return alert;
  }
}

export const alertsRepository = new AlertsRepository();
