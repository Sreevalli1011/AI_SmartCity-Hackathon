import React from 'react';
import { ForecastResult, CongestionLevel } from '../types';
import { Clock, TrendingUp, HelpCircle, Sparkles, AlertTriangle, Flame, ShieldCheck } from 'lucide-react';

interface ForecastPanelProps {
  forecast: ForecastResult;
}

const CONGESTION_CONFIG: Record<
  CongestionLevel,
  { label: string; bg: string; text: string; border: string; barColor: string }
> = {
  normal: {
    label: 'Normal',
    bg: 'bg-emerald-950/50',
    text: 'text-emerald-400',
    border: 'border-emerald-800/60',
    barColor: 'bg-emerald-500',
  },
  moderate: {
    label: 'Moderate',
    bg: 'bg-amber-950/50',
    text: 'text-amber-400',
    border: 'border-amber-800/60',
    barColor: 'bg-amber-500',
  },
  heavy: {
    label: 'Heavy',
    bg: 'bg-orange-950/50',
    text: 'text-orange-400',
    border: 'border-orange-800/60',
    barColor: 'bg-orange-500',
  },
  severe: {
    label: 'Severe',
    bg: 'bg-rose-950/50',
    text: 'text-rose-400',
    border: 'border-rose-800/60',
    barColor: 'bg-rose-500',
  },
};

export const ForecastPanel: React.FC<ForecastPanelProps> = ({ forecast }) => {
  const currentConfig = CONGESTION_CONFIG[forecast.currentStatus];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>15–60 Minute Predictive Forecast</span>
              <span className="text-[10px] font-semibold text-slate-400">
                Interpretable ML Model
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Corridor: <strong className="text-slate-200">{forecast.roadName}</strong>
            </p>
          </div>
        </div>

        {/* Current status baseline pill */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
          <span className="text-slate-400 text-[11px]">Current:</span>
          <span className={`font-bold capitalize ${currentConfig.text}`}>{forecast.currentStatus}</span>
        </div>
      </div>

      {/* Forecast Horizons Grid: CURRENT, +15 min, +30 min, +45 min, +60 min */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {forecast.horizons.map((horizon) => {
          const config = CONGESTION_CONFIG[horizon.predictedCongestion];

          return (
            <div
              key={horizon.minutesAhead}
              className={`p-3 rounded-xl border ${config.bg} ${config.border} flex flex-col justify-between transition-all hover:bg-opacity-70`}
            >
              <div>
                {/* Horizon Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <span>+{horizon.minutesAhead} min</span>
                    <span className="text-[10px] font-normal text-slate-400">Forecast</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${config.text} bg-slate-950/70 border border-slate-800`}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Speed & Volume Prediction */}
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Speed</span>
                    <strong className="text-white font-mono text-sm">{horizon.expectedSpeed} km/h</strong>
                  </div>
                  <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block">Volume</span>
                    <strong className="text-white font-mono text-sm">
                      {horizon.expectedVolume.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                      Confidence
                    </span>
                    <span className="font-mono text-cyan-300 font-semibold">{horizon.confidence}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{ width: `${horizon.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Main Factor Tag */}
              <div className="mt-2 pt-2 border-t border-slate-800/70 text-[10px] text-slate-300">
                <span className="text-slate-400 font-semibold block text-[9px] uppercase">Primary Vector:</span>
                <p className="line-clamp-2 mt-0.5 text-slate-300">{horizon.mainFactors[0]}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* WHY WILL CONGESTION INCREASE / REMAIN STABLE? */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Why? Prediction Explanation Factors
          </h4>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {forecast.whyExplanation.summary}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80">
          {forecast.whyExplanation.bulletFactors.map((factor, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
              <span className="text-cyan-400 mt-0.5">▪</span>
              <span>{factor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
