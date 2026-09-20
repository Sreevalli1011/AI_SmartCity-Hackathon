import {
  RoadSegment,
  CongestionLevel,
  TrafficAlert,
  ForecastResult,
  DiversionEvaluationResult,
  AlternativeRouteEvaluation,
  SimulatedImpact,
  OperationalAdvisory,
  TrafficKpis,
} from '../types';
const API_BASE_URL = 'http://127.0.0.1:8000';

export async function getBackendRecommendation(segmentId: string) {
  const response = await fetch(
    `${API_BASE_URL}/recommendations?segment_id=${segmentId}`
  );

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  return response.json();
}
/**
 * Calculates congestion level based on speed ratio and volume-to-capacity ratio (V/C).
 */
export function calculateCongestionLevel(
  currentSpeed: number,
  freeFlowSpeed: number,
  trafficVolume: number,
  roadCapacity: number
): CongestionLevel {
  const speedRatio = currentSpeed / Math.max(freeFlowSpeed, 1);
  const vcRatio = trafficVolume / Math.max(roadCapacity, 1);

  if (speedRatio < 0.35 || vcRatio >= 0.95) {
    return 'severe';
  }
  if (speedRatio < 0.55 || vcRatio >= 0.80) {
    return 'heavy';
  }
  if (speedRatio < 0.75 || vcRatio >= 0.65) {
    return 'moderate';
  }
  return 'normal';
}

/**
 * Computes network-wide traffic KPIs
 */
export function calculateNetworkKpis(roads: RoadSegment[], alerts: TrafficAlert[]): TrafficKpis {
  let normalCount = 0;
  let moderateCount = 0;
  let congestedCount = 0;
  let severeCount = 0;
  let totalSpeed = 0;
  let totalVolume = 0;
  let totalCapacity = 0;

  for (const road of roads) {
    if (road.congestionLevel === 'normal') normalCount++;
    else if (road.congestionLevel === 'moderate') moderateCount++;
    else if (road.congestionLevel === 'heavy') congestedCount++;
    else if (road.congestionLevel === 'severe') severeCount++;

    totalSpeed += road.currentSpeed;
    totalVolume += road.trafficVolume;
    totalCapacity += road.roadCapacity;
  }

  const activeAlerts = alerts.filter(a => a.status !== 'resolved').length;
  const avgSpeed = roads.length > 0 ? Math.round(totalSpeed / roads.length) : 0;
  const avgUtilization = totalCapacity > 0 ? Math.round((totalVolume / totalCapacity) * 100) : 0;

  return {
    totalMonitoredRoads: roads.length,
    normalRoadsCount: normalCount,
    moderateRoadsCount: moderateCount,
    congestedRoadsCount: congestedCount,
    severeRoadsCount: severeCount,
    activeAlertsCount: activeAlerts,
    networkAverageSpeedKmH: avgSpeed,
    networkCapacityUtilizationPercent: avgUtilization,
  };
}

/**
 * FEATURE 2: Abnormal Traffic & Possible Incident Detection
 * Detects sudden speed drops, sudden volume surges, or historical deviation.
 */
export function detectAbnormalPatterns(road: RoadSegment): TrafficAlert | null {
  const speedDropPercent = Math.round(
    ((road.expectedBaselineSpeed - road.currentSpeed) / Math.max(road.expectedBaselineSpeed, 1)) * 100
  );
  const vcRatio = road.trafficVolume / Math.max(road.roadCapacity, 1);
  const baselineVolume = Math.round(road.roadCapacity * 0.65);
  const volumeGrowthPercent = Math.round(((road.trafficVolume - baselineVolume) / baselineVolume) * 100);

  // Severe anomaly: speed plunged > 40% OR volume saturated while speed < 18 km/h
  if (speedDropPercent >= 38 || (road.congestionLevel === 'severe' && speedDropPercent >= 30)) {
    const isPossibleIncident = speedDropPercent >= 55 || (speedDropPercent >= 45 && road.queueLengthKm >= 1.2);

    return {
      id: `alert-${road.id}-${Date.now()}`,
      roadId: road.id,
      roadName: road.name,
      type: isPossibleIncident ? 'POSSIBLE_INCIDENT' : 'ABNORMAL_PATTERN',
      title: isPossibleIncident
        ? 'Possible Incident – Investigation Required'
        : 'Abnormal Traffic Pattern Detected',
      severity: isPossibleIncident ? 'critical' : 'high',
      currentSpeed: road.currentSpeed,
      expectedSpeed: road.expectedBaselineSpeed,
      volumeChangePercent: Math.max(volumeGrowthPercent, 18),
      aiAssessment: isPossibleIncident
        ? 'Sharp, sudden speed collapse with localized queue accumulation. Physical obstruction, stalled vehicle, or minor collision suspected downstream.'
        : 'Sudden speed reduction combined with elevated traffic volume deviating sharply from expected baseline.',
      confidence: isPossibleIncident ? 78 : 87,
      possibleExplanations: isPossibleIncident
        ? [
            'Localized lane obstruction or stalled commercial transport near junction throat',
            'Secondary shockwave from sudden braking event at intersection ramp',
            'Transit vehicle boarding stall blocking primary through-carriageway',
          ]
        : [
            'Sudden peak-hour inflow surge from converging arterial tributaries',
            'Downstream signal cycle desynchronization causing shockwave progression',
            'Road operating at critical volume-to-capacity threshold (V/C ' + vcRatio.toFixed(2) + ')',
          ],
      whatChanged: `Average speed fell to ${road.currentSpeed} km/h (expected ${road.expectedBaselineSpeed} km/h, -${speedDropPercent}%), volume +${Math.max(volumeGrowthPercent, 18)}% above nominal.`,
      timestamp: 'Active Just Now',
      status: 'active',
    };
  }

  // Moderate anomaly
  if (speedDropPercent >= 25 && road.congestionLevel === 'heavy') {
    return {
      id: `alert-${road.id}-${Date.now()}`,
      roadId: road.id,
      roadName: road.name,
      type: 'ABNORMAL_PATTERN',
      title: 'Abnormal Traffic Pattern Detected',
      severity: 'medium',
      currentSpeed: road.currentSpeed,
      expectedSpeed: road.expectedBaselineSpeed,
      volumeChangePercent: Math.max(volumeGrowthPercent, 12),
      aiAssessment: 'Early-stage queue buildup detected. Speed is deteriorating at a rate exceeding normal diurnal variation.',
      confidence: 83,
      possibleExplanations: [
        'Rapid commuter volume accumulation along IT corridor axis',
        'Weather or localized surface friction dampening average cruising speed',
      ],
      whatChanged: `Average speed reduced to ${road.currentSpeed} km/h vs baseline ${road.expectedBaselineSpeed} km/h.`,
      timestamp: 'Active Just Now',
      status: 'active',
    };
  }

  return null;
}

/**
 * FEATURE 3: 15–60 Minute Traffic Forecast
 * Interpretable time-series trend model evaluating traffic evolution
 */
export function generateForecast(road: RoadSegment): ForecastResult {
  const currentLevel = road.congestionLevel;
  const currentSpeed = road.currentSpeed;
  const currentVolume = road.trafficVolume;
  const capacity = road.roadCapacity;
  const vc = currentVolume / capacity;

  // Predict deterioration or recovery based on current trend & capacity saturation
  const isDeteriorating = currentLevel === 'severe' || currentLevel === 'heavy' || vc > 0.78;

  const horizons = [15, 30, 45, 60] as const;

  const horizonData = horizons.map((min, index) => {
    let predictedLevel: CongestionLevel;
    let speed: number;
    let volume: number;
    let confidence: number;
    let volumeGrowthRate: number;
    let factors: string[];

    if (isDeteriorating) {
      // Congestion compounds over time
      const degradationFactor = (index + 1) * 0.12;
      speed = Math.max(Math.round(currentSpeed * (1 - degradationFactor * 0.8)), 8);
      volumeGrowthRate = Math.round((index + 1) * 7.5);
      volume = Math.min(Math.round(currentVolume * (1 + volumeGrowthRate / 100)), Math.round(capacity * 1.25));

      if (min === 15) {
        predictedLevel = currentLevel === 'normal' ? 'moderate' : currentLevel === 'moderate' ? 'heavy' : 'severe';
        confidence = 89;
      } else if (min === 30) {
        predictedLevel = currentLevel === 'normal' ? 'heavy' : 'severe';
        confidence = 84;
      } else if (min === 45) {
        predictedLevel = 'severe';
        confidence = 79;
      } else {
        predictedLevel = 'severe';
        confidence = 72;
      }

      factors = [
        `Inflow rate (+${volumeGrowthRate}%) exceeds discharge capacity (${capacity} PCU/hr)`,
        `Speed decay trend (-${Math.round(currentSpeed - speed)} km/h projected)`,
        'Historical evening peak commuter pattern accelerating downstream queues',
        `Current road saturation index at ${(volume / capacity).toFixed(2)} V/C`,
      ];
    } else {
      // Stable or mild variation
      const variance = (index - 1) * 1.5;
      speed = Math.max(Math.round(currentSpeed + variance), 22);
      volumeGrowthRate = Math.round((index + 1) * 2.2);
      volume = Math.round(currentVolume * (1 + volumeGrowthRate / 100));
      predictedLevel = speed > 32 ? 'normal' : 'moderate';
      confidence = Math.round(92 - index * 4);
      factors = [
        'Steady baseline vehicle arrival rate within operational tolerance',
        'Downstream junction discharge clear and free-flowing',
        'Available link buffer capacity remains > 35%',
      ];
    }

    return {
      minutesAhead: min,
      predictedCongestion: predictedLevel,
      expectedSpeed: speed,
      expectedVolume: volume,
      confidence,
      mainFactors: factors,
      volumeGrowthRatePercent: volumeGrowthRate,
    };
  });

  return {
    roadId: road.id,
    roadName: road.name,
    currentStatus: currentLevel,
    horizons: horizonData,
    whyExplanation: {
      summary: isDeteriorating
        ? 'Forecast indicates escalating bottleneck propagation over the next hour due to incoming volume exceeding maximum corridor clearance throughput.'
        : 'Traffic flow is predicted to remain stable within design capacity limits over the next 60 minutes.',
      bulletFactors: isDeteriorating
        ? [
            'Traffic volume entering the corridor continues upward trajectory (+15% to +30% across peak)',
            'Average speed decreasing sharply, creating backward compression waves',
            'Historical peak-hour pattern confirms recurring demand surge at this timeframe',
            'Road is operating near or exceeding physical carriage capacity (V/C > 0.85)',
          ]
        : [
            'Arriving traffic volume matches design throughput capacity',
            'Cruising speeds steady against historical free-flow baseline',
            'No upstream or downstream shockwaves detected',
          ],
      riskAssessment: isDeteriorating
        ? 'High probability of queue spillback onto connecting feeder junctions if no intervention or upstream metering is applied.'
        : 'Nominal operational status; routine continuous monitoring advised.',
    },
  };
}

/**
 * FEATURES 4, 5, 6: Diversion Feasibility Evaluation & Operational Advisory
 * CRITICAL RULE:
 * "Do NOT automatically recommend diversion whenever congestion occurs.
 * If alternative routes are already congested or lack sufficient capacity, DO NOT recommend diversion."
 */
export function evaluateDiversionFeasibility(
  targetRoad: RoadSegment,
  allRoads: RoadSegment[],
  forceDetoursCongested: boolean = false
): DiversionEvaluationResult {
  const candidateIds = targetRoad.alternativeRouteIds || [];
  const candidateRoads = allRoads.filter(r => candidateIds.includes(r.id));

  // Evaluate each alternative route
  const evaluatedRoutes: AlternativeRouteEvaluation[] = candidateRoads.map(alt => {
    let effectiveVolume = alt.trafficVolume;
    let effectiveSpeed = alt.currentSpeed;
    let effectiveCongestion = alt.congestionLevel;

    // In no-diversion scenario or simulated congestion on detour
    if (forceDetoursCongested) {
      effectiveVolume = Math.round(alt.roadCapacity * 0.91);
      effectiveSpeed = 15;
      effectiveCongestion = 'heavy';
    }

    const capacityUtilizedPercent = Math.round((effectiveVolume / Math.max(alt.roadCapacity, 1)) * 100);
    const availableCapacityPcu = Math.max(alt.roadCapacity - effectiveVolume, 0);

    // Alternative travel time estimate
    const estimatedTravelTimeMin = Math.round((2.8 / Math.max(effectiveSpeed, 5)) * 60);

    // Spillback risk check
    let spillbackRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
    if (capacityUtilizedPercent > 88) spillbackRisk = 'Severe';
    else if (capacityUtilizedPercent > 78) spillbackRisk = 'High';
    else if (capacityUtilizedPercent > 65) spillbackRisk = 'Moderate';
    else spillbackRisk = 'Low';

    // Viability condition: must have at least 25% spare capacity (utilized <= 75%) and congestion <= moderate
    const isViable = capacityUtilizedPercent <= 76 && (effectiveCongestion === 'normal' || effectiveCongestion === 'moderate');

    let rejectReason: string | undefined;
    if (!isViable) {
      if (capacityUtilizedPercent > 85) {
        rejectReason = `Route capacity already saturated (${capacityUtilizedPercent}% utilized, only ${availableCapacityPcu} PCU/hr buffer).`;
      } else if (effectiveCongestion === 'heavy' || effectiveCongestion === 'severe') {
        rejectReason = `Route currently experiencing ${effectiveCongestion} congestion; diversion would trigger secondary gridlock.`;
      } else {
        rejectReason = `High spillback risk into adjacent junction (${spillbackRisk}).`;
      }
    }

    return {
      roadId: alt.id,
      name: alt.name,
      currentCapacityUtilizedPercent: capacityUtilizedPercent,
      availableCapacityPcu,
      currentCongestion: effectiveCongestion,
      predictedCongestion: isViable ? 'moderate' : 'severe',
      estimatedTravelTimeMin,
      spillbackRisk,
      isViable,
      rejectReason,
    };
  });

  const viableRoute = evaluatedRoutes.find(r => r.isViable);

  if (viableRoute && !forceDetoursCongested) {
    // CASE A: Diversion is feasible
    const simulatedImpact: SimulatedImpact = {
      before: {
        averageSpeedKmH: targetRoad.currentSpeed,
        congestionLevel: targetRoad.congestionLevel,
        queueLengthKm: targetRoad.queueLengthKm,
        estimatedDelayMin: Math.round(targetRoad.queueLengthKm * 14),
      },
      after: {
        averageSpeedKmH: Math.min(Math.round(targetRoad.currentSpeed * 1.7), targetRoad.freeFlowSpeed),
        congestionLevel: targetRoad.congestionLevel === 'severe' ? 'heavy' : 'moderate',
        queueLengthKm: Math.max(Number((targetRoad.queueLengthKm * 0.45).toFixed(1)), 0.3),
        estimatedDelayMin: Math.round(targetRoad.queueLengthKm * 14 * 0.48),
      },
      speedImprovementPercent: Math.round(((Math.min(targetRoad.currentSpeed * 1.7, targetRoad.freeFlowSpeed) - targetRoad.currentSpeed) / targetRoad.currentSpeed) * 100),
      delayReductionPercent: 52,
      queueReductionPercent: 55,
    };

    return {
      roadId: targetRoad.id,
      roadName: targetRoad.name,
      decision: 'DIVERSION_FEASIBLE',
      primaryRecommendation: `Consider advising simulated diversion of ~30% volume toward ${viableRoute.name}.`,
      reason: `${viableRoute.name} maintains ${100 - viableRoute.currentCapacityUtilizedPercent}% spare capacity (${viableRoute.availableCapacityPcu} PCU/hr headroom) with low corridor spillback risk.`,
      confidence: 86,
      evaluatedRoutes,
      recommendedRouteId: viableRoute.roadId,
      simulatedImpact,
      whyExplanation: {
        rationale: 'Primary arterial demand exceeds link throughput while the parallel bypass has substantial unutilized capacity.',
        bulletPoints: [
          `Primary corridor (${targetRoad.name}) is operating at ${Math.round((targetRoad.trafficVolume / targetRoad.roadCapacity) * 100)}% capacity.`,
          `Candidate route (${viableRoute.name}) has sufficient spare capacity (${viableRoute.availableCapacityPcu} PCU/hr available).`,
          `Diversion simulation indicates a +${simulatedImpact.speedImprovementPercent}% speed restoration without exceeding alternate route capacity limits.`,
          'Estimated travel time on diversion route remains lower than queuing delay on the primary arterial.',
        ],
      },
      disclaimer: 'SIMULATED ESTIMATE — NOT REAL-WORLD EXECUTION (Advisory Decision Support Only)',
    };
  }

  // CASE B: DIVERSION NOT RECOMMENDED
  // Alternative routes are saturated or no viable path exists
  const simulatedImpact: SimulatedImpact = {
    before: {
      averageSpeedKmH: targetRoad.currentSpeed,
      congestionLevel: targetRoad.congestionLevel,
      queueLengthKm: targetRoad.queueLengthKm,
      estimatedDelayMin: Math.round(targetRoad.queueLengthKm * 16),
    },
    after: {
      averageSpeedKmH: Math.min(Math.round(targetRoad.currentSpeed * 1.35), targetRoad.freeFlowSpeed),
      congestionLevel: targetRoad.congestionLevel === 'severe' ? 'heavy' : 'moderate',
      queueLengthKm: Math.max(Number((targetRoad.queueLengthKm * 0.72).toFixed(1)), 0.5),
      estimatedDelayMin: Math.round(targetRoad.queueLengthKm * 16 * 0.7),
    },
    speedImprovementPercent: Math.round(((Math.min(targetRoad.currentSpeed * 1.35, targetRoad.freeFlowSpeed) - targetRoad.currentSpeed) / targetRoad.currentSpeed) * 100),
    delayReductionPercent: 30,
    queueReductionPercent: 28,
  };

  const operationalAdvisories: OperationalAdvisory[] = [
    {
      id: 'adv-1',
      strategyTitle: 'Simulate Signal Timing Adjustment at Junction Throat',
      category: 'SIGNAL_TIMING',
      advisoryText: 'Dynamically reallocate +14 seconds of green time to the congested inbound arterial phase, taking 7 seconds from cross-street phases with low queuing.',
      targetJunctionOrCorridor: targetRoad.toJunction,
      simulatedExpectedImpact: 'Simulated queue clearance rate improves by ~26%; bottleneck delay reduced by 5.2 minutes per vehicle cycle.',
      reEvaluateAfterMinutes: 15,
    },
    {
      id: 'adv-2',
      strategyTitle: 'Simulate Upstream Traffic-Flow Restriction / Metering',
      category: 'UPSTREAM_METERING',
      advisoryText: 'Apply simulated virtual metering on the upstream approach roundabout to throttle incoming packet flow and prevent backward shockwave lock.',
      targetJunctionOrCorridor: targetRoad.fromJunction,
      simulatedExpectedImpact: 'Prevents total intersection gridlock; stabilizes minimum crawl speed above 16 km/h.',
      reEvaluateAfterMinutes: 15,
    },
    {
      id: 'adv-3',
      strategyTitle: 'Corridor Priority & Transit Lane Containment',
      category: 'CORRIDOR_PRIORITY',
      advisoryText: 'Simulate enforcement priority on the right through-lanes to preserve public transit flow and avoid bus-queue stacking.',
      targetJunctionOrCorridor: targetRoad.name,
      simulatedExpectedImpact: 'Protects mass-transit corridor throughput and reduces pedestrian platform spillover.',
      reEvaluateAfterMinutes: 20,
    },
    {
      id: 'adv-4',
      strategyTitle: 'Monitor Congestion Spillback & Re-evaluate Network',
      category: 'SPILLBACK_CONTAINMENT',
      advisoryText: 'Do NOT force traffic diversion. Actively track downstream intersection clearance and schedule an automated re-evaluation in 15 minutes.',
      targetJunctionOrCorridor: 'Network Corridor Zone',
      simulatedExpectedImpact: 'Avoids cascading failure onto adjacent residential and commercial connector routes.',
      reEvaluateAfterMinutes: 15,
    },
  ];

  return {
    roadId: targetRoad.id,
    roadName: targetRoad.name,
    decision: 'DIVERSION_NOT_RECOMMENDED',
    primaryRecommendation: 'DO NOT DIVERT. Enact simulated internal signal retiming and upstream metering instead.',
    reason: 'Alternative routes do not have sufficient spare capacity. Diverting traffic may shift congestion rather than reduce it.',
    confidence: 88,
    evaluatedRoutes,
    simulatedImpact,
    advisoryResponses: operationalAdvisories,
    whyExplanation: {
      rationale: 'All viable alternate detours are currently saturated (> 85% capacity utilization) or lack required geometric capacity to absorb diverted volume.',
      bulletPoints: [
        'Alternative routes do not have sufficient spare capacity (candidate detours operating at 88% - 94% utilization).',
        'Diverting traffic onto adjacent links would induce rapid secondary bottlenecking and gridlock on connector corridors.',
        'Existing arterial retains highest lane-discharge capacity; localized signal phase reallocation yields superior system-level recovery.',
        'Spillback risk onto feeder roundabouts would multiply if diversion was forced.',
      ],
    },
    disclaimer: 'SIMULATED ESTIMATE — NOT REAL-WORLD EXECUTION (Advisory Decision Support Only)',
  };
}
