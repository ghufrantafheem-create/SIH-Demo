import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Droplets,
  Activity,
  AlertTriangle,
  Sparkles,
  Sliders,
  CheckCircle2,
  Thermometer,
  RefreshCw,
  Layers
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

export const BoilerWaterTreatmentOTSG: React.FC = () => {
  const [blowdownPct, setBlowdownPct] = useState<number>(20);
  const [feedWaterHardnessPpm, setFeedWaterHardnessPpm] = useState<number>(0.25);
  const [boilerThroughputTpd, setBoilerThroughputTpd] = useState<number>(450);

  // Water chemistry parameters
  const silicaPpm = parseFloat((12.5 * (1 + feedWaterHardnessPpm * 2)).toFixed(1));
  const tdsPpm = Math.round(1800 + feedWaterHardnessPpm * 1200);

  // OTSG Radiant and Convection Section Tube Skin Temperature (°C) along 12 tube pass stations
  const tubePassData = Array.from({ length: 12 }, (_, i) => {
    const station = i + 1;
    // Radiant section (passes 7-12) runs hotter than convection (passes 1-6)
    const baseTemp = station <= 6 ? 240 + station * 12 : 310 + (station - 6) * 14;
    // Scaling thermal resistance increases tube metal skin temperature
    const scaleDelta = (feedWaterHardnessPpm * 18 * (station / 12) * (1 - blowdownPct / 60)).toFixed(1);
    const skinTempC = parseFloat((baseTemp + parseFloat(scaleDelta)).toFixed(1));
    const designLimitC = station <= 6 ? 340 : 420;

    return {
      pass: `Pass ${station}`,
      section: station <= 6 ? 'Convection' : 'Radiant',
      skin_temp_c: skinTempC,
      design_limit_c: designLimitC,
      fouling_resistance: parseFloat((0.0008 * station * (feedWaterHardnessPpm / 0.5)).toFixed(4))
    };
  });

  const maxSkinTemp = Math.max(...tubePassData.map((d) => d.skin_temp_c));
  const isOverheating = maxSkinTemp > 405;
  const daysUntilDecoking = Math.max(12, Math.round(180 - feedWaterHardnessPpm * 250 - (20 - blowdownPct) * 3));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 uppercase tracking-wider mb-1">
              <Flame size={14} /> Thermal Plant Utility & OTSG Water Treatment
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              OTSG Boiler Water & Tube Scaling Monitor
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                OTSG-01 · 50 MMBTU/hr
              </span>
            </h2>
            <p className="text-xs text-cyan-200/60 font-mono mt-1">
              Warm Lime Softener & RO demineralization · Tube skin temperature & fouling heat transfer resistance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundFx.playSuccess();
                setBlowdownPct(25);
                setFeedWaterHardnessPpm(0.1);
              }}
              onMouseEnter={() => soundFx.playHover()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500/30 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles size={14} /> Regenerate Softener Resin
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Total Hardness (CaCO3)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${feedWaterHardnessPpm > 0.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {feedWaterHardnessPpm}
            </b>
            <span className="text-xs font-mono text-slate-400">PPM as CaCO3</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            ASME OTSG spec: &lt; 0.50 PPM
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Max Tube Metal Skin Temp</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${isOverheating ? 'text-rose-400' : 'text-amber-300'}`}>
              {maxSkinTemp}
            </b>
            <span className="text-xs font-mono text-slate-400">°C</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Radiant Pass 12 metal limit: 420°C
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Blowdown Mass Fraction</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-cyan-300">{blowdownPct}%</b>
            <span className="text-xs font-mono text-slate-400">liquid purge</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            {(boilerThroughputTpd * (blowdownPct / 100)).toFixed(0)} TPD blowdown
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Pigging & Decoking Due</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-purple-300">In {daysUntilDecoking}</b>
            <span className="text-xs font-mono text-slate-400">Days</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">Mechanical scraper pig run</span>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tube Skin Temp Profile (2 Cols) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Thermometer className="text-cyan-400" size={18} /> OTSG Coil Tube Skin Temperature vs Design Limit
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
              12 Serpentine Tube Passes
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tubePassData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
                <XAxis dataKey="pass" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} unit="°C" domain={[200, 440]} />
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
                  dataKey="skin_temp_c"
                  name="Measured Tube Skin (°C)"
                  stroke="#ff9f1c"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#ff9f1c' }}
                />
                <Line
                  type="stepAfter"
                  dataKey="design_limit_c"
                  name="Metallurgical Safe Ceiling (°C)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            * Convection passes 1-6 absorb flue gas heat; Radiant passes 7-12 face direct burner flames. High feed hardness creates internal calcium sulfate scale, raising outer skin temperature.
          </p>
        </div>

        {/* Feed Water Chemistry & Sliders (1 Col) */}
        <div className="glass rounded-3xl p-6 border border-cyan-500/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <Droplets className="text-cyan-400" size={18} /> Feed Chemistry Readout
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-slate-400">Total Dissolved Solids:</span>
                <span className="text-white font-bold">{tdsPpm} PPM</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-slate-400">Reactive Silica (SiO2):</span>
                <span className="text-amber-300 font-bold">{silicaPpm} PPM</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-slate-400">Dissolved Oxygen:</span>
                <span className="text-emerald-400 font-bold">&lt; 7 PPB (Deaerated)</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white/5">
                <span className="text-slate-400">Steam Dryness Generated:</span>
                <span className="text-cyan-300 font-bold">78.5% (21.5% Liquid)</span>
              </div>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-3 pt-3 border-t border-cyan-500/15">
            <div>
              <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                <span>Feed Hardness:</span>
                <span className="text-amber-400 font-bold">{feedWaterHardnessPpm} PPM</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.2"
                step="0.05"
                value={feedWaterHardnessPpm}
                onChange={(e) => {
                  soundFx.playClick();
                  setFeedWaterHardnessPpm(Number(e.target.value));
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                <span>Blowdown Fraction:</span>
                <span className="text-cyan-400 font-bold">{blowdownPct}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="30"
                step="1"
                value={blowdownPct}
                onChange={(e) => {
                  soundFx.playClick();
                  setBlowdownPct(Number(e.target.value));
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
