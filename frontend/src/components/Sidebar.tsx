import React from 'react';
import {
  LayoutDashboard,
  GitBranch,
  Network,
  ShieldAlert,
  FileCheck2,
  CheckSquare,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  Aperture,
  UserCheck,
  ChevronDown,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { User } from '../api/client';

export type NavTab = 
  | 'overview' 
  | 'changes' 
  | 'impact' 
  | 'risks' 
  | 'evidence' 
  | 'approvals' 
  | 'reports' 
  | 'ilm';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: User | null;
  allUsers: User[];
  onUserChange: (user: User) => void;
  blockedCount: number;
  onOpenTour: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  allUsers,
  onUserChange,
  blockedCount,
  onOpenTour
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Executive Dashboard', icon: LayoutDashboard, shortcut: '1' },
    { id: 'changes' as NavTab, label: 'Change Workspace', icon: GitBranch, shortcut: '2' },
    { id: 'impact' as NavTab, label: 'Impact Graph Explorer', icon: Network, shortcut: '3' },
    { id: 'risks' as NavTab, label: 'Risk Controls (FMEA)', icon: ShieldAlert, shortcut: '4' },
    { 
      id: 'evidence' as NavTab, 
      label: 'Verification & Gates', 
      icon: FileCheck2, 
      shortcut: '5',
      badge: blockedCount > 0 ? `${blockedCount} BLOCKED` : undefined,
      badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
    },
    { id: 'approvals' as NavTab, label: 'Review Queue & SoD', icon: CheckSquare, shortcut: '6' },
    { id: 'reports' as NavTab, label: 'Reports & Exports', icon: FileSpreadsheet, shortcut: '7' },
    { id: 'ilm' as NavTab, label: 'ILM Case Study', icon: GraduationCap, shortcut: '8' }
  ];

  return (
    <aside className="w-64 h-screen bg-[#090d16] border-r border-slate-800/70 flex flex-col shrink-0 select-none font-sans z-20">
      {/* 2026 Sleek Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800/70 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1.5px] shadow-md shadow-cyan-950/40 flex items-center justify-center">
            <div className="w-full h-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center">
              <Aperture className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white font-sans">
                ChangeLens
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                2026
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Aerospace Configuration Desk
            </p>
          </div>
        </div>
      </div>

      {/* User Persona & Separation-of-Duties Card */}
      <div className="p-3 border-b border-slate-800/60 bg-slate-900/30">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-2 px-1">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            Active Persona
          </span>
          <span className="text-[10px] font-mono text-slate-500">FAA SoD</span>
        </div>
        
        <div className="relative">
          <select
            value={currentUser?.id || ''}
            onChange={(e) => {
              const selected = allUsers.find((u) => u.id === e.target.value);
              if (selected) onUserChange(selected);
            }}
            className="w-full appearance-none bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700/70 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium transition-all shadow-sm"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200 py-1">
                {u.display_name} ({u.role})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {currentUser && (
          <div className="mt-2 px-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Authority:</span>
            <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold border ${
              currentUser.role === 'APPROVER' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : currentUser.role === 'REQUESTER'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              {currentUser.role === 'APPROVER' ? 'Final Sign-off' : currentUser.role === 'REQUESTER' ? 'Self-Sign Blocked' : 'Quality Verify'}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Tab Menu */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Workspaces
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all duration-150 ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm shadow-cyan-950/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
                <kbd className="hidden lg:inline-block text-[10px] font-mono text-slate-500 px-1 py-0.5 rounded bg-slate-800/60 border border-slate-700/50">
                  {item.shortcut}
                </kbd>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modern Bottom Tour & System Status */}
      <div className="p-3 border-t border-slate-800/70 bg-slate-900/40 space-y-2">
        <button
          onClick={onOpenTour}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Tour</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-200">
            Guide
          </span>
        </button>

        <div className="px-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ChangeLens v2.6.0
          </span>
          <span>Boeing 737-9</span>
        </div>
      </div>
    </aside>
  );
};
