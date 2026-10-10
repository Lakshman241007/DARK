import React from 'react';
import { Menu, Settings } from 'lucide-react';
import { useDark } from '../../core/DarkContext';
import { useDarkCore } from '../../hooks/useDarkCore';

interface TopBarProps {
  onOpenMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMenu }) => {
  const { currentTab, setIsSettingsOpen } = useDark();
  const { state: coreState } = useDarkCore();

  return (
    <header className="fixed top-0 left-0 right-0 h-13 bg-black/40 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 flex items-center justify-between select-none z-30 transition-all">
      {/* Left: Hamburger Button + Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMenu}
          className="p-1.5 text-[#888888] hover:text-white transition-colors cursor-pointer rounded-xs hover:bg-white/5 flex items-center justify-center"
          aria-label="Open Navigation Menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm tracking-widest text-white">
            DARK
          </span>
          <span className="text-[#333333] text-xs font-mono hidden sm:inline">/</span>
          <span className="text-[11px] font-mono tracking-wider text-[#666666] uppercase hidden sm:inline">
            {currentTab}
          </span>
        </div>
      </div>

      {/* Right: Status & Settings */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-[11px] text-[#888888]">
          <span
            className={`w-1.5 h-1.5 rounded-full bg-white ${
              coreState === 'idle'
                ? 'opacity-80'
                : coreState === 'error'
                ? 'opacity-40 animate-pulse'
                : 'opacity-100 animate-pulse'
            }`}
          />
          <span className="text-white font-medium uppercase">
            {coreState === 'idle' ? 'ONLINE' : coreState}
          </span>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 text-[#666666] hover:text-white transition-colors cursor-pointer rounded-xs hover:bg-white/5"
          aria-label="Open Settings"
        >
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
};
