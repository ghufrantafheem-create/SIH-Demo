import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Play, Pause, AlertTriangle, ShieldCheck, Sliders, Zap, RotateCcw } from 'lucide-react';
import { soundFx } from '../utils/sound';

interface AnimatedPumpVisualizerProps {
  spm?: number;
  strokeLengthM?: number;
  rodLoadKn?: number;
  pumpEfficiencyPct?: number;
  interactiveMode?: boolean;
}

export const AnimatedPumpVisualizer: React.FC<AnimatedPumpVisualizerProps> = ({
  spm = 8.5,
  strokeLengthM = 3.2,
  rodLoadKn = 64.2,
  pumpEfficiencyPct = 88.5,
  interactiveMode = true
}) => {
  const [isRunning, setIsRunning] = useState(true);
  const [currentSPM, setCurrentSPM] = useState(spm);
  const [currentStroke, setCurrentStroke] = useState(strokeLengthM);
  const [vfdHz, setVfdHz] = useState(42.5);
  const [viscosity, setViscosity] = useState(340);
  const [anomalyMode, setAnomalyMode] = useState<'normal' | 'gas_lock' | 'fluid_pound' | 'rod_floating'>('normal');

  // Surface flow stroke counter
  const [strokeCount, setStrokeCount] = useState(1420);
  const [cumBopd, setCumBopd] = useState(142.5);

  useEffect(() => {
    setCurrentSPM(spm);
    setCurrentStroke(strokeLengthM);
  }, [spm, strokeLengthM]);

  // Stroke cycle duration in seconds: 60 / SPM
  const cycleDuration = Math.max(0.8, 60 / Math.max(1, currentSPM));

  // Sound pulse effect on stroke completion
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      soundFx.playPumpPulse();
      setStrokeCount((prev) => prev + 1);
      setCumBopd((prev) => parseFloat((prev + 0.1).toFixed(1)));
    }, cycleDuration * 1000);

    return () => clearInterval(interval);
  }, [isRunning, cycleDuration]);

  const togglePump = () => {
    soundFx.playClick();
    setIsRunning(!isRunning);
  };

  const resetControls = () => {
    soundFx.playClick();
    setCurrentSPM(spm);
    setCurrentStroke(strokeLengthM);
    setVfdHz(42.5);
    setViscosity(340);
    setAnomalyMode('normal');
  };

  // Calculated Dynagraph points for Load vs Position curve
  const getDynagraphPath = () => {
    if (anomalyMode === 'fluid_pound') {
      // Sudden load drop on downstroke (Fluid Pound)
      return "M 40,110 L 220,110 Q 240,110 240,130 L 160,170 L 40,170 Z";
    }
    if (anomalyMode === 'gas_lock') {
      // Compressed gas loop (Gas Lock)
      return "M 40,130 Q 140,100 240,130 Q 140,160 40,130 Z";
    }
    if (anomalyMode === 'rod_floating') {
      // Delayed valve drop (Rod Floating)
      return "M 40,105 L 240,105 L 240,180 L 100,180 Z";
    }
    // Normal Ideal Dynagraph Card Curve
    return "M 40,100 L 240,100 Q 255,100 255,115 L 255,165 Q 255,180 240,180 L 40,180 Q 25,180 25,165 L 25,115 Z";
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between shadow-2xl">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/30">
            <Activity className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Full-Scale SRP Mechanical Simulator</h3>
            <p className="text-[10px] text-slate-400 font-mono">Interactive Downhole & Dynagraph Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-cyan-300 px-2.5 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20">
            {currentSPM.toFixed(1)} SPM
          </span>
          <button
            onClick={togglePump}
            onMouseEnter={() => soundFx.playHover()}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isRunning
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
            }`}
            title={isRunning ? 'Pause Mechanical Motion' : 'Resume Mechanical Motion'}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Mechanical SVG Visualizer + Live Dynagraph Plotter */}
      <div className="grid lg:grid-cols-12 gap-4 mb-4">
        {/* Left: Interactive Animated SVG Mechanical Diagram */}
        <div className="lg:col-span-7 relative h-72 bg-[#050d18] rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-2">
          <svg viewBox="0 0 400 300" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="oilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0b1e36" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="casingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Subsurface Strata Boundaries */}
            <line x1="0" y1="180" x2="400" y2="180" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="240" x2="400" y2="240" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
            <text x="10" y="195" fill="#475569" fontSize="9" fontFamily="monospace">Surface Boundary</text>
            <text x="10" y="255" fill="#475569" fontSize="9" fontFamily="monospace">Baghewala Reservoir</text>

            {/* Samson Post Frame */}
            <polygon points="120,180 140,90 160,180" fill="url(#casingGrad)" stroke="#475569" strokeWidth="2" />
            <circle cx="140" cy="90" r="5" fill="#00e5ff" />

            {/* Pitman Arm & Crank Assembly */}
            <g>
              <circle cx="80" cy="140" r="22" fill="#0f172a" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="3 3" />
              <motion.line
                x1="80"
                y1="140"
                x2="95"
                y2="125"
                stroke="#ffab00"
                strokeWidth="4"
                strokeLinecap="round"
                animate={isRunning ? { rotate: 360 } : { rotate: 0 }}
                transition={{ repeat: Infinity, duration: cycleDuration, ease: 'linear' }}
                style={{ transformOrigin: '80px 140px' }}
              />
            </g>

            {/* Walking Beam Pivot Animation */}
            <motion.g
              animate={isRunning ? { rotate: [-8, 8, -8] } : { rotate: 0 }}
              transition={{ repeat: Infinity, duration: cycleDuration, ease: 'easeInOut' }}
              style={{ transformOrigin: '140px 90px' }}
            >
              <line x1="50" y1="90" x2="230" y2="90" stroke="#38bdf8" strokeWidth="8" strokeLinecap="round" filter="url(#neonGlow)" />
              <path d="M 230,90 Q 242,95 242,110" stroke="#38bdf8" strokeWidth="6" fill="none" />
            </motion.g>

            {/* Wellhead Casing & Underground Tubing String */}
            <rect x="232" y="140" width="20" height="150" fill="url(#casingGrad)" stroke="#475569" strokeWidth="2" />

            {/* Plunger & Rod Reciprocating Displacement */}
            <motion.g
              animate={isRunning ? { y: [-15 * (currentStroke / 3.2), 15 * (currentStroke / 3.2), -15 * (currentStroke / 3.2)] } : { y: 0 }}
              transition={{ repeat: Infinity, duration: cycleDuration, ease: 'easeInOut' }}
            >
              <line x1="242" y1="110" x2="242" y2="220" stroke="#ffab00" strokeWidth="2.5" />

              {/* Traveling Valve Ball */}
              <circle cx="242" cy="225" r="6" fill={anomalyMode === 'normal' ? '#00e5ff' : '#ef4444'} filter="url(#neonGlow)" />

              {/* Displaced Oil Bubbles */}
              <circle cx="242" cy="200" r="3" fill="#36e0ae" opacity="0.8" />
              <circle cx="242" cy="180" r="4" fill="#36e0ae" opacity="0.6" />
            </motion.g>

            {/* Surface Flow Meter Line */}
            <path d="M 252,150 L 290,150 L 290,165" stroke="#00e5ff" strokeWidth="3" fill="none" strokeDasharray="4 2" />
            <circle cx="290" cy="165" r="4" fill="#ffab00" />
            <text x="298" y="162" fill="#36e0ae" fontSize="10" fontFamily="monospace" fontWeight="bold">
              {cumBopd.toFixed(1)} BOPD
            </text>
          </svg>
        </div>

        {/* Right: Live Real-Time Dynamometer (Dynagraph) Card Plotter */}
        <div className="lg:col-span-5 glass rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-cyan-300 font-bold uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Live Dynagraph Card
              </span>
              <span className="text-[10px] font-mono text-slate-400">Load (kN) vs Position (m)</span>
            </div>

            {/* Dynagraph Plot SVG */}
            <div className="w-full h-44 bg-[#030914] rounded-xl border border-slate-800 relative flex items-center justify-center p-2">
              <svg viewBox="0 0 280 200" className="w-full h-full">
                {/* Grid Lines */}
                <line x1="20" y1="20" x2="20" y2="180" stroke="#1e293b" strokeWidth="1" />
                <line x1="20" y1="180" x2="260" y2="180" stroke="#1e293b" strokeWidth="1" />
                <line x1="20" y1="100" x2="260" y2="100" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />

                {/* Axes Labels */}
                <text x="10" y="15" fill="#64748b" fontSize="8" fontFamily="monospace">60 kN</text>
                <text x="10" y="185" fill="#64748b" fontSize="8" fontFamily="monospace">0 kN</text>
                <text x="245" y="195" fill="#64748b" fontSize="8" fontFamily="monospace">3.2m</text>

                {/* Animated Dynamic Dynagraph Curve */}
                <motion.path
                  d={getDynagraphPath()}
                  fill={
                    anomalyMode === 'normal'
                      ? 'rgba(0, 229, 255, 0.15)'
                      : anomalyMode === 'fluid_pound'
                      ? 'rgba(245, 158, 11, 0.25)'
                      : 'rgba(239, 68, 68, 0.25)'
                  }
                  stroke={
                    anomalyMode === 'normal'
                      ? '#00e5ff'
                      : anomalyMode === 'fluid_pound'
                      ? '#f59e0b'
                      : '#ef4444'
                  }
                  strokeWidth="2.5"
                  animate={isRunning ? { scale: [0.98, 1.02, 0.98] } : { scale: 1 }}
                  transition={{ repeat: Infinity, duration: cycleDuration, ease: 'easeInOut' }}
                  style={{ transformOrigin: '140px 140px' }}
                />
              </svg>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-white/5">
            <span>Peak Rod Load: <b className="text-white">{rodLoadKn} kN</b></span>
            <span>Min Rod Load: <b className="text-white">18.4 kN</b></span>
          </div>
        </div>
      </div>

      {/* Downhole Anomaly Simulation Mode Switcher */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Downhole Anomaly Simulation Diagnostic:
          </span>
          <button
            onClick={resetControls}
            className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            ['normal', 'Normal Operation', ShieldCheck],
            ['gas_lock', 'Gas Lock Failure', AlertTriangle],
            ['fluid_pound', 'Fluid Pound', AlertTriangle],
            ['rod_floating', 'Rod Floating Risk', AlertTriangle]
          ].map(([mode, label, Icon]: any) => (
            <button
              key={mode}
              onClick={() => {
                soundFx.playClick();
                setAnomalyMode(mode);
              }}
              onMouseEnter={() => soundFx.playHover()}
              className={`py-2 px-2.5 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                anomalyMode === mode
                  ? mode === 'normal'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold'
                  : 'bg-white/5 text-slate-400 border border-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Control Sliders */}
      {interactiveMode && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl glass border border-white/10">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-mono text-slate-300">SPM Speed</label>
              <span className="text-[11px] font-mono font-bold text-cyan-300">{currentSPM.toFixed(1)} SPM</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="20.0"
              step="0.5"
              value={currentSPM}
              onChange={(e) => setCurrentSPM(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-mono text-slate-300">Stroke Length</label>
              <span className="text-[11px] font-mono font-bold text-amber-300">{currentStroke.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="6.0"
              step="0.2"
              value={currentStroke}
              onChange={(e) => setCurrentStroke(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-mono text-slate-300">VFD Frequency</label>
              <span className="text-[11px] font-mono font-bold text-purple-300">{vfdHz.toFixed(1)} Hz</span>
            </div>
            <input
              type="range"
              min="20.0"
              max="60.0"
              step="1.0"
              value={vfdHz}
              onChange={(e) => setVfdHz(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-mono text-slate-300">Oil Viscosity</label>
              <span className="text-[11px] font-mono font-bold text-emerald-300">{viscosity} cP</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="25"
              value={viscosity}
              onChange={(e) => setViscosity(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};
