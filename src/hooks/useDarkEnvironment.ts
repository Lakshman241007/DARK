/**
 * DARK CORE — PHASE 4: CORE ENVIRONMENT
 * React hook for consuming environmental state, metrics, and actions
 */

import { useEffect, useState, useCallback } from 'react';
import { darkEnvironment } from '../core/environment/darkEnvironment.controller';
import {
  EnvironmentSnapshot,
  EnvironmentSettings,
  EnvironmentStateProfile,
  StarDensity,
} from '../core/environment/darkEnvironment.types';

export interface UseDarkEnvironmentReturn {
  snapshot: EnvironmentSnapshot;
  profile: EnvironmentStateProfile;
  settings: EnvironmentSettings;
  setDensity: (density: StarDensity) => void;
  toggleParallax: () => void;
  toggleShootingStars: () => void;
  updateSettings: (updates: Partial<EnvironmentSettings>) => void;
  triggerRipple: (originX?: number, originY?: number) => void;
  triggerShootingStar: () => void;
}

export function useDarkEnvironment(): UseDarkEnvironmentReturn {
  const [snapshot, setSnapshot] = useState<EnvironmentSnapshot>(() => darkEnvironment.getSnapshot());

  useEffect(() => {
    const unsubscribe = darkEnvironment.subscribe((nextSnapshot) => {
      setSnapshot(nextSnapshot);
    });
    return unsubscribe;
  }, []);

  const setDensity = useCallback((density: StarDensity) => {
    darkEnvironment.setDensity(density);
  }, []);

  const toggleParallax = useCallback(() => {
    darkEnvironment.toggleParallax();
  }, []);

  const toggleShootingStars = useCallback(() => {
    darkEnvironment.toggleShootingStars();
  }, []);

  const updateSettings = useCallback((updates: Partial<EnvironmentSettings>) => {
    darkEnvironment.updateSettings(updates);
  }, []);

  const triggerRipple = useCallback((originX?: number, originY?: number) => {
    darkEnvironment.triggerSpatialRipple(originX, originY);
  }, []);

  const triggerShootingStar = useCallback(() => {
    darkEnvironment.triggerShootingStar();
  }, []);

  return {
    snapshot,
    profile: snapshot.profile,
    settings: snapshot.settings,
    setDensity,
    toggleParallax,
    toggleShootingStars,
    updateSettings,
    triggerRipple,
    triggerShootingStar,
  };
}
