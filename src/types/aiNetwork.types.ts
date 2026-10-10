/**
 * DARK — PHASE 4.1.2: MULTI-MODEL INTELLIGENCE / DARK AI NETWORK
 * Core types and contracts for provider independence, model registry,
 * capability routing, quota telemetry, and normalized error handling.
 */

export type ModelCapability =
  | 'general'
  | 'reasoning'
  | 'coding'
  | 'analysis'
  | 'long-context'
  | 'vision'
  | 'fast-response'
  | 'tool-use'
  | 'structured-output';

export type TaskCategory =
  | 'general'
  | 'coding'
  | 'reasoning'
  | 'analysis'
  | 'creative'
  | 'research'
  | 'long-context'
  | 'vision'
  | 'simple'
  | 'complex';

export type ProviderHealthStatus =
  | 'online'
  | 'healthy'
  | 'degraded'
  | 'rate_limited'
  | 'unavailable'
  | 'unknown';

export type ReasoningLevel = 'low' | 'medium' | 'high' | null;
export type CodingLevel = 'low' | 'medium' | 'high' | null;
export type LatencyProfile = 'ultra-low' | 'low' | 'moderate' | 'high' | null;
export type CostProfile = 'free' | 'low' | 'moderate' | 'high' | null;

export interface ModelProfile {
  id: string;
  providerId: string;
  displayName: string;
  capabilities: ModelCapability[];
  contextWindow: number | null;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsTools: boolean;
  reasoningLevel: ReasoningLevel;
  codingLevel: CodingLevel;
  latencyProfile: LatencyProfile;
  costProfile: CostProfile;
  freeTier: boolean | null;
  availability: 'available' | 'unavailable' | 'rate_limited' | 'unknown';
  healthStatus: ProviderHealthStatus;
}

export interface ProviderMetadata {
  id: string;
  name: string;
  website?: string;
  description: string;
  supportsStreaming: boolean;
  isConfigured: boolean;
  health: ProviderHealthStatus;
  models: string[];
}

export interface TaskClassification {
  category: TaskCategory;
  estimatedComplexity: 'simple' | 'moderate' | 'complex';
  requiredCapabilities: ModelCapability[];
  confidence: number;
  reason: string;
}

export interface RoutingDecision {
  selectedProviderId: string;
  selectedModelId: string;
  fallbackModelIds: string[];
  routingReason: string;
  taskClassification: TaskClassification;
}

export interface QuotaStatus {
  requestCount: number;
  tokenUsage: number;
  remainingRequests: number | null;
  remainingTokens: number | null;
  rateLimitPerMinute: number | null;
  resetTime: number | null;
  status: 'normal' | 'near_limit' | 'exceeded';
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  context?: string;
  stream?: boolean;
  preferredModelId?: string;
  preferredProviderId?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface AIResponse {
  text: string;
  providerId: string;
  modelId: string;
  finishReason?: string;
  tokensUsed?: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
  latencyMs?: number;
}

export interface AIExecutionResult extends AIResponse {
  routing: RoutingDecision;
  fallbackOccurred: boolean;
  fallbackAttempts: number;
}

export type DarkAIErrorCode =
  | 'AUTH_FAILURE'
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'UNAVAILABLE'
  | 'MALFORMED_RESPONSE'
  | 'NETWORK_FAILURE'
  | 'USER_ABORT'
  | 'UNKNOWN_PROVIDER_ERROR';

export interface AINetworkStatus {
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  activeProviderCount: number;
  totalModelsRegistered: number;
  providers: ProviderMetadata[];
  models: ModelProfile[];
  primaryProvider: string;
  primaryModel: string;
  routingMode: 'dynamic' | 'fixed';
}
