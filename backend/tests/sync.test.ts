import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { INCIDENT_PRIORITIES, HAZARD_TYPES } from '../src/contracts/constants/priorities.js';

describe('Phase 7: Mobile Field & Offline Sync Backend Pipeline', () => {
  let app: FastifyInstance;
  let responderToken: string;
  let commanderToken: string;
  let incidentId: string;
  let closedIncidentId: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();

    // Authenticate responder
    const respLogin = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'responder1@resqgraph.local', password: 'Password123!' },
    });
    responderToken = respLogin.json().data.token;

    // Authenticate commander
    const cmdLogin = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'commander@resqgraph.local', password: 'Password123!' },
    });
    commanderToken = cmdLogin.json().data.token;

    // Create an active incident
    const incRes = await app.inject({
      method: 'POST',
      url: '/api/v1/incidents',
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: {
        title: 'Building Fire at Connaught Place',
        description: 'Smoke on upper floor.',
        priority: INCIDENT_PRIORITIES.P2_HIGH,
        hazardType: HAZARD_TYPES.FIRE,
        location: { latitude: 28.632, longitude: 77.219, address: 'CP Block C' },
      },
    });
    incidentId = incRes.json().data.id;

    // Create and close another incident to test conflict handling
    const closedRes = await app.inject({
      method: 'POST',
      url: '/api/v1/incidents',
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: {
        title: 'Resolved Gas Leak',
        description: 'Gas valve isolated.',
        priority: INCIDENT_PRIORITIES.P3_MEDIUM,
        hazardType: HAZARD_TYPES.GAS_LEAK,
        location: { latitude: 28.635, longitude: 77.220 },
      },
    });
    closedIncidentId = closedRes.json().data.id;
    // Transition through valid state sequence: reported -> verified -> active -> resolved -> closed
    await app.inject({
      method: 'PATCH',
      url: `/api/v1/incidents/${closedIncidentId}/status`,
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: { status: 'verified', reason: 'Confirmed' },
    });
    await app.inject({
      method: 'PATCH',
      url: `/api/v1/incidents/${closedIncidentId}/status`,
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: { status: 'active', reason: 'Active response' },
    });
    await app.inject({
      method: 'PATCH',
      url: `/api/v1/incidents/${closedIncidentId}/status`,
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: { status: 'resolved', reason: 'Resolved on scene' },
    });
    await app.inject({
      method: 'PATCH',
      url: `/api/v1/incidents/${closedIncidentId}/status`,
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: { status: 'closed', reason: 'Incident concluded' },
    });
  });

  describe('1. Batch Sync Ingestion', () => {
    it('applies a batch of queued offline field actions: report, evidence, and responder status', async () => {
      const clientSyncBatchId = '11111111-2222-3333-4444-555555555555';
      const eventReportId = 'aaaa1111-bbbb-2222-cccc-3333dddd4444';
      const eventEvidenceId = 'bbbb2222-cccc-3333-dddd-4444eeee5555';

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/batch',
        headers: { authorization: `Bearer ${responderToken}` },
        payload: {
          clientSyncBatchId,
          items: [
            {
              clientEventId: eventReportId,
              operationType: 'create_report',
              entityName: 'report',
              payload: {
                incidentId,
                rawContent: 'Field observation: fire contained to kitchen, 2 extinguishers expended.',
                location: { latitude: 28.632, longitude: 77.219 },
              },
              clientTimestamp: new Date().toISOString(),
              deviceInfo: {
                deviceId: 'TEST-DEVICE-01',
                platform: 'android',
                appVersion: '1.0.0',
              },
            },
            {
              clientEventId: eventEvidenceId,
              operationType: 'add_evidence',
              entityName: 'evidence',
              payload: {
                incidentId,
                observations: [{ label: 'Thermal camera reading shows 180C hotspot on partition wall', confidence: 0.95 }],
                contradictionFlags: [],
              },
              clientTimestamp: new Date().toISOString(),
              deviceInfo: {
                deviceId: 'TEST-DEVICE-01',
                platform: 'android',
                appVersion: '1.0.0',
              },
            },
          ],
        },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();
      expect(data.clientSyncBatchId).toBe(clientSyncBatchId);
      expect(data.results.length).toBe(2);

      expect(data.results[0].clientEventId).toBe(eventReportId);
      expect(data.results[0].status).toBe('applied');
      expect(data.results[0].serverId).toBeDefined();

      expect(data.results[1].clientEventId).toBe(eventEvidenceId);
      expect(data.results[1].status).toBe('applied');
      expect(data.results[1].serverId).toBeDefined();
    });

    it('idempotently handles re-syncing previously applied items without duplicates', async () => {
      const clientSyncBatchId = '22222222-3333-4444-5555-666666666666';
      const eventReportId = 'aaaa1111-bbbb-2222-cccc-3333dddd4444'; // Previously applied event ID

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/batch',
        headers: { authorization: `Bearer ${responderToken}` },
        payload: {
          clientSyncBatchId,
          items: [
            {
              clientEventId: eventReportId,
              operationType: 'create_report',
              entityName: 'report',
              payload: {
                incidentId,
                rawContent: 'Field observation duplicate attempt.',
              },
              clientTimestamp: new Date().toISOString(),
              deviceInfo: {
                deviceId: 'TEST-DEVICE-01',
                platform: 'android',
                appVersion: '1.0.0',
              },
            },
          ],
        },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();
      expect(data.results[0].status).toBe('duplicate_ignored');
    });

    it('detects and flags conflict when an offline report targets a closed incident', async () => {
      const clientSyncBatchId = '33333333-4444-5555-6666-777777777777';
      const eventConflictId = 'cccc3333-dddd-4444-eeee-5555ffff6666';

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/sync/batch',
        headers: { authorization: `Bearer ${responderToken}` },
        payload: {
          clientSyncBatchId,
          items: [
            {
              clientEventId: eventConflictId,
              operationType: 'create_report',
              entityName: 'report',
              payload: {
                incidentId: closedIncidentId, // Incident is in terminal state 'closed'
                rawContent: 'Belated report from delayed unit.',
              },
              clientTimestamp: new Date().toISOString(),
              deviceInfo: {
                deviceId: 'TEST-DEVICE-01',
                platform: 'android',
                appVersion: '1.0.0',
              },
            },
          ],
        },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();
      expect(data.results[0].status).toBe('conflict_detected');
      expect(data.results[0].errorMessage).toContain('terminal state');
    });
  });
});
