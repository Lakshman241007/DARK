/**
 * DARK CORE — PHASE 4: CORE ENVIRONMENT
 * Centralized environment controller managing state synchronization, ripples, shooting stars,
 * and environmental configuration.
 */

import { darkCore } from '../dark/darkCore';
import { DarkCoreState, CoreIntensity } from '../dark/darkCore.types';
import {
  EnvironmentSettings,
  EnvironmentSnapshot,
  EnvironmentStateProfile,
  SpatialRipple,
  StarDensity,
} from './darkEnvironment.types';
import { DEFAULT_ENVIRONMENT_SETTINGS } from './darkEnvironment.constants';
import { ENVIRONMENT_STATE_PROFILES } from './darkEnvironment.states';

type EnvironmentListener = (snapshot: EnvironmentSnapshot) => void;
type RippleListener = (ripple: SpatialRipple) => void;
type ShootingStarListener = () => void;

class DarkEnvironmentController {
  private settings: EnvironmentSettings = { ...DEFAULT_ENVIRONMENT_SETTINGS };
  private activeCoreState: DarkCoreState = 'idle';
  private activeIntensity: CoreIntensity = 'low';
  private listeners: Set<EnvironmentListener> = new Set();
  private rippleListeners: Set<RippleListener> = new Set();
  private shootingStarListeners: Set<ShootingStarListener> = new Set();
  private activeRipplesCount = 0;
  private activeShootingStarsCount = 0;
  private currentParallax = { x: 0, y: 0 };
  private starCount = 200;

  constructor() {
    // Check initial prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.settings.reducedMotion = motionQuery.matches;
      motionQuery.addEventListener('change', (e) => {
        this.settings.reducedMotion = e.matches;
        this.notify();
      });
    }

    // Subscribe to authoritative DarkCore state
    darkCore.subscribe((coreSnapshot) => {
      const stateChanged = this.activeCoreState !== coreSnapshot.state;
      this.activeCoreState = coreSnapshot.state;
      this.activeIntensity = coreSnapshot.intensity;

      if (stateChanged) {
        // Trigger a subtle atmospheric ripple outwards from the Core
        this.triggerSpatialRipple();
      }

      this.notify();
    });
  }

  public getProfile(): EnvironmentStateProfile {
    return ENVIRONMENT_STATE_PROFILES[this.activeCoreState] || ENVIRONMENT_STATE_PROFILES.idle;
  }

  public getSettings(): EnvironmentSettings {
    return { ...this.settings };
  }

  public getSnapshot(): EnvironmentSnapshot {
    return {
      coreState: this.activeCoreState,
      coreIntensity: this.activeIntensity,
      profile: this.getProfile(),
      starCount: this.starCount,
      activeShootingStars: this.activeShootingStarsCount,
      activeRipples: this.activeRipplesCount,
      parallaxOffset: { ...this.currentParallax },
      settings: { ...this.settings },
    };
  }

  public updateSettings(updates: Partial<EnvironmentSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.notify();
  }

  public setDensity(density: StarDensity): void {
    this.settings.density = density;
    this.notify();
  }

  public toggleParallax(): void {
    this.settings.parallaxEnabled = !this.settings.parallaxEnabled;
    this.notify();
  }

  public toggleShootingStars(): void {
    this.settings.shootingStarsEnabled = !this.settings.shootingStarsEnabled;
    this.notify();
  }

  /**
   * Dispatches a spatial ripple expanding outward from the Core or specific coordinates
   */
  public triggerSpatialRipple(originX?: number, originY?: number, intensity = 1.0): void {
    if (this.settings.reducedMotion) return;

    // Default origin is viewport center / Core position
    const x = originX ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
    const y = originY ?? (typeof window !== 'undefined' ? window.innerHeight * 0.42 : 350);

    const ripple: SpatialRipple = {
      id: `ripple-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      originX: x,
      originY: y,
      radius: 20,
      maxRadius: typeof window !== 'undefined' ? Math.max(window.innerWidth, window.innerHeight) * 0.85 : 900,
      speed: 4.8 * (this.activeCoreState === 'thinking' ? 1.5 : 1.0),
      intensity,
      alpha: 0.38,
    };

    this.rippleListeners.forEach((listener) => listener(ripple));
  }

  /**
   * Manually spawns a shooting star immediately (useful for testing and user interaction)
   */
  public triggerShootingStar(): void {
    if (!this.settings.shootingStarsEnabled) return;
    this.shootingStarListeners.forEach((listener) => listener());
  }

  public updateInternalMetrics(metrics: {
    starCount?: number;
    activeShootingStars?: number;
    activeRipples?: number;
    parallaxOffset?: { x: number; y: number };
  }): void {
    if (metrics.starCount !== undefined) this.starCount = metrics.starCount;
    if (metrics.activeShootingStars !== undefined) this.activeShootingStarsCount = metrics.activeShootingStars;
    if (metrics.activeRipples !== undefined) this.activeRipplesCount = metrics.activeRipples;
    if (metrics.parallaxOffset !== undefined) this.currentParallax = metrics.parallaxOffset;
  }

  public subscribe(listener: EnvironmentListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  public onRipple(listener: RippleListener): () => void {
    this.rippleListeners.add(listener);
    return () => this.rippleListeners.delete(listener);
  }

  public onShootingStar(listener: ShootingStarListener): () => void {
    this.shootingStarListeners.add(listener);
    return () => this.shootingStarListeners.delete(listener);
  }

  private notify(): void {
    const snap = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snap));
  }
}

export const darkEnvironment = new DarkEnvironmentController();
