/**
 * DARK CORE — PHASE 2: CORE STATES
 * Technical Status Display Component
 */

import React from 'react';
import { useDarkCore } from '../../hooks/useDarkCore';
import { DarkCoreState } from '../../core/dark/darkCore.types';
import { DARK_CORE_STATES } from '../../core/dark/darkCore.states';

interface DarkStatusProps {
  state?: DarkCoreState;
  showDot?: boolean;
  showDescription?: boolean;
  className?: string;
}

export const DarkStatus: React.FC<DarkStatusProps> = ({
  state: propState,
  showDot = true,
  showDescription = false,
  className = '',
}) => {
  const { state: centralState } = useDarkCore();
  const activeState = propState || centralState;
  const config = DARK_CORE_STATES[activeState] || DARK_CORE_STATES.idle;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center select-none ${className}`}
    >
      {/* Screen reader live announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        {config.accessibleAnnouncement}
      </div>

      <div className="flex items-center gap-2">
        {showDot && (
          <span
            className={`w-1.5 h-1.5 rounded-full bg-white transition-opacity duration-300 ${
              activeState === 'idle'
                ? 'opacity-80'
                : activeState === 'error'
                ? 'opacity-40 animate-pulse'
                : 'opacity-100 animate-pulse'
            }`}
            aria-hidden="true"
          />
        )}
        <span className="text-xs font-mono tracking-[0.25em] text-[#888888] uppercase">
          {config.label}
        </span>
      </div>

      <div className="text-xs font-mono font-medium tracking-widest text-white mt-0.5">
        {config.subLabel}
      </div>

      {showDescription && (
        <p className="text-[11px] font-sans text-[#666666] tracking-normal mt-1 max-w-xs">
          {config.description}
        </p>
      )}
    </div>
  );
};
