import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  APP_BASE_URL: z.string().default('http://localhost:3000'),
  API_BASE_URL: z.string().default('http://localhost:4000'),
  
  // Database / Supabase
  DATABASE_URL: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // Security
  JWT_SECRET: z.string().default('resqgraph-dev-secret-key-change-in-prod-min-32-chars-long!'),
  DEVICE_SIGNING_SECRET: z.string().default('device-signing-secret-dev-mode'),
  WEBHOOK_SIGNING_SECRET: z.string().default('webhook-signing-secret-dev-mode'),
  DEVICE_ISSUER: z.string().default('resqgraph-edge-network'),
  
  // AI Provider adapters
  AI_PRIMARY_PROVIDER: z.string().default('mock'),
  AI_PRIMARY_API_KEY: z.string().optional(),
  AI_FALLBACK_PROVIDER: z.string().default('mock'),
  AI_FALLBACK_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  
  // Storage
  STORAGE_BUCKET_INCIDENT_EVIDENCE: z.string().default('incident-evidence'),
  
  // Realtime & Observability
  REDIS_URL: z.string().optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  OTEL_SERVICE_NAME: z.string().default('resqgraph-backend'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables configuration:', parsed.error.format());
  throw new Error('Environment configuration validation failed');
}

export const env = parsed.data;
