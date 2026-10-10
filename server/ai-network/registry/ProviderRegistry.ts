/**
 * DARK AI NETWORK — PROVIDER REGISTRY
 * Manages instantiated AIProvider adapters with availability queries and metadata.
 */

import { AIProvider } from '../providers/AIProvider.interface';
import { ProviderMetadata } from '../../../src/types/aiNetwork.types';
import { GoogleGeminiProvider } from '../providers/google/GoogleGeminiProvider';
import { GroqProvider } from '../providers/groq/GroqProvider';
import { OpenRouterProvider } from '../providers/openrouter/OpenRouterProvider';

export class ProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.registerProvider(new GoogleGeminiProvider());
    this.registerProvider(new GroqProvider());
    this.registerProvider(new OpenRouterProvider());
  }

  public registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  public getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  public getConfiguredProviders(): AIProvider[] {
    return this.getAllProviders().filter((p) => p.isConfigured());
  }

  public getAvailableProviders(): AIProvider[] {
    return this.getAllProviders().filter((p) => p.isAvailable());
  }

  public getProvidersMetadata(): ProviderMetadata[] {
    return this.getAllProviders().map((p) => p.metadata);
  }
}
