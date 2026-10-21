import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  ShieldAlert, 
  GitBranch, 
  Network, 
  FileCheck2, 
  CheckSquare, 
  FileSpreadsheet, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: "Welcome to ChangeLens 2026",
      tagline: "Every change. Every impact. Every decision justified.",
      icon: Sparkles,
      iconColor: "text-cyan-400 bg-cyan-950/80 border-cyan-800",
      targetTab: "overview" as NavTab,
      description: "ChangeLens is an explainable engineering change-impact and quality gate intelligence platform. Grounded in the Boeing 737-9 MAX door plug case study, it demonstrates how digital twin configuration graphs prevent catastrophic manufacturing disengagements.",
      keyMetrics: [
        { label: "Case Study Baseline", val: "Boeing 737-9 MAX" },
        { label: "Graph Algorithm", val: "NetworkX BFS Traversal" },
        { label: "Gate Standard", val: "AIAG/VDA FMEA" }
      ],
      actionText: "Explore Overview"
    },
    {
      title: "Step 1: The Manufacturing Baseline & Change Scope",
      tagline: "Tracking the Station 500 Door Plug Configuration",
      icon: GitBranch,
      iconColor: "text-blue-400 bg-blue-950/80 border-blue-800",
      targetTab: "changes" as NavTab,
      description: "In the Boeing 737-9 MAX incident, the mid-cabin exit door plug was opened during factory assembly to rework damaged seals. ChangeLens models CCR-2026-0001, tracking the change directly against baseline BASE-737-9-DOORPLUG-A with side-by-side specification diffing.",
      keyMetrics: [
        { label: "Active CCR", val: "CCR-2026-0001" },
        { label: "Baseline Version", val: "Rev A.1 Released" },
        { label: "Affected Scope", val: "C-105 & S-202" }
      ],
      actionText: "View Change Workspace"
    },
    {
      title: "Step 2: Dependency Graph & Impact Traversal",
      tagline: "Multi-Degree Blast Radius Identification",
      icon: Network,
      iconColor: "text-purple-400 bg-purple-950/80 border-purple-800",
      targetTab: "impact" as NavTab,
      description: "Standard PLM systems only track direct links. ChangeLens uses NetworkX BFS traversal with relationship-filtered propagation to identify 7 affected components, specifications, processes, inspections, and tests across 3 degrees of separation with 100% recall.",
      keyMetrics: [
        { label: "Recall Rate", val: "100.0% (Oracle)" },
        { label: "Precision Rate", val: "82.4% (Filtered)" },
        { label: "Critical Path", val: "C-105 → P-302 → I-401" }
      ],
      actionText: "Open Impact Explorer"
    },
    {
      title: "Step 3: FMEA Risk Engine & Severity Escalation",
      tagline: "Severity 10 Triggers Mandatory Quality Gates",
      icon: ShieldAlert,
      iconColor: "text-red-400 bg-red-950/80 border-red-800",
      targetTab: "risks" as NavTab,
      description: "Applying the AIAG/VDA standard, the risk engine calculates RPN (Severity × Occurrence × Detection). Any risk with Severity ≥ 8 (such as RPN 280 for missing retaining bolts) automatically escalates and generates mandatory verification requirements that cannot be bypassed.",
      keyMetrics: [
        { label: "Highest RPN", val: "280 (High Priority)" },
        { label: "Severity Rating", val: "10 (Explosive Decompression)" },
        { label: "Auto Requirements", val: "3 Mandatory Controls" }
      ],
      actionText: "Inspect Risk Register"
    },
    {
      title: "Step 4: Explainable Quality Gate Enforcement",
      tagline: "Preventing Release Until Verification Evidence is Valid",
      icon: FileCheck2,
      iconColor: "text-amber-400 bg-amber-950/80 border-amber-800",
      targetTab: "evidence" as NavTab,
      description: "ChangeLens evaluates cryptographic evidence against mandatory requirements. If torque logs (BAC-5001-4) or Level II QA inspection stamps are missing, the gate enters an explicit BLOCKED state with concrete corrective actions. No engineer can release without evidence.",
      keyMetrics: [
        { label: "Gate Result", val: "BLOCKED (Missing Evd)" },
        { label: "Accepted Evidence", val: "1 of 3 Complete" },
        { label: "Security Hash", val: "SHA-256 Verified" }
      ],
      actionText: "Examine Quality Gates"
    },
    {
      title: "Step 5: Governance & Automated Audit Dossier",
      tagline: "FAA Separation of Duties & Traceable Reports",
      icon: FileSpreadsheet,
      iconColor: "text-emerald-400 bg-emerald-950/80 border-emerald-800",
      targetTab: "reports" as NavTab,
      description: "ChangeLens enforces FAA regulatory Separation of Duties: Marcus Vance (Requester) cannot approve his own change. An immutable audit trail records every state transition, and the reporting engine generates verifiable PDF, Word, Excel, and CSV dossiers with one click.",
      keyMetrics: [
        { label: "SoD Enforcement", val: "Active (Hard Lock)" },
        { label: "Export Formats", val: "PDF / DOCX / XLSX / CSV" },
        { label: "Audit Integrity", val: "Append-Only Hash Chain" }
      ],
      actionText: "Generate Technical Report"
    }
  ];

  const step = tourSteps[currentStep];
  const Icon = step.icon;

  const handleAction = () => {
    onNavigateTab(step.targetTab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0d1424] border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/30 overflow-hidden flex flex-col">
        {/* Glow accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${step.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                Interactive Showcase · Step {currentStep + 1} of {tourSteps.length}
              </span>
              <h2 className="text-lg font-bold text-white">{step.title}</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="text-sm font-medium text-slate-300">
            {step.tagline}
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            {step.description}
          </p>

          {/* Key Metrics Pills */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {step.keyMetrics.map((km, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col">
                <span className="text-[10px] uppercase font-mono text-slate-500">{km.label}</span>
                <span className="text-xs font-bold font-mono text-cyan-300 mt-1 truncate">{km.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#090e1a] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {tourSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            <button
              onClick={handleAction}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-xs font-bold text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <span>{step.actionText}</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            {currentStep < tourSteps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Complete Tour
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
