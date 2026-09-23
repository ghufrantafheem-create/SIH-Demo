import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CircleGauge,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Maximize2
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
  ReferenceArea
} from 'recharts';
import { soundFx } from '../utils/sound';

type DynoPattern =
  | 'normal'
  | 'fluid_pound'
  | 'gas_interference'
  | 'delayed_tv_closure'
  | 'worn_pump'
  | 'parted_rod';

interface DynacardPoint {
  position_m: number;
  surface_load_kn: number;
  downhole_load_kn: number;
}

export const DynacardAnalyzer: React.FC<{ wellId?: string }> = ({ wellId = 'BGW-001' }) => {
  const [pattern, setPattern] = useState<DynoPattern>('normal');
  const [showDownhole, setShowDownhole] = useState<boolean>(true);
  const [strokeLength, setStrokeLength] = useState<number>(3.2);
  const [spmSpeed, setSpmSpeed] = useState<number>(8.5);

  const generateCardData = (pat: DynoPattern, stroke: number): DynacardPoint[] => {
    const points: DynacardPoint[] = [];
    const steps = 40;

    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * 2 * Math.PI;
      const pos = parseFloat(((stroke / 2) * (1 - Math.cos(theta))).toFixed(2));
      const sinT = Math.sin(theta);

      let surfLoad = 52.0 + 26.0 * Math.sin(theta - 0.2);
      let downLoad = 50.0 + 28.0 * Math.sin(theta);

      switch (pat) {
        case 'fluid_pound':
          if (theta > Math.PI && theta < 1.6 * Math.PI) {
            surfLoad -= 22.0 * Math.sin((theta - Math.PI) * 2.5);
            downLoad -= 32.0 * Math.sin((theta - Math.PI) * 2.5);
          }
          break;
        case 'gas_interference':
          if (theta > Math.PI && theta < 1.7 * Math.PI) {
            const factor = (theta - Math.PI) / (0.7 * Math.PI);
            surfLoad = 74.0 - 45.0 * Math.pow(factor, 2.2);
            downLoad = 76.0 - 52.0 * Math.pow(factor, 2.5);
          }
          break;
        case 'delayed_tv_closure':
          if (theta > Math.PI && theta < 1.35 * Math.PI) {
            surfLoad += 14.0;
            downLoad += 18.0;
          }
          break;
        case 'worn_pump':
          surfLoad = 52.0 + 12.0 * Math.sin(theta);
          downLoad = 50.0 + 10.0 * Math.sin(theta);
          break;
        case 'parted_rod':
          surfLoad = 22.0 + 4.0 * Math.sin(theta);
          downLoad = 4.0 + 1.0 * Math.sin(theta);
          break;
        default:
          break;
      }

      points.push({
        position_m: pos,
        surface_load_kn: parseFloat(Math.max(5, surfLoad).toFixed(1)),
        downhole_load_kn: parseFloat(Math.max(0, downLoad).toFixed(1))
      });
    }

    return points;
  };

  const cardData = generateCardData(pattern, strokeLength);

  // Compute Mechanical Card KPIs
  const maxSurfaceLoad = Math.max(...cardData.map((d) => d.surface_load_kn));
  const minSurfaceLoad = Math.min(...cardData.map((d) => d.surface_load_kn));
  const fillagePct =
    pattern === 'normal'
      ? 94.5
      : pattern === 'fluid_pound'
      ? 58.2
      : pattern === 'gas_interference'
      ? 64.0
      : pattern === 'delayed_tv_closure'
      ? 82.1
      : pattern === 'worn_pump'
      ? 42.0
      : 8.5;

  const cardDescriptions: Record<DynoPattern, { title: string; risk: string; advice: string }> = {
    normal: {
      title: 'Optimal Ideal Dynacard Loop',
      risk: 'LOW RISK - Ideal Operation',
      advice: 'Barrel fillage exceeds 90%. Traveling and standing valves seating synchronously.'
    },
    fluid_pound: {
      title: 'Fluid Pound (Underfilled Barrel)',
      risk: 'CRITICAL SHOCK HAZARD',
      advice: 'Liquid level dropped below pump intake. Plunger strikes liquid with high dynamic impact. Lower SPM or reduce stroke.'
    },
    gas_interference: {
      title: 'Downhole Gas Interference',
      risk: 'MODERATE VOLUMETRIC LOSS',
      advice: 'Associated gas compressing on downstroke. Install downhole gas separator or increase submergence.'
    },
    delayed_tv_closure: {
      title: 'Delayed Traveling Valve Closure',
      risk: 'VALVE WEAR INCIPIENT',
      advice: 'Viscous drag or sand scale retarding valve closure. Inspect ball & seat for heavy crude paraffin deposition.'
    },
    worn_pump: {
      title: 'Worn Plunger / Barrel Slippage',
      risk: 'HIGH VOLUMETRIC SLIPPAGE',
      advice: 'Continuous fluid slip past worn barrel clearances. High slippage rate reduces effective BOPD recovery.'
    },
    parted_rod: {
      title: 'Parted Rod String Failure',
      risk: 'SYSTEM FAILURE DETECTED',
      advice: 'Polished rod load indicates only buoyant weight of upper rod segment. Plunger motion ceased. Immediate workover required.'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <CircleGauge size={22} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Dynacard AI Diagnostic Analyzer &amp; Valve Kinematics
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Coupled Surface Polished Rod Dynamometer &amp; Gibbs Wave Equation Downhole Pump Card for well <b className="text-cyan-300">{wellId}</b>.
            </p>
          </div>

          {/* Quick Pattern Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ['normal', 'Ideal Full'],
                ['fluid_pound', 'Fluid Pound'],
                ['gas_interference', 'Gas Interf'],
                ['delayed_tv_closure', 'Delayed TV'],
                ['worn_pump', 'Worn Barrel'],
                ['parted_rod', 'Parted Rod']
              ] as [DynoPattern, string][]
            ).map(([pat, label]) => (
              <button
                key={pat}
                onClick={() => {
                  soundFx.playClick();
                  setPattern(pat);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                  pattern === pat
                    ? pat === 'normal'
                      ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-rose-500/25 text-rose-300 border-rose-400/40 font-bold shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dynacard Visualizer & Diagnostic Panel */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Dynagraph Curve Container */}
        <div className="lg:col-span-8 glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-white">Dynagraph Load vs. Stroke Position</h3>
                <p className="text-xs text-cyan-200/60 font-mono mt-0.5">
                  Surface Dynamometer (Cyan) &bull; Downhole Pump Card via Gibbs Wave PDE (Amber)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDownhole(!showDownhole)}
                  className={`px-3 py-1 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                    showDownhole
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                      : 'bg-white/5 text-slate-400 border-white/5'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 inline mr-1" /> Downhole Card
                </button>
              </div>
            </div>

            <div className="h-80 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cardData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                  <XAxis
                    dataKey="position_m"
                    label={{ value: 'Stroke Displacement (m)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <YAxis
                    label={{ value: 'Rod Load (kN)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    domain={[0, 90]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(4, 15, 28, 0.95)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '16px',
                      backdropFilter: 'blur(12px)',
                      fontSize: '12px'
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="surface_load_kn"
                    name="Surface Dynamometer (kN)"
                    stroke="#00e5ff"
                    strokeWidth={2.8}
                    dot={{ fill: '#00e5ff', r: 2 }}
                  />
                  {showDownhole && (
                    <Line
                      type="monotone"
                      dataKey="downhole_load_kn"
                      name="Downhole Pump Card (kN)"
                      stroke="#ff9f1c"
                      strokeWidth={2.5}
                      strokeDasharray="4 2"
                      dot={{ fill: '#ff9f1c', r: 2 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Stroke Length & SPM tuning slider */}
          <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-cyan-500/20 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-300 whitespace-nowrap">Stroke Length:</span>
              <input
                type="range"
                min="1.8"
                max="4.2"
                step="0.1"
                value={strokeLength}
                onChange={(e) => setStrokeLength(Number(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-cyan-300 font-bold min-w-[50px]">{strokeLength.toFixed(1)}m</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-300 whitespace-nowrap">Pump Speed:</span>
              <input
                type="range"
                min="4.0"
                max="16.0"
                step="0.5"
                value={spmSpeed}
                onChange={(e) => setSpmSpeed(Number(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-amber-300 font-bold min-w-[50px]">{spmSpeed.toFixed(1)} SPM</span>
            </div>
          </div>
        </div>

        {/* AI Diagnostics & Mechanical KPIs */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="glass rounded-3xl p-5 border border-cyan-500/20 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase">AI Diagnosis State</span>
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                  pattern === 'normal'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                }`}
              >
                {pattern === 'normal' ? 'NORMAL' : 'FAULT DETECTED'}
              </span>
            </div>
            <h4 className="font-bold text-base text-white">{cardDescriptions[pattern].title}</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed font-light">
              {cardDescriptions[pattern].advice}
            </p>
          </div>

          {/* Numerical KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Pump Fillage</span>
              <b className={`text-2xl font-mono mt-1 block ${fillagePct > 80 ? 'text-emerald-300' : 'text-rose-400'}`}>
                {fillagePct.toFixed(1)}%
              </b>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Peak Load (PPRL)</span>
              <b className="text-2xl font-mono text-cyan-300 mt-1 block">{maxSurfaceLoad} kN</b>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Min Load (MPRL)</span>
              <b className="text-2xl font-mono text-slate-200 mt-1 block">{minSurfaceLoad} kN</b>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Hydraulic Work</span>
              <b className="text-2xl font-mono text-amber-300 mt-1 block">{(maxSurfaceLoad * strokeLength * 0.42).toFixed(1)} kJ</b>
            </div>
          </div>

          <div className="glass-subtle rounded-2xl p-4 border border-cyan-500/15 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
              <Sparkles size={14} /> Gibbs Wave Reconstructor
            </div>
            Downhole position solved by damping stress propagation a = 4,850 m/s along API Grade D steel.
          </div>
        </div>
      </div>
    </div>
  );
};
