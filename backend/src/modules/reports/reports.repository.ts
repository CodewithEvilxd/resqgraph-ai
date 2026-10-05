import { dbStore } from '../../db/index.js';
import { Report } from '../../contracts/types/report.js';
import { NotFoundError } from '../../utils/errors.js';

export class ReportsRepository {
  async create(report: Report): Promise<{ report: Report; isDuplicate: boolean }> {
    // Idempotency check via clientEventId
    if (report.clientEventId) {
      for (const existing of dbStore.reports.values()) {
        if (existing.clientEventId === report.clientEventId) {
          return { report: existing, isDuplicate: true };
        }
      }
    }

    dbStore.reports.set(report.id, report);

    // If report is associated with an incident, increment its reporter count
    if (report.incidentId) {
      const incident = dbStore.incidents.get(report.incidentId);
      if (incident) {
        incident.reporterCount += 1;
        incident.updatedAt = new Date().toISOString();
      }
    }

    return { report, isDuplicate: false };
  }

  async findById(id: string): Promise<Report | null> {
    return dbStore.reports.get(id) || null;
  }

  async findByIncident(incidentId: string): Promise<Report[]> {
    return Array.from(dbStore.reports.values())
      .filter((r) => r.incidentId === incidentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async findAll(organizationId: string, limit: number = 50, offset: number = 0): Promise<{ items: Report[]; total: number }> {
    const reports = Array.from(dbStore.reports.values())
      .filter((r) => r.organizationId === organizationId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = reports.length;
    const items = reports.slice(offset, offset + limit);

    return { items, total };
  }

  async verify(id: string, isVerified: boolean, verifiedByUserId: string): Promise<Report> {
    const report = dbStore.reports.get(id);
    if (!report) {
      throw new NotFoundError(`Report ${id} not found`);
    }

    report.isVerified = isVerified;
    report.verifiedByUserId = verifiedByUserId;
    report.updatedAt = new Date().toISOString();

    dbStore.reports.set(id, report);
    return report;
  }
}

export const reportsRepository = new ReportsRepository();
