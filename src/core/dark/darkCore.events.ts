/**
 * DARK CORE — PHASE 2: CORE STATES
 * Event Model & Transition Signals
 */

export type DarkCoreEvent =
  | 'USER_INPUT'
  | 'LISTENING_STARTED'
  | 'INPUT_BLURRED'
  | 'INPUT_SUBMITTED'
  | 'THINKING_STARTED'
  | 'RESPONSE_READY'
  | 'SPEECH_STARTED'
  | 'SPEECH_FINISHED'
  | 'USER_INTERRUPT'
  | 'USER_CANCELLED'
  | 'ERROR_OCCURRED'
  | 'RECOVERY'
  | 'RESET';

export interface DarkCoreEventPayload {
  reason?: string;
  source?: string;
  timestamp?: number;
  [key: string]: unknown;
}
