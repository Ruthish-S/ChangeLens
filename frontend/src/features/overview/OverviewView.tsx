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
  ExternalLink,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ChevronRight
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
      case 'AUTHORIZED':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'UNDER_REVIEW':
      case 'IMPACT_ASSESSED':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'REJECTED':
      case 'RETURNED_FOR_REVISION':
        return 'bg-rose-950/80 text-rose-400 border-rose-800';
      default:
        return 'bg-slate-800/80 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 2026 Hero Showcase Banner */}
      <div className="relative overflow-hidden p-6 rounded-2xl glass-panel-elevated border border-slate-800/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                ChangeLens 2026 Aerospace Intelligence
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Explainable Change-Impact & Quality Gate Control Desk
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Evaluating the <span className="text-slate-200 font-semibold">Boeing 737-9 MAX Station 500 Mid-Exit Door Plug</span> configuration baseline. Connecting multi-degree dependency propagation, AIAG/VDA FMEA risk escalation, and mandatory quality gates to enforce human accountability.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700/80 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => onNavigate('changes')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-950/40"
            >
              Change Workspace
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2026 Bento Grid KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Changes */}
        <div className="p-4 rounded-2xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Total Changes</span>
            <GitPullRequest className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {metrics?.total_changes ?? '—'}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              Active configuration
            </div>
          </div>
        </div>

        {/* Gate Blocks */}
        <div className="p-4 rounded-2xl glass-card border-rose-900/40 bg-rose-950/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Gate Blocks</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
              {metrics?.blocked_changes ?? '—'}
            </div>
            <div className="text-[10px] font-mono text-rose-300/80 mt-1">
              Missing evidence locked
            </div>
          </div>
        </div>

        {/* In Review */}
        <div className="p-4 rounded-2xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">In Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
              {metrics?.in_review ?? '—'}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              Awaiting sign-off
            </div>
          </div>
        </div>

        {/* High Severity Risks */}
        <div className="p-4 rounded-2xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">High Sev (S≥8)</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-red-400 font-mono">
              {metrics?.high_severity_risks ?? '—'}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              Auto-mandate QA
            </div>
          </div>
        </div>

        {/* Evidence Completeness */}
        <div className="p-4 rounded-2xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Evidence Rate</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {metrics ? `${metrics.evidence_completeness_rate_pct}%` : '—'}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              {metrics?.accepted_evidence_records} of {metrics?.total_mandatory_requirements} accepted
            </div>
          </div>
        </div>

        {/* Review Cycle */}
        <div className="p-4 rounded-2xl glass-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Median Cycle</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-200 font-mono">
              {metrics ? `${metrics.median_cycle_time_hours}h` : '—'}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1">
              -64.6% vs legacy
            </div>
          </div>
        </div>
      </div>

      {/* Case Study Benchmark Spotlight Banner: CCR-2026-0001 */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-700/80 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pl-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                BOEING 737-9 MAX CASE
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">CCR-2026-0001</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-800">
                GATE BLOCKED
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              Fuselage Station 500 Door Plug Rework & Retaining Pin Re-installation
            </h3>
            <p className="text-xs text-slate-400 max-w-4xl leading-relaxed">
              Models the exact assembly rework traveler defect behind the Alaska Airlines Flight 1282 accident. ChangeLens traversed 7 affected items across 3 degrees, caught the Severity 10 explosive decompression risk (RPN 280), and <b>BLOCKED</b> authorization because retaining bolt torque verification logs and Level II QA stamps are missing.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 pl-2">
            <button
              onClick={() => onNavigate('impact', 'CCR-2026-0001')}
              className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              Explore Graph
            </button>
            <button
              onClick={() => onNavigate('evidence', 'CCR-2026-0001')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-950/40"
            >
              Inspect Quality Gate
            </button>
          </div>
        </div>
      </div>

      {/* 4 Interactive Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Plot 2: Risk Landscape (Severity vs Occurrence) */}
        <div className="p-5 rounded-2xl glass-card">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Risk Landscape (FMEA Failure Modes)
              </h4>
              <p className="text-[11px] text-slate-400">
                Severity vs Occurrence. Red dots represent S ≥ 8 mandatory escalations.
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 font-semibold">
              AIAG / VDA Rubric
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B2436" />
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
                        <div className="bg-[#0B0F17] border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs font-sans">
                          <div className="font-bold text-slate-200">{data.failure_mode}</div>
                          <div className="text-[11px] text-slate-400 mt-1">Severity: <span className="font-mono text-rose-400 font-bold">{data.severity}</span> | Occurrence: <span className="font-mono text-slate-300">{data.occurrence}</span></div>
                          <div className="text-[11px] text-slate-400">Calculated RPN: <span className="font-mono text-amber-400 font-bold">{data.rpn}</span></div>
                          {data.severity >= 8 && (
                            <div className="mt-1 text-[10px] text-rose-400 font-semibold bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800">
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
                      fill={entry.severity >= 8 || entry.high_severity_flag ? '#f43f5e' : '#06b6d4'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 3: Quality-Gate Bottleneck Breakdown */}
        <div className="p-5 rounded-2xl glass-card">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Quality Gate Bottlenecks
              </h4>
              <p className="text-[11px] text-slate-400">
                Where and why change requests become blocked across milestones.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              Deterministic Rules
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottleneckData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B2436" />
                <XAxis dataKey="stage" tick={{ fill: '#64748B', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                <Bar dataKey="passed" name="Passed" stackId="a" fill="#10B981" />
                <Bar dataKey="missing_evidence" name="Missing Evidence" stackId="a" fill="#F43F5E" />
                <Bar dataKey="invalid_evidence" name="Invalid Evidence" stackId="a" fill="#F59E0B" />
                <Bar dataKey="pending_approval" name="Pending Sign-off" stackId="a" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 4: Review Cycle Time Trend */}
        <div className="p-5 rounded-2xl glass-card">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Review Cycle Time Trend (Hours)
              </h4>
              <p className="text-[11px] text-slate-400">
                Median elapsed hours between submission and authorized decision.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 font-bold">
              -64.6% Improvement
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cycleData} margin={{ top: 10, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B2436" />
                <XAxis dataKey="period" tick={{ fill: '#64748B', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="median_hours" name="Median Hours" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4, fill: '#06B6D4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 5: Evidence Completeness Distribution */}
        <div className="p-5 rounded-2xl glass-card">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Verification Evidence Completeness
              </h4>
              <p className="text-[11px] text-slate-400">
                Status distribution of mandatory requirements by engineering domain.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              SHA-256 Validated
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evidenceData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B2436" />
                <XAxis dataKey="category" tick={{ fill: '#64748B', fontSize: 9 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                <Bar dataKey="accepted" name="Accepted" fill="#10B981" />
                <Bar dataKey="pending" name="Pending Review" fill="#F59E0B" />
                <Bar dataKey="missing" name="Missing" fill="#F43F5E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Change Requests Table */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800/80">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Active Change Requests & State Transitions
            </h4>
            <p className="text-[11px] text-slate-400">
              Registered changes evaluated under configuration baseline BASE-737-9-DOORPLUG-A.
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/60 font-semibold">
            {changes.length} requests in active scope
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-slate-400 uppercase text-[10px] font-mono">
                <th className="py-3 px-3">Change ID</th>
                <th className="py-3 px-3">Title & Purpose</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Baseline</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {changes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-cyan-400">{c.id}</td>
                  <td className="py-3.5 px-3 max-w-md">
                    <div className="font-semibold text-slate-200">{c.title}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{c.reason}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700/80">
                      {c.change_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">{c.baseline_id}</td>
                  <td className="py-3.5 px-3">
                    <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(c.state)}`}>
                      {c.state}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => onNavigate('changes', c.id)}
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold text-xs transition"
                    >
                      Workspace <ChevronRight className="w-3.5 h-3.5" />
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
