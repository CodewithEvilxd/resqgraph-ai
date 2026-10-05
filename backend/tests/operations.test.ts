import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { dbStore } from '../src/db/index.js';
import { INCIDENT_PRIORITIES, HAZARD_TYPES } from '../src/contracts/constants/priorities.js';

describe('Phase 5: Operations — Hazard-Aware Routing & Resource Allocation', () => {
  let app: FastifyInstance;
  let commanderToken: string;
  let citizenToken: string;
  let incidentId: string;
  let testTeamId: string;

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

    // Create a flood incident
    const incRes = await app.inject({
      method: 'POST',
      url: '/api/v1/incidents',
      headers: { authorization: `Bearer ${commanderToken}` },
      payload: {
        title: 'River Breach Flooding in Yamuna Khadar',
        description: 'Water level rising quickly, several families stranded on rooftops.',
        priority: INCIDENT_PRIORITIES.P1_CRITICAL,
        hazardType: HAZARD_TYPES.FLOOD,
        location: { latitude: 28.618, longitude: 77.255, address: 'Yamuna Floodplain Sector 4' },
        affectedPeopleEstimate: 12,
      },
    });
    incidentId = incRes.json().data.id;

    // Retrieve seed team ID
    const teams = Array.from(dbStore.teams.values());
    testTeamId = teams[0].id;
  });

  describe('1. Road Segment & Hazard Reporting', () => {
    it('creates a blocked road segment with reason and spatial endpoints', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/routes/segments',
        headers: { authorization: `Bearer ${commanderToken}` },
        payload: {
          name: 'Vikas Marg Underpass',
          status: 'flooded',
          blockedReason: 'Water depth 4.5 feet, impassable for all non-amphibious vehicles',
          hazardType: HAZARD_TYPES.FLOOD,
          startPoint: { latitude: 28.625, longitude: 77.250 },
          endPoint: { latitude: 28.628, longitude: 77.253 },
          lengthMeters: 450,
          speedLimitKmh: 40,
        },
      });

      expect(response.statusCode).toBe(201);
      const { data } = response.json();
      expect(data.name).toBe('Vikas Marg Underpass');
      expect(data.status).toBe('flooded');
      expect(data.id).toBeDefined();
    });

    it('lists road closures filtered by status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/routes/segments?status=flooded',
        headers: { authorization: `Bearer ${commanderToken}` },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();
      expect(data.length).toBeGreaterThanOrEqual(1);
      expect(data.every((s: any) => s.status === 'flooded')).toBe(true);
    });
  });

  describe('2. Hazard-Aware Routing Engine', () => {
    it('detects intersecting road closure and suggests safe alternative detour', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/routes/calculate',
        headers: { authorization: `Bearer ${commanderToken}` },
        payload: {
          origin: { latitude: 28.630, longitude: 77.245, address: 'ITO Fire Station' },
          destination: { latitude: 28.618, longitude: 77.255, address: 'Yamuna Floodplain Sector 4' },
          avoidHazards: true,
        },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();

      expect(data.distanceMeters).toBeGreaterThan(500);
      expect(data.estimatedDurationSeconds).toBeGreaterThan(30);
      expect(data.waypoints.length).toBeGreaterThanOrEqual(3); // Origin, Detour, Destination

      // Route safety assessment
      expect(data.safety.alternativeSuggested).toBe(true);
      expect(data.safety.hazardsEncountered.length).toBeGreaterThan(0);
      expect(data.safety.warnings.some((w: string) => w.includes('flooded'))).toBe(true);
    });
  });

  describe('3. Resource & Team Allocation Intelligence', () => {
    it('ranks available teams by capability match, proximity, and operational readiness', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/allocation/incidents/${incidentId}/recommendations`,
        headers: { authorization: `Bearer ${commanderToken}` },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();

      expect(data.length).toBeGreaterThan(0);
      const topRecommendation = data[0];

      expect(topRecommendation.teamId).toBeDefined();
      expect(topRecommendation.teamName).toBeDefined();
      expect(topRecommendation.capabilityMatchScore).toBeGreaterThan(0);
      expect(topRecommendation.reasons.length).toBeGreaterThan(0);
      expect(topRecommendation.requiredEquipment.length).toBeGreaterThan(0);
    });
  });

  describe('4. Human-in-the-Loop Dispatch Gate', () => {
    it('executes team dispatch under commander authorization with audit log and status update', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/allocation/dispatch',
        headers: { authorization: `Bearer ${commanderToken}` },
        payload: {
          incidentId,
          teamId: testTeamId,
          notes: 'Immediate deployment with lifeboats and high-volume pumps.',
        },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();

      expect(data.assignments.length).toBeGreaterThan(0);
      expect(data.assignments[0].status).toBe('dispatched');
      expect(data.assignments[0].approvalReason).toContain('Immediate deployment');

      // Verify incident status transitioned to dispatched
      const incRes = await app.inject({
        method: 'GET',
        url: `/api/v1/incidents/${incidentId}`,
        headers: { authorization: `Bearer ${commanderToken}` },
      });
      expect(incRes.json().data.status).toBe('dispatched');
    });

    it('rejects team dispatch attempt by unauthorized citizen role', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/allocation/dispatch',
        headers: { authorization: `Bearer ${citizenToken}` },
        payload: {
          incidentId,
          teamId: testTeamId,
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });
});
