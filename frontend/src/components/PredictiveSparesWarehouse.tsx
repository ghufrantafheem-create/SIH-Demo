import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Wrench,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  DollarSign,
  TrendingDown,
  Truck,
  ShoppingCart,
  ShieldCheck
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

interface SparePart {
  id: string;
  name: string;
  category: 'Downhole' | 'Surface Rig' | 'Electrical' | 'Flowline';
  stock_qty: number;
  min_reorder_qty: number;
  unit_cost_usd: number;
  lead_time_days: number;
  fleet_failure_predicted_days: number;
  status: 'Critical Reorder' | 'Adequate' | 'Expedited PO';
}

export const PredictiveSparesWarehouse: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [spares, setSpares] = useState<SparePart[]>([
    {
      id: 'SPR-01',
      name: 'API Spec 11B 1" Grade D Sucker Rod Strings (100m)',
      category: 'Downhole',
      stock_qty: 2,
      min_reorder_qty: 4,
      unit_cost_usd: 1450,
      lead_time_days: 12,
      fleet_failure_predicted_days: 9, // Critical: RUL less than lead time
      status: 'Critical Reorder'
    },
    {
      id: 'SPR-02',
      name: 'API 11AX Stellite Traveling Valve Ball & Seat Set',
      category: 'Downhole',
      stock_qty: 8,
      min_reorder_qty: 6,
      unit_cost_usd: 380,
      lead_time_days: 5,
      fleet_failure_predicted_days: 28,
      status: 'Adequate'
    },
    {
      id: 'SPR-03',
      name: 'Heavy-Duty Double Reduction Pumping Unit Gearbox Seal Kit',
      category: 'Surface Rig',
      stock_qty: 1,
      min_reorder_qty: 2,
      unit_cost_usd: 850,
      lead_time_days: 14,
      fleet_failure_predicted_days: 16,
      status: 'Expedited PO'
    },
    {
      id: 'SPR-04',
      name: '75 kW VFD IGBT Inverter Power Module (1200V / 150A)',
      category: 'Electrical',
      stock_qty: 1,
      min_reorder_qty: 2,
      unit_cost_usd: 2100,
      lead_time_days: 20,
      fleet_failure_predicted_days: 18,
      status: 'Critical Reorder'
    },
    {
      id: 'SPR-05',
      name: 'High-Temperature Viton Stuffing Box Cone Packing Rings',
      category: 'Surface Rig',
      stock_qty: 14,
      min_reorder_qty: 10,
      unit_cost_usd: 65,
      lead_time_days: 3,
      fleet_failure_predicted_days: 35,
      status: 'Adequate'
    },
    {
      id: 'SPR-06',
      name: 'Rotary Vane VRU Compressor Mechanical Face Seal',
      category: 'Flowline',
      stock_qty: 2,
      min_reorder_qty: 2,
      unit_cost_usd: 620,
      lead_time_days: 8,
      fleet_failure_predicted_days: 42,
      status: 'Adequate'
    }
  ]);

  const handleOrder = (id: string) => {
    soundFx.playSuccess();
    setSpares((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, stock_qty: item.stock_qty + item.min_reorder_qty, status: 'Adequate' }
          : item
      )
    );
  };

  const filteredSpares =
    selectedCategory === 'All'
      ? spares
      : spares.filter((s) => s.category === selectedCategory);

  const totalInventoryValuationUsd = spares.reduce(
    (acc, cur) => acc + cur.stock_qty * cur.unit_cost_usd,
    0
  );

  const criticalShortages = spares.filter((s) => s.status === 'Critical Reorder').length;

  // Weibull Failure Probability Curve vs Operating Days
  const weibullCurve = Array.from({ length: 12 }, (_, i) => {
    const days = (i + 1) * 10;
    // 2-parameter Weibull: F(t) = 1 - exp(-(t/eta)^beta), beta = 2.4 (wear-out), eta = 90 days
    const prob = parseFloat((100 * (1 - Math.exp(-Math.pow(days / 90, 2.4)))).toFixed(1));
    return {
      days: `${days}d`,
      failure_prob_pct: prob,
      safe_margin_pct: parseFloat((100 - prob).toFixed(1))
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 uppercase tracking-wider mb-1">
              <Package size={14} /> Equipment Reliability & Strategic Supply Chain
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Predictive Spares Warehouse & RUL Inventory
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                Logistics Hub · Jodhpur
              </span>
            </h2>
            <p className="text-xs text-cyan-200/60 font-mono mt-1">
              Weibull equipment hazard forecasting · Automated PO generation based on Remaining Useful Life (RUL)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundFx.playSuccess();
                setSpares((prev) =>
                  prev.map((s) =>
                    s.status === 'Critical Reorder'
                      ? { ...s, stock_qty: s.stock_qty + s.min_reorder_qty, status: 'Adequate' }
                      : s
                  )
                );
              }}
              onMouseEnter={() => soundFx.playHover()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 text-xs font-mono font-bold hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShoppingCart size={14} /> Auto-Replenish Critical Deficits
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Active Warehouse Stock Value</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-white">${totalInventoryValuationUsd.toLocaleString()}</b>
            <span className="text-xs font-mono text-slate-400">USD</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Across 6 critical API part lines
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Critical Stockout Risk</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className={`text-2xl font-mono ${criticalShortages > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {criticalShortages} Components
            </b>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Predicted failure &lt; supplier lead time
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Deferred Production Saved</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-emerald-400">$18,400</b>
            <span className="text-xs font-mono text-slate-400">/ month</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Prevented emergency well shut-ins
          </span>
        </div>

        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-cyan-200/70 uppercase block">Domestic Supply Hub</span>
          <div className="flex items-baseline gap-2 mt-1">
            <b className="text-2xl font-mono text-cyan-300">4.5 Days</b>
            <span className="text-xs font-mono text-slate-400">avg lead time</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-1">
            Jodhpur & Ahmedabad freight corridor
          </span>
        </div>
      </div>

      {/* Main Table & Weibull Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parts Table (2 Cols) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Wrench className="text-cyan-400" size={18} /> Strategic Spare Parts Catalog & Telemetry RUL
            </div>
            <div className="flex gap-1 rounded-xl glass-subtle p-1 border border-cyan-500/20">
              {['All', 'Downhole', 'Surface Rig', 'Electrical', 'Flowline'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedCategory(cat);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/30 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-cyan-500/20 text-slate-400">
                  <th className="pb-3 font-semibold">Part Name</th>
                  <th className="pb-3 font-semibold">On-Hand</th>
                  <th className="pb-3 font-semibold">Lead Time</th>
                  <th className="pb-3 font-semibold">RUL Failure</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSpares.map((part) => (
                  <tr key={part.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-2">
                      <div className="text-white font-bold">{part.name}</div>
                      <div className="text-[10px] text-slate-400">{part.id} · ${part.unit_cost_usd}</div>
                    </td>
                    <td className="py-3">
                      <span className={`font-bold ${part.stock_qty <= part.min_reorder_qty ? 'text-rose-400' : 'text-cyan-300'}`}>
                        {part.stock_qty}
                      </span>
                      <span className="text-slate-500"> / min {part.min_reorder_qty}</span>
                    </td>
                    <td className="py-3 text-slate-300">{part.lead_time_days} days</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        part.fleet_failure_predicted_days <= part.lead_time_days
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        In {part.fleet_failure_predicted_days} days
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleOrder(part.id)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 transition-all cursor-pointer text-[10px] font-bold"
                      >
                        Order +{part.min_reorder_qty}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weibull Failure Curve (1 Col) */}
        <div className="glass rounded-3xl p-6 border border-cyan-500/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
              <Activity className="text-amber-400" size={18} /> Weibull Equipment Hazard Rate
            </div>
            <p className="text-[11px] font-mono text-cyan-200/60 mb-2">
              Cumulative failure probability (%) vs service days ($\beta = 2.4$).
            </p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weibullCurve} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 229, 255, 0.1)" />
                  <XAxis dataKey="days" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#040914',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="failure_prob_pct"
                    name="Cumulative Failure %"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#ef4444' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-200">
            Automated purchase orders are automatically placed whenever component RUL falls below vendor delivery lead time.
          </div>
        </div>
      </div>
    </div>
  );
};
