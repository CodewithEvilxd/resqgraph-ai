import { z } from 'zod';

export const offlineSyncItemSchema = z.object({
  clientEventId: z.string().uuid(),
  operationType: z.enum(['create_report', 'add_evidence', 'update_responder_status', 'draft_incident']),
  entityName: z.string().min(1).max(50),
  payload: z.record(z.unknown()),
  clientTimestamp: z.string().datetime(),
  deviceInfo: z.object({
    deviceId: z.string(),
    platform: z.string(),
    appVersion: z.string(),
  }),
});

export const syncBatchRequestSchema = z.object({
  clientSyncBatchId: z.string().uuid(),
  items: z.array(offlineSyncItemSchema).min(1).max(50),
});

export type SyncBatchRequestInput = z.infer<typeof syncBatchRequestSchema>;
