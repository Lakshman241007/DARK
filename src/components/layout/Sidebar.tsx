import React from 'react';
import {
  Home,
  MessageSquare,
  CheckSquare,
  Users,
  FolderGit2,
  Cpu,
  Activity,
  Settings,
  X,
  Radio,
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { useDark } from '../../core/DarkContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { currentTab, setCurrentTab, tasks, systemStatus, setIsSettingsOpen, isStreaming } = useDark();

  const activeTasksCount = tasks.filter((t) => !t.completed).length;

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'home', label: 'HOME', icon: <Home size={16} /> },
    {
      id: 'chat',
      label: 'CHAT',
      icon: <MessageSquare size={16} />,
      badge: isStreaming ? '●' : undefined,
    },
    {
      id: 'tasks',
      label: 'TASKS',
      icon: <CheckSquare size={16} />,
      badge: activeTasksCount > 0 ? activeTasksCount : undefined,
    },
    { id: 'agents', label: 'AGENTS', icon: <Users size={16} />, badge: '01' },
    { id: 'projects', label: 'PROJECTS', icon: <FolderGit2 size={16} />, badge: '07' },
    { id: 'memory', label: 'MEMORY', icon: <Cpu size={16} /> },
    { id: 'activity', label: 'ACTIVITY', icon: <Activity size={16} /> },
  ];

  const handleSelect = (tab: NavigationTab) => {
    setCurrentTab(tab);
    setMobileOpen(false);
  };

  const content = (
    <div className="flex flex-col h-full bg-[#0A0B10] border-r border-[#191B26] select-none text-[#9DA3BF]">
      {/* Branding Top */}
      <div className="p-5 border-b border-[#161822]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wider text-white">DARK</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#7C3AED]/20 text-[#A78BFA] font-mono border border-[#7C3AED]/40">
                V1
              </span>
            </div>
            <div className="text-[9px] tracking-widest text-[#7E849E] uppercase font-mono mt-0.5">
              PERSONAL INTELLIGENCE SYSTEM
            </div>
          </div>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-[#7E849E] hover:text-white p-1"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono text-[#52586D] tracking-widest uppercase">
          NAVIGATION
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-mono font-medium transition-all group relative cursor-pointer ${
                isActive
                  ? 'text-white bg-[#151722] border-l-2 border-[#7C3AED]'
                  : 'hover:text-[#F1F3F9] hover:bg-[#11131C] text-[#868C9F]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-colors ${isActive ? 'text-[#A78BFA]' : 'text-[#585E73] group-hover:text-[#9DA3BF]'}`}>
                  {item.icon}
                </span>
                <span className="tracking-wider">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 font-mono ${
                    item.id === 'chat' && isStreaming
                      ? 'text-[#7C3AED] animate-pulse font-bold'
                      : isActive
                      ? 'bg-[#7C3AED]/30 text-[#C4B5FD]'
                      : 'bg-[#181A25] text-[#71768B]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Dark Core Status & Settings */}
      <div className="p-4 border-t border-[#161822] bg-[#08090D]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono font-semibold text-[#D2D6E6] tracking-wider">
              DARK CORE
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#A78BFA] mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-status-pulse inline-block" />
              <span>{systemStatus.status === 'ONLINE' ? 'ONLINE' : 'ACTIVE'}</span>
              <span className="text-[#3F445A]">/</span>
              <span className="text-[#5F657D]">3.8 FLASH</span>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="System Settings"
            className="p-2 text-[#686E85] hover:text-[#C4B5FD] hover:bg-[#161824] transition-colors rounded cursor-pointer"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 h-screen shrink-0 sticky top-0 flex-col">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
