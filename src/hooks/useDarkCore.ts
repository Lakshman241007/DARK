/**
 * DARK CORE — PHASE 2: CORE STATES
 * React hook for consuming and controlling the centralized Dark Core
 */

import { useEffect, useState, useCallback } from 'react';
import { darkCore } from '../core/dark/darkCore';
import {
  DarkCoreSnapshot,
  DarkCoreState,
  CoreIntensity,
  DarkCoreStateConfig,
  CoreActivityProfile,
} from '../core/dark/darkCore.types';
import { DarkCoreEvent, DarkCoreEventPayload } from '../core/dark/darkCore.events';

export interface UseDarkCoreReturn {
  state: DarkCoreState;
  intensity: CoreIntensity;
  config: DarkCoreStateConfig;
  profile: CoreActivityProfile;
  snapshot: DarkCoreSnapshot;
  transition: (event: DarkCoreEvent, payload?: DarkCoreEventPayload) => boolean;
  canTransition: (event: DarkCoreEvent) => boolean;
  setState: (state: DarkCoreState, errorDetails?: string | null) => void;
  interrupt: (reason?: string) => void;
  cancel: () => void;
  recover: () => void;
  reset: () => void;
  triggerListening: () => void;
  triggerThinking: () => void;
  triggerSpeaking: () => void;
  triggerComplete: () => void;
  triggerError: (reason?: string) => void;
  simulateLifecycle: (onDone?: () => void) => () => void;
}

export function useDarkCore(): UseDarkCoreReturn {
  const [snapshot, setSnapshot] = useState<DarkCoreSnapshot>(() => darkCore.getSnapshot());

  useEffect(() => {
    const unsubscribe = darkCore.subscribe((nextSnapshot) => {
      setSnapshot(nextSnapshot);
    });
    return unsubscribe;
  }, []);

  const transition = useCallback(
    (event: DarkCoreEvent, payload?: DarkCoreEventPayload) => {
      return darkCore.transition(event, payload);
    },
    []
  );

  const canTransition = useCallback(
    (event: DarkCoreEvent) => {
      return darkCore.canTransition(event);
    },
    []
  );

  const setState = useCallback((state: DarkCoreState, errorDetails?: string | null) => {
    darkCore.setState(state, errorDetails);
  }, []);

  const interrupt = useCallback((reason?: string) => {
    darkCore.interrupt(reason);
  }, []);

  const cancel = useCallback(() => {
    darkCore.cancel();
  }, []);

  const recover = useCallback(() => {
    darkCore.recover();
  }, []);

  const reset = useCallback(() => {
    darkCore.reset();
  }, []);

  const triggerListening = useCallback(() => {
    darkCore.triggerListening();
  }, []);

  const triggerThinking = useCallback(() => {
    darkCore.triggerThinking();
  }, []);

  const triggerSpeaking = useCallback(() => {
    darkCore.triggerSpeaking();
  }, []);

  const triggerComplete = useCallback(() => {
    darkCore.triggerComplete();
  }, []);

  const triggerError = useCallback((reason?: string) => {
    darkCore.triggerError(reason);
  }, []);

  const simulateLifecycle = useCallback((onDone?: () => void) => {
    return darkCore.simulateLifecycle(onDone);
  }, []);

  return {
    state: snapshot.state,
    intensity: snapshot.intensity,
    config: snapshot.config,
    profile: snapshot.profile,
    snapshot,
    transition,
    canTransition,
    setState,
    interrupt,
    cancel,
    recover,
    reset,
    triggerListening,
    triggerThinking,
    triggerSpeaking,
    triggerComplete,
    triggerError,
    simulateLifecycle,
  };
}
