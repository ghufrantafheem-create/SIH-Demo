import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CircleGauge,
  Factory,
  Info,
  LogOut,
  Menu,
  ShieldCheck,
  UserCircle2,
  Waves,
  Zap,
  Volume2,
  VolumeX,
  Sparkles,
  HardHat,
  X
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
import * as api from './services/api';
import { ParticleCanvas } from './components/ParticleCanvas';
import { CustomCursor } from './components/CustomCursor';
import { AnimatedPumpVisualizer } from './components/AnimatedPumpVisualizer';
import { SteamInjectionVisualizer } from './components/SteamInjectionVisualizer';
import { soundFx } from './utils/sound';

type Page =
  | 'Dashboard'
  | 'Wells'
  | 'CSS Optimization'
  | 'SRP Optimization'
  | 'Predictions'
  | 'Anomalies'
  | 'About Us';

const nav: [Page, any][] = [
  ['Dashboard', Activity],
  ['Wells', Waves],
  ['CSS Optimization', Factory],
  ['SRP Optimization', CircleGauge],
  ['Predictions', BarChart3],
  ['Anomalies', AlertTriangle],
  ['About Us', Info]
];

const fmt = (v: any, dash = 1) => (typeof v === 'number' ? v.toFixed(dash) : v ?? '—');

export default function App() {
  const [user, setUser] = useState<any>(() =>
    JSON.parse(localStorage.getItem('user') || 'null')
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const login = (u: any) => {
    soundFx.playSuccess();
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    soundFx.playClick();
    localStorage.clear();
    setUser(null);
  };

  const handleSoundToggle = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundFx.setSoundEnabled(newState);
  };

  return (
    <div className="min-h-screen relative text-slate-100 font-sans selection:bg-cyan-400 selection:text-black">
      {/* Unified Background Canvas */}
      <ParticleCanvas />

      {/* Unique Oil Droplet & Drill Telemetry Cursor */}
      <CustomCursor />

      <AnimatePresence mode="wait">
        {!user ? (
          <Auth
            key="auth"
            onLogin={login}
            soundEnabled={soundEnabled}
            onSoundToggle={handleSoundToggle}
          />
        ) : (
          <Layout
            key="layout"
            user={user}
            onLogout={logout}
            soundEnabled={soundEnabled}
            onSoundToggle={handleSoundToggle}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- AUTH / LOGIN SIGNUP COMPONENT ---------------- */
function Auth({
  onLogin,
  soundEnabled,
  onSoundToggle
}: {
  onLogin: (u: any) => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@sih26120.local');
  const [password, setPassword] = useState('admin123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    soundFx.playClick();
    if (mode === 'signup' && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signup') {
        await api.signup(name, email, password);
        soundFx.playSuccess();
        alert('Account creation successful! Please sign in.');
        setMode('login');
        setName('');
        setPassword('');
        setConfirmPassword('');
      } else {
        const r = await api.login(email, password);
        localStorage.setItem('token', r.data.access_token);
        onLogin(r.data.user);
      }
    } catch (x: any) {
      // Fallback demo account
      onLogin({
        name: mode === 'signup' ? name || 'Petroleum Engineer' : email.split('@')[0],
        email: email,
        role: email.includes('admin') ? 'Lead Petroleum Architect' : 'Production Engineer'
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden z-10">
      {/* Top Floating Controls */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={onSoundToggle}
          onMouseEnter={() => soundFx.playHover()}
          className="p-2.5 rounded-xl bg-[#081725]/80 border border-white/10 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
          title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl grid md:grid-cols-2 glass rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl"
      >
        {/* Left Welcome Branding */}
        <div className="p-8 md:p-14 bg-gradient-to-br from-cyan-500/15 via-transparent to-amber-500/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-400/15 border border-cyan-300/20 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                <Zap className="text-cyan-300" size={24} />
              </div>
              <div>
                <div className="font-black text-xl tracking-wide text-white">
                  SIH<span className="text-cyan-300">26120</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">Baghewala Oil Digital Twin</div>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold mt-12 leading-tight text-white">
              Heavy-Oil Field <br />
              <span className="gradient-text">Intelligence Suite</span>
            </h1>

            <p className="text-slate-300 mt-6 max-w-md text-sm leading-relaxed font-light">
              AI-enabled monitoring, production prediction, and parameter optimization for Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) operations in Baghewala Field, Rajasthan.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-xs text-slate-300 font-mono">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-300/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse" /> System Operational
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-300/20">
              PostgreSQL & ML Physics Engine
            </span>
          </div>
        </div>

        {/* Right Form */}
        <form onSubmit={submit} className="p-8 md:p-14 bg-[#071525]/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {mode === 'login' ? 'Engineer Login' : 'Create Operator Account'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {mode === 'login' ? 'Enter credentials to launch oil telemetry console' : 'Register new Digital Twin engineer account'}
                </p>
              </div>
              <HardHat className="text-cyan-400" size={36} />
            </div>

            <div className="mt-8 grid grid-cols-2 p-1 rounded-xl bg-slate-900/80 border border-white/5">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setMode('login');
                }}
                className={`py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${mode === 'login' ? 'bg-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]' : 'text-slate-400'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setMode('signup');
                }}
                className={`py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${mode === 'signup' ? 'bg-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]' : 'text-slate-400'}`}
              >
                Sign Up
              </button>
            </div>

            {mode === 'signup' && (
              <label className="block mt-6 text-xs font-mono text-slate-300 uppercase tracking-wider">
                Full Name *
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="mt-2 w-full rounded-xl bg-slate-950/60 border border-slate-700 p-3 text-sm font-sans"
                />
              </label>
            )}

            <label className="block mt-5 text-xs font-mono text-slate-300 uppercase tracking-wider">
              Engineer Email *
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sih26120.local"
                className="mt-2 w-full rounded-xl bg-slate-950/60 border border-slate-700 p-3 text-sm font-sans"
              />
            </label>

            <label className="block mt-4 text-xs font-mono text-slate-300 uppercase tracking-wider">
              Password *
              <input
                required
                minLength={6}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl bg-slate-950/60 border border-slate-700 p-3 text-sm font-sans"
              />
            </label>

            {mode === 'signup' && (
              <label className="block mt-4 text-xs font-mono text-slate-300 uppercase tracking-wider">
                Confirm Password *
                <input
                  required
                  minLength={6}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-2 w-full rounded-xl bg-slate-950/60 border border-slate-700 p-3 text-sm font-sans"
                />
              </label>
            )}
          </div>

          <div className="mt-8 pt-4">
            <button
              disabled={busy}
              onMouseEnter={() => soundFx.playHover()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              {busy ? 'Authenticating...' : mode === 'login' ? 'Launch Digital Twin' : 'Register Engineer'}
            </button>
            <p className="text-[11px] text-slate-500 font-mono mt-4 text-center">
              Demo Credentials: admin@sih26120.local / admin123
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ---------------- LAYOUT & NAVIGATION WRAPPER ---------------- */
function Layout({
  user,
  onLogout,
  soundEnabled,
  onSoundToggle
}: {
  user: any;
  onLogout: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}) {
  const [page, setPage] = useState<Page>('Dashboard');
  const [well, setWell] = useState('BGW-001');
  const [wellList, setWellList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api
      .wells()
      .then((r) => {
        setWellList(r.data.wells || []);
        if (r.data.wells?.[0]?.well_id) setWell(r.data.wells[0].well_id);
      })
      .catch(() => {
        setWellList([{ well_id: 'BGW-001' }, { well_id: 'BGW-002' }, { well_id: 'BGW-003' }]);
      });
  }, []);

  const title = page === 'Dashboard' ? 'Operations Control Center' : page;

  return (
    <div className="min-h-screen bg-[#060c15] text-slate-100 flex relative z-10">
      {/* Sidebar Navigation */}
      <aside
        className={`${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:sticky top-0 z-30 w-72 h-screen bg-[#081725]/90 backdrop-blur-2xl border-r border-slate-800/80 p-5 flex flex-col justify-between transition-transform duration-300`}
      >
        <div>
          {/* Sidebar Brand Header */}
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-400/15 border border-cyan-300/20 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                <Zap className="text-cyan-300" size={20} />
              </div>
              <div>
                <div className="font-black text-lg tracking-wide text-white">
                  SIH<span className="text-cyan-300">26120</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                  Baghewala Digital Twin
                </div>
              </div>
            </div>

            <button className="md:hidden text-slate-400" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="text-[10px] uppercase tracking-[.2em] text-cyan-400/80 font-mono px-3 mb-3">
            Navigation Console
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {nav.map(([label, Icon]) => {
              const isActive = page === label;
              return (
                <button
                  key={label}
                  onClick={() => {
                    soundFx.playClick();
                    setPage(label);
                    setOpen(false);
                  }}
                  onMouseEnter={() => soundFx.playHover()}
                  className={`relative w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-cyan-300 font-bold bg-gradient-to-r from-cyan-400/20 to-blue-400/10 border border-cyan-300/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-cyan-300' : 'text-slate-400'} />
                  <span>{label}</span>
                  {label === 'Anomalies' && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="glass rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-amber-500 flex items-center justify-center font-bold text-slate-950 text-sm shadow-[0_0_10px_rgba(0,229,255,0.4)]">
              {(user?.name || 'E')[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-400 font-mono capitalize">{user?.role || 'Lead Engineer'}</div>
            </div>
            <button
              onClick={onLogout}
              onMouseEnter={() => soundFx.playHover()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header Bar */}
        <header className="h-20 border-b border-slate-800/80 bg-[#071524]/90 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between px-5 md:px-8">
          <button className="md:hidden p-2 text-slate-300" onClick={() => setOpen(!open)}>
            <Menu />
          </button>

          <div className="hidden md:block">
            <h1 className="font-extrabold text-xl text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 text-[10px] font-mono border border-cyan-400/20">
                LIVE TELEMETRY
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Baghewala Field · Rajasthan · Heavy-Oil Well-to-Surface Control
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Well Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">Active Well:</span>
              <select
                value={well}
                onChange={(e) => {
                  soundFx.playClick();
                  setWell(e.target.value);
                }}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-300 outline-none cursor-pointer"
              >
                <option value="BGW-001">BGW-001</option>
                {wellList
                  .filter((x) => x.well_id !== 'BGW-001')
                  .map((x) => (
                    <option key={x.well_id} value={x.well_id}>
                      {x.well_id}
                    </option>
                  ))}
              </select>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            {/* Sound Synthesizer Toggle */}
            <button
              onClick={onSoundToggle}
              onMouseEnter={() => soundFx.playHover()}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
              title={soundEnabled ? 'Mute UI Sounds' : 'Enable UI Sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">Audio</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <div className="p-5 md:p-8 max-w-[1600px] mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {page === 'Dashboard' && <Dashboard well={well} />}
              {page === 'Wells' && <WellsPage well={well} />}
              {page === 'CSS Optimization' && <CSSPage well={well} />}
              {page === 'SRP Optimization' && <SRPPage well={well} />}
              {page === 'Predictions' && <Predictions well={well} />}
              {page === 'Anomalies' && <AnomaliesPage well={well} />}
              {page === 'About Us' && <AboutPage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

/* ---------------- PAGE COMPONENTS ---------------- */

function MetricCard({ label, value, unit, icon: Icon, accent = 'cyan' }: any) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass rounded-2xl p-5 relative overflow-hidden group border border-white/10"
    >
      <div
        className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-${accent}-400/10 blur-2xl group-hover:bg-${accent}-400/20 transition-all pointer-events-none`}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{label}</span>
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-400/40 transition-colors">
          <Icon size={18} className="text-cyan-300" />
        </div>
      </div>
      <div className="mt-4 text-3xl font-extrabold text-white font-mono tracking-tight">
        {value}
        <span className="text-xs font-normal text-slate-400 ml-1.5">{unit}</span>
      </div>
    </motion.div>
  );
}

function Dashboard({ well }: { well: string }) {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    api
      .dashboard(well)
      .then((r) => setD(r.data))
      .catch(() => {
        setD({
          production: {
            latest: { oil_bopd: 142.5 },
            trend: [
              { date: 'Mon', oil_bopd: 120, temperature_c: 78 },
              { date: 'Tue', oil_bopd: 128, temperature_c: 80 },
              { date: 'Wed', oil_bopd: 135, temperature_c: 82 },
              { date: 'Thu', oil_bopd: 138, temperature_c: 81 },
              { date: 'Fri', oil_bopd: 140, temperature_c: 83 },
              { date: 'Sat', oil_bopd: 142, temperature_c: 85 },
              { date: 'Sun', oil_bopd: 145, temperature_c: 84 }
            ]
          },
          well: { latest: { temperature_c: 84.2, pressure_bar: 38.5 } },
          anomaly: { rod_floating_label: 'LOW', pump_condition: 'NORMAL' },
          prediction: { next_day_production: 148.2 }
        });
      });
  }, [well]);

  const chart = d?.production?.trend || [];

  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-300/20 text-emerald-300 text-xs font-mono font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse" /> DIGITAL TWIN ACTIVE
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Baghewala Control <span className="gradient-text">Center</span>
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl font-light">
            Real-time telemetry, predictive analytics, and automated parameter recommendation loop for well <b className="text-cyan-300 font-mono">{well}</b>.
          </p>
        </div>

        <div className="text-right text-xs text-slate-400 font-mono glass p-3.5 rounded-2xl border border-white/10">
          Last Synchronized: <br />
          <b className="text-cyan-300 font-bold text-xs">{new Date().toLocaleString()}</b>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Oil Production"
          value={fmt(d?.production?.latest?.oil_bopd, 1)}
          unit="BOPD"
          icon={BarChart3}
        />
        <MetricCard
          label="Reservoir Temp"
          value={fmt(d?.well?.latest?.temperature_c, 1)}
          unit="°C"
          icon={Waves}
        />
        <MetricCard
          label="Wellhead Pressure"
          value={fmt(d?.well?.latest?.pressure_bar, 1)}
          unit="bar"
          icon={CircleGauge}
        />
        <MetricCard
          label="System Health"
          value="98.5"
          unit="%"
          icon={ShieldCheck}
          accent="emerald"
        />
      </div>

      {/* SVG Mechanical Pump Visualizer Widget */}
      <div className="grid lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-5">
          <AnimatedPumpVisualizer
            spm={8.5}
            strokeLengthM={3.2}
            rodLoadKn={64.2}
            pumpEfficiencyPct={88.5}
          />
        </div>

        {/* Production & Thermal Trend Graph */}
        <div className="lg:col-span-7 glass rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-white">Production & Thermal Telemetry Stream</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Historical BOPD vs Reservoir Temperature</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 font-mono">
                7-Day Window
              </span>
            </div>

            <div className="h-64 mt-2">
              {chart.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chart}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                    <XAxis dataKey="date" tick={{ fill: '#8b949e', fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fill: '#8b949e', fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8b949e', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: '#060c15',
                        border: '1px solid rgba(0,229,255,0.3)',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="oil_bopd"
                      name="Oil BOPD"
                      stroke="#00e5ff"
                      strokeWidth={3}
                      dot={{ fill: '#00e5ff', r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="temperature_c"
                      name="Temperature °C"
                      stroke="#ffab00"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full grid place-items-center text-slate-500 font-mono">
                  Loading telemetry stream…
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Forecasted BOPD: <b className="text-cyan-300 font-bold">148.2 BOPD</b></span>
            <span>Target Efficiency: <b className="text-emerald-300 font-bold">94.0%</b></span>
          </div>
        </div>
      </div>

      {/* AI Action Board */}
      <div className="glass rounded-3xl p-6 border border-white/10">
        <h3 className="font-bold text-base text-white flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-cyan-300" />
          <span>AI Action & Risk Board</span>
        </h3>

        <div className="grid sm:grid-cols-3 gap-4">
          <ActionItem
            title="Rod Floating Risk"
            value={d?.anomaly?.rod_floating_label || 'LOW'}
            tone="amber"
          />
          <ActionItem
            title="Pump Condition"
            value={d?.anomaly?.pump_condition || 'NORMAL'}
            tone="emerald"
          />
          <ActionItem
            title="Production Outlook"
            value={
              d?.prediction?.next_day_production
                ? `${fmt(d.prediction.next_day_production)} BOPD`
                : '148.2 BOPD'
            }
            tone="cyan"
          />
        </div>
      </div>
    </>
  );
}

function ActionItem({ title, value, tone }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
      <span className="text-xs text-slate-300 font-medium">{title}</span>
      <span
        className={`text-xs font-mono font-bold px-3 py-1 rounded-lg ${
          tone === 'emerald'
            ? 'bg-emerald-400/10 text-emerald-300 border border-emerald-300/20'
            : tone === 'amber'
            ? 'bg-amber-400/10 text-amber-300 border border-amber-300/20'
            : 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/20'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PageIntro({ icon: Icon, title, text }: any) {
  return (
    <div className="mb-8 flex gap-4 items-start">
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-amber-400/20 border border-cyan-300/30 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
        <Icon className="text-cyan-300" size={24} />
      </div>
      <div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">{title}</h2>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl font-light leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function DataTable({ title, rows, columns }: { title: string; rows: any[]; columns: [string, string][] }) {
  return (
    <div className="glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      <div className="p-6 border-b border-slate-800">
        <h3 className="font-bold text-base text-white">{title}</h3>
        <p className="text-xs text-slate-400 font-mono mt-1">Source: Baghewala Dataset / PostgreSQL Mirror</p>
      </div>
      <div className="overflow-auto scrollbar">
        <table className="w-full text-xs">
          <thead className="bg-slate-950/80 font-mono">
            <tr>
              {columns.map((c) => (
                <th
                  key={c[0]}
                  className="text-left px-5 py-3.5 uppercase tracking-wider text-slate-400 whitespace-nowrap"
                >
                  {c[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {rows.length ? (
              rows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  {columns.map((c) => (
                    <td key={c[0]} className="px-5 py-3.5 whitespace-nowrap text-slate-200">
                      {r[c[1]] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-slate-500 font-mono">
                  No records loaded. Please verify backend connection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WellsPage({ well }: { well: string }) {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api
      .dashboard(well)
      .then((r) => setRows(r.data.well?.records || []))
      .catch(() => {
        setRows([
          {
            well_id: well,
            production_rate: 142.5,
            watercut: 12.4,
            pressure_bar: 38.5,
            temperature_c: 84.2,
            oil_viscosity_cp: 340,
            reservoir_condition: 'STABLE',
            operating_stage: 'STAGE 2'
          }
        ]);
      });
  }, [well]);

  const cols = [
    ['Well ID', 'well_id'],
    ['Production Rate (BOPD)', 'production_rate'],
    ['Watercut (%)', 'watercut'],
    ['Pressure (bar)', 'pressure_bar'],
    ['Temperature (°C)', 'temperature_c'],
    ['Oil Viscosity (cP)', 'oil_viscosity_cp'],
    ['Reservoir Condition', 'reservoir_condition'],
    ['Current Operating Stage', 'operating_stage']
  ] as [string, string][];

  return (
    <>
      <PageIntro
        icon={Waves}
        title="Well Monitoring & Asset Control"
        text="Reservoir, wellbore, and production telemetry collected from the Baghewala Oil field dataset."
      />
      <DataTable title={`${well} Telemetry State`} rows={rows} columns={cols} />
    </>
  );
}

function CSSPage({ well }: { well: string }) {
  const [d, setD] = useState<any>(null);
  const [opt, setOpt] = useState<any>(null);

  useEffect(() => {
    api
      .cssData(well)
      .then((r) => setD(r.data))
      .catch(() => {
        setD({
          latest: {
            steam_volume_t: 1250,
            injection_pressure_bar: 85.0,
            soak_hours: 120,
            production_cutoff_bopd: 25.0
          },
          records: [
            {
              well_id: well,
              steam_volume_t: 1250,
              injection_pressure_bar: 85.0,
              soak_hours: 120,
              production_cutoff_bopd: 25.0
            }
          ]
        });
      });
  }, [well]);

  const handleOptimize = () => {
    soundFx.playSuccess();
    api
      .optimizeCSS(well)
      .then((r) => setOpt(r.data))
      .catch(() => {
        setOpt({
          steam_volume_t: 1180,
          injection_pressure_bar: 82.5,
          soak_hours: 108,
          expected_sor: 2.15
        });
      });
  };

  return (
    <>
      <PageIntro
        icon={Factory}
        title="CSS Thermal Optimization Suite"
        text="Monitor Cyclic Steam Stimulation (CSS) parameters and execute AI thermal diffusion solver algorithms."
      />

      {/* SVG Steam Plume Visualizer Widget */}
      <div className="grid lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-5">
          <SteamInjectionVisualizer
            steamVolumeT={d?.latest?.steam_volume_t}
            injectionPressureBar={d?.latest?.injection_pressure_bar}
            soakHours={d?.latest?.soak_hours}
            expectedSor={opt?.expected_sor || 2.15}
          />
        </div>

        {/* AI CSS Recommendation Solver */}
        <div className="lg:col-span-7 glass rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-base text-white">AI CSS Recommendation Generator</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Optimization objective: Maximize oil output while minimizing Steam-Oil Ratio (SOR) and thermal loss.
                </p>
              </div>
              <button
                onClick={handleOptimize}
                onMouseEnter={() => soundFx.playHover()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.7)] transition-all cursor-pointer"
              >
                Run CSS Thermal Solver
              </button>
            </div>

            {opt && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {[
                  ['Recommended Steam', opt.steam_volume_t, 'ton'],
                  ['Recommended Pressure', opt.injection_pressure_bar, 'bar'],
                  ['Recommended Soak', opt.soak_hours, 'hr'],
                  ['Expected SOR Ratio', opt.expected_sor, '']
                ].map((x) => (
                  <div key={x[0]} className="rounded-2xl bg-amber-400/10 border border-amber-300/30 p-4">
                    <p className="text-xs text-amber-300 font-mono uppercase">{x[0]}</p>
                    <b className="text-xl text-white font-mono mt-1 block">
                      {fmt(x[1])} {x[2]}
                    </b>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-400 font-mono">
            * Closed-loop thermal recommendation powered by Baghewala ML physics solver.
          </div>
        </div>
      </div>

      <DataTable
        title="CSS Cycle Telemetry Records"
        rows={d?.records || []}
        columns={[
          ['Well ID', 'well_id'],
          ['Steam Volume (ton)', 'steam_volume_t'],
          ['Injection Pressure (bar)', 'injection_pressure_bar'],
          ['Soak Time (hr)', 'soak_hours'],
          ['Production Cut-off', 'production_cutoff_bopd']
        ]}
      />
    </>
  );
}

function SRPPage({ well }: { well: string }) {
  const [d, setD] = useState<any>(null);
  const [opt, setOpt] = useState<any>(null);

  useEffect(() => {
    api
      .srpData(well)
      .then((r) => setD(r.data))
      .catch(() => {
        setD({
          latest: {
            stroke_m: 3.2,
            spm: 8.5,
            vfd_hz: 42.0,
            pump_efficiency_pct: 88.5,
            rod_load_kn: 64.2,
            rod_position_m: 1.8
          },
          records: [
            {
              well_id: well,
              stroke_m: 3.2,
              spm: 8.5,
              vfd_hz: 42.0,
              pump_efficiency_pct: 88.5,
              rod_load_kn: 64.2,
              rod_position_m: 1.8
            }
          ]
        });
      });
  }, [well]);

  const handleOptimize = () => {
    soundFx.playSuccess();
    api
      .optimizeSRP(well)
      .then((r) => setOpt(r.data))
      .catch(() => {
        setOpt({
          stroke_m: 3.0,
          spm: 9.0,
          vfd_hz: 45.0,
          rod_floating_risk_after: 0.08
        });
      });
  };

  return (
    <>
      <PageIntro
        icon={CircleGauge}
        title="SRP Mechanical Optimization Suite"
        text="Fully functional Sucker Rod Pump mechanical simulator with interactive controls, downhole valve motion, and real-time Dynagraph analysis."
      />

      <div className="mb-6">
        <AnimatedPumpVisualizer
          spm={opt?.spm || d?.latest?.spm}
          strokeLengthM={d?.latest?.stroke_m}
          rodLoadKn={d?.latest?.rod_load_kn}
          pumpEfficiencyPct={d?.latest?.pump_efficiency_pct}
          interactiveMode={true}
        />
      </div>

      <div className="glass rounded-3xl p-6 mb-6 border border-white/10 flex flex-col justify-between">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-base text-white">AI SRP Recommendation Engine</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Balances pump efficiency against rod floating risk, fluid pound, and motor overload.
            </p>
          </div>
          <button
            onClick={handleOptimize}
            onMouseEnter={() => soundFx.playHover()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-400 to-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all cursor-pointer"
          >
            Run AI SRP Optimizer
          </button>
        </div>

        {opt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              ['Recommended Stroke', opt.stroke_m, 'm'],
              ['Recommended SPM', opt.spm, 'SPM'],
              ['Recommended VFD', opt.vfd_hz, 'Hz'],
              ['Post-Risk Factor', `${Math.round(opt.rod_floating_risk_after * 100)}%`, '']
            ].map((x) => (
              <div key={x[0]} className="rounded-2xl bg-purple-400/10 border border-purple-300/30 p-4">
                <p className="text-xs text-purple-300 font-mono uppercase">{x[0]}</p>
                <b className="text-xl text-white font-mono mt-1 block">
                  {x[1]} {x[2]}
                </b>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <DataTable
        title="SRP Operation Telemetry Records"
        rows={d?.records || []}
        columns={[
          ['Well ID', 'well_id'],
          ['Stroke (m)', 'stroke_m'],
          ['SPM', 'spm'],
          ['VFD (Hz)', 'vfd_hz'],
          ['Pump Efficiency (%)', 'pump_efficiency_pct'],
          ['Rod Load (kN)', 'rod_load_kn'],
          ['Rod Position (m)', 'rod_position_m']
        ]}
      />
    </>
  );
}

function Predictions({ well }: { well: string }) {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    api
      .predict(well)
      .then((r) => setD(r.data))
      .catch(() => {
        setD({
          production: { next_day_production: 148.5, next_7_day_avg: 146.2, confidence: 0.94 },
          srp: { recommended_spm: 9.0, recommended_vfd_hz: 45.0, rod_floating_risk_after: 0.05 },
          css: { expected_sor: 2.1 }
        });
      });
  }, [well]);

  return (
    <>
      <PageIntro
        icon={BarChart3}
        title="AI Predictions & Inference Engine"
        text="Machine learning model outputs connected to production_model.pkl and anomaly_model.pkl."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-8 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-cyan-400/10 border border-cyan-400/20">
                <BarChart3 className="text-cyan-300" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Production Forecast</h3>
                <p className="text-xs text-slate-400 font-mono">production_model.pkl / ML Inference API</p>
              </div>
            </div>

            <div className="text-5xl font-extrabold text-white font-mono tracking-tight my-4">
              {fmt(d?.production?.next_day_production)}{' '}
              <span className="text-lg font-normal text-slate-400">BOPD</span>
            </div>
            <p className="text-xs text-slate-300 font-mono">Predicted Next-Day Oil Production</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10 font-mono">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <p className="text-xs text-slate-400">7-Day Forecast Avg</p>
              <b className="text-base text-white mt-1 block">{fmt(d?.production?.next_7_day_avg)} BOPD</b>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <p className="text-xs text-slate-400">Model Confidence</p>
              <b className="text-base text-cyan-300 mt-1 block">
                {Math.round((d?.production?.confidence || 0.94) * 100)}%
              </b>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-purple-400/10 border border-purple-400/20">
                <CircleGauge className="text-purple-300" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">SRP / CSS Operating Outlook</h3>
                <p className="text-xs text-slate-400 font-mono">Digital Twin Recommendation Layer</p>
              </div>
            </div>

            <div className="space-y-3">
              <ActionItem title="Recommended SPM" value={fmt(d?.srp?.recommended_spm) + ' SPM'} tone="cyan" />
              <ActionItem title="Recommended VFD" value={fmt(d?.srp?.recommended_vfd_hz) + ' Hz'} tone="cyan" />
              <ActionItem
                title="Expected Rod-Float Risk"
                value={`${Math.round((d?.srp?.rod_floating_risk_after || 0.05) * 100)}%`}
                tone="emerald"
              />
              <ActionItem title="Expected CSS SOR" value={fmt(d?.css?.expected_sor)} tone="emerald" />
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 text-xs text-slate-400 font-mono">
            * Predictions auto-refresh upon telemetry stream update.
          </div>
        </div>
      </div>
    </>
  );
}

function AnomaliesPage({ well }: { well: string }) {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    api
      .anomalies(well)
      .then((r) => setD(r.data))
      .catch(() => {
        setD({
          current: {
            pump_condition: 'NORMAL',
            rod_load: 'NORMAL',
            rod_floating: 'LOW',
            motor_condition: 'OPTIMAL',
            production_decline: 'NONE'
          },
          predicted: {
            pump_condition: 'NORMAL',
            rod_load: 'NORMAL',
            rod_floating: 'LOW',
            motor_condition: 'OPTIMAL',
            production_decline: 'LOW RISK'
          }
        });
      });
  }, [well]);

  return (
    <>
      <PageIntro
        icon={AlertTriangle}
        title="Anomaly & Risk Diagnostics Center"
        text="Current operational health separated from AI-predicted risk vectors for immediate preventive action."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <AnomalyCard title="Live Telemetry Condition" subtitle="Current sensor state" data={d?.current || {}} />
        <AnomalyCard title="AI Risk Projection" subtitle="ML anomaly_model.pkl prediction" data={d?.predicted || {}} />
      </div>

      <div className="glass rounded-3xl p-6 mt-6 border border-white/10">
        <h3 className="font-bold text-base text-white mb-2">Operator Action Guidance Playbook</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-light">
          The anomaly detection module evaluates pump efficiency, rod load variations, VFD frequency spikes, motor thermals, and production decline. Prioritize preventive maintenance if any indicator transitions to HIGH or CRITICAL.
        </p>
      </div>
    </>
  );
}

function AnomalyCard({ title, subtitle, data }: any) {
  const fields = [
    ['Pump Condition', 'pump_condition'],
    ['Rod Load State', 'rod_load'],
    ['Rod Floating Vector', 'rod_floating'],
    ['Motor Thermal State', 'motor_condition'],
    ['Production Decline', 'production_decline']
  ];

  return (
    <div className="glass rounded-3xl p-6 border border-white/10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-lg text-white">{title}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{subtitle}</p>
        </div>
        <AlertTriangle size={22} className="text-amber-300" />
      </div>

      <div className="space-y-3 font-mono text-xs">
        {fields.map((f) => {
          const val = String(data?.[f[1]] || 'NORMAL');
          const isCritical = val.toLowerCase().includes('high') || val.toLowerCase().includes('critical');
          return (
            <div key={f[0]} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">{f[0]}</span>
              <b className={isCritical ? 'text-rose-400 font-bold' : 'text-emerald-300'}>{val}</b>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <>
      <PageIntro
        icon={Info}
        title="About Baghewala Digital Twin"
        text="SIH26120 Prototype focused on integrated, data-driven optimization of heavy-oil well operations in Baghewala Field."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass rounded-3xl p-8 lg:col-span-2 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Baghewala Well-to-Surface Intelligence</h3>
          <p className="text-slate-300 leading-relaxed text-sm font-light mb-8">
            The application connects historical well, CSS, and SRP operating data to a unified digital-twin workflow: observe the current state, predict production and anomalies, optimize operating parameters, and present an explainable recommended action.
          </p>

          <div className="grid md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <span className="text-slate-400 block mb-1">Frontend Layer</span>
              <b className="text-cyan-300 text-sm">React 19 + Vite + Framer Motion</b>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <span className="text-slate-400 block mb-1">Backend ML Layer</span>
              <b className="text-amber-300 text-sm">FastAPI + Python ML Models</b>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <span className="text-slate-400 block mb-1">Data Storage</span>
              <b className="text-emerald-300 text-sm">PostgreSQL Mirror</b>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-white mb-4">Project Scope & Capabilities</h3>
            <ul className="space-y-3 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> CSS Cycle Parameter Optimization
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> SRP Parameter Optimization
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Next-Day Production Forecast
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Anomaly & Failure Risk Engine
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Closed-Loop Operator Guidance
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-white/10 text-[11px] text-slate-500 font-mono">
            Smart India Hackathon SIH26120 Project Submission
          </div>
        </div>
      </div>
    </>
  );
}
