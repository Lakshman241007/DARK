/**
 * DARK CORE — PHASE 4: CORE ENVIRONMENT
 * Living Starfield, Spatial Atmosphere, Depth Parallax, and State-Responsive Ripples.
 * Strictly Monochrome: Pure Black, Whites, Grays, and Soft Diffuse Light.
 */

import React, { useEffect, useRef } from 'react';
import { useDarkCore } from '../../hooks/useDarkCore';
import { darkEnvironment } from '../../core/environment/darkEnvironment.controller';
import {
  Star,
  ShootingStar,
  SpatialRipple,
  AtmosphericGlow,
  StarLayer,
} from '../../core/environment/darkEnvironment.types';
import {
  STAR_DENSITY_FACTORS,
  LAYER_CONFIG,
} from '../../core/environment/darkEnvironment.constants';
import { ENVIRONMENT_STATE_PROFILES } from '../../core/environment/darkEnvironment.states';

export const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { state: coreState } = useDarkCore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // High DPI scaling (clamped to 2 for optimal 60fps performance)
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Accessibility check
    let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    // Parallax tracking with smooth damping
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalized between -1 and 1
      targetMouseX = (e.clientX / width - 0.5) * 2;
      targetMouseY = (e.clientY / height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Multi-layer Starfield Generation
    let stars: Star[] = [];
    const settings = darkEnvironment.getSettings();

    const generateStars = () => {
      const currentDensity = darkEnvironment.getSettings().density;
      const divisor = STAR_DENSITY_FACTORS[currentDensity] || 6000;
      const count = Math.max(120, Math.floor((width * height) / divisor));
      stars = [];

      for (let i = 0; i < count; i++) {
        // Distribute layers: 50% Layer 1 (far), 35% Layer 2 (mid), 15% Layer 3 (near)
        const rand = Math.random();
        const layer: StarLayer = rand < 0.5 ? 1 : rand < 0.85 ? 2 : 3;
        const config = LAYER_CONFIG[layer];

        const size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
        const baseAlpha = Math.random() * (config.maxAlpha - config.minAlpha) + config.minAlpha;

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: (Math.random() * 0.02 + 0.008) * (layer === 3 ? 1.3 : 1.0),
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.03 * config.speedScale,
          vy: (Math.random() * 0.02 + 0.008) * config.speedScale,
          layer,
          excitation: 0,
        });
      }

      darkEnvironment.updateInternalMetrics({ starCount: count });
    };

    generateStars();

    // Shooting stars collection
    let shootingStars: ShootingStar[] = [];
    let nextShootingStarTime = Date.now() + (Math.random() * 8000 + 6000);

    const spawnShootingStar = () => {
      const startX = Math.random() * (width * 0.8) + width * 0.2;
      const startY = Math.random() * (height * 0.25);
      // Angle ~130 to 155 degrees (diagonal down-left)
      const angle = (Math.PI / 180) * (Math.random() * 25 + 130);
      const speed = Math.random() * 8 + 12;
      const length = Math.random() * 90 + 75;

      const star: ShootingStar = {
        id: `ss-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        x: startX,
        y: startY,
        length,
        speed,
        angle,
        alpha: 1,
        fadeSpeed: 0.016,
        active: true,
        trail: [],
      };

      shootingStars.push(star);
    };

    // Listen to manual shooting star trigger
    const unbindShootingStar = darkEnvironment.onShootingStar(() => {
      spawnShootingStar();
    });

    // Spatial ripples collection
    let activeRipples: SpatialRipple[] = [];

    const unbindRipple = darkEnvironment.onRipple((newRipple) => {
      if (!prefersReducedMotion) {
        activeRipples.push(newRipple);
      }
    });

    // Atmospheric Glow Fields (monochromatic soft lighting behind Core and ambient space)
    const atmosphericGlows: AtmosphericGlow[] = [
      {
        x: width * 0.5,
        y: height * 0.38, // Positioned behind the Dark Core hero position
        radius: Math.min(width, height) * 0.42,
        baseAlpha: 0.06,
        alpha: 0.06,
        pulsePhase: 0,
        pulseSpeed: 0.012,
      },
      {
        x: width * 0.5,
        y: height * 0.75, // Subtle lower ambient depth
        radius: Math.min(width, height) * 0.5,
        baseAlpha: 0.02,
        alpha: 0.02,
        pulsePhase: Math.PI,
        pulseSpeed: 0.008,
      },
    ];

    // Smoothly interpolated environmental profile
    const currentProfile = { ...ENVIRONMENT_STATE_PROFILES[coreState] };

    // Dynamic resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Re-anchor atmospheric glow centers
      if (atmosphericGlows[0]) {
        atmosphericGlows[0].x = width * 0.5;
        atmosphericGlows[0].y = height * 0.38;
        atmosphericGlows[0].radius = Math.min(width, height) * 0.42;
      }
      if (atmosphericGlows[1]) {
        atmosphericGlows[1].x = width * 0.5;
        atmosphericGlows[1].y = height * 0.75;
        atmosphericGlows[1].radius = Math.min(width, height) * 0.5;
      }

      generateStars();
    };

    window.addEventListener('resize', handleResize);

    // Tab visibility handling to pause RAF and save battery
    let isPaused = false;
    const handleVisibility = () => {
      isPaused = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Interpolation helper
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    let time = 0;

    // Main 60fps Environmental Render Loop
    const render = () => {
      if (!isPaused && ctx) {
        time += 0.016;

        // Smoothly interpolate profile towards target core state profile
        const targetProfile = ENVIRONMENT_STATE_PROFILES[coreState] || ENVIRONMENT_STATE_PROFILES.idle;
        currentProfile.twinkleMultiplier = lerp(currentProfile.twinkleMultiplier, targetProfile.twinkleMultiplier, 0.05);
        currentProfile.driftMultiplier = lerp(currentProfile.driftMultiplier, targetProfile.driftMultiplier, 0.05);
        currentProfile.atmosphericGlowOpacity = lerp(
          currentProfile.atmosphericGlowOpacity,
          targetProfile.atmosphericGlowOpacity,
          0.05
        );
        currentProfile.glowRadiusMultiplier = lerp(
          currentProfile.glowRadiusMultiplier,
          targetProfile.glowRadiusMultiplier,
          0.05
        );

        // Parallax damping
        const envSettings = darkEnvironment.getSettings();
        if (envSettings.parallaxEnabled && !prefersReducedMotion) {
          currentParallaxX = lerp(currentParallaxX, targetMouseX * 18 * targetProfile.parallaxSensitivity, 0.04);
          currentParallaxY = lerp(currentParallaxY, targetMouseY * 18 * targetProfile.parallaxSensitivity, 0.04);
        } else {
          currentParallaxX = lerp(currentParallaxX, 0, 0.05);
          currentParallaxY = lerp(currentParallaxY, 0, 0.05);
        }

        // 1. Draw Deep Black Void Background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // 2. Render State-Aware Atmospheric Glow Fields (Strict Monochrome Soft Light)
        for (let g = 0; g < atmosphericGlows.length; g++) {
          const glow = atmosphericGlows[g];
          glow.pulsePhase += glow.pulseSpeed * currentProfile.twinkleMultiplier;

          // Speaking waveform modulation or thinking frequency
          const stateMod =
            coreState === 'speaking'
              ? Math.sin(time * 3.5) * 0.04 + 0.04
              : coreState === 'thinking'
              ? Math.sin(time * 2.0) * 0.02
              : 0;

          const activeRadius = glow.radius * currentProfile.glowRadiusMultiplier;
          const activeAlpha = Math.max(
            0.01,
            Math.min(
              0.22,
              (glow.baseAlpha + Math.sin(glow.pulsePhase) * 0.015 + stateMod) *
                (currentProfile.atmosphericGlowOpacity / 0.05)
            )
          );

          const grad = ctx.createRadialGradient(
            glow.x + currentParallaxX * 0.2,
            glow.y + currentParallaxY * 0.2,
            0,
            glow.x + currentParallaxX * 0.2,
            glow.y + currentParallaxY * 0.2,
            activeRadius
          );

          grad.addColorStop(0, `rgba(255, 255, 255, ${activeAlpha})`);
          grad.addColorStop(0.4, `rgba(220, 220, 220, ${activeAlpha * 0.4})`);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(
            glow.x + currentParallaxX * 0.2,
            glow.y + currentParallaxY * 0.2,
            activeRadius,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // 3. Render and Propagate Spatial Ripples (Core State Transitions)
        for (let r = activeRipples.length - 1; r >= 0; r--) {
          const rip = activeRipples[r];
          rip.radius += rip.speed;
          rip.alpha = (1 - rip.radius / rip.maxRadius) * 0.32;

          if (rip.radius >= rip.maxRadius || rip.alpha <= 0.005) {
            activeRipples.splice(r, 1);
            continue;
          }

          // Draw delicate expanding ring
          ctx.beginPath();
          ctx.arc(rip.originX, rip.originY, rip.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${rip.alpha})`;
          ctx.lineWidth = 1.0;
          ctx.stroke();

          // Second faint trailing ring
          if (rip.radius > 40) {
            ctx.beginPath();
            ctx.arc(rip.originX, rip.originY, rip.radius - 20, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${rip.alpha * 0.4})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }

          // Excite stars that this wavefront collides with
          for (let sIdx = 0; sIdx < stars.length; sIdx++) {
            const st = stars[sIdx];
            const dist = Math.hypot(st.x - rip.originX, st.y - rip.originY);
            if (Math.abs(dist - rip.radius) < 25) {
              st.excitation = Math.max(st.excitation, rip.alpha * 1.8);
            }
          }
        }

        // 4. Update and Render Living Stars across Parallax Layers
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const layerCfg = LAYER_CONFIG[s.layer];

          // Twinkle calculation
          s.twinklePhase += s.twinkleSpeed * currentProfile.twinkleMultiplier;
          const twinkleFactor = Math.sin(s.twinklePhase) * (s.baseAlpha * 0.45);
          
          // Excitation decay from ripples
          if (s.excitation > 0.01) {
            s.excitation *= 0.95;
          } else {
            s.excitation = 0;
          }

          s.alpha = Math.max(
            0.05,
            Math.min(1.0, s.baseAlpha + twinkleFactor + s.excitation)
          );

          // Spatial drift if motion not reduced
          if (!prefersReducedMotion) {
            s.x += s.vx * currentProfile.driftMultiplier;
            s.y += s.vy * currentProfile.driftMultiplier;

            // Wrap edges seamlessly
            if (s.x < 0) s.x = width;
            if (s.x > width) s.x = 0;
            if (s.y < 0) s.y = height;
            if (s.y > height) s.y = 0;
          }

          // Layer Parallax offset
          const px = s.x + currentParallaxX * layerCfg.parallaxScale;
          const py = s.y + currentParallaxY * layerCfg.parallaxScale;

          // Render star dot
          ctx.beginPath();
          ctx.arc(px, py, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
          ctx.fill();

          // Subtle soft aura for brightest foreground layer-3 stars
          if (s.layer === 3 && s.alpha > 0.65) {
            ctx.beginPath();
            ctx.arc(px, py, s.size * 2.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${(s.alpha - 0.65) * 0.22})`;
            ctx.fill();
          }
        }

        // 5. Update and Render Shooting Stars (Meteors)
        const now = Date.now();
        const canSpawn =
          !prefersReducedMotion &&
          envSettings.shootingStarsEnabled &&
          targetProfile.shootingStarsEnabled;

        if (canSpawn && now > nextShootingStarTime && shootingStars.length < 2) {
          spawnShootingStar();
          // Schedule next shooting star between 12s and 28s
          nextShootingStarTime = now + (Math.random() * 16000 + 12000);
        }

        for (let sIdx = shootingStars.length - 1; sIdx >= 0; sIdx--) {
          const ss = shootingStars[sIdx];
          const vx = Math.cos(ss.angle) * ss.speed;
          const vy = Math.sin(ss.angle) * ss.speed;

          ss.x += vx;
          ss.y += vy;
          ss.alpha -= ss.fadeSpeed;

          if (ss.alpha <= 0 || ss.x < -120 || ss.y > height + 120) {
            shootingStars.splice(sIdx, 1);
            continue;
          }

          const tailX = ss.x - Math.cos(ss.angle) * ss.length;
          const tailY = ss.y - Math.sin(ss.angle) * ss.length;

          // Trail gradient: transparent tail to bright head
          const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(0.65, `rgba(220, 220, 220, ${ss.alpha * 0.35})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${ss.alpha * 0.95})`);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(ss.x, ss.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Radiant luminous head
          ctx.beginPath();
          ctx.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${ss.alpha})`;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.75)';
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0; // Clear shadow
        }

        // Update telemetry metrics periodically
        darkEnvironment.updateInternalMetrics({
          activeShootingStars: shootingStars.length,
          activeRipples: activeRipples.length,
          parallaxOffset: { x: currentParallaxX, y: currentParallaxY },
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      mediaQuery.removeEventListener('change', handleMotionChange);
      unbindShootingStar();
      unbindRipple();
    };
  }, [coreState]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-black"
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  );
};
