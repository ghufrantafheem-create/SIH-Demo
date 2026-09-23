import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Activity,
  Cpu,
  Sparkles,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  RotateCcw,
  BarChart2
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
  Bar
} from 'recharts';
import { soundFx } from '../utils/sound';

export const VFDMotorHarmonicsAnalyzer: React.FC<{ wellId?: string }> = ({ wellId = 'BGW-001' }) => {
  const [carrierFreqKhz, setCarrierFreqKhz] = useState<number>(4.0);
  const [ambientTempC, setAmbientTempC] = useState<number>(46); // Harsh Thar Desert summer heat
  const [powerFactorCorrection, setPowerFactorCorrection] = useState<boolean>(true);

  // VFD Inverter Heat Sink Temperature Model
  // Copper and switching losses increase with carrier frequency; desert heat limits air-cooling delta-T
  const heatSinkTempC = parseFloat((ambientTempC + 16 + carrierFreqKhz * 4.2).toFixed(1));
  const isOverheating = heatSinkTempC > 85;

  // Power Factor and THD (Total Harmonic Distortion)
  const thdVoltagePct = parseFloat((12.5 - carrierFreqKhz * 1.2).toFixed(1));
  const thdCurrentPct = parseFloat((thdVoltagePct * 1.4).toFixed(1));
  const powerFactor = powerFactorCorrection ? 0.98 : 0.82;

  // 3-Phase AC Current Waveform Data (50 Hz fundamental + 5th & 7th harmonics)
  const waveformData = Array.from({ length: 60 }, (_, i) => {
    const t = (i / 59) * 2 * Math.PI;
    // Harmonic distortion simulation
    const harmonicDist = (thdCurrentPct / 100) * 0.5;
    const phaseA = Math.sin(t) + harmonicDist * Math.sin(5 * t);
    const phaseB = Math.sin(t - (2 * Math.PI) / 3) + harmonicDist * Math.sin(5 * (t - (2 * Math.PI) / 3));
    const phaseC = Math.sin(t + (2 * Math.PI) / 3) + harmonicDist * Math.sin(5 * (t + (2 * Math.PI) / 3));

    return {
      time_ms: (i * 0.33).toFixed(1),
      phase_a: parseFloat((phaseA * 42.0).toFixed(1)),
      phase_b: parseFloat((phaseB * 42.0).toFixed(1)),
      phase_c: parseFloat((phaseC * 42.0).toFixed(1))
    };
  });

  // FFT Harmonic Spectrum
  const harmonicSpectrum = [
    { order: 'H1 (50Hz)', amplitude_pct: 100, is_fundamental: true },
    { order: 'H5 (250Hz)', amplitude_pct: parseFloat((thdCurrentPct * 0.55).toFixed(1)) },
    { order: 'H7 (350Hz)', amplitude_pct: parseFloat((thdCurrentPct * 0.35).toFixed(1)) },
    { order: 'H11 (550Hz)', amplitude_pct: parseFloat((thdCurrentPct * 0.20).toFixed(1)) },
    { order: 'H13 (650Hz)', amplitude_pct: parseFloat((thdCurrentPct * 0.12).toFixed(1)) }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1">
              <Zap size={14} /> Electrical Power Quality & Motor Inverter Dynamics
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              VFD Motor Harmonics & Inverter Heat Analyzer
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                {wellId} · 75 kW Drive
              </span>
            </h2>
            <p className="text-xs text-cyan-200/60 font-mono mt-1">
              Pulse-width modulation harmonics · Desert thermal derating & active power factor (cos phi) compensation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundFx.playSuccess();
                setPowerFactorCorrection(!powerFactorCorrection);
              }}
              onMouseEnter={() => soundFx.playHover()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 text-xs font-mono font-bold hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} /> {powerFactorCorrection ? 'APFC Engaged' : 'Engage APFC Bank'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Total Harmonic Distortion</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${thdCurrentPct > 15 ? 'text-amber-400' : 'text-cyan-300'}`}>
              {thdCurrentPct}%
            </b>
            <span className="text-xs font-mono text-slate-400">THD-I</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            IEEE 519 standard: &lt; 15%
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Inverter Heat-Sink Temp</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${isOverheating ? 'text-rose-400' : 'text-amber-300'}`}>
              {heatSinkTempC}°C
            </b>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Trip threshold: 90°C (Desert {ambientTempC}°C)
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Operating Power Factor</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${powerFactor >= 0.95 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {powerFactor}
            </b>
            <span className="text-xs font-mono text-slate-400">cos &phi;</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            {powerFactorCorrection ? 'Zero tariff penalty' : 'Utility surcharge active'}
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">PWM Switching Frequency</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-purple-300">{carrierFreqKhz}</b>
            <span className="text-xs font-mono text-slate-400">kHz</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">IGBT gate drive carrier</span>
        </div>
      </div>

      {/* Main Oscilloscope & FFT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Oscilloscope (2 Cols) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Activity className="text-cyan-400" size={18} /> 3-Phase Stator Current Oscilloscope (50 Hz)
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
              Live Hall Effect Sensors
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={waveformData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
                <XAxis dataKey="time_ms" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" ms" />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" A" domain={[-55, 55]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#040914',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    borderRadius: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="phase_a" name="Phase A (Red)" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="phase_b" name="Phase B (Yellow)" stroke="#fbbf24" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="phase_c" name="Phase C (Blue)" stroke="#00e5ff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            * 3-phase sine waves demonstrate distortion from 5th and 7th order harmonics generated by the 6-pulse bridge rectifier.
          </p>
        </div>

        {/* FFT Spectrum & Sliders (1 Col) */}
        <div className="glass rounded-3xl p-6 border border-cyan-500/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <BarChart2 className="text-amber-400" size={18} /> FFT Harmonic Spectrum
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={harmonicSpectrum} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
                  <XAxis dataKey="order" stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#040914',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '12px'
                    }}
                  />
                  <Bar dataKey="amplitude_pct" name="Amplitude %" fill="#ff9f1c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-3 pt-3 border-t border-cyan-500/15">
            <div>
              <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                <span>PWM Carrier Freq:</span>
                <span className="text-cyan-400 font-bold">{carrierFreqKhz} kHz</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="8.0"
                step="0.5"
                value={carrierFreqKhz}
                onChange={(e) => {
                  soundFx.playClick();
                  setCarrierFreqKhz(Number(e.target.value));
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-cyan-200 mb-1">
                <span>Desert Ambient Temp:</span>
                <span className="text-amber-400 font-bold">{ambientTempC}°C</span>
              </div>
              <input
                type="range"
                min="30"
                max="54"
                step="1"
                value={ambientTempC}
                onChange={(e) => {
                  soundFx.playClick();
                  setAmbientTempC(Number(e.target.value));
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
