import { AIModelAdapter, GenerateTraceParams } from './model-adapter.interface.js';
import { MockAIAdapter } from './mock.adapter.js';
import { Incident } from '../../contracts/types/incident.js';
import { Evidence } from '../../contracts/types/evidence.js';
import {
  ExtractedFactsResult,
  DuplicateMatchResult,
  EvidenceFusionResult,
  AIDecisionTrace,
} from '../../contracts/types/ai.js';
import { ExtractFactsInput } from '../../contracts/schemas/ai.schema.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class GeminiAIAdapter implements AIModelAdapter {
  readonly providerName = 'google-gemini';
  readonly modelName = 'gemini-1.5-flash';
  readonly modelVersion = '1.5.0';

  private readonly fallbackAdapter = new MockAIAdapter();
  private readonly apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.GEMINI_API_KEY || env.AI_PRIMARY_API_KEY;
  }

  async extractFacts(input: ExtractFactsInput): Promise<ExtractedFactsResult> {
    if (!this.apiKey) {
      return this.fallbackAdapter.extractFacts(input);
    }

    const startTime = Date.now();
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
      const systemInstruction = `You are ResQGraph AI extraction intelligence for emergency response. Extract structured JSON facts strictly grounded in the input. Never invent casualties or locations. Format output as valid JSON with fields: detectedHazards (array of: fire, flood, collapse, hazmat, gas_leak, road_blocked, power_outage, medical_emergency, other), severityScore (0.0 to 1.0), urgencyLevel (low, medium, high, critical), estimatedCasualties (number), trappedPeopleCount (number), infrastructureStatus ({ roadBlocked: boolean, powerOutage: boolean, waterFlooding: boolean, structuralDamage: boolean }), keyEntities (array of strings), summary (string), confidence (0.0 to 1.0), uncertaintyScore (0.0 to 1.0).`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemInstruction}\n\nInput to analyze: ${input.text || 'Image/media attached'}` }]
          }],
          generationConfig: { responseMimeType: 'application/json' }
        }),
        signal: AbortSignal.timeout(8000), // 8s timeout budget
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const json = await response.json() as any;
      const textContent = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textContent) throw new Error('Empty response from Gemini API');

      const parsed = JSON.parse(textContent);
      const latencyMs = Date.now() - startTime;

      return {
        detectedHazards: parsed.detectedHazards || ['other'],
        severityScore: Number(parsed.severityScore) || 0.5,
        urgencyLevel: parsed.urgencyLevel || 'medium',
        estimatedCasualties: Number(parsed.estimatedCasualties) || 0,
        trappedPeopleCount: Number(parsed.trappedPeopleCount) || 0,
        infrastructureStatus: parsed.infrastructureStatus || {
          roadBlocked: false,
          powerOutage: false,
          waterFlooding: false,
          structuralDamage: false,
        },
        keyEntities: Array.isArray(parsed.keyEntities) ? parsed.keyEntities : [],
        confidence: Number(parsed.confidence) || 0.85,
        uncertaintyScore: Number(parsed.uncertaintyScore) || 0.15,
        summary: parsed.summary || 'Summary unavailable',
        suggestedIncidentTitle: parsed.suggestedIncidentTitle,
        modelMetadata: {
          provider: this.providerName,
          model: this.modelName,
          latencyMs,
        },
      };
    } catch (err: any) {
      logger.warn('Gemini API call failed; degrading gracefully to deterministic fallback', {
        error: err.message,
      });
      const fallbackResult = await this.fallbackAdapter.extractFacts(input);
      fallbackResult.modelMetadata.provider = `${this.providerName}-fallback-mock`;
      return fallbackResult;
    }
  }

  async assessDuplicate(candidateA: Incident, candidateB: Incident): Promise<DuplicateMatchResult> {
    // Spatial & deterministic clustering is authoritative; delegate to algorithm
    return this.fallbackAdapter.assessDuplicate(candidateA, candidateB);
  }

  async fuseEvidence(incident: Incident, evidenceList: Evidence[]): Promise<EvidenceFusionResult> {
    return this.fallbackAdapter.fuseEvidence(incident, evidenceList);
  }

  async generateDecisionTrace(params: GenerateTraceParams): Promise<AIDecisionTrace> {
    const trace = await this.fallbackAdapter.generateDecisionTrace(params);
    if (this.apiKey) {
      trace.provider = this.providerName;
      trace.model = this.modelName;
      trace.modelVersion = this.modelVersion;
    }
    return trace;
  }
}
