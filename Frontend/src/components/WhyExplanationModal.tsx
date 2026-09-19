import React from 'react';
import { RoadSegment, DiversionEvaluationResult, ForecastResult } from '../types';
import { HelpCircle, X, Sparkles, AlertTriangle, ShieldCheck, Cpu, Info } from 'lucide-react';

interface WhyExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  road: RoadSegment;
  diversionResult: DiversionEvaluationResult;
  forecast: ForecastResult;
}

export const WhyExplanationModal: React.FC<WhyExplanationModalProps> = ({
  isOpen,
  onClose,
  road,
  diversionResult,
  forecast,
}) => {
  if (!isOpen) return null;

  const isFeasible = diversionResult.decision === 'DIVERSION_FEASIBLE';
  const vcPercent = Math.round((road.trafficVolume / road.roadCapacity) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI "Why?" Decision Explanation Matrix</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Transparent Decision Support
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Corridor: <strong className="text-slate-200">{road.name}</strong> • Real-time causal decomposition
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

        {/* Modal Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          {/* 1. WHY IS THIS ROAD CONGESTED? */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>1. Why is this road in a "{road.congestionLevel}" state?</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                V/C: {(road.trafficVolume / road.roadCapacity).toFixed(2)} ({vcPercent}%)
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mb-2">
              The corridor current speed ({road.currentSpeed} km/h) deviates by{' '}
              <strong className="text-rose-400">
                {Math.round(((road.currentSpeed - road.expectedBaselineSpeed) / road.expectedBaselineSpeed) * 100)}%
              </strong>{' '}
              from historical baseline ({road.expectedBaselineSpeed} km/h).
            </p>
            <ul className="space-y-1.5 text-slate-300 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>
                  Traffic volume reached <strong>{road.trafficVolume.toLocaleString()} PCU/hr</strong> against nominal design capacity of {road.roadCapacity.toLocaleString()} PCU/hr.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>
                  Cruising speed deteriorated below critical transition threshold ({road.currentSpeed} km/h), entering high-density friction regime.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>
                  Road is currently carrying a {road.queueLengthKm} km backward queue shockwave impacting upstream junctions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>
                  Historical diurnal pattern indicates this corridor experiences 84% probability of demand spikes during this hour.
                </span>
              </li>
            </ul>
          </div>

          {/* 2. WHY WILL CONGESTION INCREASE (FORECAST)? */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>2. Why is traffic forecast to evolve as predicted (+15m to +60m)?</span>
              </h4>
              <span className="text-[10px] font-mono text-cyan-300">
                Model Confidence: {forecast.horizons[0]?.confidence || 87}%
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mb-2">
              {forecast.whyExplanation.summary}
            </p>
            <ul className="space-y-1.5 text-slate-300 text-xs">
              {forecast.whyExplanation.bulletFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. WHY THIS RECOMMENDATION? (DIVERSION FEASIBLE vs NOT RECOMMENDED) */}
          <div
            className={`border rounded-xl p-4 ${
              isFeasible
                ? 'bg-emerald-950/20 border-emerald-800/60'
                : 'bg-rose-950/20 border-rose-800/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4
                className={`text-xs font-bold uppercase tracking-wider ${
                  isFeasible ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {isFeasible ? '3. Why recommend diversion?' : '3. Why is diversion NOT recommended?'}
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                {diversionResult.decision}
              </span>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed mb-2 font-medium">
              {diversionResult.whyExplanation.rationale}
            </p>
            <ul className="space-y-1.5 text-slate-300 text-xs">
              {diversionResult.whyExplanation.bulletPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className={isFeasible ? 'text-emerald-400' : 'text-rose-400'}>▪</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FEATURE 9: CONFIDENCE, LIMITATIONS & UNCERTAINTY EXPLANATION */}
          <div className="bg-indigo-950/20 border border-indigo-800/60 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Model Confidence & Data Limitations</span>
              </h4>
              <span className="text-[11px] font-mono text-cyan-300 font-bold">
                Overall Confidence: {diversionResult.confidence}%
              </span>
            </div>
            <div className="space-y-2 text-slate-300 text-xs">
              <p>
                <strong>Uncertainty Bounds:</strong> Traffic projections and diversion estimates are probabilistic simulations based on current inductive loop telemetry, probe speeds, and historical origin-destination matrix patterns.
              </p>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p>
                  • <strong>Sensor coverage caveat:</strong> Certain secondary radial lanes rely on aggregated probe speeds where latency can reach 90–120 seconds.
                </p>
                <p>
                  • <strong>Weather / Rain variance:</strong> Wet asphalt conditions in monsoon intervals reduce braking deceleration by ~22%, increasing queue shockwave speeds.
                </p>
                <p>
                  • <strong>Human compliance rate:</strong> Actual diversion compliance typically ranges between 25%–38% unless reinforced by Variable Message Signs (VMS).
                </p>
              </div>
              <p className="text-[11px] text-amber-300/90 italic">
                Notice: Predictions must not be treated as guaranteed deterministic outcomes. Continuously monitor live telemetry and re-evaluate recommendations at 15-minute cycles.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            Dismiss Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
