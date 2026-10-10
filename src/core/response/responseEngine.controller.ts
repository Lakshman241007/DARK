/**
 * DARK CORE — PHASE 4.1: CORE RESPONSE ENGINE
 * Centralized low-latency response engine coordinator and telemetry tracker.
 */

import {
  ResponseMetrics,
  ResponseEngineState,
  PipelinePhase,
  ResponseMilestoneTracker,
} from './responseMetrics.types';
import { darkCore } from '../dark/darkCore';

type EngineListener = (state: ResponseEngineState) => void;

class ResponseEngineManager {
  private currentPhase: PipelinePhase = 'idle';
  private activeRequestId: string | null = null;
  private activeTracker: ResponseMilestoneTracker | null = null;
  private activeMetrics: ResponseMetrics | null = null;
  private lastCompletedMetrics: ResponseMetrics | null = null;
  private history: ResponseMetrics[] = [];
  private listeners: Set<EngineListener> = new Set();

  constructor() {
    // Load historical metrics if cached in session
    try {
      const saved = sessionStorage.getItem('dark_response_history');
      if (saved) {
        this.history = JSON.parse(saved).slice(-20);
        if (this.history.length > 0) {
          this.lastCompletedMetrics = this.history[this.history.length - 1];
        }
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }

  public getState(): ResponseEngineState {
    const validTTFTs = this.history
      .map((m) => m.requestToFirstToken)
      .filter((t): t is number => typeof t === 'number' && t > 0);
    const avgTTFT = validTTFTs.length
      ? Math.round(validTTFTs.reduce((a, b) => a + b, 0) / validTTFTs.length)
      : 0;

    const validTotals = this.history
      .map((m) => m.totalResponseTime)
      .filter((t): t is number => typeof t === 'number' && t > 0);
    const avgTotal = validTotals.length
      ? Math.round(validTotals.reduce((a, b) => a + b, 0) / validTotals.length)
      : 0;

    return {
      currentPhase: this.currentPhase,
      activeRequestId: this.activeRequestId,
      activeMetrics: this.activeMetrics ? { ...this.activeMetrics } : null,
      lastCompletedMetrics: this.lastCompletedMetrics ? { ...this.lastCompletedMetrics } : null,
      averageTTFTMs: avgTTFT,
      averageTotalTimeMs: avgTotal,
      history: [...this.history],
    };
  }

  public subscribe(listener: EngineListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (err) {
        console.error('[ResponseEngine] Listener notification error:', err);
      }
    }
  }

  /**
   * Phase 1: Immediate user input acknowledgement (<16ms)
   * Instantly transitions Core and marks input timestamp
   */
  public markInputSubmitted(requestId: string, inputTimestamp: number = performance.now()): ResponseMetrics {
    const t0 = inputTimestamp;
    const tracker = new ResponseMilestoneTracker(requestId, t0);
    const ackTime = performance.now();
    tracker.markT1(ackTime);

    // Instant Core transition to THINKING
    darkCore.transition('INPUT_SUBMITTED');

    const reqStartTime = performance.now();
    tracker.markT2(reqStartTime);

    this.activeTracker = tracker;
    this.activeRequestId = requestId;
    const metrics = tracker.toMetrics();
    this.activeMetrics = metrics;
    this.currentPhase = 'thinking';

    this.notify();
    return metrics;
  }

  /**
   * Phase 2: First token arrival (TTFT)
   * Instantly transitions Core to SPEAKING and records TTFT
   */
  public markFirstTokenReceived(approxTokenCount: number = 1): void {
    if (!this.activeMetrics) return;

    const now = performance.now();
    if (this.activeTracker) {
      this.activeTracker.markT3(now);
      this.activeTracker.markT4(now);
      this.activeTracker.setApproxTokens(approxTokenCount);
      this.activeMetrics = this.activeTracker.toMetrics();
    } else {
      this.activeMetrics.firstTokenTimestamp = now;
      this.activeMetrics.requestToFirstToken = Math.max(0, Math.round(now - this.activeMetrics.requestStartTimestamp));
      this.activeMetrics.totalTokensApprox = approxTokenCount;
    }

    this.currentPhase = 'streaming';

    // Transition Core to SPEAKING/RESPONSE_READY immediately
    darkCore.transition('RESPONSE_READY');

    this.notify();
  }

  /**
   * Phase 3: Token streaming progress update
   */
  public updateStreamingProgress(totalTokensApprox: number): void {
    if (!this.activeMetrics) return;
    if (this.activeTracker) {
      this.activeTracker.setApproxTokens(totalTokensApprox);
      this.activeMetrics = this.activeTracker.toMetrics();
    } else {
      this.activeMetrics.totalTokensApprox = totalTokensApprox;
    }
    this.notify();
  }

  /**
   * Phase 4: Stream completion
   * Computes throughput, records history, and returns Core to IDLE
   */
  public markResponseCompleted(totalTokensApprox?: number): ResponseMetrics | null {
    if (!this.activeMetrics) return null;

    const now = performance.now();
    if (this.activeTracker) {
      this.activeTracker.markT5(totalTokensApprox, now);
      this.activeMetrics = this.activeTracker.toMetrics();
    } else {
      this.activeMetrics.responseCompleteTimestamp = now;
      this.activeMetrics.totalResponseTime = Math.max(
        0,
        Math.round(now - this.activeMetrics.inputTimestamp)
      );

      if (this.activeMetrics.firstTokenTimestamp) {
        this.activeMetrics.firstTokenToComplete = Math.max(
          0,
          Math.round(now - this.activeMetrics.firstTokenTimestamp)
        );
      }

      if (totalTokensApprox !== undefined) {
        this.activeMetrics.totalTokensApprox = totalTokensApprox;
      }

      if (
        this.activeMetrics.totalTokensApprox &&
        this.activeMetrics.firstTokenToComplete &&
        this.activeMetrics.firstTokenToComplete > 0
      ) {
        const seconds = this.activeMetrics.firstTokenToComplete / 1000;
        this.activeMetrics.tokensPerSecond = Math.round((this.activeMetrics.totalTokensApprox / seconds) * 10) / 10;
      }
    }

    const completed = { ...this.activeMetrics };
    this.lastCompletedMetrics = completed;
    this.history = [...this.history.slice(-19), completed];

    try {
      sessionStorage.setItem('dark_response_history', JSON.stringify(this.history));
    } catch {
      // Ignore quota errors
    }

    this.activeMetrics = null;
    this.activeTracker = null;
    this.activeRequestId = null;
    this.currentPhase = 'completed';

    // Transition Core to SPEECH_FINISHED
    darkCore.transition('SPEECH_FINISHED');

    this.notify();
    return completed;
  }

  /**
   * Interruption / abort
   */
  public markInterrupted(): void {
    if (this.activeTracker) {
      this.activeTracker.markT5(undefined, performance.now());
      this.lastCompletedMetrics = this.activeTracker.toMetrics();
    } else if (this.activeMetrics) {
      this.activeMetrics.responseCompleteTimestamp = performance.now();
      this.activeMetrics.totalResponseTime = Math.round(
        performance.now() - this.activeMetrics.inputTimestamp
      );
      this.lastCompletedMetrics = { ...this.activeMetrics };
    }

    this.activeMetrics = null;
    this.activeTracker = null;
    this.activeRequestId = null;
    this.currentPhase = 'interrupted';

    darkCore.transition('USER_INTERRUPT');
    this.notify();
  }

  /**
   * Error state
   */
  public markError(reason: string): void {
    this.activeMetrics = null;
    this.activeTracker = null;
    this.activeRequestId = null;
    this.currentPhase = 'error';

    darkCore.transition('ERROR_OCCURRED', { reason });
    this.notify();
  }

  public clearHistory(): void {
    this.history = [];
    this.lastCompletedMetrics = null;
    try {
      sessionStorage.removeItem('dark_response_history');
    } catch {
      // Ignore
    }
    this.notify();
  }
}

export const responseEngine = new ResponseEngineManager();
