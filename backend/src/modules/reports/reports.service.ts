import { reportsRepository } from './reports.repository.js';
import { auditService } from '../audit/audit.service.js';
import { realtimeService } from '../../services/realtime.service.js';
import { Report } from '../../contracts/types/report.js';
import { AuthTokenPayload } from '../../contracts/types/user.js';
import { CreateReportInput } from '../../contracts/schemas/report.schema.js';
import { REALTIME_EVENTS, AUDIT_ACTIONS } from '../../contracts/constants/events.js';
import { generateUUID } from '../../utils/crypto.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';

export class ReportsService {
  async create(input: CreateReportInput, user: AuthTokenPayload): Promise<{ report: Report; isDuplicate: boolean }> {
    const now = new Date().toISOString();
    const id = generateUUID();

    const report: Report = {
      id,
      incidentId: input.incidentId,
      organizationId: user.organizationId,
      authorId: user.userId,
      clientEventId: input.clientEventId,
      sourceType: input.sourceType,
      rawContent: input.rawContent,
      location: input.location,
      isVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    const result = await reportsRepository.create(report);

    if (!result.isDuplicate) {
      await auditService.record({
        organizationId: user.organizationId,
        userId: user.userId,
        userEmail: user.email,
        userRole: user.role,
        action: AUDIT_ACTIONS.INCIDENT_UPDATE,
        targetEntity: 'report',
        targetEntityId: report.id,
        details: { incidentId: report.incidentId, sourceType: report.sourceType },
      });

      realtimeService.broadcastToOrg(user.organizationId, REALTIME_EVENTS.REPORT_CREATED, result.report);
      if (report.incidentId) {
        realtimeService.broadcastToIncident(report.incidentId, REALTIME_EVENTS.REPORT_CREATED, result.report);
      }
    }

    return result;
  }

  async getById(id: string, organizationId: string): Promise<Report> {
    const report = await reportsRepository.findById(id);
    if (!report || report.organizationId !== organizationId) {
      throw new NotFoundError(`Report ${id} not found`);
    }
    return report;
  }

  async list(organizationId: string, limit: number = 50, offset: number = 0): Promise<{ items: Report[]; total: number }> {
    return reportsRepository.findAll(organizationId, limit, offset);
  }

  async listByIncident(incidentId: string): Promise<Report[]> {
    return reportsRepository.findByIncident(incidentId);
  }

  async verify(id: string, isVerified: boolean, user: AuthTokenPayload): Promise<Report> {
    if (!['dispatcher', 'commander', 'admin'].includes(user.role)) {
      throw new ForbiddenError('Verification of reports requires dispatcher or commander privileges');
    }

    await this.getById(id, user.organizationId);

    const updated = await reportsRepository.verify(id, isVerified, user.userId);

    realtimeService.broadcastToOrg(user.organizationId, REALTIME_EVENTS.REPORT_VERIFIED, updated);
    if (updated.incidentId) {
      realtimeService.broadcastToIncident(updated.incidentId, REALTIME_EVENTS.REPORT_VERIFIED, updated);
    }

    return updated;
  }
}

export const reportsService = new ReportsService();
