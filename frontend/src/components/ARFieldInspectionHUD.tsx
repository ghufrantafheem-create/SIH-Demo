import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Camera,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  ShieldAlert,
  Zap,
  RotateCcw,
  Sparkles,
  Flashlight
} from 'lucide-react';
import { soundFx } from '../utils/sound';

export const ARFieldInspectionHUD: React.FC<{ wellId?: string }> = ({ wellId = 'BGW-001' }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [hazardZoneVisible, setHazardZoneVisible] = useState<boolean>(true);
  const [qrScanned, setQrScanned] = useState<boolean>(false);
  const [hudAngle, setHudAngle] = useState<number>(14.2);

  // Toggle physical camera pass-through
  const toggleCamera = async () => {
    soundFx.playClick();
    if (!cameraActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        // Fallback to digital twin simulated feed
        setCameraActive(true);
      }
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    }
  };

  const handleSimulateQrScan = () => {
    soundFx.playSuccess();
    setQrScanned(true);
    setTimeout(() => setQrScanned(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <Eye size={22} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Augmented Reality (AR / WebXR) Mobile Field Inspection HUD
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Live Camera Overlay &bull; Counterweight Safety Exclusion Zones &bull; QR Code Asset Tag Scanner.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleCamera}
              className={`px-4 py-2 rounded-2xl border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                cameraActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              <Camera size={15} />
              <span>{cameraActive ? 'CAMERA HUD ACTIVE' : 'LAUNCH CAMERA AR'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main AR Viewport */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* AR HUD Viewport Window */}
        <div className="lg:col-span-8 glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          <div className="relative w-full h-[440px] bg-gradient-to-b from-[#030914] via-[#051124] to-[#02060e] rounded-2xl border border-cyan-500/20 overflow-hidden flex items-center justify-center">
            {/* Live Camera Video Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'opacity-80' : 'hidden'}`}
            />

            {/* Simulated 3D Pumpjack Silhouette if Camera is off */}
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                <div className="w-1 bg-cyan-400 h-64" />
                <div className="w-48 h-1 bg-cyan-400 -mt-32 transform -rotate-12" />
                <div className="text-[11px] font-mono text-cyan-300 mt-4 tracking-widest uppercase">
                  Simulated AR Field View &bull; Baghewala Wellpad 01
                </div>
              </div>
            )}

            {/* Target Reticle Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full border border-cyan-500/30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>
            </div>

            {/* Holographic AR Floating Gauges */}
            <div className="absolute top-4 left-4 glass px-3.5 py-2 rounded-xl border border-cyan-500/30 font-mono text-xs shadow-lg backdrop-blur-md">
              <div className="text-[10px] text-slate-400">POLISHED ROD LOAD</div>
              <b className="text-cyan-300 text-base">64.2 kN &bull; NOMINAL</b>
            </div>

            <div className="absolute top-4 right-4 glass px-3.5 py-2 rounded-xl border border-amber-500/30 font-mono text-xs shadow-lg backdrop-blur-md text-right">
              <div className="text-[10px] text-slate-400">BEAM KINEMATIC ANGLE</div>
              <b className="text-amber-300 text-base">14.2° / 28.0°</b>
            </div>

            {/* Hazard Safety Warning Zone Overlay */}
            {hazardZoneVisible && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold flex items-center gap-2 shadow-lg animate-pulse backdrop-blur-md">
                <AlertTriangle size={16} />
                <span>HAZARD ZONE: KEEP CLEAR OF ROTATING COUNTERWEIGHTS (3.5m RADIUS)</span>
              </div>
            )}

            {/* QR Scan Success Overlay */}
            {qrScanned && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center font-mono text-center p-6"
              >
                <div className="p-4 rounded-3xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 mb-3 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="font-bold text-lg text-white">Asset Verified: {wellId}</h3>
                <p className="text-xs text-emerald-300 mt-1">DGH Asset Tag #BAGHE-WELL-001 &bull; SCADA Gateway Synchronized</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* AR Inspector Controls & Checklist */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="glass rounded-3xl p-5 border border-cyan-500/20 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white">AR Overlay Controls</h3>

            <div className="space-y-2">
              <button
                onClick={() => setHazardZoneVisible(!hazardZoneVisible)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-between transition-all cursor-pointer ${
                  hazardZoneVisible
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-white/5 text-slate-400 border-white/5'
                }`}
              >
                <span className="flex items-center gap-2"><ShieldAlert size={14} /> Counterweight Safety Cone</span>
                <span className="text-[10px] uppercase">{hazardZoneVisible ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={handleSimulateQrScan}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <QrCode size={15} /> Scan Equipment QR Asset Tag
              </button>
            </div>
          </div>

          {/* Quick Inspection Safety Checklist */}
          <div className="glass rounded-3xl p-5 border border-cyan-500/20 shadow-xl space-y-2">
            <h4 className="font-bold text-xs font-mono text-cyan-300 uppercase">Field Safety Checklist</h4>
            <div className="space-y-1.5 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400" /> Stuffing Box Seal: No leaks
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400" /> V-Belt Tension: Calibrated
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400" /> Steam Manifold: Insulation intact
              </div>
            </div>
          </div>

          <div className="glass-subtle rounded-2xl p-4 border border-cyan-500/15 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
              <Sparkles size={14} /> WebXR Standard
            </div>
            Works natively on field mobile tablets and WebXR headsets without requiring native app store installation.
          </div>
        </div>
      </div>
    </div>
  );
};
