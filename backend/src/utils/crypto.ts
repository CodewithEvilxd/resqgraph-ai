import crypto from 'crypto';

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function generateIncidentCode(sequenceNum: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequenceNum).padStart(4, '0');
  return `INC-${year}-${padded}`;
}

export function signHmacSha256(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifyHmacSha256(payload: string, signature: string, secret: string): boolean {
  const expected = signHmacSha256(payload, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export function hashSha256(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derivedKey, 'hex'));
  } catch {
    return false;
  }
}

export function signJwt(payload: Record<string, unknown>, secret: string, expiresInSec: number = 86400): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSec;
  const iat = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat, exp };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');

  return `${b64Header}.${b64Payload}.${signature}`;
}

export function verifyJwt<T = Record<string, unknown>>(token: string, secret: string): T {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token structure');
  }
  const [b64Header, b64Payload, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', secret)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error('Invalid token signature');
  }

  const payloadStr = Buffer.from(b64Payload, 'base64url').toString('utf8');
  const payload = JSON.parse(payloadStr) as T & { exp?: number };
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error('Token has expired');
  }
  return payload;
}

