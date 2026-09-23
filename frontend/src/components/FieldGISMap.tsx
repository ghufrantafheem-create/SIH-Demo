import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  MapPin,
  Activity,
  Layers,
  Zap,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
  BarChart3
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface WellGIS {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'producing' | 'injecting' | 'soaking' | 'alert' | 'shutin';
  bopd: number;
  temp: number;
  pressure: number;
  sor: number;
}

export const FieldGISMap: React.FC<{ onSelectWell?: (id: string) => void }> = ({ onSelectWell }) => {
  const [selectedId, setSelectedId] = useState<string>('BGW-001');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 12 Wellheads distributed across Baghewala Thar Desert coordinates
  const wells: WellGIS[] = [
    { id: 'BGW-001', name: 'Well Pad 01 (Deep CSS)', x: 260, y: 190, status: 'producing', bopd: 142.5, temp: 84.2, pressure: 38.5, sor: 2.1 },
    { id: 'BGW-002', name: 'Well Pad 02 (Thermal Soak)', x: 380, y: 140, status: 'soaking', bopd: 0, temp: 185.0, pressure: 52.0, sor: 2.3 },
    { id: 'BGW-003', name: 'Well Pad 03 (High Watercut)', x: 190, y: 310, status: 'producing', bopd: 98.0, temp: 72.0, pressure: 34.0, sor: 2.8 },
    { id: 'BGW-004', name: 'Well Pad 04 (Steam Injection)', x: 510, y: 220, status: 'injecting', bopd: 0, temp: 310.0, pressure: 84.0, sor: 2.0 },
    { id: 'BGW-005', name: 'Well Pad 05 (Rod Float Alert)', x: 440, y: 340, status: 'alert', bopd: 85.0, temp: 64.0, pressure: 31.0, sor: 3.1 },
    { id: 'BGW-006', name: 'Well Pad 06 (Producing Peak)', x: 320, y: 260, status: 'producing', bopd: 168.0, temp: 92.0, pressure: 41.0, sor: 1.9 },
    { id: 'BGW-007', name: 'Well Pad 07 (Thermal Soak)', x: 600, y: 160, status: 'soaking', bopd: 0, temp: 198.0, pressure: 58.0, sor: 2.2 },
    { id: 'BGW-008', name: 'Well Pad 08 (Producing)', x: 150, y: 180, status: 'producing', bopd: 135.0, temp: 81.0, pressure: 37.0, sor: 2.4 },
    { id: 'BGW-009', name: 'Well Pad 09 (Steam Injection)', x: 390, y: 430, status: 'injecting', bopd: 0, temp: 305.0, pressure: 82.5, sor: 2.1 },
    { id: 'BGW-010', name: 'Well Pad 10 (Producing)', x: 530, y: 380, status: 'producing', bopd: 152.0, temp: 88.0, pressure: 39.0, sor: 2.0 },
    { id: 'BGW-011', name: 'Well Pad 11 (Workover Standby)', x: 670, y: 280, status: 'shutin', bopd: 0, temp: 58.0, pressure: 18.0, sor: 3.5 },
    { id: 'BGW-012', name: 'Well Pad 12 (Producing)', x: 270, y: 410, status: 'producing', bopd: 124.0, temp: 79.0, pressure: 35.0, sor: 2.5 }
  ];

  const centralBoiler = { x: 400, y: 280, name: 'Central Steam Boiler Plant (CSP Hybrid)' };
  const gatheringStation = { x: 350, y: 200, name: 'Baghewala Central Gathering Station (GGS)' };

  const filteredWells = statusFilter === 'all' ? wells : wells.filter((w) => w.status === statusFilter);
  const activeWell = wells.find((w) => w.id === selectedId) || wells[0];

  const totalFieldBopd = wells.reduce((acc, w) => acc + w.bopd, 0);
  const activeProducingCount = wells.filter((w) => w.status === 'producing').length;
  const activeInjectingCount = wells.filter((w) => w.status === 'injecting').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'producing':
        return '#10b981';
      case 'injecting':
        return '#ff9f1c';
      case 'soaking':
        return '#f59e0b';
      case 'alert':
        return '#f43f5e';
      default:
        return '#64748b';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <Compass size={22} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Thar Desert Multi-Well GIS Geospatial Satellite Map
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Baghewala Field &bull; 12 Wellheads &bull; Central Steam Boilers &bull; Gathering Station Pipeline Grid.
            </p>
          </div>

          {/* Status Filter Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              ['all', 'All Wells (12)'],
              ['producing', 'Producing'],
              ['injecting', 'Injecting'],
              ['soaking', 'Soaking'],
              ['alert', 'Alerts']
            ].map(([st, label]) => (
              <button
                key={st}
                onClick={() => {
                  soundFx.playClick();
                  setStatusFilter(st);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                  statusFilter === st
                    ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/40 font-bold'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map & Telemetry HUD */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Interactive Vector GIS Canvas */}
        <div className="lg:col-span-8 glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-white">Geospatial Infrastructure View</h3>
              <p className="text-xs text-cyan-200/60 font-mono mt-0.5">Click any wellpad node to inspect telemetry</p>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full glass-pill text-cyan-300 border border-cyan-500/20">
              Coordinates: 27°48'N, 71°52'E
            </span>
          </div>

          {/* SVG Map Canvas */}
          <div className="w-full bg-[#030814] rounded-2xl border border-cyan-500/20 overflow-hidden relative shadow-inner h-[460px]">
            <svg className="w-full h-full" viewBox="0 0 800 500">
              <defs>
                <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 229, 255, 0.04)" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Grid Background */}
              <rect width="800" height="500" fill="url(#gridPattern)" />

              {/* Pipeline Networks from Central Boiler to Wells (Dashed Steam Lines) */}
              {wells.map((w) => (
                <line
                  key={`steam-line-${w.id}`}
                  x1={centralBoiler.x}
                  y1={centralBoiler.y}
                  x2={w.x}
                  y2={w.y}
                  stroke={w.status === 'injecting' ? '#ff9f1c' : 'rgba(255, 159, 28, 0.2)'}
                  strokeWidth={w.status === 'injecting' ? '2.5' : '1.2'}
                  strokeDasharray={w.status === 'injecting' ? '6 4' : '3 3'}
                  className={w.status === 'injecting' ? 'animate-pulse' : ''}
                />
              ))}

              {/* Production Pipelines to Gathering Station (Cyan) */}
              {wells.map((w) => (
                <line
                  key={`prod-line-${w.id}`}
                  x1={gatheringStation.x}
                  y1={gatheringStation.y}
                  x2={w.x}
                  y2={w.y}
                  stroke={w.status === 'producing' ? '#00e5ff' : 'rgba(0, 229, 255, 0.15)'}
                  strokeWidth={w.status === 'producing' ? '2' : '1'}
                  strokeDasharray="4 2"
                />
              ))}

              {/* Central Steam Boiler Facility Node */}
              <g transform={`translate(${centralBoiler.x}, ${centralBoiler.y})`}>
                <circle r="18" fill="rgba(255, 159, 28, 0.2)" stroke="#ff9f1c" strokeWidth="2" />
                <rect x="-10" y="-10" width="20" height="20" rx="4" fill="#ff9f1c" />
                <text x="24" y="5" fill="#ff9f1c" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                  Central Boiler Plant
                </text>
              </g>

              {/* Central Gathering Station (GGS) Node */}
              <g transform={`translate(${gatheringStation.x}, ${gatheringStation.y})`}>
                <circle r="16" fill="rgba(0, 229, 255, 0.2)" stroke="#00e5ff" strokeWidth="2" />
                <polygon points="0,-10 10,8 -10,8" fill="#00e5ff" />
                <text x="22" y="4" fill="#00e5ff" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                  Baghewala GGS
                </text>
              </g>

              {/* Wellhead Nodes */}
              {filteredWells.map((w) => {
                const isSelected = selectedId === w.id;
                const col = getStatusColor(w.status);

                return (
                  <g
                    key={w.id}
                    transform={`translate(${w.x}, ${w.y})`}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedId(w.id);
                      if (onSelectWell) onSelectWell(w.id);
                    }}
                  >
                    {/* Glowing Selection Halo */}
                    {isSelected && (
                      <circle r="22" fill="none" stroke="#00e5ff" strokeWidth="2" strokeDasharray="3 3" className="animate-spin" />
                    )}
                    <circle r="12" fill="rgba(4, 15, 28, 0.9)" stroke={col} strokeWidth="2.5" />
                    <circle r="5" fill={col} />
                    <text
                      x="0"
                      y="-16"
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {w.id}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend Overlay */}
            <div className="absolute bottom-3 left-3 glass-pill p-2.5 rounded-xl border border-cyan-500/20 text-[10px] font-mono flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Producing</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> Steam Injection</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Soaking</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Alert</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Shut-in</span>
            </div>
          </div>
        </div>

        {/* Selected Well Telemetry HUD */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="glass rounded-3xl p-5 border border-cyan-500/20 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase">Selected Asset</span>
              <span
                className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase"
                style={{
                  color: getStatusColor(activeWell.status),
                  backgroundColor: `${getStatusColor(activeWell.status)}20`,
                  border: `1px solid ${getStatusColor(activeWell.status)}40`
                }}
              >
                {activeWell.status}
              </span>
            </div>
            <h3 className="font-extrabold text-2xl text-white font-mono">{activeWell.id}</h3>
            <p className="text-xs text-slate-300 font-mono mt-0.5">{activeWell.name}</p>

            <div className="mt-4 pt-4 border-t border-cyan-500/20 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Production:</span>
                <b className="text-cyan-300 text-sm">{activeWell.bopd} BOPD</b>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Bottomhole Temp:</span>
                <b className="text-amber-300 text-sm">{activeWell.temp} °C</b>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Casing Pressure:</span>
                <b className="text-white text-sm">{activeWell.pressure} bar</b>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Steam-Oil Ratio (SOR):</span>
                <b className="text-emerald-300 text-sm">{activeWell.sor}</b>
              </div>
            </div>
          </div>

          {/* Aggregated Field Overview */}
          <div className="glass rounded-3xl p-5 border border-cyan-500/20 shadow-xl">
            <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Field Summary &bull; Baghewala</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center font-mono">
              <div className="p-3 rounded-2xl glass-subtle border border-cyan-500/15">
                <span className="text-[10px] text-slate-400 block uppercase">Total Oil Flow</span>
                <b className="text-xl text-cyan-300 mt-1 block">{totalFieldBopd.toFixed(1)} BOPD</b>
              </div>
              <div className="p-3 rounded-2xl glass-subtle border border-cyan-500/15">
                <span className="text-[10px] text-slate-400 block uppercase">Active Wells</span>
                <b className="text-xl text-emerald-300 mt-1 block">{activeProducingCount} / 12</b>
              </div>
            </div>
          </div>

          <div className="glass-subtle rounded-2xl p-4 border border-cyan-500/15 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
              <Radio size={14} className="animate-pulse" /> SCADA Telemetry Mesh
            </div>
            High-speed wireless Modbus telemetry repeater links operational across all 12 wellhead pads.
          </div>
        </div>
      </div>
    </div>
  );
};
