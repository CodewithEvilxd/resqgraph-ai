import { AIModelAdapter } from '../adapters/model-adapter.interface.js';
import { getAIAdapter } from '../adapters/adapter.factory.js';
import { ExtractFactsInput } from '../../contracts/schemas/ai.schema.js';
import { ExtractedFactsResult } from '../../contracts/types/ai.js';
import { logger } from '../../utils/logger.js';

export class MultimodalExtractorService {
  constructor(private readonly adapter: AIModelAdapter = getAIAdapter()) {}

  async extractFacts(input: ExtractFactsInput): Promise<ExtractedFactsResult> {
    logger.info('Running multimodal fact extraction', {
      hasText: Boolean(input.text),
      hasMedia: Boolean(input.mediaUrl),
      mediaType: input.mediaType,
    });

    const result = await this.adapter.extractFacts(input);

    logger.info('Fact extraction completed', {
      hazards: result.detectedHazards,
      urgency: result.urgencyLevel,
      confidence: result.confidence,
      uncertainty: result.uncertaintyScore,
      latencyMs: result.modelMetadata.latencyMs,
    });

    return result;
  }
}
