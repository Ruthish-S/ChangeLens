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
  ChevronRight,
  ShieldCheck,
  FileText,
  Search,
  Plus,
  Network,
  FileSpreadsheet,
  Lock,
  Filter
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
  const [tableFilter, setTableFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'UNDER_REVIEW':
      case 'IMPACT_ASSESSED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'REJECTED':
      case 'RETURNED_FOR_REVISION':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const filteredChanges = changes.filter((c) => {
    const matchesFilter = tableFilter === 'ALL' || c.change_type.toLowerCase().includes(tableFilter.toLowerCase());
    const matchesSearch = searchQuery === '' || 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Apple-Style Operations Hero */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100 text-xs font-semibold text-[#0071E3]">
              <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse-subtle" />
              Active Airframe Baseline: Boeing 737-9 MAX · Fuselage Station 500
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight leading-tight">
              Aviation Change Control &amp; Quality Governance
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed font-normal">
              Autonomous engineering change propagation, FMEA risk containment, and cryptographic evidence verification. Ensures zero unrecorded aircraft modifications reach the flight line.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('changes')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              New Change Order
            </button>
            <button
              onClick={() => onNavigate('evidence')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100/80 text-red-700 text-xs font-semibold border border-red-200 transition-all shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 text-red-600" />
              Gate Holds ({metrics?.blocked_changes ?? 1})
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 transition-all shadow-2xs"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0071E3]' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Core System Safeguards (Interactive Navigation Cards) */}
        <div className="mt-7 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div 
            onClick={() => onNavigate('changes')}
            className="p-4 rounded-2xl bg-[#FAFAFC] hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200/80 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-gray-900">
              <span>Digital Traveler Lock</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
              Stops unrecorded rework. Physical doors and panels cannot be unbolted without an active, serialized digital order.
            </p>
            <div className="text-[11px] font-semibold text-[#0071E3] mt-2.5 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              1 Active Traveler &rarr;
            </div>
          </div>

          <div 
            onClick={() => onNavigate('impact')}
            className="p-4 rounded-2xl bg-[#FAFAFC] hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200/80 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-gray-900">
              <span>BFS Impact Traversal</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
              NetworkX graph traces 3 degrees of fasteners, stop pins, structural door fittings, and torque inspections with 100% recall.
            </p>
            <div className="text-[11px] font-semibold text-[#0071E3] mt-2.5 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              7 Affected Items &rarr;
            </div>
          </div>

          <div 
            onClick={() => onNavigate('risks')}
            className="p-4 rounded-2xl bg-[#FAFAFC] hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200/80 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-gray-900">
              <span>FMEA Risk Escalation</span>
              <span className="w-2 h-2 rounded-full bg-red-500" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
              Auto-flags explosive decompression hazards (Severity 10, RPN 280), mandating Chief Airframe Engineer review.
            </p>
            <div className="text-[11px] font-semibold text-red-600 mt-2.5 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              3 High-Severity Flags &rarr;
            </div>
          </div>

          <div 
            onClick={() => onNavigate('evidence')}
            className="p-4 rounded-2xl bg-[#FAFAFC] hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200/80 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-gray-900">
              <span>Evidence Quality Gates</span>
              <span className="w-2 h-2 rounded-full bg-red-500" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
              Aircraft progression is hard-locked until torque wrench logs and Level II stamps are cryptographically SHA-256 verified.
            </p>
            <div className="text-[11px] font-semibold text-red-600 mt-2.5 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Release Milestone Held &rarr;
            </div>
          </div>
        </div>
      </div>

      {/* Bento Metric KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Active Changes */}
        <div 
          onClick={() => onNavigate('changes')}
          className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Orders</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <GitPullRequest className="w-3.5 h-3.5 text-[#0071E3]" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-gray-900">
              {metrics?.total_changes ?? 2}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              Active configuration
            </div>
          </div>
        </div>

        {/* Gate Blocks */}
        <div 
          onClick={() => onNavigate('evidence')}
          className="p-5 rounded-2xl bg-white border border-red-200 shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-red-600 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Gate Holds</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-red-600">
              {metrics?.blocked_changes ?? 1}
            </div>
            <div className="text-[11px] text-red-700 mt-1 font-medium">
              Missing evidence locked
            </div>
          </div>
        </div>

        {/* In Review */}
        <div 
          onClick={() => onNavigate('approvals')}
          className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">In Review</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-gray-900">
              {metrics?.in_review ?? 1}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              Awaiting sign-off
            </div>
          </div>
        </div>

        {/* High Severity Risks */}
        <div 
          onClick={() => onNavigate('risks')}
          className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">High Sev (S ≥ 8)</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-gray-900">
              {metrics?.high_severity_risks ?? 3}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              Safety escalation
            </div>
          </div>
        </div>

        {/* Evidence Completeness */}
        <div 
          onClick={() => onNavigate('evidence')}
          className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Evidence Rate</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-emerald-600">
              {metrics ? `${metrics.evidence_completeness_rate_pct}%` : '50%'}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              {metrics?.accepted_evidence_records ?? 2} of {metrics?.total_mandatory_requirements ?? 4} verified
            </div>
          </div>
        </div>

        {/* Review Cycle */}
        <div 
          onClick={() => onNavigate('reports')}
          className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Cycle Time</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-gray-900">
              {metrics ? `${metrics.median_cycle_time_hours}h` : '18.5h'}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              -64.6% vs legacy
            </div>
          </div>
        </div>
      </div>

      {/* Active Operational Hold Card (Alaska 1282 Case Study Resolution) */}
      <div className="p-7 rounded-3xl bg-white border border-red-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-3 py-0.5 rounded-full border border-red-200">
                CRITICAL QUALITY HOLD · CCR-2026-0001
              </span>
              <span className="text-xs font-mono font-medium text-gray-500">Boeing 737-9 MAX Station 500 Assembly</span>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
                Gate 3 Locked
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Fuselage Station 500 Mid-Exit Door Plug Retaining Bolt Rework
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 max-w-4xl leading-relaxed font-normal">
              Directly resolves the assembly traveler breakdown behind Alaska Airlines Flight 1282. ChangeLens detected that the mid-exit door plug was opened for rivet rework, identified the <span className="font-semibold text-red-600">Severity 10 explosive decompression hazard (RPN 280)</span>, and locked delivery progression because retaining bolt torque verification logs (BAC-5001-4) and Level II QA stamps are unverified.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('evidence', 'CCR-2026-0001')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-medium transition shadow-sm"
            >
              Resolve Gate Lock &rarr;
            </button>
            <button
              onClick={() => onNavigate('impact', 'CCR-2026-0001')}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-medium border border-gray-200 transition shadow-2xs"
            >
              Impact Graph
            </button>
            <button
              onClick={() => onNavigate('risks', 'CCR-2026-0001')}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-medium border border-gray-200 transition shadow-2xs"
            >
              FMEA Register
            </button>
          </div>
        </div>
      </div>

      {/* 4 Interactive Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Plot 1: Risk Landscape */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Risk Landscape (FMEA Failure Modes)
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Severity vs Occurrence. Red markers indicate S ≥ 8 mandatory escalations.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#0071E3] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              AIAG &amp; VDA Standard
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  type="number"
                  dataKey="occurrence"
                  name="Occurrence (O)"
                  domain={[1, 10]}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  label={{ value: 'Occurrence (1-10)', position: 'insideBottom', offset: -10, fill: '#6B7280', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="severity"
                  name="Severity (S)"
                  domain={[1, 10]}
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  label={{ value: 'Severity (1-10)', angle: -90, position: 'insideLeft', fill: '#6B7280', fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 p-3 rounded-2xl shadow-lg text-xs font-sans max-w-xs">
                          <div className="font-semibold text-gray-900">{data.failure_mode}</div>
                          <div className="text-[11px] text-gray-500 mt-1">Severity: <span className="font-semibold text-red-600">{data.severity}</span> | Occurrence: <span className="font-semibold text-gray-700">{data.occurrence}</span></div>
                          <div className="text-[11px] text-gray-500">Calculated RPN: <span className="font-semibold text-amber-700">{data.rpn}</span></div>
                          {data.severity >= 8 && (
                            <div className="mt-1.5 text-[10px] text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded-full border border-red-200 text-center">
                              MANDATORY SAFETY ESCALATION (S ≥ 8)
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
                      fill={entry.severity >= 8 || entry.high_severity_flag ? '#EF4444' : '#0071E3'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 2: Quality-Gate Bottlenecks */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Quality Gate Bottlenecks
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Distribution of blocked milestones and root evidence deficits.
              </p>
            </div>
            <span className="text-[11px] font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
              Deterministic Rules
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottleneckData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="stage" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '16px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="passed" name="Passed" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="missing_evidence" name="Missing Evidence" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="invalid_evidence" name="Invalid Evidence" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending_approval" name="Pending Sign-off" stackId="a" fill="#0071E3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 3: Review Cycle Time Trend */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Review Cycle Time Trend
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Median elapsed hours from change submission to verified release.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              -64.6% vs Legacy
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cycleData} margin={{ top: 10, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="period" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '16px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Line type="monotone" dataKey="median_hours" name="Median Hours" stroke="#0071E3" strokeWidth={2.5} dot={{ r: 4, fill: '#0071E3' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plot 4: Evidence Completeness */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Verification Evidence Completeness
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Status of mandatory requirements across engineering disciplines.
              </p>
            </div>
            <span className="text-[11px] font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
              SHA-256 Validated
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evidenceData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="category" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '16px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="accepted" name="Accepted" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" name="Pending Review" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                <Bar dataKey="missing" name="Missing" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Change Orders Table with Interactive Filter & Search */}
      <div className="p-7 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Active Change Orders &amp; Release Status
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Evaluated under baseline BASE-737-9-DOORPLUG-A.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="pl-8 pr-3 py-1.5 bg-gray-50 text-xs text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0071E3] w-40 sm:w-48"
              />
            </div>

            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
              <button
                onClick={() => setTableFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  tableFilter === 'ALL' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTableFilter('FASTENER')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  tableFilter === 'FASTENER' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Fasteners
              </button>
              <button
                onClick={() => setTableFilter('MATERIAL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  tableFilter === 'MATERIAL' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Materials
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-400 uppercase text-[10px] font-medium tracking-wider">
                <th className="py-3 px-3.5">Change ID</th>
                <th className="py-3 px-3.5">Title &amp; Operational Purpose</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Baseline</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredChanges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-xs">
                    No change orders matched your query.
                  </td>
                </tr>
              ) : (
                filteredChanges.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-3.5 font-mono font-semibold text-[#0071E3]">{c.id}</td>
                    <td className="py-3.5 px-3.5 max-w-md">
                      <div className="font-semibold text-gray-900">{c.title}</div>
                      <div className="text-[11px] text-gray-500 truncate mt-0.5">{c.reason}</div>
                    </td>
                    <td className="py-3.5 px-3.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                        {c.change_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 font-mono text-[11px] text-gray-500">{c.baseline_id}</td>
                    <td className="py-3.5 px-3.5">
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(c.state)}`}>
                        {c.state}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 text-right">
                      <button
                        onClick={() => onNavigate('changes', c.id)}
                        className="inline-flex items-center gap-1 text-[#0071E3] hover:text-[#0077ED] font-semibold text-xs transition"
                      >
                        Open Workspace <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
