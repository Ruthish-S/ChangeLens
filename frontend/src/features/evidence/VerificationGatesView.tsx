import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  ShieldCheck,
  FileText,
  Hash,
  ExternalLink,
  Plus
} from 'lucide-react';
import {
  api,
  VerificationRequirement,
  EvidenceRecord,
  QualityGateEvaluation,
  User
} from '../../api/client';

interface VerificationGatesProps {
  changeId: string;
  currentUser: User | null;
}

export const VerificationGatesView: React.FC<VerificationGatesProps> = ({ changeId, currentUser }) => {
  const [requirements, setRequirements] = useState<VerificationRequirement[]>([]);
  const [evidenceRecords, setEvidenceRecords] = useState<EvidenceRecord[]>([]);
  const [gateEvaluation, setGateEvaluation] = useState<QualityGateEvaluation | null>(null);
  const [selectedGate, setSelectedGate] = useState<string>('PRE_AUTHORIZATION_GATE');
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [targetReqId, setTargetReqId] = useState('');
  const [evidenceType, setEvidenceType] = useState('TEST_REPORT');
  const [sourceRef, setSourceRef] = useState('');
  const [docRevision, setDocRevision] = useState('Rev 1.0');
  const [fileName, setFileName] = useState('');
  const [notes, setNotes] = useState('');

  // Verify modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<'ACCEPTED' | 'REJECTED'>('ACCEPTED');
  const [verifyNotes, setVerifyNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqs, evs, gate] = await Promise.all([
        api.getRequirements(changeId),
        api.getEvidenceRecords(changeId),
        api.getGateEvaluation(changeId, selectedGate)
      ]);
      setRequirements(reqs);
      setEvidenceRecords(evs);
      setGateEvaluation(gate);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (changeId) loadData();
  }, [changeId, selectedGate]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.uploadEvidence(
        changeId,
        {
          requirement_id: targetReqId,
          evidence_type: evidenceType,
          source_reference: sourceRef,
          document_revision: docRevision,
          file_name: fileName,
          notes
        },
        currentUser?.id || 'usr-lead-eng'
      );
      setShowUploadModal(false);
      setSourceRef('');
      setFileName('');
      setNotes('');
      await loadData();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvidence) return;
    try {
      await api.verifyEvidence(
        selectedEvidence.id,
        verifyStatus,
        currentUser?.id || 'usr-qa-mgr',
        verifyNotes
      );
      setShowVerifyModal(false);
      setSelectedEvidence(null);
      setVerifyNotes('');
      await loadData();
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    }
  };

  // Parse gate checks, reasons, and actions
  const checksList = React.useMemo(() => {
    if (!gateEvaluation) return [];
    try {
      return JSON.parse(gateEvaluation.details_json);
    } catch {
      return [];
    }
  }, [gateEvaluation]);

  const blockingReasons = React.useMemo(() => {
    if (!gateEvaluation) return [];
    try {
      return JSON.parse(gateEvaluation.blocking_reasons_json);
    } catch {
      return [];
    }
  }, [gateEvaluation]);

  const correctiveActions = React.useMemo(() => {
    if (!gateEvaluation) return [];
    try {
      return JSON.parse(gateEvaluation.corrective_actions_json);
    } catch {
      return [];
    }
  }, [gateEvaluation]);

  return (
    <div className="space-y-6">
      {/* Top Header & Gate Selector */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-sm/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold text-gray-900">
              Explainable Quality Gates & Verification Evidence
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Strict gate rule enforcement with mandatory evidence verification, baseline consistency checks, and separation-of-duties.
          </p>
        </div>

        {/* Gate Stage Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Quality Gate:</label>
          <select
            value={selectedGate}
            onChange={(e) => setSelectedGate(e.target.value)}
            className="bg-[#1A2338] text-gray-800 border border-gray-200 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-red-500"
          >
            <option value="PRE_AUTHORIZATION_GATE">Gate 1: Pre-Authorization Gate</option>
            <option value="PRE_IMPLEMENTATION_GATE">Gate 2: Pre-Implementation Gate</option>
            <option value="CLOSURE_GATE">Gate 3: Closure & Final Buy-Off Gate</option>
          </select>
        </div>
      </div>

      {/* Quality Gate Status Banner Card */}
      {gateEvaluation && (
        <div className={`p-5 rounded-lg border shadow-sm ${
          gateEvaluation.overall_result === 'PASS' ? 'bg-emerald-950/20 border-emerald-900/60' :
          gateEvaluation.overall_result === 'BLOCKED' ? 'bg-red-950/25 border-red-900/60' :
          'bg-amber-950/20 border-amber-900/60'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="text-[10px] font-mono uppercase text-gray-500">
                Gate Milestone Evaluation
              </div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mt-0.5">
                {selectedGate.replace(/_/g, ' ')}
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                  gateEvaluation.overall_result === 'PASS' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                  gateEvaluation.overall_result === 'BLOCKED' ? 'bg-red-950 text-red-300 border-red-800' :
                  'bg-amber-950 text-amber-300 border-amber-800'
                }`}>
                  STATUS: {gateEvaluation.overall_result}
                </span>
              </h3>
            </div>

            <div className="text-xs font-mono text-gray-500">
              Evaluated by: <span className="text-gray-800">{gateEvaluation.evaluated_by_id || 'System Gate Engine'}</span>
            </div>
          </div>

          {/* Blocking Reasons & Corrective Actions */}
          {gateEvaluation.overall_result === 'BLOCKED' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Blocking Reasons */}
              <div className="p-3 rounded bg-gray-50 border border-red-900/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Why Progression is Blocked ({blockingReasons.length} Unmet Conditions)
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700 list-disc list-inside">
                  {blockingReasons.map((reason: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Corrective Actions */}
              <div className="p-3 rounded bg-gray-50 border border-amber-900/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-amber-500" />
                  Required Corrective Actions to Unblock
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700 list-disc list-inside">
                  {correctiveActions.map((action: string, idx: number) => (
                    <li key={idx} className="leading-relaxed text-amber-200/90 font-medium">
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Evaluated Checks Breakdown */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-[10px] font-mono uppercase text-gray-500 mb-2">
              Individual Condition Evaluations ({checksList.length} Checks Tested)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {checksList.map((chk: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded bg-gray-50 border border-gray-200 flex items-start gap-2.5">
                  {chk.result === 'PASS' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : chk.result === 'BLOCKED' ? (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-gray-800 flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-gray-500">{chk.check_id}</span>
                      {chk.title}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{chk.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Verification Requirements Checklist Table */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm/80 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
              Mandatory Verification Requirements & Evidence Records
            </h4>
            <p className="text-[11px] text-gray-500">
              All mandatory requirements must have accepted, verified evidence documents to satisfy quality gates.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 uppercase text-[10px]">
                <th className="py-2.5 px-3">Req ID & Code</th>
                <th className="py-2.5 px-3">Requirement Title</th>
                <th className="py-2.5 px-3">Acceptance Criteria</th>
                <th className="py-2.5 px-3">Mandatory</th>
                <th className="py-2.5 px-3">Evidence Document</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {requirements.map((req) => {
                const linkedEv = evidenceRecords.find((e) => e.requirement_id === req.id);
                return (
                  <tr key={req.id} className="hover:bg-gray-100 text-gray-800/30 transition">
                    <td className="py-3 px-3 font-mono font-bold text-gray-800">
                      {req.id}
                      <div className="text-[10px] text-gray-500 font-normal">{req.requirement_code || req.target_object_id}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-800">{req.title}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                        Rule: {req.applicability_rule || req.source_rule}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-700 text-[11px] max-w-xs">
                      {req.acceptance_criteria}
                    </td>
                    <td className="py-3 px-3">
                      {req.mandatory ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                          MANDATORY
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-gray-500">
                          OPTIONAL
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {linkedEv ? (
                        <div className="space-y-0.5 font-mono text-[10px]">
                          <div className="font-bold text-gray-800 truncate max-w-xs">
                            {linkedEv.file_name}
                          </div>
                          <div className="text-gray-500 flex items-center gap-1">
                            <Hash className="w-2.5 h-2.5" />
                            {linkedEv.file_hash.slice(0, 12)}...
                          </div>
                          <div className="text-gray-400">{linkedEv.source_reference}</div>
                        </div>
                      ) : (
                        <span className="text-red-400 text-xs font-mono">No evidence submitted</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {linkedEv ? (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          linkedEv.verification_status === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                          linkedEv.verification_status === 'REJECTED' ? 'bg-red-950 text-red-300 border-red-800' :
                          'bg-amber-950 text-amber-300 border-amber-800'
                        }`}>
                          {linkedEv.verification_status}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                          MISSING
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      {!linkedEv && (
                        <button
                          onClick={() => {
                            setTargetReqId(req.id);
                            setShowUploadModal(true);
                          }}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium transition shadow-sm"
                        >
                          Upload Evidence
                        </button>
                      )}
                      {linkedEv && linkedEv.verification_status !== 'ACCEPTED' && (
                        <button
                          onClick={() => {
                            setSelectedEvidence(linkedEv);
                            setShowVerifyModal(true);
                          }}
                          className="px-2.5 py-1 bg-[#1E293B] hover:bg-[#334155] text-gray-800 rounded text-xs border border-gray-200 transition"
                        >
                          QA Review
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Evidence Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-500" />
              Register Engineering Verification Evidence
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Target Requirement</label>
                <input
                  type="text"
                  disabled
                  value={targetReqId}
                  className="w-full bg-[#121824] text-gray-500 border border-gray-200 rounded px-3 py-1.5 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Evidence Type</label>
                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                    className="w-full bg-[#1A2338] text-gray-800 border border-gray-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-red-500"
                  >
                    <option value="TEST_REPORT">TEST_REPORT</option>
                    <option value="MATERIAL_CERT_CMTR">MATERIAL_CERT_CMTR</option>
                    <option value="INSPECTION_RECORD">INSPECTION_RECORD</option>
                    <option value="CALIBRATION_CERT">CALIBRATION_CERT</option>
                    <option value="FEA_SIMULATION">FEA_SIMULATION</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Document Revision</label>
                  <input
                    type="text"
                    required
                    value={docRevision}
                    onChange={(e) => setDocRevision(e.target.value)}
                    className="w-full bg-[#1A2338] text-gray-800 border border-gray-200 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">File Name</label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. Proof_Pressure_Test_T501_Certified.pdf"
                  className="w-full bg-[#1A2338] text-gray-800 border border-gray-200 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Source Reference / Certificate Number</label>
                <input
                  type="text"
                  required
                  value={sourceRef}
                  onChange={(e) => setSourceRef(e.target.value)}
                  placeholder="e.g. Lab Certificate CERT-2026-T501-A99"
                  className="w-full bg-[#1A2338] text-gray-800 border border-gray-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Technical Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Calibrated tooling serial numbers, laboratory accreditation references..."
                  className="w-full bg-[#1A2338] text-gray-800 border border-gray-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-gray-700 rounded text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-xs transition shadow-sm"
                >
                  Register Evidence & Hash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QA Verification Modal */}
      {showVerifyModal && selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Independent QA Verification Review
            </h3>

            <div className="p-3 rounded bg-gray-50 border border-gray-200 text-xs space-y-1 font-mono">
              <div className="text-gray-500">File: <span className="text-gray-800 font-bold">{selectedEvidence.file_name}</span></div>
              <div className="text-gray-500">Source: <span className="text-gray-800">{selectedEvidence.source_reference}</span></div>
              <div className="text-gray-500">Hash: <span className="text-gray-500">{selectedEvidence.file_hash.slice(0, 16)}...</span></div>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Verification Decision</label>
                <select
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value as 'ACCEPTED' | 'REJECTED')}
                  className="w-full bg-[#1A2338] text-gray-800 border border-gray-200 rounded px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-red-500"
                >
                  <option value="ACCEPTED">ACCEPTED (Conforming Evidence)</option>
                  <option value="REJECTED">REJECTED (Non-conforming / Deficient)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">QA Review Notes</label>
                <textarea
                  required
                  rows={2}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Document the technical justification and laboratory certificate audit findings..."
                  className="w-full bg-[#1A2338] text-gray-800 border border-gray-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-gray-700 rounded text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 text-white font-medium rounded text-xs transition shadow-sm ${
                    verifyStatus === 'ACCEPTED' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  Submit QA Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
