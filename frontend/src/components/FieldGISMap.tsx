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
  BarChart3,
  XCircle,
  Droplets
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface WellGIS {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'producing' | 'injecting' | 'soaking' | 'alert' | 'ended';
  bopd: number;
  temp: number;
  pressure: number;
  sor: number;
  hasOil: boolean;
  notes?: string;
}

export const FieldGISMap: React.FC<{ onSelectWell?: (id: string) => void }> = ({ onSelectWell }) => {
  const [selectedId, setSelectedId] = useState<string>('BGW-001');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 35 Wellhead pads: 28 active (have oil), 7 ended
  const wells: WellGIS[] = [
    // 28 Wells that currently have oil
    { id: 'BGW-001', name: 'Well Pad 01 (Deep CSS)', x: 250, y: 170, status: 'producing', bopd: 142.5, temp: 84.2, pressure: 38.5, sor: 2.1, hasOil: true },
    { id: 'BGW-002', name: 'Well Pad 02 (Thermal Soak)', x: 340, y: 130, status: 'soaking', bopd: 65.0, temp: 185.0, pressure: 52.0, sor: 2.3, hasOil: true },
    { id: 'BGW-003', name: 'Well Pad 03 (Heavy Crude)', x: 180, y: 270, status: 'producing', bopd: 98.0, temp: 72.0, pressure: 34.0, sor: 2.8, hasOil: true },
    { id: 'BGW-004', name: 'Well Pad 04 (Steam Injection)', x: 480, y: 190, status: 'injecting', bopd: 45.0, temp: 310.0, pressure: 84.0, sor: 2.0, hasOil: true },
    { id: 'BGW-005', name: 'Well Pad 05 (Rod Float Alert)', x: 410, y: 310, status: 'alert', bopd: 85.0, temp: 64.0, pressure: 31.0, sor: 3.1, hasOil: true },
    { id: 'BGW-006', name: 'Well Pad 06 (Producing Peak)', x: 300, y: 240, status: 'producing', bopd: 168.0, temp: 92.0, pressure: 41.0, sor: 1.9, hasOil: true },
    { id: 'BGW-007', name: 'Well Pad 07 (Thermal Soak)', x: 570, y: 140, status: 'soaking', bopd: 78.0, temp: 198.0, pressure: 58.0, sor: 2.2, hasOil: true },
    { id: 'BGW-008', name: 'Well Pad 08 (Producing)', x: 140, y: 160, status: 'producing', bopd: 135.0, temp: 81.0, pressure: 37.0, sor: 2.4, hasOil: true },
    { id: 'BGW-009', name: 'Well Pad 09 (Steam Injection)', x: 370, y: 390, status: 'injecting', bopd: 52.0, temp: 305.0, pressure: 82.5, sor: 2.1, hasOil: true },
    { id: 'BGW-010', name: 'Well Pad 10 (Producing)', x: 500, y: 350, status: 'producing', bopd: 152.0, temp: 88.0, pressure: 39.0, sor: 2.0, hasOil: true },
    { id: 'BGW-011', name: 'Well Pad 11 (High Yield)', x: 630, y: 250, status: 'producing', bopd: 164.0, temp: 89.0, pressure: 40.5, sor: 2.2, hasOil: true },
    { id: 'BGW-012', name: 'Well Pad 12 (Producing)', x: 250, y: 370, status: 'producing', bopd: 124.0, temp: 79.0, pressure: 35.0, sor: 2.5, hasOil: true },
    { id: 'BGW-013', name: 'Well Pad 13 (Cycle 2 CSS)', x: 190, y: 110, status: 'producing', bopd: 138.0, temp: 82.5, pressure: 36.5, sor: 2.3, hasOil: true },
    { id: 'BGW-014', name: 'Well Pad 14 (Thermal Soak)', x: 420, y: 90, status: 'soaking', bopd: 72.0, temp: 192.0, pressure: 54.0, sor: 2.1, hasOil: true },
    { id: 'BGW-015', name: 'Well Pad 15 (Producing)', x: 510, y: 110, status: 'producing', bopd: 145.0, temp: 85.0, pressure: 38.0, sor: 2.0, hasOil: true },
    { id: 'BGW-016', name: 'Well Pad 16 (Producing)', x: 110, y: 230, status: 'producing', bopd: 112.0, temp: 77.0, pressure: 33.0, sor: 2.6, hasOil: true },
    { id: 'BGW-017', name: 'Well Pad 17 (Steam Injection)', x: 220, y: 440, status: 'injecting', bopd: 48.0, temp: 308.0, pressure: 83.0, sor: 2.2, hasOil: true },
    { id: 'BGW-018', name: 'Well Pad 18 (Producing Peak)', x: 330, y: 450, status: 'producing', bopd: 172.0, temp: 91.5, pressure: 42.0, sor: 1.8, hasOil: true },
    { id: 'BGW-019', name: 'Well Pad 19 (Thermal Soak)', x: 450, y: 440, status: 'soaking', bopd: 68.0, temp: 188.0, pressure: 53.5, sor: 2.2, hasOil: true },
    { id: 'BGW-020', name: 'Well Pad 20 (Producing)', x: 580, y: 410, status: 'producing', bopd: 139.0, temp: 83.0, pressure: 37.0, sor: 2.4, hasOil: true },
    { id: 'BGW-021', name: 'Well Pad 21 (Cycle 3 CSS)', x: 670, y: 350, status: 'producing', bopd: 128.0, temp: 80.0, pressure: 36.0, sor: 2.5, hasOil: true },
    { id: 'BGW-022', name: 'Well Pad 22 (High Pressure)', x: 690, y: 180, status: 'producing', bopd: 158.0, temp: 87.0, pressure: 41.5, sor: 2.0, hasOil: true },
    { id: 'BGW-023', name: 'Well Pad 23 (Producing)', x: 610, y: 90, status: 'producing', bopd: 130.0, temp: 81.0, pressure: 36.5, sor: 2.3, hasOil: true },
    { id: 'BGW-024', name: 'Well Pad 24 (Thermal Soak)', x: 120, y: 350, status: 'soaking', bopd: 82.0, temp: 182.0, pressure: 51.0, sor: 2.2, hasOil: true },
    { id: 'BGW-025', name: 'Well Pad 25 (Producing)', x: 160, y: 410, status: 'producing', bopd: 146.0, temp: 86.0, pressure: 38.5, sor: 2.1, hasOil: true },
    { id: 'BGW-026', name: 'Well Pad 26 (Producing)', x: 280, y: 90, status: 'producing', bopd: 119.0, temp: 78.5, pressure: 35.0, sor: 2.5, hasOil: true },
    { id: 'BGW-027', name: 'Well Pad 27 (Steam Injection)', x: 470, y: 260, status: 'injecting', bopd: 55.0, temp: 312.0, pressure: 85.0, sor: 1.9, hasOil: true },
    { id: 'BGW-028', name: 'Well Pad 28 (Producing Peak)', x: 570, y: 300, status: 'producing', bopd: 165.0, temp: 90.0, pressure: 41.0, sor: 1.9, hasOil: true },

    // 7 Remaining Wells that are ENDED (0 BOPD, Depleted / Mature)
    { id: 'BGW-029', name: 'Well Pad 29 (Watered-Out)', x: 80, y: 90, status: 'ended', bopd: 0.0, temp: 38.5, pressure: 11.2, sor: 0.0, hasOil: false, notes: 'Watered-out (99.5% water cut) after 9 thermal cycles. Production ended.' },
    { id: 'BGW-030', name: 'Well Pad 30 (Depleted)', x: 90, y: 440, status: 'ended', bopd: 0.0, temp: 37.0, pressure: 9.8, sor: 0.0, hasOil: false, notes: 'Formation pressure collapse below economic threshold. Production ended.' },
    { id: 'BGW-031', name: 'Well Pad 31 (Sand Severed)', x: 710, y: 110, status: 'ended', bopd: 0.0, temp: 36.5, pressure: 8.5, sor: 0.0, hasOil: false, notes: 'Severe sand influx bridged bottomhole assembly. Decommissioned & ended.' },
    { id: 'BGW-032', name: 'Well Pad 32 (Mature Depleted)', x: 720, y: 430, status: 'ended', bopd: 0.0, temp: 39.0, pressure: 10.4, sor: 0.0, hasOil: false, notes: 'Cycle 8 thermal depletion reached. Production officially ended.' },
    { id: 'BGW-033', name: 'Well Pad 33 (Casing Severed)', x: 740, y: 280, status: 'ended', bopd: 0.0, temp: 36.0, pressure: 7.8, sor: 0.0, hasOil: false, notes: 'Downhole casing parted due to corrosion wear. Production ended.' },
    { id: 'BGW-034', name: 'Well Pad 34 (Economic Cutoff)', x: 60, y: 190, status: 'ended', bopd: 0.0, temp: 37.5, pressure: 9.2, sor: 0.0, hasOil: false, notes: 'Marginal cutoff reached; cold heavy crude immobile. Production ended.' },
    { id: 'BGW-035', name: 'Well Pad 35 (Formation Exhausted)', x: 50, y: 310, status: 'ended', bopd: 0.0, temp: 35.8, pressure: 8.0, sor: 0.0, hasOil: false, notes: 'Local heavy-oil saturation exhausted. Final well plugging completed.' }
  ];

  const centralBoiler = { x: 380, y: 260, name: 'Central Steam Boiler Plant (CSP Hybrid)' };
  const gatheringStation = { x: 340, y: 190, name: 'Baghewala Central Gathering Station (GGS)' };

  const filteredWells =
    statusFilter === 'all'
      ? wells
      : statusFilter === 'active_oil'
      ? wells.filter((w) => w.hasOil)
      : statusFilter === 'ended'
      ? wells.filter((w) => !w.hasOil)
      : wells.filter((w) => w.status === statusFilter);

  const activeWell = wells.find((w) => w.id === selectedId) || wells[0];

  const totalFieldBopd = wells.filter((w) => w.hasOil).reduce((acc, w) => acc + w.bopd, 0);
  const activeOilWellsCount = wells.filter((w) => w.hasOil).length;
  const endedWellsCount = wells.filter((w) => !w.hasOil).length;

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
      case 'ended':
        return '#64748b';
      default:
        return '#475569';
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
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Thar Desert Multi-Well GIS Satellite Map
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  35 Wells Fleet
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Baghewala Field &bull; 28 Wells Currently Have Oil &bull; 7 Wells Ended &bull; GGS &amp; Central Steam Grid
            </p>
          </div>

          {/* Status Filter Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              ['all', 'All Wells (35)'],
              ['active_oil', 'Have Oil (28)'],
              ['ended', 'Ended (7)'],
              ['producing', 'Producing'],
              ['soaking', 'Soaking'],
              ['injecting', 'Injecting']
            ].map(([st, label]) => (
              <button
                key={st}
                onClick={() => {
                  soundFx.playClick();
                  setStatusFilter(st);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border ${
                  statusFilter === st
                    ? st === 'ended'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-400/40 font-bold'
                      : 'bg-cyan-500/25 text-cyan-300 border-cyan-400/40 font-bold'
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
              <h3 className="font-bold text-base text-white">Geospatial Infrastructure View (35 Wells)</h3>
              <p className="text-xs text-cyan-200/60 font-mono mt-0.5">Click any wellpad node to inspect telemetry</p>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full glass-pill text-cyan-300 border border-cyan-500/20">
              Coordinates: 27°48'N, 71°52'E
            </span>
          </div>

          {/* SVG Map Canvas */}
          <div className="w-full bg-[#030814] rounded-2xl border border-cyan-500/20 overflow-hidden relative shadow-inner h-[500px]">
            <svg className="w-full h-full" viewBox="0 0 800 520">
              <defs>
                <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 229, 255, 0.04)" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Grid Background */}
              <rect width="800" height="520" fill="url(#gridPattern)" />

              {/* Pipeline Networks from Central Boiler to Active Wells (Dashed Steam Lines) */}
              {wells.filter((w) => w.hasOil).map((w) => (
                <line
                  key={`steam-${w.id}`}
                  x1={centralBoiler.x}
                  y1={centralBoiler.y}
                  x2={w.x}
                  y2={w.y}
                  stroke="rgba(255, 159, 28, 0.15)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Emulsion Pipelines to GGS (Active Wells Only) */}
              {wells.filter((w) => w.hasOil).map((w) => (
                <line
                  key={`pipe-${w.id}`}
                  x1={w.x}
                  y1={w.y}
                  x2={gatheringStation.x}
                  y2={gatheringStation.y}
                  stroke="rgba(0, 229, 255, 0.22)"
                  strokeWidth="2"
                />
              ))}

              {/* Central Steam Boiler Plant Icon */}
              <g transform={`translate(${centralBoiler.x}, ${centralBoiler.y})`}>
                <rect x="-18" y="-18" width="36" height="36" rx="10" fill="#ff9f1c" fillOpacity="0.25" stroke="#ff9f1c" strokeWidth="2" />
                <circle cx="0" cy="0" r="8" fill="#ff9f1c" />
                <text x="0" y="28" textAnchor="middle" fill="#ff9f1c" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                  BOILER PLANT
                </text>
              </g>

              {/* Central Gathering Station (GGS) Icon */}
              <g transform={`translate(${gatheringStation.x}, ${gatheringStation.y})`}>
                <rect x="-20" y="-20" width="40" height="40" rx="12" fill="#00e5ff" fillOpacity="0.25" stroke="#00e5ff" strokeWidth="2" />
                <circle cx="0" cy="0" r="9" fill="#00e5ff" />
                <text x="0" y="30" textAnchor="middle" fill="#00e5ff" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                  GGS GATHERING
                </text>
              </g>

              {/* Render All 35 Wellpads */}
              {filteredWells.map((w) => {
                const isSelected = selectedId === w.id;
                const color = getStatusColor(w.status);

                return (
                  <g
                    key={w.id}
                    transform={`translate(${w.x}, ${w.y})`}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedId(w.id);
                      if (onSelectWell) onSelectWell(w.id);
                    }}
                    className="cursor-pointer transition-transform hover:scale-125"
                  >
                    {/* Active Pulse Ring for producing/injecting wells */}
                    {w.hasOil && (
                      <circle
                        cx="0"
                        cy="0"
                        r={isSelected ? 18 : 12}
                        fill="none"
                        stroke={color}
                        strokeWidth="1.5"
                        strokeOpacity="0.4"
                        className="animate-ping"
                      />
                    )}

                    {/* Wellhead Marker Dot */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? 10 : 7}
                      fill={color}
                      stroke="#030814"
                      strokeWidth="2"
                    />

                    {/* Ended Marker X mark */}
                    {!w.hasOil && (
                      <circle
                        cx="0"
                        cy="0"
                        r="9"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Label */}
                    <text
                      x="0"
                      y={w.y > 450 ? -12 : 18}
                      textAnchor="middle"
                      fill={w.hasOil ? '#e2e8f0' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      {w.id}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend Overlay */}
            <div className="absolute bottom-3 left-3 glass-pill p-2.5 rounded-xl border border-cyan-500/20 text-[10px] font-mono flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Producing ({wells.filter((w) => w.status === 'producing').length})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Soaking ({wells.filter((w) => w.status === 'soaking').length})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> Steam Injection ({wells.filter((w) => w.status === 'injecting').length})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Alert ({wells.filter((w) => w.status === 'alert').length})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Ended / Depleted ({endedWellsCount})</span>
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
                {activeWell.hasOil ? activeWell.status : 'PRODUCTION ENDED'}
              </span>
            </div>
            <h3 className="font-extrabold text-2xl text-white font-mono">{activeWell.id}</h3>
            <p className="text-xs text-slate-300 font-mono mt-0.5">{activeWell.name}</p>

            <div className="mt-4 pt-4 border-t border-cyan-500/20 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Production:</span>
                <b className={`text-sm ${activeWell.hasOil ? 'text-cyan-300' : 'text-slate-400'}`}>
                  {activeWell.bopd} BOPD
                </b>
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
                <span className="text-slate-400">Asset Status:</span>
                <b className={activeWell.hasOil ? 'text-emerald-300 text-sm' : 'text-rose-400 text-sm'}>
                  {activeWell.hasOil ? 'Active Oil Well' : 'Depleted / Ended'}
                </b>
              </div>
            </div>

            {activeWell.notes && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] font-mono text-rose-200">
                {activeWell.notes}
              </div>
            )}
          </div>

          {/* Aggregated Field Overview */}
          <div className="glass rounded-3xl p-5 border border-cyan-500/20 shadow-xl">
            <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Baghewala Field Summary (35 Wells)</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center font-mono">
              <div className="p-3 rounded-2xl glass-subtle border border-cyan-500/15">
                <span className="text-[10px] text-slate-400 block uppercase">Active Oil Wells</span>
                <b className="text-xl text-emerald-400 mt-1 block">28 / 35</b>
              </div>
              <div className="p-3 rounded-2xl glass-subtle border border-cyan-500/15">
                <span className="text-[10px] text-slate-400 block uppercase">Ended Wells</span>
                <b className="text-xl text-rose-400 mt-1 block">7 / 35</b>
              </div>
              <div className="p-3 rounded-2xl glass-subtle border border-cyan-500/15 col-span-2">
                <span className="text-[10px] text-slate-400 block uppercase">Total Active Field BOPD</span>
                <b className="text-xl text-cyan-300 mt-1 block">{totalFieldBopd.toFixed(1)} BOPD</b>
              </div>
            </div>
          </div>

          <div className="glass-subtle rounded-2xl p-4 border border-cyan-500/15 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
              <Radio size={14} className="animate-pulse" /> SCADA Telemetry Mesh
            </div>
            Active wireless telemetry streaming across all 28 producing pads; 7 decommissioned wellheads monitored for surface integrity.
          </div>
        </div>
      </div>
    </div>
  );
};
