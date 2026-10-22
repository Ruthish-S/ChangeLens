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
      title: "Welcome to ChangeLens",
      tagline: "Every change. Every impact. Every decision verified.",
      icon: Sparkles,
      iconColor: "text-blue-600 bg-blue-50 border-blue-200",
      targetTab: "overview" as NavTab,
      description: "ChangeLens is an explainable engineering change-impact and quality gate intelligence platform. Directly solving the manufacturing breakdowns exposed in the Boeing 737-9 MAX door plug case study, it provides tamper-evident digital traveler enforcement and deterministic dependency tracking.",
      keyMetrics: [
        { label: "Case Study Aircraft", val: "Boeing 737-9 MAX" },
        { label: "Graph Traversal", val: "NetworkX BFS Traversal" },
        { label: "Gate Standard", val: "AIAG & VDA FMEA" }
      ],
      actionText: "Explore Dashboard"
    },
    {
      title: "Step 1: The Manufacturing Baseline & Change Scope",
      tagline: "Tracking the Station 500 Door Plug Configuration",
      icon: GitBranch,
      iconColor: "text-blue-600 bg-blue-50 border-blue-200",
      targetTab: "changes" as NavTab,
      description: "In the Boeing 737-9 MAX incident, the mid-cabin exit door plug was opened during factory assembly to rework damaged rivets. ChangeLens models CCR-2026-0001, tracking the change directly against baseline BASE-737-9-DOORPLUG-A with side-by-side specification diffing to prevent unrecorded rework.",
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
      iconColor: "text-purple-600 bg-purple-50 border-purple-200",
      targetTab: "impact" as NavTab,
      description: "Standard PLM systems only track direct 1-to-1 links. ChangeLens uses NetworkX BFS traversal with relationship-filtered propagation to identify 7 affected components, specifications, processes, inspections, and tests across 3 degrees of separation with 100% recall.",
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
      iconColor: "text-red-600 bg-red-50 border-red-200",
      targetTab: "risks" as NavTab,
      description: "Applying the AIAG & VDA standard, the risk engine calculates RPN (Severity × Occurrence × Detection). Any risk with Severity ≥ 8 (such as explosive decompression from missing retaining bolts) automatically escalates and generates mandatory verification requirements that cannot be bypassed.",
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
      iconColor: "text-amber-600 bg-amber-50 border-amber-200",
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
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${step.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 font-semibold">
                Interactive Showcase · Step {currentStep + 1} of {tourSteps.length}
              </span>
              <h2 className="text-lg font-semibold text-gray-900">{step.title}</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="text-sm font-semibold text-gray-800">
            {step.tagline}
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            {step.description}
          </p>

          {/* Key Metrics Pills */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {step.keyMetrics.map((km, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col">
                <span className="text-[10px] uppercase font-mono text-gray-400 font-medium">{km.label}</span>
                <span className="text-xs font-bold font-mono text-gray-900 mt-1 truncate">{km.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {tourSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-[#0071E3]' : 'w-2 bg-gray-200 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            <button
              onClick={handleAction}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>{step.actionText}</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </button>

            {currentStep < tourSteps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-1.5 rounded-lg bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs transition-colors flex items-center gap-1 shadow-sm"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors shadow-sm"
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
