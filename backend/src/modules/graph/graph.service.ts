import { dbStore } from '../../db/index.js';
import { IncidentsRepository, incidentsRepository } from '../incidents/incidents.repository.js';
import { IncidentGraphView, GraphNode, GraphEdge } from '../../contracts/types/graph.js';
import { NotFoundError } from '../../utils/errors.js';
import { calculateDistanceMeters } from '../../utils/spatial.js';
import { generateUUID } from '../../utils/crypto.js';

export class GraphService {
  constructor(private readonly incidentsRepo: IncidentsRepository = incidentsRepository) {}

  async getIncidentGraph(incidentId: string): Promise<IncidentGraphView> {
    const incident = await this.incidentsRepo.findById(incidentId);
    if (!incident) {
      throw new NotFoundError(`Incident ${incidentId} not found`);
    }

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    let contradictionCount = 0;

    // 1. Root Incident Node
    nodes.push({
      id: incident.id,
      type: 'incident',
      label: incident.title,
      status: incident.status,
      severity: incident.priority,
      location: { latitude: incident.location.latitude, longitude: incident.location.longitude },
      metadata: {
        code: incident.code,
        hazardType: incident.hazardType,
        confidenceScore: incident.confidenceScore,
        reporterCount: incident.reporterCount,
        evidenceCount: incident.evidenceCount,
      },
    });

    // 2. Linked Reports
    let reportCount = 0;
    for (const report of dbStore.reports.values()) {
      if (report.incidentId === incident.id) {
        reportCount++;
        const excerpt = report.rawContent ? report.rawContent.slice(0, 45) : 'Citizen report';
        nodes.push({
          id: report.id,
          type: 'report',
          label: `Report: ${report.extraction?.urgencyKeywords?.slice(0, 2).join(', ') || excerpt}`,
          status: report.isVerified ? 'verified' : 'pending',
          severity: report.extraction?.suggestedPriority || 'P3_MEDIUM',
          location: report.location ? { latitude: report.location.latitude, longitude: report.location.longitude } : undefined,
          metadata: {
            sourceType: report.sourceType,
            isVerified: report.isVerified,
            reportedAt: report.createdAt,
          },
        });

        edges.push({
          id: generateUUID(),
          source: report.id,
          target: incident.id,
          relation: 'reported',
          confidence: report.isVerified ? 0.95 : 0.70,
          label: 'informs',
        });
      }
    }

    // 3. Linked Evidence & Observations
    let evidenceCount = 0;
    const evidenceList: Array<typeof dbStore.evidence extends Map<any, infer V> ? V : never> = [];
    for (const ev of dbStore.evidence.values()) {
      if (ev.incidentId === incident.id) {
        evidenceCount++;
        evidenceList.push(ev);
        const obsLabels = ev.observations.map(o => o.label).join(', ');
        nodes.push({
          id: ev.id,
          type: 'evidence',
          label: `Evidence (${ev.sourceType}): ${obsLabels || ev.mediaType}`,
          status: ev.isVerified ? 'verified' : 'unverified',
          location: ev.location ? { latitude: ev.location.latitude, longitude: ev.location.longitude } : undefined,
          metadata: {
            sourceType: ev.sourceType,
            mediaType: ev.mediaType,
            extractionConfidence: ev.extractionConfidence,
            observations: ev.observations,
          },
        });

        edges.push({
          id: generateUUID(),
          source: ev.id,
          target: incident.id,
          relation: 'supports',
          confidence: ev.extractionConfidence,
          label: 'grounds',
        });
      }
    }

    // 4. Evidence Cross-Links (Contradictions & Corroborations)
    // Scan pairwise for contradictions
    for (let i = 0; i < evidenceList.length; i++) {
      for (let j = i + 1; j < evidenceList.length; j++) {
        const evA = evidenceList[i];
        const evB = evidenceList[j];

        const textA = evA.observations.map(o => o.label.toLowerCase()).join(' ');
        const textB = evB.observations.map(o => o.label.toLowerCase()).join(' ');

        const aImpassable = textA.includes('impassable') || textA.includes('blocked') || textA.includes('submerged');
        const bPassable = (textB.includes('passable') || textB.includes('clear') || textB.includes('open')) && !textB.includes('impassable');

        const bImpassable = textB.includes('impassable') || textB.includes('blocked') || textB.includes('submerged');
        const aPassable = (textA.includes('passable') || textA.includes('clear') || textA.includes('open')) && !textA.includes('impassable');

        if ((aImpassable && bPassable) || (bImpassable && aPassable)) {
          contradictionCount++;
          edges.push({
            id: generateUUID(),
            source: evA.id,
            target: evB.id,
            relation: 'contradicts',
            confidence: 0.85,
            label: 'road_passability_conflict',
          });
        }
      }
    }

    // 5. Assigned Responders & Teams
    let responderCount = 0;
    for (const assignment of dbStore.assignments.values()) {
      if (assignment.incidentId === incident.id) {
        responderCount++;
        const responder = assignment.responderId ? dbStore.responders.get(assignment.responderId) : null;
        nodes.push({
          id: assignment.id,
          type: 'responder',
          label: responder ? `Responder Badge ${responder.badgeNumber}` : `Team Assignment: ${assignment.teamId || assignment.id}`,
          status: assignment.status,
          location: responder?.currentLocation ? { latitude: responder.currentLocation.latitude, longitude: responder.currentLocation.longitude } : undefined,
          metadata: {
            responderId: assignment.responderId,
            assignedAt: assignment.createdAt,
            operationalStatus: assignment.status,
          },
        });

        edges.push({
          id: generateUUID(),
          source: assignment.id,
          target: incident.id,
          relation: 'assigned_to',
          label: assignment.status,
        });
      }
    }

    // 6. Nearby Hazard & Road Segments
    for (const road of dbStore.roads.values()) {
      if (road.status === 'blocked' || road.status === 'flooded' || road.status === 'closed') {
        const dist = calculateDistanceMeters(
          incident.location.latitude,
          incident.location.longitude,
          road.startPoint.latitude,
          road.startPoint.longitude,
        );

        if (dist <= 2500) {
          nodes.push({
            id: road.id,
            type: 'road_segment',
            label: `Road Closure: ${road.name}`,
            status: road.status,
            location: { latitude: road.startPoint.latitude, longitude: road.startPoint.longitude },
            metadata: {
              status: road.status,
              lengthMeters: road.lengthMeters,
              blockedReason: road.blockedReason,
            },
          });

          edges.push({
            id: generateUUID(),
            source: road.id,
            target: incident.id,
            relation: 'blocks_route',
            confidence: 0.9,
            label: road.status,
          });
        }
      }
    }

    return {
      incidentId: incident.id,
      nodes,
      edges,
      summary: {
        totalReports: reportCount,
        totalEvidence: evidenceCount,
        totalResponders: responderCount,
        contradictionCount,
      },
    };
  }
}

export const graphService = new GraphService();
