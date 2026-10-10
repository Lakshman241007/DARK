import React, { useEffect, useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { DarkCore } from '../dark/DarkCore';

interface BootSequenceProps {
  onComplete: () => void;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  const bootLines = [
    { label: 'CORE', value: 'READY', delay: 250 },
    { label: 'AI NETWORK', value: 'ONLINE', delay: 500 },
    { label: 'MEMORY', value: 'READY', delay: 750 },
    { label: 'AGENTS', value: '01 ACTIVE', delay: 1000 },
    { label: 'SYSTEM', value: 'ONLINE', delay: 1300 },
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 4;
      });
    }, 45);

    const timers = bootLines.map((line, index) => {
      return setTimeout(() => {
        setStep(index + 1);
      }, line.delay);
    });

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1850);

    return () => {
      clearInterval(progressInterval);
      timers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-[#EDEDED] font-mono select-none px-4">
      <div className="relative w-full max-w-md border border-white/15 bg-[#050507]/95 p-8 shadow-2xl backdrop-blur-md space-y-6">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-white opacity-90 animate-pulse" />
            <span className="text-[11px] uppercase tracking-widest text-[#777777] font-semibold">
              DARK // INITIALIZATION
            </span>
          </div>
          <button
            onClick={onComplete}
            className="text-[11px] text-[#666666] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            SKIP <ChevronRight size={12} />
          </button>
        </div>

        {/* Small Dark Core Center */}
        <div className="flex justify-center py-1">
          <DarkCore state="thinking" size="sm" showLabel={false} />
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold tracking-widest text-white">
            DARK
          </h1>
          <p className="text-[10px] text-[#777777] tracking-[0.25em] uppercase">
            PERSONAL INTELLIGENCE SYSTEM
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-0.5 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Diagnostic Lines */}
        <div className="space-y-2 text-xs text-[#888888]">
          {bootLines.map((line, idx) => {
            const isVisible = step > idx;
            return (
              <div
                key={line.label}
                className={`flex justify-between items-center transition-opacity duration-200 ${
                  isVisible ? 'opacity-100 text-white' : 'opacity-20 text-[#333333]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#888888]">{line.label}</span>
                  <span className="text-[#222222]">....................</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  {isVisible ? (
                    <>
                      <span>{line.value}</span>
                      <Check size={11} className="text-white" />
                    </>
                  ) : (
                    <span className="text-[#222222]">PENDING</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-[#555555]">
          <span>ORCHESTRATOR v1.1</span>
          <span className="animate-pulse text-white">ONLINE</span>
        </div>
      </div>
    </div>
  );
};
