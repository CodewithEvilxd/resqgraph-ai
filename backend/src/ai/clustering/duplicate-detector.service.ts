import { AIModelAdapter } from '../adapters/model-adapter.interface.js';
import { getAIAdapter } from '../adapters/adapter.factory.js';
import { IncidentsRepository } from '../../modules/incidents/incidents.repository.js';
import { DuplicateMatchResult } from '../../contracts/types/ai.js';
import { CheckDuplicatesInput } from '../../contracts/schemas/ai.schema.js';
import { NotFoundError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export class DuplicateDetectorService {
  constructor(
    private readonly incidentsRepo: IncidentsRepository,
    private readonly adapter: AIModelAdapter = getAIAdapter(),
  ) {}

  async checkDuplicates(input: CheckDuplicatesInput): Promise<{
    sourceIncidentId: string;
    results: DuplicateMatchResult[];
    suggestedMerges: DuplicateMatchResult[];
  }> {
    const sourceIncident = await this.incidentsRepo.findById(input.incidentId);
    if (!sourceIncident) {
      throw new NotFoundError(`Source incident ${input.incidentId} not found`);
    }

    const { items: allIncidents } = await this.incidentsRepo.findAll({
      organizationId: sourceIncident.organizationId,
      limit: 100,
    });

    // Exclude self and closed/merged incidents
    let candidates = allIncidents.filter(
      c => c.id !== sourceIncident.id && c.status !== 'closed' && c.status !== 'merged',
    );

    if (input.candidateIncidentIds && input.candidateIncidentIds.length > 0) {
      const allowedSet = new Set(input.candidateIncidentIds);
      candidates = candidates.filter(c => allowedSet.has(c.id));
    }

    const results: DuplicateMatchResult[] = [];

    for (const candidate of candidates) {
      const match = await this.adapter.assessDuplicate(sourceIncident, candidate);
      if (
        match.spatialDistanceMeters <= input.maxDistanceMeters ||
        match.duplicateProbability >= 0.5
      ) {
        results.push(match);
      }
    }

    // Sort descending by duplicate probability
    results.sort((a, b) => b.duplicateProbability - a.duplicateProbability);

    const suggestedMerges = results.filter(r => r.duplicateProbability >= 0.70);

    logger.info('Duplicate detection finished', {
      sourceIncidentId: sourceIncident.id,
      candidatesEvaluated: candidates.length,
      potentialDuplicates: results.length,
      suggestedMerges: suggestedMerges.length,
    });

    return {
      sourceIncidentId: sourceIncident.id,
      results,
      suggestedMerges,
    };
  }
}
