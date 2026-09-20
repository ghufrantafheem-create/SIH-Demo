import React from 'react';
import { motion } from 'framer-motion';
import { Factory, Flame, Thermometer, Gauge } from 'lucide-react';

interface SteamInjectionVisualizerProps {
  steamVolumeT?: number;
  injectionPressureBar?: number;
  soakHours?: number;
  expectedSor?: number;
}

export const SteamInjectionVisualizer: React.FC<SteamInjectionVisualizerProps> = ({
  steamVolumeT = 1250,
  injectionPressureBar = 85.0,
  soakHours = 120,
  expectedSor = 2.15
}) => {
  return (
    <div className="glass rounded-3xl p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">CSS Thermal Steam Simulator</h3>
            <p className="text-[10px] text-slate-400 font-mono">Cyclic Steam Stimulation & Soak Diffusion</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-amber-300 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
          <Factory className="w-3 h-3" /> Steam Phase Active
        </span>
      </div>

      {/* SVG Steam Plume Diagram */}
      <div className="relative w-full h-60 bg-[#0c0805] rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-2">
        <svg viewBox="0 0 400 280" className="w-full h-full max-h-56">
          <defs>
            <radialGradient id="steamHeatGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffab00" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#ff6d00" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#120d07" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>

          {/* Steam Boiler Surface Plant */}
          <rect x="50" y="30" width="80" height="40" rx="6" fill="#1e293b" stroke="#ffab00" strokeWidth="1.5" />
          <text x="60" y="55" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">Steam Boiler</text>

          {/* Steam Flow Pipe */}
          <path d="M 130,50 L 200,50 L 200,100" stroke="#ffab00" strokeWidth="4" fill="none" strokeDasharray="6 3" />

          {/* Underground Wellbore Casing Pipe */}
          <rect x="192" y="100" width="16" height="150" fill="url(#pipeGrad)" stroke="#475569" strokeWidth="1.5" />

          {/* Reservoir Thermal Plume Heat Radial Expansion */}
          <motion.circle
            cx="200"
            cy="210"
            r="55"
            fill="url(#steamHeatGrad)"
            animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.6, 0.95, 0.6] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="200"
            cy="210"
            r="80"
            fill="url(#steamHeatGrad)"
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.5 }}
          />

          {/* Steam Bubble Plumes Diffusing Upwards */}
          <g className="animate-steam">
            <circle cx="195" cy="200" r="8" fill="#ffffff" opacity="0.6" />
            <circle cx="205" cy="190" r="10" fill="#ffab00" opacity="0.5" />
            <circle cx="200" cy="175" r="12" fill="#ff6d00" opacity="0.4" />
          </g>

          {/* Perforation Ports */}
          <circle cx="190" cy="210" r="3" fill="#ffab00" />
          <circle cx="210" cy="210" r="3" fill="#ffab00" />
          <circle cx="190" cy="225" r="3" fill="#ffab00" />
          <circle cx="210" cy="225" r="3" fill="#ffab00" />

          {/* Reservoir Labels */}
          <text x="260" y="215" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">Heavy-Oil Viscosity Reduction Zone</text>
        </svg>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/10 text-center font-mono text-xs">
        <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
          <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
            <Factory className="w-3 h-3 text-amber-400" /> Steam Vol
          </span>
          <b className="text-amber-300">{steamVolumeT} t</b>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
          <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
            <Gauge className="w-3 h-3 text-cyan-400" /> Pressure
          </span>
          <b className="text-cyan-300">{injectionPressureBar} bar</b>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
          <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
            <Thermometer className="w-3 h-3 text-orange-400" /> Soak
          </span>
          <b className="text-orange-300">{soakHours} hr</b>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
          <span className="text-[10px] text-slate-400 block">SOR Ratio</span>
          <b className="text-emerald-300">{expectedSor}</b>
        </div>
      </div>
    </div>
  );
};
