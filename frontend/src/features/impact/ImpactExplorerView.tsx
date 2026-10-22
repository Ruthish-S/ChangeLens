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
  Filter,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  ShieldAlert,
  Sparkles,
  Zap
} from 'lucide-react';
import { api, ImpactResult, ConfigurationBaseline } from '../../api/client';

interface ImpactExplorerProps {
  changeId: string;
}

export const ImpactExplorerView: React.FC<ImpactExplorerProps> = ({ changeId }) => {
  const [impactResults, setImpactResults] = useState<ImpactResult[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [classificationFilter, setClassificationFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

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

  const selectedImpact = useMemo(() => {
    return impactResults.find((r) => r.impacted_object_id === selectedNodeId) || impactResults[0];
  }, [impactResults, selectedNodeId]);

  // Visual helper based on item type and impact classification
  const getNodeVisuals = (itemType: string, classification: string, isSelected: boolean) => {
    let border = 'border-gray-200';
    let bg = 'bg-white';
    let badgeBg = 'bg-gray-100 text-gray-700 border border-gray-200';
    let ring = '';

    if (classification === 'DIRECT_PRIMARY') {
      border = 'border-red-300';
      bg = 'bg-white';
      badgeBg = 'bg-red-50 text-red-700 border border-red-200 font-semibold';
      ring = 'ring-2 ring-red-400/40 shadow-sm';
    } else if (classification === 'VERIFICATION_SCOPE') {
      border = 'border-emerald-300';
      bg = 'bg-white';
      badgeBg = 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold';
      ring = 'ring-1 ring-emerald-400/40';
    } else if (classification === 'COUPLED_SECONDARY') {
      border = 'border-blue-300';
      bg = 'bg-white';
      badgeBg = 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold';
    }

    if (isSelected) {
      border = 'border-[#0071E3]';
      ring = 'ring-2 ring-blue-500/50 shadow-md';
    }

    return { border, bg, badgeBg, ring };
  };

  // Build Graph Nodes and Edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const colCounters: { [col: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0 };

    impactResults.forEach((ir) => {
      if (typeFilter !== 'ALL' && ir.impacted_object_type !== typeFilter) return;
      if (classificationFilter !== 'ALL' && ir.impact_classification !== classificationFilter) return;

      // Layout columns by distance
      let col = ir.distance_from_source;
      if (col > 3) col = 3;
      const row = colCounters[col] || 0;
      colCounters[col] = row + 1;

      const isSelected = selectedNodeId === ir.impacted_object_id;
      const visual = getNodeVisuals(ir.impacted_object_type, ir.impact_classification, isSelected);

      nodes.push({
        id: ir.impacted_object_id,
        data: {
          label: (
            <div className="p-3.5 min-w-[195px] text-left select-none">
              <div className="flex items-center justify-between text-[9px] font-mono uppercase mb-1">
                <span className="text-gray-500 font-semibold">{ir.impacted_object_type}</span>
                <span className={`px-1.5 py-0.5 rounded-full ${visual.badgeBg}`}>
                  {ir.impact_classification.replace('_', ' ')}
                </span>
              </div>
              <div className="font-mono font-bold text-xs text-gray-900 truncate">
                {ir.impacted_object_id}
              </div>
              <div className="text-[11px] text-gray-600 truncate mt-0.5 font-medium">
                {ir.impacted_object_name}
              </div>
              <div className="text-[10px] font-mono text-gray-400 mt-1 flex items-center justify-between">
                <span>Dist: {ir.distance_from_source} deg</span>
                <span>{ir.algorithm_version.split('-')[0]}</span>
              </div>
            </div>
          )
        },
        position: { x: col * 260 + 30, y: row * 125 + 30 },
        className: `rounded-2xl border ${visual.border} ${visual.bg} ${visual.ring} shadow-sm transition-all cursor-pointer`
      });

      // Construct edge from traversal_path
      const parts = ir.traversal_path.split(' ');
      if (parts.length >= 3) {
        const source = parts[0];
        const target = parts[parts.length - 1];
        edges.push({
          id: `edge-${ir.impacted_object_id}`,
          source,
          target,
          label: ir.impact_classification.replace('_', ' '),
          labelStyle: { fill: '#64748B', fontSize: 9, fontFamily: 'monospace' },
          style: {
            stroke: ir.impact_classification === 'DIRECT_PRIMARY' ? '#EF4444' : '#0071E3',
            strokeWidth: 2
          },
          animated: ir.impact_classification === 'DIRECT_PRIMARY',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: ir.impact_classification === 'DIRECT_PRIMARY' ? '#EF4444' : '#0071E3',
            width: 14,
            height: 14
          }
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [impactResults, typeFilter, classificationFilter, selectedNodeId]);

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Filter Bar */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">
                Dependency & Impact Graph Explorer
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                NetworkX BFS
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Deterministic graph propagation mapping primary change items to downstream parts, processes, and verification tests.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500 font-medium text-[11px]">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-gray-50 text-gray-900 border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
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
            <span className="text-gray-500 font-medium text-[11px]">Class:</span>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="bg-gray-50 text-gray-900 border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              <option value="DIRECT_PRIMARY">Direct Primary</option>
              <option value="COUPLED_SECONDARY">Coupled Secondary</option>
              <option value="VERIFICATION_SCOPE">Verification Scope</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Graph Canvas and Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* React Flow Graph */}
        <div className="lg:col-span-2 h-[560px] rounded-2xl bg-white border border-gray-200/80 relative overflow-hidden shadow-sm">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background color="#F1F5F9" gap={20} />
            <Controls className="bg-white border-gray-200 fill-slate-600 rounded-xl overflow-hidden shadow-xs" />
            <MiniMap
              nodeColor={(node) => (node.id === selectedNodeId ? '#0071E3' : '#CBD5E1')}
              className="bg-white border border-gray-200 rounded-xl"
            />
          </ReactFlow>

          {/* Floating Graph Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3.5 rounded-xl border border-gray-200 text-[11px] space-y-1.5 z-10 font-sans shadow-sm">
            <div className="font-semibold text-gray-800 uppercase text-[9px] tracking-wider mb-1">
              Impact Classification
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-gray-700 font-medium">Direct Primary Scope</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-gray-700 font-medium">Coupled Secondary Component</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-gray-700 font-medium">Mandatory Verification Scope</span>
            </div>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex flex-col justify-between space-y-4">
          {selectedImpact ? (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-gray-500 mb-1.5">
                  <span className="font-semibold">{selectedImpact.impacted_object_type}</span>
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${
                    selectedImpact.impact_classification === 'DIRECT_PRIMARY'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : selectedImpact.impact_classification === 'VERIFICATION_SCOPE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {selectedImpact.impact_classification.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 font-mono">
                  {selectedImpact.impacted_object_id}
                </h3>
                <div className="text-xs text-gray-700 mt-0.5 font-medium">
                  {selectedImpact.impacted_object_name}
                </div>
              </div>

              {/* Traversal Path */}
              <div>
                <div className="text-gray-500 text-[10px] font-mono uppercase tracking-wider mb-1.5 font-semibold">
                  Traceable Propagation Path
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 font-mono text-xs text-blue-700 leading-relaxed font-medium">
                  {selectedImpact.traversal_path}
                </div>
              </div>

              {/* Explainable Rationale */}
              <div>
                <div className="text-gray-500 text-[10px] font-mono uppercase tracking-wider mb-1.5 font-semibold">
                  Explainable Engineering Rationale
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed">
                  {selectedImpact.rationale}
                </div>
              </div>

              {/* Distance from Scope */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-center justify-between font-mono">
                <span>Degrees of Separation:</span>
                <span className="font-bold text-sm text-blue-700">{selectedImpact.distance_from_source}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs font-mono">
              Select a node in the graph to inspect its propagation path and justification.
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 font-mono text-center">
            ChangeLens Graph Engine · 100% Synthetic Oracle Recall
          </div>
        </div>
      </div>

      {/* Traversal Results Table */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Impact Traversal Results Matrix ({impactResults.length} Reachable Objects)
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Downstream impacted items identified by BFS graph exploration algorithm.
            </p>
          </div>
          <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 font-semibold self-start sm:self-auto">
            Algorithm: {impactResults[0]?.algorithm_version || 'NetworkX-BFS-v2.1'}
          </span>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-[11px]">
                <th className="py-3 px-3.5">Object ID</th>
                <th className="py-3 px-3.5">Name & Scope</th>
                <th className="py-3 px-3.5">Type</th>
                <th className="py-3 px-3.5">Classification</th>
                <th className="py-3 px-3.5">Distance</th>
                <th className="py-3 px-3.5 w-1/3">Propagation Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {impactResults.map((ir) => (
                <tr
                  key={ir.id}
                  onClick={() => setSelectedNodeId(ir.impacted_object_id)}
                  className={`hover:bg-gray-50/70 transition cursor-pointer ${
                    selectedNodeId === ir.impacted_object_id ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <td className="py-3.5 px-3.5 font-mono font-semibold text-blue-600">{ir.impacted_object_id}</td>
                  <td className="py-3.5 px-3.5 font-semibold text-gray-900">{ir.impacted_object_name}</td>
                  <td className="py-3.5 px-3.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                      {ir.impacted_object_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5">
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                      ir.impact_classification === 'DIRECT_PRIMARY'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : ir.impact_classification === 'VERIFICATION_SCOPE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {ir.impact_classification}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 font-mono text-gray-600">{ir.distance_from_source} deg</td>
                  <td className="py-3.5 px-3.5 text-gray-600 text-xs leading-relaxed">{ir.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
