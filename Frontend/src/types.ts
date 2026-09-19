export type CongestionLevel = 'normal' | 'moderate' | 'heavy' | 'severe';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RoadSegment {
  id: string;
  name: string;
  corridor: string;
  fromJunction: string;
  toJunction: string;
  coordinates: [number, number][]; // [lat, lng] array
  category: 'Major Arterial' | 'IT Corridor' | 'Expressway Feeder' | 'Secondary Arterial';
  currentSpeed: number; // km/h
  freeFlowSpeed: number; // km/h
  expectedBaselineSpeed: number; // km/h
  trafficVolume: number; // PCU/hr (Passenger Car Units / hour)
  roadCapacity: number; // PCU/hr
  congestionLevel: CongestionLevel;
  queueLengthKm: number;
  timestamp: string;
  alternativeRouteIds: string[];
  isIncidentActive?: boolean;
  incidentType?: string;
  incidentDescription?: string;
  recurringBottleneckId?: string;
}

export interface TrafficAlert {
  id: string;
  roadId: string;
  roadName: string;
  type: 'ABNORMAL_PATTERN' | 'POSSIBLE_INCIDENT' | 'CONGESTION_SPILLBACK';
  title: string;
  severity: AlertSeverity;
  currentSpeed: number;
  expectedSpeed: number;
  volumeChangePercent: number;
  aiAssessment: string;
  confidence: number;
  possibleExplanations: string[];
  whatChanged: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved';
}

export interface ForecastHorizon {
  minutesAhead: 15 | 30 | 45 | 60;
  predictedCongestion: CongestionLevel;
  expectedSpeed: number;
  expectedVolume: number;
  confidence: number;
  mainFactors: string[];
  volumeGrowthRatePercent: number;
}

export interface ForecastResult {
  roadId: string;
  roadName: string;
  currentStatus: CongestionLevel;
  horizons: ForecastHorizon[];
  whyExplanation: {
    summary: string;
    bulletFactors: string[];
    riskAssessment: string;
  };
}

export interface AlternativeRouteEvaluation {
  roadId: string;
  name: string;
  currentCapacityUtilizedPercent: number;
  availableCapacityPcu: number;
  currentCongestion: CongestionLevel;
  predictedCongestion: CongestionLevel;
  estimatedTravelTimeMin: number;
  spillbackRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  isViable: boolean;
  rejectReason?: string;
}

export type DiversionDecisionStatus = 'DIVERSION_FEASIBLE' | 'DIVERSION_NOT_RECOMMENDED';

export interface SimulatedImpact {
  before: {
    averageSpeedKmH: number;
    congestionLevel: CongestionLevel;
    queueLengthKm: number;
    estimatedDelayMin: number;
  };
  after: {
    averageSpeedKmH: number;
    congestionLevel: CongestionLevel;
    queueLengthKm: number;
    estimatedDelayMin: number;
  };
  speedImprovementPercent: number;
  delayReductionPercent: number;
  queueReductionPercent: number;
}

export interface OperationalAdvisory {
  id: string;
  strategyTitle: string;
  category: 'SIGNAL_TIMING' | 'UPSTREAM_METERING' | 'CORRIDOR_PRIORITY' | 'SPILLBACK_CONTAINMENT';
  advisoryText: string;
  targetJunctionOrCorridor: string;
  simulatedExpectedImpact: string;
  reEvaluateAfterMinutes: number;
}

export interface DiversionEvaluationResult {
  roadId: string;
  roadName: string;
  decision: DiversionDecisionStatus;
  primaryRecommendation: string;
  reason: string;
  confidence: number;
  evaluatedRoutes: AlternativeRouteEvaluation[];
  recommendedRouteId?: string;
  simulatedImpact: SimulatedImpact;
  advisoryResponses?: OperationalAdvisory[];
  whyExplanation: {
    rationale: string;
    bulletPoints: string[];
  };
  disclaimer: string;
}

export interface RecurringBottleneck {
  id: string;
  roadId: string;
  locationName: string;
  junctionName: string;
  monthlyFrequency: number; // e.g. 22 occurrences/month
  typicalCongestionTime: string; // e.g. "08:30 AM - 10:45 AM"
  averageCongestionDurationMin: number; // e.g. 48 mins
  averagePeakSpeedKmH: number; // e.g. 11 km/h
  mainContributingFactors: string[];
  longTermRecommendation: {
    title: string;
    category: 'SIGNAL_REDESIGN' | 'GRADE_SEPARATION' | 'LANE_RESTRUCTURING' | 'TIDAL_FLOW' | 'BOTTLENECK_WIDENING';
    description: string;
    estimatedCostTier: 'Low (Operational)' | 'Medium (Restructuring)' | 'High (Capital Infrastructure)';
    simulatedBeforeAfterImpact: {
      currentPeakSpeed: string;
      projectedSpeed: string;
      delaySavings: string;
      throughputGain: string;
    };
  };
}

export interface TrafficKpis {
  totalMonitoredRoads: number;
  normalRoadsCount: number;
  moderateRoadsCount: number;
  congestedRoadsCount: number;
  severeRoadsCount: number;
  activeAlertsCount: number;
  networkAverageSpeedKmH: number;
  networkCapacityUtilizationPercent: number;
}

export type ScenarioPreset = 
  | 'BASELINE' 
  | 'TRAFFIC_SURGE' 
  | 'INCIDENT_DETECTED' 
  | 'TEST_DIVERSION_FEASIBLE' 
  | 'TEST_NO_DIVERSION' 
  | 'RECURRING_BOTTLENECK';

export type AppSection =
  | 'COMMAND_CENTER'
  | 'LIVE_TRAFFIC'
  | 'FORECAST'
  | 'INCIDENTS'
  | 'RECOMMENDATIONS'
  | 'NO_DIVERSION'
  | 'BOTTLENECKS'
  | 'SIMULATION';

export interface SimulationLogEntry {
  id: string;
  time: string;
  title: string;
  detail: string;
  type: 'info' | 'warning' | 'alert' | 'success' | 'action';
}
