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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Automated Traceable Engineering Reports & Auditable Exports
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Canonical data model exported into formatted PDF, DOCX, XLSX, and CSV documents with SHA-256 integrity snapshots.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-lg text-xs font-medium transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Compiling Multi-format Exports...' : 'Generate New Assessment Snapshot'}
        </button>
      </div>

      {/* Report Format Download Bar (When Run Exists) */}
      {latestRun && (
        <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-gray-900">{latestRun.id}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                Template v{latestRun.template_version}
              </span>
            </div>
            <div className="text-[11px] font-mono text-gray-500 flex items-center gap-1.5">
              <Hash className="w-3 h-3 text-gray-400" />
              Snapshot SHA-256: <span className="text-gray-700 font-semibold">{latestRun.source_snapshot_hash.slice(0, 24)}...</span>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={api.getDownloadUrl(latestRun.id, 'pdf')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-medium transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </a>
            <a
              href={api.getDownloadUrl(latestRun.id, 'docx')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Word DOCX
            </a>
            <a
              href={api.getDownloadUrl(latestRun.id, 'xlsx')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Excel XLSX
            </a>
            <a
              href={api.getDownloadUrl(latestRun.id, 'csv')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Raw CSV
            </a>
          </div>
        </div>
      )}

      {/* Report Live Document Preview Container */}
      <div className="p-8 rounded-2xl bg-white border border-gray-200/80 shadow-sm space-y-6">
        
        {/* Document Header */}
        <div className="border-b border-gray-100 pb-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">
                ChangeLens Formal Engineering Release Documentation
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                Report A — Engineering Change Impact & Quality Assessment
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Document Control ID: <span className="font-mono text-gray-900 font-bold">{latestRun?.id || 'RPT-PENDING'}</span>
              </p>
            </div>

            <div className="sm:text-right text-[11px] font-mono text-gray-500 space-y-0.5">
              <div>Change ID: <span className="text-gray-900 font-bold">{change?.id}</span></div>
              <div>Baseline: <span className="text-gray-800">{change?.baseline_id}</span></div>
              <div>State: <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">{change?.state}</span></div>
            </div>
          </div>
        </div>

        {/* 01 Executive Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-1.5">
            01 Executive Summary & Engineering Intent
          </h4>
          <p className="text-xs text-gray-700 leading-relaxed font-normal">
            {change?.reason}
          </p>
        </div>

        {/* 02 Baseline Comparison */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-1.5">
            02 Configuration Baseline Comparison
          </h4>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-[11px]">
                <tr>
                  <th className="p-3">Item ID</th>
                  <th className="p-3">Field</th>
                  <th className="p-3">Baseline Specification</th>
                  <th className="p-3">Proposed Modification</th>
                  <th className="p-3">Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {change?.change_items.map((ci) => (
                  <tr key={ci.id} className="hover:bg-gray-50/70 transition">
                    <td className="p-3 font-mono font-bold text-gray-900">{ci.affected_object_id}</td>
                    <td className="p-3 font-mono text-gray-600">{ci.field_name}</td>
                    <td className="p-3 text-gray-600">{ci.current_value}</td>
                    <td className="p-3 font-semibold text-amber-900 bg-amber-50/50">{ci.proposed_value}</td>
                    <td className="p-3 text-gray-600 text-[11px]">{ci.justification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 03 Downstream Impact Summary */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-1.5">
            03 Downstream Impact & Verification Triggers ({change?.impact_results.length} reachable items)
          </h4>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-[11px]">
                <tr>
                  <th className="p-3">Object ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Classification</th>
                  <th className="p-3">Propagation Rule</th>
                  <th className="p-3">Required Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {change?.impact_results.slice(0, 8).map((ir) => (
                  <tr key={ir.id} className="hover:bg-gray-50/70 transition">
                    <td className="p-3 font-mono font-bold text-blue-600">{ir.impacted_object_id}</td>
                    <td className="p-3 font-mono text-gray-600">{ir.impacted_object_type}</td>
                    <td className="p-3 font-mono text-[10px] text-amber-800 font-semibold">{ir.impact_classification || ir.classification}</td>
                    <td className="p-3 font-mono text-[10px] text-gray-500">{ir.algorithm_version || ir.propagation_rule}</td>
                    <td className="p-3 text-gray-700 text-[11px]">{ir.rationale || ir.verification_action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 04 Quality Gate & Verification Status */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-1.5">
            04 Verification Evidence & Quality Gate Audit
          </h4>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-[11px]">
                <tr>
                  <th className="p-3">Req ID</th>
                  <th className="p-3">Title & Standard</th>
                  <th className="p-3">Mandatory</th>
                  <th className="p-3">Evidence Reference</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {change?.verification_requirements.map((vr) => {
                  const ev = change?.evidence_records.find((e) => e.requirement_id === vr.id);
                  return (
                    <tr key={vr.id} className="hover:bg-gray-50/70 transition">
                      <td className="p-3 font-mono font-bold text-gray-900">{vr.id}</td>
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">{vr.title}</div>
                        <div className="text-[10px] text-gray-500">{vr.acceptance_criteria}</div>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-red-600 font-semibold">
                        {vr.mandatory ? 'YES' : 'OPTIONAL'}
                      </td>
                      <td className="p-3 font-mono text-[10px] text-gray-600">
                        {ev ? `${ev.source_reference} (${ev.file_hash.slice(0, 10)}...)` : 'MISSING'}
                      </td>
                      <td className="p-3 font-mono font-bold text-[10px]">
                        <span className={ev?.verification_status === 'ACCEPTED' ? 'text-emerald-700' : 'text-red-600'}>
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
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-2">
          <div className="font-semibold text-gray-800 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
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
