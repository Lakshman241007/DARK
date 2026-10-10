import React, { useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import { useDark } from '../../core/DarkContext';
import { useDarkCore } from '../../hooks/useDarkCore';
import { NavigationTab } from '../../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onClose }) => {
  const { currentTab, setCurrentTab, setIsSettingsOpen } = useDark();
  const { state: coreState } = useDarkCore();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectTab = (tab: NavigationTab) => {
    setCurrentTab(tab);
    onClose();
  };

  const menuItems: { id: NavigationTab; label: string; symbol: string }[] = [
    { id: 'home', label: 'HOME', symbol: '⌂' },
    { id: 'chat', label: 'CHAT', symbol: '◉' },
    { id: 'tasks', label: 'TASKS', symbol: '✓' },
    { id: 'agents', label: 'AGENTS', symbol: '◇' },
    { id: 'projects', label: 'PROJECTS', symbol: '□' },
    { id: 'memory', label: 'MEMORY', symbol: '◎' },
    { id: 'activity', label: 'ACTIVITY', symbol: '◌' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex select-none">
      {/* Background Dim Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Slide-in Drawer */}
      <div className="relative w-72 max-w-[85vw] h-full bg-[#050507]/95 border-r border-[#1C1C20] backdrop-blur-xl flex flex-col justify-between p-6 z-10 shadow-2xl transition-transform duration-300">
        {/* Top Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono font-bold text-base tracking-widest text-white">
                DARK
              </div>
              <div className="text-[10px] font-mono tracking-widest text-[#777777] uppercase mt-0.5">
                PERSONAL INTELLIGENCE
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#666666] hover:text-white transition-colors cursor-pointer rounded-xs hover:bg-[#141416]"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          <div className="w-full h-px bg-[#18181C]" />

          {/* Navigation Links */}
          <nav className="space-y-1 pt-1">
            {menuItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full h-11 flex items-center px-3.5 text-xs font-mono tracking-wider transition-all rounded-xs cursor-pointer ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold border-l-2 border-white'
                      : 'text-[#888888] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="w-6 text-center text-sm mr-3 font-mono">
                    {item.symbol}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status & Settings */}
        <div className="space-y-3 pt-4 border-t border-[#18181C]">
          <div className="px-3.5 flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#666666]">DARK CORE</span>
            <div className="flex items-center gap-1.5 text-white">
              <span
                className={`w-1.5 h-1.5 rounded-full bg-white ${
                  coreState === 'idle'
                    ? 'opacity-80'
                    : coreState === 'error'
                    ? 'opacity-40 animate-pulse'
                    : 'opacity-100 animate-pulse'
                }`}
              />
              <span className="uppercase">{coreState === 'idle' ? 'ONLINE' : coreState}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsSettingsOpen(true);
              onClose();
            }}
            className="w-full h-10 flex items-center px-3.5 text-xs font-mono text-[#888888] hover:text-white hover:bg-white/5 transition-colors rounded-xs cursor-pointer"
          >
            <Settings size={14} className="mr-3 text-[#666666]" />
            <span>SETTINGS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
