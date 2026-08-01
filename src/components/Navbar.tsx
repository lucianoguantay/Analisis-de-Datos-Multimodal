import React from 'react';
import { Sparkles, RotateCcw, Presentation, UserCheck, Cpu } from 'lucide-react';

export const Navbar: React.FC<NavbarProps> = ({
  audienceMode,
  onAudienceModeChange,
  onReset,
  hasAnalysis,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-black text-white border-b border-purple-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand with Geometric Balance Logo */}
        <div className="flex items-center space-x-3.5 cursor-pointer" onClick={onReset}>
          {/* Ícono rediseñado con fondo morado y sombra fucsia */}
          <div className="w-8 h-8 bg-purple-600 rounded-sm rotate-45 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
            <Sparkles className="w-4 h-4 text-white -rotate-45" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">
                Data Pulperia <span className="text-pink-400"> IA</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">Análisis Multimodal de Datos, Facturas e Investigación</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Audience Mode Switcher - Contenedor súper oscuro con bordes morados */}
          <div className="hidden md:flex items-center bg-zinc-950 p-1 rounded-xl border border-purple-900 text-xs">
            <button
              id="mode-executive-btn"
              onClick={() => onAudienceModeChange('executive')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                audienceMode === 'executive'
                  ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20'
                  : 'text-zinc-400 hover:text-pink-200'
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
                  ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20'
                  : 'text-zinc-400 hover:text-pink-200'
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
                  ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20'
                  : 'text-zinc-400 hover:text-pink-200'
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
              className="flex items-center space-x-1.5 bg-zinc-900 hover:bg-purple-900 text-zinc-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-purple-800 transition-colors"
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