import { dbStore } from '../../db/index.js';
import { reportsService } from '../reports/reports.service.js';
import { evidenceService } from '../evidence/evidence.service.js';
import { respondersRepository } from '../responders/responders.repository.js';
import { incidentsService } from '../incidents/incidents.service.js';
import { incidentsRepository } from '../incidents/incidents.repository.js';
import {
  SyncBatchRequest,
  SyncBatchResponse,
  SyncItemResult,
  OfflineSyncItem,
} from '../../contracts/types/sync.js';
import { AuthTokenPayload } from '../../contracts/types/user.js';
import { ResponderStatus } from '../../contracts/types/responder.js';
import { logger } from '../../utils/logger.js';

export class SyncService {
  async processBatch(request: SyncBatchRequest, user: AuthTokenPayload): Promise<SyncBatchResponse> {
    const results: SyncItemResult[] = [];
    const now = new Date().toISOString();

    logger.info('Processing offline sync batch', {
      clientSyncBatchId: request.clientSyncBatchId,
      itemCount: request.items.length,
      userId: user.userId,
    });

    for (const item of request.items) {
      // 1. Idempotency Check
      const existing = dbStore.idempotencyKeys.get(item.clientEventId);
      if (existing) {
        results.push({
          clientEventId: item.clientEventId,
          status: 'duplicate_ignored',
          serverId: (existing.responsePayload as any)?.id,
          serverTimestamp: existing.createdAt,
        });
        continue;
      }

      try {
        const itemResult = await this.processSyncItem(item, user);
        results.push(itemResult);

        // Store idempotency key
        dbStore.idempotencyKeys.set(item.clientEventId, {
          operationName: item.operationType,
          responsePayload: itemResult,
          createdAt: now,
        });
      } catch (err: any) {
        logger.warn('Failed to apply offline sync item', {
          clientEventId: item.clientEventId,
          operationType: item.operationType,
          error: err.message,
        });

        results.push({
          clientEventId: item.clientEventId,
          status: 'rejected',
          serverTimestamp: now,
          errorMessage: err.message || 'Operation rejected',
        });
      }
    }

    return {
      clientSyncBatchId: request.clientSyncBatchId,
      serverReceivedAt: now,
      results,
    };
  }

  private async processSyncItem(item: OfflineSyncItem, user: AuthTokenPayload): Promise<SyncItemResult> {
    const now = new Date().toISOString();

    switch (item.operationType) {
      case 'create_report': {
        const payload = item.payload as any;
        // Check incident status if linked
        if (payload.incidentId) {
          const inc = await incidentsRepository.findById(payload.incidentId);
          if (inc && (inc.status === 'closed' || inc.status === 'merged')) {
            return {
              clientEventId: item.clientEventId,
              status: 'conflict_detected',
              serverTimestamp: now,
              errorMessage: `Target incident is already in terminal state '${inc.status}'.`,
            };
          }
        }

        const result = await reportsService.create(
          {
            incidentId: payload.incidentId,
            sourceType: payload.sourceType || 'responder',
            rawContent: payload.rawContent || '',
            clientEventId: item.clientEventId,
            location: payload.location,
          },
          user,
        );

        return {
          clientEventId: item.clientEventId,
          status: 'applied',
          serverId: result.report.id,
          serverTimestamp: now,
        };
      }

      case 'add_evidence': {
        const payload = item.payload as any;
        const evidence = await evidenceService.create(
          {
            incidentId: payload.incidentId,
            sourceType: payload.sourceType || 'responder',
            mediaType: payload.mediaType || 'text',
            mediaUrl: payload.mediaUrl,
            location: payload.location,
            locationConfidence: payload.locationConfidence || 0.8,
            extractionConfidence: payload.extractionConfidence || 0.8,
            observations: payload.observations || [],
            contradictionFlags: payload.contradictionFlags || [],
          },
          user,
        );

        return {
          clientEventId: item.clientEventId,
          status: 'applied',
          serverId: evidence.id,
          serverTimestamp: now,
        };
      }

      case 'update_responder_status': {
        const payload = item.payload as any;
        const responder = await respondersRepository.findResponderByUserId(user.userId);
        if (!responder) {
          throw new Error(`Responder profile not found for user ${user.userId}`);
        }

        const updated = await respondersRepository.updateResponderStatus(
          responder.id,
          payload.status as ResponderStatus,
          payload.location,
          payload.batteryLevel,
        );

        return {
          clientEventId: item.clientEventId,
          status: 'applied',
          serverId: updated.id,
          serverTimestamp: now,
        };
      }

      case 'draft_incident': {
        const payload = item.payload as any;
        const incident = await incidentsService.create(
          {
            title: payload.title || 'Offline Emergency Report',
            description: payload.description || 'Reported from field unit offline buffer',
            priority: payload.priority || 'P2_HIGH',
            hazardType: payload.hazardType || 'other',
            location: payload.location,
            affectedPeopleEstimate: payload.affectedPeopleEstimate,
          },
          user,
        );

        return {
          clientEventId: item.clientEventId,
          status: 'applied',
          serverId: incident.id,
          serverTimestamp: now,
        };
      }

      case 'update_assignment_status': {
        const payload = item.payload as any;
        const updated = await respondersRepository.updateAssignmentStatus(
          payload.assignmentId,
          payload.status,
        );

        return {
          clientEventId: item.clientEventId,
          status: 'applied',
          serverId: updated.id,
          serverTimestamp: now,
        };
      }

      case 'report_conflict': {
        const payload = item.payload as any;
        const evidence = await evidenceService.create(
          {
            incidentId: payload.incidentId,
            sourceType: 'responder',
            mediaType: 'text',
            locationConfidence: 0.9,
            extractionConfidence: 0.95,
            observations: [{ label: `Field Contradiction: ${payload.description}`, confidence: 0.95 }],
            contradictionFlags: [
              payload.conflictType ? `${payload.conflictType}: ${payload.description}` : (payload.description || 'Reported contradiction from field unit')
            ],
            location: payload.location,
          },
          user,
        );

        return {
          clientEventId: item.clientEventId,
          status: 'applied',
          serverId: evidence.id,
          serverTimestamp: now,
        };
      }

      default:
        throw new Error(`Unsupported sync operation type '${(item as any).operationType}'`);
    }
  }
}

export const syncService = new SyncService();
