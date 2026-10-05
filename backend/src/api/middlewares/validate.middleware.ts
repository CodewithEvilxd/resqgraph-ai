import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../../utils/errors.js';

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    try {
      request.body = schema.parse(request.body);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new ValidationError('Request body validation failed', err.format());
      }
      throw err;
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    try {
      request.query = schema.parse(request.query);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new ValidationError('Query parameter validation failed', err.format());
      }
      throw err;
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    try {
      request.params = schema.parse(request.params);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new ValidationError('Route parameter validation failed', err.format());
      }
      throw err;
    }
  };
}
