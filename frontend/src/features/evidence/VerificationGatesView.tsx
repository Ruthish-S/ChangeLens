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
  Plus,
  ArrowRight,
  ShieldAlert,
  Lock
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

  const gateMilestones = [
    { id: 'PRE_AUTHORIZATION_GATE', step: 'Gate 1', title: 'Pre-Authorization', desc: 'Requirements & Scope Sign-off' },
    { id: 'PRE_IMPLEMENTATION_GATE', step: 'Gate 2', title: 'Pre-Implementation', desc: 'Tooling Calibration & Traveler' },
    { id: 'CLOSURE_GATE', step: 'Gate 3', title: 'Closure & Buy-Off', desc: 'Torque Logs & Level II QA Stamp' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Top Header */}
      <div className="p-7 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Evidence-Gated Quality Verification Gates
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Strict gate rule enforcement with cryptographic SHA-256 evidence validation, torque logs, and physical inspection locks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            Change Order: {changeId}
          </span>
        </div>
      </div>

      {/* Interactive Milestone Gate Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {gateMilestones.map((gm) => {
          const isSelected = selectedGate === gm.id;
          return (
            <button
              key={gm.id}
              onClick={() => setSelectedGate(gm.id)}
              className={`p-4 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#0071E3] shadow-sm ring-1 ring-[#0071E3]/20'
                  : 'bg-white/80 hover:bg-white border-gray-200/80 shadow-2xs text-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isSelected ? 'text-[#0071E3]' : 'text-gray-400'
                }`}>
                  {gm.step}
                </span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-[#0071E3]" />}
              </div>
              <div className="font-semibold text-xs text-gray-900">
                {gm.title}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {gm.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quality Gate Status Banner Card */}
      {gateEvaluation && (
        <div className={`p-7 rounded-3xl border shadow-xs transition-all ${
          gateEvaluation.overall_result === 'PASS' 
            ? 'bg-emerald-50/40 border-emerald-200' 
            : gateEvaluation.overall_result === 'BLOCKED' 
            ? 'bg-red-50/40 border-red-200' 
            : 'bg-amber-50/40 border-amber-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200/70">
            <div>
              <div className="text-[10px] font-mono uppercase font-semibold text-gray-400">
                Active Gate Milestone Assessment
              </div>
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3 mt-1">
                {selectedGate.replace(/_/g, ' ')}
                <span className={`text-xs font-mono font-bold px-3 py-0.5 rounded-full border ${
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

            <div className="text-xs text-gray-500 font-mono">
              Evaluator: <span className="font-semibold text-gray-800">{gateEvaluation.evaluated_by_id || 'System Gate Engine'}</span>
            </div>
          </div>

          {/* Blocking Reasons & Corrective Actions */}
          {gateEvaluation.overall_result === 'BLOCKED' && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Blocking Reasons */}
              <div className="p-5 rounded-2xl bg-white border border-red-200 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-red-700 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Why Progression is Locked ({blockingReasons.length} Unmet Conditions)
                </div>
                <ul className="space-y-2 text-xs text-gray-700 list-disc list-inside">
                  {blockingReasons.map((reason: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Corrective Actions */}
              <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                  Required Actions to Satisfy Quality Gate
                </div>
                <ul className="space-y-2 text-xs text-gray-700 list-disc list-inside">
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
          <div className="mt-6 pt-5 border-t border-gray-200/70">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Automated Rule Evaluation Checklist ({checksList.length} Conditions Evaluated)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {checksList.map((chk: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-2xs flex items-start gap-3">
                  {chk.result === 'PASS' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : chk.result === 'BLOCKED' ? (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="font-mono text-[10px] text-gray-400">{chk.check_id}</span>
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
      <div className="p-7 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Mandatory Verification Requirements &amp; Evidence Records
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              All mandatory physical artifacts must be registered and verified by an authorized Level II QA inspector before aircraft release.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-400 uppercase text-[10px] font-medium tracking-wider">
                <th className="py-3 px-3.5">Req ID &amp; Code</th>
                <th className="py-3 px-3.5">Requirement Title</th>
                <th className="py-3 px-3.5">Acceptance Criteria</th>
                <th className="py-3 px-3.5">Severity</th>
                <th className="py-3 px-3.5">Evidence Record</th>
                <th className="py-3 px-3.5">Verification</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requirements.map((req) => {
                const linkedEv = evidenceRecords.find((e) => e.requirement_id === req.id);
                return (
                  <tr key={req.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-3.5 font-mono font-semibold text-gray-900">
                      {req.id}
                      <div className="text-[10px] text-gray-400 font-normal">{req.requirement_code || req.target_object_id}</div>
                    </td>
                    <td className="py-3.5 px-3.5">
                      <div className="font-semibold text-gray-900">{req.title}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
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
                          <div className="text-gray-400 flex items-center gap-1 text-[10px]">
                            <Hash className="w-2.5 h-2.5" />
                            {linkedEv.file_hash.slice(0, 16)}...
                          </div>
                          <div className="text-gray-400 text-[10px]">{linkedEv.source_reference}</div>
                        </div>
                      ) : (
                        <span className="text-red-600 text-xs font-mono font-medium">Missing Artifact</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3.5">
                      {linkedEv ? (
                        <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                          linkedEv.verification_status === 'ACCEPTED' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : linkedEv.verification_status === 'REJECTED' 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {linkedEv.verification_status}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                          UNVERIFIED
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
                          className="px-3 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs font-medium transition shadow-2xs"
                        >
                          Upload Proof
                        </button>
                      )}
                      {linkedEv && linkedEv.verification_status !== 'ACCEPTED' && (
                        <button
                          onClick={() => {
                            setSelectedEvidence(linkedEv);
                            setShowVerifyModal(true);
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-medium border border-gray-200 transition shadow-2xs"
                        >
                          QA Stamp
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
          <div className="bg-white border border-gray-200 rounded-3xl max-w-lg w-full p-7 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#0071E3]" />
              Register Engineering Verification Evidence
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Target Requirement</label>
                <input
                  type="text"
                  disabled
                  value={targetReqId}
                  className="w-full bg-gray-50 text-gray-600 border border-gray-200 rounded-xl px-3 py-2 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Evidence Type</label>
                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0071E3]"
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
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0071E3]"
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
                  placeholder="e.g. Fuselage_DoorPlug_Torque_BAC_5001_Log.pdf"
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Source Reference / Serial Number</label>
                <input
                  type="text"
                  required
                  value={sourceRef}
                  onChange={(e) => setSourceRef(e.target.value)}
                  placeholder="e.g. Snap-on Digital Torque Wrench S/N CAL-737-0091"
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Technical Notes &amp; Observations</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Calibrated tooling serial numbers, laboratory accreditation references..."
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-medium transition shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium rounded-xl text-xs transition shadow-sm"
                >
                  Register Evidence &amp; Hash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QA Verification Modal */}
      {showVerifyModal && selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-7 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0071E3]" />
              Independent QA Stamp &amp; Buy-Off
            </h3>

            <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-gray-200 text-xs space-y-1.5 font-mono">
              <div className="text-gray-500">File: <span className="text-gray-900 font-bold">{selectedEvidence.file_name}</span></div>
              <div className="text-gray-500">Source: <span className="text-gray-800">{selectedEvidence.source_reference}</span></div>
              <div className="text-gray-500">SHA-256: <span className="text-gray-500">{selectedEvidence.file_hash.slice(0, 20)}...</span></div>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Inspector Decision</label>
                <select
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value as 'ACCEPTED' | 'REJECTED')}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0071E3]"
                >
                  <option value="ACCEPTED">ACCEPTED (Conforming Artifact)</option>
                  <option value="REJECTED">REJECTED (Deficient / Non-conforming)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Quality Review Audit Notes</label>
                <textarea
                  required
                  rows={2}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Document the technical justification and laboratory certificate audit findings..."
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-medium transition shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white font-medium rounded-xl text-xs transition shadow-sm ${
                    verifyStatus === 'ACCEPTED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Apply QA Stamp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
