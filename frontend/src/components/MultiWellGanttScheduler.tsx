import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Activity,
  Layers,
  Sparkles,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface WellSchedule {
  id: string;
  name: string;
  phase: 'injection' | 'soak' | 'production' | 'standby';
  startDay: number;
  durationDays: number;
  steamDemandTons: number;
}

export const MultiWellGanttScheduler: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number>(10);

  const schedules: WellSchedule[] = [
    { id: 'BGW-001', name: 'Well Pad 01', phase: 'production', startDay: 8, durationDays: 22, steamDemandTons: 0 },
    { id: 'BGW-002', name: 'Well Pad 02', phase: 'soak', startDay: 5, durationDays: 10, steamDemandTons: 0 },
    { id: 'BGW-003', name: 'Well Pad 03', phase: 'production', startDay: 1, durationDays: 30, steamDemandTons: 0 },
    { id: 'BGW-004', name: 'Well Pad 04', phase: 'injection', startDay: 7, durationDays: 6, steamDemandTons: 45 },
    { id: 'BGW-005', name: 'Well Pad 05', phase: 'production', startDay: 4, durationDays: 24, steamDemandTons: 0 },
    { id: 'BGW-006', name: 'Well Pad 06', phase: 'injection', startDay: 10, durationDays: 5, steamDemandTons: 40 },
    { id: 'BGW-007', name: 'Well Pad 07', phase: 'soak', startDay: 3, durationDays: 11, steamDemandTons: 0 },
    { id: 'BGW-008', name: 'Well Pad 08', phase: 'production', startDay: 1, durationDays: 28, steamDemandTons: 0 }
  ];

  // Check for inter-well interference (e.g. BGW-004 and BGW-006 injecting simultaneously on day 10-12)
  const isInterferenceRisk = selectedDay >= 10 && selectedDay <= 12;

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'injection':
        return 'bg-orange-500 border-orange-400 text-orange-200';
      case 'soak':
        return 'bg-amber-500 border-amber-400 text-amber-200';
      case 'production':
        return 'bg-emerald-500 border-emerald-400 text-emerald-200';
      default:
        return 'bg-slate-600 border-slate-500 text-slate-300';
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
                <Calendar size={22} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Multi-Well Cyclic Steam Schedule Gantt &amp; Interference Interlock
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              30-Day Coordination Board &bull; Steam Breakthrough Avoidance &bull; Boiler Peak-Shaving.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-subtle border border-cyan-500/20 text-xs font-mono">
            <span className="text-slate-400">Inspecting Day:</span>
            <b className="text-cyan-300 text-sm">Day {selectedDay}</b>
          </div>
        </div>
      </div>

      {/* Main Gantt Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-white">30-Day Field Operations Timeline</h3>
              <p className="text-xs text-cyan-200/60 font-mono mt-0.5">
                Injection (Orange) &bull; Soak (Amber) &bull; Production (Emerald)
              </p>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full glass-pill text-cyan-300 border border-cyan-500/20">
              8 Managed Wells
            </span>
          </div>

          {/* Gantt Matrix */}
          <div className="space-y-3 font-mono text-xs overflow-x-auto">
            {/* Days Header */}
            <div className="flex items-center pb-2 border-b border-cyan-500/20 text-[10px] text-slate-500">
              <span className="w-24 shrink-0 font-bold">ASSET ID</span>
              <div className="flex-1 grid grid-cols-6 text-center">
                <span>Days 1-5</span>
                <span>Days 6-10</span>
                <span>Days 11-15</span>
                <span>Days 16-20</span>
                <span>Days 21-25</span>
                <span>Days 26-30</span>
              </div>
            </div>

            {/* Well Rows */}
            {schedules.map((well) => {
              const startPct = ((well.startDay - 1) / 30) * 100;
              const widthPct = (well.durationDays / 30) * 100;

              return (
                <div key={well.id} className="flex items-center py-1.5 hover:bg-cyan-500/5 rounded-xl transition-colors">
                  <span className="w-24 shrink-0 font-bold text-white">{well.id}</span>
                  <div className="flex-1 bg-black/40 h-7 rounded-lg relative overflow-hidden border border-white/5">
                    {/* Active phase block */}
                    <div
                      style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                      className={`absolute top-0 bottom-0 rounded-md border flex items-center px-2 text-[10px] font-bold ${getPhaseColor(
                        well.phase
                      )}`}
                    >
                      <span className="truncate uppercase">{well.phase}</span>
                    </div>

                    {/* Selected Day Cursor Line */}
                    <div
                      style={{ left: `${((selectedDay - 1) / 30) * 100}%` }}
                      className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_8px_#00e5ff] z-10"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Day Scrubber */}
          <div className="mt-6 pt-4 border-t border-cyan-500/20 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-300 whitespace-nowrap">Timeline Scrubber:</span>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={selectedDay}
                onChange={(e) => {
                  soundFx.playClick();
                  setSelectedDay(Number(e.target.value));
                }}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-cyan-300 font-bold min-w-[60px]">Day {selectedDay}</span>
            </div>
          </div>
        </div>

        {/* Breakthrough Interlock & Boiler Demand */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          {/* Breakthrough Alert Box */}
          <div className="glass rounded-3xl p-5 border border-cyan-500/20 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Inter-Well Interference Interlock</h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                isInterferenceRisk ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {isInterferenceRisk ? 'CONCURRENT WARNING' : 'NORMAL CLEAR'}
              </span>
            </div>

            {isInterferenceRisk ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertTriangle size={16} /> Thermal Breakthrough Risk (Day {selectedDay})
                </div>
                <p className="text-[11px] leading-relaxed">
                  Adjacent wells <b>BGW-004</b> and <b>BGW-006</b> are injecting high-pressure steam simultaneously. Risk of fracture communication. Stagger BGW-006 start to Day 13 to avoid channel breakthrough.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <CheckCircle2 size={16} /> Injection Isolated &bull; Safe Operations
                </div>
                <p className="text-[11px] text-slate-300">
                  Adequate thermal buffer spacing maintained. No risk of early steam breakthrough into neighboring producers.
                </p>
              </div>
            )}
          </div>

          {/* Boiler Capacity Balancing */}
          <div className="glass rounded-3xl p-5 border border-cyan-500/20 shadow-xl space-y-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" /> Boiler Load Leveling
            </h4>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Steam Demand (Day {selectedDay}):</span>
                <b className="text-white">{isInterferenceRisk ? '85.0 t/day' : '45.0 t/day'}</b>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/5">
                <div
                  style={{ width: isInterferenceRisk ? '70%' : '37%' }}
                  className={`h-full rounded-full ${isInterferenceRisk ? 'bg-amber-400' : 'bg-cyan-400'}`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 t/day</span>
                <span>Max Boiler Cap: 120 t/day</span>
              </div>
            </div>
          </div>

          <div className="glass-subtle rounded-2xl p-4 border border-cyan-500/15 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
              <Sparkles size={14} /> AI Peak Shaving
            </div>
            Auto-scheduler prevents boiler cycling fatigue, saving up to 14% fuel gas in peak thermal injection months.
          </div>
        </div>
      </div>
    </div>
  );
};
