import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Activity,
  Layers,
  Sparkles,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Filter,
  TrendingDown,
  Volume2
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
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { soundFx } from '../utils/sound';

export const SandControlMonitor: React.FC<{ wellId?: string }> = ({ wellId = 'BGW-001' }) => {
  const [drawdownBar, setDrawdownBar] = useState<number>(24);
  const [linerSlotWidthMicrons, setLinerSlotWidthMicrons] = useState<number>(180);
  const [fluidViscosityCp, setFluidViscosityCp] = useState<number>(1200);

  // Sand rate calculation (Jodhpur sandstone unconsolidated detachment under drawdown)
  // Higher drawdown and lower viscosity increase shear velocity and sand drag
  const sandRatePpm = Math.max(
    15,
    Math.round((drawdownBar * 18.5 * Math.sqrt(2000 / fluidViscosityCp)) / (linerSlotWidthMicrons / 150))
  );

  // Sieve Size Distribution (Jodhpur Sandstone Grain Curve)
  const sieveData = [
    { grain_um: 75, mass_pct: 8 },
    { grain_um: 125, mass_pct: 18 },
    { grain_um: 180, mass_pct: 34 }, // D50 around 180-200 um
    { grain_um: 250, mass_pct: 26 },
    { grain_um: 350, mass_pct: 10 },
    { grain_um: 500, mass_pct: 4 }
  ];

  // 14-Day Cumulative Sand Production & Liner Erosion History
  const historyData = Array.from({ length: 14 }, (_, i) => {
    const day = i + 1;
    const basePpm = sandRatePpm * (0.85 + 0.3 * Math.sin(day * 0.7));
    const erosionRateUmDay = (basePpm * 0.08).toFixed(2);
    const cumulativeSandKg = Math.round(day * basePpm * 0.65);
    return {
      day: `Day ${day}`,
      sand_ppm: Math.round(basePpm),
      erosion_um_day: parseFloat(erosionRateUmDay),
      cumulative_kg: cumulativeSandKg
    };
  });

  const remainingLinerThicknessMm = parseFloat((6.5 - (sandRatePpm * 0.0035)).toFixed(2));
  const isHighRisk = sandRatePpm > 450 || remainingLinerThicknessMm < 5.0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 uppercase tracking-wider mb-1">
              <ShieldAlert size={14} /> Unconsolidated Sandstone Geomechanics & Sand Control
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Reservoir Sand Influx & Liner Erosion Monitor
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                {wellId} · API 14L
              </span>
            </h2>
            <p className="text-xs text-cyan-200/60 font-mono mt-1">
              Jodhpur Sandstone grain detachment · Acoustic sand detector telemetry & downhole slotted liner wear
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundFx.playSuccess();
                setDrawdownBar(14);
              }}
              onMouseEnter={() => soundFx.playHover()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-sky-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles size={14} /> Auto-Choke Drawdown
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Current Sand Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${isHighRisk ? 'text-rose-400' : 'text-amber-300'}`}>
              {sandRatePpm}
            </b>
            <span className="text-xs font-mono text-slate-400">PPM (w/w)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Threshold limit: 300 PPM
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Remaining Liner Wall</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-cyan-300">{remainingLinerThicknessMm}</b>
            <span className="text-xs font-mono text-slate-400">mm / 6.5 mm</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Erosion: -{((1 - remainingLinerThicknessMm / 6.5) * 100).toFixed(1)}%
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Downhole Pump Plunger Risk</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${isHighRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isHighRisk ? 'HIGH SCORING' : 'NOMINAL'}
            </b>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">Barrel clearance 0.003"</span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Acoustic Sensor Ping</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-purple-300">{(sandRatePpm * 1.84).toFixed(0)}</b>
            <span className="text-xs font-mono text-slate-400">Hits/sec</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">Clamp-on ultrasonic 250kHz</span>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sand Rate History (2 Cols) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Activity className="text-cyan-400" size={18} /> Sand Production & Liner Erosion Over 14 Days
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
              Telemetry Influx History
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" PPM" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#040914',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    borderRadius: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="sand_ppm"
                  name="Sand Concentration (PPM)"
                  stroke="#ff9f1c"
                  fill="#ff9f1c"
                  fillOpacity={0.25}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative_kg"
                  name="Cumulative Sand (kg)"
                  stroke="#00e5ff"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grain Distribution & Controls (1 Col) */}
        <div className="glass rounded-3xl p-6 border border-cyan-500/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <Filter className="text-amber-400" size={18} /> Sand Sieve Distribution
            </div>
            <p className="text-[11px] font-mono text-cyan-200/60 mb-2">
              Jodhpur Sandstone grain size (microns) vs mass fraction %.
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sieveData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
                  <XAxis dataKey="grain_um" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit="µm" />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#040914',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar dataKey="mass_pct" name="Grain %" fill="#00e5ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-3 pt-3 border-t border-cyan-500/15">
            <div>
              <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                <span>Drawdown Delta-P:</span>
                <span className="text-cyan-400 font-bold">{drawdownBar} bar</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="1"
                value={drawdownBar}
                onChange={(e) => {
                  soundFx.playClick();
                  setDrawdownBar(Number(e.target.value));
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                <span>Slotted Liner Aperture:</span>
                <span className="text-amber-400 font-bold">{linerSlotWidthMicrons} µm</span>
              </div>
              <input
                type="range"
                min="100"
                max="300"
                step="10"
                value={linerSlotWidthMicrons}
                onChange={(e) => {
                  soundFx.playClick();
                  setLinerSlotWidthMicrons(Number(e.target.value));
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
