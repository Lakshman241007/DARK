/**
 * DARK AI NETWORK — HEALTH MONITOR
 * Tracks provider and model operational health, latency observations,
 * failure counters, and temporary rate-limit cooldown windows.
 */

import { ProviderHealthStatus } from '../../../src/types/aiNetwork.types';

interface HealthRecord {
  status: ProviderHealthStatus;
  consecutiveFailures: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  cooldownUntil: number | null;
  latencySamples: number[];
}

export class HealthMonitor {
  private providerHealth: Map<string, HealthRecord> = new Map();
  private modelHealth: Map<string, HealthRecord> = new Map();

  private getOrCreateRecord(map: Map<string, HealthRecord>, key: string): HealthRecord {
    let rec = map.get(key);
    if (!rec) {
      rec = {
        status: 'online',
        consecutiveFailures: 0,
        lastFailureTime: null,
        lastSuccessTime: Date.now(),
        cooldownUntil: null,
        latencySamples: [],
      };
      map.set(key, rec);
    }
    return rec;
  }

  public recordSuccess(providerId: string, modelId: string, latencyMs?: number): void {
    const pRec = this.getOrCreateRecord(this.providerHealth, providerId);
    pRec.status = 'online';
    pRec.consecutiveFailures = 0;
    pRec.lastSuccessTime = Date.now();
    pRec.cooldownUntil = null;
    if (typeof latencyMs === 'number' && latencyMs > 0) {
      pRec.latencySamples = [...pRec.latencySamples.slice(-9), latencyMs];
    }

    const mRec = this.getOrCreateRecord(this.modelHealth, modelId);
    mRec.status = 'online';
    mRec.consecutiveFailures = 0;
    mRec.lastSuccessTime = Date.now();
    mRec.cooldownUntil = null;
    if (typeof latencyMs === 'number' && latencyMs > 0) {
      mRec.latencySamples = [...mRec.latencySamples.slice(-9), latencyMs];
    }
  }

  public recordFailure(
    providerId: string,
    modelId: string,
    errorCode: string,
    cooldownMs: number = 30000
  ): void {
    const now = Date.now();
    const pRec = this.getOrCreateRecord(this.providerHealth, providerId);
    pRec.consecutiveFailures += 1;
    pRec.lastFailureTime = now;

    if (errorCode === 'RATE_LIMIT') {
      pRec.status = 'rate_limited';
      pRec.cooldownUntil = now + Math.max(cooldownMs, 60000); // 60s minimum cooldown for 429
    } else if (pRec.consecutiveFailures >= 3) {
      pRec.status = 'degraded';
      pRec.cooldownUntil = now + cooldownMs;
    }

    const mRec = this.getOrCreateRecord(this.modelHealth, modelId);
    mRec.consecutiveFailures += 1;
    mRec.lastFailureTime = now;
    if (errorCode === 'RATE_LIMIT') {
      mRec.status = 'rate_limited';
      mRec.cooldownUntil = now + 60000;
    } else if (mRec.consecutiveFailures >= 2) {
      mRec.status = 'degraded';
      mRec.cooldownUntil = now + cooldownMs;
    }
  }

  public isAvailable(providerId: string, modelId: string): boolean {
    const now = Date.now();
    const pRec = this.providerHealth.get(providerId);
    if (pRec?.cooldownUntil && now < pRec.cooldownUntil) {
      return false;
    }

    const mRec = this.modelHealth.get(modelId);
    if (mRec?.cooldownUntil && now < mRec.cooldownUntil) {
      return false;
    }

    return true;
  }

  public getProviderHealth(providerId: string): ProviderHealthStatus {
    const rec = this.providerHealth.get(providerId);
    if (!rec) return 'online';
    if (rec.cooldownUntil && Date.now() < rec.cooldownUntil) {
      return rec.status;
    }
    return rec.status === 'rate_limited' ? 'online' : rec.status;
  }

  public getAverageLatency(providerId: string): number | null {
    const rec = this.providerHealth.get(providerId);
    if (!rec || rec.latencySamples.length === 0) return null;
    const sum = rec.latencySamples.reduce((a, b) => a + b, 0);
    return Math.round(sum / rec.latencySamples.length);
  }
}
