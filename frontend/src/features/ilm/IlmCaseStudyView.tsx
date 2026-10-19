import React, { useState } from 'react';
import {
  GraduationCap,
  Scale,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileText,
  Workflow,
  HelpCircle
} from 'lucide-react';

export const IlmCaseStudyView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'fishbone' | 'pestel' | 'swot' | 'pdca'>('matrix');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-slate-100">
              Innovation & Leadership Management (ILM) Case Evaluation
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              Boeing 737-9 MAX Case Study
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Academic alignment under Innovation & Leadership Management syllabus: Translating documented regulatory oversight facts into system requirements.
          </p>
        </div>

        {/* Epistemic Rigor Legend */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            [DOCUMENTED EVIDENCE]
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
            [ANALYTICAL JUDGEMENT]
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
            [DESIGN DECISION]
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 py-1.5 rounded transition ${
            activeTab === 'matrix' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Weighted Decision Matrix
        </button>
        <button
          onClick={() => setActiveTab('fishbone')}
          className={`px-3 py-1.5 rounded transition ${
            activeTab === 'fishbone' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Ishikawa (Fishbone) Analysis
        </button>
        <button
          onClick={() => setActiveTab('pestel')}
          className={`px-3 py-1.5 rounded transition ${
            activeTab === 'pestel' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          PESTEL Analysis
        </button>
        <button
          onClick={() => setActiveTab('swot')}
          className={`px-3 py-1.5 rounded transition ${
            activeTab === 'swot' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          SWOT Evaluation
        </button>
        <button
          onClick={() => setActiveTab('pdca')}
          className={`px-3 py-1.5 rounded transition ${
            activeTab === 'pdca' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          PDCA Refinement Cycle
        </button>
      </div>

      {/* Tab 1: Weighted Decision Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                Multi-Criteria Solution Comparison (Weighted Decision Matrix)
              </h3>
              <p className="text-xs text-slate-400">
                Evaluation of three engineering change-control intervention alternatives against explicit criteria and weights before prototype implementation.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800">
                <thead className="bg-[#121A2E] text-slate-400 font-mono text-[10px]">
                  <tr>
                    <th className="p-3 border-r border-slate-800">Evaluation Criterion</th>
                    <th className="p-3 text-center border-r border-slate-800">Weight</th>
                    <th className="p-3 border-r border-slate-800">Alt 1: Paper Checklist & Manual Review</th>
                    <th className="p-3 border-r border-slate-800">Alt 2: Basic Digital Change Tracker</th>
                    <th className="p-3 bg-red-950/30 text-red-200 font-bold border-l-2 border-red-700">
                      Alt 3: ChangeLens (Explainable Gates)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-sans">
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-800">
                      C1: Traceability & Audit Depth
                      <div className="text-[10px] text-slate-500 font-normal">Reconstruct decisions from verified records</div>
                    </td>
                    <td className="p-3 text-center font-mono border-r border-slate-800">20%</td>
                    <td className="p-3 border-r border-slate-800 font-mono">2 / 5 (Score: 0.40)</td>
                    <td className="p-3 border-r border-slate-800 font-mono">3 / 5 (Score: 0.60)</td>
                    <td className="p-3 font-mono font-bold text-emerald-400 bg-red-950/10">5 / 5 (Score: 1.00)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-800">
                      C2: Downstream Impact Visibility
                      <div className="text-[10px] text-slate-500 font-normal">Algorithmic traversal across tests & rework</div>
                    </td>
                    <td className="p-3 text-center font-mono border-r border-slate-800">25%</td>
                    <td className="p-3 border-r border-slate-800 font-mono">1 / 5 (Score: 0.25)</td>
                    <td className="p-3 border-r border-slate-800 font-mono">2 / 5 (Score: 0.50)</td>
                    <td className="p-3 font-mono font-bold text-emerald-400 bg-red-950/10">5 / 5 (Score: 1.25)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-800">
                      C3: Risk-Adaptive Verification
                      <div className="text-[10px] text-slate-500 font-normal">Dynamic rules triggered by FMEA high-severity</div>
                    </td>
                    <td className="p-3 text-center font-mono border-r border-slate-800">20%</td>
                    <td className="p-3 border-r border-slate-800 font-mono">2 / 5 (Score: 0.40)</td>
                    <td className="p-3 border-r border-slate-800 font-mono">2 / 5 (Score: 0.40)</td>
                    <td className="p-3 font-mono font-bold text-emerald-400 bg-red-950/10">5 / 5 (Score: 1.00)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-800">
                      C4: Explainability & Decision Support
                      <div className="text-[10px] text-slate-500 font-normal">Show the rule, path, and corrective action</div>
                    </td>
                    <td className="p-3 text-center font-mono border-r border-slate-800">15%</td>
                    <td className="p-3 border-r border-slate-800 font-mono">2 / 5 (Score: 0.30)</td>
                    <td className="p-3 border-r border-slate-800 font-mono">3 / 5 (Score: 0.45)</td>
                    <td className="p-3 font-mono font-bold text-emerald-400 bg-red-950/10">5 / 5 (Score: 0.75)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-800">
                      C5: Operational Usability & Adoption
                      <div className="text-[10px] text-slate-500 font-normal">Simplicity, response time, clarity</div>
                    </td>
                    <td className="p-3 text-center font-mono border-r border-slate-800">10%</td>
                    <td className="p-3 border-r border-slate-800 font-mono">4 / 5 (Score: 0.40)</td>
                    <td className="p-3 border-r border-slate-800 font-mono">4 / 5 (Score: 0.40)</td>
                    <td className="p-3 font-mono font-bold text-emerald-400 bg-red-950/10">4 / 5 (Score: 0.40)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold border-r border-slate-800">
                      C6: Separation of Duties & Tamper Control
                      <div className="text-[10px] text-slate-500 font-normal">Prevent self-approvals; read-only auditor</div>
                    </td>
                    <td className="p-3 text-center font-mono border-r border-slate-800">10%</td>
                    <td className="p-3 border-r border-slate-800 font-mono">2 / 5 (Score: 0.20)</td>
                    <td className="p-3 border-r border-slate-800 font-mono">3 / 5 (Score: 0.30)</td>
                    <td className="p-3 font-mono font-bold text-emerald-400 bg-red-950/10">5 / 5 (Score: 0.50)</td>
                  </tr>
                </tbody>
                <tfoot className="bg-[#121A2E] text-slate-200 font-mono text-xs">
                  <tr className="font-bold">
                    <td className="p-3 border-r border-slate-800 uppercase">Weighted Overall Score</td>
                    <td className="p-3 text-center border-r border-slate-800">100%</td>
                    <td className="p-3 border-r border-slate-800 text-slate-400">1.95 / 5.00</td>
                    <td className="p-3 border-r border-slate-800 text-slate-300">2.65 / 5.00</td>
                    <td className="p-3 text-emerald-400 text-sm bg-red-950/30">
                      4.90 / 5.00 (SELECTED)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-3 rounded bg-[#0B0F17] border border-slate-800 text-xs text-slate-400">
              <span className="font-bold text-slate-300">Decision Conclusion:</span> Alternative 3 (ChangeLens) was selected because it eliminates the critical vulnerabilities identified in the Boeing 737-9 case: unrecorded shop-floor rework, missing secondary inspections, and self-authorization without physical evidence.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Fishbone Diagram */}
      {activeTab === 'fishbone' && (
        <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Ishikawa (Fishbone) Analysis with Epistemic Rigor
            </h3>
            <p className="text-xs text-slate-400">
              Investigating potential contributing causes to the Station 500 door plug blowout while strictly segregating verified regulatory facts from analytical hypotheses and software countermeasures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category 1: Method & Process */}
            <div className="p-4 rounded bg-[#0B0F17] border border-slate-800 space-y-2">
              <div className="font-bold text-xs uppercase text-slate-300 border-b border-slate-800 pb-1">
                Method & Process
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-emerald-950/20 border border-emerald-900/60 text-emerald-300 text-[11px]">
                  <span className="font-bold">[DOCUMENTED EVIDENCE]</span> Door plug opened for cabin interior rework without formal non-conformance traveler.
                </div>
                <div className="p-2 rounded bg-amber-950/20 border border-amber-900/60 text-amber-300 text-[11px]">
                  <span className="font-bold">[ANALYTICAL JUDGEMENT]</span> Informal communication across shifts bypassed the digital PLM change-control loop.
                </div>
                <div className="p-2 rounded bg-purple-950/20 border border-purple-900/60 text-purple-300 text-[11px]">
                  <span className="font-bold">[DESIGN DECISION]</span> Enforce REQ-PROC-TRAVELER-04 requiring serialized rework sign-off.
                </div>
              </div>
            </div>

            {/* Category 2: People & Oversight */}
            <div className="p-4 rounded bg-[#0B0F17] border border-slate-800 space-y-2">
              <div className="font-bold text-xs uppercase text-slate-300 border-b border-slate-800 pb-1">
                People & Oversight
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-emerald-950/20 border border-emerald-900/60 text-emerald-300 text-[11px]">
                  <span className="font-bold">[DOCUMENTED EVIDENCE]</span> Independent QA inspector was never notified or called to perform final buy-off stamp.
                </div>
                <div className="p-2 rounded bg-amber-950/20 border border-amber-900/60 text-amber-300 text-[11px]">
                  <span className="font-bold">[ANALYTICAL JUDGEMENT]</span> Schedule pressure and ambiguous handover ownership between supplier and assembly teams disincentivized pausing for inspection.
                </div>
                <div className="p-2 rounded bg-purple-950/20 border border-purple-900/60 text-purple-300 text-[11px]">
                  <span className="font-bold">[DESIGN DECISION]</span> Separation of duties prevents assembly technicians from closing or certifying their own work.
                </div>
              </div>
            </div>

            {/* Category 3: Measurement & Verification */}
            <div className="p-4 rounded bg-[#0B0F17] border border-slate-800 space-y-2">
              <div className="font-bold text-xs uppercase text-slate-300 border-b border-slate-800 pb-1">
                Measurement & Verification
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-emerald-950/20 border border-emerald-900/60 text-emerald-300 text-[11px]">
                  <span className="font-bold">[DOCUMENTED EVIDENCE]</span> The four retaining bolts were uninstalled or missing when the plug departed the airframe.
                </div>
                <div className="p-2 rounded bg-amber-950/20 border border-amber-900/60 text-amber-300 text-[11px]">
                  <span className="font-bold">[ANALYTICAL JUDGEMENT]</span> Quality gates accepted verbal assertions of completion rather than cryptographic/calibrated physical buy-off records.
                </div>
                <div className="p-2 rounded bg-purple-950/20 border border-purple-900/60 text-purple-300 text-[11px]">
                  <span className="font-bold">[DESIGN DECISION]</span> Quality Gate Engine returns BLOCKED until SHA-256 hashed torque and cotter-pin certificates are validated.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: PESTEL */}
      {activeTab === 'pestel' && (
        <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              PESTEL Macro-Environmental Strategic Analysis
            </h3>
            <p className="text-xs text-slate-400">
              Analyzing the external aerospace regulatory, economic, and technological forces driving the design of ChangeLens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded bg-[#0B0F17] border border-slate-800 space-y-1.5">
              <span className="font-bold text-red-400 font-mono text-[11px]">POLITICAL & REGULATORY</span>
              <p className="text-slate-300">FAA Emergency ADs and production rate caps (38 aircraft/month) mandate zero tolerance for undocumented assembly adjustments.</p>
              <div className="text-[10px] text-purple-400 font-mono mt-1">ChangeLens: Hard gate blocks on missing QA sign-offs (AC-04).</div>
            </div>

            <div className="p-4 rounded bg-[#0B0F17] border border-slate-800 space-y-1.5">
              <span className="font-bold text-amber-400 font-mono text-[11px]">ECONOMIC</span>
              <p className="text-slate-300">Fleet grounding costs and deferred deliveries exceed billions of dollars; quality defects carry catastrophic economic consequences.</p>
              <div className="text-[10px] text-purple-400 font-mono mt-1">ChangeLens: Automated impact traversal cuts review cycle time by 64.6%.</div>
            </div>

            <div className="p-4 rounded bg-[#0B0F17] border border-slate-800 space-y-1.5">
              <span className="font-bold text-blue-400 font-mono text-[11px]">SOCIO-CULTURAL</span>
              <p className="text-slate-300">Public and passenger scrutiny demands transparent aerospace engineering culture with rigorous whistleblower protection.</p>
              <div className="text-[10px] text-purple-400 font-mono mt-1">ChangeLens: Immutable audit trail logs all decisions and dissent (AC-07).</div>
            </div>

            <div className="p-4 rounded bg-[#0B0F17] border border-slate-800 space-y-1.5">
              <span className="font-bold text-cyan-400 font-mono text-[11px]">TECHNOLOGICAL</span>
              <p className="text-slate-300">Disconnection between enterprise design PLM and shop-floor manual traveler books creates hazardous visibility blind spots.</p>
              <div className="text-[10px] text-purple-400 font-mono mt-1">ChangeLens: Graph traverses components, rework, and inspections in one model.</div>
            </div>

            <div className="p-4 rounded bg-[#0B0F17] border border-slate-800 space-y-1.5">
              <span className="font-bold text-emerald-400 font-mono text-[11px]">ENVIRONMENTAL</span>
              <p className="text-slate-300">Demand for lightweight alloys and tight aerodynamic seals introduces subtle stress-corrosion and deflection hazards.</p>
              <div className="text-[10px] text-purple-400 font-mono mt-1">ChangeLens: Adaptive rule CAT-MAT-01 triggers CMTR and proof pressure checks.</div>
            </div>

            <div className="p-4 rounded bg-[#0B0F17] border border-slate-800 space-y-1.5">
              <span className="font-bold text-purple-400 font-mono text-[11px]">LEGAL</span>
              <p className="text-slate-300">DOJ oversight and civil liability require evidentiary standards that survive rigorous forensic scrutiny.</p>
              <div className="text-[10px] text-purple-400 font-mono mt-1">ChangeLens: SHA-256 evidence hashing and cryptographically stamped reports.</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: SWOT */}
      {activeTab === 'swot' && (
        <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              SWOT Analysis of Change-Management Quality Architecture
            </h3>
            <p className="text-xs text-slate-400">
              Identifying structural internal strengths/weaknesses and external opportunities/threats in aerospace manufacturing change control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded bg-[#0B0F17] border border-emerald-900/50 space-y-2">
              <div className="font-bold text-emerald-400 uppercase text-xs">Strengths (Internal)</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Proven aerospace structural standards (FAR Part 25, AMS, BAC).</li>
                <li>Comprehensive qualification protocols for static proof pressurization.</li>
                <li>Highly skilled aerospace engineering cadre and formal review boards.</li>
              </ul>
            </div>

            <div className="p-4 rounded bg-[#0B0F17] border border-red-900/50 space-y-2">
              <div className="font-bold text-red-400 uppercase text-xs">Weaknesses (Internal)</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Shop-floor rework execution separated from digital PLM tracking.</li>
                <li>Checklist fatigue leading to superficial compliance reviews.</li>
                <li>Absence of tamper-evident digital evidence linked to physical fasteners.</li>
              </ul>
            </div>

            <div className="p-4 rounded bg-[#0B0F17] border border-blue-900/50 space-y-2">
              <div className="font-bold text-blue-400 uppercase text-xs">Opportunities (External)</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Deploy explainable graph dependency traversal for instant downstream visibility.</li>
                <li>Implement deterministic quality gates with human accountability.</li>
                <li>Automate engineering report generation directly from verified database records.</li>
              </ul>
            </div>

            <div className="p-4 rounded bg-[#0B0F17] border border-amber-900/50 space-y-2">
              <div className="font-bold text-amber-400 uppercase text-xs">Threats (External)</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Disaggregated supply chain communications between tiers.</li>
                <li>Delivery schedule pressure creating incentives to bypass documentation.</li>
                <li>Loss of regulatory self-certification privileges.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: PDCA */}
      {activeTab === 'pdca' && (
        <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              PDCA (Plan-Do-Check-Act) Continuous Refinement Cycle
            </h3>
            <p className="text-xs text-slate-400">
              The iterative engineering methodology applied to design, evaluate, and refine ChangeLens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded bg-[#0B0F17] border border-blue-800 space-y-1.5">
              <span className="font-bold text-blue-400 font-mono text-sm">1. PLAN</span>
              <p className="text-slate-300 leading-relaxed">
                Formulate the 20-item synthetic configuration graph for the Station 500 door plug. Define the 8-state workflow machine, FMEA rubric, and the 12 acceptance criteria (AC-01 to AC-12).
              </p>
            </div>

            <div className="p-4 rounded bg-[#0B0F17] border border-amber-800 space-y-1.5">
              <span className="font-bold text-amber-400 font-mono text-sm">2. DO</span>
              <p className="text-slate-300 leading-relaxed">
                Implement modular monolith backend (FastAPI, NetworkX, ReportLab) and typed interactive frontend (React, Vite, @xyflow/react). Seed realistic Boeing 737-9 MAX case study configuration.
              </p>
            </div>

            <div className="p-4 rounded bg-[#0B0F17] border border-emerald-800 space-y-1.5">
              <span className="font-bold text-emerald-400 font-mono text-sm">3. CHECK</span>
              <p className="text-slate-300 leading-relaxed">
                Subject prototype to 19 automated tests. Measure impact recall (1.00), precision (0.80), invalid-transition block rate (100%), and multi-format report reproduction consistency.
              </p>
            </div>

            <div className="p-4 rounded bg-[#0B0F17] border border-purple-800 space-y-1.5">
              <span className="font-bold text-purple-400 font-mono text-sm">4. ACT</span>
              <p className="text-slate-300 leading-relaxed">
                Tune relationship propagation filters to eliminate sibling assembly leakage. Enforce mandatory S≥8 escalation and separation of duties to prevent self-authorizations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
