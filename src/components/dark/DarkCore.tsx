/**
 * DARK CORE — PHASE 2: CORE STATES
 * Abstract Circular Intelligence Visual Representation with Smooth State Transition Profiles
 */

import React, { useEffect, useRef } from 'react';
import { useDarkCore } from '../../hooks/useDarkCore';
import { DarkCoreSize, DarkCoreState, CoreActivityProfile } from '../../core/dark/darkCore.types';
import { CORE_DIMENSIONS } from '../../core/dark/darkCore.constants';
import { DARK_CORE_STATES } from '../../core/dark/darkCore.states';

interface DarkCoreProps {
  state?: DarkCoreState;
  size?: DarkCoreSize;
  showLabel?: boolean;
  className?: string;
}

export const DarkCore: React.FC<DarkCoreProps> = ({
  state: propState,
  size = 'lg',
  showLabel = true,
  className = '',
}) => {
  const { state: centralState } = useDarkCore();
  const activeState = propState || centralState;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const dim = CORE_DIMENSIONS[size] || 170;
  const config = DARK_CORE_STATES[activeState] || DARK_CORE_STATES.idle;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Particle field initialization
    const particleCount = size === 'sm' ? 6 : size === 'md' ? 14 : size === 'lg' ? 22 : 30;
    const particles = Array.from({ length: particleCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      baseDistance: (Math.random() * 0.35 + 0.48) * (dim / 2),
      currentDistance: (Math.random() * 0.35 + 0.48) * (dim / 2),
      speed: (Math.random() * 0.007 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
      radius: Math.random() * 1.1 + 0.5,
      baseAlpha: Math.random() * 0.4 + 0.25,
    }));

    const wavePoints = 48;

    // Current interpolated activity profile for smooth state transitions (Section 13)
    const currentProfile: CoreActivityProfile = {
      ...DARK_CORE_STATES[activeState].profile,
    };

    const render = () => {
      // Linear interpolation helper
      const lerp = (start: number, target: number, factor: number) =>
        start + (target - start) * factor;

      // Target profile from active state configuration
      const targetProfile = DARK_CORE_STATES[activeState].profile;
      const lerpFactor = 0.07; // Smooth gliding transition between states

      currentProfile.pulseSpeed = lerp(currentProfile.pulseSpeed, targetProfile.pulseSpeed, lerpFactor);
      currentProfile.orbitSpeed = lerp(currentProfile.orbitSpeed, targetProfile.orbitSpeed, lerpFactor);
      currentProfile.particleActivity = lerp(currentProfile.particleActivity, targetProfile.particleActivity, lerpFactor);
      currentProfile.brightness = lerp(currentProfile.brightness, targetProfile.brightness, lerpFactor);
      currentProfile.waveformAmplitude = lerp(currentProfile.waveformAmplitude, targetProfile.waveformAmplitude, lerpFactor);
      currentProfile.distortion = lerp(currentProfile.distortion, targetProfile.distortion, lerpFactor);
      currentProfile.particleDriftDirection = targetProfile.particleDriftDirection;

      time += prefersReducedMotion ? 0.005 : 0.02 * currentProfile.pulseSpeed;
      ctx.clearRect(0, 0, dim, dim);

      const cx = dim / 2;
      const cy = dim / 2;
      const coreRadius = dim * 0.22;

      // Effective motion multipliers respecting accessibility
      const speedMult = prefersReducedMotion ? 0.2 : currentProfile.orbitSpeed;
      const glowIntensity = prefersReducedMotion ? 0.25 : currentProfile.brightness;
      const waveAmp = (dim * currentProfile.waveformAmplitude) * (activeState === 'speaking' ? Math.sin(time * 5) * 0.35 + 0.75 : 1);

      // Subtle monochrome distortion for error state (NO RED)
      let jitterX = 0;
      let jitterY = 0;
      if (currentProfile.distortion > 0.05) {
        jitterX = (Math.random() - 0.5) * 2.2 * currentProfile.distortion;
        jitterY = (Math.random() - 0.5) * 2.2 * currentProfile.distortion;
      }

      const activeCx = cx + jitterX;
      const activeCy = cy + jitterY;

      // 1. Soft diffused monochromatic aura
      const auraRadius = dim * 0.48;
      const glowGrad = ctx.createRadialGradient(
        activeCx,
        activeCy,
        coreRadius * 0.8,
        activeCx,
        activeCy,
        auraRadius
      );
      glowGrad.addColorStop(0, `rgba(255, 255, 255, ${glowIntensity * 0.52})`);
      glowGrad.addColorStop(0.5, `rgba(255, 255, 255, ${glowIntensity * 0.14})`);
      glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(activeCx, activeCy, auraRadius, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // 2. Waveform energy field (responds to speaking and thinking)
      if (waveAmp > 0.5 || activeState === 'speaking' || activeState === 'thinking') {
        ctx.beginPath();
        for (let i = 0; i < wavePoints; i++) {
          const theta = (i / wavePoints) * Math.PI * 2;
          const noise =
            Math.sin(theta * 6 + time * 3.2 * speedMult) *
            Math.cos(theta * 3 - time * 2.1);
          const r = coreRadius * 1.34 + noise * waveAmp;
          const px = activeCx + Math.cos(theta) * r;
          const py = activeCy + Math.sin(theta) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.68, glowIntensity * 0.85)})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }

      // 3. Orbital Concentric Rings (delicate dashed lines)
      const ring1Radius = coreRadius * 1.55;
      ctx.save();
      ctx.translate(activeCx, activeCy);
      ctx.rotate(time * 0.3 * speedMult);
      ctx.beginPath();
      ctx.arc(0, 0, ring1Radius, 0, Math.PI * 2);
      ctx.strokeStyle =
        activeState === 'error'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 12, 16, 10]);
      ctx.stroke();
      ctx.restore();

      const ring2Radius = coreRadius * 1.95;
      ctx.save();
      ctx.translate(activeCx, activeCy);
      ctx.rotate(-time * 0.22 * speedMult);
      ctx.beginPath();
      ctx.arc(0, 0, ring2Radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 18, 6, 14]);
      ctx.stroke();
      ctx.restore();

      // 4. Orbiting / Inward Particles
      for (const p of particles) {
        p.angle += p.speed * speedMult * (currentProfile.particleActivity * 1.2 + 0.2);

        // Smooth drift direction based on state profile (inward vs ambient)
        let targetDist = p.baseDistance;
        if (currentProfile.particleDriftDirection === 'inward') {
          targetDist = p.baseDistance * (0.8 + Math.sin(time * 3 + p.angle) * 0.12);
        }
        p.currentDistance = lerp(p.currentDistance, targetDist, 0.05);

        const px = activeCx + Math.cos(p.angle) * p.currentDistance;
        const py = activeCy + Math.sin(p.angle) * p.currentDistance;

        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${
          p.baseAlpha * (glowIntensity + 0.35)
        })`;
        ctx.fill();
      }

      // 5. Central Eclipse Orb (Pure Black Void)
      ctx.beginPath();
      ctx.arc(activeCx, activeCy, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Outer rim edge
      ctx.beginPath();
      ctx.arc(activeCx, activeCy, coreRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 + Math.sin(time * 1.5) * 0.15})`;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Inner crescent reflection
      ctx.beginPath();
      ctx.arc(
        activeCx,
        activeCy,
        coreRadius * 0.94,
        -Math.PI * 0.4,
        Math.PI * 0.2
      );
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Singularity center point
      ctx.beginPath();
      ctx.arc(activeCx, activeCy, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.sin(time * 2.5) * 0.3})`;
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [dim, size, activeState]);

  return (
    <div
      role="status"
      aria-label={`Dark Core status: ${config.subLabel}`}
      className={`flex flex-col items-center justify-center select-none ${className}`}
    >
      {/* Screen reader live announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        {config.accessibleAnnouncement}
      </div>

      <div
        className="relative flex items-center justify-center"
        style={{ width: dim, height: dim }}
      >
        <canvas
          ref={canvasRef}
          width={dim}
          height={dim}
          className="pointer-events-none"
          style={{ width: dim, height: dim }}
        />
      </div>

      {showLabel && size !== 'sm' && (
        <div className="text-center mt-3 space-y-0.5">
          <div className="text-xs font-mono tracking-widest text-[#777777] uppercase">
            {config.label}
          </div>
          <div className="text-[11px] font-mono tracking-widest text-white font-medium flex items-center justify-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full bg-white ${
                activeState !== 'idle' ? 'animate-pulse' : 'opacity-80'
              }`}
            />
            <span>{config.subLabel}</span>
          </div>
        </div>
      )}
    </div>
  );
};
