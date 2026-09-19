import React from 'react';
import { DiversionEvaluationResult, AlternativeRouteEvaluation } from '../types';
import {
  GitFork,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Sliders,
  Radio,
  Zap,
} from 'lucide-react';

interface DiversionFeasibilityPanelProps {
  evaluation: DiversionEvaluationResult;
  onSelectRoadById: (roadId: string) => void;
  onTriggerNoDiversionTest: () => void;
  onTriggerFeasibleTest: () => void;
}

export const DiversionFeasibilityPanel: React.FC<DiversionFeasibilityPanelProps> = ({
  evaluation,
  onSelectRoadById,
  onTriggerNoDiversionTest,
  onTriggerFeasibleTest,
}) => {
  const isFeasible = evaluation.decision === 'DIVERSION_FEASIBLE';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4">
      {/* Top Banner with Clear Decision */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-950/70 border border-indigo-800/60 text-indigo-400">
              <GitFork className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Network Diversion & Advisory Engine
              </span>
              <h3 className="text-base font-bold text-white leading-snug">
                Diversion Feasibility Assessment
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Corridor: <strong className="text-slate-200">{evaluation.roadName}</strong>
          </p>
        </div>

        {/* DECISION CALLOUT BADGE */}
        <div className="text-right">
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-black tracking-wide inline-flex items-center gap-2 shadow-lg uppercase ${
              isFeasible
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80 shadow-emerald-950/50'
                : 'bg-rose-950/80 text-rose-300 border-rose-500/80 shadow-rose-950/50'
            }`}
          >
            {isFeasible ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>DIVERSION FEASIBLE</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>DIVERSION NOT RECOMMENDED</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400 mt-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>AI Confidence:</span>
            <strong className="text-cyan-300 font-mono">{evaluation.confidence}%</strong>
          </div>
        </div>
      </div>

      {/* Primary Recommendation & Reason Box */}
      <div
        className={`p-3.5 rounded-xl border ${
          isFeasible
            ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-100'
            : 'bg-amber-950/20 border-amber-800/50 text-amber-100'
        }`}
      >
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
          Executive Advisory Determination
        </p>
        <h4 className="text-xs font-bold text-white leading-snug">
          {evaluation.primaryRecommendation}
        </h4>
        <p className="text-xs mt-1.5 text-slate-300 leading-relaxed font-medium">
          <strong>Reason:</strong> {evaluation.reason}
        </p>
      </div>

      {/* Evaluation of Alternative Detour Routes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>Evaluated Candidate Alternative Routes</span>
            <span className="text-[10px] font-normal text-slate-400">
              ({evaluation.evaluatedRoutes.length} options surveyed)
            </span>
          </h4>
          <span className="text-[10px] text-slate-400">Network Capacity Check</span>
        </div>

        <div className="space-y-2">
          {evaluation.evaluatedRoutes.map((route: AlternativeRouteEvaluation) => {
            return (
              <div
                key={route.roadId}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  route.isViable
                    ? 'bg-slate-950/70 border-cyan-800/60 hover:border-cyan-500'
                    : 'bg-slate-950/70 border-slate-800/80 opacity-90'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{route.name}</span>
                      {route.isViable ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                          VIABLE DETOUR
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          CAPACITY REJECTED
                        </span>
                      )}
                    </div>
                    {route.rejectReason && (
                      <p className="text-[11px] text-rose-300/90 mt-1 italic">
                        {route.rejectReason}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectRoadById(route.roadId)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline shrink-0"
                  >
                    Inspect Route
                  </button>
                </div>

                {/* Route Specs Grid */}
                <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Capacity Used</span>
                    <strong
                      className={`font-mono ${
                        route.currentCapacityUtilizedPercent > 80
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {route.currentCapacityUtilizedPercent}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Available Headroom</span>
                    <strong className="text-slate-200 font-mono">
                      {route.availableCapacityPcu} PCU/h
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Status</span>
                    <span className="capitalize font-semibold text-slate-300">
                      {route.currentCongestion}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Spillback Risk</span>
                    <strong
                      className={
                        route.spillbackRisk === 'Severe' || route.spillbackRisk === 'High'
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }
                    >
                      {route.spillbackRisk}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEATURE 5: WHEN DIVERSION IS NOT POSSIBLE — SIMULATED OPERATIONAL RESPONSES */}
      {!isFeasible && evaluation.advisoryResponses && (
        <div className="bg-slate-950/90 border-2 border-amber-500/40 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Simulated Operational Responses (Diversion Not Feasible)
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 uppercase">
              SIMULATED / ADVISORY
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            Because alternate corridors lack spare capacity, traffic must not be forced off-corridor. The following simulated supervisory measures are recommended:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-1">
            {evaluation.advisoryResponses.map((adv) => (
              <div
                key={adv.id}
                className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between text-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-cyan-400 mb-1">
                    <span>{adv.strategyTitle}</span>
                    <span className="text-slate-400">Target: {adv.targetJunctionOrCorridor}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{adv.advisoryText}</p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-emerald-400 flex items-center justify-between">
                  <span>
                    <strong>Impact:</strong> {adv.simulatedExpectedImpact}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-amber-200/80 bg-amber-950/30 p-2 rounded border border-amber-900/50 mt-1 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>Advisory Note:</strong> These operational interventions are simulated predictions for operator guidance. Artery does NOT directly actuate signal controllers or physical barricades.
            </span>
          </div>
        </div>
      )}

      {/* FEATURE 6: SIMULATED BEFORE / AFTER IMPACT COMPARISON */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulated Before / After Operational Impact</span>
          </h4>
          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded">
            SIMULATED ESTIMATE — NOT REAL-WORLD EXECUTION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Before */}
          <div className="bg-slate-900/70 border border-rose-950/70 rounded-xl p-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2">
              <span>Before Simulation (Current State)</span>
              <span className="capitalize">{evaluation.simulatedImpact.before.congestionLevel}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-400 block">Avg Speed</span>
                <strong className="text-white font-mono text-sm">
                  {evaluation.simulatedImpact.before.averageSpeedKmH} km/h
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Queue Length</span>
                <strong className="text-white font-mono text-sm">
                  {evaluation.simulatedImpact.before.queueLengthKm} km
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Est. Delay</span>
                <strong className="text-white font-mono text-sm">
                  {evaluation.simulatedImpact.before.estimatedDelayMin} min
                </strong>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="bg-slate-900/70 border border-emerald-950/70 rounded-xl p-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
              <span>After Simulation ({isFeasible ? 'With Diversion' : 'With Retimed Phasing'})</span>
              <span className="capitalize">{evaluation.simulatedImpact.after.congestionLevel}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-400 block">Avg Speed</span>
                <strong className="text-emerald-300 font-mono text-sm">
                  {evaluation.simulatedImpact.after.averageSpeedKmH} km/h
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Queue Length</span>
                <strong className="text-emerald-300 font-mono text-sm">
                  {evaluation.simulatedImpact.after.queueLengthKm} km
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Est. Delay</span>
                <strong className="text-emerald-300 font-mono text-sm">
                  {evaluation.simulatedImpact.after.estimatedDelayMin} min
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Net Improvement Summary Banner */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Projected Improvement:</span>
            <span className="font-bold text-emerald-400">
              +{evaluation.simulatedImpact.speedImprovementPercent}% Speed
            </span>
            <span className="font-bold text-cyan-400">
              -{evaluation.simulatedImpact.delayReductionPercent}% Delay
            </span>
            <span className="font-bold text-indigo-400">
              -{evaluation.simulatedImpact.queueReductionPercent}% Queue Length
            </span>
          </div>
          <span className="text-[10px] text-slate-500 italic">
            Calculated using macroscopic traffic-wave simulation
          </span>
        </div>
      </div>

      {/* Evaluator Quick Scenario Test Triggers */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
        <span className="text-slate-400 text-[11px]">Evaluator Quick Test:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerFeasibleTest}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs border transition-all ${
              isFeasible
                ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                : 'bg-slate-800 text-emerald-400 border-emerald-800 hover:bg-slate-700'
            }`}
          >
            Test Case A: Diversion Feasible
          </button>
          <button
            onClick={onTriggerNoDiversionTest}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs border transition-all ${
              !isFeasible
                ? 'bg-rose-600 text-white border-rose-400 shadow'
                : 'bg-slate-800 text-rose-400 border-rose-800 hover:bg-slate-700'
            }`}
          >
            Test Case B: Diversion NOT Recommended
          </button>
        </div>
      </div>
    </div>
  );
};
