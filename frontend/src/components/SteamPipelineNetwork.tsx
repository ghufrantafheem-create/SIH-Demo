import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Activity,
  Layers,
  Thermometer,
  ShieldCheck,
  TrendingDown,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { soundFx } from '../utils/sound';

export const SteamPipelineNetwork: React.FC = () => {
  const [insulationThicknessMm, setInsulationThicknessMm] = useState<number>(75);
  const [ambientTempC, setAmbientTempC] = useState<number>(42); // Rajasthan Summer High
  const [boilerOutletPressure, setBoilerOutletPressure] = useState<number>(95); // bar

  // Pipeline hydraulic decay along 2.5 km main loop
  const pipelineProfile = [];
  for (let dist = 0; dist <= 2500; dist += 100) {
    const heatLossFactor = (100 - insulationThicknessMm * 0.5) / 100;
    const tempDrop = (dist / 2500) * 24.0 * heatLossFactor;
    const pressureDrop = (dist / 2500) * 11.5;
    const steamTemp = 310 - tempDrop;
    const steamPressure = boilerOutletPressure - pressureDrop;
    const drynessFraction = Math.max(68, 85 - (dist / 2500) * 14.0 * heatLossFactor);

    pipelineProfile.push({
      distance_m: dist,
      temperature_c: parseFloat(steamTemp.toFixed(1)),
      pressure_bar: parseFloat(steamPressure.toFixed(1)),
      dryness_pct: parseFloat(drynessFraction.toFixed(1))
    });
  }

  const endDryness = pipelineProfile[pipelineProfile.length - 1].dryness_pct;
  const endPressure = pipelineProfile[pipelineProfile.length - 1].pressure_bar;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Flame size={22} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Surface Steam Distribution Pipeline Network &amp; Enthalpy Loss CFD
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Overland Steam Hydraulics &bull; Pressure Drops &bull; Insulation Enthalpy Decay across 2.5 km Field Loop.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-subtle border border-cyan-500/20 text-xs font-mono text-cyan-300">
            <Thermometer className="w-4 h-4 text-amber-400" />
            <span>Thar Ambient: <b className="text-white">{ambientTempC}°C</b></span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Steam Quality & Pressure Curve */}
        <div className="lg:col-span-8 glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-white">Steam Quality &amp; Pressure Drop vs Distance</h3>
              <p className="text-xs text-cyan-200/60 font-mono mt-0.5">
                Dryness Fraction % (Cyan) vs Line Pressure (Amber) from Central Boiler Plant
              </p>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full glass-pill text-amber-300 border border-amber-500/20">
              Terminal Wellhead Dryness: {endDryness}%
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pipelineProfile}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                <XAxis dataKey="distance_m" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Distance from Boiler (meters)', position: 'insideBottom', offset: -4, fill: '#94a3b8', fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Dryness %', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} domain={[60, 90]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Pressure (bar)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} domain={[70, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(4, 15, 28, 0.95)',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    borderRadius: '16px',
                    fontSize: '11px'
                  }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="dryness_pct" name="Steam Dryness %" stroke="#00e5ff" strokeWidth={2.5} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="pressure_bar" name="Line Pressure (bar)" stroke="#ff9f1c" strokeWidth={2.2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insulation Tuning & Pipeline Facility KPIs */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="glass rounded-3xl p-5 border border-cyan-500/20 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white">Pipeline Thermal Insulation Tuning</h3>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Calcium-Silicate Cladding:</span>
                <b className="text-cyan-300 text-sm">{insulationThicknessMm} mm</b>
              </div>
              <input
                type="range"
                min="25"
                max="120"
                step="5"
                value={insulationThicknessMm}
                onChange={(e) => {
                  soundFx.playClick();
                  setInsulationThicknessMm(Number(e.target.value));
                }}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Boiler Exit Pressure:</span>
                <b className="text-amber-300 text-sm">{boilerOutletPressure} bar</b>
              </div>
              <input
                type="range"
                min="80"
                max="115"
                step="1"
                value={boilerOutletPressure}
                onChange={(e) => setBoilerOutletPressure(Number(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>

          {/* Pipeline Facility Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Terminal Pressure</span>
              <b className="text-xl font-mono text-cyan-300 mt-1 block">{endPressure.toFixed(1)} bar</b>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Heat Transfer Eff</span>
              <b className="text-xl font-mono text-emerald-300 mt-1 block">{Math.round((endDryness / 85) * 100)}%</b>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Network</span>
              <b className="text-xl font-mono text-white mt-1 block">8.4 km</b>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Condensate Slugs</span>
              <b className="text-xl font-mono text-emerald-400 mt-1 block">0 Traps Full</b>
            </div>
          </div>

          <div className="glass-subtle rounded-2xl p-4 border border-cyan-500/15 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
              <Sparkles size={14} /> Automated Steam Trapping
            </div>
            Thermodynamic steam traps purge condensation along distribution loops, protecting downhole casing from water-slug thermal shock.
          </div>
        </div>
      </div>
    </div>
  );
};
