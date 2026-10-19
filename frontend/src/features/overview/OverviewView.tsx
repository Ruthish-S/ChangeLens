import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  GitPullRequest,
  ShieldAlert,
  FileCheck2,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
  Cell
} from 'recharts';
import { api, OverviewMetrics, ChangeRequest } from '../../api/client';
import { NavTab } from '../../components/Sidebar';

interface OverviewViewProps {
  onNavigate: (tab: NavTab, changeId?: string) => void;
  selectedChangeId: string;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [riskData, setRiskData] = useState<any[]>([]);
  const [bottleneckData, setBottleneckData] = useState<any[]>([]);
  const [cycleData, setCycleData] = useState<any[]>([]);
  const [evidenceData, setEvidenceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [m, c, r, b, cy, ev] = await Promise.all([
        api.getOverviewMetrics(),
        api.listChangeRequests(),
        api.getRiskLandscape(),
        api.getGateBottlenecks(),
        api.getReviewCycleTrends(),
        api.getEvidenceCompleteness()
      ]);
      setMetrics(m);
      setChanges(c);
      setRiskData(r);
      setBottleneckData(b);
      setCycleData(cy);
      setEvidenceData(ev);
    } catch (err) {
      console.error('Failed to load overview data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (state: string) => {
    switch (state) {
      case 'CLOSED':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'AUTHORIZED':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'UNDER_REVIEW':
      case 'IMPACT_ASSESSED':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'REJECTED':
      case 'RETURNED_FOR_REVISION':
        return 'bg-red-950 text-red-300 border-red-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-gradient-to-r from-[#121A2E] to-[#0F172A] border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Manufacturing Quality Gate & Impact Intelligence Overview
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Boeing 737-9 MAX Station 500 Fuselage Exit Plug Case Evaluation · Deterministic Graph Analysis & Human Accountability
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1A2338] hover:bg-[#222E48] text-slate-300 text-xs border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <button
            onClick={() => onNavigate('changes')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition shadow-sm"
          >
            Open Change Workspace
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Changes */}
        <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Changes</span>
            <GitPullRequest className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {metrics?.total_changes ?? '—'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Active in database
          </div>
        </div>

        {/* Blocked Quality Gates */}
        <div className="p-4 rounded-lg bg-red-950/20 border border-red-900/50 shadow-sm">
          <div className="flex items-center justify-between text-red-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Gate Blocks</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-400 font-mono">
            {metrics?.blocked_changes ?? '—'}
          </div>
          <div className="text-[10px] text-red-300/80 mt-1">
            Missing mandatory evidence
          </div>
        </div>

        {/* Reviews in Progress */}
        <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">In Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            {metrics?.in_review ?? '—'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Awaiting QA / Sign-off
          </div>
        </div>

        {/* High Severity Risks */}
        <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between text-red-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">High Sev (S≥8)</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400 font-mono">
            {metrics?.high_severity_risks ?? '—'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Mandatory escalation
          </div>
        </div>

        {/* Evidence Completeness */}
        <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Evidence Complete</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {metrics ? `${metrics.evidence_completeness_rate_pct}%` : '—'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {metrics?.accepted_evidence_records} of {metrics?.total_mandatory_requirements} reqs accepted
          </div>
        </div>

        {/* Median Review Cycle Time */}
        <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Median Cycle</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-200 font-mono">
            {metrics ? `${metrics.median_cycle_time_hours}h` : '—'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Submission to decision
          </div>
        </div>
      </div>

      {/* Primary Walkthrough Card: CCR-2026-0001 Spotlight */}
      <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B] shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-red-400 bg-red-950/70 px-2 py-0.5 rounded border border-red-800">
                CASE STUDY BENCHMARK
              </span>
              <span className="text-xs font-mono text-slate-400">CCR-2026-0001</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                GATE BLOCKED
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Mid-Exit Door Plug Material Substitution (Al 7075-T651 to Al 2024-T351 Clad)
            </h3>
            <p className="text-xs text-slate-400 max-w-4xl">
              Grounded in the Boeing 737-9 MAX fuselage door plug structure. Traverses 14 downstream affected components, processes, inspections, and pressure proof tests. Progression is currently <b>BLOCKED</b> by Quality Gate Engine due to missing independent torque buy-off and proof pressure certification.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('impact', 'CCR-2026-0001')}
              className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-slate-200 rounded text-xs border border-slate-700 transition"
            >
              Explore Impact Graph
            </button>
            <button
              onClick={() => onNavigate('evidence', 'CCR-2026-0001')}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium transition shadow-sm"
            >
              Inspect Quality Gate
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Requests & 4-Plot Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Plot 2: Risk Landscape (Severity vs Occurrence) */}
        <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B]">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Plot 2 — Risk Landscape (FMEA Failure Modes)
              </h4>
              <p className="text-[11px] text-slate-400">
                Severity vs Occurrence. Red dashed zone highlights mandatory S≥8 escalation.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              AIAG & VDA Rubric
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  type="number"
                  dataKey="occurrence"
                  name="Occurrence (O)"
                  domain={[1, 10]}
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  label={{ value: 'Occurrence (1-10)', position: 'insideBottom', offset: -10, fill: '#64748B', fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="severity"
                  name="Severity (S)"
                  domain={[1, 10]}
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  label={{ value: 'Severity (1-10)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0B0F17] border border-slate-700 p-2.5 rounded shadow-lg text-xs font-sans">
                          <div className="font-bold text-slate-200">{data.failure_mode}</div>
                          <div className="text-[11px] text-slate-400 mt-1">Severity: <span className="font-mono text-red-400">{data.severity}</span> | Occurrence: <span className="font-mono text-slate-300">{data.occurrence}</span></div>
                          <div className="text-[11px] text-slate-400">Calculated RPN: <span className="font-mono text-amber-400">{data.rpn}</span></div>
                          {data.high_severity_flag && (
                            <div className="mt-1 text-[10px] text-red-400 font-semibold bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800">
                              MANDATORY ESCALATION (S ≥ 8)
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Failure Modes" data={riskData}>
                  {riskData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.high_severity_flag ? '#EF4444' : '#3B82F6'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 3: Quality-Gate Bottlenecks */}
        <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B]">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Plot 3 — Quality-Gate Bottleneck Breakdown
              </h4>
              <p className="text-[11px] text-slate-400">
                Where and why change requests become blocked across gate milestones.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              Rule Engine
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottleneckData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="stage" tick={{ fill: '#64748B', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                <Bar dataKey="passed" name="Passed" stackId="a" fill="#10B981" />
                <Bar dataKey="missing_evidence" name="Missing Evidence" stackId="a" fill="#EF4444" />
                <Bar dataKey="invalid_evidence" name="Invalid Evidence" stackId="a" fill="#F59E0B" />
                <Bar dataKey="pending_approval" name="Pending Sign-off" stackId="a" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 4: Review Cycle Time Trend */}
        <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B]">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Plot 4 — Review Cycle Time Trend (Hours)
              </h4>
              <p className="text-[11px] text-slate-400">
                Median elapsed hours between submission and authorized decision.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              -64.6% Improvement
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cycleData} margin={{ top: 10, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="period" tick={{ fill: '#64748B', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="median_hours" name="Median Hours" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4, fill: '#EF4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 5: Evidence Completeness Distribution */}
        <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B]">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Plot 5 — Verification Evidence Completeness
              </h4>
              <p className="text-[11px] text-slate-400">
                Status distribution of mandatory requirements by engineering domain.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              Auditable Records
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evidenceData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="category" tick={{ fill: '#64748B', fontSize: 9 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                <Bar dataKey="accepted" name="Accepted" fill="#10B981" />
                <Bar dataKey="pending" name="Pending Review" fill="#F59E0B" />
                <Bar dataKey="missing" name="Missing" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Change Requests List */}
      <div className="p-5 rounded-lg bg-[#0F172A] border border-[#1E293B]">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Registered Change Requests & Evaluation States
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {changes.length} requests in active scope
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Change ID</th>
                <th className="py-2.5 px-3">Title & Purpose</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Baseline</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {changes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono font-bold text-slate-200">{c.id}</td>
                  <td className="py-3 px-3 max-w-md">
                    <div className="font-semibold text-slate-200">{c.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">{c.reason}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {c.change_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{c.baseline_id}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${getStatusBadge(c.state)}`}>
                      {c.state}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigate('changes', c.id)}
                      className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-medium text-xs transition"
                    >
                      Workspace <ExternalLink className="w-3 h-3" />
                    </button>
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
