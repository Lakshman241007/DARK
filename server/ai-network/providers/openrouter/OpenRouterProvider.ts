/**
 * DARK AI NETWORK — OPENROUTER PROVIDER ADAPTER
 * Multi-provider unified aggregation adapter.
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

export class OpenRouterProvider implements AIProvider {
  public readonly id = 'openrouter';
  public readonly name = 'OpenRouter Aggregator';

  private apiKey?: string;
  private isKeyValid: boolean = false;
  private health: ProviderHealthStatus = 'unknown';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.isKeyValid = Boolean(this.apiKey && this.apiKey.trim().length > 0);
    this.health = this.isKeyValid ? 'online' : 'unavailable';
  }

  public get metadata(): ProviderMetadata {
    return {
      id: this.id,
      name: this.name,
      website: 'https://openrouter.ai',
      description: 'Unified gateway to 100+ commercial and open intelligence models.',
      supportsStreaming: true,
      isConfigured: this.isKeyValid,
      health: this.health,
      models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'mistralai/mistral-large'],
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
      rateLimitPerMinute: null,
      resetTime: null,
      status: this.isKeyValid ? 'normal' : 'exceeded',
    };
  }

  public async generate(_request: AIRequest, modelId: string): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw new DarkAIError({
        message: 'OpenRouter provider is not configured with an API key.',
        code: 'AUTH_FAILURE',
        providerId: this.id,
        modelId,
        retryable: false,
      });
    }

    throw new DarkAIError({
      message: 'OpenRouter live endpoint not initialized.',
      code: 'UNAVAILABLE',
      providerId: this.id,
      modelId,
      retryable: true,
    });
  }

  public async generateStream(
    _request: AIRequest,
    modelId: string,
    _onChunk: (chunk: string) => void,
    _signal?: AbortSignal
  ): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw new DarkAIError({
        message: 'OpenRouter provider is not configured with an API key.',
        code: 'AUTH_FAILURE',
        providerId: this.id,
        modelId,
        retryable: false,
      });
    }

    throw new DarkAIError({
      message: 'OpenRouter live streaming endpoint not initialized.',
      code: 'UNAVAILABLE',
      providerId: this.id,
      modelId,
      retryable: true,
    });
  }
}
