import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Radio,
  Activity,
  Layers,
  Sparkles,
  Wifi,
  WifiOff,
  Terminal,
  Sliders,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface PacketLog {
  id: string;
  time: string;
  protocol: 'MODBUS' | 'MQTT' | 'OPC-UA';
  topicOrReg: string;
  payload: string;
}

export const EdgeIoTGateway: React.FC<{ wellId?: string }> = ({ wellId = 'BGW-001' }) => {
  const [activeProtocol, setActiveProtocol] = useState<'MODBUS' | 'MQTT' | 'OPC-UA'>('MODBUS');
  const [noiseLevelPct, setNoiseLevelPct] = useState<number>(2.0);
  const [packetRateHz, setPacketRateHz] = useState<number>(5);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [packets, setPackets] = useState<PacketLog[]>([]);

  // Simulate live industrial streaming packets
  useEffect(() => {
    if (!isConnected) return;

    const intervalTime = Math.max(150, 1000 / packetRateHz);
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString() + '.' + String(now.getMilliseconds()).padStart(3, '0');

      let newLog: PacketLog;
      const noise = (Math.random() - 0.5) * noiseLevelPct * 0.1;

      if (activeProtocol === 'MODBUS') {
        const reg = 40001 + Math.floor(Math.random() * 6);
        const val = reg === 40001 ? (64.2 + noise).toFixed(2) : (84.2 + noise).toFixed(2);
        newLog = {
          id: `p-${Date.now()}`,
          time: timeStr,
          protocol: 'MODBUS',
          topicOrReg: `REG_${reg}`,
          payload: `FC03 [READ_HOLDING] Value: ${val}`
        };
      } else if (activeProtocol === 'MQTT') {
        newLog = {
          id: `p-${Date.now()}`,
          time: timeStr,
          protocol: 'MQTT',
          topicOrReg: `baghetwin/${wellId}/telemetry`,
          payload: `{"spm": ${(8.5 + noise).toFixed(1)}, "bopd": ${(142.5 + noise).toFixed(1)}}`
        };
      } else {
        newLog = {
          id: `p-${Date.now()}`,
          time: timeStr,
          protocol: 'OPC-UA',
          topicOrReg: `ns=2;s=BagheTwin.Wellbore.${wellId}.Pressure`,
          payload: `StatusCode: Good (0x00) | Value: ${(38.5 + noise).toFixed(2)} bar`
        };
      }

      setPackets((prev) => [newLog, ...prev.slice(0, 14)]);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isConnected, activeProtocol, packetRateHz, noiseLevelPct, wellId]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <Cpu size={22} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Industrial Edge IoT Gateway &amp; SCADA Stream Simulator
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Live Ingestion &bull; Modbus TCP/RTU &bull; MQTT Pub/Sub &bull; OPC-UA Node Trees for well <b className="text-cyan-300">{wellId}</b>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setIsConnected(!isConnected);
              }}
              className={`px-4 py-2 rounded-2xl border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
              }`}
            >
              {isConnected ? <Wifi size={15} /> : <WifiOff size={15} />}
              <span>{isConnected ? 'GATEWAY STREAMING' : 'OFFLINE'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Terminal Packet Stream Log */}
        <div className="lg:col-span-8 glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="text-cyan-400" size={18} />
                <h3 className="font-bold text-base text-white">Live RTU / SCADA Packet Inspector</h3>
              </div>

              {/* Protocol Toggle */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl glass-subtle border border-cyan-500/20 text-xs font-mono">
                {(['MODBUS', 'MQTT', 'OPC-UA'] as const).map((proto) => (
                  <button
                    key={proto}
                    onClick={() => {
                      soundFx.playClick();
                      setActiveProtocol(proto);
                    }}
                    className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      activeProtocol === proto
                        ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-400/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {proto}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Window */}
            <div className="bg-[#02050c] rounded-2xl p-4 border border-cyan-500/20 font-mono text-[11px] h-80 overflow-y-auto space-y-2 scrollbar shadow-inner">
              {packets.map((pkt) => (
                <div key={pkt.id} className="flex items-start gap-2 hover:bg-white/5 p-1 rounded transition-colors">
                  <span className="text-slate-500 shrink-0">{pkt.time}</span>
                  <span className="text-cyan-400 shrink-0 font-bold">[{pkt.protocol}]</span>
                  <span className="text-amber-300 shrink-0">{pkt.topicOrReg}</span>
                  <span className="text-slate-300 truncate">{pkt.payload}</span>
                </div>
              ))}
              {packets.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-500">
                  Gateway listening on port 502 (Modbus TCP) / 1883 (MQTT)...
                </div>
              )}
            </div>
          </div>

          {/* Noise Injection & Packet Frequency Sliders */}
          <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-4 border-t border-cyan-500/20 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-300 whitespace-nowrap">Noise &amp; Jitter:</span>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={noiseLevelPct}
                onChange={(e) => setNoiseLevelPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-cyan-300 font-bold min-w-[50px]">{noiseLevelPct}%</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-300 whitespace-nowrap">Sample Rate:</span>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={packetRateHz}
                onChange={(e) => setPacketRateHz(Number(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-amber-300 font-bold min-w-[50px]">{packetRateHz} Hz</span>
            </div>
          </div>
        </div>

        {/* Industrial Protocol Register Map & Health */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="glass rounded-3xl p-5 border border-cyan-500/20 shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-white">Active Modbus Register Mapping</h3>
            <div className="bg-black/40 p-4 rounded-xl border border-cyan-500/15 font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">40001 (Rod Load):</span>
                <b className="text-cyan-300">64.20 kN (FLOAT32)</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">40003 (SPM Speed):</span>
                <b className="text-amber-300">8.50 SPM</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">40005 (BHT Temp):</span>
                <b className="text-white">84.20 °C</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">40007 (Casing Press):</span>
                <b className="text-white">38.50 bar</b>
              </div>
            </div>
          </div>

          {/* Network Health KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Latency</span>
              <b className="text-xl font-mono text-emerald-300 mt-1 block">12 ms</b>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Packet Drop</span>
              <b className="text-xl font-mono text-cyan-300 mt-1 block">0.00%</b>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">MTU Buffer</span>
              <b className="text-xl font-mono text-white mt-1 block">1500 B</b>
            </div>
            <div className="glass rounded-2xl p-4 border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Security</span>
              <b className="text-xl font-mono text-emerald-400 mt-1 block">TLS 1.3</b>
            </div>
          </div>

          <div className="glass-subtle rounded-2xl p-4 border border-cyan-500/15 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
              <ShieldCheck size={14} /> Industrial SCADA Ready
            </div>
            Compatible with Emerson DeltaV, Honeywell Experion, and Rockwell FactoryTalk telemetry gateways.
          </div>
        </div>
      </div>
    </div>
  );
};
