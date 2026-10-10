/**
 * DARK CORE — PHASE 2: CORE STATES
 * State Transition Rules & Interruption Handler Matrix
 */

import { DarkCoreState } from './darkCore.types';
import { DarkCoreEvent } from './darkCore.events';

export interface TransitionRule {
  from: DarkCoreState | '*';
  event: DarkCoreEvent;
  to: DarkCoreState;
  description: string;
}

export const TRANSITION_RULES: TransitionRule[] = [
  // IDLE transitions
  {
    from: 'idle',
    event: 'USER_INPUT',
    to: 'listening',
    description: 'User initiated input focus or keystroke.',
  },
  {
    from: 'idle',
    event: 'LISTENING_STARTED',
    to: 'listening',
    description: 'Direct activation of listening mode.',
  },
  {
    from: 'idle',
    event: 'INPUT_SUBMITTED',
    to: 'thinking',
    description: 'Direct command execution from idle.',
  },
  {
    from: 'idle',
    event: 'THINKING_STARTED',
    to: 'thinking',
    description: 'Direct dispatch of background task.',
  },

  // LISTENING transitions
  {
    from: 'listening',
    event: 'INPUT_SUBMITTED',
    to: 'thinking',
    description: 'Command submitted for processing.',
  },
  {
    from: 'listening',
    event: 'THINKING_STARTED',
    to: 'thinking',
    description: 'Processing phase begun.',
  },
  {
    from: 'listening',
    event: 'INPUT_BLURRED',
    to: 'idle',
    description: 'User exited input without submission.',
  },
  {
    from: 'listening',
    event: 'USER_CANCELLED',
    to: 'idle',
    description: 'Input explicitly cleared or aborted.',
  },

  // THINKING transitions
  {
    from: 'thinking',
    event: 'RESPONSE_READY',
    to: 'speaking',
    description: 'First response chunk synthesized.',
  },
  {
    from: 'thinking',
    event: 'SPEECH_STARTED',
    to: 'speaking',
    description: 'Response stream initiated.',
  },
  {
    from: 'thinking',
    event: 'USER_CANCELLED',
    to: 'idle',
    description: 'Processing halted by user intervention.',
  },

  // SPEAKING transitions
  {
    from: 'speaking',
    event: 'SPEECH_FINISHED',
    to: 'idle',
    description: 'Response stream reached completion.',
  },
  {
    from: 'speaking',
    event: 'USER_INTERRUPT',
    to: 'listening',
    description: 'User interrupted speaking output with new command.',
  },
  {
    from: 'speaking',
    event: 'USER_INPUT',
    to: 'listening',
    description: 'User initiated new input while Dark was speaking.',
  },
  {
    from: 'speaking',
    event: 'USER_CANCELLED',
    to: 'idle',
    description: 'Output stream terminated early by user.',
  },

  // Global ERROR transitions from any state
  {
    from: '*',
    event: 'ERROR_OCCURRED',
    to: 'error',
    description: 'System interruption or execution fault.',
  },

  // ERROR recovery transitions
  {
    from: 'error',
    event: 'RECOVERY',
    to: 'idle',
    description: 'System safely returned to operational standby.',
  },
  {
    from: 'error',
    event: 'RESET',
    to: 'idle',
    description: 'System state reset to baseline.',
  },
  {
    from: 'error',
    event: 'USER_INPUT',
    to: 'listening',
    description: 'User dispatched new input following an interruption.',
  },

  // Global RESET
  {
    from: '*',
    event: 'RESET',
    to: 'idle',
    description: 'Global state reset to idle.',
  },
];

/**
 * Resolves the target state for a given current state and event.
 * Returns null if the transition is invalid or prevented.
 */
export function resolveNextState(
  currentState: DarkCoreState,
  event: DarkCoreEvent
): DarkCoreState | null {
  // First match explicit current state rule
  const exactRule = TRANSITION_RULES.find(
    (rule) => rule.from === currentState && rule.event === event
  );
  if (exactRule) {
    return exactRule.to;
  }

  // Fallback to wildcard '*' rules
  const wildcardRule = TRANSITION_RULES.find(
    (rule) => rule.from === '*' && rule.event === event
  );
  if (wildcardRule) {
    return wildcardRule.to;
  }

  return null;
}

/**
 * Validates whether an event can be dispatched from the current state.
 */
export function canTransitionFrom(
  currentState: DarkCoreState,
  event: DarkCoreEvent
): boolean {
  return resolveNextState(currentState, event) !== null;
}
