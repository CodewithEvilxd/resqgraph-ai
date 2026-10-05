import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

describe('API Foundation & Health Endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200 with service metadata', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('resqgraph-backend');
    expect(typeof body.uptimeSeconds).toBe('number');
  });

  it('GET /ready returns 200 with database health status', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/ready',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ready');
    expect(body.database.connected).toBe(true);
    expect(typeof body.system.heapUsedMb).toBe('number');
  });

  it('POST /api/v1/auth/login succeeds with valid seed credentials', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'admin@resqgraph.local',
        password: 'Password123!',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.user.role).toBe('admin');
    expect(typeof body.data.token).toBe('string');
  });

  it('POST /api/v1/auth/login fails with invalid password', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'admin@resqgraph.local',
        password: 'WrongPassword999!',
      },
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/v1/auth/me rejects unauthenticated request', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
    });

    expect(res.statusCode).toBe(401);
  });

  it('GET /api/v1/auth/me returns current user when authenticated', async () => {
    // 1. Login
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'commander@resqgraph.local',
        password: 'Password123!',
      },
    });
    const token = loginRes.json().data.token;

    // 2. Fetch profile
    const profileRes = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(profileRes.statusCode).toBe(200);
    const body = profileRes.json();
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe('commander@resqgraph.local');
    expect(body.data.user.role).toBe('commander');
    expect(body.data.organization.code).toBe('DEMA-NCR');
  });

  it('POST /api/v1/storage/presigned-url generates valid evidence upload credentials', async () => {
    // Authenticate commander
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'commander@resqgraph.local', password: 'Password123!' },
    });
    const token = loginRes.json().data.token;

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/storage/presigned-url',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        incidentId: '11111111-1111-1111-1111-111111111111',
        mimeType: 'image/jpeg',
        fileSizeBytes: 2048576,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.uploadUrl).toBeDefined();
    expect(body.data.publicUrl).toBeDefined();
    expect(body.data.storageKey).toContain('incident-evidence');
    expect(body.data.expiresInSeconds).toBe(900);
  });

  it('GET /api/v1/realtime/events returns replay event buffer for authenticated client', async () => {
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'commander@resqgraph.local', password: 'Password123!' },
    });
    const token = loginRes.json().data.token;

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/realtime/events',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('manages operational resources and enforces role authorization', async () => {
    // 1. Authenticate Commander
    const cmdLogin = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'commander@resqgraph.local', password: 'Password123!' },
    });
    const cmdToken = cmdLogin.json().data.token;

    // 2. Authenticate Citizen
    const citLogin = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'citizen1@resqgraph.local', password: 'Password123!' },
    });
    const citToken = citLogin.json().data.token;

    // 3. Citizen cannot create resource (403 Forbidden)
    const forbiddenRes = await app.inject({
      method: 'POST',
      url: '/api/v1/resources',
      headers: { authorization: `Bearer ${citToken}` },
      payload: {
        name: 'Unauthorized Drone',
        category: 'drone',
        quantity: 1,
        availableQuantity: 1,
      },
    });
    expect(forbiddenRes.statusCode).toBe(403);

    // 4. Commander successfully registers emergency resource
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/resources',
      headers: { authorization: `Bearer ${cmdToken}` },
      payload: {
        name: 'Thermal Drone Recon Unit X',
        category: 'drone',
        quantity: 2,
        availableQuantity: 2,
        location: { latitude: 28.632, longitude: 77.219 },
      },
    });
    expect(createRes.statusCode).toBe(201);
    const created = createRes.json().data;
    expect(created.name).toBe('Thermal Drone Recon Unit X');

    // 5. List resources includes the newly created resource
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/resources',
      headers: { authorization: `Bearer ${cmdToken}` },
    });
    expect(listRes.statusCode).toBe(200);
    const items = listRes.json().data;
    expect(items.some((r: { name: string }) => r.name === 'Thermal Drone Recon Unit X')).toBe(true);
  });
});
