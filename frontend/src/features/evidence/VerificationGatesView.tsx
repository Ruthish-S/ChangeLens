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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Gate Selector */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Evidence-Gated Quality Gates & Verification
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Cryptographic evidence verification, torque logs, and physical inspection locks preventing unverified assembly release.
            </p>
          </div>
        </div>

        {/* Gate Stage Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Milestone Gate:</label>
          <select
            value={selectedGate}
            onChange={(e) => setSelectedGate(e.target.value)}
            className="bg-gray-50 text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="PRE_AUTHORIZATION_GATE">Gate 1: Pre-Authorization Gate</option>
            <option value="PRE_IMPLEMENTATION_GATE">Gate 2: Pre-Implementation Gate</option>
            <option value="CLOSURE_GATE">Gate 3: Closure & Final Buy-Off Gate</option>
          </select>
        </div>
      </div>

      {/* Quality Gate Status Banner Card */}
      {gateEvaluation && (
        <div className={`p-6 rounded-2xl border shadow-sm ${
          gateEvaluation.overall_result === 'PASS' 
            ? 'bg-emerald-50/50 border-emerald-200' 
            : gateEvaluation.overall_result === 'BLOCKED' 
            ? 'bg-red-50/50 border-red-200' 
            : 'bg-amber-50/50 border-amber-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200/80">
            <div>
              <div className="text-[10px] font-mono uppercase font-semibold text-gray-500">
                Milestone Gate Evaluation
              </div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2.5 mt-0.5">
                {selectedGate.replace(/_/g, ' ')}
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  gateEvaluation.overall_result === 'PASS' 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                    : gateEvaluation.overall_result === 'BLOCKED' 
                    ? 'bg-red-100 text-red-800 border-red-200' 
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}>
                  STATUS: {gateEvaluation.overall_result}
                </span>
              </h3>
            </div>

            <div className="text-xs text-gray-500">
              Evaluated by: <span className="font-semibold text-gray-800">{gateEvaluation.evaluated_by_id || 'System Gate Engine'}</span>
            </div>
          </div>

          {/* Blocking Reasons & Corrective Actions */}
          {gateEvaluation.overall_result === 'BLOCKED' && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Blocking Reasons */}
              <div className="p-4 rounded-xl bg-white border border-red-200 shadow-xs space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
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
              <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-xs space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                  Required Corrective Actions to Unblock
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700 list-disc list-inside">
                  {correctiveActions.map((action: string, idx: number) => (
                    <li key={idx} className="leading-relaxed font-medium text-amber-900">
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Evaluated Checks Breakdown */}
          <div className="mt-5 pt-4 border-t border-gray-200/80">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2.5">
              Individual Condition Evaluations ({checksList.length} Checks Tested)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              {checksList.map((chk: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs flex items-start gap-2.5">
                  {chk.result === 'PASS' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : chk.result === 'BLOCKED' ? (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-1.5">
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
      <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Mandatory Verification Requirements & Evidence Records
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Every mandatory item must have signed, verified evidence documents to satisfy quality gate release criteria.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-[11px]">
                <th className="py-3 px-3.5">Req ID & Code</th>
                <th className="py-3 px-3.5">Requirement Title</th>
                <th className="py-3 px-3.5">Acceptance Criteria</th>
                <th className="py-3 px-3.5">Mandatory</th>
                <th className="py-3 px-3.5">Evidence Document</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requirements.map((req) => {
                const linkedEv = evidenceRecords.find((e) => e.requirement_id === req.id);
                return (
                  <tr key={req.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3.5 px-3.5 font-mono font-semibold text-gray-900">
                      {req.id}
                      <div className="text-[10px] text-gray-500 font-normal">{req.requirement_code || req.target_object_id}</div>
                    </td>
                    <td className="py-3.5 px-3.5">
                      <div className="font-semibold text-gray-900">{req.title}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                        Rule: {req.applicability_rule || req.source_rule}
                      </div>
                    </td>
                    <td className="py-3.5 px-3.5 text-gray-600 text-[11px] max-w-xs leading-relaxed">
                      {req.acceptance_criteria}
                    </td>
                    <td className="py-3.5 px-3.5">
                      {req.mandatory ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                          MANDATORY
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          OPTIONAL
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3.5">
                      {linkedEv ? (
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <div className="font-semibold text-gray-900 truncate max-w-xs">
                            {linkedEv.file_name}
                          </div>
                          <div className="text-gray-500 flex items-center gap-1 text-[10px]">
                            <Hash className="w-2.5 h-2.5 text-gray-400" />
                            {linkedEv.file_hash.slice(0, 12)}...
                          </div>
                          <div className="text-gray-400 text-[10px]">{linkedEv.source_reference}</div>
                        </div>
                      ) : (
                        <span className="text-red-600 text-xs font-mono font-medium">No evidence submitted</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3.5">
                      {linkedEv ? (
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                          linkedEv.verification_status === 'ACCEPTED' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : linkedEv.verification_status === 'REJECTED' 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {linkedEv.verification_status}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                          MISSING
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3.5 text-right space-x-2">
                      {!linkedEv && (
                        <button
                          onClick={() => {
                            setTargetReqId(req.id);
                            setShowUploadModal(true);
                          }}
                          className="px-3 py-1 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-lg text-xs font-medium transition shadow-sm"
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
                          className="px-3 py-1 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium border border-gray-200 transition shadow-sm"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              Register Engineering Verification Evidence
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Target Requirement</label>
                <input
                  type="text"
                  disabled
                  value={targetReqId}
                  className="w-full bg-gray-50 text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Evidence Type</label>
                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  placeholder="e.g. Stop_Fitting_Torque_BAC_5001_Log.pdf"
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Source Reference / Certificate Number</label>
                <input
                  type="text"
                  required
                  value={sourceRef}
                  onChange={(e) => setSourceRef(e.target.value)}
                  placeholder="e.g. Calibrated Torque Wrench Log TRQ-2026-99"
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Technical Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Calibrated tooling serial numbers, laboratory accreditation references..."
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium transition shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition shadow-sm"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Independent QA Verification Review
            </h3>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1.5 font-mono">
              <div className="text-gray-500">File: <span className="text-gray-900 font-bold">{selectedEvidence.file_name}</span></div>
              <div className="text-gray-500">Source: <span className="text-gray-800">{selectedEvidence.source_reference}</span></div>
              <div className="text-gray-500">Hash: <span className="text-gray-500">{selectedEvidence.file_hash.slice(0, 20)}...</span></div>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Verification Decision</label>
                <select
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value as 'ACCEPTED' | 'REJECTED')}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium transition shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 text-white font-medium rounded-lg text-xs transition shadow-sm ${
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
