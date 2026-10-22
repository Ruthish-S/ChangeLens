import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Copy,
  Download,
  Plus,
  Trash2,
  ArrowRight,
  Plane,
  Car,
  Activity,
  Cpu,
  Flame,
  Wrench,
  Check,
  Building2
} from 'lucide-react';
import { api, ChangeRequest, User } from '../../api/client';
import { NavTab } from '../../components/Sidebar';

export type IndustrySector = 'AEROSPACE' | 'AUTOMOTIVE' | 'MEDTECH' | 'SEMICONDUCTOR' | 'ENERGY' | 'CUSTOM';

export interface IndustryConfig {
  id: IndustrySector;
  name: string;
  icon: string;
  organization: string;
  targetSystem: string;
  complianceStandard: string;
  prefix: string;
  baselineId: string;
  bfsDepth: number;
  severityThreshold: number;
  rpnThreshold: number;
  qualityGates: {
    calibratedTool: boolean;
    photoProof: boolean;
    qaLevel2Stamp: boolean;
    materialCert: boolean;
    separationOfDuties: boolean;
    independentReview: boolean;
  };
  customFields: { id: string; label: string; type: 'text' | 'number' | 'select'; required: boolean; defaultValue: string }[];
  description: string;
}

export const INDUSTRY_PRESETS: Record<IndustrySector, IndustryConfig> = {
  AEROSPACE: {
    id: 'AEROSPACE',
    name: 'Aerospace & Defense',
    icon: '✈️',
    organization: 'Commercial Airframes & Defense Corp',
    targetSystem: 'Boeing 737-9 MAX Station 500 Mid-Exit Door Plug',
    complianceStandard: 'FAA AC-05 / AS9100 Rev D / DO-178C',
    prefix: 'CCR',
    baselineId: 'BASE-737-9-DOORPLUG-A',
    bfsDepth: 3,
    severityThreshold: 8,
    rpnThreshold: 200,
    qualityGates: {
      calibratedTool: true,
      photoProof: true,
      qaLevel2Stamp: true,
      materialCert: true,
      separationOfDuties: true,
      independentReview: true
    },
    customFields: [
      { id: 'tail_number', label: 'Airframe Tail Number', type: 'text', required: true, defaultValue: 'N704AL' },
      { id: 'fuselage_station', label: 'Fuselage Station', type: 'text', required: true, defaultValue: 'STA 500' },
      { id: 'faa_der_assigned', label: 'FAA DER Officer', type: 'text', required: true, defaultValue: 'Arthur Pendelton (DER-092)' }
    ],
    description: 'Mission-critical aerospace configuration control modeled on the Alaska Airlines 1282 benchmark. Rigidly enforces physical lockwire, torque calibration (BAC-5001-4), and FAA AC-05 dual-signoff.'
  },
  AUTOMOTIVE: {
    id: 'AUTOMOTIVE',
    name: 'Automotive & EV Systems',
    icon: '🚗',
    organization: 'NextGen Mobility & EV Powertrains',
    targetSystem: '800V High-Voltage Battery Pack & Busbar Insulation',
    complianceStandard: 'ISO 26262 ASIL-D / IATF 16949 / VDA 6.3',
    prefix: 'ECO',
    baselineId: 'BASE-EV-800V-BATTERY-D',
    bfsDepth: 3,
    severityThreshold: 8,
    rpnThreshold: 180,
    qualityGates: {
      calibratedTool: true,
      photoProof: true,
      qaLevel2Stamp: true,
      materialCert: true,
      separationOfDuties: true,
      independentReview: true
    },
    customFields: [
      { id: 'vin_series', label: 'VIN Platform Code', type: 'text', required: true, defaultValue: 'PLATFORM-EV-800' },
      { id: 'battery_lot', label: 'Cell Module Lot Number', type: 'text', required: true, defaultValue: 'LOT-2026-NCM9' },
      { id: 'asil_rating', label: 'Functional Safety ASIL', type: 'select', required: true, defaultValue: 'ASIL-D' }
    ],
    description: 'High-voltage electric vehicle safety governance. Controls busbar thermal barriers, dielectric clearance, and battery thermal runaway prevention under ISO 26262.'
  },
  MEDTECH: {
    id: 'MEDTECH',
    name: 'Medical Devices (MedTech)',
    icon: '🏥',
    organization: 'BioVance Implantable Medical Technologies',
    targetSystem: 'Class III Implantable Pacemaker Laser Titanium Weld',
    complianceStandard: 'FDA 21 CFR Part 820 / ISO 13485 / ISO 14971',
    prefix: 'ECN',
    baselineId: 'BASE-MED-PACE-TI-3',
    bfsDepth: 2,
    severityThreshold: 9,
    rpnThreshold: 150,
    qualityGates: {
      calibratedTool: true,
      photoProof: true,
      qaLevel2Stamp: true,
      materialCert: true,
      separationOfDuties: true,
      independentReview: true
    },
    customFields: [
      { id: 'device_class', label: 'FDA Device Classification', type: 'select', required: true, defaultValue: 'Class III Implantable' },
      { id: 'dhf_reference', label: 'Design History File (DHF)', type: 'text', required: true, defaultValue: 'DHF-PACE-902' },
      { id: 'biocompatibility', label: 'ISO 10993 Biocompatibility Stamp', type: 'text', required: true, defaultValue: 'BIO-PASS-2026' }
    ],
    description: 'Class III life-sustaining medical device design controls. Mandates hermetic helium leak verification, cleanroom ISO Class 5 certification, and Design History File (DHF) closure.'
  },
  SEMICONDUCTOR: {
    id: 'SEMICONDUCTOR',
    name: 'Semiconductor Fabrication',
    icon: '⚡',
    organization: 'QuantumNano Foundry & Fab Technologies',
    targetSystem: '3nm EUV Lithography Reticle Chuck Thermal Expansion Stage',
    complianceStandard: 'SEMI E10 / SEMI S2 / ISO 9001 / Copy-Exactly',
    prefix: 'CR',
    baselineId: 'BASE-FAB-3NM-EUV-9',
    bfsDepth: 2,
    severityThreshold: 8,
    rpnThreshold: 160,
    qualityGates: {
      calibratedTool: true,
      photoProof: false,
      qaLevel2Stamp: true,
      materialCert: true,
      separationOfDuties: true,
      independentReview: true
    },
    customFields: [
      { id: 'fab_chamber', label: 'Cleanroom Chamber ID', type: 'text', required: true, defaultValue: 'FAB-EUV-CH-04' },
      { id: 'wafer_diameter', label: 'Wafer Substrate Diameter', type: 'text', required: true, defaultValue: '300mm Prime' },
      { id: 'copy_exactly_code', label: 'Intel/TSMC Copy-Exactly #', type: 'text', required: true, defaultValue: 'CE-2026-N3P' }
    ],
    description: 'Sub-nanometer cleanroom tool configuration management. Regulates reticle stage thermal expansion, helium cooling drift, and yield impact to zero parts-per-billion contamination.'
  },
  ENERGY: {
    id: 'ENERGY',
    name: 'Nuclear & Industrial Energy',
    icon: '🏭',
    organization: 'TerraCore Nuclear & Critical Infrastructure',
    targetSystem: 'Main Steam Isolation Valve (MSIV) Pressure Boundary Seal',
    complianceStandard: 'ASME Section III / API 6D / NRC 10 CFR 50 App B',
    prefix: 'MOC',
    baselineId: 'BASE-NUC-MSIV-BND-1',
    bfsDepth: 4,
    severityThreshold: 9,
    rpnThreshold: 220,
    qualityGates: {
      calibratedTool: true,
      photoProof: true,
      qaLevel2Stamp: true,
      materialCert: true,
      separationOfDuties: true,
      independentReview: true
    },
    customFields: [
      { id: 'reactor_loop', label: 'Primary Reactor Coolant Loop', type: 'text', required: true, defaultValue: 'Loop B Cold Leg' },
      { id: 'nrc_inspector', label: 'NRC Resident Inspector Stamp', type: 'text', required: true, defaultValue: 'NRC-INSP-882' },
      { id: 'hydro_test_psi', label: 'Hydrostatic Test Pressure', type: 'text', required: true, defaultValue: '2,250 PSI Held 60min' }
    ],
    description: 'Nuclear safety and Management of Change (MOC) governance. Hard-locks reactor containment pressure boundary modifications until NDE radiography and hydrostatic burst tests clear.'
  },
  CUSTOM: {
    id: 'CUSTOM',
    name: 'Enterprise Custom Industry',
    icon: '⚙️',
    organization: 'Global Manufacturing Enterprise',
    targetSystem: 'Critical Industrial Control Subsystem',
    complianceStandard: 'ISO 9001:2015 / Six Sigma Quality Framework',
    prefix: 'RFC',
    baselineId: 'BASE-CUSTOM-SYSTEM-01',
    bfsDepth: 3,
    severityThreshold: 8,
    rpnThreshold: 200,
    qualityGates: {
      calibratedTool: true,
      photoProof: true,
      qaLevel2Stamp: true,
      materialCert: true,
      separationOfDuties: true,
      independentReview: true
    },
    customFields: [
      { id: 'plant_location', label: 'Manufacturing Facility', type: 'text', required: true, defaultValue: 'Facility 4 - Line B' },
      { id: 'change_driver', label: 'Business Justification', type: 'text', required: true, defaultValue: 'Reliability & Safety Assurance' }
    ],
    description: 'Fully customizable enterprise change governance studio. Tailor compliance standards, gates, thresholds, and custom metadata fields for your specific industrial vertical.'
  }
};

interface IndustryCustomizerViewProps {
  currentIndustry: IndustrySector;
  onSelectIndustry: (sector: IndustrySector, changeId?: string) => void;
  onNavigate: (tab: NavTab, changeId?: string) => void;
  currentUser: User | null;
}

export const IndustryCustomizerView: React.FC<IndustryCustomizerViewProps> = ({
  currentIndustry,
  onSelectIndustry,
  onNavigate,
  currentUser
}) => {
  const [selectedPresetKey, setSelectedPresetKey] = useState<IndustrySector>(currentIndustry || 'AEROSPACE');
  const [config, setConfig] = useState<IndustryConfig>(INDUSTRY_PRESETS[currentIndustry || 'AEROSPACE']);
  const [copied, setCopied] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // New change order generator form state
  const [genTitle, setGenTitle] = useState<string>('');
  const [genReason, setGenReason] = useState<string>('');
  const [genType, setGenType] = useState<string>('DESIGN_MODIFICATION');

  const handleSelectPreset = (key: IndustrySector) => {
    setSelectedPresetKey(key);
    setConfig(INDUSTRY_PRESETS[key]);
    setSuccessBanner(`Loaded preset: ${INDUSTRY_PRESETS[key].name}`);
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  const handleApplyPreset = () => {
    setSaving(true);
    setTimeout(() => {
      // Map to corresponding benchmark change request ID
      const changeMap: Record<IndustrySector, string> = {
        AEROSPACE: 'CCR-2026-0001',
        AUTOMOTIVE: 'ECO-2026-0814',
        MEDTECH: 'ECN-2026-4402',
        SEMICONDUCTOR: 'CR-2026-9011',
        ENERGY: 'MOC-2026-1180',
        CUSTOM: 'CCR-2026-0001'
      };
      const targetChangeId = changeMap[selectedPresetKey];
      onSelectIndustry(selectedPresetKey, targetChangeId);
      setSaving(false);
      setSuccessBanner(`Successfully deployed ${config.name} configuration across ChangeLens!`);
      setTimeout(() => setSuccessBanner(null), 4000);
    }, 400);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `changelens-${config.id.toLowerCase()}-config.json`);
    dlAnchorElem.click();
  };

  const handleAddCustomField = () => {
    const newFieldId = `field_${Date.now().toString(36)}`;
    setConfig({
      ...config,
      customFields: [
        ...config.customFields,
        { id: newFieldId, label: 'New Custom Attribute', type: 'text', required: false, defaultValue: '' }
      ]
    });
  };

  const handleRemoveCustomField = (index: number) => {
    const updated = [...config.customFields];
    updated.splice(index, 1);
    setConfig({ ...config, customFields: updated });
  };

  const handleCreateCustomOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTitle.trim()) return;

    try {
      setSaving(true);
      const newCR: Partial<ChangeRequest> = {
        title: genTitle,
        reason: genReason || `Tailored engineering change for ${config.targetSystem}`,
        change_type: genType,
        requester_id: currentUser?.id || 'usr-lead-eng',
        baseline_id: config.baselineId,
        priority: 'HIGH',
        industry: config.id,
        compliance_standard: config.complianceStandard,
        target_system: config.targetSystem
      };

      const created = await api.createChangeRequest(newCR);
      setSaving(false);
      setSuccessBanner(`Created Change Order: ${created.id}`);
      setTimeout(() => {
        onNavigate('changes', created.id);
      }, 700);
    } catch (err: any) {
      alert(`Error creating change order: ${err.message}`);
      setSaving(false);
    }
  };

  const presetList = Object.values(INDUSTRY_PRESETS);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* Apple-grade Header */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100 text-xs font-semibold text-[#0071E3]">
              <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
              Industry Customization Studio &middot; Multi-Sector Governance
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight leading-tight">
              Enterprise Industry Tailoring
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed font-normal">
              ChangeLens is engineered for any high-assurance engineering vertical. Switch between pre-calibrated compliance blueprints or customize your own change taxonomy, FMEA escalation thresholds, and cryptographic quality gates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleApplyPreset}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-xs transition-all shadow-sm"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Applying...' : 'Deploy Preset System'}
            </button>
            <button
              onClick={handleCopyJSON}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium border border-gray-200 transition-all shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
            <button
              onClick={handleDownloadJSON}
              className="p-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 transition-all shadow-2xs"
              title="Download Config JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successBanner && (
          <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successBanner}</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-mono">Live In Memory</span>
          </div>
        )}
      </div>

      {/* Preset Sector Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider text-[11px]">
            1. Select Industry Blueprint
          </h2>
          <span className="text-xs text-gray-400">1-click calibration for enterprise standards</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presetList.map((preset) => {
            const isSelected = selectedPresetKey === preset.id;
            const isLive = currentIndustry === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-[#0071E3] ring-2 ring-[#0071E3]/20 shadow-md'
                    : 'bg-white hover:bg-gray-50/80 border-gray-200/80 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{preset.icon}</span>
                    <div className="flex items-center gap-1.5">
                      {isLive && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active In App
                        </span>
                      )}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                        {preset.prefix}-*
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{preset.name}</h3>
                  <div className="text-[11px] font-medium text-[#0071E3] mt-0.5">{preset.complianceStandard}</div>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Target: <span className="text-gray-700 font-medium truncate inline-block max-w-[130px] align-bottom">{preset.targetSystem.split(' ')[0]}</span></span>
                  <span className="font-mono text-gray-500">S ≥ {preset.severityThreshold}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Customization Studio Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Core Parameters & Taxonomy */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  2. System Taxonomy &amp; Compliance Configuration
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tune organization parameters, regulatory standards, and graph exploration depth.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-[#0071E3] border border-blue-100">
                {config.prefix} Architecture
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Enterprise / Organization Name
                </label>
                <input
                  type="text"
                  value={config.organization}
                  onChange={(e) => setConfig({ ...config, organization: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Engineering Subsystem
                </label>
                <input
                  type="text"
                  value={config.targetSystem}
                  onChange={(e) => setConfig({ ...config, targetSystem: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Regulatory Compliance Standard
                </label>
                <input
                  type="text"
                  value={config.complianceStandard}
                  onChange={(e) => setConfig({ ...config, complianceStandard: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Change Order Prefix (e.g., CCR, ECO, ECN)
                </label>
                <input
                  type="text"
                  value={config.prefix}
                  onChange={(e) => setConfig({ ...config, prefix: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Active Baseline Identifier
                </label>
                <input
                  type="text"
                  value={config.baselineId}
                  onChange={(e) => setConfig({ ...config, baselineId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  NetworkX BFS Blast Radius Depth: <span className="text-[#0071E3] font-bold">{config.bfsDepth} Hops</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={config.bfsDepth}
                  onChange={(e) => setConfig({ ...config, bfsDepth: parseInt(e.target.value) })}
                  className="w-full accent-[#0071E3] mt-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>1: Direct Only</span>
                  <span>3: Industry Standard</span>
                  <span>5: Deep Boundary</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quality Gates & Risk Escalation Thresholds */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-5">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                3. Mandatory Evidence Gates &amp; Risk Escalations
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Deterministic governance: Changes cannot proceed without cryptographic evidence meeting these gates.
              </p>
            </div>

            {/* Threshold Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-900 mb-2">
                  <span>Safety Escalation Threshold (Severity S)</span>
                  <span className="font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                    S ≥ {config.severityThreshold}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="10"
                  step="1"
                  value={config.severityThreshold}
                  onChange={(e) => setConfig({ ...config, severityThreshold: parseInt(e.target.value) })}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <p className="text-[11px] text-gray-400 mt-2">
                  Any failure mode with Severity &ge; {config.severityThreshold} auto-triggers Chief Airframe/System Engineer escalation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-900 mb-2">
                  <span>Risk Priority Number (RPN) Cutoff</span>
                  <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    RPN ≥ {config.rpnThreshold}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="400"
                  step="20"
                  value={config.rpnThreshold}
                  onChange={(e) => setConfig({ ...config, rpnThreshold: parseInt(e.target.value) })}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <p className="text-[11px] text-gray-400 mt-2">
                  RPN = S &times; O &times; D. Scores above {config.rpnThreshold} require formal mitigation before Stage 2 gate entry.
                </p>
              </div>
            </div>

            {/* Toggleable Evidence Gates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={config.qualityGates.calibratedTool}
                  onChange={(e) => setConfig({
                    ...config,
                    qualityGates: { ...config.qualityGates, calibratedTool: e.target.checked }
                  })}
                  className="mt-0.5 rounded text-[#0071E3] focus:ring-[#0071E3]"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Calibrated Tooling Log (BAC/ISO)</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Torque wrench / laser calibration data upload required.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={config.qualityGates.photoProof}
                  onChange={(e) => setConfig({
                    ...config,
                    qualityGates: { ...config.qualityGates, photoProof: e.target.checked }
                  })}
                  className="mt-0.5 rounded text-[#0071E3] focus:ring-[#0071E3]"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Photographic Physical Evidence</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">High-res timestamped image of installed cotter pins or welds.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={config.qualityGates.qaLevel2Stamp}
                  onChange={(e) => setConfig({
                    ...config,
                    qualityGates: { ...config.qualityGates, qaLevel2Stamp: e.target.checked }
                  })}
                  className="mt-0.5 rounded text-[#0071E3] focus:ring-[#0071E3]"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Level II Quality Stamp</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Cryptographic inspector certification with badge ID.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={config.qualityGates.materialCert}
                  onChange={(e) => setConfig({
                    ...config,
                    qualityGates: { ...config.qualityGates, materialCert: e.target.checked }
                  })}
                  className="mt-0.5 rounded text-[#0071E3] focus:ring-[#0071E3]"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Mill Test Material Certification</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Traceable heat/lot certification for all raw materials.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={config.qualityGates.separationOfDuties}
                  onChange={(e) => setConfig({
                    ...config,
                    qualityGates: { ...config.qualityGates, separationOfDuties: e.target.checked }
                  })}
                  className="mt-0.5 rounded text-[#0071E3] focus:ring-[#0071E3]"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Strict Separation of Duties</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Prevents engineers from self-authorizing their own changes.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={config.qualityGates.independentReview}
                  onChange={(e) => setConfig({
                    ...config,
                    qualityGates: { ...config.qualityGates, independentReview: e.target.checked }
                  })}
                  className="mt-0.5 rounded text-[#0071E3] focus:ring-[#0071E3]"
                />
                <div>
                  <div className="text-xs font-semibold text-gray-900">Dual Authorization Protocol</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Mandates concurrence from both Quality and Chief Engineering.</div>
                </div>
              </label>
            </div>
          </div>

          {/* Custom Industry Fields Builder */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  4. Custom Industry Metadata Attributes
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Inject vertical-specific metadata attributes into the Change Order traveler.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0071E3] text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Field
              </button>
            </div>

            <div className="space-y-3">
              {config.customFields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => {
                        const updated = [...config.customFields];
                        updated[idx].label = e.target.value;
                        setConfig({ ...config, customFields: updated });
                      }}
                      placeholder="Field Label"
                      className="px-2.5 py-1.5 bg-white rounded-lg border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none"
                    />
                    <select
                      value={field.type}
                      onChange={(e: any) => {
                        const updated = [...config.customFields];
                        updated[idx].type = e.target.value;
                        setConfig({ ...config, customFields: updated });
                      }}
                      className="px-2.5 py-1.5 bg-white rounded-lg border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none"
                    >
                      <option value="text">Text String</option>
                      <option value="number">Numeric</option>
                      <option value="select">Dropdown / Tag</option>
                    </select>
                    <input
                      type="text"
                      value={field.defaultValue}
                      onChange={(e) => {
                        const updated = [...config.customFields];
                        updated[idx].defaultValue = e.target.value;
                        setConfig({ ...config, customFields: updated });
                      }}
                      placeholder="Default Value"
                      className="px-2.5 py-1.5 bg-white rounded-lg border border-gray-200 text-xs font-mono text-gray-700 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomField(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition"
                    title="Remove Field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Change Order Generator & Simulator Preview */}
        <div className="space-y-6">
          {/* Change Order Generator Card */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0071E3] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Live Instantiation
              </span>
              <h3 className="text-sm font-semibold text-gray-900 mt-2">
                Generate Custom Change Order
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Instantly spawn a change request adhering to this active configuration.
              </p>
            </div>

            <form onSubmit={handleCreateCustomOrder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Change Title
                </label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. ${config.targetSystem} Fastener Protocol Upgrade`}
                  value={genTitle}
                  onChange={(e) => setGenTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Operational Purpose / Reason
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the failure containment or engineering defect justification..."
                  value={genReason}
                  onChange={(e) => setGenReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#0071E3] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Change Type
                </label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#0071E3]"
                >
                  <option value="DESIGN_MODIFICATION">DESIGN_MODIFICATION</option>
                  <option value="MATERIAL_SUBSTITUTION">MATERIAL_SUBSTITUTION</option>
                  <option value="PROCESS_REWORK">PROCESS_REWORK</option>
                  <option value="FASTENER_SECURITY">FASTENER_SECURITY</option>
                  <option value="CONTAINMENT_REPAIR">CONTAINMENT_REPAIR</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-medium transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  {saving ? 'Creating Order...' : `Create ${config.prefix} Order`}
                </button>
              </div>
            </form>
          </div>

          {/* Active Configuration Blueprint Summary Card */}
          <div className="p-6 rounded-3xl bg-[#FAFAFC] border border-gray-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider text-[10px]">
              Active Configuration Snapshot
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-200/60">
                <span className="text-gray-400">Industry Sector:</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <span>{config.icon}</span> {config.name}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200/60">
                <span className="text-gray-400">Standard:</span>
                <span className="font-mono text-gray-700 text-right">{config.complianceStandard}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200/60">
                <span className="text-gray-400">Prefix ID:</span>
                <span className="font-mono font-bold text-[#0071E3]">{config.prefix}-2026-XXXX</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200/60">
                <span className="text-gray-400">FMEA Escalation:</span>
                <span className="font-mono text-red-600 font-semibold">S &ge; {config.severityThreshold}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200/60">
                <span className="text-gray-400">BFS Blast Radius:</span>
                <span className="font-mono text-gray-700">{config.bfsDepth} degrees</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400">Active Gates:</span>
                <span className="font-semibold text-emerald-600">
                  {Object.values(config.qualityGates).filter(Boolean).length} enforced
                </span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={handleApplyPreset}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0071E3] text-xs font-semibold transition"
              >
                <span>Deploy Across Entire System</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
