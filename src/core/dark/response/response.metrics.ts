/**
 * DARK CORE — PHASE 4.1: CORE RESPONSE ENGINE
 * Response Metrics & Milestone Tracker (T0 through T5)
 *
 * Timeline Architecture:
 *   T0 = User submits input
 *   T1 = DARK acknowledges input (<100ms / near-instant)
 *   T2 = AI request begins
 *   T3 = First response data arrives (TTFT)
 *   T4 = First visible text renders
 *   T5 = Response completes
 */

export interface ResponseMilestones {
  /** T0: Timestamp when user submits input */
  t0_inputSubmitted: number;
  /** T1: Timestamp when DARK acknowledges input (Core state transition) */
  t1_acknowledged?: number;
  /** T2: Timestamp when AI request / network dispatch begins */
  t2_requestDispatched?: number;
  /** T3: Timestamp when first response data / token arrives */
  t3_firstDataReceived?: number;
  /** T4: Timestamp when first visible response text renders to DOM */
  t4_firstVisibleRender?: number;
  /** T5: Timestamp when response stream completes */
  t5_responseCompleted?: number;
}

export interface ResponseMetrics {
  /** T0: Timestamp when user submitted input (ms) */
  inputTimestamp: number;
  /** T1: Timestamp when DARK acknowledged input (ms) */
  acknowledgementTimestamp?: number;
  /** T2: Timestamp when network/AI request was dispatched (ms) */
  requestStartTimestamp: number;
  /** T3: Timestamp when first response token was received (ms) */
  firstTokenTimestamp?: number;
  /** T4: Timestamp when first visible text was rendered (ms) */
  firstRenderTimestamp?: number;
  /** T5: Timestamp when response completed (ms) */
  responseCompleteTimestamp?: number;

  /** Latency: T1 - T0 (Input acknowledgment latency in ms) */
  inputToAcknowledgement?: number;
  /** Latency: T2 - T0 (Request startup latency in ms) */
  inputToRequest: number;
  /** Latency: T3 - T2 (Time to first token / TTFT in ms) */
  requestToFirstToken?: number;
  /** Latency: T4 - T0 (Time to first visible response in ms) */
  timeToFirstVisible?: number;
  /** Latency: T5 - T3 (Streaming duration in ms) */
  firstTokenToComplete?: number;
  /** Latency: T5 - T0 (Total roundtrip response time in ms) */
  totalResponseTime?: number;

  /** Optional throughput tracking */
  totalTokensApprox?: number;
  tokensPerSecond?: number;

  /** Unique identifier for the tracked request */
  requestId?: string;
  /** Raw milestone timestamps */
  milestones?: ResponseMilestones;
}

/**
 * Calculates derived metrics from captured T0-T5 milestones.
 */
export function calculateResponseMetrics(
  milestones: ResponseMilestones,
  options?: {
    requestId?: string;
    totalTokensApprox?: number;
  }
): ResponseMetrics {
  const {
    t0_inputSubmitted,
    t1_acknowledged,
    t2_requestDispatched,
    t3_firstDataReceived,
    t4_firstVisibleRender,
    t5_responseCompleted,
  } = milestones;

  const requestStart = t2_requestDispatched ?? t1_acknowledged ?? t0_inputSubmitted;

  const inputToAck =
    typeof t1_acknowledged === 'number'
      ? Math.max(0, Math.round(t1_acknowledged - t0_inputSubmitted))
      : undefined;

  const inputToReq = Math.max(0, Math.round(requestStart - t0_inputSubmitted));

  const requestToFirst =
    typeof t3_firstDataReceived === 'number'
      ? Math.max(0, Math.round(t3_firstDataReceived - requestStart))
      : undefined;

  const timeToVisible =
    typeof t4_firstVisibleRender === 'number'
      ? Math.max(0, Math.round(t4_firstVisibleRender - t0_inputSubmitted))
      : typeof t3_firstDataReceived === 'number'
        ? Math.max(0, Math.round(t3_firstDataReceived - t0_inputSubmitted))
        : undefined;

  const streamDuration =
    typeof t5_responseCompleted === 'number' && typeof t3_firstDataReceived === 'number'
      ? Math.max(0, Math.round(t5_responseCompleted - t3_firstDataReceived))
      : undefined;

  const totalTime =
    typeof t5_responseCompleted === 'number'
      ? Math.max(0, Math.round(t5_responseCompleted - t0_inputSubmitted))
      : undefined;

  let tokensPerSec: number | undefined;
  if (
    options?.totalTokensApprox &&
    typeof streamDuration === 'number' &&
    streamDuration > 0
  ) {
    tokensPerSec = Math.round((options.totalTokensApprox / (streamDuration / 1000)) * 10) / 10;
  }

  return {
    inputTimestamp: t0_inputSubmitted,
    acknowledgementTimestamp: t1_acknowledged,
    requestStartTimestamp: requestStart,
    firstTokenTimestamp: t3_firstDataReceived,
    firstRenderTimestamp: t4_firstVisibleRender,
    responseCompleteTimestamp: t5_responseCompleted,

    inputToAcknowledgement: inputToAck,
    inputToRequest: inputToReq,
    requestToFirstToken: requestToFirst,
    timeToFirstVisible: timeToVisible,
    firstTokenToComplete: streamDuration,
    totalResponseTime: totalTime,

    totalTokensApprox: options?.totalTokensApprox,
    tokensPerSecond: tokensPerSec,
    requestId: options?.requestId,
    milestones: { ...milestones },
  };
}

/**
 * Tracking utility to capture T0 through T5 response milestones.
 */
export class ResponseMilestoneTracker {
  private milestones: ResponseMilestones;
  private requestId?: string;
  private approxTokens?: number;

  constructor(requestId?: string, t0?: number) {
    this.requestId = requestId;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.milestones = {
      t0_inputSubmitted: t0 ?? now,
    };
  }

  /**
   * T0: User submits input
   */
  public markT0(timestamp?: number): this {
    this.milestones.t0_inputSubmitted = timestamp ?? this.now();
    return this;
  }

  /**
   * T1: DARK acknowledges input (near-instant UI/Core state transition)
   */
  public markT1(timestamp?: number): this {
    this.milestones.t1_acknowledged = timestamp ?? this.now();
    return this;
  }

  /**
   * T2: AI request begins (dispatch to network or API service)
   */
  public markT2(timestamp?: number): this {
    this.milestones.t2_requestDispatched = timestamp ?? this.now();
    return this;
  }

  /**
   * T3: First response data arrives (TTFT)
   */
  public markT3(timestamp?: number): this {
    this.milestones.t3_firstDataReceived = timestamp ?? this.now();
    return this;
  }

  /**
   * T4: First visible text renders in UI
   */
  public markT4(timestamp?: number): this {
    this.milestones.t4_firstVisibleRender = timestamp ?? this.now();
    return this;
  }

  /**
   * T5: Response completes
   */
  public markT5(approxTokens?: number, timestamp?: number): this {
    this.milestones.t5_responseCompleted = timestamp ?? this.now();
    if (typeof approxTokens === 'number') {
      this.approxTokens = approxTokens;
    }
    return this;
  }

  public setApproxTokens(count: number): this {
    this.approxTokens = count;
    return this;
  }

  public setRequestId(id: string): this {
    this.requestId = id;
    return this;
  }

  public getMilestones(): Readonly<ResponseMilestones> {
    return { ...this.milestones };
  }

  public toMetrics(): ResponseMetrics {
    return calculateResponseMetrics(this.milestones, {
      requestId: this.requestId,
      totalTokensApprox: this.approxTokens,
    });
  }

  private now(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }
}

/**
 * Factory to instantiate a fresh response milestone tracker.
 */
export function createResponseTracker(requestId?: string, t0?: number): ResponseMilestoneTracker {
  return new ResponseMilestoneTracker(requestId, t0);
}
