import { Incident } from '../../contracts/types/incident.js';
import { Evidence } from '../../contracts/types/evidence.js';
import { IncidentRiskAssessment, RiskFactor } from '../../contracts/types/graph.js';
import { HAZARD_TYPES, INCIDENT_PRIORITIES, IncidentPriority } from '../../contracts/constants/priorities.js';

export class RiskEngine {
  calculateRisk(incident: Incident, evidenceList: Evidence[] = []): IncidentRiskAssessment {
    const factors: RiskFactor[] = [];

    // Factor 1: Hazard Base Lethality (Weight: 0.35)
    let hazardScore = 30;
    switch (incident.hazardType) {
      case HAZARD_TYPES.FIRE:
      case HAZARD_TYPES.GAS_LEAK:
      case HAZARD_TYPES.COLLAPSE:
      case HAZARD_TYPES.MEDICAL_EMERGENCY:
        hazardScore = 90;
        break;
      case HAZARD_TYPES.FLOOD:
      case HAZARD_TYPES.HAZMAT:
        hazardScore = 75;
        break;
      case HAZARD_TYPES.ROAD_BLOCKED:
      case HAZARD_TYPES.POWER_OUTAGE:
        hazardScore = 45;
        break;
      default:
        hazardScore = 30;
    }
    factors.push({
      name: 'hazard_lethality',
      score: hazardScore,
      weight: 0.35,
      description: `Inherent physical hazard lethality for ${incident.hazardType}.`,
    });

    // Factor 2: Human Exposure & Casualties (Weight: 0.30)
    const casualties = incident.affectedPeopleEstimate || 0;
    let exposureScore = 15;
    if (casualties >= 10) {
      exposureScore = 100;
    } else if (casualties >= 5) {
      exposureScore = 80;
    } else if (casualties >= 1) {
      exposureScore = 60;
    }
    factors.push({
      name: 'human_exposure',
      score: exposureScore,
      weight: 0.30,
      description: `Reported population at risk (${casualties} individual(s) estimated).`,
    });

    // Factor 3: Temporal Escalation / Aging (Weight: 0.20)
    const ageHours = (Date.now() - new Date(incident.createdAt).getTime()) / (1000 * 60 * 60);
    let escalationScore = 20;
    if (incident.status === 'reported' || incident.status === 'verified') {
      // Unassigned/uncontained incidents gain urgency rapidly
      escalationScore = Math.min(100, Math.round(30 + ageHours * 20));
    } else if (incident.status === 'active') {
      escalationScore = Math.min(80, Math.round(25 + ageHours * 10));
    } else {
      escalationScore = 10;
    }
    factors.push({
      name: 'temporal_escalation',
      score: escalationScore,
      weight: 0.20,
      description: `Incident active for ${ageHours.toFixed(1)}h in status '${incident.status}'.`,
    });

    // Factor 4: Verification & Corroboration (Weight: 0.15)
    let verificationScore = 50;
    const verifiedEvidenceCount = evidenceList.filter(e => e.isVerified).length;
    if (verifiedEvidenceCount >= 2) {
      verificationScore = 85;
    } else if (evidenceList.length > 0) {
      verificationScore = 60;
    }
    factors.push({
      name: 'evidence_corroboration',
      score: verificationScore,
      weight: 0.15,
      description: `${verifiedEvidenceCount} verified evidence items out of ${evidenceList.length} total.`,
      evidenceIds: evidenceList.map(e => e.id),
    });

    // Compute composite weighted risk score
    const compositeScore = Math.round(
      factors.reduce((sum, f) => sum + f.score * f.weight, 0),
    );

    // Derive tier and recommended priority
    let riskTier: IncidentRiskAssessment['riskTier'] = 'LOW';
    let recommendedPriority: IncidentPriority = INCIDENT_PRIORITIES.P4_LOW;

    if (compositeScore >= 80) {
      riskTier = 'CRITICAL';
      recommendedPriority = INCIDENT_PRIORITIES.P1_CRITICAL;
    } else if (compositeScore >= 60) {
      riskTier = 'HIGH';
      recommendedPriority = INCIDENT_PRIORITIES.P2_HIGH;
    } else if (compositeScore >= 35) {
      riskTier = 'MODERATE';
      recommendedPriority = INCIDENT_PRIORITIES.P3_MEDIUM;
    }

    // Uncertainty score: higher when evidence is unverified or scarce
    const uncertaintyScore = evidenceList.length === 0
      ? 0.45
      : parseFloat((Math.max(0.05, 0.40 - verifiedEvidenceCount * 0.15)).toFixed(2));

    const summary = `Composite risk score of ${compositeScore}/100 [${riskTier}]. Primary drivers: ${factors.filter(f => f.score >= 60).map(f => f.name).join(', ') || 'baseline situational parameters'}.`;

    return {
      incidentId: incident.id,
      compositeRiskScore: compositeScore,
      riskTier,
      recommendedPriority,
      uncertaintyScore,
      factors,
      summary,
      assessedAt: new Date().toISOString(),
    };
  }
}
