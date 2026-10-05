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
  retryCount: number;
  status: 'pending' | 'syncing' | 'applied' | 'conflict' | 'failed';
  errorMessage?: string;
}

export interface SyncResult {
  clientEventId: string;
  status: 'applied' | 'duplicate_ignored' | 'rejected' | 'conflict_detected';
  serverId?: string;
  serverTimestamp: string;
  errorMessage?: string;
}

export interface SyncBatchResponse {
  clientSyncBatchId: string;
  serverReceivedAt: string;
  results: SyncResult[];
}

export class DurableQueue {
  private queue: OfflineSyncItem[] = [];
  private isProcessing = false;
  private readonly maxRetries = 5;

  constructor(
    private readonly deviceId: string = 'FIELD-RESPONDER-DEVICE-01',
    private readonly apiEndpoint: string = 'http://localhost:4000/api/v1/sync/batch',
  ) {}

  enqueue(
    operationType: OfflineSyncItem['operationType'],
    entityName: string,
    payload: Record<string, unknown>,
  ): OfflineSyncItem {
    const item: OfflineSyncItem = {
      clientEventId: crypto.randomUUID(),
      operationType,
      entityName,
      payload,
      clientTimestamp: new Date().toISOString(),
      deviceInfo: {
        deviceId: this.deviceId,
        platform: 'android-field-client',
        appVersion: '1.0.0',
      },
      retryCount: 0,
      status: 'pending',
    };

    this.queue.push(item);
    return item;
  }

  getPendingItems(): OfflineSyncItem[] {
    return this.queue.filter(i => i.status === 'pending');
  }

  getAllItems(): OfflineSyncItem[] {
    return [...this.queue];
  }

  clearApplied(): void {
    this.queue = this.queue.filter(i => i.status !== 'applied');
  }

  async processQueue(token: string): Promise<SyncBatchResponse | null> {
    if (this.isProcessing) return null;
    const pending = this.getPendingItems();
    if (pending.length === 0) return null;

    this.isProcessing = true;
    const batchId = crypto.randomUUID();

    // Mark as syncing
    pending.forEach(item => {
      item.status = 'syncing';
    });

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientSyncBatchId: batchId,
          items: pending.map(item => ({
            clientEventId: item.clientEventId,
            operationType: item.operationType,
            entityName: item.entityName,
            payload: item.payload,
            clientTimestamp: item.clientTimestamp,
            deviceInfo: item.deviceInfo,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync batch failed with HTTP status ${response.status}`);
      }

      const json = await response.json();
      const batchResponse: SyncBatchResponse = json.data;

      // Update local item status based on server response
      batchResponse.results.forEach(res => {
        const item = this.queue.find(q => q.clientEventId === res.clientEventId);
        if (item) {
          if (res.status === 'applied' || res.status === 'duplicate_ignored') {
            item.status = 'applied';
          } else if (res.status === 'conflict_detected') {
            item.status = 'conflict';
            item.errorMessage = res.errorMessage;
          } else {
            item.status = 'failed';
            item.errorMessage = res.errorMessage;
          }
        }
      });

      return batchResponse;
    } catch (err: any) {
      // Revert pending items with exponential backoff retry count
      pending.forEach(item => {
        item.retryCount += 1;
        item.status = item.retryCount >= this.maxRetries ? 'failed' : 'pending';
        item.errorMessage = err.message;
      });
      return null;
    } finally {
      this.isProcessing = false;
    }
  }
}
