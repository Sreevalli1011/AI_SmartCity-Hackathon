import React from 'react';
import { TrafficAlert } from '../types';
import { AlertOctagon, ShieldAlert, Sparkles, CheckCircle, ChevronRight, Eye } from 'lucide-react';

interface AlertsPanelProps {
  alerts: TrafficAlert[];
  onSelectRoadById: (roadId: string) => void;
  selectedRoadId?: string;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onSelectRoadById,
  selectedRoadId,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-950/60 border border-orange-800/60 text-orange-400">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Active Anomaly & Incident Alerts</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-950 text-orange-400 border border-orange-800">
                {alerts.length} Detected
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Unusual speed collapse, sudden influx & historical deviations
            </p>
          </div>
        </div>

        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider bg-slate-950 px-2 py-1 rounded border border-slate-800">
          Supervisory Only
        </span>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-semibold text-slate-300">No Active Anomalies Detected</p>
            <p className="text-[11px] text-slate-400 mt-1">
              All monitored Hyderabad road corridors are operating within diurnal variance bounds.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isIncident = alert.type === 'POSSIBLE_INCIDENT';
            const isSelected = selectedRoadId === alert.roadId;

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border transition-all ${
                  isIncident
                    ? 'bg-rose-950/20 border-rose-800/60 hover:border-rose-600/80'
                    : 'bg-amber-950/20 border-amber-800/60 hover:border-amber-600/80'
                } ${isSelected ? 'ring-2 ring-cyan-400/80 bg-slate-900' : ''}`}
              >
                {/* Alert Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isIncident
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {alert.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Severity: <strong className="text-white capitalize">{alert.severity}</strong>
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1.5">{alert.roadName}</h4>
                  </div>

                  {/* Confidence Badge */}
                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded text-[11px]">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span className="text-slate-400 text-[10px]">Confidence:</span>
                      <strong className="text-cyan-300 font-mono">{alert.confidence}%</strong>
                    </div>
                  </div>
                </div>

                {/* What Changed? Block */}
                <div className="mt-2.5 bg-slate-950/70 border border-slate-800/70 rounded-lg p-2 text-xs">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    What Changed?
                  </p>
                  <p className="text-slate-200 text-[11px] mt-0.5 font-medium">{alert.whatChanged}</p>

                  <div className="grid grid-cols-3 gap-2 mt-2 pt-1.5 border-t border-slate-800/80 text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Current Speed</span>
                      <strong className="text-rose-400 font-mono">{alert.currentSpeed} km/h</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Expected Baseline</span>
                      <strong className="text-slate-300 font-mono">{alert.expectedSpeed} km/h</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Traffic Volume</span>
                      <strong className="text-amber-400 font-mono">+{alert.volumeChangePercent}%</strong>
                    </div>
                  </div>
                </div>

                {/* AI Assessment */}
                <div className="mt-2 text-[11px] text-slate-300">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    AI Assessment
                  </p>
                  <p className="italic text-slate-300 bg-slate-950/40 p-1.5 rounded border border-slate-800/60">
                    "{alert.aiAssessment}"
                  </p>
                </div>

                {/* Possible Explanations (Caveat: never declare accident unless verified) */}
                <div className="mt-2 text-[11px]">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Possible Physical Explanations
                  </p>
                  <ul className="space-y-0.5 text-slate-300">
                    {alert.possibleExplanations.map((exp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-cyan-400">•</span>
                        <span>{exp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action button */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {isIncident
                      ? 'Camera/patrol verification recommended before dispatch'
                      : 'Monitored via road-speed inductive loop & GPS aggregates'}
                  </span>
                  <button
                    onClick={() => onSelectRoadById(alert.roadId)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/60 px-2 py-1 rounded transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Focus Corridor</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
