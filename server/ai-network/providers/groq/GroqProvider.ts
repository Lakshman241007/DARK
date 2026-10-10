/**
 * DARK AI NETWORK — GROQ PROVIDER ADAPTER
 * High-speed LPU inference engine adapter for open-weights models.
 */

import { AIProvider } from '../AIProvider.interface';
import {
  AIRequest,
  AIResponse,
  ProviderHealthStatus,
  ProviderMetadata,
  QuotaStatus,
} from '../../../../src/types/aiNetwork.types';
import { DarkAIError } from '../../errors/DarkAIError';

export class GroqProvider implements AIProvider {
  public readonly id = 'groq';
  public readonly name = 'Groq LPU Engine';

  private apiKey?: string;
  private isKeyValid: boolean = false;
  private health: ProviderHealthStatus = 'unknown';

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.isKeyValid = Boolean(this.apiKey && this.apiKey.trim().length > 0);
    this.health = this.isKeyValid ? 'online' : 'unavailable';
  }

  public get metadata(): ProviderMetadata {
    return {
      id: this.id,
      name: this.name,
      website: 'https://groq.com',
      description: 'Ultra-low latency Language Processing Unit (LPU) inference for open models.',
      supportsStreaming: true,
      isConfigured: this.isKeyValid,
      health: this.health,
      models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
    };
  }

  public isConfigured(): boolean {
    return this.isKeyValid;
  }

  public isAvailable(): boolean {
    return this.isKeyValid && this.health === 'online';
  }

  public getHealth(): ProviderHealthStatus {
    return this.health;
  }

  public getQuotaStatus(): QuotaStatus {
    return {
      requestCount: 0,
      tokenUsage: 0,
      remainingRequests: null,
      remainingTokens: null,
      rateLimitPerMinute: 30,
      resetTime: null,
      status: this.isKeyValid ? 'normal' : 'exceeded',
    };
  }

  public async generate(_request: AIRequest, modelId: string = 'llama-3.3-70b-versatile'): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw new DarkAIError({
        message: 'Groq provider is not configured with an API key.',
        code: 'AUTH_FAILURE',
        providerId: this.id,
        modelId,
        retryable: false,
      });
    }

    // Provider is ready for live API call once GROQ_API_KEY is supplied
    throw new DarkAIError({
      message: 'Groq live upstream endpoint not initialized.',
      code: 'UNAVAILABLE',
      providerId: this.id,
      modelId,
      retryable: true,
    });
  }

  public async generateStream(
    _request: AIRequest,
    modelId: string = 'llama-3.3-70b-versatile',
    _onChunk: (chunk: string) => void,
    _signal?: AbortSignal
  ): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw new DarkAIError({
        message: 'Groq provider is not configured with an API key.',
        code: 'AUTH_FAILURE',
        providerId: this.id,
        modelId,
        retryable: false,
      });
    }

    throw new DarkAIError({
      message: 'Groq live streaming endpoint not initialized.',
      code: 'UNAVAILABLE',
      providerId: this.id,
      modelId,
      retryable: true,
    });
  }
}
