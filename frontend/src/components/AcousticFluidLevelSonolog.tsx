import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2,
  Radio,
  Layers,
  Sparkles,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowDownCircle,
  Play
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ReferenceDot
} from 'recharts';
import { soundFx } from '../utils/sound';

export const AcousticFluidLevelSonolog: React.FC<{ wellId?: string }> = ({ wellId = 'BGW-001' }) => {
  const [casingPressureBar, setCasingPressureBar] = useState<number>(4.2);
  const [fluidLevelDepthM, setFluidLevelDepthM] = useState<number>(640);
  const [shotFired, setShotFired] = useState<boolean>(false);

  // Pump Seating Nipple Depth
  const pumpDepthM = 980;
  // Submergence above pump
  const submergenceM = pumpDepthM - fluidLevelDepthM;
  // Crude hydrostatic gradient (Heavy oil ~0.94 SG => 0.092 bar/m)
  const crudeGradientBarM = 0.092;
  const pumpIntakePressureBar = parseFloat(
    (casingPressureBar + submergenceM * crudeGradientBarM).toFixed(2)
  );

  // Generate acoustic reflection waveform (Collar pings every ~10 meters, huge peak at fluid level)
  const acousticWaveform = Array.from({ length: 100 }, (_, i) => {
    const depth = i * 10;
    // Acoustic wave damping with depth
    const damping = Math.exp(-depth / 800);
    // Tubing collar periodic reflection spikes
    let amplitude = Math.sin((depth / 10) * Math.PI) * 0.18 * damping;

    // Big echo peak at fluid level
    if (Math.abs(depth - fluidLevelDepthM) < 20) {
      amplitude = 1.0 * (1 - Math.abs(depth - fluidLevelDepthM) / 20) * damping * 2.2;
    }

    // Pump seating echo at 980m
    if (depth >= 960) {
      amplitude = 0.5 * damping;
    }

    return {
      depth_m: depth,
      signal_mv: parseFloat((amplitude * 100).toFixed(1)),
      is_fluid: Math.abs(depth - fluidLevelDepthM) < 10
    };
  });

  const fireAcousticShot = () => {
    soundFx.playClick();
    setShotFired(true);
    setTimeout(() => {
      soundFx.playSuccess();
      setShotFired(false);
    }, 1200);
  };

  const isLowSubmergence = submergenceM < 150;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1">
              <Volume2 size={14} /> Acoustic Echo-Sounding & Bottomhole Thermodynamics
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Acoustic Fluid Level & Sonolog Analyzer
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                {wellId} · Sonolog 5000
              </span>
            </h2>
            <p className="text-xs text-cyan-200/60 font-mono mt-1">
              Nitrogen gas gun acoustic pulse · Casing collar count depth calibration & Pump Intake Pressure (PIP)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fireAcousticShot}
              disabled={shotFired}
              onMouseEnter={() => soundFx.playHover()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 text-xs font-mono font-bold hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play size={14} /> {shotFired ? 'Recording Echo...' : 'Fire N2 Acoustic Gun'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Distance to Liquid Top</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-cyan-300">{fluidLevelDepthM}</b>
            <span className="text-xs font-mono text-slate-400">meters RKB</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Travel time ~{(fluidLevelDepthM * 2 / 340).toFixed(2)} sec roundtrip
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Pump Submergence Column</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${isLowSubmergence ? 'text-rose-400' : 'text-emerald-400'}`}>
              {submergenceM}
            </b>
            <span className="text-xs font-mono text-slate-400">m above intake</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Pump depth: 980 m
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Pump Intake Pressure (PIP)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-amber-300">{pumpIntakePressureBar}</b>
            <span className="text-xs font-mono text-slate-400">bar</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Includes {casingPressureBar} bar annulus gas
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Gas Cavitation Risk</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${isLowSubmergence ? 'text-rose-400' : 'text-cyan-300'}`}>
              {isLowSubmergence ? 'PUMP FLUID POUND' : 'SAFE HEAD (>15 bar)'}
            </b>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Volumetric fillage: {Math.min(100, Math.round(50 + submergenceM * 0.14))}%
          </span>
        </div>
      </div>

      {/* Acoustic Waveform & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waveform Chart (2 Cols) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Activity className="text-cyan-400" size={18} /> Acoustic Trace & Tubing Collar Count
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
              10-Meter Collar Joint Resolution
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={acousticWaveform} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
                <XAxis dataKey="depth_m" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} unit="m" />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" mV" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#040914',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    borderRadius: '12px'
                  }}
                />
                <ReferenceLine x={fluidLevelDepthM} stroke="#ff9f1c" strokeWidth={2} strokeDasharray="3 3" label={{ value: `Liquid Interface: ${fluidLevelDepthM}m`, fill: '#ff9f1c', fontSize: 10, position: 'top' }} />
                <ReferenceLine x={pumpDepthM} stroke="#10b981" strokeWidth={2} label={{ value: 'Pump Seating: 980m', fill: '#10b981', fontSize: 10, position: 'top' }} />
                <Line
                  type="monotone"
                  dataKey="signal_mv"
                  name="Acoustic Signal (mV)"
                  stroke="#00e5ff"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            * Each periodic minor notch represents an API 2-7/8" external upset tubing collar (EUE). The prominent peak at {fluidLevelDepthM}m marks the liquid acoustic impedance mismatch.
          </p>
        </div>

        {/* Sliders & Wellbore Column Diagram */}
        <div className="glass rounded-3xl p-6 border border-cyan-500/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <Sliders className="text-amber-400" size={18} /> Telemetry Adjustment
            </div>
            <p className="text-[11px] font-mono text-cyan-200/60 mb-4">
              Simulate reservoir drawdown and casinghead gas pressure.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                  <span>Fluid Level Depth:</span>
                  <span className="text-amber-400 font-bold">{fluidLevelDepthM} m</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="920"
                  step="10"
                  value={fluidLevelDepthM}
                  onChange={(e) => {
                    soundFx.playClick();
                    setFluidLevelDepthM(Number(e.target.value));
                  }}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                  <span>Casinghead Pressure:</span>
                  <span className="text-cyan-400 font-bold">{casingPressureBar} bar</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="12.0"
                  step="0.5"
                  value={casingPressureBar}
                  onChange={(e) => {
                    soundFx.playClick();
                    setCasingPressureBar(Number(e.target.value));
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Wellbore Column Graphic */}
          <div className="glass-subtle rounded-2xl p-4 border border-cyan-500/20 space-y-2">
            <span className="text-[10px] font-mono text-cyan-300 font-bold block uppercase">
              Annulus Liquid Stacking
            </span>
            <div className="h-8 rounded-lg bg-slate-900 border border-slate-700 flex overflow-hidden">
              <div
                style={{ width: `${(fluidLevelDepthM / 980) * 100}%` }}
                className="bg-amber-500/20 border-r border-amber-400 flex items-center justify-center text-[9px] font-mono text-amber-200 truncate px-1"
              >
                Gas Cap ({fluidLevelDepthM}m)
              </div>
              <div
                style={{ width: `${(submergenceM / 980) * 100}%` }}
                className="bg-cyan-500/40 flex items-center justify-center text-[9px] font-mono text-cyan-100 truncate px-1 font-bold"
              >
                Liquid Column ({submergenceM}m)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
