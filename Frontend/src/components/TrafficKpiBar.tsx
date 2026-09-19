import React from 'react';
import { TrafficKpis } from '../types';
import { Compass, AlertTriangle, Flame, CheckCircle2, Gauge, TrendingUp, AlertOctagon } from 'lucide-react';

interface TrafficKpiBarProps {
  kpis: TrafficKpis;
  selectedRoadName?: string;
}

export const TrafficKpiBar: React.FC<TrafficKpiBarProps> = ({ kpis, selectedRoadName }) => {
  return (
    <section className="bg-slate-900/70 border-b border-slate-800/80 px-4 py-2.5">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* Total Roads */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Monitored Roads</p>
            <p className="text-xl font-bold text-white font-mono mt-0.5">{kpis.totalMonitoredRoads}</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
            <Compass className="w-4 h-4" />
          </div>
        </div>

        {/* Normal Roads */}
        <div className="bg-slate-950/80 border border-emerald-950/60 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Normal Flow</p>
            <p className="text-xl font-bold text-emerald-300 font-mono mt-0.5">{kpis.normalRoadsCount}</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Congested Roads (Moderate + Heavy) */}
        <div className="bg-slate-950/80 border border-amber-950/60 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Congested Roads</p>
            <p className="text-xl font-bold text-amber-300 font-mono mt-0.5">
              {kpis.moderateRoadsCount + kpis.congestedRoadsCount}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-800/40">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* Severe Roads */}
        <div className="bg-slate-950/80 border border-rose-950/60 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Severe Gridlock</p>
            <p className="text-xl font-bold text-rose-400 font-mono mt-0.5 flex items-center gap-1.5">
              <span>{kpis.severeRoadsCount}</span>
              {kpis.severeRoadsCount > 0 && (
                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-300 animate-pulse">
                  CRITICAL
                </span>
              )}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-800/40">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-slate-950/80 border border-orange-950/60 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">Active Alerts</p>
            <p className="text-xl font-bold text-orange-400 font-mono mt-0.5 flex items-center gap-1">
              <span>{kpis.activeAlertsCount}</span>
              {kpis.activeAlertsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
              )}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-orange-950/40 text-orange-400 border border-orange-800/40">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>

        {/* Network Average Speed */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">Avg Corridor Speed</p>
            <p className="text-xl font-bold text-cyan-300 font-mono mt-0.5">
              {kpis.networkAverageSpeedKmH} <span className="text-xs font-normal text-slate-400">km/h</span>
            </p>
          </div>
          <div className="p-2 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-800/40">
            <Gauge className="w-4 h-4" />
          </div>
        </div>

        {/* Capacity Saturation Index */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">V/C Network Load</p>
            <p className="text-xl font-bold text-indigo-300 font-mono mt-0.5">
              {kpis.networkCapacityUtilizationPercent}%
            </p>
          </div>
          <div className="p-2 rounded-lg bg-indigo-950/40 text-indigo-400 border border-indigo-800/40">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>
    </section>
  );
};
