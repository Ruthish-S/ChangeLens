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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-slate-100">
              Review Queue, Governance & Separation of Duties
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict separation-of-duties enforcement (AC-05): Requesters cannot approve their own changes; Auditors have read-only permissions.
          </p>
        </div>

        {/* Current Acting Persona Info */}
        <div className="p-2.5 rounded bg-[#121A2E] border border-slate-700/80 flex items-center gap-3 text-xs">
          <UserCheck className="w-4 h-4 text-red-400" />
          <div>
            <div className="font-bold text-slate-200">{currentUser?.display_name}</div>
            <div className="text-[10px] font-mono text-slate-400">
              Role: <span className="text-red-400 font-semibold">{currentUser?.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Messages */}
      {actionError && (
        <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-start gap-2.5">
          <AlertOctagon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Action Rejected:</span> {actionError}
          </div>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-200 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Success:</span> {actionSuccess}
          </div>
        </div>
      )}

      {change && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Formal Review Decision Card */}
          <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Submit Formal Review Decision
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Authorized Approvers and Quality Leads record binding engineering decisions.
              </p>
            </div>

            <form onSubmit={handleSubmitDecision} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('APPROVED')}
                    className={`py-2 px-3 rounded text-xs font-bold border transition ${
                      decision === 'APPROVED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                        : 'bg-[#1A2338] text-slate-400 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    APPROVED
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('RETURNED_FOR_REVISION')}
                    className={`py-2 px-3 rounded text-xs font-bold border transition ${
                      decision === 'RETURNED_FOR_REVISION'
                        ? 'bg-amber-950 text-amber-300 border-amber-600'
                        : 'bg-[#1A2338] text-slate-400 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    REVISE
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('REJECTED')}
                    className={`py-2 px-3 rounded text-xs font-bold border transition ${
                      decision === 'REJECTED'
                        ? 'bg-red-950 text-red-300 border-red-600'
                        : 'bg-[#1A2338] text-slate-400 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    REJECTED
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Mandatory Technical Rationale</label>
                <textarea
                  required
                  rows={3}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Document the technical justification, test report compliance, or failure mode concerns..."
                  className="w-full bg-[#1A2338] text-slate-200 border border-slate-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Separation of Duties Warning if user is requester */}
              {currentUser?.id === change.requester_id && (
                <div className="p-2.5 rounded bg-red-950/20 border border-red-900/60 text-[11px] text-red-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Separation of Duties Notice:</span> You are logged in as the author ({currentUser.display_name}). You cannot approve your own change request.
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium text-xs rounded transition shadow"
              >
                Record Review Decision
              </button>
            </form>
          </div>

          {/* Workflow State Machine Transition Controls */}
          <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-400" />
                Workflow State Machine Transitions
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Current State: <span className="font-mono text-amber-400 font-bold">{change.state}</span>
              </p>
            </div>

            <form onSubmit={handleTransition} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Permitted Target States</label>
                {currentAllowed.length > 0 ? (
                  <select
                    value={targetState}
                    onChange={(e) => setTargetState(e.target.value)}
                    className="w-full bg-[#1A2338] text-slate-200 border border-slate-700 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-red-500"
                  >
                    <option value="">Select target state...</option>
                    {currentAllowed.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 rounded bg-slate-800 text-slate-400 text-xs">
                    No further transitions available from terminal state '{change.state}'.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Transition Reason / Traveler Reference</label>
                <input
                  type="text"
                  value={transitionReason}
                  onChange={(e) => setTransitionReason(e.target.value)}
                  placeholder="e.g. Advancing to UNDER_REVIEW following impact analysis completion"
                  className="w-full bg-[#1A2338] text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="p-2.5 rounded bg-[#0B0F17] border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-slate-300">Gate Pre-conditions:</div>
                <div>Transitioning to <code className="text-red-400">AUTHORIZED</code> evaluates Gate 1 (Pre-Authorization).</div>
                <div>Transitioning to <code className="text-emerald-400">CLOSED</code> evaluates Gate 3 (Closure).</div>
              </div>

              <button
                type="submit"
                disabled={!targetState}
                className="w-full py-2 bg-[#1E293B] hover:bg-[#334155] text-slate-200 font-medium text-xs rounded border border-slate-700 transition disabled:opacity-50"
              >
                Execute State Transition
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Chronological Append-Only Audit Trail */}
      <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B]">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-400" />
              Chronological Append-Only Governance Audit Trail (AC-07)
            </h4>
            <p className="text-[11px] text-slate-400">
              Immutable application event stream recording all workflow transitions, decisions, and evidence uploads.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            {auditEvents.length} events logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Actor & Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">State Transition</th>
                <th className="py-2.5 px-3 w-1/3">Justification & Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {auditEvents.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                    {e.timestamp ? new Date(e.timestamp).toISOString().replace('T', ' ').slice(0, 19) : '—'}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-200">{e.actor_id}</div>
                    <div className="text-[10px] font-mono text-slate-400">{e.actor_role}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {e.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                    {e.previous_state} &rarr; <span className="font-bold text-amber-400">{e.new_state}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 text-[11px]">
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
