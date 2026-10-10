import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useDark } from '../../core/DarkContext';
import { DarkCore } from '../dark/DarkCore';

export const ActivityPage: React.FC = () => {
  const { activityLogs, clearActivityLogs } = useDark();
  const [filter, setFilter] = useState<'ALL' | 'system' | 'chat' | 'task' | 'memory'>('ALL');

  const filteredLogs = activityLogs.filter((log) => {
    if (filter === 'ALL') return true;
    return log.category === filter;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 select-none space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <DarkCore state="idle" size="sm" showLabel={false} />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-widest text-white uppercase">
              ACTIVITY
            </h1>
            <p className="text-[11px] font-mono tracking-wider text-[#666666] uppercase mt-0.5">
              TELEMETRY & RUNTIME SYSTEM LOG
            </p>
          </div>
        </div>

        <button
          onClick={clearActivityLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-white/15 hover:border-white/40 text-[#777777] hover:text-white text-xs font-mono tracking-wider rounded-xs transition-all cursor-pointer"
        >
          <Trash2 size={12} />
          <span>CLEAR LOG</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-[11px] font-mono">
        {(['ALL', 'system', 'chat', 'task', 'memory'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded-xs transition-colors cursor-pointer uppercase ${
              filter === tab
                ? 'bg-white text-black font-semibold'
                : 'text-[#666666] hover:text-white border border-white/5 hover:border-white/20'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Monospace System Log (Section 23) */}
      <div className="border border-white/10 bg-[#050507]/80 rounded-xs divide-y divide-white/5 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-[#444444]">
            NO LOG ENTRIES RECORDED
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="px-4 py-3 flex items-start gap-4 hover:bg-white/5 transition-colors"
            >
              <span className="text-[#666666] shrink-0 font-mono text-[11px] w-14">
                {log.timeStr}
              </span>

              <span className="text-white/60 uppercase font-semibold shrink-0 text-[10px] w-16 border-r border-white/10 pr-2">
                {log.category}
              </span>

              <div className="flex-1 space-y-0.5 min-w-0">
                <div className="text-[#EDEDED] font-mono tracking-wide truncate">
                  {log.message}
                </div>
                {log.details && (
                  <div className="text-[11px] text-[#666666] truncate font-sans">
                    {log.details}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
