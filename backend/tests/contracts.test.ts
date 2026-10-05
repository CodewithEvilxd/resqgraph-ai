import { describe, it, expect } from 'vitest';
import { createIncidentSchema } from '../src/contracts/schemas/incident.schema.js';
import { loginSchema, registerSchema } from '../src/contracts/schemas/auth.schema.js';
import { createReportSchema } from '../src/contracts/schemas/report.schema.js';
import { INCIDENT_PRIORITIES, HAZARD_TYPES, SOURCE_TYPES } from '../src/contracts/constants/priorities.js';
import { USER_ROLES } from '../src/contracts/constants/roles.js';

describe('Contracts Schema Validation', () => {
  it('validates a correct incident creation payload', () => {
    const valid = {
      title: 'Structural Building Collapse',
      description: 'South wing of commercial building collapsed following explosion. Trapped occupants reported.',
      priority: INCIDENT_PRIORITIES.P1_CRITICAL,
      hazardType: HAZARD_TYPES.COLLAPSE,
      location: {
        latitude: 28.544,
        longitude: 77.272,
        address: 'Okhla Industrial Area',
      },
      affectedPeopleEstimate: 20,
    };

    const parsed = createIncidentSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects incident creation with invalid latitude/longitude', () => {
    const invalid = {
      title: 'Flash Flood Emergency',
      description: 'Water levels rising rapidly',
      priority: INCIDENT_PRIORITIES.P2_HIGH,
      hazardType: HAZARD_TYPES.FLOOD,
      location: {
        latitude: 195.0, // Invalid: exceeds 90
        longitude: 77.272,
      },
    };

    const parsed = createIncidentSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('validates report creation with source types', () => {
    const valid = {
      sourceType: SOURCE_TYPES.CITIZEN,
      rawContent: 'Road completely inundated near metro pillar 142',
      location: {
        latitude: 28.541,
        longitude: 77.27,
      },
    };

    const parsed = createReportSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('validates user registration payload', () => {
    const valid = {
      email: 'responder2@resqgraph.local',
      password: 'StrongPassword123!',
      fullName: 'Rahul Verma',
      organizationId: '00000000-0000-0000-0000-000000000001',
      role: USER_ROLES.RESPONDER,
    };

    const parsed = registerSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects short passwords in login schema', () => {
    const invalid = {
      email: 'user@example.com',
      password: '123',
    };

    const parsed = loginSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});
