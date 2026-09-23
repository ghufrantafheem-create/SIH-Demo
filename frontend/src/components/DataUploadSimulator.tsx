import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileSpreadsheet,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  BarChart3,
  Factory,
  CircleGauge,
  Sparkles,
  Download,
  Info
} from 'lucide-react';
import { AnimatedPumpVisualizer } from './AnimatedPumpVisualizer';
import { SteamInjectionVisualizer } from './SteamInjectionVisualizer';
import { soundFx } from '../utils/sound';

interface DataRow {
  well_id: string;
  temperature_c: number;
  pressure_bar: number;
  watercut: number;
  oil_viscosity_cp: number;
  spm: number;
  stroke_m: number;
  vfd_hz: number;
  rod_load_kn: number;
  steam_volume_t: number;
  injection_pressure_bar: number;
  soak_hours: number;
  production_rate: number;
  anomaly_label?: string;
  predicted_bopd?: number;
  css_sor?: number;
}

export const DataUploadSimulator: React.FC = () => {
  const [dataRows, setDataRows] = useState<DataRow[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Load sample dataset on mount
  useEffect(() => {
    loadPresetData('cold_start');
  }, []);

  // Playback timer
  useEffect(() => {
    if (!isPlaying || dataRows.length === 0) return;

    const intervalTime = Math.max(400, 2000 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= dataRows.length - 1) {
          setIsPlaying(false);
          soundFx.playSuccess();
          return prev;
        }
        soundFx.playPumpPulse();
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, dataRows.length, playbackSpeed]);

  const loadPresetData = (preset: 'cold_start' | 'post_steam' | 'anomaly_burst') => {
    soundFx.playClick();
    let rows: DataRow[] = [];

    if (preset === 'cold_start') {
      // 15 days of progressive thermal recovery from cold well
      for (let i = 0; i < 15; i++) {
        const temp = 58.0 + i * 2.2;
        const visc = Math.max(120, 1950 * Math.exp(-0.045 * (temp - 60)));
        const spm = 6.0 + i * 0.4;
        const prod = 45.0 + i * 7.5;
        rows.push({
          well_id: 'BGW-001',
          temperature_c: parseFloat(temp.toFixed(1)),
          pressure_bar: parseFloat((24.0 + i * 0.8).toFixed(1)),
          watercut: parseFloat((34.0 - i * 0.8).toFixed(1)),
          oil_viscosity_cp: parseFloat(visc.toFixed(1)),
          spm: parseFloat(spm.toFixed(1)),
          stroke_m: 3.2,
          vfd_hz: parseFloat((spm * 5.0).toFixed(1)),
          rod_load_kn: parseFloat((48.0 + (visc / 50.0)).toFixed(1)),
          steam_volume_t: 1250,
          injection_pressure_bar: 85.0,
          soak_hours: 120,
          production_rate: parseFloat(prod.toFixed(1)),
          predicted_bopd: parseFloat((prod * 1.05).toFixed(1)),
          css_sor: parseFloat((2.6 - i * 0.04).toFixed(2)),
          anomaly_label: i === 0 ? 'HIGH_VISCOSITY' : 'NORMAL'
        });
      }
      setUploadStatus('Loaded Preset: Heavy-Oil Cold Reservoir Stimulation (15 Timesteps)');
    } else if (preset === 'post_steam') {
      // Peak production cycle after thermal CSS soak
      for (let i = 0; i < 20; i++) {
        const temp = 92.0 - i * 1.2;
        const visc = 140.0 + i * 25.0;
        const prod = 168.0 - i * 4.2;
        rows.push({
          well_id: 'BGW-002',
          temperature_c: parseFloat(temp.toFixed(1)),
          pressure_bar: parseFloat((42.0 - i * 0.9).toFixed(1)),
          watercut: parseFloat((12.0 + i * 0.9).toFixed(1)),
          oil_viscosity_cp: parseFloat(visc.toFixed(1)),
          spm: 9.5,
          stroke_m: 3.4,
          vfd_hz: 47.5,
          rod_load_kn: parseFloat((62.0 + i * 0.8).toFixed(1)),
          steam_volume_t: 1400,
          injection_pressure_bar: 88.0,
          soak_hours: 144,
          production_rate: parseFloat(prod.toFixed(1)),
          predicted_bopd: parseFloat((prod * 0.98).toFixed(1)),
          css_sor: 1.95,
          anomaly_label: 'NORMAL'
        });
      }
      setUploadStatus('Loaded Preset: Post-CSS Peak Thermal Production (20 Timesteps)');
    } else {
      // Severe anomaly burst (Gas Lock & Rod Float stress test)
      for (let i = 0; i < 12; i++) {
        const isAnomaly = i >= 6;
        rows.push({
          well_id: 'BGW-003',
          temperature_c: parseFloat((80.0 + (isAnomaly ? 12.0 : 0)).toFixed(1)),
          pressure_bar: parseFloat((isAnomaly ? 14.2 : 36.0).toFixed(1)),
          watercut: parseFloat((isAnomaly ? 48.0 : 18.0).toFixed(1)),
          oil_viscosity_cp: isAnomaly ? 1450.0 : 280.0,
          spm: isAnomaly ? 13.5 : 8.0,
          stroke_m: 3.2,
          vfd_hz: isAnomaly ? 60.0 : 40.0,
          rod_load_kn: parseFloat((isAnomaly ? 82.5 : 55.0).toFixed(1)),
          steam_volume_t: 1100,
          injection_pressure_bar: 80.0,
          soak_hours: 96,
          production_rate: parseFloat((isAnomaly ? 32.0 : 135.0).toFixed(1)),
          predicted_bopd: parseFloat((isAnomaly ? 28.0 : 142.0).toFixed(1)),
          css_sor: 3.4,
          anomaly_label: isAnomaly ? (i % 2 === 0 ? 'GAS_LOCK' : 'ROD_FLOATING') : 'NORMAL'
        });
      }
      setUploadStatus('Loaded Preset: Downhole Anomaly & Stress Trigger (12 Timesteps)');
    }

    setDataRows(rows);
    setCurrentIndex(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundFx.playClick();
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      parseCSV(text, file.name);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string, filename: string) => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        alert('CSV file must have a header line and at least one data row.');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
      const parsed: DataRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
        if (values.length < 2) continue;

        const row: any = {};
        headers.forEach((h, idx) => {
          const val = values[idx];
          row[h] = isNaN(Number(val)) ? val : Number(val);
        });

        parsed.push({
          well_id: row.well_id || row.well || 'BGW-UPLOAD',
          temperature_c: row.temperature_c || row.temp || 75.0,
          pressure_bar: row.pressure_bar || row.pressure || 32.0,
          watercut: row.watercut || row.wc || 20.0,
          oil_viscosity_cp: row.oil_viscosity_cp || row.viscosity || 350.0,
          spm: row.spm || 8.5,
          stroke_m: row.stroke_m || row.stroke || 3.2,
          vfd_hz: row.vfd_hz || 42.5,
          rod_load_kn: row.rod_load_kn || 60.0,
          steam_volume_t: row.steam_volume_t || 1200,
          injection_pressure_bar: row.injection_pressure_bar || 82.0,
          soak_hours: row.soak_hours || 120,
          production_rate: row.production_rate || row.oil_bopd || 140.0,
          predicted_bopd: row.predicted_bopd || row.production_rate || 145.0,
          css_sor: row.expected_sor || 2.15,
          anomaly_label: row.anomaly_label || 'NORMAL'
        });
      }

      if (parsed.length > 0) {
        soundFx.playSuccess();
        setDataRows(parsed);
        setCurrentIndex(0);
        setUploadStatus(`Successfully parsed ${parsed.length} rows from "${filename}". Ready for simulation.`);
      }
    } catch (err) {
      alert('Error parsing CSV. Please verify column formatting.');
    }
  };

  const currentRow: DataRow = dataRows[currentIndex] || {
    well_id: 'BGW-001',
    temperature_c: 78.0,
    pressure_bar: 35.0,
    watercut: 18.0,
    oil_viscosity_cp: 320.0,
    spm: 8.5,
    stroke_m: 3.2,
    vfd_hz: 42.5,
    rod_load_kn: 62.0,
    steam_volume_t: 1250,
    injection_pressure_bar: 85.0,
    soak_hours: 120,
    production_rate: 142.5,
    predicted_bopd: 148.0,
    css_sor: 2.15,
    anomaly_label: 'NORMAL'
  };

  return (
    <div className="space-y-6">
      {/* Upload Banner & Preset Selectors */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <FileSpreadsheet size={22} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Dataset Upload &amp; Live Simulation Sandbox</h2>
            </div>
            <p className="text-xs text-slate-300 font-mono max-w-2xl">
              Upload custom CSV telemetry or select preset Baghewala test sets to drive real-time kinematic and CFD thermal animations through all 4 RandomForest models.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] flex items-center gap-2 cursor-pointer transition-all">
              <Upload size={16} />
              <span>Upload CSV Dataset</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <div className="flex items-center gap-1.5 p-1 rounded-xl glass-subtle border border-cyan-500/20 text-xs font-mono">
              <span className="text-slate-400 px-2">Presets:</span>
              <button
                onClick={() => loadPresetData('cold_start')}
                className="px-2.5 py-1 rounded-lg hover:bg-cyan-500/20 text-cyan-300 transition-colors"
              >
                Cold Formation
              </button>
              <button
                onClick={() => loadPresetData('post_steam')}
                className="px-2.5 py-1 rounded-lg hover:bg-amber-500/20 text-amber-300 transition-colors"
              >
                Peak CSS
              </button>
              <button
                onClick={() => loadPresetData('anomaly_burst')}
                className="px-2.5 py-1 rounded-lg hover:bg-rose-500/20 text-rose-300 transition-colors"
              >
                Stress Test
              </button>
            </div>
          </div>
        </div>

        {uploadStatus && (
          <div className="mt-4 p-3 rounded-2xl glass-subtle border border-cyan-500/20 text-xs font-mono text-cyan-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadStatus}</span>
          </div>
        )}
      </div>

      {/* Simulation Playback Console Bar */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-300">
              Timestep: <b className="text-cyan-300 text-sm">{currentIndex + 1}</b> / {dataRows.length}
            </span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full glass-pill text-cyan-300 border border-cyan-400/25">
              Well: {currentRow.well_id}
            </span>
          </div>

          {/* Controls: Prev, Play/Pause, Next, Speed, Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setCurrentIndex((prev) => Math.max(0, prev - 1));
              }}
              className="p-2 rounded-xl glass-subtle text-slate-300 hover:text-white border border-cyan-500/20 cursor-pointer"
              title="Previous Timestep"
            >
              ◀
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setIsPlaying(!isPlaying);
              }}
              className={`px-5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                isPlaying
                  ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-cyan-500/25 text-cyan-300 border-cyan-400/40'
              }`}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPlaying ? 'PAUSE PLAYBACK' : 'START SIMULATION'}</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setCurrentIndex((prev) => Math.min(dataRows.length - 1, prev + 1));
              }}
              className="p-2 rounded-xl glass-subtle text-slate-300 hover:text-white border border-cyan-500/20 cursor-pointer"
              title="Next Timestep"
            >
              ▶
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setCurrentIndex(0);
                setIsPlaying(false);
              }}
              className="p-2 rounded-xl glass-subtle text-slate-300 hover:text-cyan-300 border border-cyan-500/20 cursor-pointer"
              title="Reset to Timestep 1"
            >
              <RotateCcw size={15} />
            </button>

            {/* Speed Toggle */}
            <div className="flex items-center gap-1 ml-2 font-mono text-xs">
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => {
                    soundFx.playClick();
                    setPlaybackSpeed(spd);
                  }}
                  className={`px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400/40 font-bold'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Timeline Slider */}
        <input
          type="range"
          min="0"
          max={Math.max(0, dataRows.length - 1)}
          value={currentIndex}
          onChange={(e) => setCurrentIndex(Number(e.target.value))}
          className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Real-Time Live Telemetry Metrics Cards for Current Uploaded Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Oil Flow Rate</span>
          <b className="text-xl font-mono text-cyan-300 mt-1 block">{currentRow.production_rate} BOPD</b>
        </div>
        <div className="glass rounded-2xl p-4 border border-amber-500/20 text-center">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Reservoir Temp</span>
          <b className="text-xl font-mono text-amber-300 mt-1 block">{currentRow.temperature_c} °C</b>
        </div>
        <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Oil Viscosity</span>
          <b className="text-xl font-mono text-emerald-300 mt-1 block">{currentRow.oil_viscosity_cp} cP</b>
        </div>
        <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Pumping Speed</span>
          <b className="text-xl font-mono text-cyan-300 mt-1 block">{currentRow.spm} SPM</b>
        </div>
        <div className="glass rounded-2xl p-4 border border-orange-500/20 text-center">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Rod Peak Load</span>
          <b className="text-xl font-mono text-orange-300 mt-1 block">{currentRow.rod_load_kn} kN</b>
        </div>
        <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">AI Anomaly State</span>
          <b
            className={`text-sm font-mono font-bold mt-1.5 block ${
              currentRow.anomaly_label === 'NORMAL' ? 'text-emerald-400' : 'text-rose-400 animate-pulse'
            }`}
          >
            {currentRow.anomaly_label}
          </b>
        </div>
      </div>

      {/* Dynamic Animated Visualizers driven by Uploaded Data Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <AnimatedPumpVisualizer
          spm={currentRow.spm}
          strokeLengthM={currentRow.stroke_m}
          rodLoadKn={currentRow.rod_load_kn}
          pumpEfficiencyPct={Math.min(96, Math.max(50, 95 - currentRow.oil_viscosity_cp / 120))}
          interactiveMode={false}
        />

        <SteamInjectionVisualizer
          steamVolumeT={currentRow.steam_volume_t}
          injectionPressureBar={currentRow.injection_pressure_bar}
          soakHours={currentRow.soak_hours}
          expectedSor={currentRow.css_sor}
        />
      </div>
    </div>
  );
};
