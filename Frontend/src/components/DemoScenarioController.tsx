import React, { useState, useEffect } from 'react';
import { ScenarioPreset } from '../types';
import {
  Flame,
  AlertOctagon,
  GitFork,
  XCircle,
  Layers,
  RotateCcw,
  Sparkles,
  PlayCircle,
  ChevronRight,
  CheckCircle2,
  FastForward,
} from 'lucide-react';

interface DemoScenarioControllerProps {
  currentScenario: ScenarioPreset;
  onSelectScenario: (scenario: ScenarioPreset) => void;
  onOpenBottlenecks: () => void;
  walkthroughStep: number;
  onSetWalkthroughStep: (step: number) => void;
  isWalkthroughActive: boolean;
  onToggleWalkthrough: () => void;
}

export const DemoScenarioController: React.FC<DemoScenarioControllerProps> = ({
  currentScenario,
  onSelectScenario,
  onOpenBottlenecks,
  walkthroughStep,
  onSetWalkthroughStep,
  isWalkthroughActive,
  onToggleWalkthrough,
}) => {
  const steps = [
    {
      step: 1,
      title: 'Baseline Traffic',
      scenario: 'BASELINE' as ScenarioPreset,
      description: 'Observe moderate diurnal flow across Cyber Towers & Hyderabad corridors.',
    },
    {
      step: 2,
      title: 'Traffic Surge & Speed Collapse',
      scenario: 'TRAFFIC_SURGE' as ScenarioPreset,
      description: 'Volume spikes +38%, average speed plunges from 34 to 16 km/h.',
    },
    {
      step: 3,
      title: 'Abnormal Pattern / Incident Detection',
      scenario: 'INCIDENT_DETECTED' as ScenarioPreset,
      description: 'System detects anomalous speed drop and generates alert with confidence.',
    },
    {
      step: 4,
      title: 'Case A: Diversion Feasible',
      scenario: 'TEST_DIVERSION_FEASIBLE' as ScenarioPreset,
      description: 'Route B (Kondapur Bypass) has capacity -> DIVERSION FEASIBLE with +64% speed gain.',
    },
    {
      step: 5,
      title: 'Case B: Diversion NOT Recommended',
      scenario: 'TEST_NO_DIVERSION' as ScenarioPreset,
      description: 'All detours saturated (>88%) -> DIVERSION BLOCKED + Simulated Operational Advisory.',
    },
    {
      step: 6,
      title: 'Recurring Bottleneck & Long-Term Fix',
      scenario: 'RECURRING_BOTTLENECK' as ScenarioPreset,
      description: 'Historical pattern flags 24x/mo hotspot -> Long-term Grade Separation & Bus Bays.',
    },
  ];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 shadow-md flex flex-col gap-2">
      {/* Top Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-300" />
            <span>Hackathon Evaluation Sandbox</span>
          </div>
          <span className="text-xs text-slate-400 hidden lg:inline">
            Execute simulated stress scenarios on the Hyderabad grid:
          </span>
        </div>

        {/* 1-Click Guided Walkthrough Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleWalkthrough}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isWalkthroughActive
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>{isWalkthroughActive ? 'Exit Walkthrough' : 'Start Judge Walkthrough (1-Click)'}</span>
          </button>

          <button
            onClick={() => onSelectScenario('BASELINE')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:bg-slate-800 transition-colors"
            title="Reset system to nominal baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Preset Action Buttons (Requested in Prompt) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onSelectScenario('TRAFFIC_SURGE')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            currentScenario === 'TRAFFIC_SURGE'
              ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
              : 'bg-slate-950 text-amber-300 border-amber-800/60 hover:bg-amber-950/40'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Run Traffic Surge</span>
        </button>

        <button
          onClick={() => onSelectScenario('INCIDENT_DETECTED')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            currentScenario === 'INCIDENT_DETECTED'
              ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
              : 'bg-slate-950 text-rose-300 border-rose-800/60 hover:bg-rose-950/40'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          <span>Simulate Incident</span>
        </button>

        <button
          onClick={() => onSelectScenario('TEST_DIVERSION_FEASIBLE')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            currentScenario === 'TEST_DIVERSION_FEASIBLE'
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
              : 'bg-slate-950 text-emerald-300 border-emerald-800/60 hover:bg-emerald-950/40'
          }`}
        >
          <GitFork className="w-3.5 h-3.5 text-emerald-400" />
          <span>Test Diversion (Feasible)</span>
        </button>

        <button
          onClick={() => onSelectScenario('TEST_NO_DIVERSION')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            currentScenario === 'TEST_NO_DIVERSION'
              ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
              : 'bg-slate-950 text-rose-300 border-rose-800/60 hover:bg-rose-950/40'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Test No-Diversion Scenario</span>
        </button>

        <button
          onClick={() => {
            onSelectScenario('RECURRING_BOTTLENECK');
            onOpenBottlenecks();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            currentScenario === 'RECURRING_BOTTLENECK'
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
              : 'bg-slate-950 text-indigo-300 border-indigo-800/60 hover:bg-indigo-950/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Show Recurring Bottleneck</span>
        </button>
      </div>

      {/* Guided Walkthrough Step Carousel / Stepper when Walkthrough is Active */}
      {isWalkthroughActive && (
        <div className="bg-slate-950/90 border border-cyan-800/60 rounded-xl p-3 mt-1 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Judge Storyline: Step {walkthroughStep} of {steps.length}</span>
              <span className="text-slate-400 font-normal">({steps[walkthroughStep - 1].title})</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={walkthroughStep <= 1}
                onClick={() => {
                  const prev = walkthroughStep - 1;
                  onSetWalkthroughStep(prev);
                  onSelectScenario(steps[prev - 1].scenario);
                }}
                className="px-2 py-0.5 rounded text-[11px] text-slate-300 bg-slate-900 border border-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={walkthroughStep >= steps.length}
                onClick={() => {
                  const next = walkthroughStep + 1;
                  onSetWalkthroughStep(next);
                  onSelectScenario(steps[next - 1].scenario);
                  if (steps[next - 1].scenario === 'RECURRING_BOTTLENECK') {
                    onOpenBottlenecks();
                  }
                }}
                className="px-2.5 py-0.5 rounded text-[11px] font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 flex items-center gap-1"
              >
                <span>Next Step</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {steps.map((s) => {
              const isCurrent = s.step === walkthroughStep;
              const isCompleted = s.step < walkthroughStep;

              return (
                <button
                  key={s.step}
                  onClick={() => {
                    onSetWalkthroughStep(s.step);
                    onSelectScenario(s.scenario);
                    if (s.scenario === 'RECURRING_BOTTLENECK') {
                      onOpenBottlenecks();
                    }
                  }}
                  className={`text-left p-2 rounded-lg border text-xs transition-all ${
                    isCurrent
                      ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md'
                      : isCompleted
                      ? 'bg-slate-900 border-slate-800 text-slate-300'
                      : 'bg-slate-950 border-slate-800/80 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                    <span>STEP {s.step}</span>
                    {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <p className="font-semibold text-[11px] truncate">{s.title}</p>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-cyan-200/90 mt-2 bg-cyan-950/40 p-2 rounded border border-cyan-900/60 font-medium">
            <strong>Active Step {walkthroughStep}:</strong> {steps[walkthroughStep - 1].description}
          </p>
        </div>
      )}
    </div>
  );
};
