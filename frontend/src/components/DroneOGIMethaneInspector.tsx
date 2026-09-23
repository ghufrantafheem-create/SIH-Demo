import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation,
  Eye,
  Camera,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Sliders,
  Plane,
  Play,
  RotateCcw
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface LeakTarget {
  id: string;
  pad: string;
  component: string;
  rate_kg_hr: number;
  x: number;
  y: number;
  epa_status: 'Minor Leak' | 'Major Fugitive' | 'Nominal';
}

export const DroneOGIMethaneInspector: React.FC = () => {
  const [thermalMode, setThermalMode] = useState<boolean>(true);
  const [activeWaypoint, setActiveWaypoint] = useState<number>(1);
  const [droneFlying, setDroneFlying] = useState<boolean>(true);
  const [selectedLeak, setSelectedLeak] = useState<LeakTarget | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const targets: LeakTarget[] = [
    { id: 'LK-01', pad: 'BGW-002', component: 'Stuffing Box Packing', rate_kg_hr: 3.4, x: 140, y: 110, epa_status: 'Major Fugitive' },
    { id: 'LK-02', pad: 'BGW-005', component: 'Casinghead Flange Gasket', rate_kg_hr: 0.8, x: 280, y: 170, epa_status: 'Minor Leak' },
    { id: 'LK-03', pad: 'GGS-HDR', component: 'Separator Relief Valve Seat', rate_kg_hr: 4.6, x: 420, y: 80, epa_status: 'Major Fugitive' },
    { id: 'LK-04', pad: 'BGW-008', component: 'Wellhead Christmas Tree Wing Valve', rate_kg_hr: 0.2, x: 210, y: 220, epa_status: 'Nominal' }
  ];

  // Animated Drone Flight & Plume Dispersion Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background Grid / Terrain
      ctx.fillStyle = thermalMode ? '#030712' : '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid Lines
      ctx.strokeStyle = thermalMode ? 'rgba(0, 229, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw Flight Path
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(80, 80);
      ctx.lineTo(140, 110);
      ctx.lineTo(280, 170);
      ctx.lineTo(420, 80);
      ctx.lineTo(210, 220);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Well Pads & Fugitive Plumes
      targets.forEach((tgt) => {
        // Equipment footprint
        ctx.fillStyle = '#334155';
        ctx.fillRect(tgt.x - 14, tgt.y - 14, 28, 28);
        ctx.strokeStyle = tgt.rate_kg_hr > 2.0 ? '#ef4444' : '#00e5ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(tgt.x - 14, tgt.y - 14, 28, 28);

        // Animated Methane Gas Plume (Gaussian drift with wind)
        if (tgt.rate_kg_hr > 0.5) {
          const plumeLength = tgt.rate_kg_hr * 12;
          for (let p = 0; p < 5; p++) {
            const px = tgt.x + p * 8 + Math.sin(frame * 0.1 + p) * 4;
            const py = tgt.y - p * 3 + Math.cos(frame * 0.08 + p) * 3;
            const radius = 6 + p * 3;

            ctx.fillStyle = thermalMode
              ? `rgba(255, 80, 80, ${0.45 - p * 0.08})`
              : `rgba(200, 200, 255, ${0.25 - p * 0.04})`;
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        ctx.fillText(tgt.pad, tgt.x - 18, tgt.y + 26);
      });

      // Drone Position Interpolation along Waypoints
      const droneProgress = (frame * 0.008) % 4;
      const curWpIdx = Math.floor(droneProgress);
      const nextWpIdx = (curWpIdx + 1) % 4;
      const lerp = droneProgress - curWpIdx;

      const curT = targets[curWpIdx];
      const nextT = targets[nextWpIdx];
      const dx = curT.x + (nextT.x - curT.x) * lerp;
      const dy = curT.y + (nextT.y - curT.y) * lerp;

      // Drone Reticle
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(dx, dy, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Drone Target Crosshairs
      ctx.beginPath();
      ctx.moveTo(dx - 24, dy);
      ctx.lineTo(dx + 24, dy);
      ctx.moveTo(dx, dy - 24);
      ctx.lineTo(dx, dy + 24);
      ctx.stroke();

      // Drone Icon Dot
      ctx.fillStyle = '#ff9f1c';
      ctx.beginPath();
      ctx.arc(dx, dy, 4, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [thermalMode]);

  const totalFugitiveLossKgHr = parseFloat(
    targets.reduce((acc, cur) => acc + cur.rate_kg_hr, 0).toFixed(1)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1">
              <Navigation size={14} /> Autonomous Aerial Survey & Optical Gas Imaging (OGI)
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Autonomous Drone Methane & VOC Inspector
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                FLIR GF320 · Waypoint Patrol
              </span>
            </h2>
            <p className="text-xs text-cyan-200/60 font-mono mt-1">
              Narrowband 3.2–3.4 µm infrared spectrometry · EPA Method 21 fugitive leak quantification & auto-tagging
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundFx.playClick();
                setThermalMode(!thermalMode);
              }}
              onMouseEnter={() => soundFx.playHover()}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                thermalMode
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  : 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              <Camera size={14} /> {thermalMode ? 'OGI False-Color Gas Mode' : 'Standard Visual Spectrum'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Total Fugitive Methane</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-rose-400">{totalFugitiveLossKgHr}</b>
            <span className="text-xs font-mono text-slate-400">kg / hr</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Across 12 monitored wellhead pads
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Flight Mission Altitude</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-cyan-300">22.5</b>
            <span className="text-xs font-mono text-slate-400">m AGL</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Wind: 4.2 m/s North-East
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Critical Fugitives Detected</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-amber-300">2 Sites</b>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Stuffing box & separator seat
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Drone Battery & Telemetry</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-emerald-400">84%</b>
            <span className="text-xs font-mono text-slate-400">28 min flight remaining</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            RTK GPS 2cm precision
          </span>
        </div>
      </div>

      {/* Main Mission Canvas & Leak Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Flight Viewport (2 Cols) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Activity className="text-cyan-400" size={18} /> Live Aerial OGI Telemetry Stream
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
              3.2 µm Optical Gas Imaging
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-950">
            <canvas
              ref={canvasRef}
              width={560}
              height={300}
              className="w-full h-80 block"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg text-rose-400 border border-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-rose-500 pulse" /> REC · OGI CAMERA STREAM
            </div>
            <div className="absolute bottom-3 right-3 text-[10px] font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg text-cyan-300 border border-cyan-500/30">
              AUTOPILOT: MISSION ACTIVE
            </div>
          </div>
        </div>

        {/* Fugitive Leaks Table (1 Col) */}
        <div className="glass rounded-3xl p-6 border border-cyan-500/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <AlertTriangle className="text-amber-400" size={18} /> Detected Leak Inventory
            </div>
            <p className="text-[11px] font-mono text-cyan-200/60 mb-3">
              EPA Method 21 classified points requiring LDAR maintenance.
            </p>

            <div className="space-y-2">
              {targets.map((tgt) => (
                <div
                  key={tgt.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedLeak(tgt);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedLeak?.id === tgt.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <b className="text-xs font-mono block">{tgt.pad} · {tgt.component}</b>
                      <span className="text-[10px] font-mono text-slate-400">{tgt.id}</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        tgt.epa_status === 'Major Fugitive'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : tgt.epa_status === 'Minor Leak'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {tgt.rate_kg_hr} kg/hr
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => soundFx.playSuccess()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/40 text-rose-200 text-xs font-mono font-bold hover:bg-rose-500/30 transition-all cursor-pointer text-center"
          >
            Dispatch LDAR Maintenance Crew
          </button>
        </div>
      </div>
    </div>
  );
};
