import React, { useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType
} from '@xyflow/react';
import {
  Network,
  Layers,
  Filter,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { api, ImpactResult, ConfigurationItem, Dependency } from '../../api/client';

interface ImpactExplorerProps {
  changeId: string;
}

export const ImpactExplorerView: React.FC<ImpactExplorerProps> = ({ changeId }) => {
  const [impactResults, setImpactResults] = useState<ImpactResult[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [classificationFilter, setClassificationFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Load impact results from API
  useEffect(() => {
    const fetchImpact = async () => {
      try {
        setLoading(true);
        const data = await api.getImpactResults(changeId);
        setImpactResults(data);
        if (data.length > 0 && !selectedNodeId) {
          setSelectedNodeId(data[0].impacted_object_id);
        }
      } catch (err) {
        console.error('Failed to load impact data', err);
      } finally {
        setLoading(false);
      }
    };
    if (changeId) fetchImpact();
  }, [changeId]);

  // Selected item details
  const selectedImpact = useMemo(() => {
    return impactResults.find((r) => r.impacted_object_id === selectedNodeId);
  }, [impactResults, selectedNodeId]);

  // Parse path for selected node
  const selectedPath = useMemo(() => {
    if (!selectedImpact) return [];
    try {
      return JSON.parse(selectedImpact.path_json);
    } catch {
      return [];
    }
  }, [selectedImpact]);

  // Compute highlighted node and edge IDs from selected path
  const highlightedNodeIds = useMemo(() => {
    return new Set(selectedPath.map((p: any) => p.node_id));
  }, [selectedPath]);

  // Node Color & Badge Helper
  const getNodeStyle = (itemType: string, classification: string, isSelected: boolean, isPath: boolean) => {
    let border = 'border-slate-700';
    let bg = 'bg-[#121A2E]';
    let text = 'text-slate-200';

    if (classification === 'DIRECTLY_CHANGED') {
      border = 'border-red-500 shadow-red-500/30 shadow-md ring-2 ring-red-500/50';
      bg = 'bg-red-950/80';
      text = 'text-red-100';
    } else if (classification === 'VERIFICATION_REQUIRED') {
      border = 'border-amber-500 shadow-amber-500/20 shadow-sm';
      bg = 'bg-amber-950/60';
      text = 'text-amber-100';
    } else if (itemType === 'TEST') {
      border = 'border-emerald-600';
      bg = 'bg-emerald-950/40';
      text = 'text-emerald-100';
    } else if (itemType === 'INSPECTION') {
      border = 'border-cyan-600';
      bg = 'bg-cyan-950/40';
      text = 'text-cyan-100';
    } else if (itemType === 'PROCESS') {
      border = 'border-amber-600';
      bg = 'bg-amber-950/40';
      text = 'text-amber-100';
    } else if (itemType === 'SPECIFICATION') {
      border = 'border-purple-600';
      bg = 'bg-purple-950/40';
      text = 'text-purple-100';
    }

    if (isSelected) {
      border = 'border-white ring-2 ring-white shadow-xl';
    } else if (isPath) {
      border = `${border} ring-2 ring-red-400/80`;
    }

    return { border, bg, text };
  };

  // Build Graph Nodes and Edges
  const { initialNodes, initialEdges } = useMemo(() => {
    // Generate layout positions based on tiers/types
    // Column 0: Root changed item (C-104)
    // Column 1: Specifications & Processes (S-201, P-301, C-105, C-106, C-107, C-108)
    // Column 2: Assemblies & Downstream Processes (C-101, P-302, P-303)
    // Column 3: Inspections & Tests (I-401, I-402, I-403, T-501, T-502, T-503)

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const colCounters: { [col: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0 };

    impactResults.forEach((ir) => {
      // Filtering
      if (typeFilter !== 'ALL' && ir.impacted_object_type !== typeFilter) return;
      if (classificationFilter !== 'ALL' && ir.classification !== classificationFilter) return;

      let col = 1;
      if (ir.classification === 'DIRECTLY_CHANGED') {
        col = 0;
      } else if (ir.impacted_object_type === 'TEST' || ir.impacted_object_type === 'INSPECTION') {
        col = 3;
      } else if (ir.impacted_object_id === 'C-101' || ir.impacted_object_id === 'P-302' || ir.impacted_object_id === 'P-303') {
        col = 2;
      } else {
        col = 1;
      }

      const row = colCounters[col] || 0;
      colCounters[col] = row + 1;

      const isSelected = selectedNodeId === ir.impacted_object_id;
      const isPath = highlightedNodeIds.has(ir.impacted_object_id);
      const style = getNodeStyle(ir.impacted_object_type, ir.classification, isSelected, isPath);

      nodes.push({
        id: ir.impacted_object_id,
        data: {
          label: (
            <div className="p-2.5 min-w-[170px] text-left">
              <div className="flex items-center justify-between text-[9px] font-mono uppercase text-slate-400 mb-1">
                <span>{ir.impacted_object_type}</span>
                <span className={`px-1 rounded ${
                  ir.classification === 'DIRECTLY_CHANGED' ? 'bg-red-800 text-white font-bold' :
                  ir.classification === 'VERIFICATION_REQUIRED' ? 'bg-amber-800 text-white font-bold' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {ir.classification.replace('_', ' ')}
                </span>
              </div>
              <div className={`font-bold text-xs ${style.text} truncate`}>
                {ir.impacted_object_id}
              </div>
              <div className="text-[10px] text-slate-300 truncate mt-0.5">
                {ir.impacted_object_name}
              </div>
              <div className="text-[9px] text-slate-400 font-mono mt-1">
                Rule: {ir.propagation_rule.split('-')[1]}
              </div>
            </div>
          )
        },
        position: { x: col * 260 + 40, y: row * 115 + 40 },
        className: `rounded-lg border-2 ${style.border} ${style.bg} shadow transition-all cursor-pointer`
      });

      // Construct edge from path
      try {
        const path = JSON.parse(ir.path_json);
        if (path.length > 1) {
          const fromNode = path[path.length - 2].node_id;
          const toNode = path[path.length - 1].node_id;
          const rel = path[path.length - 1].relationship;
          const isHighlighted = highlightedNodeIds.has(fromNode) && highlightedNodeIds.has(toNode);

          edges.push({
            id: `edge-${fromNode}-${toNode}`,
            source: fromNode,
            target: toNode,
            label: rel,
            labelStyle: { fill: isHighlighted ? '#EF4444' : '#64748B', fontSize: 9, fontFamily: 'monospace' },
            style: {
              stroke: isHighlighted ? '#EF4444' : '#334155',
              strokeWidth: isHighlighted ? 2.5 : 1.2
            },
            animated: isHighlighted,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isHighlighted ? '#EF4444' : '#334155',
              width: 12,
              height: 12
            }
          });
        }
      } catch {
        // ignore edge parsing error
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [impactResults, typeFilter, classificationFilter, selectedNodeId, highlightedNodeIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNodeId(node.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filters */}
      <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-slate-100">
              Interactive Dependency & Change-Impact Explorer
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              v1.2.0-deterministic-bfs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            NetworkX directed dependency traversal mapping directly modified components to downstream tests, inspections, and rework procedures.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#1A2338] text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-red-500"
            >
              <option value="ALL">All Types</option>
              <option value="COMPONENT">Component</option>
              <option value="SPECIFICATION">Specification</option>
              <option value="PROCESS">Process</option>
              <option value="INSPECTION">Inspection</option>
              <option value="TEST">Test</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Class:</span>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="bg-[#1A2338] text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-red-500"
            >
              <option value="ALL">All Classes</option>
              <option value="DIRECTLY_CHANGED">Directly Changed</option>
              <option value="VERIFICATION_REQUIRED">Verification Required</option>
              <option value="POTENTIALLY_IMPACTED">Potentially Impacted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Graph & Slide-over Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive React Flow Canvas */}
        <div className="lg:col-span-2 h-[520px] rounded-lg bg-[#0B0F17] border border-[#1E293B] relative overflow-hidden shadow-inner">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background color="#1E293B" gap={16} />
            <Controls className="bg-[#121A2E] border-slate-800 fill-slate-300" />
            <MiniMap
              nodeColor={(node) => {
                if (node.id === selectedNodeId) return '#EF4444';
                return '#334155';
              }}
              className="bg-[#0F172A] border border-slate-800 rounded"
            />
          </ReactFlow>

          {/* Graph Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-[#0F172A]/90 backdrop-blur border border-slate-800 p-2.5 rounded text-[10px] space-y-1 z-10 font-sans shadow-lg">
            <div className="font-bold text-slate-300 uppercase text-[9px] tracking-wider mb-1">Node Legend</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-red-600" />
              <span className="text-slate-400">Directly Changed (Root)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span className="text-slate-400">Verification Required (Gate Trigger)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-blue-500" />
              <span className="text-slate-400">Potentially Impacted Component/Process</span>
            </div>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B] flex flex-col justify-between space-y-4">
          {selectedImpact ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-1">
                  <span>{selectedImpact.impacted_object_type}</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                    selectedImpact.classification === 'DIRECTLY_CHANGED' ? 'bg-red-950 text-red-300 border border-red-800' :
                    selectedImpact.classification === 'VERIFICATION_REQUIRED' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {selectedImpact.classification.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 font-mono">
                  {selectedImpact.impacted_object_id}
                </h3>
                <div className="text-xs text-slate-300 mt-0.5">
                  {selectedImpact.impacted_object_name}
                </div>
              </div>

              {/* Traceable Traversal Path */}
              <div>
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  Traceable Dependency Path (Root to Target)
                </div>
                <div className="p-2.5 rounded bg-[#0B0F17] border border-slate-800 space-y-1.5">
                  {selectedPath.map((step: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs font-mono">
                      <span className="w-4 h-4 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">
                        {idx}
                      </span>
                      <span className="font-bold text-slate-200">{step.node_id}</span>
                      {step.relationship !== 'ROOT_CHANGE' && (
                        <span className="text-[10px] text-red-400 font-semibold">
                          [{step.relationship}]
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {step.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plain-Language Engineering Rationale */}
              <div>
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  Engineering Rationale & Rule Trigger
                </div>
                <div className="p-3 rounded bg-[#0B0F17] border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <div className="text-[10px] font-mono text-amber-400 font-semibold mb-1">
                    {selectedImpact.propagation_rule}
                  </div>
                  {selectedImpact.rationale}
                </div>
              </div>

              {/* Mandatory Action */}
              <div>
                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  Mandatory Verification Action
                </div>
                <div className="p-3 rounded bg-red-950/20 border border-red-900/60 text-xs text-red-200 leading-relaxed font-medium">
                  {selectedImpact.verification_action}
                </div>
              </div>

              {/* Unresolved Uncertainty Note */}
              {selectedImpact.unresolved_uncertainty && (
                <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700 text-[11px] text-slate-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-400">Uncertainty Note:</span>{' '}
                    {selectedImpact.unresolved_uncertainty}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a node in the graph to inspect its traversal path and verification actions.
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            Baseline Snapshot: Rev A.1 · 100% Deterministic Traversal
          </div>
        </div>
      </div>

      {/* Tabular Impact Traversal Matrix */}
      <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B]">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Impact Traversal Results Matrix ({impactResults.length} Reachable Objects)
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            Evaluation Algorithm: {impactResults[0]?.algorithm_version || 'v1.2.0'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Object ID</th>
                <th className="py-2.5 px-3">Name & Description</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Rule Applied</th>
                <th className="py-2.5 px-3 w-1/3">Required Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {impactResults.map((ir) => (
                <tr
                  key={ir.id}
                  onClick={() => setSelectedNodeId(ir.impacted_object_id)}
                  className={`hover:bg-slate-800/40 transition cursor-pointer ${
                    selectedNodeId === ir.impacted_object_id ? 'bg-slate-800/60' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-mono font-bold text-slate-200">
                    {ir.impacted_object_id}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200">{ir.impacted_object_name}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-sm">{ir.rationale}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {ir.impacted_object_type}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                      ir.classification === 'DIRECTLY_CHANGED' ? 'bg-red-950 text-red-300 border-red-800' :
                      ir.classification === 'VERIFICATION_REQUIRED' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                      'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {ir.classification}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[10px] text-amber-400">
                    {ir.propagation_rule}
                  </td>
                  <td className="py-3 px-3 text-slate-300 text-[11px]">
                    {ir.verification_action}
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
