import React from 'react';
import { AppSection } from '../types';
import { ArrowLeft, ChevronRight, LayoutDashboard, Sparkles } from 'lucide-react';

interface BreadcrumbHeaderProps {
  currentSection: AppSection;
  onNavigate: (section: AppSection) => void;
  title: string;
  subtitle: string;
  purpose: string;
  badge?: string;
  badgeColor?: string;
  onNextWorkflowStep?: {
    label: string;
    targetSection: AppSection;
  };
}

export const BreadcrumbHeader: React.FC<BreadcrumbHeaderProps> = ({
  currentSection,
  onNavigate,
  title,
  subtitle,
  purpose,
  badge,
  badgeColor = 'bg-cyan-950 text-cyan-300 border-cyan-800',
  onNextWorkflowStep,
}) => {
  if (currentSection === 'COMMAND_CENTER') return null;

  return (
    <div className="bg-slate-900/80 border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-inner">
      {/* Breadcrumb + Titles */}
      <div className="flex flex-col gap-1">
        {/* Breadcrumb trail */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <button
            onClick={() => onNavigate('COMMAND_CENTER')}
            className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </button>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-slate-200 font-semibold">{title}</span>
        </div>

        {/* Page Title, Purpose & Subtitle */}
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
          {badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
              {badge}
            </span>
          )}
          <span className="text-xs text-slate-400 hidden sm:inline">•</span>
          <span className="text-xs font-medium text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
            {purpose}
          </span>
          <span className="text-xs text-slate-400 hidden md:inline">— {subtitle}</span>
        </div>
      </div>

      {/* Action Controls: Back to Command Center & Next Step in Workflow */}
      <div className="flex items-center gap-2">
        {onNextWorkflowStep && (
          <button
            onClick={() => onNavigate(onNextWorkflowStep.targetSection)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 transition-all"
          >
            <span>{onNextWorkflowStep.label}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => onNavigate('COMMAND_CENTER')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
          <span>Back to Command Center</span>
        </button>
      </div>
    </div>
  );
};
