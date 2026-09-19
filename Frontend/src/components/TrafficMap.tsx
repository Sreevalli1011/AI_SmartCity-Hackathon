import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RoadSegment, TrafficAlert, CongestionLevel, DiversionEvaluationResult, AppSection } from '../types';
import {
  Layers,
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Crosshair,
  TrendingUp,
  GitFork,
  AlertTriangle,
  X,
  Info,
} from 'lucide-react';

interface TrafficMapProps {
  roads: RoadSegment[];
  selectedRoad: RoadSegment;
  onSelectRoad: (road: RoadSegment) => void;
  activeAlerts: TrafficAlert[];
  diversionResult?: DiversionEvaluationResult | null;
  onNavigate?: (section: AppSection) => void;
}

// Strictly configured traffic line widths and colors per requirements
const CONGESTION_COLORS: Record<CongestionLevel, string> = {
  normal: '#10b981', // green
  moderate: '#f59e0b', // yellow / amber
  heavy: '#f97316', // orange
  severe: '#ef4444', // red
};

const CONGESTION_LINE_WIDTHS: Record<CongestionLevel, number> = {
  normal: 5,
  moderate: 6,
  heavy: 7,
  severe: 8,
};

const HYDERABAD_CENTER: [number, number] = [17.436, 78.390];
const DEFAULT_ZOOM = 13;

export const TrafficMap: React.FC<TrafficMapProps> = ({
  roads,
  selectedRoad,
  onSelectRoad,
  activeAlerts,
  diversionResult,
  onNavigate,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<'dark' | 'osm'>('dark');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showRoadDetailPopup, setShowRoadDetailPopup] = useState<boolean>(true);

  // 1. Initialize Map with OpenStreetMap (Zero external API key required)
  useEffect(() => {
    if (!mapElementRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapElementRef.current, {
      center: HYDERABAD_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    // Pure OpenStreetMap base layer - No Mapbox / Carto / Google API key needed
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abc',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Add clean attribution control
    L.control.attribution({ position: 'bottomright' }).addTo(map);

    const layersGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layersGroup;
    mapInstanceRef.current = map;

    // Apply dark mode CSS filter to tile container if dark
    if (mapContainerRef.current) {
      if (mapStyle === 'dark') {
        mapContainerRef.current.classList.add('dark-map-tiles');
      } else {
        mapContainerRef.current.classList.remove('dark-map-tiles');
      }
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Toggle Dark Command Matrix vs Standard OpenStreetMap Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapStyle === 'dark') {
      mapContainerRef.current.classList.add('dark-map-tiles');
    } else {
      mapContainerRef.current.classList.remove('dark-map-tiles');
    }
  }, [mapStyle]);

  // 3. Real Browser Fullscreen API implementation with event listener
  const toggleFullscreen = async () => {
    const container = mapContainerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed or was dismissed:', err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement === mapContainerRef.current);
      setIsFullscreen(active);
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 4. Container ResizeObserver for seamless responsiveness
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(container);

    const handleWindowResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // 5. Draw Road Polylines, Junctions, Diversion Paths, and Incidents
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;
    const group = layersGroupRef.current;
    group.clearLayers();

    // Map to keep track of junction coordinates to prevent duplicated node markers
    const junctionRegistry = new Map<string, { coord: [number, number]; label: string }>();

    roads.forEach((road) => {
      const isSelected = road.id === selectedRoad.id;
      const isRecommendedDiversion =
        diversionResult?.decision === 'DIVERSION_FEASIBLE' &&
        diversionResult.recommendedRouteId === road.id;

      // Color and line weight per specification
      const color = isRecommendedDiversion
        ? '#06b6d4' // Cyan for recommended diversion route
        : CONGESTION_COLORS[road.congestionLevel];

      const baseWeight = CONGESTION_LINE_WIDTHS[road.congestionLevel];
      const weight = isRecommendedDiversion ? 5 : isSelected ? baseWeight + 1 : baseWeight;
      const opacity = isSelected ? 1.0 : isRecommendedDiversion ? 0.95 : 0.85;

      // Polyline casing / shadow underlay for high contrast on map
      if (isSelected) {
        // Glowing cyan border for selected road
        L.polyline(road.coordinates, {
          color: '#38bdf8',
          weight: weight + 6,
          opacity: 0.6,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(group);
      } else {
        // Subtle dark outline underneath traffic line
        L.polyline(road.coordinates, {
          color: '#020617',
          weight: weight + 3,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(group);
      }

      // Main traffic polyline
      const polyline = L.polyline(road.coordinates, {
        color,
        weight,
        opacity,
        dashArray: isRecommendedDiversion ? '7, 7' : undefined,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group);

      // Interactive click: select road and show details
      polyline.on('click', () => {
        onSelectRoad(road);
        setShowRoadDetailPopup(true);
      });

      // Rich tooltip on hover
      const utilPercent = Math.round((road.trafficVolume / road.roadCapacity) * 100);
      polyline.bindTooltip(
        `
        <div class="p-1.5 font-sans text-xs min-w-[200px]">
          <div class="font-bold text-slate-100 flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1 mb-1">
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full" style="background:${CONGESTION_COLORS[road.congestionLevel]}"></span>
              ${road.name}
            </span>
            <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded" style="background:${CONGESTION_COLORS[road.congestionLevel]}22; color:${CONGESTION_COLORS[road.congestionLevel]}">
              ${road.congestionLevel}
            </span>
          </div>
          <div class="text-[11px] text-slate-300 grid grid-cols-2 gap-x-2 gap-y-1">
            <div>Speed: <strong class="text-white">${road.currentSpeed} km/h</strong></div>
            <div>Volume: <strong class="text-white">${road.trafficVolume.toLocaleString()} PCU/h</strong></div>
            <div>Capacity: <strong class="text-slate-300">${road.roadCapacity.toLocaleString()} PCU/h</strong></div>
            <div>Utilization: <strong class="${utilPercent > 85 ? 'text-rose-400' : 'text-cyan-400'}">${utilPercent}%</strong></div>
          </div>
          ${
            isRecommendedDiversion
              ? '<div class="mt-1.5 pt-1 border-t border-slate-700/80 text-[10px] font-bold text-cyan-300 flex items-center gap-1">★ RECOMMENDED SIMULATED DIVERSION</div>'
              : ''
          }
          <div class="mt-1 text-[9px] text-slate-400 italic">Click road segment to inspect telemetry</div>
        </div>
        `,
        {
          sticky: true,
          direction: 'top',
          className: 'custom-traffic-tooltip',
        }
      );

      // Register start and end junctions for connected node markers
      const startCoord = road.coordinates[0];
      const endCoord = road.coordinates[road.coordinates.length - 1];

      const startKey = `${startCoord[0].toFixed(4)}_${startCoord[1].toFixed(4)}`;
      if (!junctionRegistry.has(startKey)) {
        junctionRegistry.set(startKey, { coord: startCoord, label: road.fromJunction });
      }

      const endKey = `${endCoord[0].toFixed(4)}_${endCoord[1].toFixed(4)}`;
      if (!junctionRegistry.has(endKey)) {
        junctionRegistry.set(endKey, { coord: endCoord, label: road.toJunction });
      }

      // Diversion route labels & start/end badges
      if (isRecommendedDiversion) {
        // Label in the middle of diversion route
        const midIdx = Math.floor(road.coordinates.length / 2);
        const midCoord = road.coordinates[midIdx];

        const diversionBadgeIcon = L.divIcon({
          className: 'diversion-badge',
          html: `
            <div class="bg-cyan-950/95 border border-cyan-400 text-cyan-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap -translate-x-1/2 -translate-y-1/2 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              SIMULATED DIVERSION
            </div>
          `,
          iconSize: [120, 20],
        });

        L.marker(midCoord, { icon: diversionBadgeIcon }).addTo(group);

        // Origin marker
        const originIcon = L.divIcon({
          className: 'diversion-origin-marker',
          html: `
            <div class="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md -translate-x-1/2 -translate-y-1/2 border border-emerald-400">
              DETOUR ORIGIN
            </div>
          `,
          iconSize: [80, 18],
        });
        L.marker(startCoord, { icon: originIcon }).addTo(group);

        // Destination marker
        const destIcon = L.divIcon({
          className: 'diversion-dest-marker',
          html: `
            <div class="bg-cyan-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md -translate-x-1/2 -translate-y-1/2 border border-cyan-400">
              DETOUR TARGET
            </div>
          `,
          iconSize: [80, 18],
        });
        L.marker(endCoord, { icon: destIcon }).addTo(group);
      }
    });

    // Draw connected junction node markers
    junctionRegistry.forEach(({ coord, label }) => {
      const nodeIcon = L.divIcon({
        className: 'custom-node-marker',
        html: `<div class="w-3 h-3 rounded-full bg-slate-900 border-2 border-slate-200 shadow-md transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform"></div>`,
        iconSize: [12, 12],
      });

      L.marker(coord, { icon: nodeIcon })
        .bindTooltip(`<span class="text-[10px] font-semibold text-slate-200">${label}</span>`, {
          direction: 'bottom',
          offset: [0, 6],
          className: 'custom-junction-tooltip',
        })
        .addTo(group);
    });

    // Draw Incident / Alert pulsating markers
    activeAlerts.forEach((alert) => {
      const targetRoad = roads.find((r) => r.id === alert.roadId);
      if (!targetRoad || !targetRoad.coordinates.length) return;

      const midIndex = Math.floor(targetRoad.coordinates.length / 2);
      const midCoord = targetRoad.coordinates[midIndex];

      const isCritical = alert.severity === 'critical';
      const pulseColor = isCritical ? 'bg-rose-500' : 'bg-amber-500';
      const ringColor = isCritical ? 'border-rose-400' : 'border-amber-400';

      const alertIcon = L.divIcon({
        className: 'custom-alert-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <span class="animate-ping absolute inline-flex h-7 w-7 rounded-full ${pulseColor} opacity-75"></span>
            <div class="relative inline-flex items-center justify-center rounded-full h-6 w-6 ${pulseColor} text-white text-[10px] font-bold shadow-lg border-2 ${ringColor}">
              !
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker(midCoord, { icon: alertIcon })
        .on('click', () => {
          onSelectRoad(targetRoad);
          setShowRoadDetailPopup(true);
        })
        .bindTooltip(
          `
          <div class="p-1 font-sans text-xs">
            <div class="font-bold text-rose-400">${alert.title}</div>
            <div class="text-[11px] text-slate-200 mt-0.5">${alert.roadName}</div>
            <div class="text-[10px] text-slate-400 mt-0.5">Speed: ${alert.currentSpeed} km/h (exp: ${alert.expectedSpeed} km/h)</div>
          </div>
        `,
          { direction: 'top', className: 'custom-traffic-tooltip' }
        )
        .addTo(group);
    });
  }, [roads, selectedRoad, activeAlerts, diversionResult, onSelectRoad]);

  // Controls Handlers
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(HYDERABAD_CENTER, DEFAULT_ZOOM);
  };

  const handleFocusSelected = () => {
    if (!mapInstanceRef.current || !selectedRoad.coordinates.length) return;
    const bounds = L.latLngBounds(selectedRoad.coordinates);
    mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  };

  const handleZoom = (delta: number) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
  };

  const selectedUtilPercent = Math.round((selectedRoad.trafficVolume / selectedRoad.roadCapacity) * 100);
  const isSelectedWorsening =
    selectedRoad.congestionLevel === 'severe' ||
    selectedRoad.congestionLevel === 'heavy' ||
    selectedUtilPercent > 80;

  return (
    <div
      ref={mapContainerRef}
      className={`relative w-full h-full min-h-[480px] bg-slate-950 overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-[99999] h-screen w-screen rounded-none' : 'rounded-2xl border border-slate-800 shadow-xl'
      }`}
    >
      {/* Top Left: Hyderabad Map & Selected Status Banner */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 max-w-[85%]">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-semibold text-slate-100">Hyderabad Corridor Grid</span>
          <span className="text-[10px] text-slate-400">|</span>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
            SIMULATED TRAFFIC DATA
          </span>
        </div>
      </div>

      {/* Top Right Controls Toolbar */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5">
        {/* Toggle Dark Matrix vs Street Map */}
        <button
          onClick={() => setMapStyle((s) => (s === 'dark' ? 'osm' : 'dark'))}
          className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs transition-colors"
          title="Toggle Dark Matrix / Clean OpenStreetMap Layer"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium hidden sm:inline">
            {mapStyle === 'dark' ? 'Dark Matrix' : 'Street Map'}
          </span>
        </button>

        {/* Focus on Selected Corridor */}
        <button
          onClick={handleFocusSelected}
          className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-slate-200 hover:text-white p-2 rounded-xl shadow-lg transition-colors flex items-center gap-1 text-xs"
          title="Center on selected corridor"
        >
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium hidden md:inline">Focus</span>
        </button>

        {/* Reset View Button */}
        <button
          onClick={handleResetView}
          className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-slate-200 hover:text-white p-2 rounded-xl shadow-lg transition-colors flex items-center gap-1 text-xs"
          title="Reset map view to Hyderabad overview"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium hidden md:inline">Reset View</span>
        </button>

        {/* Real Fullscreen Button per user prompt */}
        <button
          onClick={toggleFullscreen}
          className={`backdrop-blur-md border px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
            isFullscreen
              ? 'bg-rose-950/90 border-rose-600 text-rose-200 hover:bg-rose-900'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:text-white'
          }`}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-rose-400" />
              <span>✕ Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>⛶ Fullscreen</span>
            </>
          )}
        </button>

        {/* Zoom In/Out Stepper */}
        <div className="flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={() => handleZoom(1)}
            className="p-2 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(-1)}
            className="p-2 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Left: Traffic State Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl shadow-lg text-[11px] max-w-md hidden sm:block">
        <p className="font-semibold text-slate-300 mb-1 text-[10px] uppercase tracking-wider">
          Traffic Congestion State
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Normal (5px)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Moderate (6px)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-slate-300">Heavy (7px)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">Severe (8px)</span>
          </div>
          {diversionResult?.decision === 'DIVERSION_FEASIBLE' && (
            <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-cyan-400"></span>
              <span className="text-cyan-300 font-bold">Simulated Diversion</span>
            </div>
          )}
        </div>
      </div>

      {/* Clean Floating Road Details Panel on Map (Requirement 7) */}
      {showRoadDetailPopup && (
        <div className="absolute bottom-3 right-3 sm:right-3 sm:max-w-sm w-[92%] sm:w-80 z-[1000] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: CONGESTION_COLORS[selectedRoad.congestionLevel] }}
                />
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Road Details
                </span>
              </div>
              <h4 className="text-xs font-bold text-white leading-snug">
                {selectedRoad.name}
              </h4>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border"
                style={{
                  background: `${CONGESTION_COLORS[selectedRoad.congestionLevel]}20`,
                  color: CONGESTION_COLORS[selectedRoad.congestionLevel],
                  borderColor: `${CONGESTION_COLORS[selectedRoad.congestionLevel]}50`,
                }}
              >
                {selectedRoad.congestionLevel}
              </span>
              <button
                onClick={() => setShowRoadDetailPopup(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Dismiss road details"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Current Speed</span>
              <p className="font-bold text-white font-mono text-sm">
                {selectedRoad.currentSpeed} <span className="text-[10px] text-slate-400 font-normal">km/h</span>
              </p>
            </div>

            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Traffic Volume</span>
              <p className="font-bold text-cyan-400 font-mono text-sm">
                {selectedRoad.trafficVolume.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">PCU/h</span>
              </p>
            </div>

            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Capacity</span>
              <p className="font-bold text-slate-300 font-mono text-sm">
                {selectedRoad.roadCapacity.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">PCU/h</span>
              </p>
            </div>

            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Utilization</span>
              <p
                className={`font-bold font-mono text-sm ${
                  selectedUtilPercent > 85
                    ? 'text-rose-400'
                    : selectedUtilPercent > 70
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {selectedUtilPercent}%
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] mb-3 px-1">
            <span className="text-slate-400">Trend:</span>
            <strong
              className={`font-bold ${
                isSelectedWorsening ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isSelectedWorsening ? 'WORSENING ↑' : 'STABLE →'}
            </strong>
          </div>

          {/* Prompt-mandated Action Buttons: [View Forecast], [Check Diversion], [View Alerts] */}
          {onNavigate && (
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => onNavigate('FORECAST')}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-colors text-center"
                title="Open 15-60 min traffic prediction"
              >
                <TrendingUp className="w-3 h-3 shrink-0" />
                <span className="truncate">Forecast</span>
              </button>

              <button
                onClick={() => onNavigate('RECOMMENDATIONS')}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors text-center"
                title="Check detour capacity"
              >
                <GitFork className="w-3 h-3 shrink-0" />
                <span className="truncate">Diversion</span>
              </button>

              <button
                onClick={() => onNavigate('INCIDENTS')}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-colors text-center"
                title="Inspect anomaly and alerts"
              >
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span className="truncate">Alerts</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Real Map Canvas Container */}
      <div ref={mapElementRef} className="w-full h-full flex-1 z-0" />
    </div>
  );
};
