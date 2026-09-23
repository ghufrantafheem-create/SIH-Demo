import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  AlertTriangle,
  Activity,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  Lock,
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
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { soundFx } from '../utils/sound';

export const CaprockMicroseismicIntegrity: React.FC<{ wellId?: string }> = ({ wellId = 'BGW-001' }) => {
  const [injectionPressureBar, setInjectionPressureBar] = useState<number>(85);
  const [overburdenStressBar] = useState<number>(185); // Lithostatic gradient at caprock depth ~750m

  // Maximum Allowable Injection Pressure (MAIP) based on minimum principal in-situ stress
  const maipLimitBar = 112;
  const porePressureRatio = parseFloat((injectionPressureBar / maipLimitBar).toFixed(2));
  const isBreached = injectionPressureBar >= maipLimitBar;

  // Mohr-Coulomb Effective Stress Circle Calculation
  // Effective Stress: sigma' = sigma - P_pore
  const effectiveSigma1 = overburdenStressBar - injectionPressureBar;
  const effectiveSigma3 = Math.round(overburdenStressBar * 0.65) - injectionPressureBar;
  const mohrCenter = (effectiveSigma1 + effectiveSigma3) / 2;
  const mohrRadius = (effectiveSigma1 - effectiveSigma3) / 2;

  // Generate Mohr Circle points
  const mohrCircleData = Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 29) * Math.PI; // 0 to 180 degrees
    const normalStress = mohrCenter + mohrRadius * Math.cos(angle);
    const shearStress = mohrRadius * Math.sin(angle);
    // Mohr-Coulomb failure envelope: tau = c + sigma * tan(phi) (cohesion ~12 bar, friction angle ~32 deg)
    const failureEnvelope = 12 + normalStress * 0.62;
    return {
      normal_stress: parseFloat(normalStress.toFixed(1)),
      shear_stress: parseFloat(shearStress.toFixed(1)),
      failure_envelope: parseFloat(failureEnvelope.toFixed(1))
    };
  });

  // Simulated 3D Microseismic Cloud Events (Offset East vs Depth vs Magnitude)
  const microseismicEvents = [
    { offset_e_m: -45, depth_m: 780, magnitude_mw: -1.2, time: '14:02' },
    { offset_e_m: 12, depth_m: 820, magnitude_mw: -0.8, time: '14:15' },
    { offset_e_m: -18, depth_m: 850, magnitude_mw: -0.4, time: '14:24' },
    { offset_e_m: 35, depth_m: 860, magnitude_mw: -0.9, time: '14:38' },
    { offset_e_m: -5, depth_m: 890, magnitude_mw: -0.2, time: '14:52' },
    { offset_e_m: 22, depth_m: 910, magnitude_mw: -1.5, time: '15:10' },
    { offset_e_m: -30, depth_m: 940, magnitude_mw: -0.7, time: '15:22' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 uppercase tracking-wider mb-1">
              <ShieldCheck size={14} /> Subsurface Geomechanics & Caprock Containment
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Caprock Integrity & Microseismic Monitor
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                {wellId} · Mohr-Coulomb
              </span>
            </h2>
            <p className="text-xs text-cyan-200/60 font-mono mt-1">
              Caprock shear failure envelope · Maximum Allowable Injection Pressure (MAIP) & microseismic hypocenter tracking
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundFx.playSuccess();
                setInjectionPressureBar(82);
              }}
              onMouseEnter={() => soundFx.playHover()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles size={14} /> Reset Safe MAIP Headroom
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Steam Injection Pressure</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${isBreached ? 'text-rose-400' : 'text-cyan-300'}`}>
              {injectionPressureBar}
            </b>
            <span className="text-xs font-mono text-slate-400">bar</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            MAIP Safety Ceiling: {maipLimitBar} bar
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Caprock Factor of Safety</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${porePressureRatio > 0.85 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {(1 / porePressureRatio).toFixed(2)}
            </b>
            <span className="text-xs font-mono text-slate-400">FoS</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Minimum required FoS &ge; 1.25
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Max Microseismic Magnitude</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-purple-300">-0.2</b>
            <span className="text-xs font-mono text-slate-400">Mw</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Induced shear slip event
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Containment Barrier State</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${isBreached ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isBreached ? 'SHEAR BREACH RISK' : 'INTACT SEAL'}
            </b>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Bilara shale caprock at 720m
          </span>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mohr-Coulomb Envelope (2 Cols) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Activity className="text-cyan-400" size={18} /> Mohr-Coulomb Effective Stress & Failure Envelope
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
              Effective Stress Trajectory
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mohrCircleData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
                <XAxis dataKey="normal_stress" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" bar" />
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
                  dataKey="shear_stress"
                  name="Mohr Stress Circle (Effective)"
                  stroke="#00e5ff"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="failure_envelope"
                  name="Caprock Shear Failure Envelope"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            * As steam injection pressure rises, pore pressure increases and shifts the effective stress circle to the left towards the failure envelope.
          </p>
        </div>

        {/* Microseismic Events & Pressure Slider (1 Col) */}
        <div className="glass rounded-3xl p-6 border border-cyan-500/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <Layers className="text-emerald-400" size={18} /> Microseismic Hypocenter Log
            </div>
            <div className="space-y-2 text-xs font-mono max-h-48 overflow-y-auto scrollbar pr-1">
              {microseismicEvents.map((evt, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5">
                  <div>
                    <span className="text-white font-bold">{evt.time}</span>
                    <span className="text-slate-400 ml-2">Depth {evt.depth_m}m</span>
                  </div>
                  <span className="text-purple-300 font-bold">{evt.magnitude_mw} Mw</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Slider */}
          <div className="space-y-3 pt-3 border-t border-cyan-500/15">
            <div>
              <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                <span>Injection Pressure:</span>
                <span className={`font-bold ${isBreached ? 'text-rose-400' : 'text-cyan-400'}`}>
                  {injectionPressureBar} bar
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="125"
                step="1"
                value={injectionPressureBar}
                onChange={(e) => {
                  soundFx.playClick();
                  setInjectionPressureBar(Number(e.target.value));
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Auto-relief valve triggers at {maipLimitBar} bar to protect caprock integrity.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
