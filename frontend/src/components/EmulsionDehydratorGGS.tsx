import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Factory,
  Droplets,
  Activity,
  AlertTriangle,
  Sparkles,
  Sliders,
  CheckCircle2,
  Zap,
  Gauge,
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
  AreaChart,
  Area
} from 'recharts';
import { soundFx } from '../utils/sound';

export const EmulsionDehydratorGGS: React.FC = () => {
  const [demulsifierPpm, setDemulsifierPpm] = useState<number>(65);
  const [treaterTempC, setTreaterTempC] = useState<number>(82);
  const [gridVoltageKv, setGridVoltageKv] = useState<number>(22);

  // Stokes' law droplet coalescence: higher temp reduces heavy oil viscosity; higher demulsifier weakens interfacial film; higher electrostatic grid voltage accelerates dipole coalescence
  const effectiveBswPct = parseFloat(
    Math.max(
      0.15,
      3.8 * Math.exp(-0.025 * demulsifierPpm) * Math.exp(-0.018 * (treaterTempC - 60)) * (20 / gridVoltageKv)
    ).toFixed(2)
  );

  const saltContentPtb = parseFloat((effectiveBswPct * 14.2).toFixed(1)); // Pounds per thousand barrels
  const isCompliant = effectiveBswPct <= 0.5 && saltContentPtb <= 10.0;

  // Separation Residence Time Curve (0 to 60 minutes in Horizontal Electrostatic Treater)
  const residenceCurve = Array.from({ length: 13 }, (_, i) => {
    const min = i * 5;
    const bsw = parseFloat(
      (
        0.2 +
        (38.0 - 0.2) *
          Math.exp(
            (-min / 18) * (demulsifierPpm / 50) * (treaterTempC / 75) * (gridVoltageKv / 20)
          )
      ).toFixed(2)
    );
    return {
      time_min: `${min}m`,
      bsw_pct: bsw,
      oil_recovery_pct: parseFloat((100 - bsw).toFixed(1))
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1">
              <Factory size={14} /> Surface Production Facilities & Central Gathering Station (GGS)
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Emulsion Dehydration & Electrostatic Desalter
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                GGS-TREATER-02
              </span>
            </h2>
            <p className="text-xs text-cyan-200/60 font-mono mt-1">
              Tight water-in-oil (W/O) emulsion breaking · High-voltage AC electrostatic grid & chemical surfactant optimization
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundFx.playSuccess();
                setDemulsifierPpm(85);
                setTreaterTempC(85);
                setGridVoltageKv(25);
              }}
              onMouseEnter={() => soundFx.playHover()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 text-xs font-mono font-bold hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} /> Auto-Optimize Pipeline Spec
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Treated Export BS&W</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${isCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
              {effectiveBswPct}%
            </b>
            <span className="text-xs font-mono text-slate-400">vol/vol</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Pipeline limit: &le; 0.50%
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Desalted Salt Content</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${saltContentPtb <= 10.0 ? 'text-emerald-400' : 'text-amber-300'}`}>
              {saltContentPtb}
            </b>
            <span className="text-xs font-mono text-slate-400">PTB</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Max specification: 10.0 PTB
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Demulsifier Surfactant</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-cyan-300">{demulsifierPpm}</b>
            <span className="text-xs font-mono text-slate-400">PPM injection</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">Oxyalkylated phenolic resin</span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Pipeline Custody Status</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${isCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isCompliant ? 'SALABLE EXPORT' : 'RECYCLE TO SLOP'}
            </b>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            GGS to IOCL refinery trunkline
          </span>
        </div>
      </div>

      {/* Main Charts & Vessel Layers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Residence Time Curve (2 Cols) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Activity className="text-cyan-400" size={18} /> BS&W Decay vs Residence Time in Vessel
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
              Stokes Coalescence Kinetics
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={residenceCurve} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
                <XAxis dataKey="time_min" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" domain={[0, 40]} />
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
                  dataKey="bsw_pct"
                  name="Water Cut in Oil (BS&W %)"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            * Raw emulsion enters at 38% water cut. The electrostatic grid induces dipoles in water droplets, accelerating coalescence into a free bottom water pad.
          </p>
        </div>

        {/* Electrostatic Vessel Strata & Controls (1 Col) */}
        <div className="glass rounded-3xl p-6 border border-cyan-500/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <Zap className="text-amber-400" size={18} /> Electrostatic Vessel Strata
            </div>

            <div className="space-y-1.5 my-3">
              <div className="h-10 rounded-lg bg-amber-500/30 border border-amber-400/40 flex items-center justify-between px-3 text-xs font-mono text-amber-200">
                <span>Clean Dehydrated Oil Layer</span>
                <b>BS&W {effectiveBswPct}%</b>
              </div>
              <div className="h-8 rounded-lg bg-purple-500/30 border border-purple-400/40 flex items-center justify-between px-3 text-xs font-mono text-purple-200">
                <span>Electrostatic Grid ({gridVoltageKv} kV AC)</span>
                <b>Coalescing</b>
              </div>
              <div className="h-10 rounded-lg bg-blue-500/30 border border-blue-400/40 flex items-center justify-between px-3 text-xs font-mono text-blue-200">
                <span>Produced Water Drainage</span>
                <b>Effluent Water</b>
              </div>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-3 pt-3 border-t border-cyan-500/15">
            <div>
              <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                <span>Demulsifier Dose:</span>
                <span className="text-cyan-400 font-bold">{demulsifierPpm} PPM</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={demulsifierPpm}
                onChange={(e) => {
                  soundFx.playClick();
                  setDemulsifierPpm(Number(e.target.value));
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                <span>Treater Temperature:</span>
                <span className="text-amber-400 font-bold">{treaterTempC}°C</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                step="1"
                value={treaterTempC}
                onChange={(e) => {
                  soundFx.playClick();
                  setTreaterTempC(Number(e.target.value));
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                <span>Grid Potential:</span>
                <span className="text-purple-400 font-bold">{gridVoltageKv} kV</span>
              </div>
              <input
                type="range"
                min="12"
                max="30"
                step="1"
                value={gridVoltageKv}
                onChange={(e) => {
                  soundFx.playClick();
                  setGridVoltageKv(Number(e.target.value));
                }}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
