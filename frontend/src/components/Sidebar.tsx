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
  ChevronRight,
  UserCheck
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  allUsers,
  onUserChange,
  blockedCount
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'changes', label: 'Change Workspace', icon: GitBranch },
    { id: 'impact', label: 'Impact Explorer', icon: Network },
    { id: 'risks', label: 'Risk & Controls', icon: ShieldAlert },
    { 
      id: 'evidence', 
      label: 'Verification & Gates', 
      icon: FileCheck2, 
      badge: blockedCount > 0 ? `${blockedCount} BLOCKED` : undefined,
      badgeColor: 'bg-red-950 text-red-400 border border-red-800'
    },
    { id: 'approvals', label: 'Review Queue', icon: CheckSquare },
    { id: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet },
    { id: 'ilm', label: 'ILM Case Study', icon: GraduationCap }
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-[#1E293B] flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1E293B]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-bold text-white shadow-md text-sm tracking-wider">
            CL
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-100 tracking-tight flex items-center gap-1.5">
              ChangeLens
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">v1.0</span>
            </h1>
            <p className="text-[10.5px] text-slate-400 leading-tight mt-0.5">
              Explainable Quality Gate Intelligence
            </p>
          </div>
        </div>

        {/* Tagline / Subtitle */}
        <div className="mt-3 py-1.5 px-2 bg-[#121A2E] rounded border border-slate-800/80 text-[10px] text-slate-400 font-mono">
          Every change. Every impact. Every decision justified.
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as NavTab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-red-950/60 text-red-200 border border-red-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-red-400 opacity-80" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Baseline Reference Tag */}
      <div className="px-4 py-2 border-t border-[#1E293B]/60 text-[10px] font-mono text-slate-400 bg-[#0B101E]">
        <div className="flex justify-between items-center text-slate-500 text-[9px] uppercase tracking-wider mb-0.5">
          <span>Active Baseline</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="text-slate-300 truncate font-semibold">BASE-737-9-DOORPLUG-A</div>
        <div className="text-slate-500">Rev A.1 · Boeing 737-9 MAX</div>
      </div>

      {/* Active User Persona Selector (For Testing Separation of Duties) */}
      <div className="p-3 border-t border-[#1E293B] bg-[#0d1424]">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
          <span className="flex items-center gap-1 font-medium">
            <UserCheck className="w-3 h-3 text-red-400" /> Current Persona
          </span>
          <span className="font-mono text-[9px] text-slate-400 px-1 py-0.5 bg-slate-800 rounded">
            {currentUser?.role}
          </span>
        </div>

        <select
          value={currentUser?.id || ''}
          onChange={(e) => {
            const found = allUsers.find((u) => u.id === e.target.value);
            if (found) onUserChange(found);
          }}
          className="w-full bg-[#1A2338] text-slate-200 border border-slate-700 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-red-500 cursor-pointer"
        >
          {allUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.display_name} ({u.role})
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
};
