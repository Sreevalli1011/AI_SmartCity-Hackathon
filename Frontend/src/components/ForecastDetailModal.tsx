import React from 'react';
import { RoadSegment, ForecastHorizon, AppSection } from '../types';
import { TrendingUp, X, Clock, AlertTriangle, ShieldCheck, ArrowRight, Gauge, Activity } from 'lucide-react';

interface ForecastDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  road: RoadSegment;
  horizon: ForecastHorizon | null;
  onNavigateToRecommendations: () => void;
}

export const ForecastDetailModal: React.FC<ForecastDetailModalProps> = ({
  isOpen,
  onClose,
  road,
  horizon,
  onNavigateToRecommendations,
}) => {
  if (!isOpen || !horizon) return null;

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'normal':
        return 'text-emerald-400 bg-emerald-950 border-emerald-800';
      case 'moderate':
        return 'text-amber-400 bg-amber-950 border-amber-800';
      case 'heavy':
        return 'text-orange-400 bg-orange-950 border-orange-800';
      case 'severe':
        return 'text-rose-400 bg-rose-950 border-rose-800';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  +{horizon.minutesAhead}-Minute Forecast In-Depth Profile
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Confidence: {horizon.confidence}%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Target Corridor: <strong className="text-slate-200">{road.name}</strong>
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
          {/* Current State vs Predicted State */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Current State (Now)
              </span>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${getStatusColor(road.congestionLevel)}`}>
                  {road.congestionLevel}
                </span>
                <span className="text-base font-bold text-white font-mono">{road.currentSpeed} km/h</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Volume: <strong className="text-slate-200">{road.trafficVolume.toLocaleString()}</strong> PCU/hr (
                {Math.round((road.trafficVolume / road.roadCapacity) * 100)}% cap)
              </p>
            </div>

            <div className="border-l border-slate-800 pl-3">
              <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">
                Predicted State (+{horizon.minutesAhead} Min)
              </span>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${getStatusColor(horizon.predictedCongestion)}`}>
                  {horizon.predictedCongestion}
                </span>
                <span className="text-base font-bold text-cyan-300 font-mono">{horizon.expectedSpeed} km/h</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Volume: <strong className="text-slate-200">{horizon.expectedVolume.toLocaleString()}</strong> PCU/hr (
                {Math.round((horizon.expectedVolume / road.roadCapacity) * 100)}% cap)
              </p>
            </div>
          </div>

          {/* Contributing Predictive Factors */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Why Is Traffic Predicted to Evolve This Way?</span>
            </h4>
            <div className="space-y-1.5">
              {horizon.mainFactors.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Potential Impact */}
          <div className="bg-rose-950/20 border border-rose-900/60 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Potential Operational Impact If Unmitigated</span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Without intervention, queue shockwaves will likely propagate upstream by ~
              {((road.queueLengthKm + (horizon.minutesAhead / 60) * 0.8)).toFixed(1)} km,
              increasing cumulative vehicle delay by approximately {Math.round(horizon.minutesAhead * 1.4)} minutes across intersecting tributary approaches.
            </p>
          </div>

          {/* Suggested Response */}
          <div className="bg-emerald-950/20 border border-emerald-900/60 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Suggested Response Strategy</span>
            </h4>
            <p className="text-slate-300 leading-relaxed mb-3">
              Evaluate alternative route capacity for potential simulated diversion, or prepare upstream metering cycles if alternate paths are nearing capacity.
            </p>
            <button
              onClick={() => {
                onClose();
                onNavigateToRecommendations();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all"
            >
              <span>Check Available Responses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Predictions generated via multivariate speed-density regression & loop telemetry
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
