/**
 * DARK CORE — PHASE 2: CORE STATES
 * Centralized State Configurations & Activity Profiles
 */

import { DarkCoreState, DarkCoreStateConfig } from './darkCore.types';

export const DARK_CORE_STATES: Record<DarkCoreState, DarkCoreStateConfig> = {
  idle: {
    state: 'idle',
    label: 'DARK',
    subLabel: 'READY',
    intensity: 'low',
    description: 'System standing by. Waiting for command input.',
    accessibleAnnouncement: 'DARK is ready and waiting for command.',
    profile: {
      intensity: 'low',
      pulseSpeed: 0.75,
      orbitSpeed: 0.55,
      particleActivity: 0.25,
      particleDriftDirection: 'ambient',
      brightness: 0.22,
      waveformAmplitude: 0,
      distortion: 0,
    },
  },

  listening: {
    state: 'listening',
    label: 'DARK',
    subLabel: 'LISTENING',
    intensity: 'medium',
    description: 'Actively receiving user input. Orbital and energy focus responsive.',
    accessibleAnnouncement: 'DARK is actively listening to input.',
    profile: {
      intensity: 'medium',
      pulseSpeed: 1.45,
      orbitSpeed: 1.25,
      particleActivity: 0.6,
      particleDriftDirection: 'inward',
      brightness: 0.44,
      waveformAmplitude: 0.025,
      distortion: 0,
    },
  },

  thinking: {
    state: 'thinking',
    label: 'DARK',
    subLabel: 'THINKING',
    intensity: 'high',
    description: 'Processing information and synthesizing state internally.',
    accessibleAnnouncement: 'DARK is processing your request.',
    profile: {
      intensity: 'high',
      pulseSpeed: 2.85,
      orbitSpeed: 2.65,
      particleActivity: 1.0,
      particleDriftDirection: 'inward',
      brightness: 0.68,
      waveformAmplitude: 0.055,
      distortion: 0,
    },
  },

  speaking: {
    state: 'speaking',
    label: 'DARK',
    subLabel: 'SPEAKING',
    intensity: 'medium',
    description: 'Delivering response. Emitting rhythmic visual energy.',
    accessibleAnnouncement: 'DARK is delivering response output.',
    profile: {
      intensity: 'medium',
      pulseSpeed: 1.95,
      orbitSpeed: 1.65,
      particleActivity: 0.65,
      particleDriftDirection: 'ambient',
      brightness: 0.55,
      waveformAmplitude: 0.085,
      distortion: 0,
    },
  },

  error: {
    state: 'error',
    label: 'DARK',
    subLabel: 'INTERRUPTED',
    intensity: 'low',
    description: 'System encountered an execution interruption.',
    accessibleAnnouncement: 'DARK encountered a system interruption.',
    profile: {
      intensity: 'low',
      pulseSpeed: 0.4,
      orbitSpeed: 0.3,
      particleActivity: 0.2,
      particleDriftDirection: 'ambient',
      brightness: 0.26,
      waveformAmplitude: 0,
      distortion: 0.55, // Restrained monochrome instability (Strictly NO RED)
    },
  },
};
