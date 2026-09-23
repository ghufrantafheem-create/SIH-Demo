import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  User,
  Zap,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  action?: string;
  actionTarget?: string;
  timestamp: string;
}

export const PetroTwinCopilot: React.FC<{ onNavigate?: (page: any) => void }> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: 'Greetings Engineer! I am PetroTwin Copilot, your AI heavy-oil reservoir & digital twin assistant for Baghewala Field. How can I assist your CSS cycles or SRP diagnostics today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const speak = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#$`]/g, '');
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.rate = 1.05;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
  };

  const promptSuggestions = [
    'How do I mitigate rod floating in heavy crude?',
    'What is the optimal CSS steam soak duration?',
    'Explain the 4 RandomForest models in BagheTwin',
    'What causes fluid pound in sucker rod pumps?'
  ];

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;
    soundFx.playClick();

    const newMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      let actionLabel: string | undefined;
      let actionDest: string | undefined;

      const lower = userText.toLowerCase();

      if (lower.includes('rod floating') || lower.includes('floating')) {
        reply =
          'Rod floating occurs when the downward plunger velocity exceeds the viscous terminal settling velocity in heavy crude (300–2000 cP). Mitigation options: 1) Reduce SPM speed from 8.5 to 6.5; 2) Install heavy tungsten sinker bars directly above the pump; 3) Raise wellbore thermal soak to drop viscosity below 150 cP.';
        actionLabel = 'Inspect Dynacard Diagnostics';
        actionDest = 'Dynacard Analyzer';
      } else if (lower.includes('soak') || lower.includes('css') || lower.includes('steam')) {
        reply =
          'For Baghewala 980m depth sandstone, radial heat diffusion CFD models show optimal thermal soaking between 8 to 12 days. Beyond day 14, conductive rock heat losses to the overburden exceed viscosity recovery benefits, driving up the Steam-Oil Ratio (SOR).';
        actionLabel = 'Open Thermal CFD Heatmap';
        actionDest = 'Subsurface Heatmap';
      } else if (lower.includes('model') || lower.includes('randomforest') || lower.includes('ai')) {
        reply =
          'BagheTwin deploys 4 scikit-learn RandomForest models: 1) RF_Production_Forecaster (R2: 0.993 BOPD); 2) RF_Anomaly_Detector (98.8% accuracy for downhole pump failure modes); 3) RF_CSS_Optimizer (SOR minimization); 4) RF_SRP_Efficiency_Model (kinematic efficiency).';
        actionLabel = 'View 4-RF Predictions Hub';
        actionDest = 'Predictions';
      } else if (lower.includes('fluid pound') || lower.includes('dynacard')) {
        reply =
          'Fluid pound manifests on the downhole pump card as a sudden horizontal load cliff on the downstroke. It happens when the pump barrel only partially fills with fluid (underfilled chamber), causing the traveling valve to slap against liquid with high dynamic shock.';
        actionLabel = 'Launch Dynacard AI Analyzer';
        actionDest = 'Dynacard Analyzer';
      } else {
        reply =
          `Telemetry analysis for Baghewala reservoir indicates steady production at 142.5 BOPD. All 4 ML models report nominal performance. In-situ crude temperature is 84.2°C at 38.5 bar wellhead pressure.`;
        actionLabel = 'Check Field GIS Map';
        actionDest = 'Thar Desert GIS Map';
      }

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        action: actionLabel,
        actionTarget: actionDest,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
      soundFx.playSuccess();
      speak(reply);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <Bot size={22} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                PetroTwin AI Reservoir Engineering Copilot
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Natural Language Petroleum Physics Assistant &bull; Speech Synthesis &bull; SCADA Action Execution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const ns = !voiceEnabled;
                setVoiceEnabled(ns);
                if (!ns && 'speechSynthesis' in window) window.speechSynthesis.cancel();
              }}
              className="p-2.5 rounded-2xl glass-subtle text-cyan-200 hover:text-cyan-400 border border-cyan-500/20 cursor-pointer"
              title={voiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl flex flex-col h-[520px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`p-2 rounded-2xl shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-amber-500/20 border border-amber-400/30 text-amber-300'
                    : 'bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                }`}
              >
                {m.sender === 'user' ? <User size={18} /> : <Cpu size={18} />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs font-mono leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/15 border border-amber-500/20 text-slate-100'
                    : 'glass-subtle border border-cyan-500/20 text-slate-200'
                }`}
              >
                <div>{m.text}</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400">
                  <span>{m.sender === 'assistant' ? 'PetroTwin Physics Engine' : 'Field Operator'}</span>
                  <span>{m.timestamp}</span>
                </div>

                {m.action && onNavigate && (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onNavigate(m.actionTarget);
                    }}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-400/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>{m.action}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono p-3">
              <Sparkles size={14} className="animate-spin" />
              <span>PetroTwin evaluating reservoir equations...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="pt-3 border-t border-cyan-500/20 flex flex-wrap gap-2 mb-3">
          {promptSuggestions.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-mono px-3 py-1 rounded-xl glass-subtle text-slate-300 hover:text-cyan-300 border border-cyan-500/15 hover:border-cyan-400/30 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask PetroTwin Copilot about CSS thermal physics, SRP parameters, or ML models..."
            className="flex-1 p-3.5 rounded-2xl text-xs font-mono bg-slate-950/80 border border-cyan-500/25 text-white outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,229,255,0.35)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Send size={15} />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
