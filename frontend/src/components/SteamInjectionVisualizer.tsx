import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Factory, Flame, Thermometer, Gauge, Play, Pause, RefreshCw, Zap } from 'lucide-react';
import { soundFx } from '../utils/sound';

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
  const [isSimulating, setIsSimulating] = useState(true);
  const [phase, setPhase] = useState<'injection' | 'soaking' | 'production'>('injection');
  const [simTemp, setSimTemp] = useState(245.0);

  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setSimTemp((prev) => {
        const delta = (Math.random() - 0.48) * 1.5;
        return parseFloat((prev + delta).toFixed(1));
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const toggleSim = () => {
    soundFx.playClick();
    setIsSimulating(!isSimulating);
  };

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10 backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 shadow-[0_0_15px_rgba(255,171,0,0.25)]">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white tracking-wide">CSS Thermal Diffusion Simulator</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                REAL-TIME CFD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Cyclic Steam Stimulation &amp; Thermal Soak Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-amber-300 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,171,0,0.15)]">
            <Factory className="w-3.5 h-3.5" /> Steam Injection Active
          </span>
          <button
            onClick={toggleSim}
            onMouseEnter={() => soundFx.playHover()}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              isSimulating
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={isSimulating ? 'Pause Thermal CFD' : 'Resume Thermal CFD'}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* SVG Steam Plume Diagram with Real-Time Thermal Gradient */}
      <div className="relative w-full h-64 bg-gradient-to-b from-[#140b05] via-[#090503] to-[#040201] rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center p-3 shadow-inner">
        {/* Background Heat Grid */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffab00_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />

        <svg viewBox="0 0 400 280" className="w-full h-full max-h-60 overflow-visible relative z-10">
          <defs>
            <radialGradient id="steamHeatGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#ffab00" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#ff4500" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1a0a00" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="outerHeatGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff6d00" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#ffab00" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1a0a00" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <filter id="thermalGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Geological Strata Lines */}
          <line x1="0" y1="90" x2="400" y2="90" stroke="rgba(255,171,0,0.2)" strokeWidth="1" strokeDasharray="6 3" />
          <line x1="0" y1="160" x2="400" y2="160" stroke="rgba(255,171,0,0.2)" strokeWidth="1" strokeDasharray="6 3" />
          <text x="12" y="80" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono">SURFACE STEAM PLANT</text>
          <text x="12" y="178" fill="#f59e0b" fontSize="8" fontFamily="JetBrains Mono">BAGHEWALA HEAVY OIL RESERVOIR</text>

          {/* Steam Boiler Surface Plant */}
          <rect x="40" y="25" width="95" height="42" rx="8" fill="#1e293b" stroke="#ffab00" strokeWidth="1.5" />
          <text x="50" y="44" fill="#ffab00" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">STEAM BOILER</text>
          <text x="50" y="56" fill="#38bdf8" fontSize="8" fontFamily="JetBrains Mono">{simTemp.toFixed(1)} °C</text>

          {/* High-Pressure Steam Flow Pipe */}
          <path d="M 135,46 L 200,46 L 200,90" stroke="#ffab00" strokeWidth="4.5" fill="none" strokeDasharray="8 4" />
          
          {/* Animated Steam Pulse Flowing in Pipe */}
          {isSimulating && (
            <motion.path
              d="M 135,46 L 200,46 L 200,90"
              stroke="#ffffff"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="12 12"
              animate={{ strokeDashoffset: [0, -24] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            />
          )}

          {/* Underground Wellbore Casing Pipe */}
          <rect x="192" y="90" width="16" height="135" fill="url(#pipeGrad)" stroke="#64748b" strokeWidth="1.5" />

          {/* Reservoir Thermal Plume Radial Expansion */}
          <motion.circle
            cx="200"
            cy="205"
            r="85"
            fill="url(#outerHeatGrad)"
            animate={isSimulating ? { scale: [0.92, 1.12, 0.92], opacity: [0.4, 0.75, 0.4] } : { scale: 1, opacity: 0.5 }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          />

          <motion.circle
            cx="200"
            cy="205"
            r="55"
            fill="url(#steamHeatGrad)"
            filter="url(#thermalGlow)"
            animate={isSimulating ? { scale: [0.88, 1.15, 0.88], opacity: [0.7, 1.0, 0.7] } : { scale: 1, opacity: 0.8 }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          />

          {/* Steam Bubble Plumes Diffusing Upwards */}
          <g className="animate-steam">
            <circle cx="195" cy="195" r="7" fill="#ffffff" opacity="0.8" />
            <circle cx="206" cy="182" r="9" fill="#ffab00" opacity="0.65" />
            <circle cx="200" cy="168" r="11" fill="#ff4500" opacity="0.5" />
            <circle cx="194" cy="152" r="8" fill="#ffa726" opacity="0.35" />
          </g>

          {/* Perforation Ports with Steam Jet Glows */}
          <circle cx="190" cy="205" r="3.5" fill="#ffffff" />
          <circle cx="210" cy="205" r="3.5" fill="#ffffff" />
          <circle cx="190" cy="218" r="3.5" fill="#ffffff" />
          <circle cx="210" cy="218" r="3.5" fill="#ffffff" />

          {/* Thermal Viscosity Reduction Zone Callout */}
          <rect x="250" y="195" width="140" height="30" rx="6" fill="rgba(6, 17, 31, 0.85)" stroke="rgba(255, 171, 0, 0.4)" />
          <text x="258" y="208" fill="#ffab00" fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold">VISCOSITY DROP</text>
          <text x="258" y="219" fill="#38bdf8" fontSize="8" fontFamily="JetBrains Mono">340 cP → 28 cP (-91%)</text>
        </svg>
      </div>

      {/* Telemetry Metrics Grid with Glassification */}
      <div className="grid grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-white/10 text-center font-mono text-xs">
        <div className="glass-subtle p-2.5 rounded-xl border border-white/5">
          <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
            <Factory className="w-3 h-3 text-amber-400" /> Steam Vol
          </span>
          <b className="text-amber-300 text-sm mt-0.5 block">{steamVolumeT} t</b>
        </div>
        <div className="glass-subtle p-2.5 rounded-xl border border-white/5">
          <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
            <Gauge className="w-3 h-3 text-cyan-400" /> Pressure
          </span>
          <b className="text-cyan-300 text-sm mt-0.5 block">{injectionPressureBar} bar</b>
        </div>
        <div className="glass-subtle p-2.5 rounded-xl border border-white/5">
          <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
            <Thermometer className="w-3 h-3 text-orange-400" /> Soak
          </span>
          <b className="text-orange-300 text-sm mt-0.5 block">{soakHours} hr</b>
        </div>
        <div className="glass-subtle p-2.5 rounded-xl border border-white/5">
          <span className="text-[10px] text-slate-400 block flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" /> SOR Ratio
          </span>
          <b className="text-emerald-300 text-sm mt-0.5 block">{expectedSor}</b>
        </div>
      </div>
    </div>
  );
};
