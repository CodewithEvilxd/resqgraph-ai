import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { generateUUID, hashPassword } from '../utils/crypto.js';
import { Incident } from '../contracts/types/incident.js';
import { Report } from '../contracts/types/report.js';
import { Evidence } from '../contracts/types/evidence.js';
import { User } from '../contracts/types/user.js';
import { Team, Responder, Resource, Assignment } from '../contracts/types/responder.js';
import { RoadSegment } from '../contracts/types/route.js';
import { Device, DeviceEvent } from '../contracts/types/device.js';
import { AIDecisionTrace } from '../contracts/types/ai.js';
import { AuditEvent } from '../contracts/types/audit.js';
import { Alert } from '../contracts/types/alert.js';

interface PgPoolLike {
  query<R = unknown>(text: string, params?: unknown[]): Promise<{ rows: R[]; rowCount?: number | null }>;
}

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

// In-Memory store for tests and zero-config local run
export interface DatabaseStore {
  organizations: Map<string, { id: string; name: string; code: string }>;
  users: Map<string, User & { passwordHash: string }>;
  incidents: Map<string, Incident>;
  reports: Map<string, Report>;
  evidence: Map<string, Evidence>;
  teams: Map<string, Team>;
  responders: Map<string, Responder>;
  resources: Map<string, Resource>;
  roads: Map<string, RoadSegment>;
  assignments: Map<string, Assignment>;
  decisionTraces: Map<string, AIDecisionTrace>;
  devices: Map<string, Device>;
  deviceEvents: Map<string, DeviceEvent>;
  alerts: Map<string, Alert>;
  auditEvents: AuditEvent[];
  idempotencyKeys: Map<string, { operationName: string; responsePayload: unknown; createdAt: string }>;
}

export const dbStore: DatabaseStore = {
  organizations: new Map(),
  users: new Map(),
  incidents: new Map(),
  reports: new Map(),
  evidence: new Map(),
  teams: new Map(),
  responders: new Map(),
  resources: new Map(),
  roads: new Map(),
  assignments: new Map(),
  decisionTraces: new Map(),
  devices: new Map(),
  deviceEvents: new Map(),
  alerts: new Map(),
  auditEvents: [],
  idempotencyKeys: new Map(),
};

// Seed default in-memory state with demo fixtures
export function initInMemorySeed(): void {
  const orgId = '00000000-0000-0000-0000-000000000001';
  dbStore.organizations.set(orgId, {
    id: orgId,
    name: 'Delhi Emergency Management Authority',
    code: 'DEMA-NCR',
  });

  const defaultPasswordHash = hashPassword('Password123!');

  const demoUsers: Array<User & { passwordHash: string }> = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      organizationId: orgId,
      email: 'admin@resqgraph.local',
      passwordHash: defaultPasswordHash,
      fullName: 'System Administrator',
      role: 'admin',
      phone: '+91-9876543210',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      organizationId: orgId,
      email: 'commander@resqgraph.local',
      passwordHash: defaultPasswordHash,
      fullName: 'Col. Rajiv Sharma',
      role: 'commander',
      phone: '+91-9876543211',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      organizationId: orgId,
      email: 'dispatcher@resqgraph.local',
      passwordHash: defaultPasswordHash,
      fullName: 'Anita Rao',
      role: 'dispatcher',
      phone: '+91-9876543212',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      organizationId: orgId,
      email: 'responder1@resqgraph.local',
      passwordHash: defaultPasswordHash,
      fullName: 'Vikas Singh',
      role: 'responder',
      phone: '+91-9876543213',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      organizationId: orgId,
      email: 'citizen1@resqgraph.local',
      passwordHash: defaultPasswordHash,
      fullName: 'Meera Patel',
      role: 'citizen',
      phone: '+91-9876543214',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  demoUsers.forEach((u) => dbStore.users.set(u.id, u));

  // Demo Team & Responder
  // Demo Teams & Responders (Multi-Agency DEMA Grid)
  const team1Id = '66666666-6666-6666-6666-666666666661';
  dbStore.teams.set(team1Id, {
    id: team1Id,
    organizationId: orgId,
    name: 'Rapid Water Rescue Unit Alpha',
    category: 'rescue',
    status: 'available',
    memberCount: 5,
    currentLocation: { latitude: 28.5450, longitude: 77.2710 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const team2Id = '66666666-6666-6666-6666-666666666662';
  dbStore.teams.set(team2Id, {
    id: team2Id,
    organizationId: orgId,
    name: 'Delhi Fire Service HazMat Tender 07',
    category: 'fire',
    status: 'assigned',
    memberCount: 6,
    currentLocation: { latitude: 28.5350, longitude: 77.2850 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const team3Id = '66666666-6666-6666-6666-666666666663';
  dbStore.teams.set(team3Id, {
    id: team3Id,
    organizationId: orgId,
    name: 'Disaster Medical Assistance Team (DMAT-1)',
    category: 'medical',
    status: 'available',
    memberCount: 4,
    currentLocation: { latitude: 28.5600, longitude: 77.2400 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const team4Id = '66666666-6666-6666-6666-666666666664';
  dbStore.teams.set(team4Id, {
    id: team4Id,
    organizationId: orgId,
    name: 'Civil Defence Drone Recon Squad 04',
    category: 'drone',
    status: 'available',
    memberCount: 3,
    currentLocation: { latitude: 28.5480, longitude: 77.2660 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const teamId = team1Id;

  // Responders Roster
  const resp1Id = '77777777-7777-7777-7777-777777777771';
  dbStore.responders.set(resp1Id, {
    id: resp1Id,
    userId: '44444444-4444-4444-4444-444444444444',
    organizationId: orgId,
    teamId: team1Id,
    badgeNumber: 'BADGE-DEMA-401',
    capabilities: ['flood_rescue', 'first_aid', 'boat_operation'],
    status: 'available',
    currentLocation: { latitude: 28.5455, longitude: 77.2715 },
    batteryLevel: 92,
    lastSeenAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const resp2Id = '77777777-7777-7777-7777-777777777772';
  dbStore.responders.set(resp2Id, {
    id: resp2Id,
    userId: '11111111-1111-1111-1111-111111111111',
    organizationId: orgId,
    teamId: team2Id,
    badgeNumber: 'BADGE-DFS-108',
    capabilities: ['hazmat_containment', 'chemical_suppression', 'breathing_apparatus'],
    status: 'assigned',
    currentLocation: { latitude: 28.5355, longitude: 77.2845 },
    batteryLevel: 88,
    lastSeenAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const resp3Id = '77777777-7777-7777-7777-777777777773';
  dbStore.responders.set(resp3Id, {
    id: resp3Id,
    userId: '22222222-2222-2222-2222-222222222222',
    organizationId: orgId,
    teamId: team3Id,
    badgeNumber: 'BADGE-MED-220',
    capabilities: ['trauma_triage', 'resuscitation', 'advanced_life_support'],
    status: 'available',
    currentLocation: { latitude: 28.5590, longitude: 77.2410 },
    batteryLevel: 95,
    lastSeenAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const resp4Id = '77777777-7777-7777-7777-777777777774';
  dbStore.responders.set(resp4Id, {
    id: resp4Id,
    userId: '33333333-3333-3333-3333-333333333333',
    organizationId: orgId,
    teamId: team4Id,
    badgeNumber: 'BADGE-UAV-04',
    capabilities: ['flir_thermal', 'photogrammetry', 'rf_mesh_repeater'],
    status: 'available',
    currentLocation: { latitude: 28.5442, longitude: 77.2735 },
    batteryLevel: 78,
    lastSeenAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const responderId = resp1Id;

  // Demo Incidents
  const inc1Id = '99999999-9999-9999-9999-999999999991';
  dbStore.incidents.set(inc1Id, {
    id: inc1Id,
    organizationId: orgId,
    code: 'INC-2026-0001',
    title: 'Urban Flash Flood & Road Inundation',
    description: 'Rapid water accumulation under railway underpass blocking vehicles. Multiple commuters stranded on vehicle roofs.',
    status: 'active',
    priority: 'P1_CRITICAL',
    hazardType: 'flood',
    confidenceScore: 0.95,
    location: {
      latitude: 28.5440,
      longitude: 77.2730,
      address: 'Underpass Road, Okhla Phase 1',
      landmark: 'Near Kalkaji Metro Station',
    },
    affectedPeopleEstimate: 15,
    reporterCount: 4,
    evidenceCount: 3,
    verifiedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const inc2Id = '99999999-9999-9999-9999-999999999992';
  dbStore.incidents.set(inc2Id, {
    id: inc2Id,
    organizationId: orgId,
    code: 'INC-2026-0002',
    title: 'Commercial Warehouse Fire',
    description: 'Dense smoke billowing from chemical packaging warehouse. No confirmed casualties, structural integrity compromised.',
    status: 'verified',
    priority: 'P2_HIGH',
    hazardType: 'fire',
    confidenceScore: 0.88,
    location: {
      latitude: 28.5350,
      longitude: 77.2850,
      address: 'Plot 42, Industrial Area Phase 2',
      landmark: 'Opposite Mother Dairy Plant',
    },
    affectedPeopleEstimate: 0,
    reporterCount: 2,
    evidenceCount: 2,
    verifiedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Demo Road Segment
  const roadId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  dbStore.roads.set(roadId, {
    id: roadId,
    name: 'Okhla Underpass Main Road',
    status: 'flooded',
    blockedReason: 'Water level exceeding 1.2 meters',
    hazardType: 'flood',
    startPoint: { latitude: 28.5430, longitude: 77.2700 },
    endPoint: { latitude: 28.5450, longitude: 77.2750 },
    lengthMeters: 650,
    speedLimitKmh: 30,
    reportedAt: new Date().toISOString(),
  });

  // Seed Operational Alerts
  const alert1Id = '77777777-1111-2222-3333-444444444441';
  dbStore.alerts.set(alert1Id, {
    id: alert1Id,
    organizationId: orgId,
    title: 'Yamuna Floodplain Evacuation Advisory',
    severity: 'CRITICAL',
    targetArea: 'Yamuna Bank & Mayur Vihar Floodplain Sector',
    message: 'Water levels exceeding danger mark (3.8m). Residents in low-lying relief shelters must evacuate immediately to higher ground.',
    isActive: true,
    issuedByUserId: '22222222-2222-2222-2222-222222222222',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  });

  const alert2Id = '77777777-1111-2222-3333-444444444442';
  dbStore.alerts.set(alert2Id, {
    id: alert2Id,
    organizationId: orgId,
    title: 'NH-44 Bypass Hazard Road Closure',
    severity: 'WARNING',
    targetArea: 'NH-44 Corridor Km 12-16',
    message: 'Underpass inundated. Non-emergency vehicles detour via Outer Ring Road & Salimgarh bypass.',
    isActive: true,
    issuedByUserId: '22222222-2222-2222-2222-222222222222',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  });

  // Seed AI Decision Traces
  const trace1Id = '88888888-1111-2222-3333-444444444441';
  dbStore.decisionTraces.set(trace1Id, {
    id: trace1Id,
    incidentId: inc1Id,
    recommendationType: 'priority_assignment',
    recommendedAction: 'P1_CRITICAL',
    confidenceScore: 0.94,
    uncertaintyScore: 0.06,
    factors: [
      { name: 'Hazard Lethality', weight: 0.35, score: 0.95, evidenceReferenceIds: [], explanation: 'Water level at 3.8m exceeding safe thresholds' },
      { name: 'Human Exposure', weight: 0.30, score: 0.90, evidenceReferenceIds: [], explanation: '15 stranded commuters on submerged roofs' },
      { name: 'Temporal Escalation', weight: 0.20, score: 0.85, evidenceReferenceIds: [], explanation: 'Monsoon inflow increasing 10cm every 15min' },
      { name: 'Evidence Corroboration', weight: 0.15, score: 0.98, evidenceReferenceIds: [], explanation: 'Triangulated across 4 citizen reports and gauge' },
    ],
    citedEvidenceIds: [],
    provider: 'google',
    model: 'gemini-2.0-flash',
    modelVersion: '1.0.0',
    latencyMs: 42,
    isApprovedByHuman: true,
    humanReviewerId: '22222222-2222-2222-2222-222222222222',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  });

  const trace2Id = '88888888-1111-2222-3333-444444444442';
  dbStore.decisionTraces.set(trace2Id, {
    id: trace2Id,
    incidentId: inc2Id,
    recommendationType: 'resource_dispatch',
    recommendedAction: 'Dispatch Rapid Water Rescue Unit Alpha',
    confidenceScore: 0.88,
    uncertaintyScore: 0.12,
    factors: [
      { name: 'Capability Match', weight: 0.40, score: 1.0, evidenceReferenceIds: [], explanation: 'Motorized inflatable boats and certified divers' },
      { name: 'Proximity', weight: 0.30, score: 0.92, evidenceReferenceIds: [], explanation: '1.4 km from target underpass' },
      { name: 'Operational Readiness', weight: 0.30, score: 0.85, evidenceReferenceIds: [], explanation: 'Available status with 100% fuel' },
    ],
    citedEvidenceIds: [],
    provider: 'google',
    model: 'gemini-2.0-flash',
    modelVersion: '1.0.0',
    latencyMs: 38,
    isApprovedByHuman: false,
    createdAt: new Date(Date.now() - 900000).toISOString(),
  });

  // Seed Operational Reports
  const rep1Id = 'aaaaaaaa-1111-2222-3333-000000000001';
  dbStore.reports.set(rep1Id, {
    id: rep1Id,
    incidentId: inc1Id,
    organizationId: orgId,
    authorId: '55555555-5555-5555-5555-555555555555',
    sourceType: 'citizen',
    rawContent: 'Water rapidly accumulating under the railway underpass. Multiple cars completely submerged and at least 15 commuters stranded on vehicle roofs!',
    location: {
      latitude: 28.5440,
      longitude: 77.2730,
      address: 'Underpass Road, Okhla Phase 1',
      landmark: 'Near Kalkaji Metro Station',
    },
    extraction: {
      hazardType: 'flood',
      suggestedPriority: 'P1_CRITICAL',
      peopleAffected: 15,
      urgencyKeywords: ['submerged', 'stranded', 'trapped on roofs'],
      hazardsIdentified: ['deep water', 'electrical short circuit risk'],
      accessibilityNotes: 'South access completely blocked by 1.2m water',
      confidence: 0.95,
    },
    isVerified: true,
    verifiedByUserId: '22222222-2222-2222-2222-222222222222',
    createdAt: new Date(Date.now() - 1700000).toISOString(),
    updatedAt: new Date(Date.now() - 1650000).toISOString(),
  });

  const rep2Id = 'aaaaaaaa-1111-2222-3333-000000000002';
  dbStore.reports.set(rep2Id, {
    id: rep2Id,
    incidentId: inc2Id,
    organizationId: orgId,
    sourceType: 'citizen',
    rawContent: 'Thick black smoke billowing from packaging warehouse on Plot 42. Structural integrity compromised, personnel currently assembling at muster point.',
    location: {
      latitude: 28.5350,
      longitude: 77.2850,
      address: 'Plot 42, Industrial Area Phase 2',
      landmark: 'Opposite Mother Dairy Plant',
    },
    extraction: {
      hazardType: 'fire',
      suggestedPriority: 'P2_HIGH',
      peopleAffected: 0,
      urgencyKeywords: ['thick black smoke', 'structural integrity compromised'],
      hazardsIdentified: ['combustible plastics', 'dense smoke inhalation'],
      accessibilityNotes: 'Main entry gate accessible from eastern approach',
      confidence: 0.89,
    },
    isVerified: true,
    verifiedByUserId: '22222222-2222-2222-2222-222222222222',
    createdAt: new Date(Date.now() - 3500000).toISOString(),
    updatedAt: new Date(Date.now() - 3400000).toISOString(),
  });

  const rep3Id = 'aaaaaaaa-1111-2222-3333-000000000003';
  dbStore.reports.set(rep3Id, {
    id: rep3Id,
    incidentId: inc1Id,
    organizationId: orgId,
    sourceType: 'citizen',
    rawContent: 'Kashmere Gate underpass is completely clear. Vehicles driving through at normal speed.',
    location: {
      latitude: 28.5440,
      longitude: 77.2730,
      address: 'Underpass Road, Okhla Phase 1',
    },
    extraction: {
      hazardType: 'flood',
      suggestedPriority: 'P3_MEDIUM',
      peopleAffected: 0,
      urgencyKeywords: ['clear', 'driving through'],
      hazardsIdentified: [],
      confidence: 0.62,
    },
    isVerified: false,
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
  });

  const rep4Id = 'aaaaaaaa-1111-2222-3333-000000000004';
  dbStore.reports.set(rep4Id, {
    id: rep4Id,
    incidentId: inc2Id,
    organizationId: orgId,
    sourceType: 'citizen',
    rawContent: 'Emergency caller claims at least 12 workers are trapped inside chemical packaging room!',
    location: {
      latitude: 28.5350,
      longitude: 77.2850,
      address: 'Plot 42, Industrial Area Phase 2',
    },
    extraction: {
      hazardType: 'fire',
      suggestedPriority: 'P1_CRITICAL',
      peopleAffected: 12,
      urgencyKeywords: ['12 workers trapped', 'chemical room'],
      hazardsIdentified: ['flammable solvent', 'entrapped workers'],
      confidence: 0.55,
    },
    isVerified: false,
    createdAt: new Date(Date.now() - 800000).toISOString(),
    updatedAt: new Date(Date.now() - 800000).toISOString(),
  });

  // Seed Operational Evidence Items
  const ev1Id = 'bbbbbbbb-1111-2222-3333-000000000001';
  dbStore.evidence.set(ev1Id, {
    id: ev1Id,
    incidentId: inc1Id,
    reportId: rep1Id,
    organizationId: orgId,
    sourceType: 'cctv_vision',
    mediaType: 'video',
    mediaUrl: 'https://storage.resqgraph.local/telemetry/drone-fl-01.mp4',
    mimeType: 'video/mp4',
    location: { latitude: 28.5440, longitude: 77.2730 },
    locationConfidence: 0.98,
    extractionConfidence: 0.96,
    observations: [
      { label: 'Submerged sedan with water level at 1.2m depth', confidence: 0.96 },
      { label: '15 stranded commuters on roofs of commercial vehicles', confidence: 0.94 },
    ],
    contradictionFlags: ['passability_conflict: drone footage shows underpass fully blocked vs citizen claim of clear passability'],
    isVerified: true,
    verifiedByUserId: '22222222-2222-2222-2222-222222222222',
    createdAt: new Date(Date.now() - 1500000).toISOString(),
    updatedAt: new Date(Date.now() - 1500000).toISOString(),
  });

  const ev2Id = 'bbbbbbbb-1111-2222-3333-000000000002';
  dbStore.evidence.set(ev2Id, {
    id: ev2Id,
    incidentId: inc1Id,
    organizationId: orgId,
    sourceType: 'iot_device',
    mediaType: 'sensor_telemetry',
    location: { latitude: 28.5442, longitude: 77.2732 },
    locationConfidence: 1.0,
    extractionConfidence: 0.99,
    observations: [
      { label: 'Ultrasonic flood gauge level 3.82m (danger limit: 3.00m)', confidence: 0.99 },
    ],
    contradictionFlags: [],
    isVerified: true,
    verifiedByUserId: '22222222-2222-2222-2222-222222222222',
    createdAt: new Date(Date.now() - 1400000).toISOString(),
    updatedAt: new Date(Date.now() - 1400000).toISOString(),
  });

  const ev3Id = 'bbbbbbbb-1111-2222-3333-000000000003';
  dbStore.evidence.set(ev3Id, {
    id: ev3Id,
    incidentId: inc2Id,
    organizationId: orgId,
    sourceType: 'responder',
    mediaType: 'text',
    location: { latitude: 28.5350, longitude: 77.2850 },
    locationConfidence: 0.95,
    extractionConfidence: 0.92,
    observations: [
      { label: 'Plant safety manager confirms all 48 workers accounted for at muster point', confidence: 0.95 },
    ],
    contradictionFlags: ['casualty_count_discrepancy: hotline call claimed 12 trapped workers vs on-scene muster roll of 0 casualties'],
    isVerified: true,
    verifiedByUserId: '22222222-2222-2222-2222-222222222222',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString(),
  });

  // Seed IoT Edge Nodes (HMAC-SHA256 authenticated)
  const dev1Id = 'cccccccc-1111-2222-3333-000000000001';
  dbStore.devices.set(dev1Id, {
    id: dev1Id,
    hardwareUid: 'NODE-FL-01',
    organizationId: orgId,
    name: 'Yamuna River Ultrasonic Flood Gauge',
    deviceType: 'environmental_sensor',
    firmwareVersion: 'v2.4.1',
    batteryPercentage: 94,
    lastHeartbeatAt: new Date().toISOString(),
    status: 'online',
    assignedLocation: { latitude: 28.5442, longitude: 77.2732, address: 'Okhla Gauge Station' },
    isRevoked: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const dev2Id = 'cccccccc-1111-2222-3333-000000000002';
  dbStore.devices.set(dev2Id, {
    id: dev2Id,
    hardwareUid: 'NODE-SM-04',
    organizationId: orgId,
    name: 'Industrial Area Optical Smoke Detector',
    deviceType: 'environmental_sensor',
    firmwareVersion: 'v1.8.0',
    batteryPercentage: 88,
    lastHeartbeatAt: new Date().toISOString(),
    status: 'online',
    assignedLocation: { latitude: 28.5352, longitude: 77.2848, address: 'Industrial Perimeter Gate 3' },
    isRevoked: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const dev3Id = 'cccccccc-1111-2222-3333-000000000003';
  dbStore.devices.set(dev3Id, {
    id: dev3Id,
    hardwareUid: 'NODE-TR-09',
    organizationId: orgId,
    name: 'Rescue Unit Alpha Vehicle GPS Beacon',
    deviceType: 'beacon',
    firmwareVersion: 'v3.0.2',
    batteryPercentage: 91,
    lastHeartbeatAt: new Date().toISOString(),
    status: 'online',
    assignedLocation: { latitude: 28.5455, longitude: 77.2715, address: 'Vehicle Craft Alpha' },
    isRevoked: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Seed Physical Resources & Equipment
  const res1Id = 'dddddddd-1111-2222-3333-000000000001';
  dbStore.resources.set(res1Id, {
    id: res1Id,
    organizationId: orgId,
    name: 'Inflatable Motorized Rescue Craft (4-Person)',
    category: 'rescue',
    quantity: 4,
    availableQuantity: 3,
    location: { latitude: 28.5450, longitude: 77.2710, address: 'Okhla Rescue Depot' },
    isDeployable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const res2Id = 'dddddddd-1111-2222-3333-000000000002';
  dbStore.resources.set(res2Id, {
    id: res2Id,
    organizationId: orgId,
    name: 'High-Capacity Dewatering Pump 1200L/min',
    category: 'heavy_equipment',
    quantity: 6,
    availableQuantity: 5,
    location: { latitude: 28.5500, longitude: 77.2650, address: 'South Delhi Water Works' },
    isDeployable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const res3Id = 'dddddddd-1111-2222-3333-000000000003';
  dbStore.resources.set(res3Id, {
    id: res3Id,
    organizationId: orgId,
    name: 'Thermal Aerial Inspection Drone',
    category: 'drone',
    quantity: 3,
    availableQuantity: 2,
    location: { latitude: 28.5440, longitude: 77.2730, address: 'Forward Command Vehicle' },
    isDeployable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const res4Id = 'dddddddd-1111-2222-3333-000000000004';
  dbStore.resources.set(res4Id, {
    id: res4Id,
    organizationId: orgId,
    name: 'Emergency Heavy Generator 50kVA',
    category: 'heavy_equipment',
    quantity: 2,
    availableQuantity: 2,
    location: { latitude: 28.5300, longitude: 77.2600, address: 'Central Supply Depot' },
    isDeployable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Seed Operational Assignments
  const asg1Id = 'eeeeeeee-1111-2222-3333-000000000001';
  dbStore.assignments.set(asg1Id, {
    id: asg1Id,
    incidentId: inc1Id,
    organizationId: orgId,
    teamId,
    responderId,
    status: 'en_route',
    approvedByUserId: '22222222-2222-2222-2222-222222222222',
    approvalReason: 'Emergency rescue needed for stranded commuters on submerged roofs',
    dispatchedAt: new Date(Date.now() - 1200000).toISOString(),
    createdAt: new Date(Date.now() - 1250000).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const asg2Id = 'eeeeeeee-1111-2222-3333-000000000002';
  dbStore.assignments.set(asg2Id, {
    id: asg2Id,
    incidentId: inc2Id,
    organizationId: orgId,
    teamId,
    status: 'dispatched',
    approvedByUserId: '22222222-2222-2222-2222-222222222222',
    approvalReason: 'Establish hazard perimeter and coordinate with local fire brigade',
    dispatchedAt: new Date(Date.now() - 2400000).toISOString(),
    createdAt: new Date(Date.now() - 2450000).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Seed Extra Road Corridors
  const road2Id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab';
  dbStore.roads.set(road2Id, {
    id: road2Id,
    name: 'Kashmere Gate Ring Road Corridor',
    status: 'flooded',
    blockedReason: 'Water level at 1.4m depth under Metro viaduct',
    hazardType: 'flood',
    startPoint: { latitude: 28.6650, longitude: 77.2280 },
    endPoint: { latitude: 28.6700, longitude: 77.2300 },
    lengthMeters: 800,
    speedLimitKmh: 40,
    reportedAt: new Date().toISOString(),
  });

  const road3Id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac';
  dbStore.roads.set(road3Id, {
    id: road3Id,
    name: 'Mayur Vihar Substation Approach Road',
    status: 'closed',
    blockedReason: '11kV live transformer fire perimeter cordon',
    hazardType: 'fire',
    startPoint: { latitude: 28.6000, longitude: 77.2900 },
    endPoint: { latitude: 28.6050, longitude: 77.2930 },
    lengthMeters: 450,
    speedLimitKmh: 30,
    reportedAt: new Date().toISOString(),
  });

  // Seed Initial Merkle Audit Events
  dbStore.auditEvents.push(
    {
      id: 'aud-2026-0001',
      organizationId: orgId,
      action: 'user:login',
      targetEntity: 'organization',
      targetEntityId: orgId,
      userId: '22222222-2222-2222-2222-222222222222',
      userEmail: 'commander@resqgraph.local',
      userRole: 'commander',
      details: {
        event: 'Emergency Command Grid Initialized',
        node: 'NCR-ALPHA-NODE-01',
        defcon: 'DEFCON_2',
        hmacProtocol: 'SHA256',
      },
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'aud-2026-0002',
      organizationId: orgId,
      action: 'incident:status_change',
      targetEntity: 'incident',
      targetEntityId: inc1Id,
      userId: '22222222-2222-2222-2222-222222222222',
      userEmail: 'commander@resqgraph.local',
      userRole: 'commander',
      details: {
        code: 'INC-2026-0001',
        priority: 'P1_CRITICAL',
        corroboration: 'Ultrasonic Gauge FL-01 + 4 Citizen Calls',
      },
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'aud-2026-0003',
      organizationId: orgId,
      action: 'device:register',
      targetEntity: 'device',
      targetEntityId: dev1Id,
      userId: 'system',
      userEmail: 'iot-gateway@resqgraph.local',
      userRole: 'dispatcher',
      details: {
        hardwareUid: 'NODE-FL-01',
        waterLevel: '3.82m',
        hmacStatus: 'VERIFIED',
      },
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    {
      id: 'aud-2026-0004',
      organizationId: orgId,
      action: 'assignment:create',
      targetEntity: 'assignment',
      targetEntityId: asg1Id,
      userId: '22222222-2222-2222-2222-222222222222',
      userEmail: 'commander@resqgraph.local',
      userRole: 'commander',
      details: {
        unit: 'Rapid Water Rescue Unit Alpha',
        incident: 'INC-2026-0001',
        authorizedBy: 'Col. Rajiv Sharma',
      },
      timestamp: new Date(Date.now() - 1200000).toISOString(),
    }
  );
}

// Initialize seed on module load
initInMemorySeed();

let pool: PgPoolLike | null = null;
if (env.DATABASE_URL) {
  logger.info('Database URL detected, using PostgreSQL client when connected');
} else {
  logger.info('No DATABASE_URL configured; running with transactional in-memory store and PostGIS mock');
}

export async function query<T>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
  if (pool) {
    const res = await pool.query<T>(text, params);
    return {
      rows: res.rows,
      rowCount: res.rowCount ?? 0,
    };
  }

  return {
    rows: [],
    rowCount: 0,
  };
}


export async function healthCheck(): Promise<{
  connected: boolean;
  provider: 'postgres' | 'in_memory';
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  if (pool) {
    try {
      await pool.query('SELECT 1');
      return {
        connected: true,
        provider: 'postgres',
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      return {
        connected: false,
        provider: 'postgres',
        latencyMs: Date.now() - start,
        error: (err as Error).message,
      };
    }
  }

  return {
    connected: true,
    provider: 'in_memory',
    latencyMs: Date.now() - start,
  };
}

export { generateUUID };
