import React from 'react';
import { AppSection } from '../types';
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  AlertTriangle,
  GitFork,
  XCircle,
  Layers,
  FlaskConical,
} from 'lucide-react';

interface NavigationProps {
  currentSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  activeAlertsCount: number;
  severeRoadsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentSection,
  onSelectSection,
  activeAlertsCount,
  severeRoadsCount,
}) => {
  const navItems = [
    {
      id: 'COMMAND_CENTER' as AppSection,
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: null,
      subtitle: 'Overview',
    },
    {
      id: 'LIVE_TRAFFIC' as AppSection,
      label: 'Live Traffic',
      icon: Activity,
      badge: severeRoadsCount > 0 ? `${severeRoadsCount} Severe` : null,
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
      subtitle: 'Now',
    },
    {
      id: 'FORECAST' as AppSection,
      label: 'Forecast',
      icon: TrendingUp,
      badge: '+15-60m',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
      subtitle: 'Predictions',
    },
    {
      id: 'INCIDENTS' as AppSection,
      label: 'Incidents',
      icon: AlertTriangle,
      badge: activeAlertsCount > 0 ? `${activeAlertsCount}` : null,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
      subtitle: 'Anomalies',
    },
    {
      id: 'RECOMMENDATIONS' as AppSection,
      label: 'Recommendations',
      icon: GitFork,
      badge: 'Diversion',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      subtitle: 'Decisions',
    },
    {
      id: 'NO_DIVERSION' as AppSection,
      label: 'No-Diversion',
      icon: XCircle,
      badge: 'Special Case',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
      subtitle: 'Saturated Hub',
    },
    {
      id: 'BOTTLENECKS' as AppSection,
      label: 'Bottlenecks',
      icon: Layers,
      badge: 'Historical',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
      subtitle: 'Planning',
    },
    {
      id: 'SIMULATION' as AppSection,
      label: 'Simulation',
      icon: FlaskConical,
      badge: 'Sandbox',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
      subtitle: 'Evaluation',
    },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto shadow-md">
      <div className="flex items-center gap-1.5 min-w-max mx-auto lg:mx-0 w-full justify-start md:justify-between">
        <div className="flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-slate-800 text-white border border-cyan-500/70 shadow-lg shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-500'
                  }`}
                />
                <div className="text-left leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
