import React, { useState } from 'react';
import { RecurringBottleneck, AppSection } from '../../types';
import { RECURRING_BOTTLENECKS } from '../../data/hyderabadNetwork';
import {
  Layers,
  Calendar,
  Clock,
  Gauge,
  Activity,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  Building,
} from 'lucide-react';

interface BottlenecksPageProps {
  onNavigate: (section: AppSection) => void;
  onSelectRoadById: (roadId: string) => void;
}

export const BottlenecksPage: React.FC<BottlenecksPageProps> = ({
  onNavigate,
  onSelectRoadById,
}) => {
  const [selectedBottleneckId, setSelectedBottleneckId] = useState<string>(
    RECURRING_BOTTLENECKS[0]?.id || ''
  );

  const selectedBottleneck =
    RECURRING_BOTTLENECKS.find((b: RecurringBottleneck) => b.id === selectedBottleneckId) ||
    RECURRING_BOTTLENECKS[0];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Recurring Structural Bottlenecks & Civil Planning Advisory
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                {RECURRING_BOTTLENECKS.length} Identified Chronic Chokepoints
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Distinguishing transient incidents from chronic geometric bottlenecks requiring structural and signal redesign
            </p>
          </div>
        </div>

        {/* Advisory Badge */}
        <div className="text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>SIMULATED CIVIL ESTIMATE • Macro-Planning Decision Support</span>
        </div>
      </div>

      {/* Main Grid: Bottlenecks List (5 cols) + Detailed Bottleneck Profile & Long-term Proposal (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (5 cols): Chronic Bottleneck Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-bold uppercase tracking-wider">Identified Chronic Chokepoints</span>
            <span>Click to inspect historical profile</span>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {RECURRING_BOTTLENECKS.map((b: RecurringBottleneck) => {
              const isSelected = b.id === selectedBottleneck?.id;

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBottleneckId(b.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-indigo-500 shadow-lg text-white'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <h4 className="font-bold text-sm text-white">{b.junctionName}</h4>
                        <p className="text-[11px] text-slate-400">{b.locationName}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 shrink-0">
                        {b.monthlyFrequency}x / month
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-300">
                      <div>
                        <span className="text-[9px] text-slate-400 block">Peak Window</span>
                        <span className="text-white text-[10px] truncate block">{b.typicalCongestionTime}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Avg Duration</span>
                        <span className="text-amber-400 font-bold">{b.averageCongestionDurationMin} min</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Avg Speed</span>
                        <span className="text-rose-400 font-bold">{b.averagePeakSpeedKmH} km/h</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 truncate max-w-[200px]">
                      {b.mainContributingFactors[0]}
                    </span>
                    <span className="text-indigo-400 font-semibold flex items-center gap-0.5 shrink-0">
                      Inspect <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (7 cols): DEDICATED BOTTLENECK DETAILS PANEL */}
        <div className="lg:col-span-7">
          {selectedBottleneck ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full space-y-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="border-b border-slate-800 pb-3 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                      Historical Bottleneck Analytics & Civil Engineering Profile
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {selectedBottleneck.junctionName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Corridor: <strong className="text-slate-200">{selectedBottleneck.locationName}</strong>
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {selectedBottleneck.monthlyFrequency} Occurrences / Month
                  </span>
                </div>

                {/* Key Metrics Required: Daily occurrence, Peak time, Congestion duration, Average speed */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      Monthly Frequency
                    </span>
                    <p className="text-xl font-bold text-white font-mono">
                      {selectedBottleneck.monthlyFrequency}{' '}
                      <span className="text-xs text-slate-400 font-normal">events</span>
                    </p>
                    <span className="text-[10px] text-slate-400">~0.8 per working day</span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      Peak Time Window
                    </span>
                    <p className="text-sm font-bold text-amber-400 font-mono truncate">
                      {selectedBottleneck.typicalCongestionTime}
                    </p>
                    <span className="text-[10px] text-slate-400">Morning commute peak</span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      Average Duration
                    </span>
                    <p className="text-xl font-bold text-rose-400 font-mono">
                      {selectedBottleneck.averageCongestionDurationMin}{' '}
                      <span className="text-xs text-slate-400 font-normal">min</span>
                    </p>
                    <span className="text-[10px] text-slate-400">Persistent bottleneck</span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      Average Peak Speed
                    </span>
                    <p className="text-xl font-bold text-cyan-400 font-mono">
                      {selectedBottleneck.averagePeakSpeedKmH}{' '}
                      <span className="text-xs text-slate-400 font-normal">km/h</span>
                    </p>
                    <span className="text-[10px] text-slate-400">Severe crawl speed</span>
                  </div>
                </div>

                {/* Contributing Physical/Geometric Factors */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Contributing Physical & Geometric Factors</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {selectedBottleneck.mainContributingFactors.map((factor: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* LONG-TERM RECOMMENDATION & SIMULATED CHANGE */}
                <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-4 rounded-xl border border-indigo-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Long-Term Infrastructure Recommendation</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-200 border border-indigo-800">
                      Tier: {selectedBottleneck.longTermRecommendation.estimatedCostTier}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white leading-relaxed">
                    {selectedBottleneck.longTermRecommendation.title}: {selectedBottleneck.longTermRecommendation.description}
                  </p>

                  {/* CURRENT SIMULATED STATE vs PROPOSED NETWORK CHANGE (Mandatory from prompt) */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1 text-xs font-mono">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Current Simulated State
                      </span>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Peak Speed:</span>
                        <span className="text-white">
                          {selectedBottleneck.longTermRecommendation.simulatedBeforeAfterImpact.currentPeakSpeed}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Duration:</span>
                        <span className="text-rose-400">{selectedBottleneck.averageCongestionDurationMin} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Throat Capacity:</span>
                        <span className="text-slate-300">Deficit</span>
                      </div>
                    </div>

                    <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-800/60 space-y-1 text-xs font-mono">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                        Proposed Network Change Impact
                      </span>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Projected Speed:</span>
                        <span className="text-emerald-400">
                          {selectedBottleneck.longTermRecommendation.simulatedBeforeAfterImpact.projectedSpeed}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Delay Savings:</span>
                        <span className="text-emerald-400">
                          {selectedBottleneck.longTermRecommendation.simulatedBeforeAfterImpact.delaySavings}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Throughput Gain:</span>
                        <span className="text-emerald-400">
                          {selectedBottleneck.longTermRecommendation.simulatedBeforeAfterImpact.throughputGain}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-amber-300 font-mono pt-1">
                    <span>Category: {selectedBottleneck.longTermRecommendation.category}</span>
                    <span className="text-[10px] text-slate-400">SIMULATED ESTIMATE</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Corridor Connection:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectRoadById(selectedBottleneck.roadId || 'cyber-towers-main');
                      onNavigate('LIVE_TRAFFIC');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Inspect on Live Map</span>
                  </button>

                  <button
                    onClick={() => onNavigate('SIMULATION')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all"
                  >
                    <span>Run in Sandbox</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              Select a bottleneck to inspect civil engineering analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
