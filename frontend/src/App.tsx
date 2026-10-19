import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { OverviewView } from './features/overview/OverviewView';
import { ChangeWorkspaceView } from './features/changes/ChangeWorkspaceView';
import { ImpactExplorerView } from './features/impact/ImpactExplorerView';
import { RiskControlsView } from './features/risks/RiskControlsView';
import { VerificationGatesView } from './features/evidence/VerificationGatesView';
import { ReviewQueueView } from './features/approvals/ReviewQueueView';
import { ReportsView } from './features/reports/ReportsView';
import { IlmCaseStudyView } from './features/ilm/IlmCaseStudyView';
import { api, User, ChangeRequest } from './api/client';
import { GitBranch, Shield, Activity, Bell } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [selectedChangeId, setSelectedChangeId] = useState<string>('CCR-2026-0001');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [blockedCount, setBlockedCount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

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

  const handleNavigate = (tab: NavTab, changeId?: string) => {
    if (changeId) setSelectedChangeId(changeId);
    setCurrentTab(tab);
  };

  const currentChange = changes.find((c) => c.id === selectedChangeId) || changes[0];

  return (
    <div className="flex h-screen bg-[#0B0F17] text-slate-100 overflow-hidden font-sans">
      {/* Persistent Industrial Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        currentUser={currentUser}
        allUsers={allUsers}
        onUserChange={(u) => setCurrentUser(u)}
        blockedCount={blockedCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top App Header / System Status Bar */}
        <header className="h-14 border-b border-[#1E293B] bg-[#0F172A] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-300">
                SYSTEM ACTIVE
              </span>
            </div>

            <div className="h-4 w-px bg-slate-800" />

            {/* Active Change Selector Indicator */}
            {currentChange && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Active Change:</span>
                <span className="font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                  {currentChange.id}
                </span>
                <span className="text-slate-300 truncate max-w-xs hidden md:inline">
                  {currentChange.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {currentChange.state}
                </span>
              </div>
            )}
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#121A2E] border border-slate-800 text-[11px] font-mono text-slate-400">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>NetworkX BFS</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#121A2E] border border-slate-800 text-[11px] font-mono text-slate-400">
              <Shield className="w-3.5 h-3.5 text-red-400" />
              <span>AIAG/VDA FMEA</span>
            </div>

            <div className="h-4 w-px bg-slate-800" />

            <div className="text-xs font-mono text-slate-400">
              User: <span className="text-slate-200 font-semibold">{currentUser?.display_name.split(' ')[0]}</span> ({currentUser?.role})
            </div>
          </div>
        </header>

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0B0F17]">
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
    </div>
  );
};

export default App;
