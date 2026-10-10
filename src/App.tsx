import React, { useState } from 'react';
import { DarkProvider, useDark } from './core/DarkContext';
import { Starfield } from './components/background/Starfield';
import { TopBar } from './components/navigation/TopBar';
import { NavigationDrawer } from './components/navigation/NavigationDrawer';
import { BootSequence } from './components/boot/BootSequence';
import { HomePage } from './components/dashboard/HomePage';
import { ChatPage } from './components/chat/ChatPage';
import { TasksPage } from './components/tasks/TasksPage';
import { AgentsPage } from './components/agents/AgentsPage';
import { ProjectsPage } from './components/projects/ProjectsPage';
import { MemoryPage } from './components/memory/MemoryPage';
import { ActivityPage } from './components/activity/ActivityPage';
import { SettingsModal } from './components/settings/SettingsModal';

const DarkShell: React.FC = () => {
  const { currentTab, bootCompleted, completeBoot } = useDark();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-black text-[#EDEDED] font-sans overflow-x-hidden flex flex-col selection:bg-white/20 selection:text-white">
      {/* Living Starfield Background Layer (Single Canvas, 60fps, Shooting Stars) */}
      <Starfield />

      {/* First-Run Boot Sequence */}
      {!bootCompleted && <BootSequence onComplete={completeBoot} />}

      {/* Global Minimal Top Bar */}
      <TopBar onOpenMenu={() => setMenuOpen(true)} />

      {/* Navigation Slide-in Drawer */}
      <NavigationDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 pt-13 min-h-[calc(100vh-3.25rem)] overflow-y-auto">
        {currentTab === 'home' && <HomePage />}
        {currentTab === 'chat' && <ChatPage />}
        {currentTab === 'tasks' && <TasksPage />}
        {currentTab === 'agents' && <AgentsPage />}
        {currentTab === 'projects' && <ProjectsPage />}
        {currentTab === 'memory' && <MemoryPage />}
        {currentTab === 'activity' && <ActivityPage />}
      </main>

      {/* Global Settings Modal */}
      <SettingsModal />
    </div>
  );
};

export default function App() {
  return (
    <DarkProvider>
      <DarkShell />
    </DarkProvider>
  );
}
