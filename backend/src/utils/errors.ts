export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_SERVER_ERROR', details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required', details?: unknown) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Permission denied', details?: unknown) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict with existing resource state', details?: unknown) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class BadGatewayError extends AppError {
  constructor(message: string = 'Upstream dependency failure', details?: unknown) {
    super(message, 502, 'BAD_GATEWAY', details);
  }
}
