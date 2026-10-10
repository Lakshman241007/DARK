/**
 * DARK AI NETWORK — AUTOMATED VERIFICATION SUITE
 * Validates provider abstraction, model registry, routing decisions,
 * error normalization, quota recording, fallback cascade, and streaming.
 */

import { AINetwork } from '../AINetwork';
import { DarkAIError } from '../errors/DarkAIError';
import { TaskAnalyzer } from '../router/TaskAnalyzer';
import { ModelRegistry } from '../registry/ModelRegistry';
import { ProviderRegistry } from '../registry/ProviderRegistry';
import { HealthMonitor } from '../health/HealthMonitor';
import { AIRouter } from '../router/AIRouter';
import { QuotaManager } from '../quota/QuotaManager';
import { GoogleGeminiProvider } from '../providers/google/GoogleGeminiProvider';

async function runTests() {
  console.log('--- STARTING DARK AI NETWORK TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Error Normalization
  try {
    const abortErr = DarkAIError.from(new Error('This request was aborted'));
    assert(abortErr.code === 'USER_ABORT', 'DarkAIError classifies USER_ABORT');

    const rateLimitErr = DarkAIError.from(new Error('HTTP 429 Too Many Requests: quota exceeded'));
    assert(rateLimitErr.code === 'RATE_LIMIT' && rateLimitErr.retryable === true, 'DarkAIError classifies RATE_LIMIT');

    const authErr = DarkAIError.from(new Error('401 Unauthorized: Invalid API key'));
    assert(authErr.code === 'AUTH_FAILURE', 'DarkAIError classifies AUTH_FAILURE');
  } catch (e) {
    console.error('Error in Error Normalization test:', e);
    failed++;
  }

  // 2. Model Registry & Capabilities
  try {
    const modelRegistry = new ModelRegistry();
    const models = modelRegistry.getAllModels();
    assert(models.length >= 4, `Model registry initializes with models (found: ${models.length})`);

    const geminiFlash = modelRegistry.getModel('gemini-3.8-flash');
    assert(Boolean(geminiFlash && geminiFlash.capabilities.includes('coding')), 'gemini-3.8-flash has coding capability');
    assert(geminiFlash?.supportsStreaming === true, 'gemini-3.8-flash supports streaming');

    const codingModels = modelRegistry.findModelsByCapability('coding');
    assert(codingModels.length >= 2, 'findModelsByCapability returns models');
  } catch (e) {
    console.error('Error in Model Registry test:', e);
    failed++;
  }

  // 3. Provider Registry & Metadata
  try {
    const providerRegistry = new ProviderRegistry();
    const google = providerRegistry.getProvider('google');
    assert(Boolean(google), 'Google provider is registered');
    assert(google?.metadata.supportsStreaming === true, 'Google provider metadata supportsStreaming is true');

    const groq = providerRegistry.getProvider('groq');
    assert(Boolean(groq && groq.metadata.name.includes('Groq')), 'Groq provider is registered');
  } catch (e) {
    console.error('Error in Provider Registry test:', e);
    failed++;
  }

  // 4. Task Analyzer Heuristics
  try {
    const analyzer = new TaskAnalyzer();

    const codingTask = analyzer.analyze({
      messages: [{ role: 'user', content: 'Write a TypeScript function to calculate Fibonacci numbers.' }],
    });
    assert(codingTask.category === 'coding', 'TaskAnalyzer detects coding intent');

    const reasoningTask = analyzer.analyze({
      messages: [{ role: 'user', content: 'Why should we prefer event streaming over polling for latency?' }],
    });
    assert(reasoningTask.category === 'reasoning', 'TaskAnalyzer detects reasoning intent');

    const simpleTask = analyzer.analyze({
      messages: [{ role: 'user', content: 'hello' }],
    });
    assert(simpleTask.category === 'simple', 'TaskAnalyzer detects simple greeting/command');
  } catch (e) {
    console.error('Error in Task Analyzer test:', e);
    failed++;
  }

  // 5. AI Router Decisions
  try {
    const modelRegistry = new ModelRegistry();
    const providerRegistry = new ProviderRegistry();
    const healthMonitor = new HealthMonitor();
    const router = new AIRouter(modelRegistry, providerRegistry, healthMonitor);

    const codingDecision = router.route({
      messages: [{ role: 'user', content: 'Refactor the express route for user authentication.' }],
    });
    assert(Boolean(codingDecision.selectedModelId), `AIRouter routes coding request to: ${codingDecision.selectedModelId}`);
    assert(codingDecision.fallbackModelIds.length > 0, 'AIRouter includes fallback candidates');

    const simpleDecision = router.route({
      messages: [{ role: 'user', content: 'ping' }],
    });
    assert(Boolean(simpleDecision.selectedModelId), `AIRouter routes simple request to: ${simpleDecision.selectedModelId}`);
  } catch (e) {
    console.error('Error in AI Router test:', e);
    failed++;
  }

  // 6. Quota Manager
  try {
    const quota = new QuotaManager();
    quota.recordUsage('google', 'gemini-3.8-flash', 150);
    const status = quota.getQuotaStatus('google');
    assert(status.requestCount === 1, 'QuotaManager increments request count');
    assert(status.tokenUsage === 150, 'QuotaManager tracks token usage');
  } catch (e) {
    console.error('Error in Quota Manager test:', e);
    failed++;
  }

  // 7. Health Monitor & Cooldowns
  try {
    const health = new HealthMonitor();
    assert(health.isAvailable('google', 'gemini-3.8-flash') === true, 'Initially healthy model is available');

    health.recordFailure('google', 'gemini-3.8-flash', 'RATE_LIMIT');
    assert(health.isAvailable('google', 'gemini-3.8-flash') === false, 'Rate limited model enters cooldown');
    assert(health.getProviderHealth('google') === 'rate_limited', 'Provider status marks rate_limited');
  } catch (e) {
    console.error('Error in Health Monitor test:', e);
    failed++;
  }

  // 8. End-to-End Central AI Network Execution & Fallback Cascade
  try {
    const network = new AINetwork();
    const netStatus = network.getNetworkStatus();
    assert(netStatus.status === 'ONLINE', 'Network status reports ONLINE');
    assert(netStatus.totalModelsRegistered >= 4, 'Network status reports registered models');

    // Test cancellation / abort immediate return
    const abortController = new AbortController();
    abortController.abort();
    let abortedCleanly = false;
    try {
      await network.executeStream(
        {
          messages: [{ role: 'user', content: 'Test stream abort' }],
          signal: abortController.signal,
        },
        () => {}
      );
    } catch (err) {
      if (err instanceof DarkAIError && err.code === 'USER_ABORT') {
        abortedCleanly = true;
      }
    }
    assert(abortedCleanly, 'network.executeStream honors AbortSignal immediately without orphaned execution');

    // Test fallback cascade when primary model fails
    const mockModelRegistry = new ModelRegistry();
    const mockProviderRegistry = new ProviderRegistry();
    const mockHealth = new HealthMonitor();

    // Register a failing provider as primary
    mockProviderRegistry.registerProvider({
      id: 'failing-primary',
      name: 'Failing Provider',
      metadata: {
        id: 'failing-primary',
        name: 'Failing Provider',
        description: 'Mock',
        supportsStreaming: true,
        isConfigured: true,
        health: 'online',
        models: ['mock-failing'],
      },
      isConfigured: () => true,
      isAvailable: () => true,
      getHealth: () => 'online',
      getQuotaStatus: () => ({
        requestCount: 0,
        tokenUsage: 0,
        remainingRequests: null,
        remainingTokens: null,
        rateLimitPerMinute: null,
        resetTime: null,
        status: 'normal',
      }),
      generate: async () => {
        throw new DarkAIError({ message: 'Primary failure', code: 'RATE_LIMIT', retryable: true });
      },
      generateStream: async () => {
        throw new DarkAIError({ message: 'Primary failure', code: 'RATE_LIMIT', retryable: true });
      },
    });

    mockModelRegistry.registerModel({
      id: 'mock-failing',
      providerId: 'failing-primary',
      displayName: 'Mock Failing',
      capabilities: ['general', 'coding'],
      contextWindow: 1000,
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: false,
      reasoningLevel: 'low',
      codingLevel: 'low',
      latencyProfile: 'low',
      costProfile: 'free',
      freeTier: true,
      availability: 'available',
      healthStatus: 'healthy',
    });

    // Register secondary provider
    mockProviderRegistry.registerProvider({
      id: 'secondary-success',
      name: 'Secondary Provider',
      metadata: {
        id: 'secondary-success',
        name: 'Secondary Provider',
        description: 'Mock',
        supportsStreaming: true,
        isConfigured: true,
        health: 'online',
        models: ['mock-secondary'],
      },
      isConfigured: () => true,
      isAvailable: () => true,
      getHealth: () => 'online',
      getQuotaStatus: () => ({
        requestCount: 0,
        tokenUsage: 0,
        remainingRequests: null,
        remainingTokens: null,
        rateLimitPerMinute: null,
        resetTime: null,
        status: 'normal',
      }),
      generate: async () => ({
        text: 'Secondary fallback succeeded.',
        providerId: 'secondary-success',
        modelId: 'mock-secondary',
        finishReason: 'STOP',
      }),
      generateStream: async (_req, _model, onChunk) => {
        onChunk('Secondary fallback stream succeeded.');
        return {
          text: 'Secondary fallback stream succeeded.',
          providerId: 'secondary-success',
          modelId: 'mock-secondary',
          finishReason: 'STOP',
        };
      },
    });

    mockModelRegistry.registerModel({
      id: 'mock-secondary',
      providerId: 'secondary-success',
      displayName: 'Mock Secondary',
      capabilities: ['general', 'coding'],
      contextWindow: 1000,
      supportsStreaming: true,
      supportsVision: false,
      supportsTools: false,
      reasoningLevel: 'low',
      codingLevel: 'low',
      latencyProfile: 'low',
      costProfile: 'free',
      freeTier: true,
      availability: 'available',
      healthStatus: 'healthy',
    });

    const fallbackMgr = new (await import('../fallback/FallbackManager')).FallbackManager(
      mockProviderRegistry,
      mockModelRegistry,
      mockHealth
    );

    const fallbackResult = await fallbackMgr.executeWithFallback(
      { messages: [{ role: 'user', content: 'test' }] },
      {
        selectedProviderId: 'failing-primary',
        selectedModelId: 'mock-failing',
        fallbackModelIds: ['mock-secondary'],
        routingReason: 'testing',
        taskClassification: {
          category: 'general',
          estimatedComplexity: 'simple',
          requiredCapabilities: ['general'],
          confidence: 1,
          reason: 'test',
        },
      }
    );

    assert(fallbackResult.fallbackOccurred === true, 'Fallback cascade activated when primary failed');
    assert(fallbackResult.response.modelId === 'mock-secondary', 'Fallback cascade correctly selected secondary model');
  } catch (e) {
    console.error('Error in AI Network execution test:', e);
    failed++;
  }

  console.log(`\n--- TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
