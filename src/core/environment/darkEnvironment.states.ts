/**
 * DARK CORE — PHASE 4: CORE ENVIRONMENT
 * State-specific environmental profiles ensuring the living starfield and spatial atmosphere
 * respond harmoniously to DARK's internal intelligence states.
 */

import { DarkCoreState } from '../dark/darkCore.types';
import { EnvironmentStateProfile } from './darkEnvironment.types';

export const ENVIRONMENT_STATE_PROFILES: Record<DarkCoreState, EnvironmentStateProfile> = {
  idle: {
    state: 'idle',
    twinkleMultiplier: 1.0,
    driftMultiplier: 1.0,
    atmosphericGlowOpacity: 0.05,
    glowRadiusMultiplier: 1.0,
    parallaxSensitivity: 1.0,
    shootingStarsEnabled: true,
    dustVisibility: 0.03,
    description: 'Serene, natural starfield with gentle twinkling and slow spatial drift.',
  },
  listening: {
    state: 'listening',
    twinkleMultiplier: 0.8,
    driftMultiplier: 0.6, // Stars steady themselves, atmospheric focus
    atmosphericGlowOpacity: 0.09,
    glowRadiusMultiplier: 1.15,
    parallaxSensitivity: 1.2,
    shootingStarsEnabled: true,
    dustVisibility: 0.05,
    description: 'Focused stillness with heightened celestial clarity and soft gravitational pull.',
  },
  thinking: {
    state: 'thinking',
    twinkleMultiplier: 1.7, // Energetic twinkle pulsation
    driftMultiplier: 1.35,
    atmosphericGlowOpacity: 0.12,
    glowRadiusMultiplier: 1.3,
    parallaxSensitivity: 1.1,
    shootingStarsEnabled: true,
    dustVisibility: 0.08,
    description: 'Active computational pulsation; stars shimmer with accelerated cadence.',
  },
  speaking: {
    state: 'speaking',
    twinkleMultiplier: 1.25,
    driftMultiplier: 1.15,
    atmosphericGlowOpacity: 0.15, // Rhythmic vocal resonance in the spatial mist
    glowRadiusMultiplier: 1.45,
    parallaxSensitivity: 1.0,
    shootingStarsEnabled: true,
    dustVisibility: 0.09,
    description: 'Harmonic spatial resonance; luminous atmosphere breathes in sync with voice output.',
  },
  error: {
    state: 'error',
    twinkleMultiplier: 0.5, // Erratic/dimmed
    driftMultiplier: 0.35,
    atmosphericGlowOpacity: 0.03, // Subdued atmosphere
    glowRadiusMultiplier: 0.8,
    parallaxSensitivity: 0.6,
    shootingStarsEnabled: false, // Cease shooting stars during system desync
    dustVisibility: 0.02,
    description: 'Subdued celestial activity with monochromatic stillness and paused meteors.',
  },
};
