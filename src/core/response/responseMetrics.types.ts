/**
 * DARK CORE — PHASE 4.1: CORE RESPONSE ENGINE
 * Latency metrics, streaming telemetry, and response benchmark contracts.
 */

export type {
  ResponseMetrics,
  ResponseMilestones,
} from '../dark/response/response.metrics';
export {
  ResponseMilestoneTracker,
  createResponseTracker,
  calculateResponseMetrics,
} from '../dark/response/response.metrics';

import type { ResponseMetrics } from '../dark/response/response.metrics';

export type PipelinePhase =
  | 'idle'
  | 'acknowledged'
  | 'listening'
  | 'thinking'
  | 'streaming_first_token'
  | 'streaming'
  | 'completed'
  | 'interrupted'
  | 'error';

export interface ResponseEngineState {
  currentPhase: PipelinePhase;
  activeRequestId: string | null;
  activeMetrics: ResponseMetrics | null;
  lastCompletedMetrics: ResponseMetrics | null;
  averageTTFTMs: number;
  averageTotalTimeMs: number;
  history: ResponseMetrics[];
}
