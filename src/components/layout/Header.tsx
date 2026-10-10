import React, { useState, useEffect } from 'react';
import { Menu, RotateCcw, Settings, Terminal, ShieldAlert, Sparkles } from 'lucide-react';
import { useDark } from '../../core/DarkContext';

interface HeaderProps {
  onToggleMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobile }) => {
  const { currentTab, systemStatus, triggerReboot, setIsSettingsOpen } = useDark();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-13 bg-[#090A0F]/90 backdrop-blur-md border-b border-[#161822] px-4 md:px-6 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="md:hidden text-[#7E849E] hover:text-white p-1"
          aria-label="Open Navigation"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#656B82] hidden sm:inline">DARK</span>
          <span className="text-[#323649] hidden sm:inline">/</span>
          <span className="text-[#8990A8] uppercase tracking-wider font-semibold">
            {currentTab}
          </span>
          <span className="text-[#323649]">/</span>
          <span className="text-[#7C3AED] text-[11px] hidden sm:inline font-semibold">
            ORCHESTRATOR
          </span>
        </div>
      </div>

      {/* Right: Technical Telemetry & Actions */}
      <div className="flex items-center gap-3 md:gap-5 text-xs font-mono">
        {/* Core & Gemini status indicators */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] text-[#7E849E] border-r border-[#1C1E2A] pr-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-status-pulse" />
            <span className="text-[#B3B9CF]">CORE:</span>
            <span className="text-[#A78BFA] font-semibold">ONLINE</span>
          </div>
          <div className="flex items-center gap-1.5" title={`AI Network Model: ${systemStatus.model || 'gemini-3.8-flash'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className="text-[#B3B9CF]">AI NET:</span>
            <span className="text-[#E2E8F0]">{systemStatus.networkStatus || 'ONLINE'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#B3B9CF]">MEMORY:</span>
            <span className="text-[#E2E8F0]">{systemStatus.memoryStatus}</span>
          </div>
        </div>

        {/* Live Clock */}
        <div className="text-[11px] text-[#868C9F] bg-[#11131C] px-2.5 py-1 border border-[#1C1E2A] rounded-xs hidden sm:block">
          <span className="text-[#555A6E] mr-1">T:</span>
          <span className="text-[#E2E8F0] font-mono">{currentTime || '--:--:--'}</span>
        </div>

        {/* Reboot / Boot Sequence trigger */}
        <button
          onClick={triggerReboot}
          title="Re-run Boot Sequence Diagnostics"
          className="p-1.5 text-[#5D6378] hover:text-[#C4B5FD] hover:bg-[#161824] transition-colors rounded cursor-pointer"
        >
          <RotateCcw size={14} />
        </button>

        {/* Settings button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          title="Open Settings"
          className="p-1.5 text-[#5D6378] hover:text-[#C4B5FD] hover:bg-[#161824] transition-colors rounded cursor-pointer"
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
};
