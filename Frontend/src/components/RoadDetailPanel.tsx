import React from 'react';
import { RoadSegment, CongestionLevel } from '../types';
import { Gauge, Users, Clock, ArrowRight, ShieldCheck, AlertTriangle, Flame, HelpCircle } from 'lucide-react';

interface RoadDetailPanelProps {
  road: RoadSegment;
  onOpenWhyExplanation: () => void;
}

const LEVEL_BADGES: Record<CongestionLevel, { label: string; bg: string; text: string; border: string }> = {
  normal: { label: 'Normal Flow', bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60' },
  moderate: { label: 'Moderate Density', bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-800/60' },
  heavy: { label: 'Heavy Friction', bg: 'bg-orange-950/60', text: 'text-orange-400', border: 'border-orange-800/60' },
  severe: { label: 'Severe Congestion', bg: 'bg-rose-950/60', text: 'text-rose-400', border: 'border-rose-800/60' },
};

export const RoadDetailPanel: React.FC<RoadDetailPanelProps> = ({ road, onOpenWhyExplanation }) => {
  const badge = LEVEL_BADGES[road.congestionLevel];
  const vcRatio = road.trafficVolume / Math.max(road.roadCapacity, 1);
  const vcPercent = Math.min(Math.round(vcRatio * 100), 150);
  const speedDeviation = Math.round(
    ((road.currentSpeed - road.expectedBaselineSpeed) / road.expectedBaselineSpeed) * 100
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded">
              {road.category}
            </span>
            <span className="text-xs text-slate-400">{road.corridor}</span>
          </div>
          <h2 className="text-base font-bold text-white mt-1 leading-snug">{road.name}</h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <span className="text-slate-300 font-medium">{road.fromJunction}</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="text-slate-300 font-medium">{road.toJunction}</span>
          </div>
        </div>

        {/* Current Congestion Status Pill */}
        <div className="text-right">
          <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${badge.bg} ${badge.text} ${badge.border} shadow-sm inline-flex items-center gap-1.5`}>
            {road.congestionLevel === 'severe' && <Flame className="w-3.5 h-3.5 animate-pulse" />}
            {road.congestionLevel === 'heavy' && <AlertTriangle className="w-3.5 h-3.5" />}
            {road.congestionLevel === 'normal' && <ShieldCheck className="w-3.5 h-3.5" />}
            <span>{badge.label}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Updated {road.timestamp}</span>
          </p>
        </div>
      </div>

      {/* Metrics 4-Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Average Speed */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Average Speed</span>
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-white">{road.currentSpeed}</span>
            <span className="text-xs text-slate-400">km/h</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Baseline: <strong className="text-slate-300">{road.expectedBaselineSpeed} km/h</strong>{' '}
            <span className={speedDeviation < 0 ? 'text-rose-400' : 'text-emerald-400'}>
              ({speedDeviation > 0 ? `+${speedDeviation}%` : `${speedDeviation}%`})
            </span>
          </p>
        </div>

        {/* Traffic Volume */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Traffic Volume</span>
            <Users className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-white">{road.trafficVolume.toLocaleString()}</span>
            <span className="text-xs text-slate-400">PCU/h</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Design Cap: <strong className="text-slate-300">{road.roadCapacity.toLocaleString()}</strong>
          </p>
        </div>

        {/* V/C Saturation Ratio */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Volume / Capacity</span>
            <span className={`text-[10px] font-bold ${vcPercent > 90 ? 'text-rose-400' : 'text-amber-400'}`}>
              {vcPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-white">{vcRatio.toFixed(2)}</span>
            <span className="text-xs text-slate-400">V/C</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                vcPercent >= 95 ? 'bg-rose-500' : vcPercent >= 80 ? 'bg-orange-500' : vcPercent >= 65 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(vcPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Queue Length */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Queue Extent</span>
            <span className="text-[10px] text-slate-400">Shockwave</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-white">{road.queueLengthKm}</span>
            <span className="text-xs text-slate-400">km</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Free Flow: <strong className="text-slate-300">{road.freeFlowSpeed} km/h</strong>
          </p>
        </div>
      </div>

      {/* Why Explanation Prompt Bar */}
      <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 px-3 py-2 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300">
            {road.congestionLevel === 'severe' || road.congestionLevel === 'heavy'
              ? 'AI Root Cause Analysis available for active bottleneck'
              : 'Nominal traffic state verified across lane detectors'}
          </span>
        </div>
        <button
          onClick={onOpenWhyExplanation}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800/60 px-2.5 py-1 rounded-lg transition-colors"
        >
          View "Why?" Breakdown
        </button>
      </div>
    </div>
  );
};
