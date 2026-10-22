import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Wrench,
  FileText,
  UserCheck,
  Hash,
  ArrowRight
} from 'lucide-react';

interface SimulationStep {
  stepNumber: number;
  phase: string;
  realityFailure: string;
  changelensResolution: string;
  status: 'HOLD' | 'IN_PROGRESS' | 'VERIFIED' | 'RELEASED';
  gateRule: string;
}

export const IncidentEscapeSimulator: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [torqueInput, setTorqueInput] = useState<number>(175);
  const [qaInspector, setQaInspector] = useState<string>('Dr. Elena Rostova (QA Lead)');
  const [hasTorqued, setHasTorqued] = useState<boolean>(false);
  const [hasStamped, setHasStamped] = useState<boolean>(false);

  const steps: SimulationStep[] = [
    {
      stepNumber: 1,
      phase: "Rivet Defect Arrival & Door Opening",
      realityFailure: "On Sept 18, 2023, the door plug was opened without a controlled work order or digital traveler. Specialized personnel removed 4 retaining bolts without a paper trail.",
      changelensResolution: "Digital Traveler Lock (AC-05): Physical door plug disassembly requires biometric work order check-in. System creates active order CCR-2026-0001 tied to tail N704AL.",
      status: "IN_PROGRESS",
      gateRule: "RULE-01: Serialized Physical Disassembly Lock"
    },
    {
      stepNumber: 2,
      phase: "Shift Handoff & Closure Trap",
      realityFailure: "Specialized door crew went off-shift. Unassigned mechanics closed the door plug without reinstalling the 4 vertical retaining bolts. Zero records existed to prompt an inspection.",
      changelensResolution: "Automated Impact Traversal (NetworkX BFS): Closing the plug automatically flags mandatory requirement REQ-C105-TORQUE. Progression past Fuselage Station 500 is HARD-LOCKED.",
      status: "HOLD",
      gateRule: "RULE-02: Deterministic Blast Radius Enforcement"
    },
    {
      stepNumber: 3,
      phase: "Calibrated Fastener Torque Verification",
      realityFailure: "No torque logs existed. The aircraft advanced to interior sidewall insulation and flight delivery with 4 bolts completely missing.",
      changelensResolution: "Evidence-Gated Quality Gate: Technicians must register digital torque wrench data (BAC-5001-4, 160-190 in-lbs) and photographic pin proof before Gate 3 can evaluate.",
      status: hasTorqued ? "VERIFIED" : "HOLD",
      gateRule: "RULE-03: No Evidence, No Progress (Gate 2/3)"
    },
    {
      stepNumber: 4,
      phase: "Independent Level II QA Stamp",
      realityFailure: "No QA inspector ever inspected the plug because Boeing's system never generated an inspection task for undocumented work.",
      changelensResolution: "Separation of Duties Enforcement: The mechanic who completed the rivet rework cannot sign off the door. An independent Level II QA Inspector must audit and apply cryptographic stamp.",
      status: hasStamped ? "VERIFIED" : "HOLD",
      gateRule: "RULE-04: Strict Separation of Duties (AC-05)"
    },
    {
      stepNumber: 5,
      phase: "Airworthiness Certification & Delivery",
      realityFailure: "Aircraft delivered to Alaska Airlines in Oct 2023. Blew out at 16,000 feet on Jan 5, 2024, causing worldwide groundings and billion-dollar fallout.",
      changelensResolution: "Tamper-Evident SHA-256 Release: All 4 quality gates satisfied. Automated regulatory dossier delivered to FAA. Zero escape risk — aircraft certified safe for commercial flight.",
      status: "RELEASED",
      gateRule: "RULE-05: Cryptographic Airworthiness Dossier"
    }
  ];

  const current = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setHasTorqued(false);
    setHasStamped(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 p-7 shadow-xs font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0071E3] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Interactive Escape Simulator
            </span>
            <span className="text-xs font-mono text-gray-400">Alaska Airlines Flight 1282 Benchmark</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mt-1 tracking-tight">
            How ChangeLens Prevents the Boeing 737-9 MAX Disaster
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Step through the 5 critical failure moments from the NTSB investigation and see how ChangeLens intercepts each escape in real time.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-medium border border-gray-200 transition shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Simulation
        </button>
      </div>

      {/* Progress Steps Timeline */}
      <div className="grid grid-cols-5 gap-2">
        {steps.map((s, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <button
              key={idx}
              onClick={() => setCurrentStepIndex(idx)}
              className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                isCurrent 
                  ? 'bg-blue-50/70 border-[#0071E3] shadow-xs' 
                  : isDone
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  : 'bg-gray-50/70 border-gray-200/80 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                <span>Phase {s.stepNumber}</span>
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse" />
                ) : null}
              </div>
              <div className="text-[11px] font-semibold text-gray-900 truncate mt-1">
                {s.phase.split(' ')[0]} {s.phase.split(' ')[1]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Comparison Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Reality (What Broke Down) */}
        <div className="p-6 rounded-3xl bg-red-50/60 border border-red-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              What Happened in Reality (2023 Boeing Renton Factory)
            </span>
            <span className="text-[10px] font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
              CATASTROPHIC ESCAPE
            </span>
          </div>

          <div className="text-xs text-red-950 leading-relaxed font-normal">
            {current.realityFailure}
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-red-200/80 text-xs text-red-800 space-y-1">
            <div className="font-bold">Root Deficiency:</div>
            <div className="text-[11px] leading-relaxed">
              Work was executed through unrecorded verbal communications between Spirit AeroSystems contractors and Boeing final assembly, leaving no trace in the manufacturing traveler system.
            </div>
          </div>
        </div>

        {/* ChangeLens Solution (What It Enforces) */}
        <div className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                How ChangeLens Intercepts &amp; Enforces Resolution
              </span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                SYSTEM SAFEGUARD
              </span>
            </div>

            <div className="text-xs text-emerald-950 leading-relaxed font-normal">
              {current.changelensResolution}
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200/80 text-xs text-emerald-800 space-y-1">
              <div className="font-bold">Active System Gate Rule:</div>
              <div className="text-[11px] font-mono text-emerald-700">{current.gateRule}</div>
            </div>
          </div>

          {/* Interactive Actions for Specific Steps */}
          {currentStepIndex === 2 && (
            <div className="p-4 rounded-2xl bg-white border border-blue-200 space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-800">Calibrated Torque Wrench BAC-5001-4:</span>
                <span className="font-mono font-bold text-[#0071E3]">{torqueInput} in-lbs</span>
              </div>
              <input
                type="range"
                min={140}
                max={210}
                value={torqueInput}
                onChange={(e) => {
                  setTorqueInput(Number(e.target.value));
                  if (Number(e.target.value) >= 160 && Number(e.target.value) <= 190) {
                    setHasTorqued(true);
                  }
                }}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>140 in-lbs (Under)</span>
                <span className="text-emerald-600 font-semibold">160-190 in-lbs (Pass)</span>
                <span>210 in-lbs (Over)</span>
              </div>
              <button
                onClick={() => setHasTorqued(true)}
                className={`w-full py-1.5 rounded-xl text-xs font-semibold transition ${
                  hasTorqued 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-[#0071E3] hover:bg-[#0077ED] text-white'
                }`}
              >
                {hasTorqued ? '✓ Torque Log Hash Verified (SHA-256)' : 'Submit Calibrated Torque Proof'}
              </button>
            </div>
          )}

          {currentStepIndex === 3 && (
            <div className="p-4 rounded-2xl bg-white border border-blue-200 space-y-2.5 mt-2">
              <div className="text-xs font-semibold text-gray-800">
                Independent QA Stamp (Separation of Duties):
              </div>
              <div className="text-[11px] text-gray-600">
                Logged in as: <span className="font-semibold text-gray-900">{qaInspector}</span>
              </div>
              <button
                onClick={() => setHasStamped(true)}
                className={`w-full py-2 rounded-xl text-xs font-semibold transition ${
                  hasStamped 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-[#0071E3] hover:bg-[#0077ED] text-white'
                }`}
              >
                {hasStamped ? '✓ Level II QA Stamp Applied (ID: QA-STAMP-737-99)' : 'Apply Independent QA Stamp'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs font-mono text-gray-400">
          Step {currentStepIndex + 1} of {steps.length} · ChangeLens Escape Interceptor
        </div>

        <div className="flex items-center gap-2">
          {currentStepIndex > 0 && (
            <button
              onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
              className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition shadow-2xs"
            >
              Previous Phase
            </button>
          )}

          {currentStepIndex < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition shadow-sm"
            >
              Advance Phase <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-sm"
            >
              Simulation Complete · Restart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
