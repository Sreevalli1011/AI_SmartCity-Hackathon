import React, { useState } from 'react';
import { AppSection, RoadSegment } from '../../types';
import {
  XCircle,
  ShieldAlert,
  Sliders,
  Radio,
  ArrowRight,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  Gauge,
  Sparkles,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface NoDiversionPageProps {
  roads: RoadSegment[];
  onNavigate: (section: AppSection) => void;
  onSelectRoadById: (roadId: string) => void;
}

export const NoDiversionPage: React.FC<NoDiversionPageProps> = ({
  roads,
  onNavigate,
  onSelectRoadById,
}) => {
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(false);
  const [simulationExecuted, setSimulationExecuted] = useState<boolean>(false);
  const [selectedResponseId, setSelectedResponseId] = useState<string>('resp-1');

  // Specific Cyber Towers corridor demo context
  const primaryRoad = roads.find((r) => r.id === 'cyber-towers') || roads[0];

  const handleRunSimulation = () => {
    setIsSimulationRunning(true);
    setTimeout(() => {
      setIsSimulationRunning(false);
      setSimulationExecuted(true);
    }, 1200);
  };

  const handleResetSimulation = () => {
    setSimulationExecuted(false);
    setIsSimulationRunning(false);
  };

  const operationalResponses = [
    {
      id: 'resp-1',
      title: 'Simulate Signal Timing Adjustment at Junction Throat',
      category: 'SIGNAL_TIMING',
      reason:
        'Alternative detours are saturated (91% & 94%). Reallocating +14s green window to the inbound arterial relieves queue pressure without dumping traffic into gridlocked bypasses.',
      simulatedImpact:
        'Congestion duration -12%, clearance rate +26%, queue reduced by 0.5 km, bottleneck delay reduced by 5.2 min.',
      confidence: 84,
      parameters: 'Phase 2: +14s Green (Transferred 7s from side arms)',
      targetJunction: 'Cyber Towers Junction Core',
    },
    {
      id: 'resp-2',
      title: 'Simulate Upstream Traffic-Flow Metering & Restriction',
      category: 'UPSTREAM_METERING',
      reason:
        'Prevents backward shockwave from locking the upstream roundabout. Throttling incoming vehicle packets by 15% maintains non-zero crawl speed.',
      simulatedImpact:
        'Prevents total junction gridlock; preserves minimum corridor velocity above 16 km/h.',
      confidence: 82,
      parameters: 'Virtual Metering Cycle: 12s red pause on feeder approaches',
      targetJunction: 'HITEC City Metro Roundabout',
    },
    {
      id: 'resp-3',
      title: 'Corridor Priority & Transit Lane Containment',
      category: 'CORRIDOR_PRIORITY',
      reason:
        'Ensures high-occupancy buses and emergency vehicles maintain corridor throughput while mixed traffic is safely queued.',
      simulatedImpact:
        'Protects public transit schedule integrity; prevents pedestrian crowd crush at station stops.',
      confidence: 80,
      parameters: 'Dedicated Lane Clearance: Real-time advisory alert',
      targetJunction: 'Madhapur Metro Corridor',
    },
    {
      id: 'resp-4',
      title: 'Monitor Congestion Spillback & Re-evaluate Network',
      category: 'SPILLBACK_CONTAINMENT',
      reason:
        'Continuous automated monitoring to prevent cascading failure onto residential and secondary connector roads.',
      simulatedImpact:
        'Guarantees automated recalculation in 15 minutes as morning peak-demand wave begins to subside.',
      confidence: 88,
      parameters: 'Telemetry Interval: Automated 15-minute scheduled re-run',
      targetJunction: 'All Surrounding Nodes',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-950 text-rose-400 border border-rose-800/60">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                No-Diversion Response & Tactical Operational Containment
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                Decision: ❌ DIVERSION NOT RECOMMENDED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Protocol for saturated urban networks: Alternative routes lack capacity; diversion would trigger secondary gridlock.
            </p>
          </div>
        </div>

        {/* Mandatory Advisory Badge */}
        <div className="text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>ADVISORY / SIMULATION ONLY • Non-Control Supervisory Decision</span>
        </div>
      </div>

      {/* Saturated Network Context Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Network Saturation Reality: Why Can Traffic Not Be Diverted?
            </h4>
          </div>
          <span className="text-xs text-rose-400 font-mono font-bold">
            Secondary Corridors Saturated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Target Congested Corridor */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-rose-900/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">{primaryRoad.name}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                Primary
              </span>
            </div>
            <div className="text-xs text-slate-400 space-y-1 pt-1 font-mono">
              <div className="flex justify-between">
                <span>Congestion:</span>
                <span className="text-rose-400 font-bold uppercase">SEVERE</span>
              </div>
              <div className="flex justify-between">
                <span>Current Speed:</span>
                <span className="text-white font-bold">{primaryRoad.currentSpeed} km/h</span>
              </div>
              <div className="flex justify-between">
                <span>Capacity Utilized:</span>
                <span className="text-rose-400 font-bold">92%</span>
              </div>
              <div className="flex justify-between">
                <span>Queue:</span>
                <span className="text-rose-400 font-bold">{primaryRoad.queueLengthKm} km</span>
              </div>
            </div>
          </div>

          {/* Alternative Route B (Saturated) */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Alternative Route B (Mindspace Bypass)</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                Detour 1
              </span>
            </div>
            <div className="text-xs text-slate-400 space-y-1 pt-1 font-mono">
              <div className="flex justify-between">
                <span>Congestion:</span>
                <span className="text-orange-400 font-bold">HEAVY</span>
              </div>
              <div className="flex justify-between">
                <span>Capacity Utilized:</span>
                <strong className="text-rose-400">91% (Saturated)</strong>
              </div>
              <div className="flex justify-between">
                <span>Spare Headroom:</span>
                <span className="text-slate-400">180 PCU/h (Insufficient)</span>
              </div>
              <div className="flex justify-between">
                <span>Spillback Risk:</span>
                <span className="text-rose-400 font-bold">CRITICAL HIGH</span>
              </div>
            </div>
          </div>

          {/* Alternative Route C (Saturated) */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Alternative Route C (Inorbit Ring Link)</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                Detour 2
              </span>
            </div>
            <div className="text-xs text-slate-400 space-y-1 pt-1 font-mono">
              <div className="flex justify-between">
                <span>Congestion:</span>
                <span className="text-orange-400 font-bold">HEAVY</span>
              </div>
              <div className="flex justify-between">
                <span>Capacity Utilized:</span>
                <strong className="text-rose-400">94% (Saturated)</strong>
              </div>
              <div className="flex justify-between">
                <span>Spare Headroom:</span>
                <span className="text-slate-400">120 PCU/h (Insufficient)</span>
              </div>
              <div className="flex justify-between">
                <span>Spillback Risk:</span>
                <span className="text-rose-400 font-bold">CRITICAL HIGH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Causal Conclusion */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-start gap-2.5 text-xs">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-slate-300 leading-relaxed">
            <strong className="text-white">AI Reason: </strong>
            "Alternative routes have insufficient spare capacity. Diverting traffic may shift congestion rather than reduce it, risking cascading gridlock across the entire IT corridor."
          </p>
        </div>
      </div>

      {/* Alternative Operational Simulated Responses (Prompt requirement: 4 specific tactics) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (7 cols): Tactical Options Selector */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Alternative Simulated Tactical Responses (Internal Management)</span>
            </h4>
            <span className="text-xs text-slate-400">Select tactic to inspect</span>
          </div>

          <div className="space-y-2.5">
            {operationalResponses.map((tactic, idx) => {
              const isSelected = selectedResponseId === tactic.id;

              return (
                <div
                  key={tactic.id}
                  onClick={() => setSelectedResponseId(tactic.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-400 shadow-md text-white'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-[11px]">
                          {idx + 1}
                        </span>
                        <h5 className="font-bold text-sm text-white">{tactic.title}</h5>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                        Conf: {tactic.confidence}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pl-7 mt-1">
                      {tactic.reason}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 pl-7 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{tactic.simulatedImpact}</span>
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      Target: {tactic.targetJunction}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (5 cols): INTERACTIVE SIMULATION RUNNER (Prompt: [Run No-Diversion Simulation]) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Simulated Operational Execution</span>
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  simulationExecuted
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {simulationExecuted ? 'Simulation Active' : 'Ready to Simulate'}
              </span>
            </div>

            {/* Before vs Simulated After Comparison */}
            <div className="grid grid-cols-2 gap-3">
              {/* CURRENT UNMITIGATED */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Unmitigated
                </span>
                <div>
                  <span className="text-[10px] text-slate-400 block">Corridor Speed</span>
                  <p className="text-base font-bold font-mono text-white">
                    {primaryRoad.currentSpeed} km/h
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Queue Length</span>
                  <p className="text-sm font-bold font-mono text-rose-400">
                    {primaryRoad.queueLengthKm} km
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Junction Clearance</span>
                  <p className="text-sm font-bold font-mono text-slate-300">Baseline Rate</p>
                </div>
              </div>

              {/* SIMULATED OUTCOME */}
              <div
                className={`p-3.5 rounded-xl border transition-all space-y-2 text-xs ${
                  simulationExecuted
                    ? 'bg-emerald-950/20 border-emerald-500/70'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Simulated Outcome
                </span>
                <div>
                  <span className="text-[10px] text-slate-400 block">Corridor Speed</span>
                  <p className="text-base font-bold font-mono text-emerald-400">
                    {simulationExecuted ? '22 km/h (+57%)' : '-- km/h'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Queue Length</span>
                  <p className="text-sm font-bold font-mono text-emerald-400">
                    {simulationExecuted
                      ? `${Math.max(Number((primaryRoad.queueLengthKm - 0.5).toFixed(1)), 0.6)} km (-26%)`
                      : '-- km'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Junction Clearance</span>
                  <p className="text-sm font-bold font-mono text-emerald-400">
                    {simulationExecuted ? '+26% Discharge' : '--'}
                  </p>
                </div>
              </div>
            </div>

            {/* Simulation Feedback Message */}
            {simulationExecuted ? (
              <div className="bg-emerald-950/30 border border-emerald-800/80 p-3.5 rounded-xl text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Simulated Signal Timing & Upstream Throttling Applied</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Simulated cycle reallocation delivered +14s green time on the main inbound approach while virtual upstream metering stabilized approach queues. No secondary shockwave induced on neighboring detours.
                </p>
              </div>
            ) : (
              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-400">
                Click below to execute the internal signal-timing & metering simulation model without changing real-world field hardware.
              </div>
            )}
          </div>

          {/* SIMULATION ACTION BUTTON (Prompt requirement: [Run No-Diversion Simulation]) */}
          <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
            {!simulationExecuted ? (
              <button
                onClick={handleRunSimulation}
                disabled={isSimulationRunning}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                {isSimulationRunning ? (
                  <>
                    <Radio className="w-4 h-4 animate-spin" />
                    <span>Computing Micro-Simulation Flow...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run No-Diversion Simulation</span>
                  </>
                )}
              </button>
            ) : (
              <div className="w-full flex items-center gap-2">
                <button
                  onClick={handleResetSimulation}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Tactic</span>
                </button>
                <button
                  onClick={() => onNavigate('BOTTLENECKS')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-colors"
                >
                  <span>Check Bottlenecks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
