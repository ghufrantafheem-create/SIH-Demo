import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Radio,
  Thermometer,
  Activity,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Play,
  Pause
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

export const FiberOpticDTSDASViewer: React.FC<{ wellId?: string }> = ({ wellId = 'BGW-001' }) => {
  const [mode, setMode] = useState<'DTS' | 'DAS'>('DTS');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedDepth, setSelectedDepth] = useState<number>(850);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render 2D Depth-Time Waterfall on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let timeOffset = 0;

    const render = () => {
      if (isPlaying) timeOffset += 0.5;

      const width = canvas.width;
      const height = canvas.height;
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      for (let y = 0; y < height; y++) {
        // y corresponds to depth (0 to 980m)
        const depthNorm = y / height;
        const depthM = depthNorm * 980;

        for (let x = 0; x < width; x++) {
          // x corresponds to time
          const t = (x + timeOffset) * 0.05;

          let val = 0;
          if (mode === 'DTS') {
            // DTS Temperature (°C): Deep perforation zone (820m-950m) receives steam injection
            const steamZone = depthM > 800 && depthM < 960 ? 1.0 : 0.2;
            val = (Math.sin(t * 0.3) * 0.15 + 0.85) * steamZone + depthNorm * 0.3;
          } else {
            // DAS Acoustic Intensity: High frequency noise near perforated intervals and pump seating
            const noise = Math.sin(x * 0.3 + y * 0.2 + t * 2) * Math.cos(y * 0.5);
            const leakSpike = depthM > 840 && depthM < 860 ? Math.random() * 0.8 : 0.1;
            val = Math.min(1.0, Math.abs(noise * 0.4) + leakSpike);
          }

          const idx = (y * width + x) * 4;

          if (mode === 'DTS') {
            // Color map: Dark Blue (Cold ~35°C) -> Cyan -> Amber -> Bright Red (~280°C)
            data[idx] = Math.floor(Math.min(255, val * 320)); // R
            data[idx + 1] = Math.floor(Math.min(255, (1 - val) * 200 + val * 100)); // G
            data[idx + 2] = Math.floor(Math.min(255, (1 - val) * 255)); // B
            data[idx + 3] = 255;
          } else {
            // DAS Color Map: Deep Violet -> Neon Cyan -> White
            data[idx] = Math.floor(val * 180);
            data[idx + 1] = Math.floor(val * 240);
            data[idx + 2] = Math.floor(val * 255);
            data[idx + 3] = 255;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Draw Selected Depth Line
      const selY = (selectedDepth / 980) * height;
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, selY);
      ctx.lineTo(width, selY);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [mode, isPlaying, selectedDepth]);

  // Current Depth Slice Profile
  const depthProfile = [
    { depth_m: 100, temp_c: 42, acoustic_db: 18 },
    { depth_m: 300, temp_c: 54, acoustic_db: 22 },
    { depth_m: 500, temp_c: 68, acoustic_db: 26 },
    { depth_m: 700, temp_c: 95, acoustic_db: 34 },
    { depth_m: 820, temp_c: 185, acoustic_db: 62 },
    { depth_m: 850, temp_c: 264, acoustic_db: 88 }, // Steam Influx Peak
    { depth_m: 900, temp_c: 242, acoustic_db: 58 },
    { depth_m: 980, temp_c: 120, acoustic_db: 45 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1">
              <Radio size={14} /> Downhole Optoelectronics & Fiber-Optic Telemetry
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Distributed Temperature & Acoustic Sensing (DTS/DAS)
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                {wellId} · Coherent OTDR
              </span>
            </h2>
            <p className="text-xs text-cyan-200/60 font-mono mt-1">
              Continuous 980m fiber interrogator · Steam chamber conformance & high-frequency acoustic leak detection
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-xl glass-subtle p-1 border border-cyan-500/20">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setMode('DTS');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  mode === 'DTS'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                DTS (Thermal)
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setMode('DAS');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  mode === 'DAS'
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                DAS (Acoustic)
              </button>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                setIsPlaying(!isPlaying);
              }}
              className="p-2.5 rounded-xl glass-subtle text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/10 cursor-pointer"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Peak Heel-to-Toe Temp</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-amber-300">264.2</b>
            <span className="text-xs font-mono text-slate-400">°C at 850m</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">Steam entry perforation zone</span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Fiber Spatial Resolution</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-cyan-300">0.50</b>
            <span className="text-xs font-mono text-slate-400">meters</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">1,960 discrete interrogation bins</span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">DAS Acoustic Anomaly</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-emerald-400">88 dB</b>
            <span className="text-xs font-mono text-slate-400">at 2.4 kHz</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">Steam nozzle turbulent jetting</span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Fiber Optic Cable Health</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-cyan-300">100%</b>
            <span className="text-xs font-mono text-slate-400">0.18 dB/km loss</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">Polyimide high-temp coating</span>
        </div>
      </div>

      {/* Main Waterfall Display & Depth Slice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2D Canvas Waterfall Heatmap (2 Cols) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Activity className="text-cyan-400" size={18} />
              {mode === 'DTS' ? 'DTS Raman Thermal Waterfall (0 to 980 m)' : 'DAS Acoustic Spectrogram (0 to 980 m)'}
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
              Live Interrogator Feed
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-950">
            <canvas
              ref={canvasRef}
              width={500}
              height={280}
              className="w-full h-72 block cursor-crosshair"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                const depth = Math.round((clickY / rect.height) * 980);
                setSelectedDepth(depth);
                soundFx.playClick();
              }}
            />
            <div className="absolute top-2 left-2 text-[9px] font-mono bg-slate-950/80 px-2 py-1 rounded text-cyan-300 border border-cyan-500/30">
              Depth: 0m (Surface)
            </div>
            <div className="absolute bottom-2 left-2 text-[9px] font-mono bg-slate-950/80 px-2 py-1 rounded text-cyan-300 border border-cyan-500/30">
              Depth: 980m (Total Depth)
            </div>
            <div className="absolute bottom-2 right-2 text-[9px] font-mono bg-slate-950/80 px-2 py-1 rounded text-amber-300 border border-amber-500/30">
              Selected Depth: {selectedDepth}m
            </div>
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            * Click anywhere on the spectrogram canvas to select and inspect the local wellbore depth profile.
          </p>
        </div>

        {/* Depth Slice Line Chart (1 Col) */}
        <div className="glass rounded-3xl p-6 border border-cyan-500/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <Thermometer className="text-amber-400" size={18} /> Depth Slice Trajectory
            </div>
            <p className="text-[11px] font-mono text-cyan-200/60 mb-2">
              Wellbore profile showing thermal peak at steam injection interval.
            </p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  layout="vertical"
                  data={depthProfile}
                  margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    unit={mode === 'DTS' ? '°C' : 'dB'}
                  />
                  <YAxis
                    dataKey="depth_m"
                    type="category"
                    stroke="#64748b"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    reversed
                    unit="m"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#040914',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={mode === 'DTS' ? 'temp_c' : 'acoustic_db'}
                    name={mode === 'DTS' ? 'Temperature (°C)' : 'Acoustic (dB)'}
                    stroke={mode === 'DTS' ? '#ff9f1c' : '#00e5ff'}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: mode === 'DTS' ? '#ff9f1c' : '#00e5ff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-200">
            Selected depth <b className="text-white">{selectedDepth}m</b> reflects active steam conformance.
          </div>
        </div>
      </div>
    </div>
  );
};
