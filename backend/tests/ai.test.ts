import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { dbStore } from '../src/db/index.js';
import { USER_ROLES } from '../src/contracts/constants/roles.js';
import { HAZARD_TYPES, INCIDENT_PRIORITIES } from '../src/contracts/constants/priorities.js';

describe('AI Multimodal & Evidence Fusion Pipeline', () => {
  let app: FastifyInstance;
  let commanderToken: string;
  let citizenToken: string;

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

  describe('1. Multimodal Structured Extraction', () => {
    it('extracts fire hazards, trapped victims, and infrastructure impacts from emergency report', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/ai/extract',
        headers: {
          authorization: `Bearer ${commanderToken}`,
        },
        payload: {
          text: 'Huge fire and thick black smoke coming from 3rd floor apartment! 2 people trapped on balcony, road blocked by falling debris and transformer power outage.',
          locationHint: {
            latitude: 28.545,
            longitude: 77.273,
            address: 'Okhla Industrial Area Phase III',
          },
        },
      });

      expect(response.statusCode).toBe(200);
      const { data } = response.json();

      expect(data.detectedHazards).toContain(HAZARD_TYPES.FIRE);
      expect(data.detectedHazards).toContain(HAZARD_TYPES.ROAD_BLOCKED);
      expect(data.detectedHazards).toContain(HAZARD_TYPES.POWER_OUTAGE);
      expect(data.trappedPeopleCount).toBe(2);
      expect(data.infrastructureStatus.roadBlocked).toBe(true);
      expect(data.infrastructureStatus.powerOutage).toBe(true);
      expect(data.urgencyLevel).toBe(INCIDENT_PRIORITIES.P1_CRITICAL);
      expect(data.confidence).toBeGreaterThan(0.7);
      expect(data.uncertaintyScore).toBeLessThan(0.3);
      expect(data.modelMetadata.latencyMs).toBeGreaterThanOrEqual(1);
    });

    it('rejects extraction request without text or media URL', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/ai/extract',
        headers: {
          authorization: `Bearer ${commanderToken}`,
        },
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('2. Multi-Signal Duplicate Detection', () => {
    it('calculates spatial proximity and semantic overlap to detect duplicate incidents', async () => {
      // Create primary incident
      const primaryRes = await app.inject({
        method: 'POST',
        url: '/api/v1/incidents',
        headers: { authorization: `Bearer ${commanderToken}` },
        payload: {
          title: 'Structural Collapse at Connaught Place Block B',
          description: 'Roof collapse on ground floor retail store, building unstable, multiple people stuck.',
          priority: INCIDENT_PRIORITIES.P1_CRITICAL,
          hazardType: HAZARD_TYPES.COLLAPSE,
          location: { latitude: 28.632, longitude: 77.219, address: 'Connaught Place Block B' },
        },
      });
      expect(primaryRes.statusCode).toBe(201);
      const primaryIncident = primaryRes.json().data;

      // Create nearby candidate incident (120 meters away, same time window)
      const duplicateRes = await app.inject({
        method: 'POST',
        url: '/api/v1/incidents',
        headers: { authorization: `Bearer ${commanderToken}` },
        payload: {
          title: 'Building Collapse Near Block B Metro Gate',
          description: 'Store roof collapse at Block B, rubble on street, people stuck inside.',
          priority: INCIDENT_PRIORITIES.P1_CRITICAL,
          hazardType: HAZARD_TYPES.COLLAPSE,
          location: { latitude: 28.633, longitude: 77.220, address: 'CP Outer Circle Block B' },
        },
      });
      expect(duplicateRes.statusCode).toBe(201);
      const duplicateCandidate = duplicateRes.json().data;

      // Check duplicates
      const checkRes = await app.inject({
        method: 'POST',
        url: '/api/v1/ai/duplicates/check',
        headers: { authorization: `Bearer ${commanderToken}` },
        payload: {
          incidentId: primaryIncident.id,
          candidateIncidentIds: [duplicateCandidate.id],
        },
      });

      expect(checkRes.statusCode).toBe(200);
      const { data } = checkRes.json();
      expect(data.results.length).toBe(1);

      const match = data.results[0];
      expect(match.candidateIncidentId).toBe(duplicateCandidate.id);
      expect(match.spatialDistanceMeters).toBeLessThan(300);
      expect(match.duplicateProbability).toBeGreaterThan(0.70);
      expect(match.matchingEntities).toContain('hazard:building_collapse');
      expect(data.suggestedMerges.length).toBe(1);
    });

    it('penalizes duplicate probability when hazard types conflict', async () => {
      // Create base flood incident
      const floodRes = await app.inject({
        method: 'POST',
        url: '/api/v1/incidents',
        headers: { authorization: `Bearer ${commanderToken}` },
        payload: {
          title: 'Severe Waterlogging at Moolchand Underpass',
          description: 'Water depth 4 feet, underpass submerged.',
          priority: INCIDENT_PRIORITIES.P2_HIGH,
          hazardType: HAZARD_TYPES.FLOOD,
          location: { latitude: 28.567, longitude: 77.234, address: 'Moolchand Underpass' },
        },
      });
      const floodIncident = floodRes.json().data;

      // Create gas leak incident nearby
      const gasRes = await app.inject({
        method: 'POST',
        url: '/api/v1/incidents',
        headers: { authorization: `Bearer ${commanderToken}` },
        payload: {
          title: 'Industrial Gas Cylinder Leak',
          description: 'Hissing noise and pungent sulfur smell from workshop.',
          priority: INCIDENT_PRIORITIES.P1_CRITICAL,
          hazardType: HAZARD_TYPES.GAS_LEAK,
          location: { latitude: 28.568, longitude: 77.235, address: 'Ring Road Workshop' },
        },
      });
      const gasIncident = gasRes.json().data;

      const checkRes = await app.inject({
        method: 'POST',
        url: '/api/v1/ai/duplicates/check',
        headers: { authorization: `Bearer ${commanderToken}` },
        payload: {
          incidentId: floodIncident.id,
          candidateIncidentIds: [gasIncident.id],
        },
      });

      expect(checkRes.statusCode).toBe(200);
      const match = checkRes.json().data.results[0];
      expect(match.conflictingSignals.some((s: string) => s.includes('hazard types'))).toBe(true);
      expect(match.duplicateProbability).toBeLessThan(0.70);
    });
  });

  describe('3. Evidence Fusion & Contradiction Detection Engine', () => {
    it('detects explicit contradictory claims across evidence items and surfaces them with citation IDs', async () => {
      // Create incident
      const incRes = await app.inject({
        method: 'POST',
        url: '/api/v1/incidents',
        headers: { authorization: `Bearer ${commanderToken}` },
        payload: {
          title: 'Flash Flood on Barapullah Corridor',
          description: 'Heavy rain causing traffic disruption.',
          priority: INCIDENT_PRIORITIES.P2_HIGH,
          hazardType: HAZARD_TYPES.FLOOD,
          location: { latitude: 28.581, longitude: 77.241, address: 'Barapullah Flyover' },
        },
      });
      const incident = incRes.json().data;

      // Add Evidence 1: Citizen says road is passable and open
      await app.inject({
        method: 'POST',
        url: '/api/v1/evidence',
        headers: { authorization: `Bearer ${commanderToken}` },
        payload: {
          incidentId: incident.id,
          sourceType: 'citizen',
          mediaType: 'text',
          location: incident.location,
          locationConfidence: 0.8,
          extractionConfidence: 0.85,
          observations: [{ label: 'Flyover is clear and cars passing normally', confidence: 0.85 }],
          contradictionFlags: [],
        },
      });

      // Add Evidence 2: Responder says road is impassable and submerged
      await app.inject({
        method: 'POST',
        url: '/api/v1/evidence',
        headers: { authorization: `Bearer ${commanderToken}` },
        payload: {
          incidentId: incident.id,
          sourceType: 'responder',
          mediaType: 'text',
          location: incident.location,
          locationConfidence: 0.95,
          extractionConfidence: 0.9,
          observations: [{ label: 'Flyover is impassable submerged under 3ft water', confidence: 0.9 }],
          contradictionFlags: [],
        },
      });

      // Execute Fusion
      const fusionRes = await app.inject({
        method: 'POST',
        url: `/api/v1/ai/incidents/${incident.id}/fuse`,
        headers: { authorization: `Bearer ${commanderToken}` },
      });

      expect(fusionRes.statusCode).toBe(200);
      const { data } = fusionRes.json();

      expect(data.fusionResult.unresolvedContradictions.length).toBe(1);
      const contradiction = data.fusionResult.unresolvedContradictions[0];
      expect(contradiction.factor).toBe('road_passability');
      expect(contradiction.claimA).toContain('clear');
      expect(contradiction.claimB).toContain('impassable');

      // AI Decision Trace must cite the evidence IDs
      expect(data.decisionTrace.citedEvidenceIds.length).toBe(2);
      expect(data.decisionTrace.uncertaintyScore).toBeGreaterThan(0.3); // High uncertainty due to contradiction
      expect(data.decisionTrace.factors.some((f: any) => f.name === 'contradiction_clearance')).toBe(true);
    });
  });

  describe('4. Human-in-the-Loop Review Gate & Authorization', () => {
    it('allows commander to approve an AI decision trace with audit log recording', async () => {
      // Find traces
      const incidents = Array.from(dbStore.incidents.values());
      const lastIncident = incidents[incidents.length - 1];

      const tracesRes = await app.inject({
        method: 'GET',
        url: `/api/v1/ai/incidents/${lastIncident.id}/decision-traces`,
        headers: { authorization: `Bearer ${commanderToken}` },
      });

      expect(tracesRes.statusCode).toBe(200);
      const traces = tracesRes.json().data;
      expect(traces.length).toBeGreaterThan(0);
      const traceToReview = traces[0];

      // Commander approves
      const reviewRes = await app.inject({
        method: 'POST',
        url: `/api/v1/ai/decision-traces/${traceToReview.id}/review`,
        headers: { authorization: `Bearer ${commanderToken}` },
        payload: {
          isApproved: true,
          humanOverrideReason: 'Verified on live CCTV feed; dispatched water pump team.',
        },
      });

      expect(reviewRes.statusCode).toBe(200);
      const reviewed = reviewRes.json().data;
      expect(reviewed.isApprovedByHuman).toBe(true);
      expect(reviewed.humanReviewerId).toBe('22222222-2222-2222-2222-222222222222');
      expect(reviewed.humanOverrideReason).toContain('Verified on live CCTV feed');
    });

    it('rejects human review attempt by unauthorized citizen role', async () => {
      const incidents = Array.from(dbStore.incidents.values());
      const lastIncident = incidents[incidents.length - 1];

      const tracesRes = await app.inject({
        method: 'GET',
        url: `/api/v1/ai/incidents/${lastIncident.id}/decision-traces`,
        headers: { authorization: `Bearer ${commanderToken}` },
      });
      const traceId = tracesRes.json().data[0].id;

      const forbiddenRes = await app.inject({
        method: 'POST',
        url: `/api/v1/ai/decision-traces/${traceId}/review`,
        headers: { authorization: `Bearer ${citizenToken}` },
        payload: {
          isApproved: true,
        },
      });

      expect(forbiddenRes.statusCode).toBe(403);
    });
  });
});
