/**
 * DARK AI NETWORK — FALLBACK MANAGER
 * Coordinates resilient cascades across models and providers when primary encounters
 * rate-limits, transient upstream faults, or unexpected provider outages.
 */

import {
  AIRequest,
  AIResponse,
  RoutingDecision,
} from '../../../src/types/aiNetwork.types';
import { ProviderRegistry } from '../registry/ProviderRegistry';
import { ModelRegistry } from '../registry/ModelRegistry';
import { HealthMonitor } from '../health/HealthMonitor';
import { DarkAIError } from '../errors/DarkAIError';

export class FallbackManager {
  private providerRegistry: ProviderRegistry;
  private modelRegistry: ModelRegistry;
  private healthMonitor: HealthMonitor;

  constructor(
    providerRegistry: ProviderRegistry,
    modelRegistry: ModelRegistry,
    healthMonitor: HealthMonitor
  ) {
    this.providerRegistry = providerRegistry;
    this.modelRegistry = modelRegistry;
    this.healthMonitor = healthMonitor;
  }

  public async executeWithFallback(
    request: AIRequest,
    routing: RoutingDecision
  ): Promise<{ response: AIResponse; fallbackOccurred: boolean; attempts: number }> {
    const candidates = [routing.selectedModelId, ...routing.fallbackModelIds].slice(0, 3);
    let lastError: unknown = null;
    let attempts = 0;

    for (const modelId of candidates) {
      if (request.signal?.aborted) {
        throw new DarkAIError({
          message: 'Operation was cancelled by user.',
          code: 'USER_ABORT',
          modelId,
        });
      }

      attempts++;
      const model = this.modelRegistry.getModel(modelId);
      if (!model) continue;

      const provider = this.providerRegistry.getProvider(model.providerId);
      if (!provider || !provider.isAvailable()) continue;

      try {
        const response = await provider.generate(request, modelId);
        this.healthMonitor.recordSuccess(model.providerId, modelId, response.latencyMs);

        return {
          response,
          fallbackOccurred: attempts > 1,
          attempts,
        };
      } catch (err: unknown) {
        lastError = err;
        const darkErr = DarkAIError.from(err, { providerId: model.providerId, modelId });

        if (darkErr.code === 'USER_ABORT') {
          throw darkErr;
        }

        this.healthMonitor.recordFailure(model.providerId, modelId, darkErr.code);
        console.warn(`[DARK AI Network] Fallback cascade: ${modelId} failed (${darkErr.code}). Trying next candidate...`);
      }
    }

    throw lastError || new DarkAIError({
      message: 'All fallback providers failed to produce a valid response.',
      code: 'UNAVAILABLE',
    });
  }

  public async executeStreamWithFallback(
    request: AIRequest,
    routing: RoutingDecision,
    onChunk: (chunk: string) => void
  ): Promise<{ response: AIResponse; fallbackOccurred: boolean; attempts: number }> {
    const candidates = [routing.selectedModelId, ...routing.fallbackModelIds].slice(0, 3);
    let lastError: unknown = null;
    let attempts = 0;

    for (const modelId of candidates) {
      if (request.signal?.aborted) {
        throw new DarkAIError({
          message: 'Operation was cancelled by user.',
          code: 'USER_ABORT',
          modelId,
        });
      }

      attempts++;
      const model = this.modelRegistry.getModel(modelId);
      if (!model) continue;

      const provider = this.providerRegistry.getProvider(model.providerId);
      if (!provider || !provider.isAvailable()) continue;

      let chunkDelivered = false;

      try {
        const response = await provider.generateStream(
          request,
          modelId,
          (chunk) => {
            chunkDelivered = true;
            onChunk(chunk);
          },
          request.signal
        );

        this.healthMonitor.recordSuccess(model.providerId, modelId, response.latencyMs);

        return {
          response,
          fallbackOccurred: attempts > 1,
          attempts,
        };
      } catch (err: unknown) {
        lastError = err;
        const darkErr = DarkAIError.from(err, { providerId: model.providerId, modelId });

        if (darkErr.code === 'USER_ABORT') {
          throw darkErr;
        }

        this.healthMonitor.recordFailure(model.providerId, modelId, darkErr.code);

        // If chunks were already delivered to the user, we cannot switch mid-stream cleanly
        if (chunkDelivered) {
          throw darkErr;
        }

        console.warn(`[DARK AI Network] Stream initiation failed on ${modelId} (${darkErr.code}). Cascading to fallback model...`);
      }
    }

    throw lastError || new DarkAIError({
      message: 'All streaming fallback models exhausted.',
      code: 'UNAVAILABLE',
    });
  }
}
