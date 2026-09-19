import React, { useState } from 'react';
import {
  RoadSegment,
  DiversionEvaluationResult,
  AlternativeRouteEvaluation,
  AppSection,
} from '../../types';
import {
  GitFork,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Gauge,
  Clock,
  Sparkles,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { RouteInspectionModal } from '../RouteInspectionModal';

interface RecommendationsPageProps {
  roads: RoadSegment[];
  selectedRoad: RoadSegment;
  onSelectRoad: (road: RoadSegment) => void;
  diversionResult: DiversionEvaluationResult;
  onNavigate: (section: AppSection) => void;
  onOpenWhyExplanation: () => void;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({
  roads,
  selectedRoad,
  onSelectRoad,
  diversionResult,
  onNavigate,
  onOpenWhyExplanation,
}) => {
  const [inspectedRoute, setInspectedRoute] = useState<AlternativeRouteEvaluation | null>(null);

  const isFeasible = diversionResult.decision === 'DIVERSION_FEASIBLE';
  const bestRoute = diversionResult.evaluatedRoutes.find((r) => r.isViable) || diversionResult.evaluatedRoutes[0];

  return (
    <div className="space-y-4">
      {/* Top Banner & Road Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Simulated Diversion Feasibility & Decision Engine
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isFeasible
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}
              >
                Decision: {isFeasible ? 'DIVERSION FEASIBLE' : 'DIVERSION NOT RECOMMENDED'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Corridor Capacity Audit & Dynamic Spillback Risk Containment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Target Road:</span>
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

      {/* Mandatory Advisory Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wide text-[11px]">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>SIMULATED ESTIMATE — NOT REAL-WORLD EXECUTION (Advisory Decision Support Only)</span>
        </div>
        <span className="text-[11px] text-amber-200/80 hidden md:inline">
          No automated physical signal alterations are transmitted to field controllers
        </span>
      </div>

      {/* Cross-Link Banner for No-Diversion Case */}
      {!isFeasible && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-300">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Alternative routes lack spare capacity.</strong> Diverting traffic now would trigger secondary corridor gridlock.
            </span>
          </div>
          <button
            onClick={() => onNavigate('NO_DIVERSION')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all"
          >
            <span>Open Dedicated No-Diversion Operational View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (7 cols): Feasibility Evaluation & Alternative Routes */}
        <div className="lg:col-span-7 space-y-4">
          {/* Current Problem Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Problem Context
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">
                {selectedRoad.congestionLevel.toUpperCase()} CONGESTION
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white">{selectedRoad.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Operating at {Math.round((selectedRoad.trafficVolume / selectedRoad.roadCapacity) * 100)}% capacity utilization • Queue length: {selectedRoad.queueLengthKm} km
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Current Velocity</span>
                <span className="text-lg font-bold font-mono text-white">{selectedRoad.currentSpeed} km/h</span>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  AI Recommendation
                </span>
                <span className="text-[10px] font-mono text-cyan-300">
                  Confidence: {diversionResult.confidence}%
                </span>
              </div>
              <p className="text-xs font-bold text-white leading-relaxed">
                {diversionResult.primaryRecommendation}
              </p>
              <p className="text-xs text-slate-400">
                {diversionResult.reason}
              </p>
            </div>
          </div>

          {/* Alternative Routes Evaluation List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Candidate Alternative Routes Capacity Audit
              </span>
              <span className="text-xs text-slate-400">Click route card or button to inspect</span>
            </div>

            <div className="space-y-3">
              {diversionResult.evaluatedRoutes.map((route) => (
                <div
                  key={route.roadId}
                  className={`p-4 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    route.isViable
                      ? 'bg-slate-950/80 border-emerald-900/60 hover:border-emerald-500'
                      : 'bg-slate-950/80 border-rose-900/60 hover:border-rose-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{route.name}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${
                            route.isViable
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border-rose-800'
                          }`}
                        >
                          {route.isViable ? 'Viable Bypass' : 'Saturated'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Capacity used: <strong className="text-white">{route.currentCapacityUtilizedPercent}%</strong> • Available headroom: <strong className="text-emerald-400">{route.availableCapacityPcu} PCU/hr</strong>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">Spillback Risk</span>
                      <span
                        className={`font-bold font-mono ${
                          route.spillbackRisk === 'Low'
                            ? 'text-emerald-400'
                            : route.spillbackRisk === 'Moderate'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {route.spillbackRisk}
                      </span>
                    </div>
                  </div>

                  {/* Actions on Alternative Route Card (Mandatory from prompt) */}
                  <div className="pt-2 border-t border-slate-800/80 mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Est. Transit: {route.estimatedTravelTimeMin} min (Post: {route.predictedCongestion})
                    </span>
                    <button
                      onClick={() => setInspectedRoute(route)}
                      className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span>Inspect Alternative Route</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right (5 cols): SIMULATED IMPACT (BEFORE VS AFTER) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between h-full space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Simulated Before vs After Impact</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Simulated Advisory
                </span>
              </div>

              {/* Before vs After Comparison Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* BEFORE */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-rose-900/40 space-y-2">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                    Before Diversion
                  </span>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Average Speed</span>
                    <p className="text-lg font-bold font-mono text-white">
                      {diversionResult.simulatedImpact.before.averageSpeedKmH} km/h
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Queue Length</span>
                    <p className="text-sm font-bold font-mono text-rose-400">
                      {diversionResult.simulatedImpact.before.queueLengthKm} km
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Estimated Delay</span>
                    <p className="text-sm font-bold font-mono text-slate-200">
                      {diversionResult.simulatedImpact.before.estimatedDelayMin} min
                    </p>
                  </div>
                </div>

                {/* AFTER */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-emerald-900/40 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    After Simulated Diversion
                  </span>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Average Speed</span>
                    <p className="text-lg font-bold font-mono text-emerald-400">
                      {diversionResult.simulatedImpact.after.averageSpeedKmH} km/h
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Queue Length</span>
                    <p className="text-sm font-bold font-mono text-emerald-400">
                      {diversionResult.simulatedImpact.after.queueLengthKm} km
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Estimated Delay</span>
                    <p className="text-sm font-bold font-mono text-emerald-400">
                      {diversionResult.simulatedImpact.after.estimatedDelayMin} min
                    </p>
                  </div>
                </div>
              </div>

              {/* Improvement Metric Pills (Prompt: Speed improvement %, Delay reduction %, Queue reduction %) */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-950/30 border border-emerald-800/60 p-2.5 rounded-xl">
                  <span className="text-[9px] text-slate-400 block">Speed Gain</span>
                  <p className="text-sm font-bold font-mono text-emerald-400">
                    +{diversionResult.simulatedImpact.speedImprovementPercent}%
                  </p>
                </div>

                <div className="bg-cyan-950/30 border border-cyan-800/60 p-2.5 rounded-xl">
                  <span className="text-[9px] text-slate-400 block">Delay Reduction</span>
                  <p className="text-sm font-bold font-mono text-cyan-400">
                    -{diversionResult.simulatedImpact.delayReductionPercent}%
                  </p>
                </div>

                <div className="bg-blue-950/30 border border-blue-800/60 p-2.5 rounded-xl">
                  <span className="text-[9px] text-slate-400 block">Queue Reduction</span>
                  <p className="text-sm font-bold font-mono text-blue-400">
                    -{diversionResult.simulatedImpact.queueReductionPercent}%
                  </p>
                </div>
              </div>

              {/* WHY Reasoning Decomposition */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    WHY? AI Decision Factors
                  </span>
                  <button
                    onClick={onOpenWhyExplanation}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Explain Reasoning</span>
                  </button>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {diversionResult.whyExplanation.bulletPoints.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Navigation to Explore No-Diversion Case */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Need saturated response?</span>
              <button
                onClick={() => onNavigate('NO_DIVERSION')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <span>Explore No-Diversion Response</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Route Detail Modal for deep inspection */}
      <RouteInspectionModal
        isOpen={Boolean(inspectedRoute)}
        onClose={() => setInspectedRoute(null)}
        route={inspectedRoute}
        targetRoad={selectedRoad}
        onSelectRoadById={(id) => {
          const r = roads.find((road) => road.id === id);
          if (r) onSelectRoad(r);
        }}
      />
    </div>
  );
};
