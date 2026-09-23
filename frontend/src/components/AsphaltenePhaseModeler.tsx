import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Thermometer,
  Gauge,
  Droplets,
  AlertTriangle,
  Sparkles,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Flame
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
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { soundFx } from '../utils/sound';

export const AsphaltenePhaseModeler: React.FC<{ wellId?: string }> = ({ wellId = 'BGW-001' }) => {
  const [solventDosePpm, setSolventDosePpm] = useState<number>(45);
  const [washTempC, setWashTempC] = useState<number>(85);
  const [soakTimeDays, setSoakTimeDays] = useState<number>(14);

  // Pressure-Temperature Phase Envelope (De Boer / Flory-Huggins thermodynamic representation)
  const ptEnvelopeData = [
    { temp_c: 20, ape_onset_bar: 52, bubble_pt_bar: 18, wellbore_p_bar: 22 },
    { temp_c: 40, ape_onset_bar: 58, bubble_pt_bar: 22, wellbore_p_bar: 30 },
    { temp_c: 60, ape_onset_bar: 64, bubble_pt_bar: 28, wellbore_p_bar: 40 },
    { temp_c: 75, ape_onset_bar: 68, bubble_pt_bar: 34, wellbore_p_bar: 48 },
    { temp_c: 90, ape_onset_bar: 70, bubble_pt_bar: 42, wellbore_p_bar: 56 },
    { temp_c: 110, ape_onset_bar: 65, bubble_pt_bar: 55, wellbore_p_bar: 68 },
    { temp_c: 130, ape_onset_bar: 56, bubble_pt_bar: 72, wellbore_p_bar: 82 },
    { temp_c: 150, ape_onset_bar: 44, bubble_pt_bar: 92, wellbore_p_bar: 98 }
  ];

  // Tubing Depth Deposition Profile (0 to 980m depth)
  // Higher deposition occurs in the critical cooling transition zone (depth 350m - 650m)
  const depthProfile = [
    { depth_m: 0, temp_c: 38, pressure_bar: 8, dep_rate_mm: 0.2 },
    { depth_m: 150, temp_c: 44, pressure_bar: 18, dep_rate_mm: 0.6 },
    { depth_m: 300, temp_c: 52, pressure_bar: 29, dep_rate_mm: 1.4 },
    { depth_m: 450, temp_c: 61, pressure_bar: 41, dep_rate_mm: 2.8 },
    { depth_m: 600, temp_c: 72, pressure_bar: 54, dep_rate_mm: 2.1 },
    { depth_m: 750, temp_c: 84, pressure_bar: 68, dep_rate_mm: 0.9 },
    { depth_m: 900, temp_c: 96, pressure_bar: 82, dep_rate_mm: 0.3 },
    { depth_m: 980, temp_c: 104, pressure_bar: 91, dep_rate_mm: 0.1 }
  ].map((row) => {
    // Solvent dosing mitigates deposition rate
    const solventMitigation = Math.max(0.1, 1 - (solventDosePpm / 100) * 0.7);
    const effectiveDepMm = parseFloat((row.dep_rate_mm * solventMitigation).toFixed(2));
    const flowAreaPct = parseFloat((100 * Math.pow((62.0 - effectiveDepMm * 2) / 62.0, 2)).toFixed(1));
    return {
      ...row,
      effectiveDepMm,
      flowAreaPct
    };
  });

  const peakDeposition = Math.max(...depthProfile.map((d) => d.effectiveDepMm));
  const minFlowArea = Math.min(...depthProfile.map((d) => d.flowAreaPct));
  const isSevere = minFlowArea < 75;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 uppercase tracking-wider mb-1">
              <Layers size={14} /> Thermodynamic Phase-Behavior & Organic Deposition
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Asphaltene & Wax Phase Modeler
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                {wellId} · APE Engine
              </span>
            </h2>
            <p className="text-xs text-cyan-200/60 font-mono mt-1">
              De Boer solid-liquid thermodynamic envelope · 980m tubing constriction & chemical solvent remediation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundFx.playSuccess();
                setSolventDosePpm(75);
                setWashTempC(90);
              }}
              onMouseEnter={() => soundFx.playHover()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500/30 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles size={14} /> Optimize Dispersant
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Max Deposition Thickness</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${isSevere ? 'text-rose-400' : 'text-amber-300'}`}>
              {peakDeposition}
            </b>
            <span className="text-xs font-mono text-slate-400">mm</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">Critical depth ~450 m</span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Tubing Flow Area Intact</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${minFlowArea < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {minFlowArea}%
            </b>
            <span className="text-xs font-mono text-slate-400">of 2-7/8" API</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">Nominal ID: 62.0 mm</span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Solvent Dosage</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-cyan-300">{solventDosePpm}</b>
            <span className="text-xs font-mono text-slate-400">PPM continuous</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">Aromatic Alkyl-Benzene</span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Next Hot-Oil Flush</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-purple-300">In {Math.max(3, Math.round(28 - peakDeposition * 8))}</b>
            <span className="text-xs font-mono text-slate-400">Days</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">At {washTempC}°C circulation</span>
        </div>
      </div>

      {/* Main Charts & Tubing View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pressure-Temperature Phase Envelope (2 Cols) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Gauge className="text-cyan-400" size={18} /> Asphaltene Precipitation Envelope (APE) vs Wellbore P-T
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
              Thermodynamic De Boer Boundary
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ptEnvelopeData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
                <XAxis
                  dataKey="temp_c"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  unit="°C"
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" bar" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#040914',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    borderRadius: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="ape_onset_bar"
                  name="Asphaltene Onset Pressure (AOP)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f59e0b' }}
                />
                <Line
                  type="monotone"
                  dataKey="bubble_pt_bar"
                  name="Bubble Point Pressure (Pb)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="wellbore_p_bar"
                  name="Current Wellbore Trajectory"
                  stroke="#00e5ff"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#00e5ff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            * The zone between Bubble Point (Pb) and Asphaltene Onset (AOP) denotes supersaturated organic flocculation.
          </p>
        </div>

        {/* Tubing Constriction Depth Profile (1 Col) */}
        <div className="glass rounded-3xl p-6 border border-cyan-500/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <Thermometer className="text-amber-400" size={18} /> Tubing Constriction vs Depth
            </div>
            <p className="text-[11px] font-mono text-cyan-200/60 mb-3">
              Effective ID across 980m depth under {solventDosePpm} PPM chemical inhibition.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  layout="vertical"
                  data={depthProfile}
                  margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
                  <XAxis
                    type="number"
                    domain={[0, 4]}
                    stroke="#64748b"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    unit=" mm"
                  />
                  <YAxis
                    dataKey="depth_m"
                    type="category"
                    stroke="#64748b"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    reversed
                    unit="m"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#040914',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="effectiveDepMm"
                    name="Wall Deposition"
                    stroke="#ff9f1c"
                    fill="#ff9f1c"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-3 pt-3 border-t border-cyan-500/15">
            <div>
              <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                <span>Solvent Dosing:</span>
                <span className="text-cyan-400 font-bold">{solventDosePpm} PPM</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={solventDosePpm}
                onChange={(e) => {
                  soundFx.playClick();
                  setSolventDosePpm(Number(e.target.value));
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                <span>Hot-Oil Temp:</span>
                <span className="text-amber-400 font-bold">{washTempC}°C</span>
              </div>
              <input
                type="range"
                min="60"
                max="120"
                step="2"
                value={washTempC}
                onChange={(e) => {
                  soundFx.playClick();
                  setWashTempC(Number(e.target.value));
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
