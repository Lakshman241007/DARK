import React from 'react';
import { Lock } from 'lucide-react';
import { DarkCore } from '../dark/DarkCore';

export const AgentsPage: React.FC = () => {
  const futureAgents = [
    { name: 'PLANNER', description: 'Multi-stage goal decomposition, dependency graphs & milestone mapping.' },
    { name: 'CODER', description: 'Autonomous type-safe code synthesis, AST refactoring & tests.' },
    { name: 'RESEARCHER', description: 'Documentation deep indexing, technical citation graphs & synthesis.' },
    { name: 'DESIGNER', description: 'Design token architecture, UI ergonomics & component layouts.' },
    { name: 'TESTER', description: 'Deterministic verification, invariant fuzzing & regression tests.' },
    { name: 'ANALYST', description: 'Runtime telemetry profiling, bottleneck analysis & latency minimization.' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14 select-none space-y-14">
      {/* Central Orchestrator Hero */}
      <div className="flex flex-col items-center justify-center text-center space-y-5">
        <DarkCore state="idle" size="lg" showLabel={false} />

        <div className="space-y-1.5">
          <div className="font-mono text-xs tracking-[0.3em] text-[#777777] uppercase">
            PRIMARY INTELLIGENCE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-widest text-white uppercase">
            DARK CORE
          </h1>
          <div className="text-xs font-mono tracking-wider text-[#999999] uppercase">
            ORCHESTRATOR
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-white pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white opacity-90 animate-pulse" />
            <span>ACTIVE</span>
          </div>
        </div>

        <p className="max-w-md text-xs font-sans text-[#777777] leading-relaxed">
          Central neural orchestrator and interface. Manages global context, task delegation, and upcoming specialized sub-agents.
        </p>
      </div>

      {/* Future Sub-Agents Grid */}
      <div className="space-y-4 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between text-xs font-mono text-[#555555]">
          <span className="tracking-[0.2em] uppercase text-[10px]">
            SPECIALIZED SUB-AGENTS
          </span>
          <span className="text-[10px]">FUTURE EXTENSION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {futureAgents.map((agent) => (
            <div
              key={agent.name}
              className="p-4 border border-white/10 bg-[#050507]/60 rounded-xs space-y-2.5 transition-colors hover:border-white/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white tracking-wider">
                  {agent.name}
                </span>
                <span className="flex items-center gap-1 text-[9px] font-mono text-[#666666] border border-white/10 px-1.5 py-0.5 rounded-xs">
                  <Lock size={9} />
                  <span>LOCKED</span>
                </span>
              </div>

              <p className="text-[11px] font-sans text-[#777777] leading-relaxed">
                {agent.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
