import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  GitBranch, 
  Network, 
  ShieldAlert, 
  FileCheck2, 
  CheckSquare, 
  FileSpreadsheet, 
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  Sliders
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab, changeId?: string) => void;
  onOpenTour: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenTour
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const items = [
    { id: 'tour', title: 'Launch Guided Showcase Tour', category: 'Showcase', icon: Sparkles, color: 'text-blue-600', action: () => onOpenTour() },
    { id: 'tab-overview', title: 'Go to Operations Dashboard', category: 'Navigation', icon: LayoutDashboard, color: 'text-blue-600', action: () => onSelectTab('overview') },
    { id: 'tab-changes', title: 'Go to Change Orders Workspace', category: 'Navigation', icon: GitBranch, color: 'text-blue-600', action: () => onSelectTab('changes') },
    { id: 'tab-impact', title: 'Go to Impact Graph Explorer', category: 'Navigation', icon: Network, color: 'text-purple-600', action: () => onSelectTab('impact') },
    { id: 'tab-risks', title: 'Go to Risk & FMEA Register', category: 'Navigation', icon: ShieldAlert, color: 'text-red-600', action: () => onSelectTab('risks') },
    { id: 'tab-evidence', title: 'Go to Quality Gates & Verification', category: 'Navigation', icon: FileCheck2, color: 'text-emerald-600', action: () => onSelectTab('evidence') },
    { id: 'tab-approvals', title: 'Go to Review Queue & Governance', category: 'Navigation', icon: CheckSquare, color: 'text-emerald-600', action: () => onSelectTab('approvals') },
    { id: 'tab-reports', title: 'Go to Reports & Exports (PDF/Word/Excel)', category: 'Navigation', icon: FileSpreadsheet, color: 'text-amber-600', action: () => onSelectTab('reports') },
    { id: 'tab-customizer', title: 'Go to Industry Customizer Studio', category: 'Navigation', icon: Sliders, color: 'text-blue-600', action: () => onSelectTab('customizer') },
    
    // Multi-Industry Quick Change Switchers
    { id: 'cr-aero', title: 'CCR-2026-0001: Aerospace (Boeing 737-9 Door Plug)', category: 'Aerospace', icon: GitBranch, color: 'text-red-600', action: () => onSelectTab('changes', 'CCR-2026-0001') },
    { id: 'cr-auto', title: 'ECO-2026-0814: Automotive (800V EV Battery Pack)', category: 'Automotive', icon: GitBranch, color: 'text-blue-600', action: () => onSelectTab('changes', 'ECO-2026-0814') },
    { id: 'cr-med', title: 'ECN-2026-4402: MedTech (Pacemaker Titanium Weld)', category: 'MedTech', icon: GitBranch, color: 'text-emerald-600', action: () => onSelectTab('changes', 'ECN-2026-4402') },
    { id: 'cr-semi', title: 'CR-2026-9011: Semiconductor (3nm EUV Reticle Stage)', category: 'Semiconductor', icon: GitBranch, color: 'text-purple-600', action: () => onSelectTab('changes', 'CR-2026-9011') },
    { id: 'cr-energy', title: 'MOC-2026-1180: Nuclear Energy (Steam Isolation Valve)', category: 'Energy', icon: GitBranch, color: 'text-amber-600', action: () => onSelectTab('changes', 'MOC-2026-1180') },
    
    // Key Benchmark Aircraft Components
    { id: 'comp-105', title: 'C-105: Upper Guide Pin & Retaining Bolt Assembly', category: 'Airframe Component', icon: Network, color: 'text-blue-600', action: () => onSelectTab('impact', 'CCR-2026-0001') },
    { id: 'comp-104', title: 'C-104: Mid-Exit Door Plug Panel Structure', category: 'Airframe Component', icon: Network, color: 'text-blue-600', action: () => onSelectTab('impact', 'CCR-2026-0001') },
    { id: 'comp-spec', title: 'S-202: Fastener Installation & Torque Spec BAC-5001-4', category: 'Specification', icon: ShieldAlert, color: 'text-amber-600', action: () => onSelectTab('risks', 'CCR-2026-0001') },
    { id: 'comp-proc', title: 'P-302: Retaining Bolt Installation Procedure SOP-737-44-09', category: 'Process Traveler', icon: FileCheck2, color: 'text-emerald-600', action: () => onSelectTab('evidence', 'CCR-2026-0001') }
  ];

  const filteredItems = items.filter(
    (item) => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div 
        className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar Input */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, component (C-105), order (CCR, ECO, ECN), or workspace..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 border border-gray-200 text-[10px] font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No matching commands or components found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 text-blue-900 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                    <span className="truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-gray-500 uppercase px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/70 text-[11px] font-mono text-gray-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500">↑</kbd><kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500">↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500">↵</kbd> to select</span>
          </div>
          <span className="text-blue-600 font-medium font-sans">ChangeLens Engine</span>
        </div>
      </div>
    </div>
  );
};
