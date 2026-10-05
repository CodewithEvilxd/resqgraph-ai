import { dbStore, generateUUID } from '../../db/index.js';
import { Evidence, EvidenceLink } from '../../contracts/types/evidence.js';
import { NotFoundError } from '../../utils/errors.js';

export class EvidenceRepository {
  private links: Map<string, EvidenceLink> = new Map();

  async create(evidence: Evidence): Promise<Evidence> {
    dbStore.evidence.set(evidence.id, evidence);

    const incident = dbStore.incidents.get(evidence.incidentId);
    if (incident) {
      incident.evidenceCount += 1;
      incident.updatedAt = new Date().toISOString();
    }

    return evidence;
  }

  async findById(id: string): Promise<Evidence | null> {
    return dbStore.evidence.get(id) || null;
  }

  async findByIncident(incidentId: string): Promise<Evidence[]> {
    return Array.from(dbStore.evidence.values())
      .filter((e) => e.incidentId === incidentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async link(
    evidenceIdA: string,
    evidenceIdB: string,
    relationType: 'supports' | 'contradicts' | 'duplicates' | 'corroborates',
    confidence: number,
    reasoning: string
  ): Promise<EvidenceLink> {
    const evA = dbStore.evidence.get(evidenceIdA);
    const evB = dbStore.evidence.get(evidenceIdB);

    if (!evA || !evB) {
      throw new NotFoundError('One or both evidence items not found');
    }

    const id = generateUUID();
    const link: EvidenceLink = {
      id,
      evidenceIdA,
      evidenceIdB,
      relationType,
      confidence,
      reasoning,
      createdAt: new Date().toISOString(),
    };

    this.links.set(id, link);

    // If contradiction, update contradiction flags on both items
    if (relationType === 'contradicts') {
      if (!evA.contradictionFlags.includes(evidenceIdB)) {
        evA.contradictionFlags.push(evidenceIdB);
      }
      if (!evB.contradictionFlags.includes(evidenceIdA)) {
        evB.contradictionFlags.push(evidenceIdA);
      }
    }

    return link;
  }

  async getLinksForEvidence(evidenceId: string): Promise<EvidenceLink[]> {
    return Array.from(this.links.values()).filter(
      (l) => l.evidenceIdA === evidenceId || l.evidenceIdB === evidenceId
    );
  }

  async verify(id: string, isVerified: boolean, verifiedByUserId: string): Promise<Evidence> {
    const item = dbStore.evidence.get(id);
    if (!item) {
      throw new NotFoundError(`Evidence ${id} not found`);
    }

    item.isVerified = isVerified;
    item.verifiedByUserId = verifiedByUserId;
    item.updatedAt = new Date().toISOString();

    return item;
  }

  async findAll(organizationId?: string): Promise<Evidence[]> {
    return Array.from(dbStore.evidence.values())
      .filter((e) => !organizationId || e.organizationId === organizationId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const evidenceRepository = new EvidenceRepository();
