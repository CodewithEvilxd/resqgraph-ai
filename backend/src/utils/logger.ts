export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'jwt',
  'authorization',
  'secret',
  'apikey',
  'api_key',
  'service_role_key',
  'device_signing_secret',
]);

function redact(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(redact);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redact(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export class Logger {
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      context: this.context,
      message,
      ...(metadata ? { metadata: redact(metadata) } : {}),
    };

    const serialized = JSON.stringify(entry);
    if (level === 'error') {
      // eslint-disable-next-line no-console
      console.error(serialized);
    } else if (level === 'warn') {
      // eslint-disable-next-line no-console
      console.warn(serialized);
    } else {
      // eslint-disable-next-line no-console
      console.log(serialized);
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log('warn', message, metadata);
  }

  error(message: string, error?: unknown, metadata?: Record<string, unknown>): void {
    const errorDetails = error instanceof Error
      ? { errorName: error.name, errorMessage: error.message, stack: error.stack }
      : { rawError: error };
    this.log('error', message, { ...errorDetails, ...metadata });
  }

  child(subContext: string): Logger {
    return new Logger(`${this.context}:${subContext}`);
  }
}

export const logger = new Logger('ResQGraph');
