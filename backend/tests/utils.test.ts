import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  signHmacSha256,
  verifyHmacSha256,
  generateIncidentCode,
  generateUUID,
} from '../src/utils/crypto.js';
import { calculateDistanceMeters, isPointNear } from '../src/utils/spatial.js';
import { NotFoundError, UnauthorizedError, ForbiddenError, ValidationError } from '../src/utils/errors.js';

describe('Cryptographic Utilities', () => {
  it('hashes and securely verifies password with scrypt', () => {
    const raw = 'SecureSecretPass123!';
    const hash = hashPassword(raw);

    expect(hash).toContain(':');
    expect(verifyPassword(raw, hash)).toBe(true);
    expect(verifyPassword('WrongPassword', hash)).toBe(false);
  });

  it('signs and verifies HMAC signatures in constant time', () => {
    const payload = JSON.stringify({ deviceId: 'DEV-101', temp: 42.5 });
    const secret = 'super-secret-key-for-test';

    const signature = signHmacSha256(payload, secret);
    expect(verifyHmacSha256(payload, signature, secret)).toBe(true);
    expect(verifyHmacSha256(payload + 'tampered', signature, secret)).toBe(false);
    expect(verifyHmacSha256(payload, signature, 'wrong-secret')).toBe(false);
  });

  it('formats standardized incident codes with current year', () => {
    const code = generateIncidentCode(42);
    const year = new Date().getFullYear();
    expect(code).toBe(`INC-${year}-0042`);
  });

  it('generates valid RFC4122 UUIDs', () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});

describe('Spatial Utilities', () => {
  it('accurately calculates Haversine distance between two coordinates', () => {
    // IIIT-Delhi coordinates: 28.5445, 77.2726
    // Kalkaji Mandir Metro: 28.5495, 77.2588
    const distance = calculateDistanceMeters(28.5445, 77.2726, 28.5495, 77.2588);
    // Approximate distance is ~1450 meters
    expect(distance).toBeGreaterThan(1300);
    expect(distance).toBeLessThan(1600);
  });

  it('correctly evaluates proximity threshold', () => {
    const locA = { latitude: 28.544, longitude: 77.272 };
    const locNear = { latitude: 28.5445, longitude: 77.2722 }; // ~60m away
    const locFar = { latitude: 28.56, longitude: 77.29 }; // >2km away

    expect(isPointNear(locA, locNear, 200)).toBe(true);
    expect(isPointNear(locA, locFar, 500)).toBe(false);
  });
});

describe('Error Classes', () => {
  it('creates proper operational error instances with HTTP status codes', () => {
    const notFound = new NotFoundError('Incident not found');
    expect(notFound.statusCode).toBe(404);
    expect(notFound.code).toBe('NOT_FOUND');
    expect(notFound.isOperational).toBe(true);

    const unauth = new UnauthorizedError();
    expect(unauth.statusCode).toBe(401);

    const forbidden = new ForbiddenError();
    expect(forbidden.statusCode).toBe(403);

    const valErr = new ValidationError('Bad payload', { field: 'email' });
    expect(valErr.statusCode).toBe(400);
    expect(valErr.details).toEqual({ field: 'email' });
  });
});
