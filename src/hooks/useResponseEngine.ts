/**
 * DARK CORE — PHASE 4.1: CORE RESPONSE ENGINE
 * React hook for consuming real-time response latency metrics and telemetry.
 */

import { useState, useEffect } from 'react';
import { responseEngine } from '../core/response/responseEngine.controller';
import { ResponseEngineState } from '../core/response/responseMetrics.types';

export function useResponseEngine(): ResponseEngineState & {
  clearHistory: () => void;
} {
  const [engineState, setEngineState] = useState<ResponseEngineState>(() =>
    responseEngine.getState()
  );

  useEffect(() => {
    const unsubscribe = responseEngine.subscribe((next) => {
      setEngineState(next);
    });
    return unsubscribe;
  }, []);

  return {
    ...engineState,
    clearHistory: () => responseEngine.clearHistory(),
  };
}
