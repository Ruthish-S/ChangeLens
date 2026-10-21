import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Plus,
  Scale,
  CheckCircle,
  FileCheck2,
  HelpCircle
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { api, RiskAssessment, User } from '../../api/client';

interface RiskControlsProps {
  changeId: string;
  currentUser: User | null;
}

export const RiskControlsView: React.FC<RiskControlsProps> = ({ changeId, currentUser }) => {
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields for new FMEA record
  const [failureMode, setFailureMode] = useState('');
  const [effect, setEffect] = useState('');
  const [cause, setCause] = useState('');
  const [severity, setSeverity] = useState(8);
  const [occurrence, setOccurrence] = useState(3);
  const [detection, setDetection] = useState(4);
  const [mitigation, setMitigation] = useState('');
  const [owner, setOwner] = useState('Dr. Elena Rostova (QA Lead)');
  const [resSeverity, setResSeverity] = useState(8);
  const [resOccurrence, setResOccurrence] = useState(1);
  const [resDetection, setResDetection] = useState(2);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const data = await api.getRisks(changeId);
      setRisks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (changeId) fetchRisks();
  }, [changeId]);

  const handleAddRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addRisk(
        changeId,
        {
          failure_mode: failureMode,
          effect,
          cause,
          severity: Number(severity),
          occurrence: Number(occurrence),
          detection: Number(detection),
          mitigation,
          accountable_owner: owner,
          residual_severity: Number(resSeverity),
          residual_occurrence: Number(resOccurrence),
          residual_detection: Number(resDetection)
        },
        currentUser?.id || 'usr-lead-eng'
      );
      setShowAddModal(false);
      setFailureMode('');
      setEffect('');
      setCause('');
      setMitigation('');
      await fetchRisks();
    } catch (err: any) {
      alert(`Failed to add risk: ${err.message}`);
    }
  };

  const calculatedRpn = severity * occurrence * detection;
  const calculatedResRpn = resSeverity * resOccurrence * resDetection;
  const isHighSeverity = severity >= 8;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-slate-100">
              Risk Management & FMEA Register (AIAG & VDA Adapted)
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Rubric v2.0
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic risk priority scoring linking potential assembly defects to mandatory verification requirements. Failure modes with S ≥ 8 mandate Chief Engineer escalation.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium transition shadow-sm self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Failure Mode
        </button>
      </div>

      {/* Plot 2 & Rubric Explanation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Plot 2: Scatter Plot */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-[#0F172A] border border-[#1E293B]">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Plot 2 — Severity vs Occurrence Risk Landscape
              </h4>
              <p className="text-[11px] text-slate-400">
                Red dots indicate High Severity (S ≥ 8) requiring mandatory airframe authority review.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500" /> S ≥ 8 Escalated
              </span>
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Standard
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  type="number"
                  dataKey="occurrence"
                  name="Occurrence (O)"
                  domain={[1, 10]}
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  label={{ value: 'Occurrence (1-10)', position: 'insideBottom', offset: -10, fill: '#64748B', fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="severity"
                  name="Severity (S)"
                  domain={[1, 10]}
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  label={{ value: 'Severity (1-10)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0B0F17] border border-slate-700 p-2.5 rounded shadow-lg text-xs font-sans">
                          <div className="font-bold text-slate-200">{data.failure_mode}</div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Severity: <span className="font-mono text-red-400 font-bold">{data.severity}</span> | Occurrence: <span className="font-mono text-slate-300">{data.occurrence}</span> | Detection: <span className="font-mono text-slate-300">{data.detection}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            RPN: <span className="font-mono text-amber-400 font-bold">{data.rpn}</span> &rarr; Residual RPN: <span className="font-mono text-emerald-400 font-bold">{data.residual_rpn}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">Owner: {data.accountable_owner}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Failure Modes" data={risks}>
                  {risks.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={(entry.high_severity_flag ?? entry.severity >= 8) ? '#EF4444' : '#3B82F6'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FMEA Governance Rule Card */}
        <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B] flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              Safety Governance & Escalation Rules
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <div className="p-2.5 rounded bg-red-950/20 border border-red-900/50">
                <span className="font-bold text-red-400">High-Severity Escalation Rule:</span>
                <p className="text-[11px] text-red-200/90 mt-0.5">
                  RPN alone is not a sufficient safety decision rule. Any failure mode with Severity S ≥ 8 automatically mandates independent engineering sign-off, regardless of how low Occurrence or Detection are estimated.
                </p>
              </div>

              <div className="p-2.5 rounded bg-[#0B0F17] border border-slate-800">
                <span className="font-bold text-slate-200">Adaptive Requirement Trigger:</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Recording an S ≥ 8 failure mode automatically generates requirement <code className="text-amber-400">REQ-GATE-SAFETY-ESCALATION</code>, blocking authorization until formally signed by the Chief Airframe Engineer.
                </p>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-800/40 border border-slate-700/60 text-[10.5px] text-slate-400 font-mono">
            FMEA Formula: RPN = S &times; O &times; D (Scale 1-1000)
          </div>
        </div>
      </div>

      {/* FMEA Table */}
      <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B]">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            FMEA Register & Mitigation Ownership ({risks.length} Failure Modes Evaluated)
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {risks.filter(r => (r.high_severity_flag ?? r.severity >= 8)).length} High-Severity Items Flagged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Failure Mode & Effect</th>
                <th className="py-2.5 px-2 text-center">S</th>
                <th className="py-2.5 px-2 text-center">O</th>
                <th className="py-2.5 px-2 text-center">D</th>
                <th className="py-2.5 px-2 text-center font-bold">RPN</th>
                <th className="py-2.5 px-3">Severity Escalation</th>
                <th className="py-2.5 px-3 w-1/3">Mitigation Action & Owner</th>
                <th className="py-2.5 px-3 text-center">Residual RPN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {risks.map((r) => {
                const isHighSev = r.high_severity_flag ?? r.severity >= 8;
                const residualRpn = r.residual_rpn ?? Math.round(r.rpn * 0.35);
                const residualSev = r.residual_severity ?? r.severity;
                const residualOcc = r.residual_occurrence ?? Math.max(1, Math.round(r.occurrence / 2));
                const residualDet = r.residual_detection ?? Math.max(1, Math.round(r.detection / 2));
                return (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-200">{r.failure_mode}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        <span className="text-slate-500 font-semibold">Effect:</span> {r.effect}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        <span className="font-semibold">Root Cause:</span> {r.cause}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-red-400">{r.severity}</td>
                    <td className="py-3 px-2 text-center font-mono text-slate-300">{r.occurrence}</td>
                    <td className="py-3 px-2 text-center font-mono text-slate-300">{r.detection}</td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-amber-400">{r.rpn}</td>
                    <td className="py-3 px-3">
                      {isHighSev ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                          YES (S ≥ 8)
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          STANDARD
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-[11px]">
                      <div>{r.mitigation}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 font-semibold">
                        Owner: {r.accountable_owner || 'Airframe Lead / QA'}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="font-mono font-bold text-emerald-400 text-xs">
                        {residualRpn}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">
                        (S:{residualSev} O:{residualOcc} D:{residualDet})
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Failure Mode Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-lg max-w-xl w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-red-500" />
              Add FMEA Failure Mode & Calculate Risk
            </h3>

            <form onSubmit={handleAddRisk} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Potential Failure Mode</label>
                <input
                  type="text"
                  required
                  value={failureMode}
                  onChange={(e) => setFailureMode(e.target.value)}
                  placeholder="e.g. Stop pad clearance gap exceedance under cyclic pressurization"
                  className="w-full bg-[#1A2338] text-slate-200 border border-slate-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Potential Effect</label>
                  <textarea
                    required
                    rows={2}
                    value={effect}
                    onChange={(e) => setEffect(e.target.value)}
                    placeholder="e.g. Uneven load distribution leading to fatigue fracture"
                    className="w-full bg-[#1A2338] text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Potential Cause</label>
                  <textarea
                    required
                    rows={2}
                    value={cause}
                    onChange={(e) => setCause(e.target.value)}
                    placeholder="e.g. Inadequate shim thickness tolerance on jig assembly"
                    className="w-full bg-[#1A2338] text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* S, O, D Sliders / Selectors */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded bg-[#0B0F17] border border-slate-800">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Severity (S: 1-10): <span className="font-bold text-red-400">{severity}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                    className="w-full"
                  />
                  {isHighSeverity && (
                    <span className="text-[9px] font-bold text-red-400 block mt-1">S ≥ 8 MANDATORY ESCALATION</span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Occurrence (O: 1-10): <span className="font-bold text-slate-200">{occurrence}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={occurrence}
                    onChange={(e) => setOccurrence(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">
                    Detection (D: 1-10): <span className="font-bold text-slate-200">{detection}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={detection}
                    onChange={(e) => setDetection(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Calculated RPN Banner */}
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-800/80 border border-slate-700 text-xs">
                <span className="text-slate-300">Calculated RPN (S &times; O &times; D):</span>
                <span className="font-mono font-bold text-base text-amber-400">{calculatedRpn}</span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Proposed Mitigation Action</label>
                <input
                  type="text"
                  required
                  value={mitigation}
                  onChange={(e) => setMitigation(e.target.value)}
                  placeholder="e.g. Feeler gauge verification I-402 on every production unit"
                  className="w-full bg-[#1A2338] text-slate-200 border border-slate-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Accountable Owner</label>
                <input
                  type="text"
                  required
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full bg-[#1A2338] text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-slate-300 rounded text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded text-xs transition shadow-sm"
                >
                  Save Failure Mode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
