import { evidenceRepository } from './evidence.repository.js';
import { auditService } from '../audit/audit.service.js';
import { realtimeService } from '../../services/realtime.service.js';
import { Evidence, EvidenceLink } from '../../contracts/types/evidence.js';
import { AuthTokenPayload } from '../../contracts/types/user.js';
import { CreateEvidenceInput, LinkEvidenceInput } from '../../contracts/schemas/evidence.schema.js';
import { REALTIME_EVENTS, AUDIT_ACTIONS } from '../../contracts/constants/events.js';
import { generateUUID } from '../../utils/crypto.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { dbStore } from '../../db/index.js';

export class EvidenceService {
  async create(input: CreateEvidenceInput, user: AuthTokenPayload): Promise<Evidence> {
    const incident = dbStore.incidents.get(input.incidentId);
    if (!incident || incident.organizationId !== user.organizationId) {
      throw new NotFoundError(`Incident ${input.incidentId} not found`);
    }

    const id = generateUUID();
    const now = new Date().toISOString();

    const evidence: Evidence = {
      id,
      incidentId: input.incidentId,
      reportId: input.reportId,
      organizationId: user.organizationId,
      sourceType: input.sourceType,
      mediaType: input.mediaType,
      mediaUrl: input.mediaUrl,
      mimeType: input.mimeType,
      fileSizeBytes: input.fileSizeBytes,
      location: input.location,
      locationConfidence: input.locationConfidence,
      extractionConfidence: input.extractionConfidence,
      observations: input.observations,
      contradictionFlags: input.contradictionFlags,
      isVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    const created = await evidenceRepository.create(evidence);

    await auditService.record({
      organizationId: user.organizationId,
      userId: user.userId,
      userEmail: user.email,
      userRole: user.role,
      action: AUDIT_ACTIONS.INCIDENT_UPDATE,
      targetEntity: 'evidence',
      targetEntityId: created.id,
      details: { incidentId: created.incidentId, mediaType: created.mediaType },
    });

    realtimeService.broadcastToOrg(user.organizationId, REALTIME_EVENTS.EVIDENCE_ADDED, created);
    realtimeService.broadcastToIncident(input.incidentId, REALTIME_EVENTS.EVIDENCE_ADDED, created);

    return created;
  }

  async link(input: LinkEvidenceInput, user: AuthTokenPayload): Promise<EvidenceLink> {
    const evA = await evidenceRepository.findById(input.evidenceIdA);
    const evB = await evidenceRepository.findById(input.evidenceIdB);

    if (!evA || !evB) {
      throw new NotFoundError('Target evidence not found');
    }

    const link = await evidenceRepository.link(
      input.evidenceIdA,
      input.evidenceIdB,
      input.relationType,
      input.confidence,
      input.reasoning
    );

    if (input.relationType === 'contradicts') {
      realtimeService.broadcastToIncident(evA.incidentId, REALTIME_EVENTS.EVIDENCE_CONTRADICTED, {
        evidenceIdA: input.evidenceIdA,
        evidenceIdB: input.evidenceIdB,
        reasoning: input.reasoning,
      });
    }

    await auditService.record({
      organizationId: user.organizationId,
      userId: user.userId,
      userEmail: user.email,
      userRole: user.role,
      action: AUDIT_ACTIONS.INCIDENT_UPDATE,
      targetEntity: 'evidence_link',
      targetEntityId: link.id,
      details: { relationType: link.relationType, confidence: link.confidence },
    });

    return link;
  }

  async listByIncident(incidentId: string): Promise<Evidence[]> {
    return evidenceRepository.findByIncident(incidentId);
  }

  async verify(id: string, isVerified: boolean, user: AuthTokenPayload): Promise<Evidence> {
    if (!['dispatcher', 'commander', 'admin'].includes(user.role)) {
      throw new ForbiddenError('Only dispatchers or commanders may verify evidence');
    }

    const updated = await evidenceRepository.verify(id, isVerified, user.userId);
    return updated;
  }

  async listAll(organizationId?: string): Promise<Evidence[]> {
    return evidenceRepository.findAll(organizationId);
  }
}

export const evidenceService = new EvidenceService();
