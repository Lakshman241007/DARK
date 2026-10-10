/**
 * DARK CORE — PHASE 4: CORE ENVIRONMENT
 * Type definitions for Living Starfield, Spatial Atmosphere, and Core-Environment Interaction.
 */

import { DarkCoreState, CoreIntensity } from '../dark/darkCore.types';

export type StarLayer = 1 | 2 | 3; // 1: Distant/Deep, 2: Midfield, 3: Foreground/Near

export interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  vx: number;
  vy: number;
  layer: StarLayer;
  excitation: number; // Temporary excitement when shockwave/ripple passes over (0..1)
}

export interface ShootingStar {
  id: string;
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  fadeSpeed: number;
  active: boolean;
  trail: { x: number; y: number }[];
}

export interface SpatialRipple {
  id: string;
  originX: number;
  originY: number;
  radius: number;
  maxRadius: number;
  speed: number;
  intensity: number;
  alpha: number;
}

export interface AtmosphericGlow {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

/**
 * Environmental behavior profile mapped to Core state
 */
export interface EnvironmentStateProfile {
  state: DarkCoreState;
  twinkleMultiplier: number;        // Speed/vigor of star twinkling
  driftMultiplier: number;          // Ambient spatial drift speed multiplier
  atmosphericGlowOpacity: number;   // Opacity of the central monochromatic aura (0..1)
  glowRadiusMultiplier: number;     // Expansion of atmospheric glow
  parallaxSensitivity: number;      // Depth parallax response multiplier (0..2)
  shootingStarsEnabled: boolean;    // Allow shooting stars in this state
  dustVisibility: number;           // Subtle spatial dust/mist visibility (0..1)
  description: string;
}

export type StarDensity = 'sparse' | 'balanced' | 'dense';

export interface EnvironmentSettings {
  density: StarDensity;
  parallaxEnabled: boolean;
  shootingStarsEnabled: boolean;
  reducedMotion: boolean;
}

export interface EnvironmentSnapshot {
  coreState: DarkCoreState;
  coreIntensity: CoreIntensity;
  profile: EnvironmentStateProfile;
  starCount: number;
  activeShootingStars: number;
  activeRipples: number;
  parallaxOffset: { x: number; y: number };
  settings: EnvironmentSettings;
}
