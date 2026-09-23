import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Activity,
  Layers,
  Sparkles,
  TrendingDown,
  Clock,
  Info,
  Calendar,
  Maximize2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { soundFx } from '../utils/sound';

export const ThermalCFDHeatmap: React.FC<{ wellId?: string }> = ({ wellId = 'BGW-001' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [soakDays, setSoakDays] = useState<number>(7);
  const [steamTemp, setSteamTemp] = useState<number>(310);
  const [reservoirDepth, setReservoirDepth] = useState<number>(980);

  // Compute thermal radius & viscosity decay curve
  const thermalRadiusM = Math.min(32, 4.5 + Math.sqrt(soakDays) * 3.8);
  const peakChamberTemp = Math.max(72, steamTemp * Math.exp(-0.048 * soakDays));
  const currentViscosityCp = Math.max(115, 105000 * Math.exp(-0.038 * (peakChamberTemp - 55)));

  // Generate radial profile data
  const radialProfile = [];
  for (let r = 0; r <= 35; r += 2) {
    const temp = Math.max(
      62,
      62 + (peakChamberTemp - 62) * Math.exp(-Math.pow(r / (thermalRadiusM * 0.9), 1.8))
    );
    const visc = Math.max(115, 105000 * Math.exp(-0.038 * (temp - 55)));
    radialProfile.push({
      radius_m: r,
      temperature_c: parseFloat(temp.toFixed(1)),
      viscosity_cp: parseFloat(visc.toFixed(0))
    });
  }

  // Draw 2D Subsurface Thermal CFD Heatmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const h = (canvas.height = 340);

    ctx.clearRect(0, 0, w, h);

    // Geological strata background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#040b17');
    grad.addColorStop(0.3, '#061324');
    grad.addColorStop(0.7, '#071830');
    grad.addColorStop(1, '#020710');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Strata layers horizontal grid
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 30; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const centerX = w / 2;
    const centerY = h / 2 + 10;
    const pixelRadius = (thermalRadiusM / 35) * (w * 0.38);

    // Radial Thermal Diffusion Flame Gradient
    const thermalGrad = ctx.createRadialGradient(
      centerX,
      centerY,
      4,
      centerX,
      centerY,
      pixelRadius * 1.6
    );
    thermalGrad.addColorStop(0, 'rgba(255, 230, 150, 0.95)');
    thermalGrad.addColorStop(0.2, 'rgba(255, 159, 28, 0.85)');
    thermalGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.55)');
    thermalGrad.addColorStop(0.8, 'rgba(180, 40, 10, 0.25)');
    thermalGrad.addColorStop(1, 'rgba(0, 229, 255, 0.0)');

    ctx.beginPath();
    ctx.arc(centerX, centerY, pixelRadius * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = thermalGrad;
    ctx.fill();

    // Isotherm Contours
    [0.35, 0.65, 1.0, 1.35].forEach((factor, idx) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, pixelRadius * factor, 0, Math.PI * 2);
      ctx.strokeStyle = idx < 2 ? 'rgba(255, 159, 28, 0.45)' : 'rgba(0, 229, 255, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Wellbore Casing Pipe (Vertical)
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 8;
    ctx.fillRect(centerX - 3, 0, 6, centerY + 50);
    ctx.shadowBlur = 0;

    // Perforation Zone Steam Nozzles
    ctx.fillStyle = '#ff9f1c';
    for (let py = centerY - 30; py <= centerY + 30; py += 12) {
      ctx.fillRect(centerX - 8, py, 16, 3);
    }

    // Depth Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText(`${reservoirDepth - 15}m Overburden Shales`, 14, 25);
    ctx.fillText(`${reservoirDepth}m Heavy-Oil Sandstone Target`, 14, centerY);
    ctx.fillText(`${reservoirDepth + 20}m Underburden Limestone`, 14, h - 15);
  }, [soakDays, steamTemp, thermalRadiusM, peakChamberTemp, reservoirDepth]);

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
                Subsurface Thermal CFD Heatmap &amp; Steam Soak Diffusion
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              2D Radial Heat Conduction $T(r, t)$ &amp; In-Situ Heavy-Oil Viscosity Collapse Grid at {reservoirDepth}m Depth.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-subtle border border-cyan-500/20 text-xs font-mono text-cyan-300">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Optimal Restart Day: <b className="text-white">Day 8–10</b></span>
          </div>
        </div>
      </div>

      {/* Main Grid & Chart Display */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* 2D Thermal Diffusion Heatmap Canvas */}
        <div className="lg:col-span-7 glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-white">2D Radial Heat Diffusion Cross-Section</h3>
                <p className="text-xs text-cyan-200/60 font-mono mt-0.5">
                  Isothermal Contours &bull; Wellbore Perforation Centerline (980m TVD)
                </p>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full glass-pill text-amber-300 border border-amber-500/20">
                Thermal Radius: {thermalRadiusM.toFixed(1)}m
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-cyan-500/20 shadow-inner">
              <canvas ref={canvasRef} className="w-full block" />
            </div>
          </div>

          {/* Interactive Soak Days Slider */}
          <div className="mt-6 pt-4 border-t border-cyan-500/20 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-300 whitespace-nowrap">Thermal Soak Duration:</span>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={soakDays}
                onChange={(e) => {
                  soundFx.playClick();
                  setSoakDays(Number(e.target.value));
                }}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-amber-300 font-bold min-w-[70px]">{soakDays} Days</span>
            </div>
          </div>
        </div>

        {/* Viscosity vs Distance Curve & KPIs */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="glass rounded-3xl p-5 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-white">Radial Temperature Dissipation</h3>
              <span className="text-xs font-mono text-cyan-300">{peakChamberTemp.toFixed(1)}°C Peak</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mb-4">Temperature drop vs radial distance $r$</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={radialProfile}>
                  <defs>
                    <linearGradient id="heatGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff9f1c" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#ff9f1c" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                  <XAxis dataKey="radius_m" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Radial Distance (m)', position: 'insideBottom', offset: -4, fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[50, 320]} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(4, 15, 28, 0.95)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '16px',
                      fontSize: '11px'
                    }}
                  />
                  <Area type="monotone" dataKey="temperature_c" stroke="#ff9f1c" strokeWidth={2.5} fill="url(#heatGrad)" name="Temperature °C" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key CFD Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">In-Situ Viscosity</span>
              <b className="text-2xl font-mono text-emerald-300 mt-1 block">{Math.round(currentViscosityCp)} cP</b>
              <span className="text-[10px] font-mono text-slate-400">from 105,000 cP</span>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Heated Rock Vol</span>
              <b className="text-2xl font-mono text-cyan-300 mt-1 block">{Math.round(Math.PI * Math.pow(thermalRadiusM, 2) * 14)} m³</b>
              <span className="text-[10px] font-mono text-slate-400">Sandstone Matrix</span>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Heat Retention</span>
              <b className="text-2xl font-mono text-amber-300 mt-1 block">{Math.round((peakChamberTemp / steamTemp) * 100)}%</b>
              <span className="text-[10px] font-mono text-slate-400">Thermal Efficiency</span>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Steam Quality</span>
              <b className="text-2xl font-mono text-white mt-1 block">78.5%</b>
              <span className="text-[10px] font-mono text-slate-400">Downhole Dryness</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
