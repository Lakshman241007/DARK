import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Play,
  AlertOctagon,
  RotateCcw,
  XCircle,
  Volume2,
  Sparkles,
  Compass,
  Radio,
  Eye,
  Zap,
} from 'lucide-react';
import { useDark } from '../../core/DarkContext';
import { useDarkCore } from '../../hooks/useDarkCore';
import { useDarkEnvironment } from '../../hooks/useDarkEnvironment';
import { DarkCore } from '../dark/DarkCore';
import { DarkStatus } from '../dark/DarkStatus';
import { ResponseMetricsOverlay } from '../dark/ResponseMetricsOverlay';
import { DarkCoreState } from '../../core/dark/darkCore.types';

export const HomePage: React.FC = () => {
  const {
    submitCommandFromHome,
    projects,
    setSelectedProject,
    setCurrentTab,
    settings,
  } = useDark();

  const {
    state: coreState,
    intensity,
    config,
    transition,
    setState,
    interrupt,
    cancel,
    recover,
    triggerListening,
    triggerThinking,
    triggerSpeaking,
    triggerComplete,
    triggerError,
    simulateLifecycle,
  } = useDarkCore();

  const {
    snapshot: envSnapshot,
    profile: envProfile,
    settings: envSettings,
    triggerRipple,
    triggerShootingStar,
    toggleParallax,
    setDensity,
  } = useDarkEnvironment();

  const [prompt, setPrompt] = useState<string>('');
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Time-of-day greeting
  const [greeting, setGreeting] = useState<string>('EVENING');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('MORNING');
    else if (hours < 17) setGreeting('AFTERNOON');
    else setGreeting('EVENING');
  }, []);

  const handleFocus = () => {
    triggerListening();
  };

  const handleBlur = () => {
    if (!prompt.trim() && coreState === 'listening') {
      transition('INPUT_BLURRED');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
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
    if (!prompt.trim()) return;
    triggerThinking();
    submitCommandFromHome(prompt);
  };

  const handleQuickAction = (action: 'CODE' | 'RESEARCH' | 'PLAN') => {
    let text = '';
    switch (action) {
      case 'CODE':
        text = 'Code a high-performance token bucket rate limiter in TypeScript.';
        break;
      case 'RESEARCH':
        text = 'Research distributed mesh topologies and state synchronization protocols.';
        break;
      case 'PLAN':
        text = 'Plan the core architecture and multi-stage execution roadmap for Dark.';
        break;
    }
    setPrompt(text);
    triggerListening();
    textareaRef.current?.focus();
  };

  const handleRunSimulation = () => {
    setIsDemoRunning(true);
    const cancelSim = simulateLifecycle(() => {
      setIsDemoRunning(false);
    });
    return cancelSim;
  };

  // Lightweight Active Work representation
  const activeWorkList = [
    { name: 'Portfolio', progress: 82, id: 'proj-portfolio' },
    { name: 'Dark', progress: 24, id: 'proj-dark' },
    { name: 'Discord Bot', progress: 61, id: 'proj-discord-bot' },
  ];

  const handleOpenProject = (id: string) => {
    const proj = projects.find((p) => p.id === id);
    if (proj) {
      setSelectedProject(proj);
      setCurrentTab('projects');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-3.25rem)] flex flex-col justify-between max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14 select-none">
      {/* Central Hero Column */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-7 my-auto">
        {/* Hero Dark Core & Status */}
        <div className="relative flex flex-col items-center space-y-3">
          <DarkCore size="xl" showLabel={false} />
          <DarkStatus showDot={true} showDescription={false} />
        </div>

        {/* Headings */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase font-sans">
            GOOD {greeting}, {settings.userName.toUpperCase()}.
          </h1>
          <p className="text-sm sm:text-base text-[#777777] font-sans font-light">
            What are we doing today?
          </p>
        </div>

        {/* Command Input Box */}
        <div className="w-full max-w-2xl">
          <div
            className={`relative w-full bg-[#050507]/90 border rounded-xs transition-all duration-300 ${
              coreState === 'listening' || prompt
                ? 'border-white/40 shadow-[0_0_24px_rgba(255,255,255,0.08)]'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <textarea
              ref={textareaRef}
              rows={2}
              value={prompt}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Ask DARK anything..."
              className="w-full bg-transparent px-4 sm:px-5 py-3.5 text-sm sm:text-base text-[#EDEDED] placeholder-[#444444] resize-none focus:outline-hidden font-sans"
            />

            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-t border-white/5 bg-black/40">
              <span className="text-[10px] font-mono text-[#444444]">
                ENTER TO EXECUTE • SHIFT+ENTER FOR NEWLINE
              </span>

              <button
                onClick={handleSend}
                disabled={!prompt.trim()}
                className={`w-7 h-7 flex items-center justify-center rounded-xs transition-all cursor-pointer ${
                  prompt.trim()
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-white/5 text-[#444444] cursor-not-allowed'
                }`}
                aria-label="Send message"
              >
                <ArrowUp size={14} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4 text-xs font-mono">
            {(['CODE', 'RESEARCH', 'PLAN'] as const).map((action) => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                className="px-3.5 py-1.5 border border-white/10 hover:border-white/30 text-[#888888] hover:text-white bg-black/40 hover:bg-white/5 rounded-xs transition-all cursor-pointer tracking-wider"
              >
                {action}
              </button>
            ))}

            <button
              onClick={() => setShowInspector((prev) => !prev)}
              className="px-2.5 py-1.5 border border-white/5 hover:border-white/20 text-[#555555] hover:text-[#999999] bg-black/20 rounded-xs transition-colors cursor-pointer text-[10px]"
              title="Toggle Core States & Transitions Inspector"
            >
              CORE STATES {showInspector ? '[-]' : '[+]'}
            </button>
          </div>

          {/* Phase 2 Core States & Transitions Verification Suite */}
          {showInspector && (
            <div className="mt-4 p-4 bg-[#08080B]/95 border border-white/10 rounded-xs text-left font-mono text-[11px] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[#777777]">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold uppercase">
                    PHASE 2: CORE STATES
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 border border-white/20 rounded-xs text-[#888888]">
                    INTENSITY: {intensity.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#555555]">ACTIVE:</span>
                  <span className="text-white font-bold uppercase">{coreState}</span>
                </div>
              </div>

              {/* State description */}
              <p className="text-[10px] text-[#777777] font-sans">
                {config.description}
              </p>

              {/* Direct state switcher to verify every state independently (Section 27) */}
              <div className="space-y-1.5">
                <div className="text-[10px] text-[#555555] uppercase">
                  MANUAL STATE SELECTION:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(['idle', 'listening', 'thinking', 'speaking', 'error'] as DarkCoreState[]).map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => setState(s)}
                        className={`px-2 py-1 rounded-xs transition-colors cursor-pointer text-[10px] uppercase ${
                          coreState === s
                            ? 'bg-white text-black font-bold'
                            : 'border border-white/10 hover:border-white/30 text-[#888888] hover:text-white bg-white/5'
                        }`}
                      >
                        {s}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Lifecycle and Interruption testing (Section 28 & 29) */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <div className="text-[10px] text-[#555555] uppercase">
                  TRANSITION MATRIX & INTERRUPTION TESTS:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleRunSimulation}
                    disabled={isDemoRunning}
                    className="flex items-center gap-1.5 px-2.5 py-1 border border-white/20 hover:border-white text-white hover:bg-white/10 rounded-xs transition-all cursor-pointer text-[10px] disabled:opacity-40"
                  >
                    <Play size={10} />
                    <span>LIFECYCLE SIMULATION</span>
                  </button>

                  <button
                    onClick={() => interrupt('Simulated user interruption')}
                    className="flex items-center gap-1 px-2.5 py-1 border border-white/10 hover:border-white/30 text-[#888888] hover:text-white rounded-xs transition-colors cursor-pointer text-[10px]"
                    title="Simulate user interruption"
                  >
                    <XCircle size={10} />
                    <span>INTERRUPT</span>
                  </button>

                  {coreState === 'error' ? (
                    <button
                      onClick={recover}
                      className="flex items-center gap-1 px-2.5 py-1 border border-white/30 bg-white/10 text-white rounded-xs transition-colors cursor-pointer text-[10px]"
                    >
                      <RotateCcw size={10} />
                      <span>RECOVER TO IDLE</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => triggerError('Diagnostic exception')}
                      className="flex items-center gap-1 px-2.5 py-1 border border-white/10 hover:border-white/30 text-[#777777] hover:text-white rounded-xs transition-colors cursor-pointer text-[10px]"
                    >
                      <AlertOctagon size={10} />
                      <span>TEST ERROR</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Phase 4: Core Environment Live Telemetry & Actions */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[#777777]">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={11} className="text-white" />
                    <span className="text-white font-semibold uppercase text-[10px]">
                      PHASE 4: LIVING ENVIRONMENT
                    </span>
                  </div>
                  <span className="text-[9px] text-[#888888]">
                    STARS: {envSnapshot.starCount} • METEORS: {envSnapshot.activeShootingStars}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9px] text-[#888888] bg-black/40 p-2 border border-white/5 rounded-xs">
                  <div>
                    <span className="text-[#555555] block">TWINKLE:</span>
                    <span className="text-white font-bold">{envProfile.twinkleMultiplier.toFixed(1)}x</span>
                  </div>
                  <div>
                    <span className="text-[#555555] block">DRIFT SPEED:</span>
                    <span className="text-white font-bold">{envProfile.driftMultiplier.toFixed(1)}x</span>
                  </div>
                  <div>
                    <span className="text-[#555555] block">ATMOSPHERE:</span>
                    <span className="text-white font-bold">{(envProfile.atmosphericGlowOpacity * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-[#555555] block">PARALLAX:</span>
                    <span className="text-white font-bold">{envSettings.parallaxEnabled ? 'ACTIVE' : 'OFF'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    onClick={() => triggerRipple()}
                    className="flex items-center gap-1 px-2 py-1 border border-white/20 hover:border-white text-white hover:bg-white/10 rounded-xs transition-all cursor-pointer text-[10px]"
                    title="Propagate a monochromatic shockwave from the Core outwards into deep space"
                  >
                    <Radio size={10} />
                    <span>EMIT SPATIAL RIPPLE</span>
                  </button>

                  <button
                    onClick={triggerShootingStar}
                    className="flex items-center gap-1 px-2 py-1 border border-white/15 hover:border-white/30 text-[#AAAAAA] hover:text-white rounded-xs transition-colors cursor-pointer text-[10px]"
                    title="Spawn an immediate diagonal shooting star"
                  >
                    <Sparkles size={10} />
                    <span>SPAWN SHOOTING STAR</span>
                  </button>

                  <button
                    onClick={toggleParallax}
                    className={`flex items-center gap-1 px-2 py-1 rounded-xs transition-colors cursor-pointer text-[10px] ${
                      envSettings.parallaxEnabled
                        ? 'bg-white/10 text-white border border-white/30'
                        : 'border border-white/10 text-[#666666]'
                    }`}
                    title="Toggle depth parallax response to cursor"
                  >
                    <Compass size={10} />
                    <span>PARALLAX: {envSettings.parallaxEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Phase 4.1: Low-Latency Response Engine Telemetry */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5 mb-2 text-[#777777]">
                  <Zap size={11} className="text-white" />
                  <span className="text-white font-semibold uppercase text-[10px]">
                    PHASE 4.1: CORE RESPONSE ENGINE
                  </span>
                </div>
                <ResponseMetricsOverlay />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightweight Active Work Section (Section 10) */}
      <div className="w-full max-w-xl mx-auto pt-10 sm:pt-14 pb-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#555555] pb-2 border-b border-white/5">
          <span className="tracking-widest uppercase text-[10px]">ACTIVE WORK</span>
          <button
            onClick={() => setCurrentTab('projects')}
            className="hover:text-white transition-colors cursor-pointer text-[10px]"
          >
            VIEW ALL
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {activeWorkList.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenProject(item.id)}
              className="py-3 flex items-center justify-between text-xs font-mono hover:text-white group cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white transition-colors" />
                <span className="text-[#BBBBBB] group-hover:text-white transition-colors">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-24 sm:w-32 bg-white/5 h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/80 group-hover:bg-white transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <span className="text-[#666666] group-hover:text-white text-[11px] w-8 text-right">
                  {item.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
