import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  FileCheck2,
  Table,
  Hash,
  Clock,
  Printer,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { api, ReportRun, ChangeRequest, User } from '../../api/client';

interface ReportsViewProps {
  changeId: string;
  currentUser: User | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ changeId, currentUser }) => {
  const [reports, setReports] = useState<ReportRun[]>([]);
  const [change, setChange] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'change' | 'management'>('change');
  const [latestRun, setLatestRun] = useState<ReportRun | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rpts, cr] = await Promise.all([
        api.listReports(changeId),
        api.getChangeRequest(changeId)
      ]);
      setReports(rpts);
      setChange(cr);
      if (rpts.length > 0) {
        setLatestRun(rpts[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (changeId) loadData();
  }, [changeId]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const newRun = await api.generateChangeAssessment(
        changeId,
        currentUser?.id || 'usr-lead-eng'
      );
      setLatestRun(newRun);
      await loadData();
    } catch (err: any) {
      alert(`Report generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-100">
              Automated Traceable Engineering Reports & Auditable Exports
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Single validated canonical data model exported into formatted PDF, DOCX, XLSX, and CSV documents with SHA-256 integrity snapshots.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded text-xs font-medium transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Compiling Multi-format Exports...' : 'Generate New Assessment Snapshot'}
        </button>
      </div>

      {/* Report Format Download Bar (When Run Exists) */}
      {latestRun && (
        <div className="p-4 rounded-lg bg-[#121A2E] border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-red-400">{latestRun.id}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Template v{latestRun.template_version}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Hash className="w-3 h-3 text-slate-500" />
              Snapshot SHA-256: <span className="text-slate-300">{latestRun.source_snapshot_hash.slice(0, 24)}...</span>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={api.getDownloadUrl(latestRun.id, 'pdf')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-bold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> PDF Document
            </a>
            <a
              href={api.getDownloadUrl(latestRun.id, 'docx')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-800 text-xs font-bold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Word DOCX
            </a>
            <a
              href={api.getDownloadUrl(latestRun.id, 'xlsx')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 text-xs font-bold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Excel XLSX
            </a>
            <a
              href={api.getDownloadUrl(latestRun.id, 'csv')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Raw CSV
            </a>
          </div>
        </div>
      )}

      {/* Report Live Document Preview Container */}
      <div className="p-6 rounded-lg bg-[#0F172A] border border-[#1E293B] shadow-sm space-y-6">
        
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                ChangeLens Formal Engineering Release Documentation
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-1">
                Report A — Engineering Change Impact & Quality Assessment
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Document Control ID: <span className="font-mono text-slate-200 font-bold">{latestRun?.id || 'RPT-PENDING'}</span>
              </p>
            </div>

            <div className="text-right text-[11px] font-mono text-slate-400 space-y-0.5">
              <div>Change ID: <span className="text-slate-200 font-bold">{change?.id}</span></div>
              <div>Baseline: <span className="text-slate-200">{change?.baseline_id}</span></div>
              <div>State: <span className="text-amber-400 font-bold">{change?.state}</span></div>
            </div>
          </div>
        </div>

        {/* 01 Executive Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-1">
            01 Executive Summary & Engineering Intent
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {change?.reason}
          </p>
        </div>

        {/* 02 Baseline Comparison */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-1">
            02 Configuration Baseline Comparison
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800">
              <thead className="bg-[#121A2E] text-slate-400 font-mono text-[10px]">
                <tr>
                  <th className="p-2 border-r border-slate-800">Item ID</th>
                  <th className="p-2 border-r border-slate-800">Field</th>
                  <th className="p-2 border-r border-slate-800">Baseline Specification</th>
                  <th className="p-2 border-r border-slate-800">Proposed Modification</th>
                  <th className="p-2">Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {change?.change_items.map((ci) => (
                  <tr key={ci.id}>
                    <td className="p-2 font-mono font-bold text-slate-200 border-r border-slate-800">{ci.affected_object_id}</td>
                    <td className="p-2 font-mono text-slate-400 border-r border-slate-800">{ci.field_name}</td>
                    <td className="p-2 text-slate-400 border-r border-slate-800">{ci.current_value}</td>
                    <td className="p-2 font-bold text-amber-300 bg-amber-950/20 border-r border-slate-800">{ci.proposed_value}</td>
                    <td className="p-2 text-slate-400 text-[11px]">{ci.justification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 03 Downstream Impact Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-1">
            03 Downstream Impact & Verification Triggers ({change?.impact_results.length} reachable items)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800">
              <thead className="bg-[#121A2E] text-slate-400 font-mono text-[10px]">
                <tr>
                  <th className="p-2 border-r border-slate-800">Object ID</th>
                  <th className="p-2 border-r border-slate-800">Type</th>
                  <th className="p-2 border-r border-slate-800">Classification</th>
                  <th className="p-2 border-r border-slate-800">Propagation Rule</th>
                  <th className="p-2">Required Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {change?.impact_results.slice(0, 8).map((ir) => (
                  <tr key={ir.id}>
                    <td className="p-2 font-mono font-bold text-slate-200 border-r border-slate-800">{ir.impacted_object_id}</td>
                    <td className="p-2 font-mono text-slate-400 border-r border-slate-800">{ir.impacted_object_type}</td>
                    <td className="p-2 border-r border-slate-800 font-mono text-[10px] text-amber-400">{ir.classification}</td>
                    <td className="p-2 font-mono text-[10px] text-slate-400 border-r border-slate-800">{ir.propagation_rule}</td>
                    <td className="p-2 text-slate-300 text-[11px]">{ir.verification_action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 04 Quality Gate & Verification Status */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-1">
            04 Verification Evidence & Quality Gate Audit
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800">
              <thead className="bg-[#121A2E] text-slate-400 font-mono text-[10px]">
                <tr>
                  <th className="p-2 border-r border-slate-800">Req ID</th>
                  <th className="p-2 border-r border-slate-800">Title & Standard</th>
                  <th className="p-2 border-r border-slate-800">Mandatory</th>
                  <th className="p-2 border-r border-slate-800">Evidence Reference</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {change?.verification_requirements.map((vr) => {
                  const ev = change?.evidence_records.find((e) => e.requirement_id === vr.id);
                  return (
                    <tr key={vr.id}>
                      <td className="p-2 font-mono font-bold text-slate-200 border-r border-slate-800">{vr.id}</td>
                      <td className="p-2 border-r border-slate-800">
                        <div className="font-bold text-slate-200">{vr.title}</div>
                        <div className="text-[10px] text-slate-400">{vr.acceptance_criteria}</div>
                      </td>
                      <td className="p-2 font-mono text-[10px] border-r border-slate-800 text-red-400">
                        {vr.mandatory ? 'YES' : 'OPTIONAL'}
                      </td>
                      <td className="p-2 border-r border-slate-800 font-mono text-[10px] text-slate-300">
                        {ev ? `${ev.source_reference} (${ev.file_hash.slice(0, 10)}...)` : 'MISSING'}
                      </td>
                      <td className="p-2 font-mono font-bold text-[10px]">
                        <span className={ev?.verification_status === 'ACCEPTED' ? 'text-emerald-400' : 'text-red-400'}>
                          {ev ? ev.verification_status : 'MISSING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 05 Engineering Limitations & Governance Sign-off */}
        <div className="p-4 rounded bg-[#0B0F17] border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="font-bold text-slate-300 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Engineering Limitations and Governance Disclaimer
          </div>
          <p className="text-[11px] leading-relaxed">
            ChangeLens provides explainable algorithmic decision support based on deterministic graph traversal and rule enforcement. The software does not independently certify aircraft airworthiness or replace qualified aerospace engineering sign-off. Low numerical risk scores do not prove material safety without physical testing. All change authorizations require formal signature by accountable engineering authorities.
          </p>
        </div>
      </div>
    </div>
  );
};
