import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wind,
  Flame,
  Activity,
  DollarSign,
  Sparkles,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Cpu,
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

export const VaporRecoveryVRUUnit: React.FC<{ wellId?: string }> = ({ wellId = 'BGW-001' }) => {
  const [casingBackpressurePsi, setCasingBackpressurePsi] = useState<number>(35);
  const [compressorSpeedRpm, setCompressorSpeedRpm] = useState<number>(1450);
  const [vruOnline, setVruOnline] = useState<boolean>(true);

  // Gas Flash Volume (MSCFD - Thousand Standard Cubic Feet per Day)
  // Higher well temperature and lower casing backpressure flashes more dissolved casinghead gas
  const gasFlashRateMscfd = parseFloat(
    (Math.max(10, 48 * Math.sqrt(50 / casingBackpressurePsi))).toFixed(1)
  );

  // Compressor capacity
  const compressorCapacityMscfd = parseFloat(
    ((compressorSpeedRpm / 1800) * 65.0).toFixed(1)
  );

  const recoveredGasMscfd = vruOnline
    ? Math.min(gasFlashRateMscfd, compressorCapacityMscfd)
    : 0;
  const flaredGasMscfd = parseFloat((gasFlashRateMscfd - recoveredGasMscfd).toFixed(1));

  // Fuel Gas Value Saved ($3.85 / MMBTU, ~1.05 MMBTU per MSCF)
  const dailyFuelSavingsUsd = Math.round(recoveredGasMscfd * 1.05 * 3.85);
  // Avoided CO2e (Methane GWP = 28)
  const dailyAvoidedCo2eTons = parseFloat((recoveredGasMscfd * 0.054 * 28).toFixed(1));

  // 24-Hour Diurnal Recovery Profile
  const hourlyProfile = Array.from({ length: 12 }, (_, i) => {
    const hour = i * 2;
    const diurnalFactor = 0.9 + 0.2 * Math.sin((hour / 24) * 2 * Math.PI);
    return {
      time: `${hour}:00`,
      flash_mscfd: parseFloat((gasFlashRateMscfd * diurnalFactor).toFixed(1)),
      recovered_mscfd: parseFloat((recoveredGasMscfd * diurnalFactor).toFixed(1)),
      flared_mscfd: parseFloat((flaredGasMscfd * diurnalFactor).toFixed(1))
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 uppercase tracking-wider mb-1">
              <Wind size={14} /> Annulus Gas Management & Vapor Recovery Unit (VRU)
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Casing Vapor Recovery & Flaring Mitigation
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                VRU-UNIT-04 · {wellId}
              </span>
            </h2>
            <p className="text-xs text-cyan-200/60 font-mono mt-1">
              Rotary vane compressor recovery · Casinghead backpressure control & boiler burner fuel redistribution
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundFx.playClick();
                setVruOnline(!vruOnline);
              }}
              onMouseEnter={() => soundFx.playHover()}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                vruOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              }`}
            >
              <CheckCircle2 size={14} /> {vruOnline ? 'VRU Online (Active)' : 'VRU In Bypass (Flaring)'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Recovered Annular Gas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-emerald-400">{recoveredGasMscfd}</b>
            <span className="text-xs font-mono text-slate-400">MSCFD</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Re-routed to OTSG burners
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Avoided Methane Flaring</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-cyan-300">{dailyAvoidedCo2eTons}</b>
            <span className="text-xs font-mono text-slate-400">tCO2e / day</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            GWP 28x methane multiplier
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Daily Fuel Value Saved</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-amber-300">${dailyFuelSavingsUsd}</b>
            <span className="text-xs font-mono text-slate-400">/ day</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Natural gas displacement
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Downhole Gas Interference</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${casingBackpressurePsi > 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {casingBackpressurePsi > 60 ? 'RISK HIGH' : 'VENTED (SAFE)'}
            </b>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Annulus backpressure {casingBackpressurePsi} psi
          </span>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diurnal Recovery Profile (2 Cols) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Activity className="text-cyan-400" size={18} /> Gas Recovery vs Flare Venting Over 24 Hours
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
              Diurnal Telemetry
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyProfile} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" MSCFD" />
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
                  dataKey="recovered_mscfd"
                  name="VRU Reclaimed Gas (MSCFD)"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="flared_mscfd"
                  name="Emergency Flared Gas (MSCFD)"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            * Annular gas flash varies with pump stroke frequency and downhole thermal conduction. Recovered vapors offset purchased boiler fuel gas.
          </p>
        </div>

        {/* Backpressure Controls (1 Col) */}
        <div className="glass rounded-3xl p-6 border border-cyan-500/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <Sliders className="text-amber-400" size={18} /> Casinghead Pressure Valve
            </div>
            <p className="text-[11px] font-mono text-cyan-200/60 mb-4">
              Balance casing pressure to avoid pump gas-lock and prevent oil foaming.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                  <span>Casing Backpressure:</span>
                  <span className="text-cyan-400 font-bold">{casingBackpressurePsi} PSI</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={casingBackpressurePsi}
                  onChange={(e) => {
                    soundFx.playClick();
                    setCasingBackpressurePsi(Number(e.target.value));
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                  <span>VRU Compressor Speed:</span>
                  <span className="text-emerald-400 font-bold">{compressorSpeedRpm} RPM</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="2200"
                  step="50"
                  value={compressorSpeedRpm}
                  onChange={(e) => {
                    soundFx.playClick();
                    setCompressorSpeedRpm(Number(e.target.value));
                  }}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-200">
            Current recovery efficiency: <b className="text-white">{((recoveredGasMscfd / gasFlashRateMscfd) * 100).toFixed(0)}%</b> of total flashed hydrocarbons.
          </div>
        </div>
      </div>
    </div>
  );
};
