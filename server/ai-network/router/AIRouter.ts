/**
 * DARK AI NETWORK — AI ROUTER
 * Routes incoming requests to the optimal provider and model based on
 * task classification, health status, latency profile, and capability matches.
 */

import {
  AIRequest,
  ModelProfile,
  RoutingDecision,
  TaskClassification,
} from '../../../src/types/aiNetwork.types';
import { ModelRegistry } from '../registry/ModelRegistry';
import { ProviderRegistry } from '../registry/ProviderRegistry';
import { HealthMonitor } from '../health/HealthMonitor';
import { TaskAnalyzer } from './TaskAnalyzer';

export class AIRouter {
  private taskAnalyzer: TaskAnalyzer;
  private modelRegistry: ModelRegistry;
  private providerRegistry: ProviderRegistry;
  private healthMonitor: HealthMonitor;

  constructor(
    modelRegistry: ModelRegistry,
    providerRegistry: ProviderRegistry,
    healthMonitor: HealthMonitor,
    taskAnalyzer: TaskAnalyzer = new TaskAnalyzer()
  ) {
    this.modelRegistry = modelRegistry;
    this.providerRegistry = providerRegistry;
    this.healthMonitor = healthMonitor;
    this.taskAnalyzer = taskAnalyzer;
  }

  public route(request: AIRequest): RoutingDecision {
    const classification = this.taskAnalyzer.analyze(request);

    // 1. Explicit user override if model specified and available
    if (request.preferredModelId) {
      const preferredModel = this.modelRegistry.getModel(request.preferredModelId);
      if (preferredModel && this.isModelUsable(preferredModel)) {
        return {
          selectedProviderId: preferredModel.providerId,
          selectedModelId: preferredModel.id,
          fallbackModelIds: this.getFallbacks(preferredModel.id),
          routingReason: `Explicit model preference selected: ${preferredModel.displayName}.`,
          taskClassification: classification,
        };
      }
    }

    // 2. Filter available & healthy models
    const availableModels = this.modelRegistry
      .getAllModels()
      .filter((m) => this.isModelUsable(m));

    // 3. Capability-based selection
    let selectedModel: ModelProfile | undefined;
    let routingReason = '';

    if (classification.category === 'coding') {
      selectedModel = availableModels.find(
        (m) => m.capabilities.includes('coding') && m.codingLevel === 'high'
      );
      routingReason = 'Selected coding-specialized model with high technical precision.';
    } else if (classification.category === 'reasoning' || classification.estimatedComplexity === 'complex') {
      selectedModel = availableModels.find(
        (m) => m.capabilities.includes('reasoning') && m.reasoningLevel === 'high'
      );
      routingReason = 'Selected deep-reasoning model for complex analytical architecture.';
    } else if (classification.category === 'simple') {
      selectedModel = availableModels.find(
        (m) => m.capabilities.includes('fast-response') && m.latencyProfile === 'low'
      );
      routingReason = 'Selected low-latency model for immediate interaction acknowledgement.';
    }

    // 4. Default safe fallback model
    if (!selectedModel) {
      selectedModel =
        availableModels.find((m) => m.id === 'gemini-3.8-flash') ||
        availableModels[0] ||
        this.modelRegistry.getModel('gemini-3.8-flash')!;
      routingReason = 'Selected default high-performance multi-modal model (Gemini 3.8 Flash).';
    }

    const fallbacks = this.getFallbacks(selectedModel.id);

    return {
      selectedProviderId: selectedModel.providerId,
      selectedModelId: selectedModel.id,
      fallbackModelIds: fallbacks,
      routingReason,
      taskClassification: classification,
    };
  }

  private isModelUsable(model: ModelProfile): boolean {
    const provider = this.providerRegistry.getProvider(model.providerId);
    if (!provider || !provider.isAvailable()) {
      return false;
    }
    return this.healthMonitor.isAvailable(model.providerId, model.id);
  }

  private getFallbacks(excludeModelId: string): string[] {
    const defaultCandidates = [
      'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'llama-3.3-70b-versatile',
    ];
    return defaultCandidates.filter((id) => id !== excludeModelId);
  }
}
