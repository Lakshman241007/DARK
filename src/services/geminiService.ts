/**
 * DARK AI NETWORK — LEGACY GEMINI SERVICE WRAPPER
 * @deprecated Use AINetworkService directly. Retained for backwards compatibility.
 */

import { SystemStatus } from '../types';
import {
  AINetworkService,
  ChatStreamCallbacks as NetworkChatStreamCallbacks,
} from './aiNetworkService';

export type ChatStreamCallbacks = NetworkChatStreamCallbacks;

export class GeminiService {
  /**
   * Fetches real-time status of Dark Core and AI Network
   */
  static async getStatus(): Promise<SystemStatus> {
    return AINetworkService.getStatus();
  }

  /**
   * Sends chat message with streaming response support via DARK AI Network
   */
  static async sendStreamMessage(
    messages: { role: 'user' | 'assistant'; content: string }[],
    context: string = '',
    callbacks: ChatStreamCallbacks
  ): Promise<() => void> {
    return AINetworkService.sendStreamMessage(messages, context, callbacks);
  }

  /**
   * Non-streaming fallback via DARK AI Network
   */
  static async sendMessage(
    messages: { role: 'user' | 'assistant'; content: string }[],
    context: string = ''
  ): Promise<string> {
    return AINetworkService.sendMessage(messages, context);
  }
}

