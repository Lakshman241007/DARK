/**
 * DARK AI NETWORK — QUOTA & USAGE MANAGER
 * Tracks real-time token consumption, request counts, and provider quota states.
 * Unknown limits are safely represented as null without fabricated metrics.
 */

import { QuotaStatus } from '../../../src/types/aiNetwork.types';

interface ProviderUsageRecord {
  requestCount: number;
  tokenUsage: number;
  lastRequestTimestamp: number;
  rateLimitPerMinute: number | null;
  resetTime: number | null;
}

export class QuotaManager {
  private records: Map<string, ProviderUsageRecord> = new Map();

  public recordUsage(
    providerId: string,
    _modelId: string,
    tokensApprox: number = 0
  ): void {
    const existing = this.records.get(providerId) || {
      requestCount: 0,
      tokenUsage: 0,
      lastRequestTimestamp: Date.now(),
      rateLimitPerMinute: null,
      resetTime: null,
    };

    existing.requestCount += 1;
    existing.tokenUsage += tokensApprox;
    existing.lastRequestTimestamp = Date.now();

    this.records.set(providerId, existing);
  }

  public getQuotaStatus(providerId: string): QuotaStatus {
    const record = this.records.get(providerId);
    if (!record) {
      return {
        requestCount: 0,
        tokenUsage: 0,
        remainingRequests: null,
        remainingTokens: null,
        rateLimitPerMinute: null,
        resetTime: null,
        status: 'normal',
      };
    }

    return {
      requestCount: record.requestCount,
      tokenUsage: record.tokenUsage,
      remainingRequests: null, // Unknown unless reported by provider headers
      remainingTokens: null,
      rateLimitPerMinute: record.rateLimitPerMinute,
      resetTime: record.resetTime,
      status: 'normal',
    };
  }

  public getSummary(): Record<string, { requests: number; tokens: number }> {
    const result: Record<string, { requests: number; tokens: number }> = {};
    for (const [providerId, record] of this.records.entries()) {
      result[providerId] = {
        requests: record.requestCount,
        tokens: record.tokenUsage,
      };
    }
    return result;
  }
}
