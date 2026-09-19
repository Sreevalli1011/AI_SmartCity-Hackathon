import React, { useState } from 'react';
import { ScenarioPreset, AppSection, SimulationLogEntry } from '../../types';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Zap,
  AlertTriangle,
  GitFork,
  XCircle,
  Layers,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ListFilter,
  Sparkles,
  Terminal,
} from 'lucide-react';

interface SimulationPageProps {
  currentScenario: ScenarioPreset;
  onSelectScenario: (scenario: ScenarioPreset) => void;
  onResetBaseline: () => void;
  eventLogs: SimulationLogEntry[];
  onNavigate: (section: AppSection) => void;
  onClearLogs: () => void;
}

export const SimulationPage: React.FC<SimulationPageProps> = ({
  currentScenario,
  onSelectScenario,
  onResetBaseline,
  eventLogs,
  onNavigate,
  onClearLogs,
}) => {
  const [activeStoryStep, setActiveStoryStep] = useState<number>(1);

  const scenarioButtons = [
    {
      id: 'TRAFFIC_SURGE' as ScenarioPreset,
      label: 'Run Traffic Surge',
      icon: Zap,
      badge: 'Demand Shock',
      color: 'hover:border-cyan-500 hover:bg-cyan-950/30',
      activeColor: 'bg-cyan-950/60 border-cyan-400 text-white',
      description: 'Injects sudden +45% traffic volume surge onto Financial District & Gachibowli corridors.',
      resultingPage: 'LIVE_TRAFFIC' as AppSection,
      resultingPageLabel: 'Inspect Live Traffic',
    },
    {
      id: 'INCIDENT_DETECTED' as ScenarioPreset,
      label: 'Simulate Incident',
      icon: AlertTriangle,
      badge: 'Anomaly',
      color: 'hover:border-amber-500 hover:bg-amber-950/30',
      activeColor: 'bg-amber-950/60 border-amber-400 text-white',
      description: 'Simulates abnormal speed plunge (-68%) on ISB Road with loop telemetry anomaly detection.',
      resultingPage: 'INCIDENTS' as AppSection,
      resultingPageLabel: 'Inspect Incidents',
    },
    {
      id: 'TEST_DIVERSION_FEASIBLE' as ScenarioPreset,
      label: 'Test Diversion – Feasible',
      icon: GitFork,
      badge: 'Viable Detour',
      color: 'hover:border-emerald-500 hover:bg-emerald-950/30',
      activeColor: 'bg-emerald-950/60 border-emerald-400 text-white',
      description: 'Tests situation where alternative route (Route B) has 38% available capacity and low spillback.',
      resultingPage: 'RECOMMENDATIONS' as AppSection,
      resultingPageLabel: 'Inspect Recommendations',
    },
    {
      id: 'TEST_NO_DIVERSION' as ScenarioPreset,
      label: 'Test No-Diversion Scenario',
      icon: XCircle,
      badge: 'Critical Saturated',
      color: 'hover:border-rose-500 hover:bg-rose-950/30',
      activeColor: 'bg-rose-950/60 border-rose-400 text-white',
      description: 'Tests saturated urban grid (all detours > 90% full). Demonstrates internal signal retiming instead of diversion.',
      resultingPage: 'NO_DIVERSION' as AppSection,
      resultingPageLabel: 'Inspect No-Diversion Page',
    },
    {
      id: 'RECURRING_BOTTLENECK' as ScenarioPreset,
      label: 'Show Recurring Bottleneck',
      icon: Layers,
      badge: 'Civil Planning',
      color: 'hover:border-indigo-500 hover:bg-indigo-950/30',
      activeColor: 'bg-indigo-950/60 border-indigo-400 text-white',
      description: 'Loads historical Cyber Towers & Punjagutta recurring chokepoint data and multi-year civil remedies.',
      resultingPage: 'BOTTLENECKS' as AppSection,
      resultingPageLabel: 'Inspect Bottlenecks',
    },
  ];

  // 3-Minute Hackathon Demo Storyline Walkthrough
  const evaluatorStorySteps = [
    {
      step: 1,
      title: 'Step 1: Baseline Network Health',
      actionPreset: 'BASELINE' as ScenarioPreset,
      targetPage: 'COMMAND_CENTER' as AppSection,
      narration: 'Observe the nominal state across 8 monitored Hyderabad arterials with balanced speeds.',
    },
    {
      step: 2,
      title: 'Step 2: Trigger Peak Hour Surge',
      actionPreset: 'TRAFFIC_SURGE' as ScenarioPreset,
      targetPage: 'LIVE_TRAFFIC' as AppSection,
      narration: 'Observe volume spike on Financial District; speed drops to crawl velocity and capacity exceeds 85%.',
    },
    {
      step: 3,
      title: 'Step 3: Forecast Horizon (+15–60 min)',
      actionPreset: 'TRAFFIC_SURGE' as ScenarioPreset,
      targetPage: 'FORECAST' as AppSection,
      narration: 'Observe predicted speed decay from 18 km/h down to 12 km/h at +30m with full factor decomposition.',
    },
    {
      step: 4,
      title: 'Step 4: Diversion Feasibility Check (YES)',
      actionPreset: 'TEST_DIVERSION_FEASIBLE' as ScenarioPreset,
      targetPage: 'RECOMMENDATIONS' as AppSection,
      narration: 'AI finds Route B has 38% headroom; recommends 30% diversion with +61% simulated speed recovery.',
    },
    {
      step: 5,
      title: 'Step 5: Saturated Alternate Detours (NO Diversion)',
      actionPreset: 'TEST_NO_DIVERSION' as ScenarioPreset,
      targetPage: 'NO_DIVERSION' as AppSection,
      narration: 'Bypasses are saturated (>90%). AI rejects diversion and advises +14s internal signal retiming instead.',
    },
    {
      step: 6,
      title: 'Step 6: Historical Bottleneck & Civil Solution',
      actionPreset: 'RECURRING_BOTTLENECK' as ScenarioPreset,
      targetPage: 'BOTTLENECKS' as AppSection,
      narration: 'Review 18/month chronic occurrence at Cyber Towers; evaluate grade-separated lane restructuring proposal.',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/60">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Hackathon Evaluation Sandbox & Scenario Controller
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                Active: {currentScenario}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive test harness for hackathon evaluators to simulate surges, anomalies, diversion feasibility, and no-diversion responses
            </p>
          </div>
        </div>

        {/* Reset Baseline Button */}
        <button
          onClick={onResetBaseline}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reset Baseline</span>
        </button>
      </div>

      {/* Main Area: Sandbox Presets & Evaluator Guided Story (7 cols) + Real-time Event Log (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (7 cols): Presets & Guided Story */}
        <div className="lg:col-span-7 space-y-4">
          {/* Preset Buttons Grid (Prompt: Run Traffic Surge, Simulate Incident, Test Diversion, Test No-Diversion, Show Bottleneck) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Simulation Preset Injection Triggers</span>
              </h4>
              <span className="text-[11px] text-slate-400">Updates network state immediately</span>
            </div>

            <div className="space-y-2.5">
              {scenarioButtons.map((btn) => {
                const Icon = btn.icon;
                const isActive = currentScenario === btn.id;

                return (
                  <div
                    key={btn.id}
                    className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                      isActive ? btn.activeColor : `bg-slate-950/70 border-slate-800 ${btn.color}`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 shrink-0">
                          <Icon className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-sm text-white">{btn.label}</h5>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                              {btn.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                            {btn.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={() => onSelectScenario(btn.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isActive ? 'Active Preset' : 'Activate Preset'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectScenario(btn.id);
                          onNavigate(btn.resultingPage);
                        }}
                        className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <span>{btn.resultingPageLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3-Minute Hackathon Demo Guided Storyline */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>3-Minute Evaluator Guided Workflow Walkthrough</span>
              </h4>
              <span className="text-[10px] font-mono text-cyan-300">Step {activeStoryStep} of 6</span>
            </div>

            <div className="space-y-2">
              {evaluatorStorySteps.map((s) => {
                const isCurrent = activeStoryStep === s.step;

                return (
                  <div
                    key={s.step}
                    onClick={() => {
                      setActiveStoryStep(s.step);
                      onSelectScenario(s.actionPreset);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-xs flex items-center justify-between ${
                      isCurrent
                        ? 'bg-slate-800 border-cyan-400 shadow-md text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCurrent
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {s.step}
                      </span>
                      <div>
                        <h6 className="font-bold text-xs text-white">{s.title}</h6>
                        <p className="text-[11px] text-slate-300 mt-0.5">{s.narration}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveStoryStep(s.step);
                        onSelectScenario(s.actionPreset);
                        onNavigate(s.targetPage);
                      }}
                      className="shrink-0 ml-3 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-600/80 hover:bg-cyan-500 text-white shadow-sm"
                    >
                      <span>Jump</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right (5 cols): INTERACTIVE DYNAMIC EVENT LOG (Mandatory from prompt) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between h-full space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Real-Time Engine Simulation Event Log
                </h4>
              </div>
              <button
                onClick={onClearLogs}
                className="text-[10px] text-slate-400 hover:text-white transition-colors"
              >
                Clear Log
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Tracking decision progression: Detection → Congestion Shift → Predictive Forecast → Diversion Feasibility → Operational Response.
            </p>

            {/* Scrollable Event Log Window */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs max-h-[580px] overflow-y-auto space-y-2.5 shadow-inner">
              {eventLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Awaiting simulation trigger events...
                </div>
              ) : (
                eventLogs.map((log) => {
                  const getTypeBadge = (type: string) => {
                    switch (type) {
                      case 'alert':
                        return 'text-rose-400 border-rose-900 bg-rose-950/40';
                      case 'warning':
                        return 'text-amber-400 border-amber-900 bg-amber-950/40';
                      case 'success':
                        return 'text-emerald-400 border-emerald-900 bg-emerald-950/40';
                      case 'action':
                        return 'text-cyan-400 border-cyan-900 bg-cyan-950/40';
                      default:
                        return 'text-slate-400 border-slate-800 bg-slate-900';
                    }
                  };

                  return (
                    <div
                      key={log.id}
                      className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-cyan-400 font-bold">{log.time} IST</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-bold ${getTypeBadge(
                            log.type
                          )}`}
                        >
                          {log.type}
                        </span>
                      </div>
                      <p className="text-white font-bold text-xs">{log.title}</p>
                      <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                        {log.detail}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Log entries generated via reactive event bus</span>
            <span className="text-cyan-400 font-mono font-bold">{eventLogs.length} events logged</span>
          </div>
        </div>
      </div>
    </div>
  );
};
