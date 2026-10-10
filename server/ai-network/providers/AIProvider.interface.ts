/**
 * DARK AI NETWORK — PROVIDER INTERFACE
 * Vendor-independent contract implemented by all model adapters.
 */

import {
  AIRequest,
  AIResponse,
  ProviderHealthStatus,
  ProviderMetadata,
  QuotaStatus,
} from '../../../src/types/aiNetwork.types';

export interface AIProvider {
  /** Unique provider identifier (e.g. 'google', 'groq', 'openrouter') */
  readonly id: string;
  /** Human-readable display name */
  readonly name: string;
  /** Static and dynamic metadata */
  readonly metadata: ProviderMetadata;

  /** True if credentials/API keys exist and format is valid */
  isConfigured(): boolean;

  /** True if provider is currently ready to serve inference requests */
  isAvailable(): boolean;

  /** Current health state of the provider */
  getHealth(): ProviderHealthStatus;

  /** Current quota telemetry */
  getQuotaStatus(): QuotaStatus;

  /**
   * Generates a non-streaming completion
   */
  generate(request: AIRequest, modelId: string): Promise<AIResponse>;

  /**
   * Generates a streaming completion, invoking onChunk as tokens arrive
   */
  generateStream(
    request: AIRequest,
    modelId: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<AIResponse>;
}
