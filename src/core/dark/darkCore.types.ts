/**
 * DARK CORE — PHASE 2: CORE STATES
 * Type definitions for Dark Core observable state machine, activity profiles, and configuration.
 */

import { DarkCoreEvent, DarkCoreEventPayload } from './darkCore.events';

export type DarkCoreState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export type CoreIntensity = 'low' | 'medium' | 'high';

export type DarkCoreSize = 'sm' | 'md' | 'lg' | 'xl';

export type ParticleDriftDirection = 'ambient' | 'inward' | 'outward';

/**
 * Observable activity profile specifying the mechanical and visual behavior of each state.
 */
export interface CoreActivityProfile {
  intensity: CoreIntensity;
  pulseSpeed: number;           // Breathing and central pulse frequency multiplier
  orbitSpeed: number;           // Orbital rings rotational velocity multiplier
  particleActivity: number;     // Particle velocity and excitation factor (0..1)
  particleDriftDirection: ParticleDriftDirection;
  brightness: number;           // Aura luminous opacity intensity (0..1)
  waveformAmplitude: number;    // Energy boundary reactive oscillation amplitude multiplier
  distortion: number;           // Non-destructive instability/jitter factor (0..1)
}

/**
 * Centralized declarative configuration for a specific Core state.
 */
export interface DarkCoreStateConfig {
  state: DarkCoreState;
  label: string;
  subLabel: string;
  intensity: CoreIntensity;
  description: string;
  accessibleAnnouncement: string;
  profile: CoreActivityProfile;
  onEnter?: () => void;
  onExit?: () => void;
}

/**
 * Snapshot of the current authoritative Core state.
 */
export interface DarkCoreSnapshot {
  state: DarkCoreState;
  intensity: CoreIntensity;
  previousState: DarkCoreState | null;
  lastTransitionTimestamp: number;
  config: DarkCoreStateConfig;
  profile: CoreActivityProfile;
  errorDetails?: string | null;
}

export type DarkCoreListener = (snapshot: DarkCoreSnapshot) => void;

/**
 * Central controller interface.
 */
export interface DarkCoreController {
  getState(): DarkCoreState;
  getIntensity(): CoreIntensity;
  getConfig(): DarkCoreStateConfig;
  getProfile(): CoreActivityProfile;
  getSnapshot(): DarkCoreSnapshot;
  transition(event: DarkCoreEvent, payload?: DarkCoreEventPayload): boolean;
  canTransition(event: DarkCoreEvent): boolean;
  setState(state: DarkCoreState, errorDetails?: string | null): void;
  interrupt(reason?: string): void;
  cancel(): void;
  recover(): void;
  reset(): void;
  subscribe(listener: DarkCoreListener): () => void;
}
