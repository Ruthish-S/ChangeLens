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

  // Color helper based on item type and impact classification
  const getNodeVisuals = (itemType: string, classification: string, isSelected: boolean) => {
    let border = 'border-slate-700/80';
    let bg = 'bg-[#0f172a]/90';
    let badgeBg = 'bg-slate-800 text-slate-300';
    let ring = '';

    if (classification === 'DIRECT_PRIMARY') {
      border = 'border-rose-500/80';
      bg = 'bg-rose-950/40';
      badgeBg = 'bg-rose-950 text-rose-300 border border-rose-800 font-bold';
      ring = 'ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/50';
    } else if (classification === 'VERIFICATION_SCOPE') {
      border = 'border-emerald-500/80';
      bg = 'bg-emerald-950/40';
      badgeBg = 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold';
      ring = 'ring-1 ring-emerald-500/40';
    } else if (classification === 'COUPLED_SECONDARY') {
      border = 'border-cyan-500/80';
      bg = 'bg-cyan-950/30';
      badgeBg = 'bg-cyan-950 text-cyan-300 border border-cyan-800';
    }

    if (isSelected) {
      border = 'border-white';
      ring = 'ring-2 ring-cyan-400 shadow-xl shadow-cyan-950/50';
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

      // Layout columns by distance and type
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
            <div className="p-3 min-w-[190px] text-left select-none">
              <div className="flex items-center justify-between text-[9px] font-mono uppercase mb-1">
                <span className="text-slate-400 font-bold">{ir.impacted_object_type}</span>
                <span className={`px-1.5 py-0.2 rounded ${visual.badgeBg}`}>
                  {ir.impact_classification.replace('_', ' ')}
                </span>
              </div>
              <div className="font-mono font-bold text-xs text-white truncate">
                {ir.impacted_object_id}
              </div>
              <div className="text-[11px] text-slate-300 truncate mt-0.5 font-medium">
                {ir.impacted_object_name}
              </div>
              <div className="text-[9px] font-mono text-cyan-400/90 mt-1 flex items-center justify-between">
                <span>Dist: {ir.distance_from_source} deg</span>
                <span>{ir.algorithm_version.split('-')[0]}</span>
              </div>
            </div>
          )
        },
        position: { x: col * 260 + 30, y: row * 125 + 30 },
        className: `rounded-2xl border ${visual.border} ${visual.bg} ${visual.ring} backdrop-blur-md transition-all cursor-pointer`
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
          label: ir.impact_classification,
          labelStyle: { fill: '#64748B', fontSize: 9, fontFamily: 'monospace' },
          style: {
            stroke: ir.impact_classification === 'DIRECT_PRIMARY' ? '#f43f5e' : '#06b6d4',
            strokeWidth: 2
          },
          animated: ir.impact_classification === 'DIRECT_PRIMARY',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: ir.impact_classification === 'DIRECT_PRIMARY' ? '#f43f5e' : '#06b6d4',
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
      <div className="p-5 rounded-2xl glass-panel-elevated border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Interactive Dependency & Impact Graph Explorer
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                  NetworkX BFS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic graph propagation mapping primary scope items to downstream parts, processes, and verification tests.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
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
            <span className="text-slate-400 font-mono text-[11px]">Class:</span>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
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
        <div className="lg:col-span-2 h-[560px] rounded-2xl bg-[#090d16] border border-slate-800/80 relative overflow-hidden shadow-2xl">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background color="#1B2436" gap={18} />
            <Controls className="bg-slate-900 border-slate-700 fill-slate-300 rounded-xl overflow-hidden" />
            <MiniMap
              nodeColor={(node) => (node.id === selectedNodeId ? '#06b6d4' : '#334155')}
              className="bg-slate-950/90 border border-slate-800 rounded-xl"
            />
          </ReactFlow>

          {/* Floating Graph Legend */}
          <div className="absolute bottom-4 left-4 glass-panel p-3 rounded-xl text-[10px] space-y-1.5 z-10 font-sans shadow-lg">
            <div className="font-bold text-slate-300 uppercase text-[9px] tracking-wider mb-1">
              Impact Classification Legend
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-slate-300 font-mono font-semibold">Direct Primary Scope</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-slate-300 font-mono font-semibold">Coupled Secondary Component</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300 font-mono font-semibold">Mandatory Verification Scope</span>
            </div>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        <div className="p-5 rounded-2xl glass-panel-elevated border border-slate-800/80 flex flex-col justify-between space-y-4">
          {selectedImpact ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 mb-1">
                  <span>{selectedImpact.impacted_object_type}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${
                    selectedImpact.impact_classification === 'DIRECT_PRIMARY'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : selectedImpact.impact_classification === 'VERIFICATION_SCOPE'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}>
                    {selectedImpact.impact_classification.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-mono">
                  {selectedImpact.impacted_object_id}
                </h3>
                <div className="text-xs text-slate-300 mt-0.5 font-medium">
                  {selectedImpact.impacted_object_name}
                </div>
              </div>

              {/* Traversal Path */}
              <div>
                <div className="text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-1.5 font-bold">
                  Traceable Propagation Path
                </div>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-cyan-300 leading-relaxed">
                  {selectedImpact.traversal_path}
                </div>
              </div>

              {/* Plain-Language Rationale */}
              <div>
                <div className="text-slate-400 text-[10px] font-mono uppercase tracking-wider mb-1.5 font-bold">
                  Explainable Engineering Rationale
                </div>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {selectedImpact.rationale}
                </div>
              </div>

              {/* Distance from Change Scope */}
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-xs text-cyan-200 flex items-center justify-between font-mono">
                <span>Degrees of Separation:</span>
                <span className="font-bold text-sm text-cyan-400">{selectedImpact.distance_from_source}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              Select a node in the graph to inspect its propagation path and justification.
            </div>
          )}

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono text-center">
            ChangeLens Graph Engine · 100% Synthetic Oracle Recall
          </div>
        </div>
      </div>

      {/* Traversal Results Table */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800/80">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Impact Traversal Results Matrix ({impactResults.length} Reachable Objects)
            </h4>
            <p className="text-[11px] text-slate-400">
              Downstream impacted items identified by BFS graph exploration algorithm.
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/60 font-semibold">
            Algorithm: {impactResults[0]?.algorithm_version || 'NetworkX-BFS-v2.1'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-slate-400 uppercase text-[10px] font-mono">
                <th className="py-3 px-3">Object ID</th>
                <th className="py-3 px-3">Name & Scope</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Classification</th>
                <th className="py-3 px-3">Distance</th>
                <th className="py-3 px-3 w-1/3">Propagation Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {impactResults.map((ir) => (
                <tr
                  key={ir.id}
                  onClick={() => setSelectedNodeId(ir.impacted_object_id)}
                  className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${
                    selectedNodeId === ir.impacted_object_id ? 'bg-slate-800/60' : ''
                  }`}
                >
                  <td className="py-3.5 px-3 font-mono font-bold text-cyan-400">{ir.impacted_object_id}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-200">{ir.impacted_object_name}</td>
                  <td className="py-3.5 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700/80">
                      {ir.impacted_object_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                      ir.impact_classification === 'DIRECT_PRIMARY'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                        : ir.impact_classification === 'VERIFICATION_SCOPE'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                    }`}>
                      {ir.impact_classification}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-300">{ir.distance_from_source} deg</td>
                  <td className="py-3.5 px-3 text-slate-400 text-xs leading-relaxed">{ir.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
