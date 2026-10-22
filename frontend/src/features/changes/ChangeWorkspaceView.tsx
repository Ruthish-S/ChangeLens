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
  AlertCircle
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

  return (
    <div className="space-y-6">
      {/* Top Header & Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-200/80 shadow-sm/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-950/60 border border-red-800 text-red-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Engineering Change Workspace</h2>
            <p className="text-xs text-gray-500">
              Side-by-side baseline revision comparison, proposed delta definition, and traversal dispatch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Select Change:</label>
            <select
              value={currentChange?.id || ''}
              onChange={(e) => onSelectChange(e.target.value)}
              className="bg-[#1A2338] text-gray-800 border border-gray-200 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-red-500"
            >
              {changes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.title.slice(0, 35)}...
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Change Proposal
          </button>
        </div>
      </div>

      {currentChange && (
        <>
          {/* Metadata & Actions Bar */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm/80 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono font-bold text-red-400">{currentChange.id}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-gray-700 border border-gray-200">
                    {currentChange.change_type}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-semibold">
                    STATE: {currentChange.state}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{currentChange.title}</h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRunImpact}
                  disabled={runningImpact}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium text-xs rounded transition shadow"
                >
                  <Play className={`w-3.5 h-3.5 ${runningImpact ? 'animate-spin' : ''}`} />
                  {runningImpact ? 'Traversing Graph...' : 'Run Impact Traversal'}
                </button>
                <button
                  onClick={() => onNavigate('impact', currentChange.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#1E293B] hover:bg-[#334155] text-gray-800 text-xs rounded border border-gray-200 transition"
                >
                  <Network className="w-3.5 h-3.5 text-blue-400" />
                  Impact Explorer
                </button>
                <button
                  onClick={() => onNavigate('evidence', currentChange.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#1E293B] hover:bg-[#334155] text-gray-800 text-xs rounded border border-gray-200 transition"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                  Quality Gate
                </button>
                <button
                  onClick={() => onNavigate('reports', currentChange.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#1E293B] hover:bg-[#334155] text-gray-800 text-xs rounded border border-gray-200 transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                  Export Report
                </button>
              </div>
            </div>

            {/* Justification & Context */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="md:col-span-3">
                <div className="text-gray-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
                  Engineering Justification & Operational Problem Statement
                </div>
                <div className="p-3 rounded bg-gray-50 border border-gray-200 text-gray-700 leading-relaxed">
                  {currentChange.reason}
                </div>
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 rounded bg-gray-50 border border-gray-200">
                  <div className="text-gray-400 text-[9px] uppercase">Configuration Baseline</div>
                  <div className="text-gray-800 font-bold truncate">{currentChange.baseline_id}</div>
                  <div className="text-gray-500 text-[10px]">Rev A.1 (Active)</div>
                </div>
                <div className="p-2.5 rounded bg-gray-50 border border-gray-200">
                  <div className="text-gray-400 text-[9px] uppercase">Accountable Requester</div>
                  <div className="text-gray-800 font-bold truncate">
                    {currentChange.requester?.display_name || currentChange.requester_id}
                  </div>
                  <div className="text-gray-500 text-[10px]">Structural Lead (PE)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Side-by-side Baseline Comparison Table */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-400" />
                  Baseline vs Proposed Configuration Comparison
                </h4>
                <p className="text-[11px] text-gray-500">
                  Field-level delta highlighting changes requiring qualification and downstream re-verification.
                </p>
              </div>
              <span className="text-[10px] font-mono text-gray-500 bg-gray-100 text-gray-800 px-2.5 py-1 rounded border border-gray-200">
                {currentChange.change_items.length} proposed item deltas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Affected Item</th>
                    <th className="py-2.5 px-3">Field Name</th>
                    <th className="py-2.5 px-3">Operation</th>
                    <th className="py-2.5 px-3 w-1/4">Baseline Specification</th>
                    <th className="py-2.5 px-3 w-1/4">Proposed Modification</th>
                    <th className="py-2.5 px-3">Engineering Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {currentChange.change_items.map((ci) => (
                    <tr key={ci.id} className="hover:bg-gray-100 text-gray-800/30 transition">
                      <td className="py-3 px-3 font-mono font-bold text-gray-800">
                        {ci.affected_object_id}
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-500">
                        {ci.field_name}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                          {ci.proposed_operation}
                        </span>
                      </td>
                      {/* Baseline Value */}
                      <td className="py-3 px-3">
                        <div className="p-2.5 rounded bg-gray-50 border border-gray-200 text-gray-700 font-mono text-[11px]">
                          {ci.current_value}
                        </div>
                      </td>
                      {/* Proposed Modification (Highlighted with Diff Styling) */}
                      <td className="py-3 px-3">
                        <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/80 text-amber-200 font-mono text-[11px] shadow-sm">
                          {ci.proposed_value}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-500 text-[11px]">
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-lg max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-red-500" />
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
                  placeholder="e.g. Fuselage Stop Pad Alignment Shim Spec Update"
                  className="w-full bg-[#1A2338] text-gray-800 border border-gray-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-red-500"
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
                  className="w-full bg-[#1A2338] text-gray-800 border border-gray-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Change Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-[#1A2338] text-gray-800 border border-gray-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-red-500"
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
                    className="w-full bg-[#1A2338] text-gray-800 border border-gray-200 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-red-500"
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
                  className="w-full bg-[#1A2338] text-gray-800 border border-gray-200 rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-gray-700 rounded text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded text-xs transition shadow-sm"
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
