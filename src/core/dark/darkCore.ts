/**
 * DARK CORE — PHASE 2: CORE STATES
 * Authoritative Central Dark Core State Machine & Controller
 */

import {
  CoreActivityProfile,
  CoreIntensity,
  DarkCoreController,
  DarkCoreListener,
  DarkCoreSnapshot,
  DarkCoreState,
  DarkCoreStateConfig,
} from './darkCore.types';
import { DarkCoreEvent, DarkCoreEventPayload } from './darkCore.events';
import { DARK_CORE_STATES } from './darkCore.states';
import { resolveNextState, canTransitionFrom } from './darkCore.transitions';

export class DarkCoreManager implements DarkCoreController {
  private state: DarkCoreState = 'idle';
  private intensity: CoreIntensity = 'low';
  private previousState: DarkCoreState | null = null;
  private lastTransitionTimestamp: number = Date.now();
  private errorDetails: string | null = null;
  private listeners: Set<DarkCoreListener> = new Set();

  constructor(initialState: DarkCoreState = 'idle') {
    this.state = initialState;
    this.intensity = DARK_CORE_STATES[initialState].intensity;
  }

  public getState(): DarkCoreState {
    return this.state;
  }

  public getIntensity(): CoreIntensity {
    return this.intensity;
  }

  public getConfig(): DarkCoreStateConfig {
    return DARK_CORE_STATES[this.state];
  }

  public getProfile(): CoreActivityProfile {
    return DARK_CORE_STATES[this.state].profile;
  }

  public getSnapshot(): DarkCoreSnapshot {
    return {
      state: this.state,
      intensity: this.intensity,
      previousState: this.previousState,
      lastTransitionTimestamp: this.lastTransitionTimestamp,
      config: this.getConfig(),
      profile: this.getProfile(),
      errorDetails: this.errorDetails,
    };
  }

  public subscribe(listener: DarkCoreListener): () => void {
    this.listeners.add(listener);
    // Notify immediately with current snapshot
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[DarkCore] Listener callback error:', err);
      }
    }
  }

  public canTransition(event: DarkCoreEvent): boolean {
    return canTransitionFrom(this.state, event);
  }

  /**
   * Internal state setter handling onExit, onEnter, and notification.
   */
  public setState(nextState: DarkCoreState, errorDetails: string | null = null): void {
    if (this.state === nextState && this.errorDetails === errorDetails) {
      return; // Prevent duplicate state dispatch
    }

    const prevState = this.state;
    const prevConfig = DARK_CORE_STATES[prevState];
    const nextConfig = DARK_CORE_STATES[nextState];

    // Trigger onExit if defined
    if (prevConfig?.onExit) {
      try {
        prevConfig.onExit();
      } catch (err) {
        console.error(`[DarkCore] Error onExit (${prevState}):`, err);
      }
    }

    this.previousState = prevState;
    this.state = nextState;
    this.intensity = nextConfig.intensity;
    this.lastTransitionTimestamp = Date.now();
    this.errorDetails = errorDetails;

    // Trigger onEnter if defined
    if (nextConfig?.onEnter) {
      try {
        nextConfig.onEnter();
      } catch (err) {
        console.error(`[DarkCore] Error onEnter (${nextState}):`, err);
      }
    }

    this.notify();
  }

  /**
   * Event-driven state transition with validation against TRANSITION_RULES matrix.
   */
  public transition(event: DarkCoreEvent, payload?: DarkCoreEventPayload): boolean {
    const nextState = resolveNextState(this.state, event);

    if (!nextState) {
      // Safe no-op on invalid transition to prevent undefined behavior
      return false;
    }

    const errDetails =
      event === 'ERROR_OCCURRED'
        ? (payload?.reason as string) || 'System execution fault'
        : null;

    this.setState(nextState, errDetails);
    return true;
  }

  // Interruption and recovery utilities
  public interrupt(reason: string = 'Interrupted by user'): void {
    if (this.state === 'speaking') {
      this.transition('USER_INTERRUPT', { reason });
    } else {
      this.transition('ERROR_OCCURRED', { reason });
    }
  }

  public cancel(): void {
    this.transition('USER_CANCELLED');
  }

  public recover(): void {
    this.transition('RECOVERY');
  }

  public reset(): void {
    this.transition('RESET');
  }

  // Semantic lifecycle helpers
  public triggerListening(): void {
    this.transition('USER_INPUT');
  }

  public triggerThinking(): void {
    this.transition('INPUT_SUBMITTED');
  }

  public triggerSpeaking(): void {
    this.transition('RESPONSE_READY');
  }

  public triggerComplete(): void {
    this.transition('SPEECH_FINISHED');
  }

  public triggerError(reason?: string): void {
    this.transition('ERROR_OCCURRED', { reason });
  }

  /**
   * Phase 2 interactive lifecycle simulation for testing and verification.
   */
  public simulateLifecycle(onDone?: () => void): () => void {
    let canceled = false;
    const timeouts: NodeJS.Timeout[] = [];

    this.transition('USER_INPUT');

    timeouts.push(
      setTimeout(() => {
        if (canceled) return;
        this.transition('INPUT_SUBMITTED');
      }, 750)
    );

    timeouts.push(
      setTimeout(() => {
        if (canceled) return;
        this.transition('RESPONSE_READY');
      }, 2100)
    );

    timeouts.push(
      setTimeout(() => {
        if (canceled) return;
        this.transition('SPEECH_FINISHED');
        if (onDone) onDone();
      }, 4300)
    );

    return () => {
      canceled = true;
      timeouts.forEach(clearTimeout);
      this.reset();
    };
  }
}

// Global authoritative singleton instance
export const darkCore = new DarkCoreManager('idle');
