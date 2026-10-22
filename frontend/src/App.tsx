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
import { api, User, ChangeRequest } from './api/client';
import { 
  Shield, 
  Activity, 
  Search, 
  Sparkles,
  Command
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [selectedChangeId, setSelectedChangeId] = useState<string>('CCR-2026-0001');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [blockedCount, setBlockedCount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

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

  // Keyboard shortcuts: Ctrl+K or Cmd+K for command palette, 1-7 for tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if (!isCommandOpen && !isTourOpen && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        const keyMap: Record<string, NavTab> = {
          '1': 'overview',
          '2': 'changes',
          '3': 'impact',
          '4': 'risks',
          '5': 'evidence',
          '6': 'approvals',
          '7': 'reports',
        };
        if (keyMap[e.key]) {
          setCurrentTab(keyMap[e.key]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen, isTourOpen]);

  const handleNavigate = (tab: NavTab, changeId?: string) => {
    if (changeId) setSelectedChangeId(changeId);
    setCurrentTab(tab);
  };

  const currentChange = changes.find((c) => c.id === selectedChangeId) || changes[0];

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
        <header className="h-16 border-b border-gray-200/80 glass-header px-7 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            {/* System Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
              <span className="font-medium text-gray-600">
                {api.getIsLiveBackend() ? 'Live Telemetry' : 'Demo Mode'}
              </span>
            </div>

            <div className="h-4 w-px bg-gray-200 hidden md:block" />

            {/* Active Change Selector Dropdown */}
            {currentChange && (
              <div className="flex items-center gap-2.5 text-xs">
                <span className="text-gray-400 font-medium hidden lg:inline">Change Order:</span>
                <select
                  value={selectedChangeId}
                  onChange={(e) => setSelectedChangeId(e.target.value)}
                  className="bg-white text-xs font-semibold text-gray-900 border border-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#0071E3] cursor-pointer shadow-2xs"
                >
                  {changes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} ({c.priority})
                    </option>
                  ))}
                </select>
                <span className="text-gray-600 truncate max-w-xs hidden xl:inline font-normal">
                  {currentChange.title}
                </span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${
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
          <div className="flex items-center gap-3">
            {/* Command Palette Trigger Button */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs text-gray-500 hover:text-gray-900 transition-all shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-gray-400 font-mono">⌘K</kbd>
            </button>

            {/* Showcase Tour Trigger Button */}
            <button
              onClick={() => setIsTourOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100/70 border border-blue-200 text-xs font-semibold text-[#0071E3] transition-all shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
              <span className="hidden md:inline">Tour</span>
            </button>

            <div className="h-4 w-px bg-gray-200 hidden sm:block" />

            {/* Technology Safeguard Badges */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[11px] text-gray-600 shadow-2xs">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium">NetworkX BFS</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[11px] text-gray-600 shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-red-600" />
                <span className="font-medium">AIAG &amp; VDA</span>
              </div>
            </div>

            {/* Active User Pill */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-1.5 text-xs">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071E3] to-[#409CFF] flex items-center justify-center font-bold text-white text-xs shadow-xs">
                  {currentUser.display_name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
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
        </main>
      </div>

      {/* Floating Modals */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectTab={handleNavigate}
        onOpenTour={() => {
          setIsCommandOpen(false);
          setIsTourOpen(true);
        }}
      />

      <GuidedTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={(tab) => handleNavigate(tab, selectedChangeId)}
      />
    </div>
  );
};

export default App;
