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
import { IlmCaseStudyView } from './features/ilm/IlmCaseStudyView';
import { api, User, ChangeRequest } from './api/client';
import { 
  GitBranch, 
  Shield, 
  Activity, 
  Search, 
  Sparkles, 
  AlertTriangle,
  Zap
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
        setCurrentUser(users[0]); // default to Marcus Vance (Requester)
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
      } else if (!isCommandOpen && !isTourOpen && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        const keyMap: Record<string, NavTab> = {
          '1': 'overview',
          '2': 'changes',
          '3': 'impact',
          '4': 'risks',
          '5': 'evidence',
          '6': 'approvals',
          '7': 'reports',
          '8': 'ilm'
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
    <div className="flex h-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* Persistent Industrial HUD Sidebar */}
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
        {/* Top 2026 Aerospace HUD Status Bar */}
        <header className="h-16 border-b border-slate-800/70 bg-slate-900/70 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            {/* System Status Beacon */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <span className="font-bold text-slate-300">
                {api.getIsLiveBackend() ? 'FASTAPI LIVE' : 'SHOWCASE DEMO ENGINE'}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-800 hidden md:block" />

            {/* Active Change Selector Dropdown */}
            {currentChange && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 hidden lg:inline">Active Change:</span>
                <select
                  value={selectedChangeId}
                  onChange={(e) => setSelectedChangeId(e.target.value)}
                  className="bg-slate-900/90 text-xs font-mono font-bold text-cyan-300 border border-slate-700/80 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {changes.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                      {c.id} - {c.priority}
                    </option>
                  ))}
                </select>
                <span className="text-slate-300 truncate max-w-xs hidden xl:inline font-medium">
                  {currentChange.title}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                  currentChange.state === 'AUTHORIZED' 
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                    : currentChange.state === 'REJECTED'
                    ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                    : 'bg-amber-950/80 text-amber-400 border-amber-800'
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-400 hover:text-slate-200 transition-colors shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Ctrl+K</kbd>
            </button>

            {/* Showcase Tour Trigger Button */}
            <button
              onClick={() => setIsTourOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 border border-cyan-500/40 text-xs font-bold text-cyan-300 transition-colors shadow-sm shadow-cyan-950/30"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Tour</span>
            </button>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            {/* Verification Tech Badges */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>NetworkX BFS</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>AIAG/VDA FMEA</span>
              </div>
            </div>

            {/* Active User Pill */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-1 text-xs">
                <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center font-mono font-bold text-cyan-300 text-[11px]">
                  {currentUser.display_name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {currentUser.display_name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 leading-tight">
                    {currentUser.role}
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#090d16]">
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

          {currentTab === 'ilm' && <IlmCaseStudyView />}
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
