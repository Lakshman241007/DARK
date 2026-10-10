import React, { useState } from 'react';
import { X, Check, Download, Sparkles, Radio, Compass } from 'lucide-react';
import { useDark } from '../../core/DarkContext';
import { useDarkEnvironment } from '../../hooks/useDarkEnvironment';
import { StarDensity } from '../../core/environment/darkEnvironment.types';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, settings, updateSettings, systemStatus } = useDark();
  const {
    snapshot: envSnapshot,
    settings: envSettings,
    setDensity,
    toggleParallax,
    toggleShootingStars,
    triggerRipple,
    triggerShootingStar,
  } = useDarkEnvironment();

  const [activeTab, setActiveTab] = useState<
    'GENERAL' | 'AI MODEL' | 'STARFIELD' | 'MEMORY' | 'DATA' | 'ABOUT'
  >('GENERAL');

  if (!isSettingsOpen) return null;

  const handleExportState = () => {
    const data = {
      timestamp: new Date().toISOString(),
      settings,
      systemStatus,
      version: '1.1-MONOCHROME',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dark_state_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="border border-white/15 bg-[#050507] w-full max-w-2xl rounded-xs shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#08080A]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">
              DARK CONFIGURATION
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 border border-white/20 rounded-xs text-[#888888]">
              V1.1
            </span>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="text-[#666666] hover:text-white cursor-pointer p-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="w-full sm:w-40 border-b sm:border-b-0 sm:border-r border-white/10 bg-black/60 p-2 space-y-1 shrink-0 overflow-x-auto sm:overflow-y-auto flex sm:flex-col">
            {(
              ['GENERAL', 'AI MODEL', 'STARFIELD', 'MEMORY', 'DATA', 'ABOUT'] as const
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3 py-2 text-xs font-mono tracking-wider rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-white/10 text-white font-semibold border-l-2 border-white'
                    : 'text-[#777777] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs font-mono">
            {activeTab === 'GENERAL' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                    USER PROFILE
                  </h4>
                  <p className="text-[#666666] text-[11px]">
                    User handle and identity parameters for Dark Core.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[#888888] uppercase text-[10px] mb-1">
                      USER NAME / HANDLE
                    </label>
                    <input
                      type="text"
                      value={settings.userName}
                      onChange={(e) => updateSettings({ userName: e.target.value })}
                      className="w-full bg-[#0D0D10] border border-white/15 p-2.5 text-white rounded-xs focus:border-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'AI MODEL' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                    DARK AI NETWORK
                  </h4>
                  <p className="text-[#666666] text-[11px]">
                    Multi-model intelligence network with dynamic capability routing and fallback cascade.
                  </p>
                </div>

                <div className="p-4 border border-white/10 bg-[#08080B] rounded-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#777777]">ROUTING:</span>
                    <span className="text-white font-bold">CAPABILITY AWARE (DYNAMIC)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#777777]">PRIMARY MODEL:</span>
                    <span className="text-white font-bold">Google Gemini 3.8 Flash</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#777777]">FALLBACK CASCADE:</span>
                    <span className="text-white flex items-center gap-1 font-semibold">
                      <Check size={12} />
                      ACTIVE
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#777777]">SECURITY:</span>
                    <span className="text-[#999999]">SERVER-SIDE PROXY</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#888888] uppercase text-[10px] mb-1">
                    <span>TEMPERATURE:</span>
                    <span className="text-white">{settings.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.temperature}
                    onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                    className="w-full accent-white cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeTab === 'STARFIELD' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                    PHASE 4: LIVING ENVIRONMENT & STARFIELD
                  </h4>
                  <p className="text-[#666666] text-[11px]">
                    High-performance monochromatic starfield, depth parallax, and state-responsive atmospheric lighting.
                  </p>
                </div>

                {/* Density selector */}
                <div className="space-y-1.5">
                  <label className="block text-[#888888] uppercase text-[10px]">
                    STAR FIELD DENSITY
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['sparse', 'balanced', 'dense'] as StarDensity[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDensity(d)}
                        className={`p-2 rounded-xs border text-[11px] uppercase font-mono transition-colors cursor-pointer ${
                          envSettings.density === d
                            ? 'bg-white text-black font-bold border-white'
                            : 'border-white/10 hover:border-white/30 text-[#888888] bg-[#0A0A0D]'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={toggleParallax}
                    className="p-3 border border-white/10 hover:border-white/25 bg-[#08080B] rounded-xs text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-white mb-1">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Compass size={13} />
                        DEPTH PARALLAX
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-xs ${envSettings.parallaxEnabled ? 'bg-white text-black' : 'text-[#666666]'}`}>
                        {envSettings.parallaxEnabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[#666666] text-[10px]">
                      Smooth cursor-reactive motion across multi-depth star layers.
                    </p>
                  </button>

                  <button
                    onClick={toggleShootingStars}
                    className="p-3 border border-white/10 hover:border-white/25 bg-[#08080B] rounded-xs text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-white mb-1">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Sparkles size={13} />
                        SHOOTING STARS
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-xs ${envSettings.shootingStarsEnabled ? 'bg-white text-black' : 'text-[#666666]'}`}>
                        {envSettings.shootingStarsEnabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[#666666] text-[10px]">
                      Cinematic diagonal shooting stars (~12-28s intervals).
                    </p>
                  </button>
                </div>

                {/* Manual testing trigger buttons */}
                <div className="p-3 border border-white/10 bg-[#08080B] rounded-xs space-y-2">
                  <span className="text-[10px] text-[#777777] uppercase font-mono block">
                    ENVIRONMENT TEST ACTIONS:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => triggerRipple()}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 hover:border-white text-white hover:bg-white/10 rounded-xs text-[10px] font-mono transition-all cursor-pointer"
                    >
                      <Radio size={11} />
                      EMIT SPATIAL RIPPLE
                    </button>
                    <button
                      onClick={triggerShootingStar}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-white/15 hover:border-white/30 text-[#AAAAAA] hover:text-white rounded-xs text-[10px] font-mono transition-colors cursor-pointer"
                    >
                      <Sparkles size={11} />
                      SPAWN METEOR NOW
                    </button>
                  </div>
                </div>

                {/* Telemetry info */}
                <div className="p-3 border border-white/5 bg-black/40 rounded-xs text-[10px] text-[#777777] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span>ACTIVE STARS:</span>
                    <span className="text-white">{envSnapshot.starCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PALETTE:</span>
                    <span className="text-white">PURE MONOCHROME (0% COLOR)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>REDUCED MOTION:</span>
                    <span className="text-white">{envSettings.reducedMotion ? 'DETECTED & ENFORCED' : 'OFF'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'MEMORY' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                    MEMORY SUBSYSTEM
                  </h4>
                  <p className="text-[#666666] text-[11px]">
                    Persistent knowledge state and database readiness.
                  </p>
                </div>

                <div className="p-4 border border-white/10 bg-[#08080B] rounded-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#777777]">LOCAL STORAGE:</span>
                    <span className="text-white">SYNCHRONIZED</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#777777]">UPSTREAM ADAPTER:</span>
                    <span className="text-white">POSTGRES / FIRESTORE COMPATIBLE</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'DATA' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                    DATA & STATE
                  </h4>
                  <p className="text-[#666666] text-[11px]">
                    Export system state JSON snapshot.
                  </p>
                </div>

                <button
                  onClick={handleExportState}
                  className="w-full flex items-center justify-between p-3 border border-white/15 bg-white/5 hover:bg-white/10 rounded-xs text-white cursor-pointer transition-colors"
                >
                  <div className="text-left">
                    <div className="font-bold">EXPORT SYSTEM SNAPSHOT</div>
                    <div className="text-[#666666] text-[10px]">
                      Download complete configuration and memory JSON
                    </div>
                  </div>
                  <Download size={14} className="text-white" />
                </button>
              </div>
            )}

            {activeTab === 'ABOUT' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                    DARK PERSONAL INTELLIGENCE
                  </h4>
                  <p className="text-[#666666] text-[11px]">
                    Version 1.1 • Black & White • Living Starfield • Dark Core
                  </p>
                </div>

                <div className="p-4 border border-white/10 bg-black/40 rounded-xs space-y-2 text-[#888888] leading-relaxed">
                  <p>
                    A personal intelligence system existing inside a quiet, infinite night sky.
                  </p>
                  <p>
                    Engineered with pure monochrome principles, an interactive living starfield, and the central Dark Core.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
