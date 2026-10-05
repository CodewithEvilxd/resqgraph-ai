import { FastifyInstance } from 'fastify';
import { graphService } from './graph.service.js';
import { authenticate } from '../../api/middlewares/auth.middleware.js';
import { validateParams } from '../../api/middlewares/validate.middleware.js';
import { dbStore } from '../../db/index.js';
import { z } from 'zod';

const incidentIdParam = z.object({ id: z.string().uuid() });

export async function graphRouter(fastify: FastifyInstance): Promise<void> {
  // 1. Incident Graph View
  fastify.get('/api/v1/incidents/:id/graph', {
    preHandler: [authenticate, validateParams(incidentIdParam)],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const graph = await graphService.getIncidentGraph(id);
    return reply.status(200).send({
      success: true,
      data: graph,
    });
  });

  // 2. Multi-Incident Cluster Topology Overview
  fastify.get('/api/v1/graph/overview', {
    preHandler: authenticate,
  }, async (_request, reply) => {
    const activeIncidents = Array.from(dbStore.incidents.values()).filter(
      i => i.status !== 'closed' && i.status !== 'merged',
    );

    const overview = {
      activeIncidentsCount: activeIncidents.length,
      totalEvidenceItems: dbStore.evidence.size,
      totalRespondersDeployed: Array.from(dbStore.responders.values()).filter(r => r.status === 'assigned' || r.status === 'en_route').length,
      activeRoadClosures: Array.from(dbStore.roads.values()).filter(r => r.status !== 'open').length,
      clusters: activeIncidents.map(inc => ({
        id: inc.id,
        code: inc.code,
        title: inc.title,
        priority: inc.priority,
        hazardType: inc.hazardType,
        location: inc.location,
        evidenceCount: inc.evidenceCount,
        reporterCount: inc.reporterCount,
      })),
    };

    return reply.status(200).send({
      success: true,
      data: overview,
    });
  });
}
