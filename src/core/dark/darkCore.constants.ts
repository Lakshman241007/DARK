/**
 * DARK CORE — PHASE 2: CORE STATES
 * Core Constants & Configuration Mapping
 */

import { DarkCoreSize, DarkCoreState, CoreIntensity } from './darkCore.types';
import { DARK_CORE_STATES } from './darkCore.states';

export { DARK_CORE_STATES };

export const STATE_INTENSITY_MAP: Record<DarkCoreState, CoreIntensity> = {
  idle: DARK_CORE_STATES.idle.intensity,
  listening: DARK_CORE_STATES.listening.intensity,
  thinking: DARK_CORE_STATES.thinking.intensity,
  speaking: DARK_CORE_STATES.speaking.intensity,
  error: DARK_CORE_STATES.error.intensity,
};

export const STATE_DISPLAY_LABELS: Record<
  DarkCoreState,
  { primary: string; secondary: string; description: string }
> = {
  idle: {
    primary: DARK_CORE_STATES.idle.label,
    secondary: DARK_CORE_STATES.idle.subLabel,
    description: DARK_CORE_STATES.idle.description,
  },
  listening: {
    primary: DARK_CORE_STATES.listening.label,
    secondary: DARK_CORE_STATES.listening.subLabel,
    description: DARK_CORE_STATES.listening.description,
  },
  thinking: {
    primary: DARK_CORE_STATES.thinking.label,
    secondary: DARK_CORE_STATES.thinking.subLabel,
    description: DARK_CORE_STATES.thinking.description,
  },
  speaking: {
    primary: DARK_CORE_STATES.speaking.label,
    secondary: DARK_CORE_STATES.speaking.subLabel,
    description: DARK_CORE_STATES.speaking.description,
  },
  error: {
    primary: DARK_CORE_STATES.error.label,
    secondary: DARK_CORE_STATES.error.subLabel,
    description: DARK_CORE_STATES.error.description,
  },
};

export const CORE_DIMENSIONS: Record<DarkCoreSize, number> = {
  sm: 48,
  md: 96,
  lg: 170,
  xl: 230,
};

export const MONOCHROME_PALETTE = {
  pureBlack: '#000000',
  black05: '#050505',
  black0A: '#0A0A0A',
  black11: '#111111',
  black18: '#181818',
  black22: '#222222',
  gray33: '#333333',
  gray55: '#555555',
  gray77: '#777777',
  grayAA: '#AAAAAA',
  grayDD: '#DDDDDD',
  offWhite: '#F5F5F5',
  pureWhite: '#FFFFFF',
} as const;
