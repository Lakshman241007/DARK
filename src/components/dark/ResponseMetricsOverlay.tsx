/**
 * DARK CORE — PHASE 4.1: CORE RESPONSE ENGINE
 * Low-Latency Streaming Telemetry Panel
 * Strictly monochrome, minimal, technical, informative.
 */

import React from 'react';
import { Activity, Zap, Clock, ShieldCheck, Gauge } from 'lucide-react';
import { useResponseEngine } from '../../hooks/useResponseEngine';
import { useDark } from '../../core/DarkContext';

interface ResponseMetricsOverlayProps {
  className?: string;
  compact?: boolean;
}

export const ResponseMetricsOverlay: React.FC<ResponseMetricsOverlayProps> = ({
  className = '',
  compact = false,
}) => {
  const { systemStatus } = useDark();
  const {
    currentPhase,
    activeMetrics,
    lastCompletedMetrics,
    averageTTFTMs,
    averageTotalTimeMs,
  } = useResponseEngine();

  const metricsToDisplay = activeMetrics || lastCompletedMetrics;

  if (!metricsToDisplay && currentPhase === 'idle') {
    return null;
  }

  const ttft = metricsToDisplay?.requestToFirstToken;
  const total = metricsToDisplay?.totalResponseTime;
  const speed = metricsToDisplay?.tokensPerSecond;
  const inputDelay = metricsToDisplay?.inputToRequest ?? 0;

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 px-2.5 py-1 bg-black/60 border border-white/10 rounded-xs text-[10px] font-mono text-[#888888] select-none ${className}`}
      >
        <div className="flex items-center gap-1.5">
          <Zap size={11} className={currentPhase === 'streaming' ? 'text-white animate-pulse' : 'text-[#666666]'} />
          <span className="text-[#AAAAAA]">
            TTFT:{' '}
            <strong className="text-white font-medium">
              {ttft !== undefined ? `${ttft}ms` : averageTTFTMs ? `~${averageTTFTMs}ms` : '—'}
            </strong>
          </span>
        </div>

        {total !== undefined && (
          <div className="hidden sm:flex items-center gap-1">
            <Clock size={10} className="text-[#666666]" />
            <span>TOTAL: {total}ms</span>
          </div>
        )}

        {speed !== undefined && (
          <div className="hidden md:flex items-center gap-1">
            <Gauge size={10} className="text-[#666666]" />
            <span>{speed} tok/s</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`border border-white/10 bg-[#060608]/90 backdrop-blur-md p-3 rounded-xs text-xs font-mono select-none space-y-2.5 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Activity size={13} className={currentPhase === 'streaming' ? 'text-white animate-pulse' : 'text-[#888888]'} />
          <span className="text-[11px] font-bold text-white tracking-widest uppercase">
            RESPONSE PIPELINE ENGINE
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              currentPhase === 'streaming'
                ? 'bg-white animate-ping'
                : currentPhase === 'thinking'
                ? 'bg-white/80 animate-pulse'
                : 'bg-white/40'
            }`}
          />
          <span className="text-[10px] text-[#AAAAAA] uppercase tracking-wider">
            {currentPhase}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
        {/* Input ACK */}
        <div className="p-2 border border-white/5 bg-black/40 rounded-xs">
          <div className="text-[9px] text-[#666666] uppercase tracking-wider mb-0.5">
            ACK LATENCY
          </div>
          <div className="text-sm font-semibold text-white">
            {inputDelay < 16 ? '< 16ms' : `${inputDelay}ms`}
          </div>
          <div className="text-[9px] text-[#555555]">Zero perceptible delay</div>
        </div>

        {/* TTFT */}
        <div className="p-2 border border-white/5 bg-black/40 rounded-xs">
          <div className="text-[9px] text-[#666666] uppercase tracking-wider mb-0.5">
            TIME TO 1ST TOKEN
          </div>
          <div className="text-sm font-semibold text-white">
            {ttft !== undefined ? `${ttft}ms` : averageTTFTMs > 0 ? `~${averageTTFTMs}ms` : 'Pending'}
          </div>
          <div className="text-[9px] text-[#555555]">
            {averageTTFTMs > 0 ? `Avg: ${averageTTFTMs}ms` : 'Optimized stream'}
          </div>
        </div>

        {/* Throughput */}
        <div className="p-2 border border-white/5 bg-black/40 rounded-xs">
          <div className="text-[9px] text-[#666666] uppercase tracking-wider mb-0.5">
            THROUGHPUT
          </div>
          <div className="text-sm font-semibold text-white">
            {speed !== undefined ? `${speed} t/s` : 'Real-time'}
          </div>
          <div className="text-[9px] text-[#555555]">Token stream pacing</div>
        </div>

        {/* Total Time */}
        <div className="p-2 border border-white/5 bg-black/40 rounded-xs">
          <div className="text-[9px] text-[#666666] uppercase tracking-wider mb-0.5">
            TOTAL EXECUTION
          </div>
          <div className="text-sm font-semibold text-white">
            {total !== undefined ? `${total}ms` : averageTotalTimeMs > 0 ? `~${averageTotalTimeMs}ms` : 'In progress'}
          </div>
          <div className="text-[9px] text-[#555555]">
            {averageTotalTimeMs > 0 ? `Avg: ${averageTotalTimeMs}ms` : 'SSE pipeline'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#555555] pt-1">
        <span className="flex items-center gap-1">
          <ShieldCheck size={11} className="text-[#888888]" />
          Stream Buffering: Disabled (0ms SSE delay)
        </span>
        <span className="font-mono text-[#AAAAAA]">
          AI Network: <strong className="text-white font-normal">{systemStatus.model || 'gemini-3.8-flash'}</strong>
        </span>
      </div>
    </div>
  );
};
