/**
 * DARK AI NETWORK — NORMALIZED ERROR SYSTEM
 * Normalizes vendor-specific exceptions into standard Dark AI Errors.
 */

import { DarkAIErrorCode } from '../../../src/types/aiNetwork.types';

export class DarkAIError extends Error {
  public readonly code: DarkAIErrorCode;
  public readonly providerId?: string;
  public readonly modelId?: string;
  public readonly retryable: boolean;
  public readonly originalError?: unknown;

  constructor(options: {
    message: string;
    code: DarkAIErrorCode;
    providerId?: string;
    modelId?: string;
    retryable?: boolean;
    originalError?: unknown;
  }) {
    super(options.message);
    this.name = 'DarkAIError';
    this.code = options.code;
    this.providerId = options.providerId;
    this.modelId = options.modelId;
    this.retryable = options.retryable ?? false;
    this.originalError = options.originalError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DarkAIError);
    }
  }

  /**
   * Normalizes any thrown error or unknown exception into DarkAIError
   */
  public static from(
    error: unknown,
    context?: { providerId?: string; modelId?: string }
  ): DarkAIError {
    if (error instanceof DarkAIError) {
      return error;
    }

    const message = error instanceof Error ? error.message : String(error);
    const lower = message.toLowerCase();

    // Abort detection
    if (
      (error instanceof Error && error.name === 'AbortError') ||
      lower.includes('aborted') ||
      lower.includes('canceled') ||
      lower.includes('cancelled')
    ) {
      return new DarkAIError({
        message: 'Request was cancelled by the user.',
        code: 'USER_ABORT',
        providerId: context?.providerId,
        modelId: context?.modelId,
        retryable: false,
        originalError: error,
      });
    }

    // Rate limits / 429
    if (
      lower.includes('429') ||
      lower.includes('rate limit') ||
      lower.includes('quota exceeded') ||
      lower.includes('resource exhausted')
    ) {
      return new DarkAIError({
        message: 'Provider rate limit or quota exceeded.',
        code: 'RATE_LIMIT',
        providerId: context?.providerId,
        modelId: context?.modelId,
        retryable: true,
        originalError: error,
      });
    }

    // Auth / API key
    if (
      lower.includes('401') ||
      lower.includes('403') ||
      lower.includes('unauthorized') ||
      lower.includes('api key') ||
      lower.includes('invalid credential')
    ) {
      return new DarkAIError({
        message: 'Provider authentication or API key verification failed.',
        code: 'AUTH_FAILURE',
        providerId: context?.providerId,
        modelId: context?.modelId,
        retryable: false,
        originalError: error,
      });
    }

    // Timeouts
    if (
      lower.includes('timeout') ||
      lower.includes('timed out') ||
      lower.includes('etimedout') ||
      lower.includes('deadline exceeded')
    ) {
      return new DarkAIError({
        message: 'Provider request timed out.',
        code: 'TIMEOUT',
        providerId: context?.providerId,
        modelId: context?.modelId,
        retryable: true,
        originalError: error,
      });
    }

    // Service unavailable / 503 / 502
    if (
      lower.includes('503') ||
      lower.includes('502') ||
      lower.includes('service unavailable') ||
      lower.includes('bad gateway') ||
      lower.includes('server error')
    ) {
      return new DarkAIError({
        message: 'Provider service is temporarily unavailable.',
        code: 'UNAVAILABLE',
        providerId: context?.providerId,
        modelId: context?.modelId,
        retryable: true,
        originalError: error,
      });
    }

    // Network failures
    if (
      lower.includes('econnrefused') ||
      lower.includes('enotfound') ||
      lower.includes('network') ||
      lower.includes('fetch failed')
    ) {
      return new DarkAIError({
        message: 'Network connection to provider failed.',
        code: 'NETWORK_FAILURE',
        providerId: context?.providerId,
        modelId: context?.modelId,
        retryable: true,
        originalError: error,
      });
    }

    return new DarkAIError({
      message: message || 'Unknown provider error occurred.',
      code: 'UNKNOWN_PROVIDER_ERROR',
      providerId: context?.providerId,
      modelId: context?.modelId,
      retryable: false,
      originalError: error,
    });
  }
}
