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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">
                Risk Management & FMEA Register (AIAG & VDA)
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 font-medium">
                Rubric v2.0
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Deterministic risk priority scoring linking potential defects to mandatory verification requirements. Failure modes with S ≥ 8 mandate Chief Airframe Engineer escalation.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-lg text-xs font-medium transition shadow-sm self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Failure Mode
        </button>
      </div>

      {/* Plot & Rubric Explanation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scatter Plot */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Severity vs Occurrence Risk Landscape
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Red markers indicate High Severity (S ≥ 8) requiring mandatory airframe authority review.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-red-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> S ≥ 8 Escalated
              </span>
              <span className="flex items-center gap-1.5 text-blue-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Standard
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  type="number"
                  dataKey="occurrence"
                  name="Occurrence (O)"
                  domain={[1, 10]}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  label={{ value: 'Occurrence (1-10)', position: 'insideBottom', offset: -10, fill: '#64748B', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="severity"
                  name="Severity (S)"
                  domain={[1, 10]}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  label={{ value: 'Severity (1-10)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-lg text-xs font-sans text-gray-900">
                          <div className="font-semibold text-gray-900">{data.failure_mode}</div>
                          <div className="text-[11px] text-gray-600 mt-1">
                            Severity: <span className="font-mono text-red-600 font-bold">{data.severity}</span> | Occurrence: <span className="font-mono text-gray-800">{data.occurrence}</span> | Detection: <span className="font-mono text-gray-800">{data.detection}</span>
                          </div>
                          <div className="text-[11px] text-gray-600 mt-0.5">
                            RPN: <span className="font-mono text-amber-700 font-bold">{data.rpn}</span> &rarr; Residual RPN: <span className="font-mono text-emerald-700 font-bold">{data.residual_rpn}</span>
                          </div>
                          <div className="text-[10px] text-gray-500 mt-1">Owner: {data.accountable_owner}</div>
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
                      fill={(entry.high_severity_flag ?? entry.severity >= 8) ? '#EF4444' : '#0071E3'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FMEA Governance Rule Card */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-600" />
              Safety Governance & Escalation Rules
            </h4>
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200">
                <span className="font-semibold text-red-800">High-Severity Escalation Rule:</span>
                <p className="text-[11px] text-red-900 mt-1">
                  RPN alone is not a sufficient safety decision rule. Any failure mode with Severity S ≥ 8 automatically mandates independent engineering sign-off, regardless of how low Occurrence or Detection are estimated.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <span className="font-semibold text-gray-900">Adaptive Requirement Trigger:</span>
                <p className="text-[11px] text-gray-600 mt-1">
                  Recording an S ≥ 8 failure mode automatically generates requirement <code className="text-blue-600 font-mono">REQ-GATE-SAFETY-ESCALATION</code>, blocking authorization until formally signed by the Chief Airframe Engineer.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 font-mono text-center">
            FMEA Formula: RPN = S &times; O &times; D (Scale 1-1000)
          </div>
        </div>
      </div>

      {/* FMEA Table */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-gray-900">
            FMEA Register & Mitigation Ownership ({risks.length} Failure Modes Evaluated)
          </h4>
          <span className="text-xs text-gray-500 font-mono">
            {risks.filter(r => (r.high_severity_flag ?? r.severity >= 8)).length} High-Severity Items Flagged
          </span>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-[11px]">
                <th className="py-3 px-3.5">Failure Mode & Effect</th>
                <th className="py-3 px-2 text-center">S</th>
                <th className="py-3 px-2 text-center">O</th>
                <th className="py-3 px-2 text-center">D</th>
                <th className="py-3 px-2 text-center font-bold">RPN</th>
                <th className="py-3 px-3.5">Severity Escalation</th>
                <th className="py-3 px-3.5 w-1/3">Mitigation Action & Owner</th>
                <th className="py-3 px-3.5 text-center">Residual RPN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {risks.map((r) => {
                const isHighSev = r.high_severity_flag ?? r.severity >= 8;
                const residualRpn = r.residual_rpn ?? Math.round(r.rpn * 0.35);
                return (
                  <tr key={r.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3.5 px-3.5">
                      <div className="font-semibold text-gray-900">{r.failure_mode}</div>
                      <div className="text-[11px] text-gray-600 mt-0.5">
                        <span className="text-gray-500 font-medium">Effect:</span> {r.effect}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        <span className="font-medium">Root Cause:</span> {r.cause}
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-center font-mono font-bold text-red-600">{r.severity}</td>
                    <td className="py-3.5 px-2 text-center font-mono text-gray-700">{r.occurrence}</td>
                    <td className="py-3.5 px-2 text-center font-mono text-gray-700">{r.detection}</td>
                    <td className="py-3.5 px-2 text-center font-mono font-bold text-amber-700">{r.rpn}</td>
                    <td className="py-3.5 px-3.5">
                      {isHighSev ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                          YES (S ≥ 8)
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          STANDARD
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3.5 text-gray-700 text-[11px]">
                      <div>{r.mitigation}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-1 font-medium">
                        Owner: {r.accountable_owner || 'Airframe Lead / QA'}
                      </div>
                    </td>
                    <td className="py-3.5 px-3.5 text-center">
                      <div className="font-mono font-bold text-emerald-700 text-xs">
                        {residualRpn}
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Add Failure Mode to FMEA Register
            </h3>

            <form onSubmit={handleAddRisk} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Failure Mode</label>
                <input
                  type="text"
                  required
                  value={failureMode}
                  onChange={(e) => setFailureMode(e.target.value)}
                  placeholder="e.g. Stop fitting guide pin retaining bolt omitted or under-torqued"
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Potential Effect</label>
                  <textarea
                    required
                    rows={2}
                    value={effect}
                    onChange={(e) => setEffect(e.target.value)}
                    placeholder="e.g. Door plug translates upward under cabin pressure differential"
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Potential Root Cause</label>
                  <textarea
                    required
                    rows={2}
                    value={cause}
                    onChange={(e) => setCause(e.target.value)}
                    placeholder="e.g. Unrecorded opening during seal rework without traveler lock"
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* S, O, D Sliders */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <label className="block text-gray-600 text-[11px] mb-1">
                    Severity (S: 1-10): <span className="font-bold text-red-600">{severity}</span>
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
                    <span className="text-[9px] font-bold text-red-600 block mt-1">S ≥ 8 MANDATORY ESCALATION</span>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 text-[11px] mb-1">
                    Occurrence (O: 1-10): <span className="font-bold text-gray-800">{occurrence}</span>
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
                  <label className="block text-gray-600 text-[11px] mb-1">
                    Detection (D: 1-10): <span className="font-bold text-gray-800">{detection}</span>
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
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                <span className="text-gray-700 font-medium">Calculated Risk Priority Number (S &times; O &times; D):</span>
                <span className="font-mono font-bold text-base text-amber-700">{calculatedRpn}</span>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Proposed Mitigation Action</label>
                <input
                  type="text"
                  required
                  value={mitigation}
                  onChange={(e) => setMitigation(e.target.value)}
                  placeholder="e.g. Mandatory feeler gauge inspection and digital torque log lock"
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Accountable Owner</label>
                <input
                  type="text"
                  required
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium transition shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium rounded-lg text-xs transition shadow-sm"
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
