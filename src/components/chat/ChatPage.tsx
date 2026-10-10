import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  RotateCcw,
  Trash2,
  Paperclip,
  Mic,
  Copy,
  Check,
  Activity,
} from 'lucide-react';
import { useDark } from '../../core/DarkContext';
import { useDarkCore } from '../../hooks/useDarkCore';
import { DarkCore } from '../dark/DarkCore';
import { DarkStatus } from '../dark/DarkStatus';
import { ResponseMetricsOverlay } from '../dark/ResponseMetricsOverlay';
import { MarkdownMessage } from './MarkdownMessage';
import { ChatMessage } from '../../types';

export const ChatPage: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    clearChat,
    regenerateLastMessage,
    stopStreaming,
    isThinking,
    isStreaming,
    pendingPrompt,
    setPendingPrompt,
  } = useDark();

  const { state: coreState, triggerListening, transition } = useDarkCore();

  const [input, setInput] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (pendingPrompt) {
      setInput(pendingPrompt);
      setPendingPrompt('');
      triggerListening();
      textareaRef.current?.focus();
    }
  }, [pendingPrompt, setPendingPrompt, triggerListening]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isThinking, isStreaming]);

  const handleFocus = () => {
    triggerListening();
  };

  const handleBlur = () => {
    if (!input.trim() && coreState === 'listening') {
      transition('INPUT_BLURRED');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (e.target.value.trim()) {
      triggerListening();
    } else {
      transition('INPUT_BLURRED');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput('');
    setIsVoiceActive(false);
    sendChatMessage(text);
  };

  const handleCopy = (msg: ChatMessage) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.25rem)] max-w-4xl mx-auto w-full px-4 sm:px-6 select-none">
      {/* Top Presence & Controls */}
      <div className="py-4 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <DarkCore size="sm" showLabel={false} />
          <DarkStatus className="items-start text-left" showDot={false} />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <ResponseMetricsOverlay compact={true} />

          <button
            onClick={() => setShowTelemetry((prev) => !prev)}
            className={`p-1.5 transition-colors cursor-pointer rounded-xs ${
              showTelemetry ? 'text-white bg-white/10' : 'text-[#666666] hover:text-white hover:bg-white/5'
            }`}
            title="Toggle Response Engine Telemetry"
          >
            <Activity size={14} />
          </button>

          {isStreaming && (
            <button
              onClick={stopStreaming}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-xs transition-colors cursor-pointer"
            >
              <Square size={10} fill="currentColor" />
              <span>STOP</span>
            </button>
          )}

          <button
            onClick={regenerateLastMessage}
            disabled={isStreaming || chatMessages.length < 2}
            className="p-1.5 text-[#666666] hover:text-white transition-colors cursor-pointer rounded-xs hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Regenerate response"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={clearChat}
            disabled={isStreaming}
            className="p-1.5 text-[#666666] hover:text-white transition-colors cursor-pointer rounded-xs hover:bg-white/5 disabled:opacity-30"
            title="Clear session"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded Response Engine Telemetry Panel */}
      {showTelemetry && (
        <div className="pt-3 pb-1">
          <ResponseMetricsOverlay />
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto py-8 space-y-10">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';

          if (isUser) {
            return (
              <div key={msg.id} className="space-y-2">
                <div className="text-[11px] font-mono tracking-widest text-[#666666] uppercase">
                  YOU
                </div>
                <div className="text-base sm:text-lg text-white font-sans font-light leading-relaxed">
                  {msg.content}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-[#777777] uppercase">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                  <span className="text-white font-medium">DARK</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{msg.timestamp}</span>
                  <button
                    onClick={() => handleCopy(msg)}
                    className="hover:text-white transition-colors cursor-pointer"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check size={12} className="text-white" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="pl-3.5 border-l border-white/15 space-y-4">
                <MarkdownMessage content={msg.content || '...'} />
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="space-y-2 pt-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#AAAAAA] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>DARK • THINKING</span>
              <span className="text-[9px] text-[#555555] font-normal border border-white/10 px-1 py-0.2 rounded-2xs">
                ACK: &lt;16ms
              </span>
            </div>
            <div className="pl-3.5 border-l border-white/20 text-xs font-mono text-[#888888] flex items-center gap-2">
              <span className="inline-block w-1.5 h-3 bg-white/70 animate-pulse" />
              <span>Connecting to neural stream...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Elegant Chat Input Console */}
      <div className="pb-6 pt-2 shrink-0">
        <div
          className={`relative bg-[#050507]/90 border rounded-xs transition-all duration-300 ${
            coreState === 'listening' || input.trim()
              ? 'border-white/35 shadow-[0_0_20px_rgba(255,255,255,0.06)]'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Ask DARK anything..."
            className="w-full bg-transparent px-4 sm:px-5 py-3 text-sm text-[#EDEDED] placeholder-[#444444] resize-none focus:outline-hidden font-sans"
          />

          <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-t border-white/5 bg-black/40 text-xs font-mono">
            {/* Attachment & Voice Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {}}
                className="p-1.5 text-[#666666] hover:text-white transition-colors cursor-pointer rounded-xs hover:bg-white/5"
                title="Attach file or context"
              >
                <Paperclip size={14} />
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextVoice = !isVoiceActive;
                  setIsVoiceActive(nextVoice);
                  if (nextVoice) triggerListening();
                  else if (!input.trim()) transition('INPUT_BLURRED');
                }}
                className={`p-1.5 transition-colors cursor-pointer rounded-xs ${
                  isVoiceActive
                    ? 'text-white bg-white/10'
                    : 'text-[#666666] hover:text-white hover:bg-white/5'
                }`}
                title="Voice input"
              >
                <Mic size={14} />
              </button>

              <span className="text-[10px] text-[#444444] hidden sm:inline ml-2">
                {isVoiceActive ? 'LISTENING TO MICROPHONE...' : 'READY FOR INPUT'}
              </span>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className={`w-7 h-7 flex items-center justify-center rounded-xs transition-all cursor-pointer ${
                input.trim() && !isStreaming
                  ? 'bg-white text-black hover:bg-neutral-200'
                  : 'bg-white/5 text-[#444444] cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
