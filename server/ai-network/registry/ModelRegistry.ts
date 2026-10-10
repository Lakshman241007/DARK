/**
 * DARK AI NETWORK — MODEL REGISTRY
 * Central repository of AI models with structured capabilities, context windows,
 * latency profiles, and availability states.
 */

import {
  ModelCapability,
  ModelProfile,
} from '../../../src/types/aiNetwork.types';

export class ModelRegistry {
  private models: Map<string, ModelProfile> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    const defaultModels: ModelProfile[] = [
      {
        id: 'gemini-3.8-flash',
        providerId: 'google',
        displayName: 'Gemini 3.8 Flash',
        capabilities: ['general', 'fast-response', 'coding', 'reasoning', 'analysis', 'vision'],
        contextWindow: 1048576,
        supportsStreaming: true,
        supportsVision: true,
        supportsTools: true,
        reasoningLevel: 'high',
        codingLevel: 'high',
        latencyProfile: 'low',
        costProfile: 'low',
        freeTier: true,
        availability: 'available',
        healthStatus: 'healthy',
      },
      {
        id: 'gemini-2.5-flash',
        providerId: 'google',
        displayName: 'Gemini 2.5 Flash',
        capabilities: ['general', 'fast-response', 'coding', 'vision'],
        contextWindow: 1048576,
        supportsStreaming: true,
        supportsVision: true,
        supportsTools: true,
        reasoningLevel: 'medium',
        codingLevel: 'medium',
        latencyProfile: 'ultra-low',
        costProfile: 'low',
        freeTier: true,
        availability: 'available',
        healthStatus: 'healthy',
      },
      {
        id: 'gemini-2.5-pro',
        providerId: 'google',
        displayName: 'Gemini 2.5 Pro',
        capabilities: ['general', 'reasoning', 'coding', 'analysis', 'long-context', 'vision', 'tool-use'],
        contextWindow: 2097152,
        supportsStreaming: true,
        supportsVision: true,
        supportsTools: true,
        reasoningLevel: 'high',
        codingLevel: 'high',
        latencyProfile: 'moderate',
        costProfile: 'moderate',
        freeTier: false,
        availability: 'available',
        healthStatus: 'healthy',
      },
      {
        id: 'llama-3.3-70b-versatile',
        providerId: 'groq',
        displayName: 'Llama 3.3 70B Versatile',
        capabilities: ['general', 'fast-response', 'reasoning', 'coding'],
        contextWindow: 128000,
        supportsStreaming: true,
        supportsVision: false,
        supportsTools: true,
        reasoningLevel: 'high',
        codingLevel: 'high',
        latencyProfile: 'ultra-low',
        costProfile: 'low',
        freeTier: true,
        availability: 'unknown',
        healthStatus: 'unknown',
      },
      {
        id: 'mistralai/mistral-large',
        providerId: 'openrouter',
        displayName: 'Mistral Large',
        capabilities: ['general', 'reasoning', 'coding', 'analysis'],
        contextWindow: 128000,
        supportsStreaming: true,
        supportsVision: false,
        supportsTools: true,
        reasoningLevel: 'high',
        codingLevel: 'high',
        latencyProfile: 'moderate',
        costProfile: 'moderate',
        freeTier: false,
        availability: 'unknown',
        healthStatus: 'unknown',
      },
    ];

    for (const model of defaultModels) {
      this.registerModel(model);
    }
  }

  public registerModel(profile: ModelProfile): void {
    this.models.set(profile.id, { ...profile });
  }

  public getModel(id: string): ModelProfile | undefined {
    return this.models.get(id);
  }

  public getAllModels(): ModelProfile[] {
    return Array.from(this.models.values());
  }

  public getModelsByProvider(providerId: string): ModelProfile[] {
    return this.getAllModels().filter((m) => m.providerId === providerId);
  }

  public getAvailableModels(): ModelProfile[] {
    return this.getAllModels().filter(
      (m) => m.availability === 'available' || m.availability === 'unknown'
    );
  }

  public findModelsByCapability(capability: ModelCapability): ModelProfile[] {
    return this.getAllModels().filter((m) => m.capabilities.includes(capability));
  }

  public updateModelStatus(
    id: string,
    updates: Partial<Pick<ModelProfile, 'availability' | 'healthStatus'>>
  ): void {
    const existing = this.models.get(id);
    if (existing) {
      this.models.set(id, { ...existing, ...updates });
    }
  }
}
