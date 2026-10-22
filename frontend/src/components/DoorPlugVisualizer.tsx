import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Hash, 
  Wrench, 
  Check, 
  Lock,
  ArrowRight
} from 'lucide-react';

interface ComponentHotspot {
  id: string;
  name: string;
  code: string;
  x: number;
  y: number;
  status: 'ESCAPE_ROOT_CAUSE' | 'CRITICAL_RISK' | 'INSPECTION_HOLD' | 'VERIFIED';
  description: string;
  incidentFact: string;
  remedy: string;
  specs: string;
}

export const DoorPlugVisualizer: React.FC<{
  onSelectComponent?: (id: string) => void;
  selectedId?: string;
}> = ({ onSelectComponent, selectedId }) => {
  const [activeItem, setActiveItem] = useState<string>(selectedId || 'bolts');

  const hotspots: ComponentHotspot[] = [
    {
      id: 'bolts',
      name: '4 Vertical Retaining Bolts & Cotter Pins',
      code: 'C-105 / BAC-5001-4',
      x: 50,
      y: 22,
      status: 'ESCAPE_ROOT_CAUSE',
      description: 'Four vertical retaining bolts prevent the door plug from translating upward under aerodynamic vibration and cabin pressure differential.',
      incidentFact: 'NTSB confirmed all 4 retaining bolts were removed on Sept 18, 2023 for rivet repair and were NEVER reinstalled before flight.',
      remedy: 'ChangeLens locks aircraft release until digital torque wrench upload (BAC-5001-4, 160-190 in-lbs) and photographic cotter pin proof is Level II QA stamped.',
      specs: 'Specification: BACB30MR6K / Torque: 175 ± 10 in-lbs / Calibrated Tool Required'
    },
    {
      id: 'rivets',
      name: 'Spirit AeroSystems Fuselage Rivet Rework Area',
      code: 'STN-500-RVT',
      x: 20,
      y: 45,
      status: 'ESCAPE_ROOT_CAUSE',
      description: 'Four damaged rivets on fuselage frame 1480 delivered from Spirit AeroSystems in Wichita, requiring door opening.',
      incidentFact: 'Door plug was unbolted by specialized personnel without a formal digital traveler or work authorization record.',
      remedy: 'Serialized Digital Traveler Lock: Aircraft physical access requires biometric work order check-in with RFID tooling custody.',
      specs: 'Fuselage Frame Stn 1480 / Work Order: WO-737-9-RVT-0918'
    },
    {
      id: 'stoppads',
      name: '12 Pressure Stop Fittings & Stop Pads',
      code: 'C-107 / S-203',
      x: 80,
      y: 50,
      status: 'CRITICAL_RISK',
      description: '12 precision stop fittings (6 forward, 6 aft) transfer outward cabin pressurization load (up to 9.2 psid) into fuselage ring frames.',
      incidentFact: 'Without vertical retaining bolts, upward vibration caused stop fittings to disengage from frame pins, leading to explosive blowout.',
      remedy: 'Feeler gauge inspection I-402 mandatory digital record: clearance tolerance 0.015" - 0.035" verified across all 12 contact points.',
      specs: 'Material: Al 7075-T651 / Clearance: 0.025" ± 0.010" / 12 Contact Lugs'
    },
    {
      id: 'upperguide',
      name: 'Upper Guide Track & Roller Assembly',
      code: 'C-102 / DWG-737-53',
      x: 50,
      y: 10,
      status: 'INSPECTION_HOLD',
      description: 'Overhead guide tracks that capture guide pins to keep plug flush with fuselage outer mold line.',
      incidentFact: 'Guide pin lifted out of track when door plug shifted upward, allowing top of plug to tilt outboard into flight slipstream.',
      remedy: 'Dual visual alignment verification prior to interior sidewall insulation installation.',
      specs: 'Drawing DWG-737-53-0102 / Mates with C-105'
    },
    {
      id: 'hinge',
      name: 'Lower Hinge Fitting & Assist Springs',
      code: 'C-103 / C-106',
      x: 50,
      y: 88,
      status: 'VERIFIED',
      description: 'Lower hinge mechanism supporting plug weight during maintenance opening and translation.',
      incidentFact: 'Lower hinge pin guide remained attached until explosive outward rotation fractured hinge brackets.',
      remedy: 'Standard torque log verification with anti-rotation locking cotter pins.',
      specs: 'Assembly C-103 / Positive locking hinge pin'
    }
  ];

  const current = hotspots.find(h => h.id === activeItem) || hotspots[0];

  const handleSelect = (id: string) => {
    setActiveItem(id);
    if (onSelectComponent) onSelectComponent(id);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 p-7 shadow-xs font-sans">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
              Boeing 737-9 MAX Case Study Blueprint
            </span>
            <span className="text-xs font-mono text-gray-500 font-medium">Station 500 Mid-Cabin Exit Door Plug</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mt-1 tracking-tight">
            Interactive Door Plug Anatomy &amp; Quality Escape Vectors
          </h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-2xl">
            Click on any structural hotspot to inspect the exact failure mode identified by the NTSB and how ChangeLens enforces physical verification safeguards.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-gray-50 p-2.5 rounded-2xl border border-gray-200 self-start lg:self-auto flex-wrap">
          <div className="flex items-center gap-1.5 font-medium text-red-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            Root Escape Vector
          </div>
          <div className="flex items-center gap-1.5 font-medium text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Blowout Hazard
          </div>
          <div className="flex items-center gap-1.5 font-medium text-blue-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Verified Component
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-7 items-center">
        {/* Visual Schematic Diagram (Left / Center) */}
        <div className="lg:col-span-7 bg-[#FBFBFD] rounded-3xl border border-gray-200/90 p-6 flex flex-col items-center justify-center relative min-h-[460px] shadow-inner">
          <div className="absolute top-4 left-4 text-[11px] font-mono text-gray-400">
            VIEW: Looking Inboard (Fuselage Stn 500)
          </div>
          <div className="absolute top-4 right-4 text-[11px] font-mono text-gray-400">
            Cabin Pressure: 9.2 psid (16,000 ft)
          </div>

          {/* SVG Vector Blueprint */}
          <svg className="w-full max-w-[340px] h-[400px] select-none" viewBox="0 0 300 420" fill="none">
            {/* Fuselage Outline */}
            <rect x="30" y="20" width="240" height="380" rx="36" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="2"/>
            
            {/* Door Plug Perimeter Outer Edge */}
            <rect x="50" y="40" width="200" height="340" rx="28" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2.5" strokeDasharray="6 4"/>
            <rect x="58" y="48" width="184" height="324" rx="22" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5"/>

            {/* Upper Guide Tracks */}
            <rect x="90" y="48" width="120" height="14" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1"/>
            <circle cx="115" cy="55" r="4" fill="#0071E3"/>
            <circle cx="185" cy="55" r="4" fill="#0071E3"/>

            {/* 12 Pressure Stop Fittings (6 Left, 6 Right) */}
            {[80, 130, 180, 230, 280, 330].map((y, idx) => (
              <g key={`stop-l-${idx}`}>
                <rect x="42" y={y} width="16" height="18" rx="3" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.2"/>
                <line x1="50" y1={y+2} x2="50" y2={y+16} stroke="#0071E3" strokeWidth="1.5"/>
              </g>
            ))}
            {[80, 130, 180, 230, 280, 330].map((y, idx) => (
              <g key={`stop-r-${idx}`}>
                <rect x="242" y={y} width="16" height="18" rx="3" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.2"/>
                <line x1="250" y1={y+2} x2="250" y2={y+16} stroke="#0071E3" strokeWidth="1.5"/>
              </g>
            ))}

            {/* Door Plug Center Stiffeners */}
            <line x1="150" y1="65" x2="150" y2="355" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4"/>
            <rect x="85" y="140" width="130" height="130" rx="16" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1.5"/>
            <text x="150" y="210" fill="#94A3B8" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
              MID-CABIN PLUG
            </text>
            <text x="150" y="226" fill="#CBD5E1" fontSize="9" textAnchor="middle" fontFamily="monospace">
              DE-ACTIVATED EXIT
            </text>

            {/* 4 Critical Vertical Retaining Bolts (Upper Left, Upper Right, Lower Left, Lower Right) */}
            {/* Upper Bolts */}
            <g className="cursor-pointer" onClick={() => handleSelect('bolts')}>
              <circle cx="105" cy="88" r="9" fill={activeItem === 'bolts' ? '#EF4444' : '#FEE2E2'} stroke="#EF4444" strokeWidth="2"/>
              <text x="105" y="92" fill={activeItem === 'bolts' ? '#FFFFFF' : '#EF4444'} fontSize="10" fontWeight="bold" textAnchor="middle">1</text>
            </g>
            <g className="cursor-pointer" onClick={() => handleSelect('bolts')}>
              <circle cx="195" cy="88" r="9" fill={activeItem === 'bolts' ? '#EF4444' : '#FEE2E2'} stroke="#EF4444" strokeWidth="2"/>
              <text x="195" y="92" fill={activeItem === 'bolts' ? '#FFFFFF' : '#EF4444'} fontSize="10" fontWeight="bold" textAnchor="middle">2</text>
            </g>

            {/* Lower Bolts */}
            <g className="cursor-pointer" onClick={() => handleSelect('bolts')}>
              <circle cx="105" cy="335" r="9" fill={activeItem === 'bolts' ? '#EF4444' : '#FEE2E2'} stroke="#EF4444" strokeWidth="2"/>
              <text x="105" y="339" fill={activeItem === 'bolts' ? '#FFFFFF' : '#EF4444'} fontSize="10" fontWeight="bold" textAnchor="middle">3</text>
            </g>
            <g className="cursor-pointer" onClick={() => handleSelect('bolts')}>
              <circle cx="195" cy="335" r="9" fill={activeItem === 'bolts' ? '#EF4444' : '#FEE2E2'} stroke="#EF4444" strokeWidth="2"/>
              <text x="195" y="339" fill={activeItem === 'bolts' ? '#FFFFFF' : '#EF4444'} fontSize="10" fontWeight="bold" textAnchor="middle">4</text>
            </g>

            {/* Spirit Rivet Rework Hotspot */}
            <g className="cursor-pointer" onClick={() => handleSelect('rivets')}>
              <rect x="62" y="180" width="18" height="40" rx="4" fill={activeItem === 'rivets' ? '#EF4444' : '#FEF3C7'} stroke={activeItem === 'rivets' ? '#EF4444' : '#F59E0B'} strokeWidth="1.8"/>
              <circle cx="71" cy="190" r="2" fill="#D97706"/>
              <circle cx="71" cy="200" r="2" fill="#D97706"/>
              <circle cx="71" cy="210" r="2" fill="#D97706"/>
            </g>

            {/* Lower Hinge Springs */}
            <rect x="110" y="360" width="80" height="14" rx="4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1"/>
            <path d="M125 363 Q130 371 135 363 Q140 371 145 363" stroke="#64748B" strokeWidth="2" fill="none"/>
            <path d="M155 363 Q160 371 165 363 Q170 371 175 363" stroke="#64748B" strokeWidth="2" fill="none"/>
          </svg>

          {/* Prompt banner under graphic */}
          <div className="mt-3 text-[11px] font-medium text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-2xs">
            Interactive Hotspot Active: <span className="font-semibold text-gray-900">{current.name}</span>
          </div>
        </div>

        {/* Component Detail & Safeguard Card (Right Side) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  Structural Identifier: {current.code}
                </span>
                <h4 className="text-base font-bold text-gray-900 mt-0.5">
                  {current.name}
                </h4>
              </div>

              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                current.status === 'ESCAPE_ROOT_CAUSE'
                  ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                  : current.status === 'CRITICAL_RISK'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {current.status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Engineering Description */}
            <div className="text-xs text-gray-600 leading-relaxed">
              {current.description}
            </div>

            {/* NTSB Accident Finding */}
            <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                NTSB Case Study Finding (Fact)
              </div>
              <p className="text-xs text-red-900 leading-relaxed font-normal">
                {current.incidentFact}
              </p>
            </div>

            {/* ChangeLens Solution & Prevention */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ChangeLens System Safeguard (Remedy)
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed font-normal">
                {current.remedy}
              </p>
            </div>

            {/* Technical Specifications */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] font-mono text-gray-500">
              {current.specs}
            </div>
          </div>

          {/* Quick Hotspot Switcher Buttons */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {hotspots.map((h) => (
              <button
                key={h.id}
                onClick={() => handleSelect(h.id)}
                className={`p-2.5 rounded-xl border text-left transition text-xs font-medium ${
                  activeItem === h.id
                    ? 'bg-blue-50 text-[#0071E3] border-blue-200 font-semibold shadow-2xs'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <div className="truncate">{h.name.split(' ')[0]} {h.name.split(' ')[1]}</div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">{h.code}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
