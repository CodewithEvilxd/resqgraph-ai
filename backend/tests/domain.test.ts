import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { INCIDENT_PRIORITIES, HAZARD_TYPES, SOURCE_TYPES } from '../src/contracts/constants/priorities.js';

describe('Domain Core Workflows (Incidents, Reports, Evidence, Responders, Audit)', () => {
  let app: FastifyInstance;
  let commanderToken: string;
  let citizenToken: string;
  let createdIncidentId: string;
  let secondIncidentId: string;
  let createdEvidenceAId: string;
  let createdEvidenceBId: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();

    // Authenticate Commander
    const cmdLogin = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'commander@resqgraph.local', password: 'Password123!' },
    });
    commanderToken = cmdLogin.json().data.token;

    // Authenticate Citizen
    const citLogin = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'citizen1@resqgraph.local', password: 'Password123!' },
    });
    citizenToken = citLogin.json().data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates an incident with verified coordinates and priority', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/incidents',
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: {
        title: 'Hazmat Spill on Mathura Road',
        description: 'Tanker leak identified carrying hazardous flammable solvent. Perimeter established.',
        priority: INCIDENT_PRIORITIES.P1_CRITICAL,
        hazardType: HAZARD_TYPES.HAZMAT,
        location: {
          latitude: 28.538,
          longitude: 77.275,
          address: 'Mathura Road intersection',
        },
        affectedPeopleEstimate: 50,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.code).toMatch(/^INC-\d{4}-\d{4}$/);
    expect(body.data.status).toBe('reported');
    expect(body.data.priority).toBe('P1_CRITICAL');
    createdIncidentId = body.data.id;
  });

  it('lists incidents with status and priority filtering', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/incidents?priority=P1_CRITICAL',
      headers: { authorization: `Bearer ${commanderToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data[0].priority).toBe('P1_CRITICAL');
  });

  it('enforces valid status transition: reported -> verified -> active', async () => {
    // 1. Transition reported -> verified
    const vRes = await app.inject({
      method: 'POST',
      url: `/api/v1/incidents/${createdIncidentId}/status`,
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: { status: 'verified', reason: 'On-ground officer confirmed tanker leak' },
    });
    expect(vRes.statusCode).toBe(200);
    expect(vRes.json().data.status).toBe('verified');

    // 2. Transition verified -> active
    const aRes = await app.inject({
      method: 'POST',
      url: `/api/v1/incidents/${createdIncidentId}/status`,
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: { status: 'active', reason: 'Containment operation underway' },
    });
    expect(aRes.statusCode).toBe(200);
    expect(aRes.json().data.status).toBe('active');
  });

  it('rejects invalid status transition with 409 Conflict', async () => {
    // Cannot jump from active directly to closed (must go through resolved)
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/incidents/${createdIncidentId}/status`,
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: { status: 'closed', reason: 'Attempting invalid skip' },
    });

    expect(res.statusCode).toBe(409);
    expect(res.json().error.code).toBe('CONFLICT');
  });

  it('ingests report idempotently using clientEventId', async () => {
    const clientEventId = crypto.randomUUID();
    const payload = {
      incidentId: createdIncidentId,
      clientEventId,
      sourceType: SOURCE_TYPES.CITIZEN,
      rawContent: 'Heavy chemical odor near petrol station',
      location: { latitude: 28.539, longitude: 77.276 },
    };

    // First submission
    const res1 = await app.inject({
      method: 'POST',
      url: '/api/v1/reports',
      headers: { authorization: `Bearer ${citizenToken}` },
      payload,
    });
    expect(res1.statusCode).toBe(201);
    expect(res1.json().isDuplicate).toBe(false);
    const reportId = res1.json().data.id;

    // Retry submission with identical clientEventId
    const res2 = await app.inject({
      method: 'POST',
      url: '/api/v1/reports',
      headers: { authorization: `Bearer ${citizenToken}` },
      payload,
    });
    expect(res2.statusCode).toBe(200);
    expect(res2.json().isDuplicate).toBe(true);
    expect(res2.json().data.id).toBe(reportId);
  });

  it('creates evidence items and records contradiction between observations', async () => {
    // Evidence A: Road Blocked
    const resA = await app.inject({
      method: 'POST',
      url: '/api/v1/evidence',
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: {
        incidentId: createdIncidentId,
        sourceType: SOURCE_TYPES.RESPONDER,
        mediaType: 'text',
        observations: [{ label: 'road_blocked', confidence: 0.95 }],
      },
    });
    expect(resA.statusCode).toBe(201);
    createdEvidenceAId = resA.json().data.id;

    // Evidence B: Road Clear
    const resB = await app.inject({
      method: 'POST',
      url: '/api/v1/evidence',
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: {
        incidentId: createdIncidentId,
        sourceType: SOURCE_TYPES.CITIZEN,
        mediaType: 'text',
        observations: [{ label: 'road_clear', confidence: 0.6 }],
      },
    });
    expect(resB.statusCode).toBe(201);
    createdEvidenceBId = resB.json().data.id;

    // Link as contradiction
    const linkRes = await app.inject({
      method: 'POST',
      url: '/api/v1/evidence/link',
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: {
        evidenceIdA: createdEvidenceAId,
        evidenceIdB: createdEvidenceBId,
        relationType: 'contradicts',
        confidence: 0.9,
        reasoning: 'Evidence A reports road impassable due to solvent; Evidence B claims open lane',
      },
    });
    expect(linkRes.statusCode).toBe(201);
    expect(linkRes.json().data.relationType).toBe('contradicts');
  });

  it('creates second incident and merges it into target incident', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/incidents',
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: {
        title: 'Secondary Spill Report',
        description: 'Smoke reported 200m from main tanker location',
        priority: INCIDENT_PRIORITIES.P2_HIGH,
        hazardType: HAZARD_TYPES.HAZMAT,
        location: { latitude: 28.5385, longitude: 77.2755 },
      },
    });
    secondIncidentId = res.json().data.id;

    // Merge second incident into createdIncidentId
    const mergeRes = await app.inject({
      method: 'POST',
      url: '/api/v1/incidents/merge',
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: {
        targetIncidentId: createdIncidentId,
        sourceIncidentIds: [secondIncidentId],
        reason: 'Confirmed same hazmat spill source',
      },
    });

    expect(mergeRes.statusCode).toBe(200);
    expect(mergeRes.json().success).toBe(true);

    // Verify source incident is now marked 'merged'
    const sourceRes = await app.inject({
      method: 'GET',
      url: `/api/v1/incidents/${secondIncidentId}`,
      headers: { authorization: `Bearer ${commanderToken}` },
    });
    expect(sourceRes.json().data.status).toBe('merged');
    expect(sourceRes.json().data.mergedIntoIncidentId).toBe(createdIncidentId);
  });

  it('creates assignment through authorized human gate and updates responder status', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/assignments',
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: {
        incidentId: createdIncidentId,
        teamId: '66666666-6666-6666-6666-666666666661',
        responderId: '77777777-7777-7777-7777-777777777771',
        approvalReason: 'Authorized immediate hazmat containment dispatch',
      },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json().data.status).toBe('dispatched');

    // Verify responder status changed to assigned
    const respRes = await app.inject({
      method: 'GET',
      url: '/api/v1/responders',
      headers: { authorization: `Bearer ${commanderToken}` },
    });
    const responder = respRes.json().data.find((r: { id: string }) => r.id === '77777777-7777-7777-7777-777777777771');
    expect(responder.status).toBe('assigned');
  });

  it('lists audit events for commander and confirms actions were tracked', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/audit',
      headers: { authorization: `Bearer ${commanderToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(4);

    const actions = body.data.map((e: { action: string }) => e.action);
    expect(actions).toContain('incident:create');
    expect(actions).toContain('incident:status_change');
    expect(actions).toContain('incident:merge');
    expect(actions).toContain('assignment:create');
  });
});
