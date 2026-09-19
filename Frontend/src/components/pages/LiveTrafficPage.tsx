import React, { useState } from 'react';
import {
  RoadSegment,
  TrafficAlert,
  CongestionLevel,
  AppSection,
  DiversionEvaluationResult,
} from '../../types';
import { TrafficMap } from '../TrafficMap';
import {
  Activity,
  Gauge,
  TrendingUp,
  GitFork,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';

interface LiveTrafficPageProps {
  roads: RoadSegment[];
  selectedRoad: RoadSegment;
  onSelectRoad: (road: RoadSegment) => void;
  activeAlerts: TrafficAlert[];
  diversionResult: DiversionEvaluationResult;
  onNavigate: (section: AppSection) => void;
  onOpenWhyExplanation: () => void;
}

export const LiveTrafficPage: React.FC<LiveTrafficPageProps> = ({
  roads,
  selectedRoad,
  onSelectRoad,
  activeAlerts,
  diversionResult,
  onNavigate,
  onOpenWhyExplanation,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  const filteredRoads = roads.filter((r) => {
    if (filterLevel === 'ALL') return true;
    return r.congestionLevel.toUpperCase() === filterLevel;
  });

  const getStatusColor = (level: CongestionLevel) => {
    switch (level) {
      case 'normal':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
      case 'moderate':
        return 'text-amber-400 bg-amber-950/80 border-amber-800';
      case 'heavy':
        return 'text-orange-400 bg-orange-950/80 border-orange-800';
      case 'severe':
        return 'text-rose-400 bg-rose-950/80 border-rose-800';
    }
  };

  const utilizationPercent = Math.round(
    (selectedRoad.trafficVolume / selectedRoad.roadCapacity) * 100
  );

  // Dynamic trend computation
  const isWorsening =
    selectedRoad.congestionLevel === 'severe' ||
    selectedRoad.congestionLevel === 'heavy' ||
    utilizationPercent > 80;

  return (
    <div className="space-y-4">
      {/* Top Controls & Filter Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60 text-xs font-bold">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Telemetry Status: Real-Time Stream</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Showing {filteredRoads.length} of {roads.length} monitored segments
          </span>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 flex items-center gap-1 mr-1 text-[11px]">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {['ALL', 'NORMAL', 'MODERATE', 'HEAVY', 'SEVERE'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterLevel === lvl
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Large Map (7 cols) + Dedicated Road Details & Segment List (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Large Interactive Map */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl h-[530px] flex flex-col">
            <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>Geospatial Corridor Monitor</span>
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate
                </span>
                <span className="flex items-center gap-1 text-orange-400">
                  <span className="w-2 h-2 rounded-full bg-orange-500" /> Heavy
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> Severe
                </span>
              </div>
            </div>

            <div className="flex-1 relative">
              <TrafficMap
                roads={filteredRoads}
                selectedRoad={selectedRoad}
                onSelectRoad={onSelectRoad}
                activeAlerts={activeAlerts}
                diversionResult={diversionResult}
                onNavigate={onNavigate}
              />
            </div>
          </div>

          {/* Quick Road Segments Browser Grid */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Corridor Segments Directory
              </h4>
              <span className="text-[11px] text-slate-400">Click any card to inspect telemetry</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredRoads.map((road) => {
                const isSelected = road.id === selectedRoad.id;
                const util = Math.round((road.trafficVolume / road.roadCapacity) * 100);

                return (
                  <button
                    key={road.id}
                    onClick={() => onSelectRoad(road)}
                    className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-400 shadow-md text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold truncate text-xs">{road.name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border shrink-0 ${getStatusColor(
                          road.congestionLevel
                        )}`}
                      >
                        {road.congestionLevel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                      <span>
                        Speed: <strong className="text-white">{road.currentSpeed} km/h</strong>
                      </span>
                      <span>
                        Load: <strong className="text-cyan-400">{util}%</strong>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT (5 cols): DEDICATED ROAD DETAILS PANEL */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between flex-1">
            <div className="space-y-4">
              {/* Header */}
              <div className="border-b border-slate-800 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                    Selected Road Segment Profile
                  </span>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {selectedRoad.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedRoad.corridor}</p>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase border shrink-0 ${getStatusColor(
                    selectedRoad.congestionLevel
                  )}`}
                >
                  {selectedRoad.congestionLevel}
                </span>
              </div>

              {/* Crucial Telemetry Metrics Required by Prompt */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Current Speed */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                    Current Speed
                  </span>
                  <p className="text-xl font-bold text-white font-mono">
                    {selectedRoad.currentSpeed}{' '}
                    <span className="text-xs text-slate-400 font-normal">km/h</span>
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Free flow: {selectedRoad.freeFlowSpeed} km/h
                  </span>
                </div>

                {/* Traffic Volume */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                    Traffic Volume
                  </span>
                  <p className="text-xl font-bold text-cyan-400 font-mono">
                    {selectedRoad.trafficVolume.toLocaleString()}{' '}
                    <span className="text-xs text-slate-400 font-normal">PCU/h</span>
                  </p>
                  <span className="text-[10px] text-slate-400">Flow measurement</span>
                </div>

                {/* Road Capacity */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                    Capacity
                  </span>
                  <p className="text-xl font-bold text-slate-200 font-mono">
                    {selectedRoad.roadCapacity.toLocaleString()}{' '}
                    <span className="text-xs text-slate-400 font-normal">PCU/h</span>
                  </p>
                  <span className="text-[10px] text-slate-400">Geometric threshold</span>
                </div>

                {/* Utilization */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                    Utilization
                  </span>
                  <p
                    className={`text-xl font-bold font-mono ${
                      utilizationPercent > 85
                        ? 'text-rose-400'
                        : utilizationPercent > 70
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {utilizationPercent}%
                  </p>
                  <span className="text-[10px] text-slate-400">V/C capacity ratio</span>
                </div>
              </div>

              {/* Status & Trend */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Traffic Trend
                  </span>
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    {isWorsening ? (
                      <span className="text-rose-400">Worsening ↑ (Queue building)</span>
                    ) : (
                      <span className="text-emerald-400">Stable → (Within tolerance)</span>
                    )}
                  </p>
                </div>

                <button
                  onClick={onOpenWhyExplanation}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why is this road {selectedRoad.congestionLevel}?</span>
                </button>
              </div>

              {/* Queue Length & Junction Connectivity */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Backward Queue Shockwave:</span>
                  <strong className="font-mono text-white">{selectedRoad.queueLengthKm} km</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">From Junction:</span>
                  <span className="text-slate-200">{selectedRoad.fromJunction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">To Junction:</span>
                  <span className="text-slate-200">{selectedRoad.toJunction}</span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS (MANDATORY FROM PROMPT):
                [View Forecast]
                [Check Diversion]
                [View Alerts]
            */}
            <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Operational Action Hand-off
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => onNavigate('FORECAST')}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>View Forecast</span>
                </button>

                <button
                  onClick={() => onNavigate('RECOMMENDATIONS')}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Check Diversion</span>
                </button>

                <button
                  onClick={() => onNavigate('INCIDENTS')}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>View Alerts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
