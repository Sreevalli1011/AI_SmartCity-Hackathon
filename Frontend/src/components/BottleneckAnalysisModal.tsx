import React, { useState } from 'react';
import { RecurringBottleneck } from '../types';
import {
  Layers,
  X,
  Clock,
  Calendar,
  Gauge,
  HelpCircle,
  Building2,
  Zap,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';

interface BottleneckAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  bottlenecks: RecurringBottleneck[];
  onSelectRoadById: (roadId: string) => void;
}

export const BottleneckAnalysisModal: React.FC<BottleneckAnalysisModalProps> = ({
  isOpen,
  onClose,
  bottlenecks,
  onSelectRoadById,
}) => {
  const [activeTabId, setActiveTabId] = useState<string>(bottlenecks[0]?.id || '');

  if (!isOpen) return null;

  const activeBottleneck = bottlenecks.find((b) => b.id === activeTabId) || bottlenecks[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Recurring Bottleneck Intelligence & Long-Term Infrastructure Planning
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Historical Pattern Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Systematic peak-hour congestion clustering and civil/operational recommendations for Hyderabad
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Tab list + Right Detail view */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Column: Bottleneck List */}
          <div className="w-full md:w-80 border-r border-slate-800 bg-slate-950/40 p-3 overflow-y-auto space-y-2 shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Recurring Hotspots ({bottlenecks.length})
            </p>

            {bottlenecks.map((b) => {
              const isActive = b.id === activeBottleneck.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setActiveTabId(b.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex flex-col gap-1 ${
                    isActive
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md text-white'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">{b.locationName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-900">
                      {b.monthlyFrequency}x / mo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{b.junctionName}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                    <span>Peak Avg: <strong className="text-rose-400">{b.averagePeakSpeedKmH} km/h</strong></span>
                    <span>•</span>
                    <span>Dur: <strong>{b.averageCongestionDurationMin}m</strong></span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Bottleneck In-Depth Profile */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
            {/* Hotspot Title & Frequency Stats */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded">
                    Identified Recurring Bottleneck
                  </span>
                  <h4 className="text-lg font-bold text-white mt-1.5 leading-snug">
                    {activeBottleneck.locationName}
                  </h4>
                  <p className="text-xs text-slate-400">{activeBottleneck.junctionName}</p>
                </div>

                <button
                  onClick={() => {
                    onSelectRoadById(activeBottleneck.roadId);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-400 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 transition-colors"
                >
                  Inspect on Map
                </button>
              </div>

              {/* 4 Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-800">
                <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    <span>Frequency</span>
                  </div>
                  <p className="text-sm font-bold text-white font-mono">
                    {activeBottleneck.monthlyFrequency}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">days/mo</span>
                  </p>
                </div>

                <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Typical Peak Window</span>
                  </div>
                  <p className="text-[11px] font-bold text-amber-300 font-mono truncate">
                    {activeBottleneck.typicalCongestionTime}
                  </p>
                </div>

                <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>Avg Duration</span>
                  </div>
                  <p className="text-sm font-bold text-white font-mono">
                    {activeBottleneck.averageCongestionDurationMin}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">mins/event</span>
                  </p>
                </div>

                <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                    <Gauge className="w-3 h-3 text-rose-400" />
                    <span>Peak Avg Speed</span>
                  </div>
                  <p className="text-sm font-bold text-rose-400 font-mono">
                    {activeBottleneck.averagePeakSpeedKmH}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">km/h</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Main Contributing Factors */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Primary Physical & Geometric Causes</span>
              </h5>
              <div className="space-y-1.5">
                {activeBottleneck.mainContributingFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300 text-xs">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Long-Term Recommendation Box */}
            <div className="bg-indigo-950/20 border border-indigo-700/60 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    Long-Term Network & Infrastructure Recommendation
                  </h5>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-200 border border-indigo-800">
                  Tier: {activeBottleneck.longTermRecommendation.estimatedCostTier}
                </span>
              </div>

              <h6 className="text-sm font-bold text-white mb-1.5">
                {activeBottleneck.longTermRecommendation.title}
              </h6>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeBottleneck.longTermRecommendation.description}
              </p>

              {/* Simulated Before / After for Long-Term Solution */}
              <div className="mt-3 pt-3 border-t border-indigo-900/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                    Projected Speed Restoration
                  </span>
                  <p className="text-emerald-400 font-bold font-mono">
                    {activeBottleneck.longTermRecommendation.simulatedBeforeAfterImpact.projectedSpeed}
                  </p>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                    Corridor Throughput Gain
                  </span>
                  <p className="text-cyan-400 font-bold font-mono">
                    {activeBottleneck.longTermRecommendation.simulatedBeforeAfterImpact.throughputGain}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Analysis derived from simulated inductive loop and aggregated floating car trajectories
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
          >
            Close Bottleneck Hub
          </button>
        </div>
      </div>
    </div>
  );
};
