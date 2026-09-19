import React from 'react';
import { AlternativeRouteEvaluation, RoadSegment } from '../types';
import { GitFork, X, CheckCircle2, AlertOctagon, Gauge, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface RouteInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: AlternativeRouteEvaluation | null;
  targetRoad: RoadSegment;
  onSelectRoadById?: (id: string) => void;
}

export const RouteInspectionModal: React.FC<RouteInspectionModalProps> = ({
  isOpen,
  onClose,
  route,
  targetRoad,
  onSelectRoadById,
}) => {
  if (!isOpen || !route) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Alternative Route Deep Inspection</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    route.isViable
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}
                >
                  {route.isViable ? 'Viable Bypass' : 'Unviable / Saturated'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Route: <strong className="text-slate-200">{route.name}</strong>
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

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                Capacity Used
              </span>
              <p className="text-base font-bold text-white font-mono">
                {route.currentCapacityUtilizedPercent}%
              </p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    route.currentCapacityUtilizedPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(route.currentCapacityUtilizedPercent, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                Available Headroom
              </span>
              <p className="text-base font-bold text-emerald-400 font-mono">
                {route.availableCapacityPcu}{' '}
                <span className="text-[10px] text-slate-400 font-normal">PCU/hr</span>
              </p>
              <span className="text-[10px] text-slate-400">Spare buffer</span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                Est. Travel Time
              </span>
              <p className="text-base font-bold text-cyan-400 font-mono">
                {route.estimatedTravelTimeMin} min
              </p>
              <span className="text-[10px] text-slate-400">vs {Math.round(targetRoad.queueLengthKm * 14)}m on main</span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                Spillback Risk
              </span>
              <p
                className={`text-base font-bold font-mono ${
                  route.spillbackRisk === 'Low'
                    ? 'text-emerald-400'
                    : route.spillbackRisk === 'Moderate'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {route.spillbackRisk}
              </p>
              <span className="text-[10px] text-slate-400">Secondary shockwave</span>
            </div>
          </div>

          {/* Current & Predicted Congestion Status */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Corridor States
              </span>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[11px] text-slate-400">Current: </span>
                  <span className="font-bold uppercase text-white font-mono">{route.currentCongestion}</span>
                </div>
                <span className="text-slate-600">→</span>
                <div>
                  <span className="text-[11px] text-slate-400">Post-Diversion: </span>
                  <span className="font-bold uppercase text-cyan-300 font-mono">{route.predictedCongestion}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Corridor Viability</span>
              <span
                className={`font-bold text-xs ${
                  route.isViable ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {route.isViable ? '✓ Cleared for Diversion' : '✗ Saturated / Reject'}
              </span>
            </div>
          </div>

          {/* Route Evaluation Reasoning */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Route Evaluation Analysis</span>
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              {route.isViable ? (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>
                      Corridor maintains {100 - route.currentCapacityUtilizedPercent}% available headroom, comfortably absorbing ~30% diverted volume (approx. 750 PCU/hr).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>
                      Spillback risk is Low; downstream signal progression on this radial bypass operates with 65s green window.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>
                      Estimated travel time is {route.estimatedTravelTimeMin} minutes, delivering an estimated 8-12 minute net advantage over queuing on {targetRoad.name}.
                    </span>
                  </li>
                </>
              ) : (
                <li className="flex items-start gap-2 text-rose-300">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>{route.rejectReason || 'Route is saturated; diversion would cause secondary gridlock.'}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Action button */}
          {onSelectRoadById && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  onSelectRoadById(route.roadId);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-colors"
              >
                <span>Inspect Corridor on Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Capacity calculated dynamically from inductive loop occupancy and green-ratio
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
