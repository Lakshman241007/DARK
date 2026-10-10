/**
 * DARK CORE — PHASE 4: CORE ENVIRONMENT
 * Configuration constants for spatial rendering, layers, and monochromatic palettes.
 */

import { StarDensity, EnvironmentSettings } from './darkEnvironment.types';

export const STAR_DENSITY_FACTORS: Record<StarDensity, number> = {
  sparse: 9000,    // Fewer stars (~120-150 on typical desktop)
  balanced: 6000,  // Standard density (~200-260 on desktop)
  dense: 4000,     // Higher star count (~350-400 on desktop)
};

export const LAYER_CONFIG = {
  1: {
    // Distant / Deep space
    minSize: 0.3,
    maxSize: 0.8,
    minAlpha: 0.12,
    maxAlpha: 0.38,
    parallaxScale: 0.15, // Subtle parallax
    speedScale: 0.3,
  },
  2: {
    // Midfield
    minSize: 0.7,
    maxSize: 1.2,
    minAlpha: 0.3,
    maxAlpha: 0.65,
    parallaxScale: 0.5,
    speedScale: 0.65,
  },
  3: {
    // Foreground / Near
    minSize: 1.1,
    maxSize: 1.6,
    minAlpha: 0.55,
    maxAlpha: 0.95,
    parallaxScale: 1.0, // Full parallax displacement
    speedScale: 1.0,
  },
};

export const DEFAULT_ENVIRONMENT_SETTINGS: EnvironmentSettings = {
  density: 'balanced',
  parallaxEnabled: true,
  shootingStarsEnabled: true,
  reducedMotion: false,
};

// Strict Monochrome Palette Constants (Black / White / Grayscale Only)
export const MONOCHROME_PALETTE = {
  bg: '#000000',
  starPure: 'rgba(255, 255, 255, 1)',
  starDim: 'rgba(210, 210, 210, 0.4)',
  starHalo: 'rgba(255, 255, 255, 0.12)',
  atmosphereCore: 'rgba(255, 255, 255, 0.06)',
  atmosphereMist: 'rgba(200, 200, 200, 0.02)',
  rippleStroke: 'rgba(255, 255, 255, 0.35)',
};
