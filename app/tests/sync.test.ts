import { describe, it, expect } from 'vitest';
import { DurableQueue } from '../src/sync/durable-queue.js';
import { FieldClient } from '../src/client/field-client.js';
import { useResponderStore } from '../src/store/responder.store.js';

describe('Mobile Field Client & Durable Queue (Offline-First)', () => {
  describe('1. Durable Queue Operations', () => {
    it('enqueues mutations into local durable buffer with monotonic UUIDs', () => {
      const queue = new DurableQueue('TEST-DEVICE-01', 'http://localhost:4000/api/v1/sync/batch');

      const item1 = queue.enqueue('create_report', 'report', { rawContent: 'Smoke visible' });
      const item2 = queue.enqueue('add_evidence', 'evidence', { observations: [{ label: 'water level 2ft' }] });

      expect(queue.getAllItems().length).toBe(2);
      expect(queue.getPendingItems().length).toBe(2);
      expect(item1.clientEventId).toBeDefined();
      expect(item2.clientEventId).toBeDefined();
      expect(item1.clientEventId).not.toBe(item2.clientEventId);
      expect(item1.status).toBe('pending');
    });

    it('reverts item status with incremented retry count when server is unreachable', async () => {
      // Point to non-routable port to simulate network outage
      const queue = new DurableQueue('TEST-DEVICE-01', 'http://localhost:59999/api/v1/sync/batch');
      queue.enqueue('create_report', 'report', { rawContent: 'Network down test' });

      const result = await queue.processQueue('mock-token');
      expect(result).toBeNull();

      const pending = queue.getPendingItems();
      expect(pending.length).toBe(1);
      expect(pending[0].retryCount).toBe(1);
      expect(pending[0].status).toBe('pending');
      expect(pending[0].errorMessage).toBeDefined();
    });
  });

  describe('2. Field Client Workflow', () => {
    it('enqueues field reports and evidence while preserving state', async () => {
      const client = new FieldClient('http://localhost:4000');

      const reportItem = await client.submitReport('Structural cracks in retaining wall', {
        latitude: 28.545,
        longitude: 77.273,
      });

      expect(reportItem.operationType).toBe('create_report');
      expect(reportItem.entityName).toBe('report');

      const evidenceItem = await client.submitEvidence('inc-123', [
        { label: 'Deep fissure across 10m length', confidence: 0.9 },
      ]);

      const conflictItem = await client.reportConflict('inc-123', 'road_status', 'Main bridge is washed out, map shows open');
      expect(conflictItem.operationType).toBe('report_conflict');
      expect(client.queue.getAllItems().length).toBe(3);

      const assignmentItem = await client.updateAssignmentStatus('asg-999', 'inc-123', 'en_route', 'Proceeding via high-ground detour');
      expect(assignmentItem.operationType).toBe('update_assignment_status');
      expect(client.queue.getAllItems().length).toBe(4);
    });

    it('handles store updates for assignments, alerts, and field notifications', () => {
      const store = useResponderStore.getState();

      store.setActiveAssignment({
        assignmentId: 'asg-101',
        incidentId: 'inc-456',
        role: 'search_rescue',
        status: 'dispatched',
        assignedAt: new Date().toISOString(),
      });

      expect(useResponderStore.getState().activeAssignment?.assignmentId).toBe('asg-101');

      store.setActiveAlerts([
        {
          alertId: 'alt-01',
          severity: 'critical',
          title: 'Flash Flood Warning',
          message: 'Immediate evacuation required',
        },
      ]);
      expect(useResponderStore.getState().activeAlerts.length).toBe(1);

      store.addNotification({
        title: 'New Dispatch Order',
        body: 'Report to Sector 4 immediately',
        category: 'assignment',
      });
      expect(useResponderStore.getState().notifications.length).toBe(1);
    });
  });
});

