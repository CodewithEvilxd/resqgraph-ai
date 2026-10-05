import { AIModelAdapter, GenerateTraceParams } from './model-adapter.interface.js';
import { Incident } from '../../contracts/types/incident.js';
import { Evidence } from '../../contracts/types/evidence.js';
import {
  ExtractedFactsResult,
  DuplicateMatchResult,
  EvidenceFusionResult,
  AIDecisionTrace,
} from '../../contracts/types/ai.js';
import { ExtractFactsInput } from '../../contracts/schemas/ai.schema.js';
import { HAZARD_TYPES, HazardType, INCIDENT_PRIORITIES, IncidentPriority } from '../../contracts/constants/priorities.js';
import { calculateDistanceMeters } from '../../utils/spatial.js';
import { generateUUID } from '../../utils/crypto.js';

export class MockAIAdapter implements AIModelAdapter {
  readonly providerName = 'resqgraph-deterministic-engine';
  readonly modelName = 'resq-heuristic-v1';
  readonly modelVersion = '2026.10.1';

  async extractFacts(input: ExtractFactsInput): Promise<ExtractedFactsResult> {
    const startTime = Date.now();
    const text = (input.text || '').toLowerCase();
    const detectedHazards: HazardType[] = [];
    const urgencyMarkers: string[] = [];

    // Hazard pattern matching grounded in text
    if (text.includes('fire') || text.includes('smoke') || text.includes('flames') || text.includes('burning')) {
      detectedHazards.push(HAZARD_TYPES.FIRE);
      urgencyMarkers.push('Active combustion or smoke detected');
    }
    if (text.includes('flood') || text.includes('water') || text.includes('submerged') || text.includes('overflow')) {
      detectedHazards.push(HAZARD_TYPES.FLOOD);
      urgencyMarkers.push('Water inundation reported');
    }
    if (text.includes('collapse') || text.includes('rubble') || text.includes('crumbled') || text.includes('cave-in')) {
      detectedHazards.push(HAZARD_TYPES.COLLAPSE);
      urgencyMarkers.push('Structural failure or debris collapse reported');
    }
    if (text.includes('gas') || text.includes('leak') || text.includes('chemical') || text.includes('fumes')) {
      detectedHazards.push(HAZARD_TYPES.GAS_LEAK);
      urgencyMarkers.push('Hazardous gas or chemical dispersion risk');
    }
    if (text.includes('road blocked') || text.includes('tree down') || text.includes('debris on road') || text.includes('impassable')) {
      detectedHazards.push(HAZARD_TYPES.ROAD_BLOCKED);
    }
    if (text.includes('power outage') || text.includes('blackout') || text.includes('wire down') || text.includes('transformer')) {
      detectedHazards.push(HAZARD_TYPES.POWER_OUTAGE);
    }
    if (text.includes('injured') || text.includes('bleeding') || text.includes('casualty') || text.includes('unconscious') || text.includes('cardiac')) {
      detectedHazards.push(HAZARD_TYPES.MEDICAL_EMERGENCY);
      urgencyMarkers.push('Human injuries or immediate medical need reported');
    }

    if (detectedHazards.length === 0) {
      detectedHazards.push(HAZARD_TYPES.OTHER);
    }

    // Grounded casualty and trap extraction
    let estimatedCasualties = 0;
    const casualtyMatch = text.match(/(\d+)\s*(people|persons|victims|casualties|injured|dead)/);
    if (casualtyMatch) {
      estimatedCasualties = parseInt(casualtyMatch[1], 10);
    }

    let trappedPeopleCount = 0;
    const trappedMatch = text.match(/(\d+)\s*(people|persons)?\s*(trapped|stuck|stranded)/);
    if (trappedMatch) {
      trappedPeopleCount = parseInt(trappedMatch[1], 10);
    } else if (text.includes('trapped') || text.includes('stranded')) {
      trappedPeopleCount = 1;
    }

    const roadBlocked = text.includes('road') && (text.includes('block') || text.includes('closed') || text.includes('impassable'));
    const powerOutage = text.includes('power') || text.includes('blackout') || text.includes('electricity');
    const waterFlooding = detectedHazards.includes(HAZARD_TYPES.FLOOD);
    const structuralDamage = detectedHazards.includes(HAZARD_TYPES.COLLAPSE) || text.includes('damage') || text.includes('cracks');

    // Deterministic priority and severity calculation
    let severityScore = 0.3;
    let urgencyLevel: IncidentPriority = INCIDENT_PRIORITIES.P4_LOW;

    if (detectedHazards.includes(HAZARD_TYPES.FIRE) || detectedHazards.includes(HAZARD_TYPES.GAS_LEAK) || trappedPeopleCount > 0) {
      severityScore = 0.9;
      urgencyLevel = INCIDENT_PRIORITIES.P1_CRITICAL;
    } else if (detectedHazards.includes(HAZARD_TYPES.COLLAPSE) || detectedHazards.includes(HAZARD_TYPES.FLOOD) || estimatedCasualties > 0) {
      severityScore = 0.75;
      urgencyLevel = INCIDENT_PRIORITIES.P2_HIGH;
    } else if (roadBlocked || powerOutage) {
      severityScore = 0.55;
      urgencyLevel = INCIDENT_PRIORITIES.P3_MEDIUM;
    }

    // Confidence is higher when explicit markers or media are present
    const hasMedia = Boolean(input.mediaUrl);
    const baseConfidence = hasMedia ? 0.88 : (text.length > 50 ? 0.82 : 0.65);
    const uncertaintyScore = parseFloat((1.0 - baseConfidence).toFixed(2));

    const latencyMs = Math.max(1, Date.now() - startTime);

    return {
      detectedHazards,
      severityScore,
      urgencyLevel,
      estimatedCasualties,
      trappedPeopleCount,
      infrastructureStatus: {
        roadBlocked,
        powerOutage,
        waterFlooding,
        structuralDamage,
      },
      keyEntities: urgencyMarkers,
      confidence: baseConfidence,
      uncertaintyScore,
      summary: `Extracted ${detectedHazards.join(', ')} event with estimated severity ${severityScore.toFixed(2)}. ${urgencyMarkers.join('. ')}`,
      suggestedIncidentTitle: `${detectedHazards[0].replace('_', ' ').toUpperCase()} at ${input.locationHint?.address || 'Reported Location'}`,
      modelMetadata: {
        provider: this.providerName,
        model: this.modelName,
        latencyMs,
      },
    };
  }

  async assessDuplicate(candidateA: Incident, candidateB: Incident): Promise<DuplicateMatchResult> {
    // 1. Spatial proximity via distance
    const distanceMeters = calculateDistanceMeters(
      candidateA.location.latitude,
      candidateA.location.longitude,
      candidateB.location.latitude,
      candidateB.location.longitude,
    );

    // Spatial score: 1.0 at 0m, drops to 0.0 at 1000m
    const spatialSimilarity = Math.max(0, 1.0 - distanceMeters / 1000);

    // 2. Temporal delta
    const timeA = new Date(candidateA.createdAt).getTime();
    const timeB = new Date(candidateB.createdAt).getTime();
    const deltaMinutes = Math.abs(timeA - timeB) / (1000 * 60);

    // Temporal score: 1.0 within 15 min, drops to 0.0 at 360 min (6 hours)
    const temporalSimilarity = Math.max(0, 1.0 - deltaMinutes / 360);

    // 3. Semantic similarity: title and description token overlap
    const tokensA = new Set(`${candidateA.title} ${candidateA.description}`.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    const tokensB = new Set(`${candidateB.title} ${candidateB.description}`.toLowerCase().split(/\W+/).filter(w => w.length > 3));

    let intersectionCount = 0;
    const matchingEntities: string[] = [];
    tokensA.forEach(token => {
      if (tokensB.has(token)) {
        intersectionCount++;
        matchingEntities.push(token);
      }
    });

    const unionCount = new Set([...tokensA, ...tokensB]).size;
    const semanticSimilarity = unionCount > 0 ? intersectionCount / unionCount : 0;

    // Hazard type match bonus
    const hazardMatch = candidateA.hazardType === candidateB.hazardType;
    if (hazardMatch) {
      matchingEntities.push(`hazard:${candidateA.hazardType}`);
    }

    // Weighted composite duplicate probability
    // Spatial (0.45), Semantic (0.35), Temporal (0.20)
    let duplicateProbability = 0.45 * spatialSimilarity + 0.35 * semanticSimilarity + 0.20 * temporalSimilarity;
    if (hazardMatch) duplicateProbability = Math.min(1.0, duplicateProbability + 0.1);

    const conflictingSignals: string[] = [];
    if (!hazardMatch && candidateA.hazardType !== HAZARD_TYPES.OTHER && candidateB.hazardType !== HAZARD_TYPES.OTHER) {
      conflictingSignals.push(`Different hazard types: '${candidateA.hazardType}' vs '${candidateB.hazardType}'`);
      duplicateProbability = Math.max(0, duplicateProbability - 0.25);
    }
    if (distanceMeters > 800) {
      conflictingSignals.push(`Separated by ${Math.round(distanceMeters)} meters`);
    }

    const relatedProbability = Math.min(1.0, duplicateProbability + (distanceMeters < 1500 ? 0.3 : 0.1));

    const explanation = duplicateProbability > 0.7
      ? `High likelihood duplicate: Incidents are ${Math.round(distanceMeters)}m apart, reported within ${Math.round(deltaMinutes)}m, with shared terms [${matchingEntities.slice(0, 4).join(', ')}].`
      : `Low or related probability (${duplicateProbability.toFixed(2)}): ${conflictingSignals.join('; ') || 'Insufficient spatial/semantic correlation'}.`;

    return {
      candidateIncidentId: candidateB.id,
      duplicateProbability: parseFloat(duplicateProbability.toFixed(3)),
      relatedProbability: parseFloat(relatedProbability.toFixed(3)),
      spatialDistanceMeters: Math.round(distanceMeters),
      temporalDeltaMinutes: Math.round(deltaMinutes),
      semanticSimilarityScore: parseFloat(semanticSimilarity.toFixed(3)),
      matchingEntities,
      conflictingSignals,
      explanation,
    };
  }

  async fuseEvidence(incident: Incident, evidenceList: Evidence[]): Promise<EvidenceFusionResult> {
    const unresolvedContradictions: EvidenceFusionResult['unresolvedContradictions'] = [];

    // Analyze observations for road status claims
    const roadClaims: Array<{ id: string; status: 'passable' | 'impassable'; description: string }> = [];

    for (const ev of evidenceList) {
      for (const obs of ev.observations) {
        const desc = obs.label.toLowerCase();
        if (desc.includes('impassable') || desc.includes('blocked') || desc.includes('submerged') || desc.includes('cannot pass') || desc.includes('water depth')) {
          roadClaims.push({ id: ev.id, status: 'impassable', description: obs.label });
        } else if (desc.includes('passable') || desc.includes('clear') || desc.includes('cars passing') || desc.includes('open')) {
          roadClaims.push({ id: ev.id, status: 'passable', description: obs.label });
        }
      }
    }

    // Detect direct contradiction in road claims
    const passableEvidence = roadClaims.find(r => r.status === 'passable');
    const impassableEvidence = roadClaims.find(r => r.status === 'impassable');

    if (passableEvidence && impassableEvidence) {
      unresolvedContradictions.push({
        factor: 'road_passability',
        evidenceAId: passableEvidence.id,
        claimA: passableEvidence.description,
        evidenceBId: impassableEvidence.id,
        claimB: impassableEvidence.description,
      });
    }

    // Base confidence calculations
    let totalConfidence = 0;
    evidenceList.forEach(e => {
      totalConfidence += e.extractionConfidence || 0.7;
    });
    let aggregatedConfidence = evidenceList.length > 0 ? totalConfidence / evidenceList.length : 0.7;

    // Penalty for unresolved contradictions
    if (unresolvedContradictions.length > 0) {
      aggregatedConfidence = Math.max(0.2, aggregatedConfidence - 0.25 * unresolvedContradictions.length);
    }

    const consensusSummary = unresolvedContradictions.length > 0
      ? `Evidence fusion detected ${unresolvedContradictions.length} unresolved contradiction(s) regarding ${unresolvedContradictions.map(c => c.factor).join(', ')}. Operator field verification required.`
      : `Evidence fusion reached consensus across ${evidenceList.length} verified item(s) for ${incident.hazardType}.`;

    return {
      incidentId: incident.id,
      aggregatedHazardType: incident.hazardType,
      aggregatedPriority: incident.priority,
      aggregatedConfidence: parseFloat(aggregatedConfidence.toFixed(2)),
      peopleAffectedEstimate: incident.affectedPeopleEstimate || 0,
      unresolvedContradictions,
      consensusSummary,
    };
  }

  async generateDecisionTrace(params: GenerateTraceParams): Promise<AIDecisionTrace> {
    return {
      id: generateUUID(),
      incidentId: params.incident.id,
      recommendationType: params.recommendationType,
      recommendedAction: params.recommendedAction,
      confidenceScore: params.confidenceScore,
      uncertaintyScore: params.uncertaintyScore,
      factors: params.factors,
      citedEvidenceIds: params.citedEvidenceIds,
      provider: this.providerName,
      model: this.modelName,
      modelVersion: this.modelVersion,
      latencyMs: 12,
      createdAt: new Date().toISOString(),
    };
  }
}
