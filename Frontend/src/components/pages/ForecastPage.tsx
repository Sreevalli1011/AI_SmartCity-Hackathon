import React, { useState } from 'react';
import { RoadSegment, ForecastResult, ForecastHorizon, AppSection } from '../../types';
import {
  TrendingUp,
  Clock,
  Gauge,
  Activity,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info,
  Calendar,
} from 'lucide-react';
import { ForecastDetailModal } from '../ForecastDetailModal';

interface ForecastPageProps {
  roads: RoadSegment[];
  selectedRoad: RoadSegment;
  onSelectRoad: (road: RoadSegment) => void;
  forecast: ForecastResult;
  onNavigate: (section: AppSection) => void;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({
  roads,
  selectedRoad,
  onSelectRoad,
  forecast,
  onNavigate,
}) => {
  const [selectedHorizonForModal, setSelectedHorizonForModal] = useState<ForecastHorizon | null>(null);

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'normal':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
      case 'moderate':
        return 'text-amber-400 bg-amber-950/80 border-amber-800';
      case 'heavy':
        return 'text-orange-400 bg-orange-950/80 border-orange-800';
      case 'severe':
        return 'text-rose-400 bg-rose-950/80 border-rose-800';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  interface TimelinePoint {
    label: string;
    minutesAhead: number;
    state: string;
    speed: number;
    volume: number;
    confidence: number;
    isNow: boolean;
    growth: string;
    horizonObj?: ForecastHorizon;
  }

  // Timeline points including NOW
  const timelinePoints: TimelinePoint[] = [
    {
      label: 'NOW',
      minutesAhead: 0,
      state: selectedRoad.congestionLevel,
      speed: selectedRoad.currentSpeed,
      volume: selectedRoad.trafficVolume,
      confidence: 100,
      isNow: true,
      growth: 'Baseline',
      horizonObj: undefined,
    },
    ...forecast.horizons.map((h) => ({
      label: `+${h.minutesAhead} MIN`,
      minutesAhead: h.minutesAhead,
      state: h.predictedCongestion,
      speed: h.expectedSpeed,
      volume: h.expectedVolume,
      confidence: h.confidence,
      isNow: false,
      growth: `+${h.volumeGrowthRatePercent}% vol`,
      horizonObj: h,
    })),
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner & Road Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                15–60 Minute Predictive Congestion Horizon
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Multi-Horizon AI Forecast
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Anticipating bottleneck progression and queue shockwaves before secondary network lock occurs
            </p>
          </div>
        </div>

        {/* Road Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Target Road:</span>
          <select
            value={selectedRoad.id}
            onChange={(e) => {
              const r = roads.find((road) => road.id === e.target.value);
              if (r) onSelectRoad(r);
            }}
            className="bg-slate-950 text-white text-xs border border-slate-700 rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none"
          >
            {roads.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.congestionLevel.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. TIMELINE OF PREDICTIONS (NOW, +15, +30, +45, +60 MIN) - ALL CLICKABLE */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Predictive Timeline (Click any horizon for deep analysis)</span>
          </span>
          <span className="text-[11px] text-cyan-400 font-medium">Click card to open Horizon Details</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {timelinePoints.map((pt, idx) => {
            const isClickable = !pt.isNow;
            return (
              <div
                key={idx}
                onClick={() => {
                  if (pt.horizonObj) {
                    setSelectedHorizonForModal(pt.horizonObj);
                  }
                }}
                className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between ${
                  pt.isNow
                    ? 'bg-slate-950/70 border-slate-800 text-slate-300'
                    : 'bg-slate-900/90 border-slate-800 hover:border-cyan-400 hover:bg-slate-800/90 cursor-pointer shadow-md group'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-bold font-mono ${
                        pt.isNow ? 'text-slate-400' : 'text-cyan-400 group-hover:text-cyan-300'
                      }`}
                    >
                      {pt.label}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${getStatusColor(
                        pt.state
                      )}`}
                    >
                      {pt.state}
                    </span>
                  </div>

                  <div className="space-y-1 my-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] text-slate-400">Predicted Speed:</span>
                      <span className="text-base font-bold font-mono text-white">
                        {pt.speed} <span className="text-[10px] font-normal text-slate-400">km/h</span>
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] text-slate-400">Predicted Volume:</span>
                      <span className="text-xs font-bold font-mono text-slate-200">
                        {pt.volume.toLocaleString()} <span className="text-[9px] text-slate-400">PCU/h</span>
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] text-slate-400">Confidence:</span>
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {pt.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 mt-2 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{pt.growth}</span>
                  {isClickable && (
                    <span className="text-cyan-400 font-semibold group-hover:underline flex items-center gap-0.5">
                      Details <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SIMPLE TRAFFIC FORECAST CHART & TREND VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Speed & Volume Curve Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Predicted Speed & Volume Trajectory</span>
              </h4>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-3 h-1 bg-cyan-400 rounded-full" /> Speed (km/h)
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-3 h-1 bg-amber-400 rounded-full" /> Volume (PCU/h)
                </span>
              </div>
            </div>

            {/* Custom SVG Responsive Forecast Chart */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 h-56 flex flex-col justify-between relative">
              <div className="absolute inset-x-4 top-4 bottom-10 grid grid-rows-3 pointer-events-none">
                <div className="border-b border-slate-800/60" />
                <div className="border-b border-slate-800/60" />
                <div className="border-b border-slate-800/60" />
              </div>

              {/* Responsive Bar/Chart Grid */}
              <div className="flex-1 flex items-end justify-around gap-2 z-10 pt-4 pb-2">
                {timelinePoints.map((pt, i) => {
                  const maxSpeed = 50;
                  const speedHeightPercent = Math.min(Math.round((pt.speed / maxSpeed) * 100), 100);
                  const isSevere = pt.state === 'severe';

                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (pt.horizonObj) setSelectedHorizonForModal(pt.horizonObj);
                      }}
                      className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
                    >
                      {/* Bar Container */}
                      <div className="w-full max-w-[40px] h-32 bg-slate-900/60 rounded-t-lg flex items-end justify-center p-1 border border-slate-800 group-hover:border-cyan-400 transition-colors">
                        <div
                          className={`w-full rounded transition-all ${
                            isSevere
                              ? 'bg-gradient-to-t from-rose-600 to-rose-400'
                              : 'bg-gradient-to-t from-cyan-600 to-cyan-400'
                          }`}
                          style={{ height: `${speedHeightPercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold font-mono text-white">
                        {pt.speed} <span className="text-[9px] text-slate-400">km/h</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{pt.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-2 font-mono">
                <span>Current Baseline: {selectedRoad.expectedBaselineSpeed} km/h</span>
                <span>Corridor Capacity: {selectedRoad.roadCapacity} PCU/hr</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3">
            Note: Speed deterioration compounds non-linearly once flow exceeds 82% of physical link capacity.
          </p>
        </div>

        {/* WHY? Causality Breakdown & Available Responses (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-400" />
                <span>WHY? Causal Predictive Decomposition</span>
              </h4>
              <span className="text-[10px] font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                Model: 87% Confidence
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {forecast.whyExplanation.summary}
            </p>

            {/* Crucial WHY Factors (as specified in user prompt) */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Primary Driving Factors:
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Traffic volume increasing:</strong> Inflow rates continue rising across converging arterial junctions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Average speed decreasing:</strong> Link queue length now stretches to {selectedRoad.queueLengthKm} km, reducing throughput.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Historical peak-hour pattern:</strong> Empirical data confirms recurring demand surges on this corridor during this window.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Road operating near capacity:</strong> Current utilization stands at {Math.round((selectedRoad.trafficVolume / selectedRoad.roadCapacity) * 100)}% of theoretical capacity.</span>
                </li>
              </ul>
            </div>

            {/* Risk Assessment */}
            <div className="bg-rose-950/20 border border-rose-900/60 p-3 rounded-xl text-xs text-rose-200">
              <strong>Risk Assessment:</strong> {forecast.whyExplanation.riskAssessment}
            </div>
          </div>

          {/* Prompt Requirement: [Check Available Responses] Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Next Recommended Action:</span>
            <button
              onClick={() => onNavigate('RECOMMENDATIONS')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
            >
              <span>Check Available Responses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Forecast Detail Modal for Horizon Clicks */}
      <ForecastDetailModal
        isOpen={Boolean(selectedHorizonForModal)}
        onClose={() => setSelectedHorizonForModal(null)}
        road={selectedRoad}
        horizon={selectedHorizonForModal}
        onNavigateToRecommendations={() => onNavigate('RECOMMENDATIONS')}
      />
    </div>
  );
};
