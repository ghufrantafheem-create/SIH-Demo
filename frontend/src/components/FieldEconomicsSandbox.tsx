import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Sliders,
  Layers,
  Sparkles,
  Zap,
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
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { soundFx } from '../utils/sound';

export const FieldEconomicsSandbox: React.FC<{ wellId?: string }> = ({ wellId = 'BGW-001' }) => {
  const [oilPrice, setOilPrice] = useState<number>(78.0); // $/bbl
  const [steamCostPerTon, setSteamCostPerTon] = useState<number>(26.5); // $/ton
  const [powerCostKwh, setPowerCostKwh] = useState<number>(0.11); // $/kWh
  const [waterDisposalCost, setWaterDisposalCost] = useState<number>(1.8); // $/bbl
  const [dailyBopd, setDailyBopd] = useState<number>(142.5);
  const [dailySteamTons, setDailySteamTons] = useState<number>(35.0);

  // Financial Computations
  const grossDailyRevenue = dailyBopd * oilPrice;
  const steamOpex = dailySteamTons * steamCostPerTon;
  const powerOpex = 8.5 * 24 * 7.5 * powerCostKwh; // SRP motor energy draw
  const waterOpex = dailyBopd * 0.22 * waterDisposalCost;
  const totalDailyOpex = steamOpex + powerOpex + waterOpex;
  const netDailyProfit = grossDailyRevenue - totalDailyOpex;
  const netMarginPct = (netDailyProfit / grossDailyRevenue) * 100;
  const liftingCostPerBbl = totalDailyOpex / dailyBopd;
  const criticalSor = Math.max(0.5, (oilPrice - liftingCostPerBbl * 0.4) / steamCostPerTon);

  // 30-Day Cumulative Cashflow Projection Data
  const projectionData = [];
  let cumRevenue = 0;
  let cumOpex = 0;
  let cumNet = 0;

  for (let day = 1; day <= 30; day++) {
    // Decline factor over CSS cycle
    const dayBopd = dailyBopd * Math.exp(-0.015 * day);
    const dayRev = dayBopd * oilPrice;
    const dayCost = steamOpex * 0.35 + powerOpex + dayBopd * 0.22 * waterDisposalCost;
    cumRevenue += dayRev;
    cumOpex += dayCost;
    cumNet += dayRev - dayCost;

    projectionData.push({
      day: `Day ${day}`,
      cumulative_profit: parseFloat((cumNet / 1000).toFixed(1)),
      cumulative_opex: parseFloat((cumOpex / 1000).toFixed(1)),
      bopd: parseFloat(dayBopd.toFixed(1))
    });
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <DollarSign size={22} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Field Economics &amp; What-If Profitability Sandbox
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Coupled Thermodynamic OPEX &amp; Financial Realized Margins for well <b className="text-cyan-300">{wellId}</b>.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-subtle border border-emerald-500/20 text-xs font-mono text-emerald-300">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Net Daily Margin: <b className="text-white">+{netMarginPct.toFixed(1)}%</b></span>
          </div>
        </div>
      </div>

      {/* Main Sandbox Controls & Visualizer */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Interactive Sliders & Parameter Tuning */}
        <div className="lg:col-span-5 glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <h3 className="font-bold text-base text-white">What-If Economic Drivers</h3>
            <span className="text-[11px] font-mono text-cyan-300 glass-pill px-2.5 py-0.5 rounded-full">
              Live Tuning
            </span>
          </div>

          {/* Oil Price Slider */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">Realized Crude Price:</span>
              <b className="text-cyan-300 text-sm">${oilPrice.toFixed(1)} / bbl</b>
            </div>
            <input
              type="range"
              min="45"
              max="125"
              step="1"
              value={oilPrice}
              onChange={(e) => {
                soundFx.playClick();
                setOilPrice(Number(e.target.value));
              }}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Steam Generation Cost Slider */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">Steam Boiler Cost:</span>
              <b className="text-amber-300 text-sm">${steamCostPerTon.toFixed(1)} / ton</b>
            </div>
            <input
              type="range"
              min="14"
              max="50"
              step="0.5"
              value={steamCostPerTon}
              onChange={(e) => {
                soundFx.playClick();
                setSteamCostPerTon(Number(e.target.value));
              }}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Electricity Tariff Slider */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">Electric Power Tariff:</span>
              <b className="text-emerald-300 text-sm">${powerCostKwh.toFixed(2)} / kWh</b>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.25"
              step="0.01"
              value={powerCostKwh}
              onChange={(e) => setPowerCostKwh(Number(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Produced Water Disposal */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">Water Treatment OPEX:</span>
              <b className="text-white text-sm">${waterDisposalCost.toFixed(2)} / bbl</b>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={waterDisposalCost}
              onChange={(e) => setWaterDisposalCost(Number(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Breakeven SOR Analysis Card */}
          <div className="p-4 rounded-2xl glass-subtle border border-cyan-500/20 font-mono text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Critical Breakeven SOR:</span>
              <b className="text-amber-300 text-base">{criticalSor.toFixed(2)}</b>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-light">
              Maximum allowable Steam-Oil Ratio before injection costs exceed crude revenue at current prices.
            </p>
          </div>
        </div>

        {/* 30-Day Cumulative Cashflow Graph & KPIs */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-white">30-Day Cumulative Profit vs OPEX ($k)</h3>
                <p className="text-xs text-cyan-200/60 font-mono mt-0.5">Projected Net Cashflow Profile across CSS Production Cycle</p>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full glass-pill text-emerald-300 border border-emerald-500/20">
                Positive Cashflow
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData}>
                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: '$ Thousands', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(4, 15, 28, 0.95)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '16px',
                      fontSize: '11px'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="cumulative_profit" name="Cumulative Net Profit ($k)" stroke="#10b981" strokeWidth={2.5} fill="url(#profitGrad)" />
                  <Line type="monotone" dataKey="cumulative_opex" name="Cumulative OPEX ($k)" stroke="#f43f5e" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Financial Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Daily Revenue</span>
              <b className="text-xl font-mono text-cyan-300 mt-1 block">${Math.round(grossDailyRevenue).toLocaleString()}</b>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Total OPEX</span>
              <b className="text-xl font-mono text-rose-300 mt-1 block">${Math.round(totalDailyOpex).toLocaleString()}</b>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Lifting Cost</span>
              <b className="text-xl font-mono text-amber-300 mt-1 block">${liftingCostPerBbl.toFixed(1)} / bbl</b>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Daily Profit</span>
              <b className="text-xl font-mono text-emerald-300 mt-1 block">+${Math.round(netDailyProfit).toLocaleString()}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
