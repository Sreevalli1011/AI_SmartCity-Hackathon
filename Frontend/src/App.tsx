import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RoadSegment,
  ScenarioPreset,
  TrafficAlert,
  AppSection,
  SimulationLogEntry,
} from './types';
import { INITIAL_ROADS, RECURRING_BOTTLENECKS } from './data/hyderabadNetwork';
import {
  calculateCongestionLevel,
  calculateNetworkKpis,
  detectAbnormalPatterns,
  generateForecast,
  evaluateDiversionFeasibility,
} from './services/trafficEngine';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { BreadcrumbHeader } from './components/BreadcrumbHeader';
import { CommandCenterPage } from './components/pages/CommandCenterPage';
import { LiveTrafficPage } from './components/pages/LiveTrafficPage';
import { ForecastPage } from './components/pages/ForecastPage';
import { IncidentsPage } from './components/pages/IncidentsPage';
import { RecommendationsPage } from './components/pages/RecommendationsPage';
import { NoDiversionPage } from './components/pages/NoDiversionPage';
import { BottlenecksPage } from './components/pages/BottlenecksPage';
import { SimulationPage } from './components/pages/SimulationPage';
import { BottleneckAnalysisModal } from './components/BottleneckAnalysisModal';
import { WhyExplanationModal } from './components/WhyExplanationModal';

export default function App() {
  // Navigation State
  const [currentSection, setCurrentSection] = useState<AppSection>('COMMAND_CENTER');

  // Network State
  const [roads, setRoads] = useState<RoadSegment[]>(INITIAL_ROADS);
  const [selectedRoadId, setSelectedRoadId] = useState<string>('cyber-towers-main');
  const [currentScenario, setCurrentScenario] = useState<ScenarioPreset>('BASELINE');
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [simulatedTime, setSimulatedTime] = useState<string>('09:45:00');

  // Modals
  const [isBottleneckModalOpen, setIsBottleneckModalOpen] = useState<boolean>(false);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState<boolean>(false);

  // Simulation Event Log History (Prompt requirement)
  const [eventLogs, setEventLogs] = useState<SimulationLogEntry[]>([
    {
      id: 'log-0',
      time: '09:42',
      title: 'Telemetry Bus Initialized',
      detail: 'Sensors across 8 arterial Hyderabad corridors streaming at 1Hz nominal rate.',
      type: 'info',
    },
    {
      id: 'log-1',
      time: '09:45',
      title: 'Baseline State Synchronized',
      detail: 'Network velocity at 26 km/h. All key intersections operating within capacity.',
      type: 'success',
    },
  ]);

  // Selected road object
  const selectedRoad = useMemo(() => {
    return roads.find((r) => r.id === selectedRoadId) || roads[0];
  }, [roads, selectedRoadId]);

  // Compute Active Alerts across all roads
  const activeAlerts = useMemo(() => {
    const alerts: TrafficAlert[] = [];
    for (const road of roads) {
      const alert = detectAbnormalPatterns(road);
      if (alert) alerts.push(alert);
    }
    return alerts;
  }, [roads]);

  // Compute Network KPIs
  const kpis = useMemo(() => {
    return calculateNetworkKpis(roads, activeAlerts);
  }, [roads, activeAlerts]);

  // Compute Forecast for selected road
  const forecast = useMemo(() => {
    return generateForecast(selectedRoad);
  }, [selectedRoad]);

  // Compute Diversion Feasibility for selected road
  const forceDetoursCongested = currentScenario === 'TEST_NO_DIVERSION';
  const diversionResult = useMemo(() => {
    return evaluateDiversionFeasibility(selectedRoad, roads, forceDetoursCongested);
  }, [selectedRoad, roads, forceDetoursCongested]);

  // Add event log helper
  const addLog = useCallback((title: string, detail: string, type: SimulationLogEntry['type']) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setEventLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        time: timeStr,
        title,
        detail,
        type,
      },
      ...prev.slice(0, 40),
    ]);
  }, []);

  // Apply Scenarios & populate Event Log
  const handleSelectScenario = useCallback((scenario: ScenarioPreset) => {
    setCurrentScenario(scenario);

    if (scenario === 'BASELINE') {
      setRoads(INITIAL_ROADS.map((r) => ({ ...r })));
      setSelectedRoadId('cyber-towers-main');
      addLog('Baseline State Restored', 'All corridors reset to standard morning off-peak volume and speed metrics.', 'info');
      return;
    }

    if (scenario === 'TRAFFIC_SURGE') {
      setSelectedRoadId('cyber-towers-main');
      setRoads((prev) =>
        prev.map((r) => {
          if (r.id === 'cyber-towers-main') {
            const speed = 16;
            const vol = 3450;
            return {
              ...r,
              currentSpeed: speed,
              trafficVolume: vol,
              congestionLevel: calculateCongestionLevel(speed, r.freeFlowSpeed, vol, r.roadCapacity),
              queueLengthKm: 1.6,
              timestamp: 'Just now (Surge detected)',
            };
          }
          return r;
        })
      );
      addLog('Traffic Surge Detected', 'Sudden +45% traffic volume surge on Cyber Towers Main inbound link.', 'warning');
      addLog('Congestion Increased', 'Cyber Towers degraded to HEAVY/SEVERE with queue length growing to 1.6 km.', 'alert');
      addLog('Forecast Updated', '15–60 min predictive model projected worsening delay across tributary junctions.', 'action');
      return;
    }

    if (scenario === 'INCIDENT_DETECTED') {
      setSelectedRoadId('cyber-towers-main');
      setRoads((prev) =>
        prev.map((r) => {
          if (r.id === 'cyber-towers-main') {
            const speed = 11;
            const vol = 3600;
            return {
              ...r,
              currentSpeed: speed,
              trafficVolume: vol,
              congestionLevel: 'severe',
              queueLengthKm: 1.9,
              isIncidentActive: true,
              incidentType: 'Stalled Commercial Carrier & Shockwave',
              incidentDescription: 'Downstream lane constriction near Cyber Towers quad-junction throat',
              timestamp: 'Just now (Incident alert)',
            };
          }
          return r;
        })
      );
      addLog('Incident Anomaly Flagged', 'Sudden speed reduction (-68%) paired with volume spike detected on Cyber Towers.', 'alert');
      addLog('Incident Classified', 'Diagnosed as abnormal traffic pattern / possible physical incident without false crash claims.', 'warning');
      return;
    }

    if (scenario === 'TEST_DIVERSION_FEASIBLE') {
      setSelectedRoadId('cyber-towers-main');
      setRoads((prev) =>
        prev.map((r) => {
          if (r.id === 'cyber-towers-main') {
            return {
              ...r,
              currentSpeed: 12,
              trafficVolume: 3500,
              congestionLevel: 'severe',
              queueLengthKm: 1.8,
              timestamp: 'Active Severe',
            };
          }
          if (r.id === 'hitec-kondapur-bypass') {
            // Route B has spare capacity
            return {
              ...r,
              currentSpeed: 38,
              trafficVolume: 1250,
              congestionLevel: 'normal',
              queueLengthKm: 0.2,
              timestamp: 'Spare Capacity High',
            };
          }
          return r;
        })
      );
      addLog('Diversion Feasibility Evaluated', 'Bypass Route B capacity checked: 38% available spare headroom and Low spillback risk.', 'action');
      addLog('Recommendation Generated', 'Advise simulated diversion of ~30% volume toward Route B (+61% speed restoration).', 'success');
      return;
    }

    if (scenario === 'TEST_NO_DIVERSION') {
      setSelectedRoadId('cyber-towers-main');
      setRoads((prev) =>
        prev.map((r) => {
          if (r.id === 'cyber-towers-main') {
            return {
              ...r,
              currentSpeed: 11,
              trafficVolume: 3600,
              congestionLevel: 'severe',
              queueLengthKm: 1.9,
            };
          }
          if (r.id === 'hitec-kondapur-bypass') {
            return {
              ...r,
              currentSpeed: 15,
              trafficVolume: 2320,
              congestionLevel: 'heavy',
              queueLengthKm: 1.2,
            };
          }
          if (r.id === 'inorbit-mindspace-corridor') {
            return {
              ...r,
              currentSpeed: 13,
              trafficVolume: 2380,
              congestionLevel: 'severe',
              queueLengthKm: 1.4,
            };
          }
          return r;
        })
      );
      addLog('Saturated Network Detected', 'Detour routes B & C are saturated (>90% full). Diversion rejected to prevent cascading gridlock.', 'alert');
      addLog('No-Diversion Tactic Synthesized', 'Advise simulated +14s green signal retiming at throat junction and upstream metering.', 'action');
      return;
    }

    if (scenario === 'RECURRING_BOTTLENECK') {
      setSelectedRoadId('cyber-towers-main');
      addLog('Historical Chokepoints Loaded', '18 monthly recurring bottleneck events mapped for Cyber Towers & Punjagutta.', 'info');
      addLog('Civil Planning Strategy Generated', 'Grade-separated throat restructuring proposal analyzed with +28% capacity ROI.', 'success');
    }
  }, [addLog]);

  // Live simulation tick (subtle natural variations to demonstrate responsiveness)
  useEffect(() => {
    if (!isAutoSimulating) return;

    const interval = setInterval(() => {
      // Advance clock
      setSimulatedTime((prev) => {
        const [h, m, s] = prev.split(':').map(Number);
        const totalSec = (h * 3600 + m * 60 + s + simulationSpeed) % 86400;
        const newH = Math.floor(totalSec / 3600).toString().padStart(2, '0');
        const newM = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
        const newS = Math.floor(totalSec % 60).toString().padStart(2, '0');
        return `${newH}:${newM}:${newS}`;
      });

      // Subtle fluctuation on non-critical roads
      setRoads((prev) =>
        prev.map((r) => {
          if (r.id === 'cyber-towers-main' && currentScenario !== 'BASELINE') {
            return r;
          }
          const deltaSpeed = Math.floor(Math.random() * 3) - 1;
          const deltaVol = Math.floor(Math.random() * 21) - 10;
          const newSpeed = Math.min(Math.max(r.currentSpeed + deltaSpeed, 10), r.freeFlowSpeed);
          const newVol = Math.min(Math.max(r.trafficVolume + deltaVol, 500), r.roadCapacity * 1.2);
          return {
            ...r,
            currentSpeed: newSpeed,
            trafficVolume: newVol,
            congestionLevel: calculateCongestionLevel(newSpeed, r.freeFlowSpeed, newVol, r.roadCapacity),
            timestamp: 'Live updating',
          };
        })
      );
    }, 3000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isAutoSimulating, simulationSpeed, currentScenario]);

  // Helper to switch road by ID
  const handleSelectRoadById = (id: string) => {
    setSelectedRoadId(id);
    const r = roads.find((road) => road.id === id);
    if (r) setSelectedRoadId(r.id);
  };

  // Breadcrumb configurations per section
  const sectionBreadcrumbs: Record<
    AppSection,
    {
      title: string;
      subtitle: string;
      purpose: string;
      badge?: string;
      badgeColor?: string;
      onNextWorkflowStep?: { label: string; targetSection: AppSection };
    }
  > = {
    COMMAND_CENTER: {
      title: 'Command Center',
      subtitle: 'Real-time overview of Hyderabad arterial grid',
      purpose: 'OVERVIEW',
    },
    LIVE_TRAFFIC: {
      title: 'Live Traffic Monitor',
      subtitle: 'Real-time corridor telemetry, velocities & capacity ratios',
      purpose: 'WHAT IS HAPPENING RIGHT NOW?',
      badge: `${kpis.congestedRoadsCount} Congested`,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
      onNextWorkflowStep: {
        label: 'View Forecast (+15-60m)',
        targetSection: 'FORECAST',
      },
    },
    FORECAST: {
      title: 'Predictive Traffic Forecast',
      subtitle: '15–60 minute horizon modeling speed decay & queue propagation',
      purpose: 'WHAT WILL HAPPEN IN THE NEXT 15–60 MINUTES?',
      badge: 'Multi-Horizon Model',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
      onNextWorkflowStep: {
        label: 'Check Available Responses',
        targetSection: 'RECOMMENDATIONS',
      },
    },
    INCIDENTS: {
      title: 'Incidents & Anomaly Intelligence',
      subtitle: 'Automated pattern recognition without premature crash conclusions',
      purpose: 'IS SOMETHING UNUSUAL HAPPENING?',
      badge: `${activeAlerts.length} Active Alerts`,
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
      onNextWorkflowStep: {
        label: 'Check Recommended Response',
        targetSection: 'RECOMMENDATIONS',
      },
    },
    RECOMMENDATIONS: {
      title: 'Diversion Feasibility & Simulated Response',
      subtitle: 'Detour capacity audits, spillback control & before/after outcomes',
      purpose: 'WHAT SHOULD THE OPERATOR CONSIDER?',
      badge: diversionResult.decision === 'DIVERSION_FEASIBLE' ? 'Feasible' : 'Not Recommended',
      badgeColor:
        diversionResult.decision === 'DIVERSION_FEASIBLE'
          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
          : 'bg-rose-950 text-rose-300 border-rose-800',
      onNextWorkflowStep: {
        label: 'Check Saturated (No-Diversion)',
        targetSection: 'NO_DIVERSION',
      },
    },
    NO_DIVERSION: {
      title: 'No-Diversion Operational Response',
      subtitle: 'Protocols for saturated networks: Signal retiming & upstream metering',
      purpose: 'WHAT IF WE CANNOT DIVERT TRAFFIC?',
      badge: 'Saturated Detour Protocol',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
      onNextWorkflowStep: {
        label: 'Review Recurring Bottlenecks',
        targetSection: 'BOTTLENECKS',
      },
    },
    BOTTLENECKS: {
      title: 'Recurring Structural Bottlenecks Hub',
      subtitle: 'Long-term civil engineering solutions & historical peak analytics',
      purpose: 'IS THIS TEMPORARY OR RECURRING?',
      badge: `${RECURRING_BOTTLENECKS.length} Chronic Chokepoints`,
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
      onNextWorkflowStep: {
        label: 'Open Simulation Sandbox',
        targetSection: 'SIMULATION',
      },
    },
    SIMULATION: {
      title: 'Hackathon Evaluation Sandbox',
      subtitle: 'Interactive test harness with event logs & 3-minute guided story',
      purpose: 'HACKATHON EVALUATOR WORKBENCH',
      badge: 'Interactive Sandbox',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
      onNextWorkflowStep: {
        label: 'Back to Command Center',
        targetSection: 'COMMAND_CENTER',
      },
    },
  };

  const currentBreadcrumb = sectionBreadcrumbs[currentSection];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. Header Bar */}
      <Header
        simulatedTime={simulatedTime}
        isAutoSimulating={isAutoSimulating}
        onToggleAutoSim={() => setIsAutoSimulating(!isAutoSimulating)}
        onResetBaseline={() => handleSelectScenario('BASELINE')}
        simulationSpeed={simulationSpeed}
        onChangeSpeed={setSimulationSpeed}
        onOpenBottlenecks={() => setCurrentSection('BOTTLENECKS')}
      />

      {/* 2. Navigation Bar (8 Clickable Sections) */}
      <Navigation
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        activeAlertsCount={activeAlerts.length}
        severeRoadsCount={kpis.severeRoadsCount}
      />

      {/* 3. Breadcrumb & Section Subheader (for subpages) */}
      <BreadcrumbHeader
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        title={currentBreadcrumb.title}
        subtitle={currentBreadcrumb.subtitle}
        purpose={currentBreadcrumb.purpose}
        badge={currentBreadcrumb.badge}
        badgeColor={currentBreadcrumb.badgeColor}
        onNextWorkflowStep={currentBreadcrumb.onNextWorkflowStep}
      />

      {/* 4. Dedicated Page View Container */}
      <main className="flex-1 p-4 max-w-[1750px] w-full mx-auto">
        {/* PAGE 1: COMMAND CENTER */}
        {currentSection === 'COMMAND_CENTER' && (
          <CommandCenterPage
            roads={roads}
            selectedRoad={selectedRoad}
            onSelectRoad={(r) => setSelectedRoadId(r.id)}
            activeAlerts={activeAlerts}
            kpis={kpis}
            forecast={forecast}
            diversionResult={diversionResult}
            onNavigate={setCurrentSection}
          />
        )}

        {/* PAGE 2: LIVE TRAFFIC */}
        {currentSection === 'LIVE_TRAFFIC' && (
          <LiveTrafficPage
            roads={roads}
            selectedRoad={selectedRoad}
            onSelectRoad={(r) => setSelectedRoadId(r.id)}
            activeAlerts={activeAlerts}
            diversionResult={diversionResult}
            onNavigate={setCurrentSection}
            onOpenWhyExplanation={() => setIsWhyModalOpen(true)}
          />
        )}

        {/* PAGE 3: FORECAST */}
        {currentSection === 'FORECAST' && (
          <ForecastPage
            roads={roads}
            selectedRoad={selectedRoad}
            onSelectRoad={(r) => setSelectedRoadId(r.id)}
            forecast={forecast}
            onNavigate={setCurrentSection}
          />
        )}

        {/* PAGE 4: INCIDENTS */}
        {currentSection === 'INCIDENTS' && (
          <IncidentsPage
            alerts={activeAlerts}
            roads={roads}
            onSelectRoadById={handleSelectRoadById}
            onNavigate={setCurrentSection}
          />
        )}

        {/* PAGE 5: RECOMMENDATIONS */}
        {currentSection === 'RECOMMENDATIONS' && (
          <RecommendationsPage
            roads={roads}
            selectedRoad={selectedRoad}
            onSelectRoad={(r) => setSelectedRoadId(r.id)}
            diversionResult={diversionResult}
            onNavigate={setCurrentSection}
            onOpenWhyExplanation={() => setIsWhyModalOpen(true)}
          />
        )}

        {/* PAGE 6: NO-DIVERSION RESPONSE */}
        {currentSection === 'NO_DIVERSION' && (
          <NoDiversionPage
            roads={roads}
            onNavigate={setCurrentSection}
            onSelectRoadById={handleSelectRoadById}
          />
        )}

        {/* PAGE 7: RECURRING BOTTLENECKS */}
        {currentSection === 'BOTTLENECKS' && (
          <BottlenecksPage
            onNavigate={setCurrentSection}
            onSelectRoadById={handleSelectRoadById}
          />
        )}

        {/* PAGE 8: SIMULATION SANDBOX */}
        {currentSection === 'SIMULATION' && (
          <SimulationPage
            currentScenario={currentScenario}
            onSelectScenario={handleSelectScenario}
            onResetBaseline={() => handleSelectScenario('BASELINE')}
            eventLogs={eventLogs}
            onNavigate={setCurrentSection}
            onClearLogs={() => setEventLogs([])}
          />
        )}
      </main>

      {/* Global Explanatory & Bottleneck Modals */}
      <BottleneckAnalysisModal
        isOpen={isBottleneckModalOpen}
        onClose={() => setIsBottleneckModalOpen(false)}
        bottlenecks={RECURRING_BOTTLENECKS}
        onSelectRoadById={handleSelectRoadById}
      />

      <WhyExplanationModal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
        road={selectedRoad}
        diversionResult={diversionResult}
        forecast={forecast}
      />
    </div>
  );
}
