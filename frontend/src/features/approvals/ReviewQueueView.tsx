import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  ShieldCheck,
  AlertOctagon,
  CornerDownLeft,
  ArrowRight,
  Clock,
  History,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { api, ChangeRequest, WorkflowEvent, Approval, User } from '../../api/client';

interface ReviewQueueProps {
  changeId: string;
  currentUser: User | null;
  onRefresh: () => void;
}

export const ReviewQueueView: React.FC<ReviewQueueProps> = ({ changeId, currentUser, onRefresh }) => {
  const [change, setChange] = useState<ChangeRequest | null>(null);
  const [auditEvents, setAuditEvents] = useState<WorkflowEvent[]>([]);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'RETURNED_FOR_REVISION'>('APPROVED');
  const [rationale, setRationale] = useState('');
  const [targetState, setTargetState] = useState('');
  const [transitionReason, setTransitionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cr, events] = await Promise.all([
        api.getChangeRequest(changeId),
        api.getAuditTrail(changeId)
      ]);
      setChange(cr);
      setAuditEvents(events);
      setActionError(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (changeId) loadData();
  }, [changeId]);

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!currentUser) {
      setActionError("No active user selected.");
      return;
    }

    try {
      await api.submitDecision(changeId, {
        reviewer_id: currentUser.id,
        decision,
        rationale
      });
      setActionSuccess(`Successfully submitted review decision: ${decision}.`);
      setRationale('');
      await loadData();
      onRefresh();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!currentUser) {
      setActionError("No active user selected.");
      return;
    }

    if (!targetState) {
      setActionError("Please select a target workflow state.");
      return;
    }

    try {
      const res = await api.transitionState(changeId, {
        actor_id: currentUser.id,
        target_state: targetState,
        reason: transitionReason || `Workflow transition to ${targetState} initiated by ${currentUser.display_name}.`
      });
      setActionSuccess(res.message);
      setTransitionReason('');
      await loadData();
      onRefresh();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const allowedTargetStates: { [key: string]: string[] } = {
    DRAFT: ['SUBMITTED', 'CANCELLED'],
    SUBMITTED: ['IMPACT_ASSESSED', 'RETURNED_FOR_REVISION', 'CANCELLED'],
    IMPACT_ASSESSED: ['UNDER_REVIEW', 'RETURNED_FOR_REVISION', 'CANCELLED'],
    UNDER_REVIEW: ['AUTHORIZED', 'RETURNED_FOR_REVISION', 'REJECTED', 'CANCELLED'],
    AUTHORIZED: ['IMPLEMENTATION', 'CANCELLED'],
    IMPLEMENTATION: ['POST_VERIFICATION', 'RETURNED_FOR_REVISION'],
    POST_VERIFICATION: ['CLOSED', 'RETURNED_FOR_REVISION'],
    CLOSED: ['REOPENED'],
    REJECTED: ['REOPENED'],
    RETURNED_FOR_REVISION: ['SUBMITTED', 'CANCELLED']
  };

  const currentAllowed = change ? (allowedTargetStates[change.state] || []) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Review Queue, Governance & Separation of Duties
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Strict separation-of-duties enforcement (AC-05): Requesters cannot approve their own changes; Auditors have read-only permissions.
            </p>
          </div>
        </div>

        {/* Current Acting Persona Info */}
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3 text-xs self-start md:self-auto">
          <UserCheck className="w-4 h-4 text-blue-600" />
          <div>
            <div className="font-semibold text-gray-900">{currentUser?.display_name}</div>
            <div className="text-[11px] font-mono text-gray-500">
              Role: <span className="text-blue-700 font-semibold">{currentUser?.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Messages */}
      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
          <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Action Blocked:</span> {actionError}
          </div>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Success:</span> {actionSuccess}
          </div>
        </div>
      )}

      {change && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Formal Review Decision Card */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Submit Formal Review Decision
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Authorized Approvers and Quality Leads record binding engineering sign-offs.
              </p>
            </div>

            <form onSubmit={handleSubmitDecision} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1.5">Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('APPROVED')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                      decision === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    APPROVED
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('RETURNED_FOR_REVISION')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                      decision === 'RETURNED_FOR_REVISION'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    REVISE
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('REJECTED')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                      decision === 'REJECTED'
                        ? 'bg-red-50 text-red-800 border-red-300 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    REJECTED
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Mandatory Technical Rationale</label>
                <textarea
                  required
                  rows={3}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Document the technical justification, test report compliance, or failure mode concerns..."
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Separation of Duties Notice if user is requester */}
              {currentUser?.id === change.requester_id && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Separation of Duties Notice:</span> You are logged in as the author ({currentUser.display_name}). System will block you from approving your own change request.
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs rounded-lg transition shadow-sm"
              >
                Record Review Decision
              </button>
            </form>
          </div>

          {/* Workflow State Machine Transition Controls */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600" />
                Workflow State Machine Transitions
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Current State: <span className="font-mono text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">{change.state}</span>
              </p>
            </div>

            <form onSubmit={handleTransition} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Permitted Target States</label>
                {currentAllowed.length > 0 ? (
                  <select
                    value={targetState}
                    onChange={(e) => setTargetState(e.target.value)}
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select target state...</option>
                    {currentAllowed.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 text-xs">
                    No further transitions available from terminal state '{change.state}'.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Transition Reason / Traveler Reference</label>
                <input
                  type="text"
                  value={transitionReason}
                  onChange={(e) => setTransitionReason(e.target.value)}
                  placeholder="e.g. Advancing to UNDER_REVIEW following impact analysis completion"
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 space-y-1">
                <div className="font-semibold text-gray-800">Gate Pre-conditions:</div>
                <div>Transitioning to <code className="text-blue-700 font-mono">AUTHORIZED</code> evaluates Gate 1 (Pre-Authorization).</div>
                <div>Transitioning to <code className="text-emerald-700 font-mono">CLOSED</code> evaluates Gate 3 (Closure Buy-Off).</div>
              </div>

              <button
                type="submit"
                disabled={!targetState}
                className="w-full py-2 bg-white hover:bg-gray-50 text-gray-800 font-medium text-xs rounded-lg border border-gray-200 transition shadow-sm disabled:opacity-50"
              >
                Execute State Transition
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Chronological Append-Only Audit Trail */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-gray-500" />
              Chronological Append-Only Governance Audit Trail (AC-07)
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Immutable application event stream recording all workflow transitions, decisions, and evidence uploads.
            </p>
          </div>
          <span className="text-xs font-mono text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200 self-start sm:self-auto">
            {auditEvents.length} events logged
          </span>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-[11px]">
                <th className="py-3 px-3.5">Timestamp (UTC)</th>
                <th className="py-3 px-3.5">Actor & Role</th>
                <th className="py-3 px-3.5">Action</th>
                <th className="py-3 px-3.5">State Transition</th>
                <th className="py-3 px-3.5 w-1/3">Justification & Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {auditEvents.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/70 transition">
                  <td className="py-3.5 px-3.5 font-mono text-[11px] text-gray-500">
                    {e.timestamp ? new Date(e.timestamp).toISOString().replace('T', ' ').slice(0, 19) : '—'}
                  </td>
                  <td className="py-3.5 px-3.5">
                    <div className="font-semibold text-gray-900">{e.actor_id}</div>
                    <div className="text-[10px] font-mono text-gray-500">{e.actor_role}</div>
                  </td>
                  <td className="py-3.5 px-3.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                      {e.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 font-mono text-[11px] text-gray-700">
                    {e.previous_state} &rarr; <span className="font-bold text-blue-700">{e.new_state}</span>
                  </td>
                  <td className="py-3.5 px-3.5 text-gray-600 text-[11px] leading-relaxed">
                    {e.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
