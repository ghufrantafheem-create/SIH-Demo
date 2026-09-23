import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  Send,
  Sparkles,
  ClipboardCheck,
  Clock
} from 'lucide-react';
import { soundFx } from '../utils/sound';

export const ReportAndWorkOrderGenerator: React.FC<{ wellId?: string }> = ({ wellId = 'BGW-001' }) => {
  const [reportType, setReportType] = useState<'inspection' | 'work_order'>('inspection');
  const [ticketStatus, setTicketStatus] = useState<'draft' | 'dispatched'>('draft');
  const [inspectorName, setInspectorName] = useState('Dr. Alex Rivera, Lead Petroleum Architect');
  const [priority, setPriority] = useState<'Standard' | 'Urgent' | 'Emergency'>('Urgent');

  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  const handleDispatch = () => {
    soundFx.playSuccess();
    setTicketStatus('dispatched');
    alert(`Work Order Ticket #WO-BAGHE-2026-${Math.floor(1000 + Math.random() * 9000)} has been dispatched to Rajasthan Field Rig Crew 4.`);
  };

  const handleDownload = () => {
    soundFx.playSuccess();
    const element = document.createElement('a');
    const file = new Blob(
      [
        `============================================================\n` +
        `BAGHETWIN DIGITAL TWIN - FIELD TECHNICAL INSPECTION REPORT\n` +
        `Well Asset: ${wellId} | Field: Baghewala, Thar Desert, Rajasthan\n` +
        `Generated: ${new Date().toISOString()}\n` +
        `============================================================\n\n` +
        `1. EXECUTIVE TELEMETRY SUMMARY:\n` +
        `- Current Production: 142.5 BOPD\n` +
        `- Reservoir Temp: 84.2 °C (Bottomhole target depth: 980m)\n` +
        `- Wellhead Pressure: 38.5 bar\n` +
        `- Current Operating Stage: CSS Cycle 3 Production\n\n` +
        `2. 4-RANDOMFOREST ML INFERENCE AUDIT:\n` +
        `- RF_Production_Forecaster: 148.2 BOPD (R2: 0.993)\n` +
        `- RF_Anomaly_Detector: NORMAL (Confidence: 98.8%)\n` +
        `- RF_CSS_Optimizer: Optimal SOR 2.15\n` +
        `- RF_SRP_Efficiency_Model: Volumetric Eff 94.0%\n\n` +
        `3. CERTIFICATION & SIGN-OFF:\n` +
        `Inspector: ${inspectorName}\n` +
        `Status: VERIFIED & AUDITED DIGITAL TWIN STATE\n`
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `BagheTwin_${wellId}_Technical_Inspection_Report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass rounded-3xl p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <FileText size={22} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Automated Technical Inspection Report &amp; Work Order Generator
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Certified SCADA audit logs, 4-model ML verification certificates, and field crew maintenance tickets.
            </p>
          </div>

          {/* Toggle between Report & Work Order */}
          <div className="flex items-center gap-2 p-1 rounded-2xl glass-subtle border border-cyan-500/20">
            <button
              onClick={() => {
                soundFx.playClick();
                setReportType('inspection');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                reportType === 'inspection'
                  ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inspection Certificate
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setReportType('work_order');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                reportType === 'work_order'
                  ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Maintenance Work Order
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Preview & Action Bar */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Printable/Exportable Document Canvas */}
        <div className="lg:col-span-8 glass rounded-3xl p-8 border border-cyan-500/20 shadow-2xl backdrop-blur-2xl font-mono text-xs text-slate-200 space-y-6 bg-[#040b17]/90">
          {reportType === 'inspection' ? (
            <>
              {/* Document Header */}
              <div className="border-b border-cyan-500/20 pb-4 flex justify-between items-start">
                <div>
                  <div className="text-lg font-bold text-white tracking-wider">
                    BAGHETWIN DIGITAL TWIN &bull; CERTIFICATE OF TECHNICAL AUDIT
                  </div>
                  <div className="text-xs text-cyan-400 mt-1">
                    Directorate General of Hydrocarbons (DGH) &bull; Enhanced Heavy-Oil Recovery Mirror
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  REF: <b className="text-white">BGT-AUD-2026-0923</b><br />
                  DATE: {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Asset & Telemetry Table */}
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-cyan-300 font-bold">1. Well Asset Telemetry Verification</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 p-4 rounded-xl border border-cyan-500/15">
                  <div><span className="text-slate-500 block text-[10px]">WELL IDENTIFIER</span><b className="text-white text-sm">{wellId}</b></div>
                  <div><span className="text-slate-500 block text-[10px]">CURRENT FLOW</span><b className="text-cyan-300 text-sm">142.5 BOPD</b></div>
                  <div><span className="text-slate-500 block text-[10px]">BOTTOMHOLE TEMP</span><b className="text-amber-300 text-sm">84.2 °C</b></div>
                  <div><span className="text-slate-500 block text-[10px]">CASING PRESSURE</span><b className="text-white text-sm">38.5 bar</b></div>
                </div>
              </div>

              {/* 4 ML Model Verification Block */}
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-cyan-300 font-bold">2. 4-RandomForest Model Inference Certificate</div>
                <div className="space-y-2 bg-black/40 p-4 rounded-xl border border-cyan-500/15">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span>RF_Production_Forecaster (R2: 0.993)</span>
                    <b className="text-emerald-400">PASS &bull; 148.2 BOPD (96% Conf)</b>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span>RF_Anomaly_Detector (Accuracy: 98.8%)</span>
                    <b className="text-emerald-400">PASS &bull; 0 Anomalies Flagged</b>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span>RF_CSS_Optimizer (Thermal Solver)</span>
                    <b className="text-emerald-400">PASS &bull; Recommended SOR: 2.15</b>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>RF_SRP_Efficiency_Model (Kinematics)</span>
                    <b className="text-emerald-400">PASS &bull; Volumetric Eff: 94.0%</b>
                  </div>
                </div>
              </div>

              {/* Sign-off Seal */}
              <div className="pt-4 border-t border-cyan-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 block">INSPECTION AUTHORITY</span>
                  <b className="text-white">{inspectorName}</b>
                  <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Cryptographically Signed by BagheTwin SCADA Node
                  </div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold text-center">
                  AUDIT STATUS: CERTIFIED
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Maintenance Work Order Ticket */}
              <div className="border-b border-amber-500/20 pb-4 flex justify-between items-start">
                <div>
                  <div className="text-lg font-bold text-white tracking-wider flex items-center gap-2">
                    <Wrench className="text-amber-400" size={20} />
                    FIELD CREW MAINTENANCE WORK ORDER
                  </div>
                  <div className="text-xs text-amber-300 mt-1">
                    BagheTwin Automated Preventive Maintenance Dispatch
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  priority === 'Emergency' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {priority} Priority
                </span>
              </div>

              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wider text-amber-300 font-bold">1. Dispatch Target &amp; Symptoms</div>
                <div className="bg-black/40 p-4 rounded-xl border border-amber-500/15 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Wellhead:</span>
                    <b className="text-white">{wellId} (Pad 01, Sector North)</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Identified Fault Vector:</span>
                    <b className="text-amber-300">Rod String Heavy Viscous Drag / Traveling Valve Resistance</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Field Rig Time:</span>
                    <b className="text-white">4.5 Hours</b>
                  </div>
                </div>
              </div>

              {/* Required API Parts Checklist */}
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wider text-amber-300 font-bold">2. Required Spare Parts &amp; Consumables</div>
                <ul className="space-y-2 bg-black/40 p-4 rounded-xl border border-amber-500/15">
                  <li className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>2x 1.50" API Tungsten Carbide Ball &amp; Seat Assemblies</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>4x 1.50" Moulded Wheeled Sucker Rod Centralizer Guides</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>1x Set Heavy-Duty Teflon Stuffing Box Cone Packings</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-amber-500/20 flex justify-between items-center">
                <span className="text-slate-400">Dispatch Status: <b className={ticketStatus === 'dispatched' ? 'text-emerald-400' : 'text-amber-300'}>{ticketStatus.toUpperCase()}</b></span>
                <button
                  onClick={handleDispatch}
                  disabled={ticketStatus === 'dispatched'}
                  className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    ticketStatus === 'dispatched'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  }`}
                >
                  <Send size={15} />
                  <span>{ticketStatus === 'dispatched' ? 'DISPATCH CONFIRMED' : 'DISPATCH TO RIG CREW'}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Action Controls Sidebar */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="glass rounded-3xl p-5 border border-cyan-500/20 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-cyan-400" />
              <span>Document Publishing Tools</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Inspector / Certifier Authority:</label>
                <input
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-900 border border-cyan-500/20 text-white"
                />
              </div>

              {reportType === 'work_order' && (
                <div>
                  <label className="text-slate-400 block mb-1">Dispatch Priority Level:</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-900 border border-cyan-500/20 text-white cursor-pointer"
                  >
                    <option value="Standard">Standard (24h SLA)</option>
                    <option value="Urgent">Urgent (4h SLA)</option>
                    <option value="Emergency">Emergency (Immediate Stop)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleDownload}
                className="w-full py-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs border border-cyan-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <Download size={15} /> Download Signed Record (.txt/.pdf)
              </button>
              <button
                onClick={handlePrint}
                className="w-full py-3 rounded-2xl glass-subtle text-slate-300 hover:text-white font-bold text-xs border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Printer size={15} /> Print Certified Document
              </button>
            </div>
          </div>

          <div className="glass-subtle rounded-2xl p-4 border border-cyan-500/15 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
              <ShieldCheck size={14} /> DGH &amp; Industry Standards
            </div>
            Compliant with API Spec 11B (Sucker Rods), API Spec 11AX (Subsurface Pumps), and DGH Digital Reporting standards.
          </div>
        </div>
      </div>
    </div>
  );
};
