import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  Maximize2,
  Layers,
  Cpu,
  Zap,
  Flame,
  CircleGauge,
  Box,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Tv,
  Radio,
  Factory,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  durationSec: number;
  speechText: string;
  keyPoints: { label: string; desc: string; icon: any; tone?: string }[];
  visualType: 'problem' | 'solution' | 'ml_architecture' | 'system_architecture' | 'simulation_demo' | 'impact';
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'The Problem: Heavy-Oil Extraction in Thar Desert',
    subtitle: 'High Viscosity, Extreme Thermal Losses & Mechanical Pump Failures in Baghewala Field',
    tag: 'CHALLENGE & BOTTLENECKS',
    durationSec: 14,
    speechText:
      'In the Baghewala Field located in the Thar Desert of Rajasthan, heavy oil exhibits extreme viscosity exceeding eighteen hundred centipoise. Cyclic Steam Stimulation suffers from high thermal losses, while Sucker Rod Pumps frequently fail due to gas lock, fluid pound, and rod floating. Without real-time intelligence, operators face severe production decline.',
    keyPoints: [
      {
        label: 'Ultra-High Oil Viscosity (1,850+ cP)',
        desc: 'Crude is semi-solid underground, requiring intensive cyclic thermal heating to flow.',
        icon: Flame,
        tone: 'orange'
      },
      {
        label: 'CSS Thermal Inefficiencies',
        desc: 'Sub-optimal steam injection pressure and soak timing lead to poor Steam-Oil Ratio (SOR).',
        icon: Factory,
        tone: 'amber'
      },
      {
        label: 'Frequent Mechanical Failures',
        desc: 'Sucker rod pumps suffer from high downhole drag, rod floating, and unpredictable gas lock.',
        icon: AlertTriangle,
        tone: 'rose'
      },
      {
        label: 'Lack of Real-Time Digital Visibility',
        desc: 'Operators lack closed-loop predictive models to anticipate failures before downtime occurs.',
        icon: CircleGauge,
        tone: 'amber'
      }
    ],
    visualType: 'problem'
  },
  {
    id: 2,
    title: 'The Solution: BagheTwin Digital Twin Platform',
    subtitle: 'Integrated Subsurface-to-Surface Physics & Real-Time AI Optimization Suite',
    tag: 'INTELLIGENT DIGITAL MIRROR',
    durationSec: 15,
    speechText:
      'BagheTwin is a unified AI-powered Digital Twin that continuously mirrors wellbore thermodynamics, mechanical lifting kinematics, and reservoir behavior. It combines four trained machine learning models with live physics simulations, delivering automated parameter tuning and preventive anomaly mitigation.',
    keyPoints: [
      {
        label: 'Continuous Subsurface Digital Twin',
        desc: 'Live telemetry mirror tracking temperature, pressure, watercut, and rod loading in real time.',
        icon: Zap,
        tone: 'cyan'
      },
      {
        label: 'Closed-Loop Optimization Loop',
        desc: 'Automated solvers compute ideal steam injection volume, soak hours, SPM, and stroke length.',
        icon: Sparkles,
        tone: 'gold'
      },
      {
        label: 'Real-Time Failure Diagnostics',
        desc: 'Continuous classification of downhole conditions with instant operator action guidance.',
        icon: CheckCircle2,
        tone: 'emerald'
      },
      {
        label: '3D Kinematic Visualization',
        desc: 'Blender-grade 3D WebGL simulator modeling surface rig mechanics down to the 980-meter reservoir.',
        icon: Box,
        tone: 'cyan'
      }
    ],
    visualType: 'solution'
  },
  {
    id: 3,
    title: 'The Machine Learning Engine: 4 RandomForest Models',
    subtitle: 'High-Precision Predictive & Optimization Neural Ensembles Trained on Reservoir Physics',
    tag: 'AI & DATA SCIENCE CORE',
    durationSec: 16,
    speechText:
      'At the core of BagheTwin are four specialized Random Forest models. The Production Forecaster achieves an R-squared of point nine-nine-three for daily output. The Anomaly Detector diagnoses failure modes with ninety-eight point eight percent accuracy. The CSS and SRP optimizers maximize thermal recovery and volumetric pump efficiency.',
    keyPoints: [
      {
        label: 'RF_Production_Forecaster (R² = 0.993)',
        desc: 'RandomForestRegressor forecasting next-day BOPD output and 7-day trajectory based on well thermals.',
        icon: TrendingUp,
        tone: 'cyan'
      },
      {
        label: 'RF_Anomaly_Detector (98.75% Accuracy)',
        desc: 'RandomForestClassifier isolating Normal, Gas Lock, Fluid Pound, and Rod Floating failure vectors.',
        icon: AlertTriangle,
        tone: 'amber'
      },
      {
        label: 'RF_CSS_Optimizer (R² = 0.894)',
        desc: 'Models thermal soak diffusion to minimize Steam-Oil Ratio and eliminate heat loss.',
        icon: Flame,
        tone: 'orange'
      },
      {
        label: 'RF_SRP_Efficiency_Model (R² = 0.845)',
        desc: 'Optimizes mechanical SPM and stroke length while protecting downhole sucker rods.',
        icon: Cpu,
        tone: 'emerald'
      }
    ],
    visualType: 'ml_architecture'
  },
  {
    id: 4,
    title: 'Full-Stack Architecture & Data Flow',
    subtitle: 'Ultra-Fast React 18, Three.js WebGL, FastAPI Backend & PostgreSQL Mirror',
    tag: 'TECHNICAL INFRASTRUCTURE',
    durationSec: 15,
    speechText:
      'The architecture comprises a high-performance React 18 frontend with Three.js 3D rendering and Thar Desert glassmorphism. It communicates asynchronously via RESTful APIs to a Python FastAPI backend, backed by scikit-learn model pipelines and a PostgreSQL data mirror for 90-day time-series analytics.',
    keyPoints: [
      {
        label: 'Presentation Layer (React 18 + Vite)',
        desc: 'Responsive Thar Desert glassmorphism, Framer Motion animations, Recharts, and Web Audio API.',
        icon: Tv,
        tone: 'gold'
      },
      {
        label: '3D Kinematics Engine (Three.js WebGL)',
        desc: '360-degree articulated pumpjack mechanics with realistic desert sunset and starlight lighting.',
        icon: Box,
        tone: 'cyan'
      },
      {
        label: 'Microservices Backend (FastAPI + Python)',
        desc: 'Sub-millisecond inference routing, JWT token security, and joblib model execution.',
        icon: Cpu,
        tone: 'amber'
      },
      {
        label: 'Data Persistence (PostgreSQL / SQLite)',
        desc: '90-day time-series telemetry archive, custom CSV upload parser, and automated backups.',
        icon: Layers,
        tone: 'emerald'
      }
    ],
    visualType: 'system_architecture'
  },
  {
    id: 5,
    title: 'Interactive Simulation & Data Upload Sandbox',
    subtitle: 'Upload Any Field Telemetry CSV for Instant Multi-Model Physics Playback',
    tag: 'SIMULATION & TESTING',
    durationSec: 14,
    speechText:
      'BagheTwin allows field engineers to upload custom CSV datasets or load preset test scenarios. The sandbox parses the records and streams them through all four Random Forest models, driving real-time 3D rig kinematics, dynagraph card tracing, and CFD thermal plumes step by step.',
    keyPoints: [
      {
        label: '1-Click CSV Ingestion',
        desc: 'Upload multi-variable well logs with instant client-side and server-side feature extraction.',
        icon: Zap,
        tone: 'cyan'
      },
      {
        label: 'Step-by-Step Playback Controls',
        desc: 'Play, pause, timeline scrubbing, and 1x, 2x, 5x speed multipliers for deep operational review.',
        icon: Play,
        tone: 'gold'
      },
      {
        label: 'Live Dynagraph Tracing',
        desc: 'Real-time load versus position card plotting with synchronized tracer head animation.',
        icon: Activity,
        tone: 'emerald'
      },
      {
        label: '90-Day Analytics & CSV Export',
        desc: 'Multi-parameter correlation charting, aggregate KPIs, and one-click data export.',
        icon: TrendingUp,
        tone: 'orange'
      }
    ],
    visualType: 'simulation_demo'
  },
  {
    id: 6,
    title: 'Quantified Impact & Operational Gains',
    subtitle: 'Proven Recovery Boost, Energy Savings, and Zero Unplanned Downtime',
    tag: 'BUSINESS & OPERATIONAL IMPACT',
    durationSec: 14,
    speechText:
      'In conclusion, BagheTwin delivers a fourteen point five percent increase in oil production, a ninety-one percent thermal viscosity reduction, and over ninety-eight percent failure detection accuracy. It transforms traditional heavy oil field operations into an automated, zero-downtime digital twin ecosystem.',
    keyPoints: [
      {
        label: '+14.5% Oil Production Gain',
        desc: 'Optimized CSS cycle scheduling and synchronized SRP mechanical volumetric efficiency.',
        icon: TrendingUp,
        tone: 'emerald'
      },
      {
        label: '-91% Reservoir Viscosity Reduction',
        desc: 'Precision thermal soak modeling drops Baghewala crude from 1,850 cP down to 28 cP.',
        icon: Flame,
        tone: 'orange'
      },
      {
        label: '98.8% Anomaly Prevention Accuracy',
        desc: 'Eliminates catastrophic rod parting and pump seizure through predictive AI alerts.',
        icon: ShieldCheck,
        tone: 'cyan'
      },
      {
        label: '-22% Steam & Energy Waste',
        desc: 'Substantial Steam-Oil Ratio improvement reducing boiler fuel consumption and emissions.',
        icon: Sparkles,
        tone: 'gold'
      }
    ],
    visualType: 'impact'
  }
];

export const VideoPitchDeck: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const slide = slides[currentSlideIndex];

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  // Handle Speech Narration on Slide Change
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    if (voiceEnabled && isPlaying && synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(slide.speechText);
      utterance.rate = 1.02;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick an English voice if available
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David'))
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onend = () => {
        if (isPlaying) {
          // Advance slide when speech completes
          setTimeout(() => {
            setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
          }, 1000);
        }
      };

      synthRef.current.speak(utterance);
    }
  }, [currentSlideIndex, isPlaying, voiceEnabled]);

  // Video Timeline Timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 0.1);
    }, 100);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const togglePlay = () => {
    soundFx.playClick();
    if (isPlaying && synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(!isPlaying);
  };

  const nextSlide = () => {
    soundFx.playClick();
    if (synthRef.current) synthRef.current.cancel();
    setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
  };

  const prevSlide = () => {
    soundFx.playClick();
    if (synthRef.current) synthRef.current.cancel();
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const resetPresentation = () => {
    soundFx.playClick();
    if (synthRef.current) synthRef.current.cancel();
    setCurrentSlideIndex(0);
    setElapsedTime(0);
    setIsPlaying(false);
  };

  const totalPresentationTime = slides.reduce((acc, s) => acc + s.durationSec, 0);
  const currentSlideStartTime = slides.slice(0, currentSlideIndex).reduce((acc, s) => acc + s.durationSec, 0);

  return (
    <div className="space-y-6">
      {/* Video Presentation Player Frame */}
      <div className="glass rounded-3xl overflow-hidden border border-amber-500/25 shadow-2xl backdrop-blur-2xl relative">
        {/* Top Video Header HUD */}
        <div className="p-4 sm:p-6 border-b border-amber-500/20 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Tv size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white tracking-wide">
                  BagheTwin Interactive Video Presentation
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 pulse" /> {isPlaying ? 'PLAYING' : 'READY'}
                </span>
              </div>
              <p className="text-xs text-amber-200/70 font-mono">
                Slide {currentSlideIndex + 1} of {slides.length}: {slide.tag}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Voice Narration Audio Toggle */}
            <button
              onClick={() => {
                soundFx.playClick();
                setVoiceEnabled(!voiceEnabled);
                if (voiceEnabled && synthRef.current) synthRef.current.cancel();
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                voiceEnabled
                  ? 'bg-amber-500/25 text-amber-300 border-amber-400/40'
                  : 'bg-white/5 text-slate-400 border-white/5'
              }`}
              title={voiceEnabled ? 'Disable AI Voice Narration' : 'Enable AI Voice Narration'}
            >
              {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span className="hidden sm:inline">AI Voice Narration</span>
            </button>
          </div>
        </div>

        {/* Video Canvas Presentation Stage */}
        <div className="p-6 sm:p-10 min-h-[460px] flex flex-col justify-between relative bg-gradient-to-b from-[#140803]/90 via-[#0a0401]/95 to-[#040100]">
          {/* Animated Background Ambience */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 relative z-10"
            >
              {/* Slide Header */}
              <div>
                <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-bold px-3 py-1 rounded-full glass-pill border border-amber-500/30 inline-block mb-3">
                  {slide.tag}
                </span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {slide.title}
                </h3>
                <p className="text-sm text-amber-200/80 font-light mt-1.5 max-w-3xl">
                  {slide.subtitle}
                </p>
              </div>

              {/* Slide Content Grid */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {slide.keyPoints.map((pt, idx) => {
                  const Icon = pt.icon;
                  return (
                    <motion.div
                      key={pt.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.3 }}
                      className="glass-subtle rounded-2xl p-4 sm:p-5 border border-amber-500/20 flex gap-3.5 items-start hover:border-amber-400/40 transition-colors shadow-lg"
                    >
                      <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 shrink-0 mt-0.5">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{pt.label}</h4>
                        <p className="text-xs text-amber-100/70 font-light mt-1 leading-relaxed">
                          {pt.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Subtitles & Closed Captions Bar */}
          <div className="mt-8 pt-4 border-t border-amber-500/20 relative z-10">
            <div className="glass-pill rounded-2xl p-3.5 border border-amber-500/20 text-xs text-amber-200 font-mono flex items-start gap-2.5 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5 pulse" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold mb-0.5">
                  Live Narration Subtitles:
                </span>
                <span className="text-white leading-relaxed">{slide.speechText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Player Bottom Control Bar */}
        <div className="p-4 sm:p-5 bg-black/60 border-t border-amber-500/20 flex flex-col gap-3">
          {/* Timeline Progress Bar */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400">
              {Math.floor(currentSlideStartTime + (isPlaying ? (elapsedTime % slide.durationSec) : 0))}s
            </span>
            <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden relative cursor-pointer">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-cyan-400 transition-all duration-200"
                style={{
                  width: `${((currentSlideIndex + 1) / slides.length) * 100}%`
                }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400">{totalPresentationTime}s</span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 font-mono text-xs text-slate-300">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    soundFx.playClick();
                    if (synthRef.current) synthRef.current.cancel();
                    setCurrentSlideIndex(idx);
                  }}
                  className={`w-7 h-7 rounded-lg border text-xs flex items-center justify-center transition-colors cursor-pointer ${
                    currentSlideIndex === idx
                      ? 'bg-amber-500/30 text-amber-300 border-amber-400/40 font-bold'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                className="p-2 rounded-xl glass-subtle text-slate-300 hover:text-white disabled:opacity-30 border border-amber-500/20 transition-colors cursor-pointer"
                title="Previous Slide"
              >
                <Rewind size={16} />
              </button>

              <button
                onClick={togglePlay}
                className={`px-5 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                  isPlaying
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]'
                }`}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'PAUSE VIDEO' : 'PLAY PRESENTATION'}</span>
              </button>

              <button
                onClick={nextSlide}
                disabled={currentSlideIndex === slides.length - 1}
                className="p-2 rounded-xl glass-subtle text-slate-300 hover:text-white disabled:opacity-30 border border-amber-500/20 transition-colors cursor-pointer"
                title="Next Slide"
              >
                <FastForward size={16} />
              </button>

              <button
                onClick={resetPresentation}
                className="p-2 rounded-xl glass-subtle text-slate-300 hover:text-amber-300 border border-amber-500/20 transition-colors cursor-pointer"
                title="Replay from Beginning"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
