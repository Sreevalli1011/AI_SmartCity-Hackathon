import React from 'react';
import { Activity, ShieldAlert, Radio, Play, Pause, RefreshCw, Cpu, Layers } from 'lucide-react';

interface HeaderProps {
  simulatedTime: string;
  isAutoSimulating: boolean;
  onToggleAutoSim: () => void;
  onResetBaseline: () => void;
  simulationSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onOpenBottlenecks: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  simulatedTime,
  isAutoSimulating,
  onToggleAutoSim,
  onResetBaseline,
  simulationSpeed,
  onChangeSpeed,
  onOpenBottlenecks,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-xl">
      {/* Brand & System Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
          <Activity className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>Artery</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                Decision Support
              </span>
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-full">
              <Radio className="w-3 h-3 animate-ping" />
              HYD ICCC ENGINE LIVE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Urban Traffic Flow & Incident Intelligence System • Hyderabad Corridor Grid
          </p>
        </div>
      </div>

      {/* Mandatory Advisory Badge */}
      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <div className="text-left">
          <p className="text-[11px] font-bold text-amber-300 tracking-wide uppercase leading-tight">
            Simulated / Advisory Environment
          </p>
          <p className="text-[10px] text-amber-200/70 leading-tight">
            Non-control supervisory system • No direct field actuation
          </p>
        </div>
      </div>

      {/* Clock & Simulation Runtime Controls */}
      <div className="flex items-center gap-2.5">
        <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 font-mono text-xs text-slate-200 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>{simulatedTime} IST</span>
        </div>

        {/* Speed multiplier selector */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
          {[1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => onChangeSpeed(speed)}
              className={`px-2 py-1 rounded font-medium transition-all ${
                simulationSpeed === speed
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`${speed}x Simulation Clock Speed`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Play / Pause live simulation stream */}
        <button
          onClick={onToggleAutoSim}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isAutoSimulating
              ? 'bg-slate-800 text-amber-400 border-amber-500/40 hover:bg-slate-700'
              : 'bg-cyan-600 text-white border-cyan-400/40 hover:bg-cyan-500 shadow-md shadow-cyan-600/30'
          }`}
        >
          {isAutoSimulating ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Sim</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Auto Flow</span>
            </>
          )}
        </button>

        {/* Recurring Bottlenecks Modal Trigger */}
        <button
          onClick={onOpenBottlenecks}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 hover:bg-indigo-900/80 hover:text-white transition-all shadow-sm"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Bottleneck Hub</span>
        </button>

        {/* Reset System */}
        <button
          onClick={onResetBaseline}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          title="Reset traffic to baseline nominal state"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
