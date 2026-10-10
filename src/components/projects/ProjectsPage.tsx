import React from 'react';
import { useDark } from '../../core/DarkContext';
import { DarkCore } from '../dark/DarkCore';

export const ProjectsPage: React.FC = () => {
  const { projects, setCurrentTab, setPendingPrompt } = useDark();

  const handleLaunchProject = (name: string, nextAction: string) => {
    setPendingPrompt(`Let's work on "${name}". Next action is: ${nextAction}`);
    setCurrentTab('chat');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 select-none space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <DarkCore state="idle" size="sm" showLabel={false} />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-widest text-white uppercase">
              PROJECTS
            </h1>
            <p className="text-[11px] font-mono tracking-wider text-[#666666] uppercase mt-0.5">
              ACTIVE INITIATIVES & REPOSITORIES
            </p>
          </div>
        </div>
      </div>

      {/* Clean Horizontal Project Rows (Section 21) */}
      <div className="divide-y divide-white/5 border-t border-b border-white/5">
        {/* Table Headings */}
        <div className="py-2.5 flex items-center justify-between text-[10px] font-mono tracking-widest text-[#555555] uppercase">
          <span className="w-1/3">PROJECT NAME</span>
          <span className="w-1/4 text-center">STATUS</span>
          <span className="w-1/3 text-right">PROGRESS</span>
        </div>

        {projects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => handleLaunchProject(proj.name, proj.nextAction)}
            className="py-4 flex items-center justify-between text-xs font-mono group hover:text-white cursor-pointer transition-colors"
          >
            {/* Project Name & Description */}
            <div className="w-1/3 pr-2 min-w-0">
              <div className="font-bold text-[#EDEDED] group-hover:text-white tracking-wide truncate">
                {proj.name}
              </div>
              <div className="text-[11px] font-sans text-[#666666] truncate mt-0.5">
                {proj.description}
              </div>
            </div>

            {/* Status */}
            <div className="w-1/4 text-center">
              <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 border border-white/10 rounded-xs text-[#888888] group-hover:text-white group-hover:border-white/30 transition-colors">
                {proj.status.replace('-', ' ')}
              </span>
            </div>

            {/* Progress */}
            <div className="w-1/3 flex items-center justify-end gap-3 pl-2">
              <div className="w-20 sm:w-28 bg-white/5 h-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/70 group-hover:bg-white transition-all duration-300"
                  style={{ width: `${proj.progress}%` }}
                />
              </div>
              <span className="text-[11px] text-[#777777] group-hover:text-white w-9 text-right font-mono">
                {proj.progress}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
