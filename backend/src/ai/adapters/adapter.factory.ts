import { AIModelAdapter } from './model-adapter.interface.js';
import { MockAIAdapter } from './mock.adapter.js';
import { GeminiAIAdapter } from './gemini.adapter.js';
import { env } from '../../config/env.js';

let defaultAdapterInstance: AIModelAdapter | null = null;

export function getAIAdapter(): AIModelAdapter {
  if (!defaultAdapterInstance) {
    if (env.AI_PRIMARY_PROVIDER === 'gemini' || env.GEMINI_API_KEY) {
      defaultAdapterInstance = new GeminiAIAdapter();
    } else {
      defaultAdapterInstance = new MockAIAdapter();
    }
  }
  return defaultAdapterInstance;
}

export function setAIAdapter(adapter: AIModelAdapter): void {
  defaultAdapterInstance = adapter;
}
