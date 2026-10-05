export interface OfflineSyncItem {
  clientEventId: string;
  operationType: 'create_report' | 'add_evidence' | 'update_responder_status' | 'draft_incident' | 'update_assignment_status' | 'report_conflict';
  entityName: string;
  payload: Record<string, unknown>;
  clientTimestamp: string;
  deviceInfo: {
    deviceId: string;
    platform: string;
    appVersion: string;
  };
}

export interface SyncBatchRequest {
  clientSyncBatchId: string;
  items: OfflineSyncItem[];
}

export interface SyncItemResult {
  clientEventId: string;
  status: 'applied' | 'duplicate_ignored' | 'rejected' | 'conflict_detected';
  serverId?: string;
  serverTimestamp: string;
  errorMessage?: string;
}

export interface SyncBatchResponse {
  clientSyncBatchId: string;
  serverReceivedAt: string;
  results: SyncItemResult[];
}
