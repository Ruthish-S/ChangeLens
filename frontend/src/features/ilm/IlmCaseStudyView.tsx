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
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Activity
} from 'lucide-react';

export const IlmCaseStudyView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'fishbone' | 'pestel' | 'swot' | 'pdca'>('matrix');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Innovation &amp; Leadership Management Case Study
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs font-medium text-gray-500">
              Boeing 737-9 MAX Incident Synthesis
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
            ILM Strategic Frameworks &amp; ChangeLens Solution
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-3xl leading-relaxed">
            Direct synthesis of the classroom presentation analysis (PESTEL, SWOT, Fishbone, Decision Matrix, and PDCA) proving why <span className="font-semibold text-gray-800">Option C: Integrated Evidence-Gated Governance</span> is the winning manufacturing leadership solution.
          </p>
        </div>

        {/* Epistemic Rigor Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            Fact / Documented
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
            Analytical Model
          </span>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
            Solution Decision
          </span>
        </div>
      </div>

      {/* Apple-Style Navigation Segmented Controls */}
      <div className="bg-white p-1.5 rounded-xl border border-gray-200/80 shadow-sm flex flex-wrap items-center gap-1 text-xs">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'matrix' ? 'bg-blue-600 text-white shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Decision Matrix (Option C Selected)
        </button>
        <button
          onClick={() => setActiveTab('fishbone')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'fishbone' ? 'bg-blue-600 text-white shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Fishbone (Root Cause)
        </button>
        <button
          onClick={() => setActiveTab('pestel')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'pestel' ? 'bg-blue-600 text-white shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          PESTEL Macro Analysis
        </button>
        <button
          onClick={() => setActiveTab('swot')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'swot' ? 'bg-blue-600 text-white shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          SWOT Evaluation
        </button>
        <button
          onClick={() => setActiveTab('pdca')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'pdca' ? 'bg-blue-600 text-white shadow-sm font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          PDCA Continuous Loop
        </button>
      </div>

      {/* Tab 1: Weighted Decision Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                Multi-Criteria Decision Matrix (Slide 21 &amp; 22 of Deck)
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Rigorous evaluation of three engineering change-control interventions against explicit criteria. ChangeLens represents Option C: Integrated Governance.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-100 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 text-gray-500 text-[11px] font-medium uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 border-r border-gray-100">Evaluation Criterion</th>
                    <th className="p-3.5 text-center border-r border-gray-100">Weight</th>
                    <th className="p-3.5 border-r border-gray-100">Option A: Procedural Reinforcement</th>
                    <th className="p-3.5 border-r border-gray-100">Option B: Governance Reinforcement</th>
                    <th className="p-3.5 bg-blue-50/70 text-blue-900 font-semibold border-l-2 border-blue-600">
                      Option C: Integrated Governance (ChangeLens)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  <tr>
                    <td className="p-3.5 font-medium border-r border-gray-100">
                      C1: Risk Reduction &amp; Defect Prevention
                      <div className="text-[11px] text-gray-400 font-normal">Independent controls on every failure path</div>
                    </td>
                    <td className="p-3.5 text-center font-mono border-r border-gray-100">30%</td>
                    <td className="p-3.5 border-r border-gray-100">3 / 5 (Score: 0.90)</td>
                    <td className="p-3.5 border-r border-gray-100">4 / 5 (Score: 1.20)</td>
                    <td className="p-3.5 font-semibold text-blue-700 bg-blue-50/40">5 / 5 (Score: 1.50)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium border-r border-gray-100">
                      C2: Accountability &amp; Auditability
                      <div className="text-[11px] text-gray-400 font-normal">Named owners, RACI, and verified records</div>
                    </td>
                    <td className="p-3.5 text-center font-mono border-r border-gray-100">20%</td>
                    <td className="p-3.5 border-r border-gray-100">2 / 5 (Score: 0.40)</td>
                    <td className="p-3.5 border-r border-gray-100">5 / 5 (Score: 1.00)</td>
                    <td className="p-3.5 font-semibold text-blue-700 bg-blue-50/40">5 / 5 (Score: 1.00)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium border-r border-gray-100">
                      C3: Implementation Feasibility
                      <div className="text-[11px] text-gray-400 font-normal">Builds on current practice without disruption</div>
                    </td>
                    <td className="p-3.5 text-center font-mono border-r border-gray-100">15%</td>
                    <td className="p-3.5 border-r border-gray-100">5 / 5 (Score: 0.75)</td>
                    <td className="p-3.5 border-r border-gray-100">3 / 5 (Score: 0.45)</td>
                    <td className="p-3.5 font-semibold text-blue-700 bg-blue-50/40">2 / 5 (Score: 0.30)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium border-r border-gray-100">
                      C4: Time to Implement
                      <div className="text-[11px] text-gray-400 font-normal">Deployment speed into production lines</div>
                    </td>
                    <td className="p-3.5 text-center font-mono border-r border-gray-100">10%</td>
                    <td className="p-3.5 border-r border-gray-100">5 / 5 (Score: 0.50)</td>
                    <td className="p-3.5 border-r border-gray-100">3 / 5 (Score: 0.30)</td>
                    <td className="p-3.5 font-semibold text-blue-700 bg-blue-50/40">2 / 5 (Score: 0.20)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium border-r border-gray-100">
                      C5: Resource Requirements
                      <div className="text-[11px] text-gray-400 font-normal">Initial capital, staffing, and tooling costs</div>
                    </td>
                    <td className="p-3.5 text-center font-mono border-r border-gray-100">10%</td>
                    <td className="p-3.5 border-r border-gray-100">4 / 5 (Score: 0.40)</td>
                    <td className="p-3.5 border-r border-gray-100">3 / 5 (Score: 0.30)</td>
                    <td className="p-3.5 font-semibold text-blue-700 bg-blue-50/40">2 / 5 (Score: 0.20)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium border-r border-gray-100">
                      C6: Sustainability &amp; Closed-Loop Feedback
                      <div className="text-[11px] text-gray-400 font-normal">Built into authority structure with measured KPIs</div>
                    </td>
                    <td className="p-3.5 text-center font-mono border-r border-gray-100">15%</td>
                    <td className="p-3.5 border-r border-gray-100">2 / 5 (Score: 0.30)</td>
                    <td className="p-3.5 border-r border-gray-100">4 / 5 (Score: 0.60)</td>
                    <td className="p-3.5 font-semibold text-blue-700 bg-blue-50/40">5 / 5 (Score: 0.75)</td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50 text-gray-900 text-xs font-semibold">
                  <tr>
                    <td className="p-3.5 border-r border-gray-100 uppercase">Weighted Overall Score</td>
                    <td className="p-3.5 text-center border-r border-gray-100">100%</td>
                    <td className="p-3.5 border-r border-gray-100 text-gray-500">3.25 / 5.00</td>
                    <td className="p-3.5 border-r border-gray-100 text-gray-700">3.85 / 5.00</td>
                    <td className="p-3.5 text-emerald-700 bg-blue-50/70 text-sm font-bold">
                      3.95 / 5.00 (SELECTED SOLUTION)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed">
              <span className="font-semibold text-blue-950">Deck Conclusion:</span> Option C (Integrated Governance) was selected because it eliminates the critical vulnerabilities exposed in the Alaska Airlines Flight 1282 investigation: unrecorded shop-floor rework, missing secondary inspections, and self-authorization without physical evidence. ChangeLens provides the exact software execution of this winning strategy.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Fishbone Diagram */}
      {activeTab === 'fishbone' && (
        <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Ishikawa (Fishbone) Analysis &amp; System Safeguards (Slide 9 of Deck)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Targeting controllable system weaknesses behind the uninspected closure, categorized by the 6 core manufacturing dimensions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category 1 */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2.5">
              <div className="font-semibold text-xs uppercase text-gray-800 border-b border-gray-200 pb-1.5">
                Methods &amp; Instructions
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed">
                  <span className="font-semibold">[FACT]</span> Plug opened on 18 Sep 2023 without required documentation or work order.
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] leading-relaxed">
                  <span className="font-semibold">[CHANGELENS FIX]</span> Digital traveler locking: Physical steps cannot initiate without active authorized CCR.
                </div>
              </div>
            </div>

            {/* Category 2 */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2.5">
              <div className="font-semibold text-xs uppercase text-gray-800 border-b border-gray-200 pb-1.5">
                People &amp; Competency
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed">
                  <span className="font-semibold">[FACT]</span> Specialized door plug workers were not present or scheduled at closure.
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] leading-relaxed">
                  <span className="font-semibold">[CHANGELENS FIX]</span> Persona qualification enforcement: Only certified technicians can sign off critical tasks.
                </div>
              </div>
            </div>

            {/* Category 3 */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2.5">
              <div className="font-semibold text-xs uppercase text-gray-800 border-b border-gray-200 pb-1.5">
                Inspection &amp; Verification
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed">
                  <span className="font-semibold">[FACT]</span> No QA inspection occurred prior to aircraft delivery because no record existed to call the inspector.
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] leading-relaxed">
                  <span className="font-semibold">[CHANGELENS FIX]</span> Quality Gate Lock: Delivery blocked automatically until Level II QA inspection record is verified.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: PESTEL */}
      {activeTab === 'pestel' && (
        <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              PESTEL Macro-Environmental Strategic Analysis (Slide 11 of Deck)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              External regulatory, economic, and technological factors requiring an automated evidence-gated system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5">
              <span className="font-semibold text-red-600 text-xs">POLITICAL &amp; REGULATORY</span>
              <p className="text-gray-600 leading-relaxed">FAA capped 737 MAX production expansion, stationed on-site inspectors, and mandated SMS rule compliance.</p>
              <div className="text-[11px] text-blue-600 font-medium mt-1">ChangeLens: Hard gate blocks on missing regulatory evidence.</div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5">
              <span className="font-semibold text-amber-600 text-xs">ECONOMIC</span>
              <p className="text-gray-600 leading-relaxed">Manufacturing delays, groundings, and rework cost billions. Speed cannot compromise quality integrity.</p>
              <div className="text-[11px] text-blue-600 font-medium mt-1">ChangeLens: Automated impact traversal cuts review cycle time by 64.6%.</div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5">
              <span className="font-semibold text-blue-600 text-xs">SOCIAL &amp; WORKFORCE</span>
              <p className="text-gray-600 leading-relaxed">Workforce proficiency, psychological safety, and speaking up without reprisal are critical to quality culture.</p>
              <div className="text-[11px] text-blue-600 font-medium mt-1">ChangeLens: Anonymous dissent logging and transparent audit trail.</div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5">
              <span className="font-semibold text-cyan-600 text-xs">TECHNOLOGICAL</span>
              <p className="text-gray-600 leading-relaxed">Disconnection between enterprise design PLM and shop-floor manual traveler records creates hazardous blind spots.</p>
              <div className="text-[11px] text-blue-600 font-medium mt-1">ChangeLens: Unified graph connects parts, travelers, and inspection sign-offs.</div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5">
              <span className="font-semibold text-emerald-600 text-xs">ENVIRONMENTAL</span>
              <p className="text-gray-600 leading-relaxed">Fuel efficiency drives lighter alloys and precision composite doors requiring strict conformity verification.</p>
              <div className="text-[11px] text-blue-600 font-medium mt-1">ChangeLens: Material test certs (CMTR) verified against design limits.</div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5">
              <span className="font-semibold text-purple-600 text-xs">LEGAL &amp; COMPLIANCE</span>
              <p className="text-gray-600 leading-relaxed">NTSB investigations and FAA product conformance enforcement demand tamper-evident records.</p>
              <div className="text-[11px] text-blue-600 font-medium mt-1">ChangeLens: SHA-256 evidence hashing and immutable governance logs.</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: SWOT */}
      {activeTab === 'swot' && (
        <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              SWOT Analysis of Manufacturing Quality Control (Slide 12 of Deck)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Preserving structural manufacturing strengths while closing exposed vulnerabilities with ChangeLens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
              <div className="font-semibold text-emerald-700 text-xs">Strengths (Documented Base)</div>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Voluntary SMS program initiated in 2019, now required by rule.</li>
                <li>Six KPIs with control limits that trigger corrective action.</li>
                <li>Extensive aerospace technical standards and engineering workforce.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
              <div className="font-semibold text-red-700 text-xs">Weaknesses (Identified Gaps)</div>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Plug work was undocumented, so closure was never scheduled for inspection.</li>
                <li>Informal SMS was inadequate to proactively catch repetitive removals.</li>
                <li>Non-compliance cited in process control, parts handling, and product control.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
              <div className="font-semibold text-blue-700 text-xs">Opportunities (ChangeLens Features)</div>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Gate progress on verified records, not manual sign-off alone.</li>
                <li>Independent verification required for all high-consequence work (S ≥ 8).</li>
                <li>Measure sustained effectiveness rather than mere activity completion.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
              <div className="font-semibold text-amber-700 text-xs">Threats (External Risks)</div>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Recurrence of latent escapes leading to catastrophic in-service events.</li>
                <li>Sustained FAA production expansion caps and regulatory intervention.</li>
                <li>Erosion of passenger and airline trust in assembly integrity.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: PDCA */}
      {activeTab === 'pdca' && (
        <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              PDCA (Plan-Do-Check-Act) Closed-Loop Governance (Slide 24 of Deck)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Ensuring corrective actions remain effective over time through continuous operational verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5">
              <span className="font-semibold text-blue-600 text-xs">1. PLAN</span>
              <p className="text-gray-600 leading-relaxed">
                Define critical manufacturing risks, assign single accountable owners (RACI), establish baselines, and specify mandatory evidence criteria.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5">
              <span className="font-semibold text-amber-600 text-xs">2. DO</span>
              <p className="text-gray-600 leading-relaxed">
                Implement standardized digital travelers, risk-based inspection gates, role competency checks, and automated supplier quality requirements.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5">
              <span className="font-semibold text-emerald-600 text-xs">3. CHECK</span>
              <p className="text-gray-600 leading-relaxed">
                Conduct sample record-to-work audits, review gate bottleneck rates, track recurrence of verified defects, and test instruction compliance.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5">
              <span className="font-semibold text-purple-600 text-xs">4. ACT</span>
              <p className="text-gray-600 leading-relaxed">
                Correct residual process weaknesses, revise control limits, report sustained performance to leadership, and institutionalize best practices.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
