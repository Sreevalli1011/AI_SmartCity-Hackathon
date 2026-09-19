import React, { useState } from 'react';
import { TrafficAlert, RoadSegment, AppSection } from '../../types';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Gauge,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  HelpCircle,
  Activity,
  Search,
} from 'lucide-react';

interface IncidentsPageProps {
  alerts: TrafficAlert[];
  roads: RoadSegment[];
  onSelectRoadById: (roadId: string) => void;
  onNavigate: (section: AppSection) => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  alerts,
  roads,
  onSelectRoadById,
  onNavigate,
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string>(
    alerts.length > 0 ? alerts[0].id : ''
  );

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[0];
  const associatedRoad = selectedAlert
    ? roads.find((r) => r.id === selectedAlert.roadId)
    : null;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Abnormal Traffic Patterns & Incident Anomaly Detector
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                {alerts.length} Active System Alerts
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Correlating sudden speed drops with volume deviations without falsely assuming unverified physical crashes
            </p>
          </div>
        </div>

        <div className="text-xs text-amber-300 bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Non-accusatory causal classifier • Verified via multi-loop cross-correlation</span>
        </div>
      </div>

      {/* Main Split: Alerts List (5 cols) + Dedicated Incident Details Panel (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (5 cols): Active Alerts List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-bold uppercase tracking-wider">Active Anomalies Queue</span>
            <span>Click to inspect incident profile</span>
          </div>

          {alerts.length === 0 ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-white text-sm">No Active Abnormal Anomalies</p>
              <p className="text-xs">All monitored Hyderabad corridors are operating within statistical norms.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {alerts.map((alert) => {
                const isSelected = alert.id === selectedAlert?.id;
                const isSevere = alert.severity === 'high';

                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlertId(alert.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-amber-500 shadow-lg text-white'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSevere ? 'bg-rose-500 animate-ping' : 'bg-amber-400'
                            }`}
                          />
                          <span className="font-bold text-sm text-white">{alert.roadName}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            isSevere
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}
                        >
                          {alert.severity} priority
                        </span>
                      </div>

                      <p className="text-xs text-amber-200/90 font-medium line-clamp-2 mt-1">
                        {alert.aiAssessment}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Speed: <strong className="text-white">{alert.currentSpeed} km/h</strong> (vs {alert.expectedSpeed})</span>
                      <span className="text-cyan-400 font-bold">Conf: {alert.confidence}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right (7 cols): DEDICATED INCIDENT DETAILS PANEL (Mandatory from prompt) */}
        <div className="lg:col-span-7">
          {selectedAlert ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full space-y-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="border-b border-slate-800 pb-3 flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                      Incident Details & Evidence Matrix
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {selectedAlert.roadName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Corridor Junction: {associatedRoad?.corridor || 'Hyderabad Metro Link'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Time Detected</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {selectedAlert.timestamp} IST
                    </span>
                  </div>
                </div>

                {/* Key Telemetry Metrics Required: Current speed, Expected speed, Volume change, Severity, Confidence */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      Current Speed
                    </span>
                    <p className="text-xl font-bold text-rose-400 font-mono">
                      {selectedAlert.currentSpeed}{' '}
                      <span className="text-xs text-slate-400 font-normal">km/h</span>
                    </p>
                    <span className="text-[10px] text-rose-300/80">
                      -{Math.round(((selectedAlert.expectedSpeed - selectedAlert.currentSpeed) / selectedAlert.expectedSpeed) * 100)}% drop
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      Expected Speed
                    </span>
                    <p className="text-xl font-bold text-slate-200 font-mono">
                      {selectedAlert.expectedSpeed}{' '}
                      <span className="text-xs text-slate-400 font-normal">km/h</span>
                    </p>
                    <span className="text-[10px] text-slate-400">Baseline expectation</span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      Volume Deviation
                    </span>
                    <p className="text-xl font-bold text-amber-400 font-mono">
                      +{selectedAlert.volumeChangePercent}%
                    </p>
                    <span className="text-[10px] text-slate-400">Flow surge rate</span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      AI Confidence
                    </span>
                    <p className="text-xl font-bold text-cyan-400 font-mono">
                      {selectedAlert.confidence}%
                    </p>
                    <span className="text-[10px] text-slate-400">Model certainty</span>
                  </div>
                </div>

                {/* AI Assessment & Possible Cause */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      AI Diagnostic Assessment
                    </h4>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedAlert.aiAssessment}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Diagnosed Probable Cause:</span>
                    <strong className="text-amber-300 font-medium">
                      {selectedAlert.whatChanged}
                    </strong>
                  </div>
                </div>

                {/* Sensor Evidence List */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Telemetry Sensor Evidence & Hypotheses
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {selectedAlert.possibleExplanations.map((ev: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS (MANDATORY FROM PROMPT):
                  [View Location]
                  [View Forecast]
                  [Check Recommended Response]
              */}
              <div className="pt-4 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Next Operational Actions:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onSelectRoadById(selectedAlert.roadId);
                      onNavigate('LIVE_TRAFFIC');
                    }}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/40 transition-all"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>View Location</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectRoadById(selectedAlert.roadId);
                      onNavigate('FORECAST');
                    }}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>View Forecast</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectRoadById(selectedAlert.roadId);
                      onNavigate('RECOMMENDATIONS');
                    }}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Check Response</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              Select an alert to inspect incident details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
