import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { GuidedTourModal } from './components/GuidedTourModal';
import { OverviewView } from './features/overview/OverviewView';
import { ChangeWorkspaceView } from './features/changes/ChangeWorkspaceView';
import { ImpactExplorerView } from './features/impact/ImpactExplorerView';
import { RiskControlsView } from './features/risks/RiskControlsView';
import { VerificationGatesView } from './features/evidence/VerificationGatesView';
import { ReviewQueueView } from './features/approvals/ReviewQueueView';
import { ReportsView } from './features/reports/ReportsView';
import { IndustryCustomizerView, IndustrySector, INDUSTRY_PRESETS } from './features/customizer/IndustryCustomizerView';
import { DoorPlugVisualizer } from './components/DoorPlugVisualizer';
import { IncidentEscapeSimulator } from './components/IncidentEscapeSimulator';
import { api, User, ChangeRequest } from './api/client';
import { 
  Shield, 
  Activity, 
  Search, 
  Sparkles,
  Command,
  X,
  Sliders,
  ChevronDown,
  Layers
} from 'lucide-react';

const SECTOR_OPTIONS: { id: IndustrySector; label: string; icon: string; defaultChangeId: string }[] = [
  { id: 'AEROSPACE', label: 'Aerospace', icon: '✈️', defaultChangeId: 'CCR-2026-0001' },
  { id: 'AUTOMOTIVE', label: 'Automotive EV', icon: '🚗', defaultChangeId: 'ECO-2026-0814' },
  { id: 'MEDTECH', label: 'MedTech', icon: '🏥', defaultChangeId: 'ECN-2026-4402' },
  { id: 'SEMICONDUCTOR', label: 'Semiconductor', icon: '⚡', defaultChangeId: 'CR-2026-9011' },
  { id: 'ENERGY', label: 'Nuclear Energy', icon: '🏭', defaultChangeId: 'MOC-2026-1180' },
  { id: 'CUSTOM', label: 'Enterprise Custom', icon: '⚙️', defaultChangeId: 'CCR-2026-0001' }
];

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [currentIndustry, setCurrentIndustry] = useState<IndustrySector>('AEROSPACE');
  const [selectedChangeId, setSelectedChangeId] = useState<string>('CCR-2026-0001');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [blockedCount, setBlockedCount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isDoorPlugOpen, setIsDoorPlugOpen] = useState<boolean>(false);
  const [isEscapeSimOpen, setIsEscapeSimOpen] = useState<boolean>(false);

  const initData = async () => {
    try {
      setLoading(true);
      const [users, crList, metrics] = await Promise.all([
        api.listUsers(),
        api.listChangeRequests(),
        api.getOverviewMetrics()
      ]);
      setAllUsers(users);
      if (users.length > 0 && !currentUser) {
        setCurrentUser(users[0]);
      }
      setChanges(crList);
      setBlockedCount(metrics.blocked_changes);
    } catch (err) {
      console.error('Initial data load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  // Keyboard shortcuts: Ctrl+K or Cmd+K for command palette, 1-8 for tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if (!isCommandOpen && !isTourOpen && !isDoorPlugOpen && !isEscapeSimOpen && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        const keyMap: Record<string, NavTab> = {
          '1': 'overview',
          '2': 'changes',
          '3': 'impact',
          '4': 'risks',
          '5': 'evidence',
          '6': 'approvals',
          '7': 'reports',
          '8': 'customizer',
        };
        if (keyMap[e.key]) {
          setCurrentTab(keyMap[e.key]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen, isTourOpen, isDoorPlugOpen, isEscapeSimOpen]);

  const handleNavigate = (tab: NavTab, changeId?: string) => {
    if (changeId) setSelectedChangeId(changeId);
    setCurrentTab(tab);
  };

  const handleSectorChange = (sector: IndustrySector, changeId?: string) => {
    setCurrentIndustry(sector);
    const targetChange = changeId || SECTOR_OPTIONS.find(s => s.id === sector)?.defaultChangeId || 'CCR-2026-0001';
    setSelectedChangeId(targetChange);
  };

  const currentChange = changes.find((c) => c.id === selectedChangeId) || changes[0];
  const activeSectorConfig = INDUSTRY_PRESETS[currentIndustry] || INDUSTRY_PRESETS.AEROSPACE;

  return (
    <div className="flex h-screen bg-[#F5F5F7] text-gray-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        currentUser={currentUser}
        allUsers={allUsers}
        onUserChange={(u) => setCurrentUser(u)}
        blockedCount={blockedCount}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Glass Status Bar */}
        <header className="h-16 border-b border-gray-200/80 glass-header px-6 flex items-center justify-between shrink-0 z-10 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Multi-Industry Sector Switcher */}
            <div className="relative shrink-0">
              <select
                value={currentIndustry}
                onChange={(e) => handleSectorChange(e.target.value as IndustrySector)}
                className="appearance-none bg-white text-xs font-semibold text-gray-800 border border-gray-200 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:border-[#0071E3] cursor-pointer shadow-2xs hover:bg-gray-50 transition"
              >
                {SECTOR_OPTIONS.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.icon} {sec.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="h-4 w-px bg-gray-200 hidden sm:block" />

            {/* Active Change Selector Dropdown */}
            {currentChange && (
              <div className="flex items-center gap-2 text-xs truncate">
                <select
                  value={selectedChangeId}
                  onChange={(e) => setSelectedChangeId(e.target.value)}
                  className="bg-white text-xs font-mono font-semibold text-gray-900 border border-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#0071E3] cursor-pointer shadow-2xs shrink-0"
                >
                  {changes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} ({c.priority})
                    </option>
                  ))}
                </select>
                <span className="text-gray-600 truncate max-w-[200px] xl:max-w-xs hidden lg:inline font-normal">
                  {currentChange.title}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0 hidden md:inline-block ${
                  currentChange.state === 'AUTHORIZED' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentChange.state === 'REJECTED'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {currentChange.state}
                </span>
              </div>
            )}
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Boeing Case Study Quick Modals */}
            <button
              onClick={() => setIsDoorPlugOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 transition shadow-2xs"
              title="Inspect 3D Door Plug Schematic"
            >
              <span>✈️ Door Plug</span>
            </button>

            <button
              onClick={() => setIsEscapeSimOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 transition shadow-2xs"
              title="Launch Alaska 1282 Incident Escape Simulator"
            >
              <span>🛡️ Escape Sim</span>
            </button>

            {/* Command Palette Trigger Button */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs text-gray-500 hover:text-gray-900 transition-all shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden md:inline">Search...</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-gray-400 font-mono">⌘K</kbd>
            </button>

            {/* Showcase Tour Trigger Button */}
            <button
              onClick={() => setIsTourOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100/70 border border-blue-200 text-xs font-semibold text-[#0071E3] transition-all shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
              <span className="hidden sm:inline">Tour</span>
            </button>

            <div className="h-4 w-px bg-gray-200 hidden sm:block" />

            {/* Active User Pill */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-1 text-xs">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071E3] to-[#409CFF] flex items-center justify-center font-bold text-white text-xs shadow-xs">
                  {currentUser.display_name.charAt(0)}
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-semibold text-gray-900 leading-tight">
                    {currentUser.display_name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono leading-tight">
                    {currentUser.role}
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-7 bg-[#F5F5F7]">
          {currentTab === 'overview' && (
            <OverviewView
              onNavigate={handleNavigate}
              selectedChangeId={selectedChangeId}
              currentIndustry={currentIndustry}
              onOpenDoorPlug={() => setIsDoorPlugOpen(true)}
              onOpenEscapeSim={() => setIsEscapeSimOpen(true)}
            />
          )}

          {currentTab === 'changes' && (
            <ChangeWorkspaceView
              changeId={selectedChangeId}
              onSelectChange={(id) => setSelectedChangeId(id)}
              onNavigate={handleNavigate}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'impact' && (
            <ImpactExplorerView changeId={selectedChangeId} />
          )}

          {currentTab === 'risks' && (
            <RiskControlsView
              changeId={selectedChangeId}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'evidence' && (
            <VerificationGatesView
              changeId={selectedChangeId}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'approvals' && (
            <ReviewQueueView
              changeId={selectedChangeId}
              currentUser={currentUser}
              onRefresh={initData}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              changeId={selectedChangeId}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'customizer' && (
            <IndustryCustomizerView
              currentIndustry={currentIndustry}
              onSelectIndustry={handleSectorChange}
              onNavigate={handleNavigate}
              currentUser={currentUser}
            />
          )}
        </main>
      </div>

      {/* 3D Door Plug Blueprint Modal */}
      {isDoorPlugOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsDoorPlugOpen(false)}
        >
          <div 
            className="w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">✈️</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                    Boeing 737-9 MAX Station 500 Mid-Exit Door Plug Blueprint
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Interactive engineering schematic with retaining bolt hotspots and FAA AC-05 safeguards
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDoorPlugOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFC]">
              <DoorPlugVisualizer onSelectComponent={(id) => console.log('Selected hotspot', id)} />
            </div>
          </div>
        </div>
      )}

      {/* Incident Escape Simulator Modal */}
      {isEscapeSimOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsEscapeSimOpen(false)}
        >
          <div 
            className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🛡️</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                    Incident Escape Simulator &middot; Alaska Airlines Flight 1282 vs ChangeLens
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Interactive 5-stage comparison demonstrating deterministic quality gate containment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEscapeSimOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFC]">
              <IncidentEscapeSimulator />
            </div>
          </div>
        </div>
      )}

      {/* Floating Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectTab={handleNavigate}
        onOpenTour={() => {
          setIsCommandOpen(false);
          setIsTourOpen(true);
        }}
      />

      {/* Showcase Tour Modal */}
      <GuidedTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={(tab) => handleNavigate(tab, selectedChangeId)}
      />
    </div>
  );
};

export default App;
