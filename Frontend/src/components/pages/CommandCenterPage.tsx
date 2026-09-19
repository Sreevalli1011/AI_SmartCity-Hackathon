import React from 'react';
import {
  RoadSegment,
  TrafficAlert,
  TrafficKpis,
  DiversionEvaluationResult,
  ForecastResult,
  AppSection,
} from '../../types';
import { TrafficMap } from '../TrafficMap';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  GitFork,
  Layers,
  FlaskConical,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Gauge,
  Sparkles,
} from 'lucide-react';

interface CommandCenterPageProps {
  roads: RoadSegment[];
  selectedRoad: RoadSegment;
  onSelectRoad: (road: RoadSegment) => void;
  activeAlerts: TrafficAlert[];
  kpis: TrafficKpis;
  forecast: ForecastResult;
  diversionResult: DiversionEvaluationResult;
  onNavigate: (section: AppSection) => void;
}

export const CommandCenterPage: React.FC<CommandCenterPageProps> = ({
  roads,
  selectedRoad,
  onSelectRoad,
  activeAlerts,
  kpis,
  forecast,
  diversionResult,
  onNavigate,
}) => {
  const isSevere = selectedRoad.congestionLevel === 'severe';
  const isHeavy = selectedRoad.congestionLevel === 'heavy';
  const isDiversionFeasible = diversionResult.decision === 'DIVERSION_FEASIBLE';

  return (
    <div className="space-y-4">
      {/* 1. TOP KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Monitored Roads */}
        <div
          onClick={() => onNavigate('LIVE_TRAFFIC')}
          className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-3.5 rounded-xl cursor-pointer transition-all hover:bg-slate-800/80 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Monitored Roads</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-white">{kpis.totalMonitoredRoads}</span>
            <span className="text-[10px] text-cyan-400 font-semibold group-hover:underline flex items-center gap-0.5">
              View <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Hyderabad Corridors</span>
        </div>

        {/* Congested Roads */}
        <div
          onClick={() => onNavigate('LIVE_TRAFFIC')}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-3.5 rounded-xl cursor-pointer transition-all hover:bg-slate-800/80 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Congested Roads</span>
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-amber-400">{kpis.congestedRoadsCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {Math.round((kpis.congestedRoadsCount / kpis.totalMonitoredRoads) * 100)}% grid
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Heavy volume corridors</span>
        </div>

        {/* Severe Roads */}
        <div
          onClick={() => onNavigate('LIVE_TRAFFIC')}
          className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 p-3.5 rounded-xl cursor-pointer transition-all hover:bg-slate-800/80 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Severe Roads</span>
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-rose-400">{kpis.severeRoadsCount}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-900">
              Critical
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Requires intervention</span>
        </div>

        {/* Active Alerts */}
        <div
          onClick={() => onNavigate('INCIDENTS')}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-3.5 rounded-xl cursor-pointer transition-all hover:bg-slate-800/80 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Alerts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-amber-300">{kpis.activeAlertsCount}</span>
            <span className="text-[10px] text-amber-400 font-semibold group-hover:underline flex items-center gap-0.5">
              Inspect <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Abnormal patterns</span>
        </div>

        {/* Average Speed */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Average Speed</span>
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-cyan-400">{kpis.networkAverageSpeedKmH}</span>
            <span className="text-xs font-mono text-slate-400">km/h</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Corridor fleet pace</span>
        </div>

        {/* Network Load */}
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Network Load</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-blue-400">
              {kpis.networkCapacityUtilizationPercent}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">of capacity</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                kpis.networkCapacityUtilizationPercent > 80 ? 'bg-rose-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(kpis.networkCapacityUtilizationPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. MAIN AREA: LEFT MAP, RIGHT AI SITUATION SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT (7 cols): Interactive Hyderabad Traffic Map */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[510px]">
            <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Hyderabad Geospatial Traffic Matrix
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Selected: <strong className="text-cyan-300">{selectedRoad.name}</strong>
              </span>
            </div>

            <div className="flex-1 relative">
              <TrafficMap
                roads={roads}
                selectedRoad={selectedRoad}
                onSelectRoad={onSelectRoad}
                activeAlerts={activeAlerts}
                diversionResult={diversionResult}
                onNavigate={onNavigate}
              />
            </div>
          </div>
        </div>

        {/* RIGHT (5 cols): AI Situation Summary */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between flex-1">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Situation Summary</h3>
                    <p className="text-[11px] text-slate-400">Real-time situational intelligence engine</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Confidence: {diversionResult.confidence}%
                </span>
              </div>

              {/* CURRENT SITUATION */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Current Situation
                </span>
                <p className="text-xs font-bold text-white leading-relaxed">
                  {isSevere ? (
                    <span className="text-rose-400">
                      Severe congestion detected on {selectedRoad.name}.
                    </span>
                  ) : isHeavy ? (
                    <span className="text-orange-400">
                      Heavy traffic accumulation on {selectedRoad.name}.
                    </span>
                  ) : (
                    <span className="text-slate-200">
                      Moderate / manageable traffic volume on {selectedRoad.name}.
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                  <span>Current Speed: <strong className="text-white">{selectedRoad.currentSpeed} km/h</strong></span>
                  <span>•</span>
                  <span>Volume: <strong className="text-white">{selectedRoad.trafficVolume.toLocaleString()}</strong> PCU/h</span>
                </div>
              </div>

              {/* FORECAST */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Predictive Forecast (+30m)
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                    {forecast.horizons[1]?.confidence || 84}% confidence
                  </span>
                </div>
                <p className="text-xs text-amber-300 font-medium leading-relaxed">
                  {isSevere || isHeavy
                    ? 'Congestion expected to worsen within 30 minutes. Queue propagation accelerating.'
                    : 'Corridor velocity projected to remain within nominal operational threshold.'}
                </p>
              </div>

              {/* DIVERSION STATUS & RECOMMENDED RESPONSE */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Diversion Status
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                      isDiversionFeasible
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border-rose-800'
                    }`}
                  >
                    {isDiversionFeasible ? 'Feasible' : 'Not Recommended'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Recommended Response
                  </span>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    {diversionResult.primaryRecommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Button to Workflow */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Evaluator Workflow Entry:</span>
              <button
                onClick={() => onNavigate('LIVE_TRAFFIC')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 transition-all"
              >
                <span>Inspect Live Corridor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CLICKABLE FEATURE CARDS BELOW */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Dedicated Command Center Feature Modules
          </h4>
          <span className="text-xs text-slate-400">Click any card to open dedicated module view</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* 1. View Live Traffic */}
          <div
            onClick={() => onNavigate('LIVE_TRAFFIC')}
            className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500 p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-800/90 group shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60 mb-2.5 group-hover:scale-110 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                Live Traffic
              </h5>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                What is happening right now? Real-time velocities, volume & capacity.
              </p>
            </div>
            <button className="mt-3 flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:underline">
              <span>View Live Traffic</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 2. View Forecast */}
          <div
            onClick={() => onNavigate('FORECAST')}
            className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500 p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-800/90 group shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60 mb-2.5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                Traffic Forecast
              </h5>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                What will happen in +15 to +60 minutes? Predictive speed decay & factors.
              </p>
            </div>
            <button className="mt-3 flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:underline">
              <span>View Forecast</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 3. View Incidents */}
          <div
            onClick={() => onNavigate('INCIDENTS')}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500 p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-800/90 group shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-amber-950 text-amber-400 border border-amber-800/60 mb-2.5 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                Incidents & Alerts
              </h5>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Is something unusual happening? Abnormal patterns without false claims.
              </p>
            </div>
            <button className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:underline">
              <span>View Incidents</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 4. View Recommendations */}
          <div
            onClick={() => onNavigate('RECOMMENDATIONS')}
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500 p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-800/90 group shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/60 mb-2.5 group-hover:scale-110 transition-transform">
                <GitFork className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                Recommendations
              </h5>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                What should operator consider? Feasibility checks & simulated impact.
              </p>
            </div>
            <button className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:underline">
              <span>View Recommendations</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 5. View Bottlenecks */}
          <div
            onClick={() => onNavigate('BOTTLENECKS')}
            className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500 p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-800/90 group shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/60 mb-2.5 group-hover:scale-110 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                Bottlenecks Hub
              </h5>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Temporary or recurring? Long-term civil & operational planning.
              </p>
            </div>
            <button className="mt-3 flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:underline">
              <span>View Bottlenecks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 6. Run Simulation */}
          <div
            onClick={() => onNavigate('SIMULATION')}
            className="bg-slate-900/90 border border-slate-800 hover:border-purple-500 p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-800/90 group shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="p-2 w-fit rounded-lg bg-purple-950 text-purple-400 border border-purple-800/60 mb-2.5 group-hover:scale-110 transition-transform">
                <FlaskConical className="w-4 h-4" />
              </div>
              <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                Simulation Sandbox
              </h5>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Hackathon sandbox: Surge, incidents, no-diversion tests, and event logs.
              </p>
            </div>
            <button className="mt-3 flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:underline">
              <span>Run Simulation</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
