import React from 'react';
import { Sparkles, FileText, BarChart3, RotateCcw, Presentation, UserCheck, Cpu } from 'lucide-react';
import { AudienceMode } from '../types';

interface NavbarProps {
  audienceMode: AudienceMode;
  onAudienceModeChange: (mode: AudienceMode) => void;
  onReset: () => void;
  hasAnalysis: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  audienceMode,
  onAudienceModeChange,
  onReset,
  hasAnalysis,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand with Geometric Balance Logo */}
        <div className="flex items-center space-x-3.5 cursor-pointer" onClick={onReset}>
          <div className="w-8 h-8 bg-indigo-500 rounded-sm rotate-45 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-4 h-4 text-white -rotate-45" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">
                DataLens <span className="text-indigo-400">AI</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Geometric Balance
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Análisis Multimodal de Datos, Facturas e Investigación</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Audience Mode Switcher */}
          <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              id="mode-executive-btn"
              onClick={() => onAudienceModeChange('executive')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                audienceMode === 'executive'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Para Presentaciones y Reportes a Ejecutivos"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Ejecutivo</span>
            </button>
            <button
              id="mode-public-btn"
              onClick={() => onAudienceModeChange('general_public')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                audienceMode === 'general_public'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Explicación Sencilla para Todo Público"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Público General</span>
            </button>
            <button
              id="mode-technical-btn"
              onClick={() => onAudienceModeChange('technical')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                audienceMode === 'technical'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Detalle Técnico e Investigación"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Técnico</span>
            </button>
          </div>

          {hasAnalysis && (
            <button
              id="new-analysis-btn"
              onClick={onReset}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nuevo Análisis</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
