import { FastifyInstance } from 'fastify';
import { healthCheck } from '../../db/index.js';

export async function healthRouter(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', async (_request, reply) => {
    return reply.status(200).send({
      status: 'ok',
      service: 'resqgraph-backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  });

  fastify.get('/ready', async (_request, reply) => {
    const dbStatus = await healthCheck();
    const isReady = dbStatus.connected;
    const memory = process.memoryUsage();

    const response = {
      status: isReady ? 'ready' : 'degraded',
      service: 'resqgraph-backend',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      system: {
        nodeVersion: process.version,
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
      },
    };

    return reply.status(isReady ? 200 : 503).send(response);
  });
}
