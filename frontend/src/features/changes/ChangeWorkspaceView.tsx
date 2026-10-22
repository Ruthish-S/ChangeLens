import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Network,
  FileCheck2,
  FileSpreadsheet,
  Plus,
  Play,
  ArrowRight,
  Clock,
  Layers,
  FileText,
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api, ChangeRequest, User } from '../../api/client';
import { NavTab } from '../../components/Sidebar';

interface ChangeWorkspaceProps {
  changeId: string;
  onSelectChange: (id: string) => void;
  onNavigate: (tab: NavTab, changeId?: string) => void;
  currentUser: User | null;
}

export const ChangeWorkspaceView: React.FC<ChangeWorkspaceProps> = ({
  changeId,
  onSelectChange,
  onNavigate,
  currentUser
}) => {
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [currentChange, setCurrentChange] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningImpact, setRunningImpact] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newType, setNewType] = useState('MATERIAL_SUBSTITUTION');
  const [newObjectId, setNewObjectId] = useState('C-104');
  const [newField, setNewField] = useState('material_specification');
  const [newBaselineVal, setNewBaselineVal] = useState('Al 7075-T651');
  const [newProposedVal, setNewProposedVal] = useState('Al 2024-T351 Clad');
  const [newJustification, setNewJustification] = useState('Corrosion resistance improvement');

  const loadData = async () => {
    try {
      setLoading(true);
      const list = await api.listChangeRequests();
      setChanges(list);
      const activeId = changeId || (list.length > 0 ? list[0].id : '');
      if (activeId) {
        const detail = await api.getChangeRequest(activeId);
        setCurrentChange(detail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [changeId]);

  const handleRunImpact = async () => {
    if (!currentChange) return;
    try {
      setRunningImpact(true);
      await api.runImpactAnalysis(currentChange.id, currentUser?.id || 'usr-qa-mgr');
      await loadData();
      onNavigate('impact', currentChange.id);
    } catch (err: any) {
      alert(`Impact analysis failed: ${err.message}`);
    } finally {
      setRunningImpact(false);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createChangeRequest({
        title: newTitle,
        reason: newReason,
        change_type: newType,
        requester_id: currentUser?.id || 'usr-lead-eng',
        baseline_id: 'BASE-737-9-DOORPLUG-A',
        priority: 'HIGH',
        change_items: [
          {
            affected_object_id: newObjectId,
            field_name: newField,
            proposed_operation: 'MODIFY',
            current_value: newBaselineVal,
            proposed_value: newProposedVal,
            justification: newJustification
          }
        ]
      });
      setShowNewModal(false);
      onSelectChange(created.id);
      await loadData();
    } catch (err: any) {
      alert(`Failed to create change request: ${err.message}`);
    }
  };

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'AUTHORIZED':
      case 'CLOSED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'UNDER_REVIEW':
      case 'IMPACT_ASSESSED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Engineering Change Orders</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Digital traveler enforcement, side-by-side baseline delta comparison, and automated impact dispatch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Active Order:</label>
            <select
              value={currentChange?.id || ''}
              onChange={(e) => onSelectChange(e.target.value)}
              className="bg-gray-50 text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {changes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-lg text-xs font-medium transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Change Proposal
          </button>
        </div>
      </div>

      {currentChange && (
        <>
          {/* Metadata & Actions Bar */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-sm font-mono font-bold text-gray-900">{currentChange.id}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                    {currentChange.change_type}
                  </span>
                  <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-semibold ${getStateBadge(currentChange.state)}`}>
                    STATE: {currentChange.state}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                    PRIORITY: {currentChange.priority}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{currentChange.title}</h3>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={handleRunImpact}
                  disabled={runningImpact}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs rounded-lg transition shadow-sm disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${runningImpact ? 'animate-spin' : ''}`} />
                  {runningImpact ? 'Traversing Graph...' : 'Run Impact Traversal'}
                </button>
                <button
                  onClick={() => onNavigate('impact', currentChange.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition shadow-sm"
                >
                  <Network className="w-3.5 h-3.5 text-blue-600" />
                  Impact Explorer
                </button>
                <button
                  onClick={() => onNavigate('evidence', currentChange.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition shadow-sm"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                  Quality Gate
                </button>
                <button
                  onClick={() => onNavigate('reports', currentChange.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition shadow-sm"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                  Export Report
                </button>
              </div>
            </div>

            {/* Justification & Context */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-xs">
              <div className="lg:col-span-3">
                <div className="text-gray-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                  Engineering Justification & Operational Problem Statement
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 leading-relaxed font-normal">
                  {currentChange.reason}
                </div>
              </div>

              <div className="space-y-2.5 font-mono text-[11px]">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-gray-400 text-[10px] uppercase font-sans font-medium">Configuration Baseline</div>
                  <div className="text-gray-900 font-bold truncate mt-0.5">{currentChange.baseline_id}</div>
                  <div className="text-gray-500 text-[10px] font-sans">Rev A.1 (Active Airframe)</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-gray-400 text-[10px] uppercase font-sans font-medium">Accountable Requester</div>
                  <div className="text-gray-900 font-bold truncate mt-0.5">
                    {currentChange.requester?.display_name || currentChange.requester_id}
                  </div>
                  <div className="text-gray-500 text-[10px] font-sans">Manufacturing Lead Engineer</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Side-by-side Baseline Comparison Table */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Configuration Baseline Delta Specification
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Field-level difference between released aircraft configuration and proposed physical modification.
                </p>
              </div>
              <span className="text-xs font-mono text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200 self-start sm:self-auto">
                {currentChange.change_items.length} modification deltas
              </span>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-[11px]">
                    <th className="py-3 px-3.5">Affected Item</th>
                    <th className="py-3 px-3.5">Field Name</th>
                    <th className="py-3 px-3.5">Operation</th>
                    <th className="py-3 px-3.5 w-1/4">Baseline Specification</th>
                    <th className="py-3 px-3.5 w-1/4">Proposed Modification</th>
                    <th className="py-3 px-3.5">Engineering Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentChange.change_items.map((ci) => (
                    <tr key={ci.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3.5 px-3.5 font-mono font-semibold text-gray-900">
                        {ci.affected_object_id}
                      </td>
                      <td className="py-3.5 px-3.5 font-mono text-gray-600">
                        {ci.field_name}
                      </td>
                      <td className="py-3.5 px-3.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                          {ci.proposed_operation}
                        </span>
                      </td>
                      {/* Baseline Value */}
                      <td className="py-3.5 px-3.5">
                        <div className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 font-mono text-[11px]">
                          {ci.current_value}
                        </div>
                      </td>
                      {/* Proposed Modification (Diff Styling) */}
                      <td className="py-3.5 px-3.5">
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-mono text-[11px] font-medium">
                          {ci.proposed_value}
                        </div>
                      </td>
                      <td className="py-3.5 px-3.5 text-gray-600 text-[11px] leading-relaxed">
                        {ci.justification || 'Standard revision cycle'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* New Change Request Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Create Engineering Change Proposal
            </h3>
            <form onSubmit={handleCreateNew} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Proposal Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Mid-Exit Door Plug Stop Fitting Alignment & Shim Update"
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Engineering Justification</label>
                <textarea
                  required
                  rows={3}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Detail the root cause, defect history, or regulatory oversight directive requiring this change..."
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Change Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="MATERIAL_SUBSTITUTION">MATERIAL_SUBSTITUTION</option>
                    <option value="FASTENER_REVISION">FASTENER_REVISION</option>
                    <option value="PROCESS_CHANGE">PROCESS_CHANGE</option>
                    <option value="DESIGN_REVISION">DESIGN_REVISION</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Target Object ID</label>
                  <input
                    type="text"
                    required
                    value={newObjectId}
                    onChange={(e) => setNewObjectId(e.target.value)}
                    className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Proposed Value</label>
                <input
                  type="text"
                  required
                  value={newProposedVal}
                  onChange={(e) => setNewProposedVal(e.target.value)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium transition shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium rounded-lg text-xs transition shadow-sm"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
