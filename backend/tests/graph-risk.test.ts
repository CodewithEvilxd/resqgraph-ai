import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { INCIDENT_PRIORITIES, HAZARD_TYPES } from '../src/contracts/constants/priorities.js';

describe('Phase 4: Incident Graph & Multi-Factor Risk Intelligence', () => {
  let app: FastifyInstance;
  let commanderToken: string;
  let incidentId: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();

    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'commander@resqgraph.local', password: 'Password123!' },
    });
    commanderToken = loginRes.json().data.token;

    // Create high-urgency test incident
    const incRes = await app.inject({
      method: 'POST',
      url: '/api/v1/incidents',
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: {
        title: 'Chemical Warehouse Fire and Structural Risk',
        description: 'Blaze spreading to storage drums, multiple warehouse workers trapped inside.',
        priority: INCIDENT_PRIORITIES.P3_MEDIUM,
        hazardType: HAZARD_TYPES.FIRE,
        location: { latitude: 28.535, longitude: 77.271, address: 'Okhla Phase II' },
        affectedPeopleEstimate: 8,
      },
    });
    incidentId = incRes.json().data.id;

    // Ingest a report for the incident
    await app.inject({
      method: 'POST',
      url: '/api/v1/reports',
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: {
        incidentId,
        sourceType: 'citizen',
        rawContent: 'Thick chemical smoke and flames visible from kilometer away.',
        location: { latitude: 28.535, longitude: 77.271 },
      },
    });

    // Ingest 2 evidence items (one verified, one unverified with contradiction)
    await app.inject({
      method: 'POST',
      url: '/api/v1/evidence',
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: {
        incidentId,
        sourceType: 'responder',
        mediaType: 'text',
        extractionConfidence: 0.92,
        isVerified: true,
        observations: [{ label: 'South gate access road is impassable and blocked by debris', confidence: 0.9 }],
        contradictionFlags: [],
      },
    });

    await app.inject({
      method: 'POST',
      url: '/api/v1/evidence',
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: {
        incidentId,
        sourceType: 'citizen',
        mediaType: 'text',
        extractionConfidence: 0.8,
        isVerified: false,
        observations: [{ label: 'South gate road is clear and passable for trucks', confidence: 0.75 }],
        contradictionFlags: [],
      },
    });
  });

  describe('1. Multi-Factor Risk Assessment Engine', () => {
    it('evaluates composite risk score, risk tier, and transparent factor breakdown', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/incidents/${incidentId}/risk`,
        headers: { authorization: `Bearer ${commanderToken}` },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();

      expect(data.incidentId).toBe(incidentId);
      expect(data.compositeRiskScore).toBeGreaterThanOrEqual(70);
      expect(['HIGH', 'CRITICAL']).toContain(data.riskTier);
      expect(data.factors.length).toBe(4);

      // Verify factor weights sum to 1.0
      const totalWeight = data.factors.reduce((sum: number, f: any) => sum + f.weight, 0);
      expect(Math.round(totalWeight * 100) / 100).toBe(1.0);

      // High casualty count triggers high human exposure score
      const exposureFactor = data.factors.find((f: any) => f.name === 'human_exposure');
      expect(exposureFactor).toBeDefined();
      expect(exposureFactor.score).toBeGreaterThanOrEqual(80);

      // Uncertainty score must be visible
      expect(data.uncertaintyScore).toBeGreaterThan(0);
      expect(data.uncertaintyScore).toBeLessThanOrEqual(1.0);
    });

    it('generates an advisory decision trace when recommended priority exceeds current priority', async () => {
      const tracesRes = await app.inject({
        method: 'GET',
        url: `/api/v1/ai/incidents/${incidentId}/decision-traces`,
        headers: { authorization: `Bearer ${commanderToken}` },
      });

      expect(tracesRes.statusCode).toBe(200);
      const traces = tracesRes.json().data;
      expect(traces.length).toBeGreaterThan(0);

      const riskTrace = traces.find((t: any) => t.recommendationType === 'priority_assignment');
      expect(riskTrace).toBeDefined();
      expect(riskTrace.recommendedAction).toContain('Recommend escalating priority');
    });
  });

  describe('2. Incident Knowledge Graph Engine', () => {
    it('traverses incident entities, returning connected nodes, edges, and contradiction count', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/incidents/${incidentId}/graph`,
        headers: { authorization: `Bearer ${commanderToken}` },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();

      expect(data.incidentId).toBe(incidentId);
      expect(data.nodes.length).toBeGreaterThanOrEqual(4); // Incident, Report, 2 Evidence
      expect(data.edges.length).toBeGreaterThanOrEqual(3);

      // Verify root incident node
      const incidentNode = data.nodes.find((n: any) => n.type === 'incident');
      expect(incidentNode).toBeDefined();
      expect(incidentNode.id).toBe(incidentId);

      // Verify contradiction edge exists between the two contradictory evidence items
      const contradictionEdge = data.edges.find((e: any) => e.relation === 'contradicts');
      expect(contradictionEdge).toBeDefined();
      expect(data.summary.contradictionCount).toBe(1);
      expect(data.summary.totalEvidence).toBe(2);
      expect(data.summary.totalReports).toBe(1);
    });

    it('returns network topology overview for multiple incidents', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/graph/overview',
        headers: { authorization: `Bearer ${commanderToken}` },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();
      expect(data.activeIncidentsCount).toBeGreaterThan(0);
      expect(Array.isArray(data.clusters)).toBe(true);
    });
  });
});
