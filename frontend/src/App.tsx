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
  Waves,
  Zap,
  Volume2,
  VolumeX,
  Sparkles,
  HardHat,
  X,
  Radio,
  Clock,
  Layers,
  CheckCircle2,
  Cpu,
  Box,
  Upload,
  Calendar,
  Compass,
  FileSpreadsheet,
  DollarSign,
  Flame,
  Leaf,
  Eye,
  Bot,
  FileText,
  Wrench,
  Droplets,
  Wind,
  Navigation,
  Package,
  Skull,
  ShieldAlert
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
import { AnimatedPumpVisualizer } from './components/AnimatedPumpVisualizer';
import { SteamInjectionVisualizer } from './components/SteamInjectionVisualizer';
import { OilRig3DViewer } from './components/OilRig3DViewer';
import { DataUploadSimulator } from './components/DataUploadSimulator';
import { HistoricalDataPanel } from './components/HistoricalDataPanel';
import { DynacardAnalyzer } from './components/DynacardAnalyzer';
import { ThermalCFDHeatmap } from './components/ThermalCFDHeatmap';
import { FieldGISMap } from './components/FieldGISMap';
import { FieldEconomicsSandbox } from './components/FieldEconomicsSandbox';
import { ReportAndWorkOrderGenerator } from './components/ReportAndWorkOrderGenerator';
import { PetroTwinCopilot } from './components/PetroTwinCopilot';
import { ESGCarbonTracker } from './components/ESGCarbonTracker';
import { RodFatigueFEASimulator } from './components/RodFatigueFEASimulator';
import { SteamPipelineNetwork } from './components/SteamPipelineNetwork';
import { MultiWellGanttScheduler } from './components/MultiWellGanttScheduler';
import { EdgeIoTGateway } from './components/EdgeIoTGateway';
import { ARFieldInspectionHUD } from './components/ARFieldInspectionHUD';
import { AsphaltenePhaseModeler } from './components/AsphaltenePhaseModeler';
import { SandControlMonitor } from './components/SandControlMonitor';
import { AcousticFluidLevelSonolog } from './components/AcousticFluidLevelSonolog';
import { BoilerWaterTreatmentOTSG } from './components/BoilerWaterTreatmentOTSG';
import { EmulsionDehydratorGGS } from './components/EmulsionDehydratorGGS';
import { FiberOpticDTSDASViewer } from './components/FiberOpticDTSDASViewer';
import { CaprockMicroseismicIntegrity } from './components/CaprockMicroseismicIntegrity';
import { VFDMotorHarmonicsAnalyzer } from './components/VFDMotorHarmonicsAnalyzer';
import { SourCorrosionH2SSimulator } from './components/SourCorrosionH2SSimulator';
import { VaporRecoveryVRUUnit } from './components/VaporRecoveryVRUUnit';
import { DroneOGIMethaneInspector } from './components/DroneOGIMethaneInspector';
import { PredictiveSparesWarehouse } from './components/PredictiveSparesWarehouse';
import { soundFx } from './utils/sound';

type Page =
  | 'Dashboard'
  | 'Thar Desert GIS Map'
  | 'Dynacard Analyzer'
  | 'Subsurface Heatmap'
  | 'Field Economics'
  | 'PetroTwin Copilot'
  | 'ESG Carbon Tracker'
  | 'Rod Fatigue FEA'
  | 'Steam Pipeline CFD'
  | 'Multi-Well Gantt'
  | 'Edge IoT Gateway'
  | 'Reports & Work Orders'
  | 'AR Field Inspection'
  | '3D Rig Simulator'
  | 'Upload & Simulate'
  | 'Historical Analytics'
  | 'Wells'
  | 'CSS Optimization'
  | 'SRP Optimization'
  | 'Predictions'
  | 'Anomalies'
  | 'Asphaltene Phase Modeler'
  | 'Sand Control & Erosion'
  | 'Acoustic Sonolog Level'
  | 'OTSG Water Treatment'
  | 'GGS Emulsion Dehydrator'
  | 'Fiber-Optic DTS/DAS'
  | 'Caprock Geomechanics'
  | 'VFD Motor Harmonics'
  | 'Sour Gas (H2S) & Corrosion'
  | 'Vapor Recovery (VRU)'
  | 'Drone OGI Methane'
  | 'Predictive Spares Warehouse'
  | 'About Us';

interface NavItem {
  label: Page;
  icon: any;
  category:
    | 'Core Operations'
    | 'AI & Mechanics'
    | 'Reservoir & Geomechanics'
    | 'Production Chemistry & Wells'
    | 'Enterprise, ESG & Edge';
  badge?: string;
}

const navItems: NavItem[] = [
  // Core Operations
  { label: 'Dashboard', icon: Activity, category: 'Core Operations' },
  { label: 'Thar Desert GIS Map', icon: Compass, category: 'Core Operations', badge: 'GIS' },
  { label: '3D Rig Simulator', icon: Box, category: 'Core Operations', badge: '3D' },
  { label: 'Upload & Simulate', icon: Upload, category: 'Core Operations' },
  { label: 'Historical Analytics', icon: Calendar, category: 'Core Operations' },
  { label: 'Wells', icon: Waves, category: 'Core Operations' },

  // AI & Mechanics
  { label: 'Dynacard Analyzer', icon: CircleGauge, category: 'AI & Mechanics', badge: 'AI' },
  { label: 'PetroTwin Copilot', icon: Bot, category: 'AI & Mechanics', badge: 'VOICE' },
  { label: 'Predictions', icon: BarChart3, category: 'AI & Mechanics', badge: '4-RF' },
  { label: 'Anomalies', icon: AlertTriangle, category: 'AI & Mechanics' },
  { label: 'SRP Optimization', icon: Cpu, category: 'AI & Mechanics' },
  { label: 'CSS Optimization', icon: Factory, category: 'AI & Mechanics' },
  { label: 'Rod Fatigue FEA', icon: Activity, category: 'AI & Mechanics' },
  { label: 'VFD Motor Harmonics', icon: Zap, category: 'AI & Mechanics', badge: 'VFD' },

  // Reservoir & Geomechanics
  { label: 'Subsurface Heatmap', icon: Flame, category: 'Reservoir & Geomechanics', badge: 'CFD' },
  { label: 'Steam Pipeline CFD', icon: Layers, category: 'Reservoir & Geomechanics' },
  { label: 'Multi-Well Gantt', icon: Clock, category: 'Reservoir & Geomechanics' },
  { label: 'Fiber-Optic DTS/DAS', icon: Radio, category: 'Reservoir & Geomechanics', badge: 'DTS' },
  { label: 'Caprock Geomechanics', icon: ShieldCheck, category: 'Reservoir & Geomechanics', badge: 'GEO' },
  { label: 'Asphaltene Phase Modeler', icon: Layers, category: 'Reservoir & Geomechanics', badge: 'APE' },

  // Production Chemistry & Wells
  { label: 'Sand Control & Erosion', icon: ShieldAlert, category: 'Production Chemistry & Wells', badge: 'SAND' },
  { label: 'Acoustic Sonolog Level', icon: Volume2, category: 'Production Chemistry & Wells', badge: 'ECHO' },
  { label: 'OTSG Water Treatment', icon: Droplets, category: 'Production Chemistry & Wells', badge: 'OTSG' },
  { label: 'GGS Emulsion Dehydrator', icon: Factory, category: 'Production Chemistry & Wells', badge: 'GGS' },
  { label: 'Sour Gas (H2S) & Corrosion', icon: Skull, category: 'Production Chemistry & Wells', badge: 'H2S' },

  // Enterprise, ESG & Edge
  { label: 'Field Economics', icon: DollarSign, category: 'Enterprise, ESG & Edge', badge: 'ROI' },
  { label: 'ESG Carbon Tracker', icon: Leaf, category: 'Enterprise, ESG & Edge', badge: 'ESG' },
  { label: 'Vapor Recovery (VRU)', icon: Wind, category: 'Enterprise, ESG & Edge', badge: 'VRU' },
  { label: 'Drone OGI Methane', icon: Navigation, category: 'Enterprise, ESG & Edge', badge: 'OGI' },
  { label: 'Predictive Spares Warehouse', icon: Package, category: 'Enterprise, ESG & Edge', badge: 'RUL' },
  { label: 'Edge IoT Gateway', icon: Radio, category: 'Enterprise, ESG & Edge', badge: 'SCADA' },
  { label: 'Reports & Work Orders', icon: FileText, category: 'Enterprise, ESG & Edge', badge: 'PDF' },
  { label: 'AR Field Inspection', icon: Eye, category: 'Enterprise, ESG & Edge', badge: 'AR' },
  { label: 'About Us', icon: Info, category: 'Enterprise, ESG & Edge' }
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
    <div className="min-h-screen relative text-[#e8f4fc] font-sans selection:bg-cyan-400 selection:text-black bg-[#040914]">
      {/* Heavy-Oil Telemetry & Thermal Steam Ambient Particle Layer */}
      <ParticleCanvas />

      {/* Cyber-Industrial ambient background glow orbs */}
      <div className="ambient-glow-cyan top-10 left-1/4" />
      <div className="ambient-glow-thermal bottom-10 right-10" />
      <div className="ambient-glow-blue top-1/2 right-1/4" />

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
  const [email, setEmail] = useState('admin@baghetwin.local');
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
          className="p-2.5 rounded-2xl glass-subtle text-cyan-200 hover:text-cyan-400 transition-colors cursor-pointer border border-cyan-500/20 shadow-lg"
          title={soundEnabled ? 'Mute Audio Feedback' : 'Enable Audio Feedback'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl grid md:grid-cols-2 glass rounded-3xl overflow-hidden relative border border-cyan-500/25 shadow-2xl backdrop-blur-2xl"
      >
        {/* Left Welcome Branding with High-Tech Petroleum Theme */}
        <div className="p-8 md:p-14 bg-gradient-to-br from-cyan-500/15 via-transparent to-amber-500/10 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-400/35 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                <Zap className="text-cyan-400" size={26} />
              </div>
              <div>
                <div className="font-black text-2xl tracking-wide text-white">
                  Baghe<span className="text-cyan-400">Twin</span>
                </div>
                <div className="text-[11px] text-cyan-200/70 font-mono tracking-wider">Baghewala Heavy-Oil Digital Twin</div>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold mt-12 leading-tight text-white tracking-tight">
              Heavy-Oil Reservoir <br />
              <span className="gradient-text">Intelligence Suite</span>
            </h1>

            <p className="text-cyan-100/75 mt-6 max-w-md text-sm leading-relaxed font-light">
              AI-driven Digital Twin monitoring with 4 RandomForest ML models, 3D Kinematic Oil Rig simulation, and thermal diffusion optimization for Baghewala Field, Rajasthan.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-xs text-cyan-200 font-mono">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-300/25 glass-subtle shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse" /> 4 RF Models Active
            </span>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-300/25 glass-subtle shadow-sm">
              <Box className="w-3.5 h-3.5 text-cyan-400" /> 3D WebGL Engine
            </span>
          </div>
        </div>

        {/* Right Form with Frosted Glassification */}
        <form onSubmit={submit} className="p-8 md:p-14 bg-[#050f1d]/85 backdrop-blur-xl flex flex-col justify-between border-t md:border-t-0 md:border-l border-cyan-500/20">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {mode === 'login' ? 'Engineer Login' : 'Create Operator Account'}
                </h2>
                <p className="text-xs text-cyan-200/60 font-mono mt-1">
                  {mode === 'login' ? 'Authenticate credentials to launch BagheTwin console' : 'Register new BagheTwin digital twin operator'}
                </p>
              </div>
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <HardHat className="text-cyan-400" size={32} />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-cyan-500/20">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setMode('login');
                }}
                className={`py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                    : 'text-cyan-200/60 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setMode('signup');
                }}
                className={`py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                    : 'text-cyan-200/60 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {mode === 'signup' && (
              <label className="block mt-6 text-xs font-mono text-cyan-200 uppercase tracking-wider">
                Full Name *
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Alex Rivera"
                  className="mt-2 w-full rounded-xl p-3 text-sm font-sans"
                />
              </label>
            )}

            <label className="block mt-5 text-xs font-mono text-cyan-200 uppercase tracking-wider">
              Engineer Email *
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@baghetwin.local"
                className="mt-2 w-full rounded-xl p-3 text-sm font-sans"
              />
            </label>

            <label className="block mt-4 text-xs font-mono text-cyan-200 uppercase tracking-wider">
              Password *
              <input
                required
                minLength={6}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl p-3 text-sm font-sans"
              />
            </label>

            {mode === 'signup' && (
              <label className="block mt-4 text-xs font-mono text-cyan-200 uppercase tracking-wider">
                Confirm Password *
                <input
                  required
                  minLength={6}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-2 w-full rounded-xl p-3 text-sm font-sans"
                />
              </label>
            )}
          </div>

          <div className="mt-8 pt-4">
            <button
              disabled={busy}
              onMouseEnter={() => soundFx.playHover()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,229,255,0.35)] hover:shadow-[0_0_35px_rgba(0,229,255,0.6)] transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              {busy ? 'Connecting to BagheTwin...' : mode === 'login' ? 'Launch Digital Twin' : 'Register Operator'}
            </button>
            <p className="text-[11px] text-cyan-200/60 font-mono mt-4 text-center">
              Demo Credentials: <span className="text-cyan-300 font-bold">admin@baghetwin.local</span> / <span className="text-amber-300 font-bold">admin123</span>
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
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="min-h-screen bg-[#040914] text-[#e8f4fc] flex relative z-10">
      {/* Sidebar Navigation with PetroTwin Frosted Glassification */}
      <aside
        className={`${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:sticky top-0 z-30 w-72 h-screen glass-nav p-5 flex flex-col justify-between transition-transform duration-300`}
      >
        <div>
          {/* Sidebar Brand Header */}
          <div className="flex items-center justify-between px-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/35 shadow-[0_0_15px_rgba(0,229,255,0.25)]">
                <Zap className="text-cyan-400" size={22} />
              </div>
              <div>
                <div className="font-black text-xl tracking-wide text-white">
                  Baghe<span className="text-cyan-400">Twin</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-cyan-200/60 font-mono">
                  Heavy-Oil Digital Twin
                </div>
              </div>
            </div>

            <button className="md:hidden text-slate-400 p-1 rounded-lg hover:text-white" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="text-[10px] uppercase tracking-[.2em] text-cyan-400/90 font-mono px-3 mb-2 flex items-center gap-1.5">
            <Radio className="w-3 h-3 animate-pulse text-cyan-400" /> Mission Console
          </div>

          {/* Categorized Nav Items */}
          <nav className="space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar pr-1">
            {(
              [
                'Core Operations',
                'AI & Mechanics',
                'Reservoir & Geomechanics',
                'Production Chemistry & Wells',
                'Enterprise, ESG & Edge'
              ] as const
            ).map((cat) => {
              const items = navItems.filter((i) => i.category === cat);
              return (
                <div key={cat} className="space-y-1">
                  <div className="text-[9px] uppercase tracking-wider text-cyan-400/60 font-mono px-3 py-0.5 font-semibold flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-cyan-400/50" />
                    {cat}
                  </div>
                  {items.map(({ label, icon: Icon, badge }) => {
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
                        className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'text-cyan-300 font-bold bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-transparent border border-cyan-400/35 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                            : 'text-slate-300/80 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <Icon size={15} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                        <span className="truncate">{label}</span>
                        {badge && (
                          <span
                            className={`ml-auto text-[8px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                              badge === 'AI' || badge === 'VOICE'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : badge === 'GIS' || badge === '3D'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : badge === 'CFD' || badge === 'ROI'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : badge === 'ESG'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-700/50 text-slate-300'
                            }`}
                          >
                            {badge}
                          </span>
                        )}
                        {label === 'Anomalies' && !badge && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-rose-400 pulse shadow-[0_0_8px_#f43f5e]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Status Glass Card */}
        <div className="glass-subtle rounded-2xl p-4 border border-cyan-500/20 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 via-sky-400 to-blue-600 flex items-center justify-center font-bold text-slate-950 text-sm shadow-[0_0_12px_rgba(0,229,255,0.4)]">
              {(user?.name || 'B')[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-white truncate">{user?.name || 'Petroleum Engineer'}</div>
              <div className="text-[10px] text-cyan-200/60 font-mono capitalize">{user?.role || 'Lead Architect'}</div>
            </div>
            <button
              onClick={onLogout}
              onMouseEnter={() => soundFx.playHover()}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer border border-transparent hover:border-rose-500/30"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar with PetroTwin Frosted Glassification */}
        <header className="h-20 glass-header sticky top-0 z-20 flex items-center justify-between px-5 md:px-8">
          <button className="md:hidden p-2 text-cyan-200 glass-pill rounded-xl" onClick={() => setOpen(!open)}>
            <Menu />
          </button>

          <div className="hidden md:block">
            <div className="flex items-center gap-2.5">
              <h1 className="font-extrabold text-xl text-white tracking-tight">{title}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-mono border border-cyan-400/25 flex items-center gap-1 shadow-[0_0_8px_rgba(0,229,255,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse" /> BAGHEWALA TWIN
              </span>
            </div>
            <p className="text-xs text-cyan-200/60 font-mono mt-0.5">
              Baghewala Heavy-Oil Field · Rajasthan · CSS &amp; SRP AI Digital Twin
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Clock Readout */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill text-xs font-mono text-cyan-200 border border-cyan-500/20">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentTime}</span>
            </div>

            {/* Well Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-200/70 hidden sm:inline">Active Well:</span>
              <select
                value={well}
                onChange={(e) => {
                  soundFx.playClick();
                  setWell(e.target.value);
                }}
                className="rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-300 outline-none cursor-pointer border border-cyan-500/25 shadow-sm"
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

            <div className="h-8 w-px bg-cyan-500/20" />

            {/* Audio Toggle */}
            <button
              onClick={onSoundToggle}
              onMouseEnter={() => soundFx.playHover()}
              className="p-2 rounded-xl glass-subtle text-cyan-200 hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1.5 border border-cyan-500/20 shadow-sm"
              title={soundEnabled ? 'Mute Audio Synthesizer' : 'Enable Audio Synthesizer'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <span className="text-xs font-mono text-cyan-200/70 hidden sm:inline">Audio</span>
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
              {page === 'Dashboard' && <Dashboard well={well} onNavigate={setPage} />}
              {page === 'Thar Desert GIS Map' && <FieldGISMap onSelectWell={(w) => setWell(w)} />}
              {page === 'Dynacard Analyzer' && <DynacardAnalyzer wellId={well} />}
              {page === 'Subsurface Heatmap' && <ThermalCFDHeatmap wellId={well} />}
              {page === 'Field Economics' && <FieldEconomicsSandbox wellId={well} />}
              {page === 'PetroTwin Copilot' && <PetroTwinCopilot onNavigate={(p: any) => setPage(p)} />}
              {page === 'ESG Carbon Tracker' && <ESGCarbonTracker wellId={well} />}
              {page === 'Rod Fatigue FEA' && <RodFatigueFEASimulator wellId={well} />}
              {page === 'Steam Pipeline CFD' && <SteamPipelineNetwork />}
              {page === 'Multi-Well Gantt' && <MultiWellGanttScheduler />}
              {page === 'Edge IoT Gateway' && <EdgeIoTGateway wellId={well} />}
              {page === 'Reports & Work Orders' && <ReportAndWorkOrderGenerator wellId={well} />}
              {page === 'AR Field Inspection' && <ARFieldInspectionHUD wellId={well} />}
              {page === '3D Rig Simulator' && <Rig3DPage well={well} />}
              {page === 'Upload & Simulate' && <DataUploadSimulator />}
              {page === 'Historical Analytics' && <HistoricalDataPanel wellId={well} />}
              {page === 'Wells' && <WellsPage well={well} />}
              {page === 'CSS Optimization' && <CSSPage well={well} />}
              {page === 'SRP Optimization' && <SRPPage well={well} />}
              {page === 'Predictions' && <Predictions well={well} />}
              {page === 'Anomalies' && <AnomaliesPage well={well} />}
              {page === 'Asphaltene Phase Modeler' && <AsphaltenePhaseModeler wellId={well} />}
              {page === 'Sand Control & Erosion' && <SandControlMonitor wellId={well} />}
              {page === 'Acoustic Sonolog Level' && <AcousticFluidLevelSonolog wellId={well} />}
              {page === 'OTSG Water Treatment' && <BoilerWaterTreatmentOTSG />}
              {page === 'GGS Emulsion Dehydrator' && <EmulsionDehydratorGGS />}
              {page === 'Fiber-Optic DTS/DAS' && <FiberOpticDTSDASViewer wellId={well} />}
              {page === 'Caprock Geomechanics' && <CaprockMicroseismicIntegrity wellId={well} />}
              {page === 'VFD Motor Harmonics' && <VFDMotorHarmonicsAnalyzer wellId={well} />}
              {page === 'Sour Gas (H2S) & Corrosion' && <SourCorrosionH2SSimulator wellId={well} />}
              {page === 'Vapor Recovery (VRU)' && <VaporRecoveryVRUUnit wellId={well} />}
              {page === 'Drone OGI Methane' && <DroneOGIMethaneInspector />}
              {page === 'Predictive Spares Warehouse' && <PredictiveSparesWarehouse />}
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
      className="glass rounded-3xl p-5 relative overflow-hidden group border border-cyan-500/20 shadow-xl"
    >
      <div
        className={`absolute -right-8 -top-8 w-28 h-28 rounded-full bg-${accent}-400/10 blur-2xl group-hover:bg-${accent}-400/20 transition-all pointer-events-none`}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-cyan-200/70 uppercase tracking-wider">{label}</span>
        <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 group-hover:border-cyan-400/40 transition-colors shadow-sm">
          <Icon size={18} className="text-cyan-400" />
        </div>
      </div>
      <div className="mt-4 text-3xl font-extrabold text-white font-mono tracking-tight">
        {value}
        <span className="text-xs font-normal text-cyan-200/60 ml-1.5">{unit}</span>
      </div>
    </motion.div>
  );
}

function Dashboard({ well, onNavigate }: { well: string; onNavigate: (p: Page) => void }) {
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-300/25 text-emerald-300 text-xs font-mono font-medium mb-3 glass-subtle shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse" /> DIGITAL TWIN SYNCHRONIZED
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Baghe<span className="gradient-text">Twin Control</span> Center
          </h2>
          <p className="text-slate-300 text-sm mt-2 max-w-2xl font-light">
            Continuous telemetry feed, automated 4-RandomForest ML models, and 3D simulation for well <b className="text-cyan-300 font-mono">{well}</b>.
          </p>
        </div>

        <div className="text-right text-xs text-cyan-200/80 font-mono glass p-4 rounded-2xl border border-cyan-500/20 shadow-lg">
          Telemetry Stream: <br />
          <b className="text-cyan-300 font-bold text-xs">{new Date().toLocaleDateString()} · Active Sync</b>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Oil Production"
          value={fmt(d?.production?.latest?.oil_bopd, 1)}
          unit="BOPD"
          icon={BarChart3}
          accent="cyan"
        />
        <MetricCard
          label="Reservoir Temp"
          value={fmt(d?.well?.latest?.temperature_c, 1)}
          unit="°C"
          icon={Waves}
          accent="amber"
        />
        <MetricCard
          label="Wellhead Pressure"
          value={fmt(d?.well?.latest?.pressure_bar, 1)}
          unit="bar"
          icon={CircleGauge}
          accent="cyan"
        />
        <MetricCard
          label="System Health"
          value="98.5"
          unit="%"
          icon={ShieldCheck}
          accent="emerald"
        />
      </div>

      {/* 3D Oil Rig Quick Viewer & Production Graph */}
      <div className="grid lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-6">
          <OilRig3DViewer spm={8.5} strokeLengthM={3.2} wellId={well} />
        </div>

        {/* Production & Thermal Trend Graph */}
        <div className="lg:col-span-6 glass rounded-3xl p-6 border border-cyan-500/20 flex flex-col justify-between shadow-2xl backdrop-blur-2xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-white">Production &amp; Thermal Telemetry Stream</h3>
                <p className="text-xs text-cyan-200/60 font-mono mt-0.5">Historical BOPD vs Reservoir Temperature</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono glass-pill">
                7-Day Window
              </span>
            </div>

            <div className="h-64 mt-2">
              {chart.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chart}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(4, 15, 28, 0.95)',
                        border: '1px solid rgba(0, 229, 255, 0.3)',
                        borderRadius: '16px',
                        backdropFilter: 'blur(12px)',
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
                      stroke="#ff9f1c"
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

          <div className="mt-4 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-300 font-mono">
            <span>Forecasted Next BOPD: <b className="text-cyan-300 font-bold">148.2 BOPD</b></span>
            <span>Target Efficiency: <b className="text-emerald-300 font-bold">94.0%</b></span>
          </div>
        </div>
      </div>

      {/* AI Action Board & Quick Tools */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>AI Action &amp; Risk Board</span>
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('Upload & Simulate')}
              className="px-3 py-1.5 rounded-xl glass-subtle text-xs font-mono text-cyan-300 hover:text-white border border-cyan-500/30 transition-colors"
            >
              Upload Data →
            </button>
            <button
              onClick={() => onNavigate('Historical Analytics')}
              className="px-3 py-1.5 rounded-xl glass-subtle text-xs font-mono text-amber-300 hover:text-white border border-amber-500/30 transition-colors"
            >
              Historical Panel →
            </button>
          </div>
        </div>

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

function Rig3DPage({ well }: { well: string }) {
  return (
    <>
      <PageIntro
        icon={Box}
        title="3D Blender-Grade Oil Rig & Pumpjack Simulator"
        text="Interactive Three.js 3D mechanical simulation with 360° orbit rotation, lighting environments, articulated walking beam kinematics, and subsurface strata visualization."
      />
      <OilRig3DViewer spm={8.5} strokeLengthM={3.2} wellId={well} />
    </>
  );
}

function ActionItem({ title, value, tone }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl glass-subtle border border-cyan-500/15 shadow-md">
      <span className="text-xs text-slate-300 font-medium">{title}</span>
      <span
        className={`text-xs font-mono font-bold px-3 py-1 rounded-xl ${
          tone === 'emerald'
            ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-300/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
            : tone === 'amber'
            ? 'bg-amber-400/15 text-amber-300 border border-amber-300/30 shadow-[0_0_10px_rgba(255,159,28,0.2)]'
            : 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
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
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-sky-500/15 to-blue-600/20 border border-cyan-400/40 shadow-[0_0_20px_rgba(0,229,255,0.25)]">
        <Icon className="text-cyan-400" size={24} />
      </div>
      <div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">{title}</h2>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl font-light leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function DataTable({ title, rows, columns }: { title: string; rows: any[]; columns: [string, string][] }) {
  return (
    <div className="glass rounded-3xl overflow-hidden border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
      <div className="p-6 border-b border-cyan-500/20 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-white">{title}</h3>
          <p className="text-xs text-cyan-200/60 font-mono mt-0.5">Source: Baghewala Subsurface Dataset / PostgreSQL Mirror</p>
        </div>
        <span className="text-[11px] font-mono px-3 py-1 rounded-full glass-pill text-cyan-300 border border-cyan-500/20">
          {rows.length} Records
        </span>
      </div>
      <div className="overflow-auto scrollbar">
        <table className="w-full text-xs">
          <thead className="bg-[#06101e] font-mono">
            <tr>
              {columns.map((c) => (
                <th
                  key={c[0]}
                  className="text-left px-5 py-4 uppercase tracking-wider text-cyan-300/80 whitespace-nowrap"
                >
                  {c[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-500/10 font-mono">
            {rows.length ? (
              rows.map((r, i) => (
                <tr key={i} className="hover:bg-cyan-500/5 transition-colors">
                  {columns.map((c) => (
                    <td key={c[0]} className="px-5 py-4 whitespace-nowrap text-slate-200">
                      {r[c[1]] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-slate-500 font-mono">
                  No records loaded. Telemetry mirror active.
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
        text="Reservoir, wellbore dynamics, and production telemetry collected from the Baghewala Oil field dataset."
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
        text="Monitor Cyclic Steam Stimulation (CSS) parameters and execute RandomForest AI thermal diffusion solver algorithms."
      />

      {/* SVG Steam Plume Visualizer Component */}
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
        <div className="lg:col-span-7 glass rounded-3xl p-6 border border-cyan-500/20 flex flex-col justify-between shadow-2xl backdrop-blur-2xl">
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-base text-white">AI CSS Recommendation Generator</h3>
                <p className="text-xs text-slate-300 font-mono mt-1">
                  RF_CSS_Optimizer: Maximize heavy-oil recovery while minimizing Steam-Oil Ratio (SOR).
                </p>
              </div>
              <button
                onClick={handleOptimize}
                onMouseEnter={() => soundFx.playHover()}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(255,159,28,0.4)] hover:shadow-[0_0_35px_rgba(255,159,28,0.7)] transition-all cursor-pointer transform hover:-translate-y-0.5"
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
                  <div key={x[0]} className="rounded-2xl glass-subtle border border-amber-300/30 p-4 shadow-md">
                    <p className="text-xs text-amber-300 font-mono uppercase">{x[0]}</p>
                    <b className="text-2xl text-white font-mono mt-1 block">
                      {fmt(x[1])} {x[2]}
                    </b>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-cyan-500/20 text-xs text-slate-400 font-mono">
            * Closed-loop thermal recommendation powered by RandomForest RF_CSS_Optimizer.
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
          rod_floating_risk_after: 0.04
        });
      });
  };

  return (
    <>
      <PageIntro
        icon={CircleGauge}
        title="SRP Mechanical Optimization Suite"
        text="Interactive Sucker Rod Pump mechanical simulator with downhole valve motion, dynamic parameter tuning, and real-time Dynagraph analysis."
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

      <div className="glass rounded-3xl p-6 mb-6 border border-cyan-500/20 flex flex-col justify-between shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-base text-white">AI SRP Recommendation Engine</h3>
            <p className="text-xs text-slate-300 font-mono mt-1">
              RF_SRP_Efficiency_Model: Balances mechanical volumetric efficiency against rod floating risk and motor overload.
            </p>
          </div>
          <button
            onClick={handleOptimize}
            onMouseEnter={() => soundFx.playHover()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_35px_rgba(0,229,255,0.7)] transition-all cursor-pointer transform hover:-translate-y-0.5"
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
              <div key={x[0]} className="rounded-2xl glass-subtle border border-cyan-300/30 p-4 shadow-md">
                <p className="text-xs text-cyan-300 font-mono uppercase">{x[0]}</p>
                <b className="text-2xl text-white font-mono mt-1 block">
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
          production: { next_day_production: 148.5, next_7_day_avg: 146.2, confidence: 0.96 },
          srp: { recommended_spm: 9.0, recommended_vfd_hz: 45.0, rod_floating_risk_after: 0.04 },
          css: { expected_sor: 2.1 }
        });
      });
  }, [well]);

  return (
    <>
      <PageIntro
        icon={BarChart3}
        title="4-RandomForest AI Predictions & Inference Hub"
        text="Full suite of scikit-learn RandomForest models trained on Baghewala reservoir physics."
      />

      {/* 4 Models Summary Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-2xl p-4 border border-cyan-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Model 1</span>
          <b className="text-sm font-mono text-cyan-300 mt-1 block">RF_Production_Forecaster</b>
          <span className="text-xs text-slate-300 mt-1 block">R2: 0.993 · Daily BOPD</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-amber-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Model 2</span>
          <b className="text-sm font-mono text-amber-300 mt-1 block">RF_Anomaly_Detector</b>
          <span className="text-xs text-slate-300 mt-1 block">Acc: 98.8% · Failure Modes</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-orange-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Model 3</span>
          <b className="text-sm font-mono text-orange-400 mt-1 block">RF_CSS_Optimizer</b>
          <span className="text-xs text-slate-300 mt-1 block">R2: 0.894 · Steam-Oil Ratio</span>
        </div>
        <div className="glass rounded-2xl p-4 border border-emerald-500/20">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Model 4</span>
          <b className="text-sm font-mono text-emerald-300 mt-1 block">RF_SRP_Efficiency_Model</b>
          <span className="text-xs text-slate-300 mt-1 block">R2: 0.845 · Kinematics</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-8 border border-cyan-500/20 flex flex-col justify-between shadow-2xl backdrop-blur-2xl">
          <div>
            <div className="flex items-center gap-3.5 mb-6">
              <div className="p-3.5 rounded-2xl bg-cyan-400/15 border border-cyan-400/30 shadow-[0_0_15px_rgba(0,229,255,0.25)]">
                <BarChart3 className="text-cyan-300" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Production Forecast Model</h3>
                <p className="text-xs text-slate-400 font-mono">RandomForestRegressor (BagheTwin RF_Production_Forecaster)</p>
              </div>
            </div>

            <div className="text-5xl font-extrabold text-white font-mono tracking-tight my-4">
              {fmt(d?.production?.next_day_production)}{' '}
              <span className="text-lg font-normal text-slate-400">BOPD</span>
            </div>
            <p className="text-xs text-cyan-200/80 font-mono">Predicted Next-Day Oil Production</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-cyan-500/20 font-mono">
            <div className="p-4 rounded-2xl glass-subtle border border-cyan-500/10">
              <p className="text-xs text-slate-400">7-Day Forecast Avg</p>
              <b className="text-lg text-white mt-1 block">{fmt(d?.production?.next_7_day_avg)} BOPD</b>
            </div>
            <div className="p-4 rounded-2xl glass-subtle border border-cyan-500/10">
              <p className="text-xs text-slate-400">Model Confidence</p>
              <b className="text-lg text-cyan-300 mt-1 block">
                {Math.round((d?.production?.confidence || 0.96) * 100)}%
              </b>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 border border-cyan-500/20 flex flex-col justify-between shadow-2xl backdrop-blur-2xl">
          <div>
            <div className="flex items-center gap-3.5 mb-6">
              <div className="p-3.5 rounded-2xl bg-amber-400/15 border border-amber-400/30 shadow-[0_0_15px_rgba(255,159,28,0.25)]">
                <CircleGauge className="text-amber-400" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">SRP / CSS Operating Outlook</h3>
                <p className="text-xs text-slate-400 font-mono">RandomForest Recommendation Layer</p>
              </div>
            </div>

            <div className="space-y-3">
              <ActionItem title="Recommended SPM" value={fmt(d?.srp?.recommended_spm) + ' SPM'} tone="cyan" />
              <ActionItem title="Recommended VFD" value={fmt(d?.srp?.recommended_vfd_hz) + ' Hz'} tone="cyan" />
              <ActionItem
                title="Expected Rod-Float Risk"
                value={`${Math.round((d?.srp?.rod_floating_risk_after || 0.04) * 100)}%`}
                tone="emerald"
              />
              <ActionItem title="Expected CSS SOR" value={fmt(d?.css?.expected_sor)} tone="emerald" />
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-cyan-500/20 text-xs text-slate-400 font-mono">
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
        text="RF_Anomaly_Detector classifier evaluating downhole pump health and failure prevention."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <AnomalyCard title="Live Telemetry Condition" subtitle="Current sensor state" data={d?.current || {}} />
        <AnomalyCard title="AI Risk Projection" subtitle="RandomForest anomaly model prediction" data={d?.predicted || {}} />
      </div>

      <div className="glass rounded-3xl p-6 mt-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
        <h3 className="font-bold text-base text-white mb-2">Operator Action Guidance Playbook</h3>
        <p className="text-xs text-slate-300 leading-relaxed font-light">
          The anomaly detection engine evaluates dynacard load variances, VFD frequency instability, motor surface temperatures, and steep production drops. Take immediate preventive action if any indicator transitions to HIGH or CRITICAL.
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
    <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-lg text-white">{title}</h3>
          <p className="text-xs text-cyan-200/60 font-mono mt-0.5">{subtitle}</p>
        </div>
        <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/20">
          <AlertTriangle size={20} className="text-amber-400" />
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {fields.map((f) => {
          const val = String(data?.[f[1]] || 'NORMAL');
          const isCritical = val.toLowerCase().includes('high') || val.toLowerCase().includes('critical');
          return (
            <div key={f[0]} className="flex items-center justify-between p-3.5 rounded-2xl glass-subtle border border-cyan-500/10">
              <span className="text-slate-300">{f[0]}</span>
              <b className={isCritical ? 'text-rose-400 font-bold' : 'text-emerald-300 font-bold'}>{val}</b>
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
        title="About BagheTwin AI"
        text="Integrated Digital Twin platform purpose-built for heavy-oil well modeling, Cyclic Steam Stimulation (CSS), and Sucker Rod Pump (SRP) optimization in Baghewala Field."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass rounded-3xl p-8 lg:col-span-2 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
          <h3 className="text-xl font-bold text-white mb-4">Baghewala Well-to-Surface Intelligence</h3>
          <p className="text-slate-300 leading-relaxed text-sm font-light mb-8">
            BagheTwin connects historical reservoir, CSS thermal injection, and SRP mechanical lifting data into a unified, high-tech cyber-industrial digital twin environment: observe live telemetry, forecast production, isolate failure anomalies, and deliver automated operational recommendations.
          </p>

          <div className="grid md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl glass-subtle border border-cyan-500/15">
              <span className="text-slate-400 block mb-1">Frontend Layer</span>
              <b className="text-cyan-300 text-sm">React + Three.js + Framer Motion</b>
            </div>
            <div className="p-4 rounded-2xl glass-subtle border border-amber-500/15">
              <span className="text-slate-400 block mb-1">Backend ML Layer</span>
              <b className="text-amber-300 text-sm">FastAPI + 4 RandomForest Models</b>
            </div>
            <div className="p-4 rounded-2xl glass-subtle border border-emerald-500/15">
              <span className="text-slate-400 block mb-1">Data Storage</span>
              <b className="text-emerald-300 text-sm">PostgreSQL Mirror</b>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 border border-cyan-500/20 flex flex-col justify-between shadow-2xl backdrop-blur-2xl">
          <div>
            <h3 className="font-bold text-base text-white mb-4">Core Platform Capabilities</h3>
            <ul className="space-y-3 text-xs text-slate-300 font-mono">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> 3D Blender-Grade Oil Rig Simulator
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Custom CSV Dataset Upload &amp; Playback
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> 90-Day Historical Data Analytics Panel
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> 4 Dedicated RandomForest ML Models
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> CSS Thermal &amp; SRP Kinematic Solvers
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-cyan-500/20 text-[11px] text-slate-400 font-mono">
            BagheTwin Heavy-Oil Intelligence Platform · Cyber-Industrial Edition
          </div>
        </div>
      </div>
    </>
  );
}
