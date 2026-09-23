import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Play, Pause, AlertTriangle, ShieldCheck, Zap, RotateCcw, Cpu, Gauge, Droplets, Compass } from 'lucide-react';
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

  // Surface flow stroke counter and cumulative output
  const [strokeCount, setStrokeCount] = useState(1420);
  const [cumBopd, setCumBopd] = useState(142.5);
  const [cyclePhase, setCyclePhase] = useState(0);

  useEffect(() => {
    setCurrentSPM(spm);
    setCurrentStroke(strokeLengthM);
  }, [spm, strokeLengthM]);

  // Stroke cycle duration in seconds: 60 / SPM
  const cycleDuration = Math.max(0.6, 60 / Math.max(1, currentSPM));

  // Sound pulse effect & real-time telemetry increment
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      soundFx.playPumpPulse();
      setStrokeCount((prev) => prev + 1);
      setCumBopd((prev) => parseFloat((prev + 0.1).toFixed(1)));
    }, cycleDuration * 1000);

    return () => clearInterval(interval);
  }, [isRunning, cycleDuration]);

  // Real-time animation phase tracer for live dynacard dot
  useEffect(() => {
    if (!isRunning) return;
    let animId: number;
    let startTime = performance.now();

    const updatePhase = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = (elapsed % cycleDuration) / cycleDuration;
      setCyclePhase(progress);
      animId = requestAnimationFrame(updatePhase);
    };

    animId = requestAnimationFrame(updatePhase);
    return () => cancelAnimationFrame(animId);
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
      return "M 40,110 L 220,110 Q 240,110 240,130 L 160,170 L 40,170 Z";
    }
    if (anomalyMode === 'gas_lock') {
      return "M 40,130 Q 140,95 240,130 Q 140,165 40,130 Z";
    }
    if (anomalyMode === 'rod_floating') {
      return "M 40,105 L 240,105 L 240,180 L 100,180 Z";
    }
    // Normal Ideal Dynagraph Card Curve
    return "M 40,100 L 240,100 Q 255,100 255,115 L 255,165 Q 255,180 240,180 L 40,180 Q 25,180 25,165 L 25,115 Z";
  };

  // Tracer dot position calculation along normalized 0..1 phase
  const getTracerCoord = () => {
    // Top stroke: 0 to 0.5 (left to right), Down stroke: 0.5 to 1.0 (right to left)
    const p = cyclePhase;
    let x = 40 + (p < 0.5 ? p * 2 * 200 : (1 - (p - 0.5) * 2) * 200);
    let y = p < 0.5 ? 100 : 180;
    if (anomalyMode === 'gas_lock') {
      y = p < 0.5 ? 100 + Math.sin(p * Math.PI * 2) * 15 : 160 - Math.sin((p - 0.5) * Math.PI * 2) * 15;
    }
    return { x, y };
  };

  const tracer = getTracerCoord();

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl border border-white/10 backdrop-blur-2xl">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-400/15 border border-cyan-400/30 shadow-[0_0_15px_rgba(0,229,255,0.25)]">
            <Activity className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white tracking-wide">SRP Real-Time Kinematic Simulator</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                LIVE PHYSICS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Continuous Mechanical &amp; Downhole Valve Kinematics</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono text-cyan-300 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 shadow-[0_0_10px_rgba(0,229,255,0.15)]">
            {currentSPM.toFixed(1)} SPM
          </span>
          <button
            onClick={togglePump}
            onMouseEnter={() => soundFx.playHover()}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isRunning
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:bg-amber-500/30'
            }`}
            title={isRunning ? 'Pause Mechanical Motion' : 'Resume Mechanical Motion'}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" /> RUNNING
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> PAUSED
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Mechanical SVG Visualizer + Live Dynagraph Plotter */}
      <div className="grid lg:grid-cols-12 gap-4 mb-4">
        {/* Left: Interactive Animated SVG Mechanical Diagram */}
        <div className="lg:col-span-7 relative h-80 bg-gradient-to-b from-[#061120] to-[#02060d] rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center p-3 shadow-inner">
          {/* Strata background grid */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <svg viewBox="0 0 400 300" className="w-full h-full overflow-visible relative z-10">
            <defs>
              <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#00e5ff" />
              </linearGradient>
              <linearGradient id="casingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="oilStream" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#00e5ff" />
              </linearGradient>
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Subsurface Strata Layers */}
            <rect x="0" y="175" width="400" height="125" fill="#091424" opacity="0.6" />
            <line x1="0" y1="175" x2="400" y2="175" stroke="rgba(0,229,255,0.3)" strokeWidth="1.5" strokeDasharray="5 3" />
            <line x1="0" y1="240" x2="400" y2="240" stroke="rgba(255,171,0,0.3)" strokeWidth="1" strokeDasharray="4 4" />
            
            <text x="12" y="192" fill="#64748b" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">SURFACE GRADE · 0.0m</text>
            <text x="12" y="256" fill="#f59e0b" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">BAGHEWALA FORMATION · 980m</text>

            {/* Samson Post Frame (Rig Structure) */}
            <polygon points="115,175 140,88 165,175" fill="url(#casingGrad)" stroke="#64748b" strokeWidth="2" />
            <circle cx="140" cy="88" r="6" fill="#00e5ff" stroke="#ffffff" strokeWidth="1.5" filter="url(#neonGlow)" />

            {/* Counterweight & Crank Assembly */}
            <g>
              <circle cx="75" cy="140" r="24" fill="#0b1728" stroke="rgba(0,229,255,0.5)" strokeWidth="1.5" strokeDasharray="4 2" />
              <motion.g
                animate={isRunning ? { rotate: 360 } : { rotate: 0 }}
                transition={{ repeat: Infinity, duration: cycleDuration, ease: 'linear' }}
                style={{ transformOrigin: '75px 140px' }}
              >
                <circle cx="75" cy="120" r="10" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                <line x1="75" y1="140" x2="75" y2="120" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
              </motion.g>
            </g>

            {/* Pitman Arm connecting Crank to Beam Tail */}
            <line x1="75" y1="120" x2="52" y2="88" stroke="#94a3b8" strokeWidth="3" strokeDasharray="3 2" opacity="0.6" />

            {/* Walking Beam Pivot & Horsehead Assembly */}
            <motion.g
              animate={isRunning ? { rotate: [-8.5, 8.5, -8.5] } : { rotate: 0 }}
              transition={{ repeat: Infinity, duration: cycleDuration, ease: 'easeInOut' }}
              style={{ transformOrigin: '140px 88px' }}
            >
              {/* Walking Beam Steel I-Beam */}
              <line x1="45" y1="88" x2="235" y2="88" stroke="url(#beamGrad)" strokeWidth="9" strokeLinecap="round" filter="url(#neonGlow)" />
              
              {/* Horsehead Arc Front */}
              <path d="M 235,88 Q 250,96 250,118" stroke="#38bdf8" strokeWidth="7" fill="none" strokeLinecap="round" />
              <circle cx="235" cy="88" r="4" fill="#ffffff" />
            </motion.g>

            {/* Wellhead Christmas Tree & Surface Casing String */}
            <rect x="238" y="145" width="24" height="150" fill="url(#casingGrad)" stroke="#475569" strokeWidth="2" rx="2" />
            <rect x="232" y="142" width="36" height="8" fill="#334155" stroke="#64748b" strokeWidth="1" rx="2" />

            {/* Surface Discharge Flowline */}
            <path d="M 262,154 L 305,154 L 305,170" stroke="#00e5ff" strokeWidth="3.5" fill="none" strokeDasharray="5 3" />
            <circle cx="305" cy="170" r="4" fill="#ffab00" filter="url(#neonGlow)" />
            
            {/* Reciprocating Polished Rod & Downhole Plunger String */}
            <motion.g
              animate={isRunning ? { y: [-18 * (currentStroke / 3.2), 18 * (currentStroke / 3.2), -18 * (currentStroke / 3.2)] } : { y: 0 }}
              transition={{ repeat: Infinity, duration: cycleDuration, ease: 'easeInOut' }}
            >
              {/* Polished Sucker Rod */}
              <line x1="250" y1="118" x2="250" y2="230" stroke="#ffab00" strokeWidth="3" strokeLinecap="round" filter="url(#neonGlow)" />

              {/* Subsurface Traveling Valve & Plunger */}
              <rect x="242" y="230" width="16" height="24" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" rx="3" />
              <circle cx="250" cy="242" r="4" fill={anomalyMode === 'normal' ? '#00e5ff' : '#ef4444'} />

              {/* Displaced Heavy Oil Rising Droplets */}
              <motion.circle cx="250" cy="210" r="3.5" fill="#38bdf8" opacity="0.9" />
              <motion.circle cx="250" cy="190" r="4" fill="#00e5ff" opacity="0.75" />
              <motion.circle cx="250" cy="170" r="3" fill="#a855f7" opacity="0.8" />
            </motion.g>

            {/* Live Telemetry Overlay Text in Canvas */}
            <g className="font-mono">
              <rect x="280" y="20" width="110" height="38" rx="8" fill="rgba(6, 17, 31, 0.85)" stroke="rgba(0, 229, 255, 0.3)" />
              <text x="290" y="36" fill="#94a3b8" fontSize="8" fontWeight="bold">FLOW RATE</text>
              <text x="290" y="50" fill="#00e5ff" fontSize="12" fontWeight="bold">{cumBopd.toFixed(1)} BOPD</text>
            </g>
          </svg>
        </div>

        {/* Right: Live Real-Time Dynamometer (Dynagraph) Card Plotter */}
        <div className="lg:col-span-5 glass rounded-2xl p-4 border border-white/10 flex flex-col justify-between backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono text-cyan-300 font-bold uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Live Dynagraph Card
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">
                Load vs Position
              </span>
            </div>

            {/* Dynagraph Plot SVG */}
            <div className="w-full h-48 bg-[#030812] rounded-xl border border-white/10 relative flex items-center justify-center p-2 shadow-inner">
              <svg viewBox="0 0 280 200" className="w-full h-full">
                <defs>
                  <filter id="tracerGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Grid Lines */}
                <line x1="25" y1="20" x2="25" y2="180" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="25" y1="180" x2="265" y2="180" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="25" y1="100" x2="265" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="145" y1="20" x2="145" y2="180" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />

                {/* Axes Labels */}
                <text x="8" y="24" fill="#64748b" fontSize="8" fontFamily="JetBrains Mono">{rodLoadKn}kN</text>
                <text x="14" y="184" fill="#64748b" fontSize="8" fontFamily="JetBrains Mono">0kN</text>
                <text x="245" y="195" fill="#64748b" fontSize="8" fontFamily="JetBrains Mono">{currentStroke.toFixed(1)}m</text>

                {/* Dynagraph Loop Shape */}
                <path
                  d={getDynagraphPath()}
                  fill={
                    anomalyMode === 'normal'
                      ? 'rgba(0, 229, 255, 0.12)'
                      : anomalyMode === 'fluid_pound'
                      ? 'rgba(245, 158, 11, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)'
                  }
                  stroke={
                    anomalyMode === 'normal'
                      ? '#00e5ff'
                      : anomalyMode === 'fluid_pound'
                      ? '#f59e0b'
                      : '#ef4444'
                  }
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Real-Time Live Dynagraph Tracer Head Indicator */}
                {isRunning && (
                  <circle
                    cx={tracer.x}
                    cy={tracer.y}
                    r="5"
                    fill="#ffffff"
                    stroke="#00e5ff"
                    strokeWidth="2"
                    filter="url(#tracerGlow)"
                  />
                )}
              </svg>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-300 pt-2 border-t border-white/10">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Peak Load: <b className="text-white">{rodLoadKn} kN</b>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Efficiency: <b className="text-emerald-300">{pumpEfficiencyPct}%</b>
            </span>
          </div>
        </div>
      </div>

      {/* Downhole Anomaly Simulation Mode Switcher */}
      <div className="p-4 rounded-2xl glass-subtle border border-white/10 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-slate-200 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Real-Time Downhole Condition Simulator:
          </span>
          <button
            onClick={resetControls}
            className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset Nominal
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            ['normal', 'Normal Operation', ShieldCheck],
            ['gas_lock', 'Gas Lock Risk', AlertTriangle],
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
              className={`py-2 px-3 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                anomalyMode === mode
                  ? mode === 'normal'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-amber-500/25 text-amber-300 border border-amber-400/50 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-white/5 text-slate-400 border border-white/5 hover:text-white hover:bg-white/10'
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
              <label className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-cyan-400" /> SPM Speed
              </label>
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
              <label className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" /> Stroke Length
              </label>
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
              <label className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-purple-400" /> VFD Frequency
              </label>
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
              <label className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                <Droplets className="w-3 h-3 text-emerald-400" /> Oil Viscosity
              </label>
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
