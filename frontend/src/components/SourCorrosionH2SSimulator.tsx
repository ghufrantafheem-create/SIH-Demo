import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Skull,
  ShieldAlert,
  Activity,
  Layers,
  Sparkles,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  Zap
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
  Area
} from 'recharts';
import { soundFx } from '../utils/sound';

export const SourCorrosionH2SSimulator: React.FC<{ wellId?: string }> = ({ wellId = 'BGW-001' }) => {
  const [steamTempC, setSteamTempC] = useState<number>(265);
  const [soakDurationDays, setSoakDurationDays] = useState<number>(18);
  const [cathodicMv, setCathodicMv] = useState<number>(-890); // -850 mV criterion

  // Aquathermolysis kinetic reaction rate increases exponentially above 240°C
  // Organosulfur cleavage releases H2S gas into the casing stream
  const h2sConcentrationPpm = Math.round(
    Math.max(25, 45 * Math.exp(0.028 * (steamTempC - 240)) * (soakDurationDays / 14))
  );

  // De Waard-Milliams corrosion rate (mm/year) along 980m casing string
  const casingCorrosionProfile = [
    { depth_m: 0, temp_c: 40, corrosion_rate_mm_yr: 0.08, wall_remaining_mm: 7.82 },
    { depth_m: 150, temp_c: 55, corrosion_rate_mm_yr: 0.14, wall_remaining_mm: 7.74 },
    { depth_m: 350, temp_c: 82, corrosion_rate_mm_yr: 0.28, wall_remaining_mm: 7.56 },
    { depth_m: 550, temp_c: 120, corrosion_rate_mm_yr: 0.52, wall_remaining_mm: 7.28 },
    { depth_m: 750, temp_c: 180, corrosion_rate_mm_yr: 0.94, wall_remaining_mm: 6.84 },
    { depth_m: 880, temp_c: 240, corrosion_rate_mm_yr: 1.48, wall_remaining_mm: 6.22 },
    { depth_m: 980, temp_c: steamTempC, corrosion_rate_mm_yr: parseFloat((1.85 * (h2sConcentrationPpm / 200)).toFixed(2)), wall_remaining_mm: parseFloat((8.0 - 1.85 * (h2sConcentrationPpm / 200)).toFixed(2)) }
  ];

  const isNaceRisk = h2sConcentrationPpm > 100;
  const isCathodicProtected = cathodicMv <= -850;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-rose-300 uppercase tracking-wider mb-1">
              <Skull size={14} /> Aquathermolysis Chemistry & Sour Gas Metallurgy
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Aquathermolysis H2S & Casing Corrosion Simulator
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                {wellId} · NACE MR0175
              </span>
            </h2>
            <p className="text-xs text-cyan-200/60 font-mono mt-1">
              In-situ hydrothermal sulfur cleavage · De Waard-Milliams electrochemical corrosion & cathodic protection
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundFx.playSuccess();
                setCathodicMv(-920);
                setSteamTempC(245);
              }}
              onMouseEnter={() => soundFx.playHover()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-red-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold hover:bg-rose-500/30 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles size={14} /> Boost Impressed Current (ICCP)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Aquathermolysis H2S Gas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${isNaceRisk ? 'text-rose-400' : 'text-amber-300'}`}>
              {h2sConcentrationPpm}
            </b>
            <span className="text-xs font-mono text-slate-400">PPM (sour)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            NACE sour threshold: 50 PPM
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Max Corrosion Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-amber-300">
              {casingCorrosionProfile[casingCorrosionProfile.length - 1].corrosion_rate_mm_yr}
            </b>
            <span className="text-xs font-mono text-slate-400">mm / year</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Bottom-hole perforated casing
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Cathodic Protection (ICCP)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${isCathodicProtected ? 'text-emerald-400' : 'text-rose-400'}`}>
              {cathodicMv}
            </b>
            <span className="text-xs font-mono text-slate-400">mV (CSE)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            NACE criterion &le; -850 mV
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Sulfide Stress Cracking (SSC)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${isNaceRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isNaceRisk ? 'REGION 3 SOUR' : 'MILD SOUR'}
            </b>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            13Cr-L80 tubing required
          </span>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Corrosion Rate vs Depth (2 Cols) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Activity className="text-rose-400" size={18} /> Casing Wall Loss & Metal Thickness Remaining
            </div>
            <span className="text-[10px] font-mono text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25">
              980m Wellbore Profile
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={casingCorrosionProfile} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
                <XAxis dataKey="depth_m" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} unit="m" />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" mm" domain={[0, 9]} />
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
                  dataKey="wall_remaining_mm"
                  name="Casing Thickness Remaining (mm)"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                />
                <Line
                  type="monotone"
                  dataKey="corrosion_rate_mm_yr"
                  name="Corrosion Rate (mm/yr)"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            * Thermal steam injection accelerates organic sulfur cleavage into H2S. In presence of condensed water and CO2, electrochemical galvanic loss attacks the bottom casing.
          </p>
        </div>

        {/* Temperature & Cathodic Controls (1 Col) */}
        <div className="glass rounded-3xl p-6 border border-cyan-500/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <Thermometer className="text-amber-400" size={18} /> Aquathermolysis Controls
            </div>
            <p className="text-[11px] font-mono text-cyan-200/60 mb-4">
              Simulate steam injection temperature and cathodic rectifier bias.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                  <span>Injected Steam Temp:</span>
                  <span className="text-rose-400 font-bold">{steamTempC}°C</span>
                </div>
                <input
                  type="range"
                  min="220"
                  max="310"
                  step="2"
                  value={steamTempC}
                  onChange={(e) => {
                    soundFx.playClick();
                    setSteamTempC(Number(e.target.value));
                  }}
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                  <span>Cathodic Protection Bias:</span>
                  <span className="text-emerald-400 font-bold">{cathodicMv} mV</span>
                </div>
                <input
                  type="range"
                  min="-1050"
                  max="-700"
                  step="10"
                  value={cathodicMv}
                  onChange={(e) => {
                    soundFx.playClick();
                    setCathodicMv(Number(e.target.value));
                  }}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="glass-subtle rounded-2xl p-3 border border-rose-500/20 text-xs font-mono text-rose-200">
            {isNaceRisk
              ? 'Warning: H2S exceeds 100 PPM. Personnel must equip SCBA breathing apparatus before wellhead sampling.'
              : 'Safe environmental status. Flange seals within NACE compliance.'}
          </div>
        </div>
      </div>
    </div>
  );
};
