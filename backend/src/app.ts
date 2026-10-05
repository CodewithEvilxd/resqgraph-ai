import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { generateUUID } from './utils/crypto.js';
import { AppError } from './utils/errors.js';
import { logger } from './utils/logger.js';
import { healthRouter } from './api/routes/health.router.js';
import { authRouter } from './api/routes/auth.router.js';
import { storageRouter } from './api/routes/storage.router.js';
import { realtimeRouter } from './api/routes/realtime.router.js';
import { incidentsRouter } from './modules/incidents/incidents.router.js';
import { reportsRouter } from './modules/reports/reports.router.js';
import { evidenceRouter } from './modules/evidence/evidence.router.js';
import { respondersRouter } from './modules/responders/responders.router.js';
import { resourcesRouter } from './modules/resources/resources.router.js';
import { auditRouter } from './modules/audit/audit.router.js';
import { aiRouter } from './ai/ai.router.js';
import { riskRouter } from './modules/risk/risk.router.js';
import { graphRouter } from './modules/graph/graph.router.js';
import { routingRouter } from './modules/routing/routing.router.js';
import { allocationRouter } from './modules/allocation/allocation.router.js';
import { devicesRouter } from './modules/devices/devices.router.js';
import { syncRouter } from './modules/sync/sync.router.js';
import { alertsRouter } from './modules/alerts/alerts.router.js';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: false, // Using structured custom Logger
    genReqId: (req) => {
      const headerId = req.headers['x-request-id'];
      if (typeof headerId === 'string' && headerId.length > 0) {
        return headerId;
      }
      return generateUUID();
    },
    bodyLimit: 10 * 1024 * 1024, // 10MB
  });

  // 1. Plugins
  app.register(sensible);
  app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.register(rateLimit, {
    max: 1000,
    timeWindow: '1 minute',
  });

  // 2. Security Headers & Request Correlation Hook
  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('X-Request-Id', request.id);
  });

  // 3. Centralized Error Handler
  app.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
    const requestId = request.id;
    if (error instanceof AppError) {
      logger.warn(`Operational error: ${error.message}`, {
        code: error.code,
        statusCode: error.statusCode,
        requestId,
        url: request.url,
      });

      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId,
        },
      });
    }

    // Unhandled exception
    logger.error('Unhandled server exception', error, {
      requestId,
      url: request.url,
      method: request.method,
    });

    return reply.status(500).send({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred',
        requestId,
      },
    });
  });

  // 4. Register Routes
  app.register(healthRouter);
  app.register(authRouter);
  app.register(storageRouter);
  app.register(realtimeRouter);
  app.register(incidentsRouter);
  app.register(reportsRouter);
  app.register(evidenceRouter);
  app.register(respondersRouter);
  app.register(resourcesRouter);
  app.register(auditRouter);
  app.register(aiRouter);
  app.register(riskRouter);
  app.register(graphRouter);
  app.register(routingRouter);
  app.register(allocationRouter);
  app.register(devicesRouter);
  app.register(syncRouter);
  app.register(alertsRouter);

  return app;
}
