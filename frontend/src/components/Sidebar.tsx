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
  Plane,
  UserCheck,
  ChevronDown
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
    { id: 'overview', label: 'Executive Dashboard', icon: LayoutDashboard, shortcut: '1' },
    { id: 'changes', label: 'Change Workspace', icon: GitBranch, shortcut: '2' },
    { id: 'impact', label: 'Impact Graph Explorer', icon: Network, shortcut: '3' },
    { id: 'risks', label: 'Risk Controls (FMEA)', icon: ShieldAlert, shortcut: '4' },
    { 
      id: 'evidence', 
      label: 'Verification & Gates', 
      icon: FileCheck2, 
      shortcut: '5',
      badge: blockedCount > 0 ? `${blockedCount} BLOCKED` : undefined,
      badgeColor: 'bg-rose-950/80 text-rose-400 border border-rose-800'
    },
    { id: 'approvals', label: 'Review Queue & SoD', icon: CheckSquare, shortcut: '6' },
    { id: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet, shortcut: '7' },
    { id: 'ilm', label: 'ILM Case Study', icon: GraduationCap, shortcut: '8' }
  ];

  return (
    <aside className="w-64 h-screen bg-[#070b14] border-r border-slate-800/80 flex flex-col shrink-0 select-none font-sans z-20">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-lg shadow-cyan-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-[#080d1a] rounded-[10px] flex items-center justify-center">
              <Plane className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black tracking-tight text-white uppercase">
                ChangeLens
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold">
                2026
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
              Boeing 737-9 MAX Case
            </p>
          </div>
        </div>
      </div>

      {/* User Persona & Separation-of-Duties Selector */}
      <div className="px-3.5 py-3 border-b border-slate-800/60 bg-[#0a0f1d]/60">
        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
          <span>Active Persona (FAA SoD)</span>
          <UserCheck className="w-3 h-3 text-cyan-400" />
        </div>
        <div className="relative">
          <select
            value={currentUser?.id || ''}
            onChange={(e) => {
              const selected = allUsers.find((u) => u.id === e.target.value);
              if (selected) onUserChange(selected);
            }}
            className="w-full appearance-none bg-slate-900/90 text-xs text-slate-200 border border-slate-700/80 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium hover:border-slate-600 transition-colors"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200 py-1">
                {u.display_name} ({u.role})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>
        {currentUser && (
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">Approval Power:</span>
            <span className={`px-1.5 py-0.5 rounded font-bold ${
              currentUser.role === 'APPROVER' 
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : currentUser.role === 'REQUESTER'
                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                : 'bg-blue-950 text-blue-400 border border-blue-800'
            }`}>
              {currentUser.role === 'APPROVER' ? 'FINAL AUTHORIZER' : currentUser.role === 'REQUESTER' ? 'SELF-APPROVE BLOCKED' : 'VERIFIER ONLY'}
            </span>
          </div>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2.5 mb-1">
          Workspaces
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as NavTab)}
              className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/60 to-blue-950/40 text-cyan-300 border border-cyan-800/80 shadow-md shadow-cyan-950/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
                <kbd className="hidden group-hover:inline-block text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {item.shortcut}
                </kbd>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Guided Showcase Tour Banner */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090e1a]">
        <button
          onClick={onOpenTour}
          className="w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600/20 via-indigo-600/20 to-purple-600/20 hover:from-cyan-600/30 hover:to-purple-600/30 border border-cyan-500/40 text-cyan-300 flex items-center justify-between text-xs font-bold transition-all shadow-lg shadow-cyan-950/20 group"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow group-hover:scale-110 transition-transform" />
            <span>Showcase Tour</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
            Guided
          </span>
        </button>

        <div className="mt-2 text-[10px] font-mono text-center text-slate-400">
          ChangeLens v1.0.0 · 2026 Production
        </div>
      </div>
    </aside>
  );
};
