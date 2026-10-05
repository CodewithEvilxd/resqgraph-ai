import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { realtimeService, ConnectedClient } from '../../services/realtime.service.js';
import { authService } from '../../services/auth.service.js';
import { generateUUID } from '../../utils/crypto.js';
import { UnauthorizedError } from '../../utils/errors.js';

export async function realtimeRouter(fastify: FastifyInstance): Promise<void> {
  // Server-Sent Events endpoint for realtime streaming
  fastify.get('/api/v1/realtime/stream', async (request: FastifyRequest, reply: FastifyReply) => {
    const token = (request.query as { token?: string }).token;
    if (!token) {
      throw new UnauthorizedError('Token query parameter required for realtime stream');
    }

    const user = authService.verifyToken(token);
    const clientId = generateUUID();

    // Set headers for SSE
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const client: ConnectedClient = {
      id: clientId,
      user,
      subscribedIncidents: new Set(),
      connectedAt: new Date().toISOString(),
      send: (payload: string) => {
        reply.raw.write(`data: ${payload}\n\n`);
      },
      close: () => {
        reply.raw.end();
      },
    };

    realtimeService.registerClient(client);

    // Keepalive ping every 25s
    const pingInterval = setInterval(() => {
      reply.raw.write(': ping\n\n');
    }, 25000);

    request.raw.on('close', () => {
      clearInterval(pingInterval);
      realtimeService.unregisterClient(clientId);
    });
  });

  // Reconnection replay query
  fastify.get('/api/v1/realtime/events', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization header required');
    }
    const token = authHeader.substring(7);
    const user = authService.verifyToken(token);

    const since = (request.query as { since?: string }).since;
    const events = realtimeService.getRecentEvents(user.organizationId, since);

    return reply.status(200).send({
      success: true,
      data: events,
    });
  });
}
