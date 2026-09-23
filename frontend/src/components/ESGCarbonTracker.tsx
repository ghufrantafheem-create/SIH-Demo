import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf,
  Sun,
  Flame,
  ShieldCheck,
  TrendingDown,
  Activity,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { soundFx } from '../utils/sound';

export const ESGCarbonTracker: React.FC<{ wellId?: string }> = ({ wellId = 'BGW-001' }) => {
  const [solarCollectorArea, setSolarCollectorArea] = useState<number>(12500); // m²
  const [boilerFuelType, setBoilerFuelType] = useState<'natural_gas' | 'cng_blend' | 'diesel'>('natural_gas');
  const [dailySteamGeneratedT, setDailySteamGeneratedT] = useState<number>(35.0);

  // Carbon Emission Factors (kg CO2 / ton steam)
  const fuelFactor = boilerFuelType === 'natural_gas' ? 142.0 : boilerFuelType === 'cng_blend' ? 128.0 : 185.0;

  // Thar Desert Solar Yield Calculations (Average DNI 850 W/m²)
  const dailySolarThermalMwh = (solarCollectorArea * 0.85 * 7.5 * 0.62) / 1000; // MWh thermal
  const solarSteamTonsOffset = dailySolarThermalMwh / 0.75; // steam generated from solar
  const solarCarbonOffsetKg = solarSteamTonsOffset * fuelFactor;
  const netDailyEmissionsKg = Math.max(0, dailySteamGeneratedT * fuelFactor - solarCarbonOffsetKg);
  const carbonIntensityKgPerBbl = netDailyEmissionsKg / 142.5;

  const monthlyTrend = [
    { month: 'Jan', baseline_tco2: 154, solar_hybrid_tco2: 108, offset_tco2: 46 },
    { month: 'Feb', baseline_tco2: 158, solar_hybrid_tco2: 102, offset_tco2: 56 },
    { month: 'Mar', baseline_tco2: 162, solar_hybrid_tco2: 95, offset_tco2: 67 },
    { month: 'Apr', baseline_tco2: 165, solar_hybrid_tco2: 89, offset_tco2: 76 },
    { month: 'May', baseline_tco2: 170, solar_hybrid_tco2: 84, offset_tco2: 86 },
    { month: 'Jun', baseline_tco2: 168, solar_hybrid_tco2: 82, offset_tco2: 86 }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Leaf size={22} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Carbon Footprint &amp; Solar-Thermal Hybrid Decarbonization Tracker
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Scope 1 &amp; 2 GHG Accounting &bull; Concentrated Solar Power (CSP) Offset Modeling for Baghewala Field.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-subtle border border-emerald-500/20 text-xs font-mono text-emerald-300">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Thar Clean Recovery: <b className="text-white">Gold ESG Tier</b></span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Solar-Thermal EOR Sandbox Controls */}
        <div className="lg:col-span-5 glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Sun className="text-amber-400" size={18} />
              <span>Solar Hybrid Boiler Controls</span>
            </h3>
            <span className="text-[11px] font-mono text-cyan-300 glass-pill px-2.5 py-0.5 rounded-full">
              Thar DNI: 850 W/m²
            </span>
          </div>

          {/* Collector Aperture Area */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">CSP Parabolic Trough Field:</span>
              <b className="text-amber-300 text-sm">{solarCollectorArea.toLocaleString()} m²</b>
            </div>
            <input
              type="range"
              min="2000"
              max="35000"
              step="500"
              value={solarCollectorArea}
              onChange={(e) => {
                soundFx.playClick();
                setSolarCollectorArea(Number(e.target.value));
              }}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Boiler Fuel Selector */}
          <div className="space-y-2 font-mono text-xs">
            <span className="text-slate-300 block">Baseline Boiler Fuel Type:</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['natural_gas', 'Natural Gas'],
                ['cng_blend', 'CNG Blend'],
                ['diesel', 'Distillate']
              ].map(([ft, label]) => (
                <button
                  key={ft}
                  onClick={() => {
                    soundFx.playClick();
                    setBoilerFuelType(ft as any);
                  }}
                  className={`py-2 rounded-xl text-center transition-all cursor-pointer border ${
                    boilerFuelType === ft
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 font-bold'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Emissions Saved Card */}
          <div className="p-4 rounded-2xl glass-subtle border border-emerald-500/20 font-mono text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Daily Solar Steam Yield:</span>
              <b className="text-amber-300 text-sm">{solarSteamTonsOffset.toFixed(1)} tons</b>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Avoided CO₂ per Day:</span>
              <b className="text-emerald-300 text-sm">{(solarCarbonOffsetKg / 1000).toFixed(2)} tCO₂e</b>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-white/5">
              Utilizing Rajasthan desert high direct irradiance replaces up to 45% of boiler burner gas consumption during daylight hours.
            </p>
          </div>
        </div>

        {/* 6-Month Emissions Trend & KPI Grid */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-white">Monthly Scope 1 Carbon Abatement (tCO₂e)</h3>
                <p className="text-xs text-cyan-200/60 font-mono mt-0.5">Conventional Boiler Baseline vs Solar-Thermal Hybrid</p>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full glass-pill text-emerald-300 border border-emerald-500/20">
                -42% Decarbonized
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Tons CO₂e', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(4, 15, 28, 0.95)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '16px',
                      fontSize: '11px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="baseline_tco2" name="Conventional Boiler" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="solar_hybrid_tco2" name="Solar Hybrid EOR" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Carbon Accounting KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Daily Gross CO₂</span>
              <b className="text-xl font-mono text-rose-300 mt-1 block">{((dailySteamGeneratedT * fuelFactor) / 1000).toFixed(1)} t</b>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Solar Offset</span>
              <b className="text-xl font-mono text-emerald-300 mt-1 block">-{(solarCarbonOffsetKg / 1000).toFixed(1)} t</b>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Carbon Intensity</span>
              <b className="text-xl font-mono text-cyan-300 mt-1 block">{carbonIntensityKgPerBbl.toFixed(1)}</b>
              <span className="text-[10px] font-mono text-slate-400">kg CO₂ / bbl</span>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Carbon Credit</span>
              <b className="text-xl font-mono text-amber-300 mt-1 block">${Math.round((solarCarbonOffsetKg / 1000) * 365 * 18).toLocaleString()}</b>
              <span className="text-[10px] font-mono text-slate-400">Annual Value</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
