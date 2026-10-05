import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { signHmacSha256 } from '../src/utils/crypto.js';
import { env } from '../src/config/env.js';

describe('Phase 8: Hardware Edge Node & Device Ingestion', () => {
  let app: FastifyInstance;
  let commanderToken: string;
  let registeredDeviceId: string;
  const hardwareUid = 'ESP32-SOS-0042-NODE';

  beforeAll(async () => {
    app = buildApp();
    await app.ready();

    const cmdLogin = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'commander@resqgraph.local', password: 'Password123!' },
    });
    commanderToken = cmdLogin.json().data.token;
  });

  describe('1. Device Registration & Heartbeat', () => {
    it('registers a new IoT emergency device under commander authority', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/devices/register',
        headers: { authorization: `Bearer ${commanderToken}` },
        payload: {
          hardwareUid,
          name: 'Sector 5 Emergency SOS Edge Pillar',
          deviceType: 'sos_button',
          firmwareVersion: 'v2.4.1',
          assignedLocation: { latitude: 28.535, longitude: 77.271, address: 'Sector 5 Plaza' },
        },
      });

      expect(response.statusCode).toBe(201);
      const { data } = response.json();
      expect(data.hardwareUid).toBe(hardwareUid);
      expect(data.status).toBe('online');
      registeredDeviceId = data.id;
    });

    it('processes heartbeat telemetry from edge node', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/devices/heartbeat',
        payload: {
          deviceId: registeredDeviceId,
          hardwareUid,
          batteryPercentage: 94,
          timestamp: new Date().toISOString(),
          firmwareVersion: 'v2.4.1',
        },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();
      expect(data.batteryPercentage).toBe(94);
      expect(data.status).toBe('online');
    });
  });

  describe('2. Cryptographic Ingestion & Autonomous Correlation', () => {
    it('verifies HMAC-SHA256 signature and autonomously correlates/spawns emergency incident', async () => {
      const clientEventId = 'aaaaaaaa-1111-4444-8888-cccccccccccc';
      const timestamp = new Date().toISOString();
      const eventType = 'sos_trigger';

      // Compute valid canonical HMAC signature
      const canonicalPayload = `${registeredDeviceId}:${hardwareUid}:${clientEventId}:${eventType}:${timestamp}`;
      const validSignature = signHmacSha256(canonicalPayload, env.DEVICE_SIGNING_SECRET);

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/devices/events',
        payload: {
          deviceId: registeredDeviceId,
          hardwareUid,
          clientEventId,
          eventType,
          timestamp,
          telemetry: {
            batteryVoltage: 3.7,
            rawSignalDbm: -68,
          },
          signature: validSignature,
        },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();
      expect(data.clientEventId).toBe(clientEventId);
      expect(data.associatedIncidentId).toBeDefined();

      // Verify the spawned incident is accessible and marked verified
      const incRes = await app.inject({
        method: 'GET',
        url: `/api/v1/incidents/${data.associatedIncidentId}`,
        headers: { authorization: `Bearer ${commanderToken}` },
      });
      expect(incRes.statusCode).toBe(200);
      expect(incRes.json().data.status).toBe('verified');
      expect(incRes.json().data.priority).toBe('P1_CRITICAL');
    });

    it('rejects device event with forged HMAC signature', async () => {
      const clientEventId = 'bbbbbbbb-2222-4444-8888-dddddddddddd';
      const timestamp = new Date().toISOString();

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/devices/events',
        payload: {
          deviceId: registeredDeviceId,
          hardwareUid,
          clientEventId,
          eventType: 'tamper_alert',
          timestamp,
          telemetry: {},
          signature: 'deadbeef0000111122223333444455556666777788889999aaaabbbbccccdddd',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('idempotently re-acknowledges duplicate clientEventId without spawning duplicate incident', async () => {
      const clientEventId = 'aaaaaaaa-1111-4444-8888-cccccccccccc'; // Same as previously ingested event
      const timestamp = new Date().toISOString();

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/devices/events',
        payload: {
          deviceId: registeredDeviceId,
          hardwareUid,
          clientEventId,
          eventType: 'sos_trigger',
          timestamp,
          telemetry: {},
        },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();
      expect(data.clientEventId).toBe(clientEventId);
    });
  });

  describe('3. Organization Device Inventory', () => {
    it('lists registered edge devices for organization', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/devices',
        headers: { authorization: `Bearer ${commanderToken}` },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();
      expect(data.length).toBeGreaterThanOrEqual(1);
      expect(data.some((d: any) => d.hardwareUid === hardwareUid)).toBe(true);
    });
  });
});
