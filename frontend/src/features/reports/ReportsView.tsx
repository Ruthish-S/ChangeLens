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
  ShieldAlert,
  Layers,
  CheckCircle2
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
  const [latestRun, setLatestRun] = useState<ReportRun | null>(null);
  const [docSection, setDocSection] = useState<'SUMMARY' | 'DELTA' | 'IMPACT' | 'GATES'>('SUMMARY');

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Top Header */}
      <div className="p-7 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Traceable Engineering Reports &amp; Regulatory Dossiers
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Canonical single-source-of-truth exportable to certified PDF, Word DOCX, Excel XLSX, and CSV with SHA-256 integrity signatures.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-medium border border-gray-200 transition shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            Print Dossier
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-xl text-xs font-medium transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Compiling Dossier...' : 'Generate Snapshot'}
          </button>
        </div>
      </div>

      {/* Format Download Pill Bar */}
      {latestRun && (
        <div className="p-5 rounded-3xl bg-white border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-gray-900">{latestRun.id}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                Template v{latestRun.template_version}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                FAA &amp; EASA Traceable
              </span>
            </div>
            <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
              <Hash className="w-3 h-3 text-gray-400" />
              Snapshot SHA-256: <span className="text-gray-700 font-semibold">{latestRun.source_snapshot_hash.slice(0, 24)}...</span>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={api.getDownloadUrl(latestRun.id, 'pdf')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-medium transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </a>
            <a
              href={api.getDownloadUrl(latestRun.id, 'docx')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#0071E3] border border-blue-200 text-xs font-medium transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" /> Word DOCX
            </a>
            <a
              href={api.getDownloadUrl(latestRun.id, 'xlsx')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" /> Excel XLSX
            </a>
            <a
              href={api.getDownloadUrl(latestRun.id, 'csv')}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" /> Raw CSV
            </a>
          </div>
        </div>
      )}

      {/* Report Document Container */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-7">
        
        {/* Document Header */}
        <div className="border-b border-gray-100 pb-7">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase text-gray-400 tracking-wider font-semibold">
                Formal Engineering Release &amp; Quality Audit Dossier
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1.5 tracking-tight">
                Report A — Engineering Change Impact &amp; Quality Gate Assessment
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Document Control ID: <span className="font-mono text-gray-900 font-bold">{latestRun?.id || 'RPT-PENDING'}</span>
              </p>
            </div>

            <div className="sm:text-right text-[11px] font-mono text-gray-500 space-y-1">
              <div>Change ID: <span className="text-gray-900 font-bold">{change?.id}</span></div>
              <div>Baseline: <span className="text-gray-800">{change?.baseline_id}</span></div>
              <div>State: <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">{change?.state}</span></div>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-2xl border border-gray-200 text-xs overflow-x-auto">
          <button
            onClick={() => setDocSection('SUMMARY')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              docSection === 'SUMMARY' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            01 Executive Intent
          </button>
          <button
            onClick={() => setDocSection('DELTA')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              docSection === 'DELTA' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            02 Baseline Comparison
          </button>
          <button
            onClick={() => setDocSection('IMPACT')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              docSection === 'IMPACT' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            03 Downstream Impact
          </button>
          <button
            onClick={() => setDocSection('GATES')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              docSection === 'GATES' ? 'bg-white text-gray-900 shadow-2xs font-semibold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            04 Verification Gates
          </button>
        </div>

        {/* 01 Executive Summary */}
        {(docSection === 'SUMMARY' || docSection === 'DELTA' || docSection === 'IMPACT' || docSection === 'GATES') && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
              01 Executive Summary &amp; Operational Problem Statement
            </h4>
            <p className="text-xs text-gray-700 leading-relaxed font-normal">
              {change?.reason}
            </p>
          </div>
        )}

        {/* 02 Baseline Comparison */}
        {(docSection === 'DELTA' || docSection === 'SUMMARY') && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
              02 Configuration Baseline Delta Specification
            </h4>
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
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
        )}

        {/* 03 Downstream Impact Summary */}
        {(docSection === 'IMPACT' || docSection === 'SUMMARY') && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
              03 Downstream Impact &amp; Verification Scope ({change?.impact_results.length} reachable objects)
            </h4>
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
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
                      <td className="p-3 font-mono font-bold text-[#0071E3]">{ir.impacted_object_id}</td>
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
        )}

        {/* 04 Quality Gate & Verification Status */}
        {(docSection === 'GATES' || docSection === 'SUMMARY') && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
              04 Verification Evidence &amp; Quality Gate Audit
            </h4>
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium text-[11px]">
                  <tr>
                    <th className="p-3">Req ID</th>
                    <th className="p-3">Title &amp; Standard</th>
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
        )}

        {/* 05 Engineering Limitations & Governance Sign-off */}
        <div className="p-5 rounded-2xl bg-[#FAFAFC] border border-gray-200 text-xs text-gray-600 space-y-2">
          <div className="font-semibold text-gray-800 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            Engineering Integrity &amp; Certification Sign-off
          </div>
          <p className="text-[11px] leading-relaxed">
            ChangeLens provides explainable algorithmic decision support based on deterministic graph traversal and rule enforcement. Low numerical risk scores do not prove material safety without physical testing. All change authorizations require formal signature by accountable engineering authorities.
          </p>
        </div>
      </div>
    </div>
  );
};
