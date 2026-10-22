import React from 'react';
import {
  LayoutDashboard,
  GitBranch,
  Network,
  ShieldAlert,
  FileCheck2,
  CheckSquare,
  FileSpreadsheet,
  Sparkles,
  UserCheck,
  ChevronDown,
  Sliders
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
  | 'customizer';

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
    { id: 'overview' as NavTab, label: 'Dashboard', icon: LayoutDashboard, shortcut: '1' },
    { id: 'changes' as NavTab, label: 'Change Orders', icon: GitBranch, shortcut: '2' },
    { id: 'impact' as NavTab, label: 'Impact Graph', icon: Network, shortcut: '3' },
    { id: 'risks' as NavTab, label: 'Risk & FMEA', icon: ShieldAlert, shortcut: '4' },
    { 
      id: 'evidence' as NavTab, 
      label: 'Quality Gates', 
      icon: FileCheck2, 
      shortcut: '5',
      badge: blockedCount > 0 ? `${blockedCount} Held` : undefined,
      badgeColor: 'bg-red-50 text-red-600 border border-red-200'
    },
    { id: 'approvals' as NavTab, label: 'Review Queue', icon: CheckSquare, shortcut: '6' },
    { id: 'reports' as NavTab, label: 'Audit Reports', icon: FileSpreadsheet, shortcut: '7' },
    { id: 'customizer' as NavTab, label: 'Industry Studio', icon: Sliders, shortcut: '8' }
  ];

  return (
    <aside className="w-64 h-screen bg-white/95 border-r border-gray-200/80 flex flex-col shrink-0 select-none font-sans z-20 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Custom Brand Logo */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0071E3] to-[#0051B3] flex items-center justify-center shadow-sm relative overflow-hidden">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" strokeOpacity="0.4" strokeDasharray="2 3"/>
              <circle cx="12" cy="12" r="6"/>
              <line x1="12" y1="2" x2="12" y2="6"/>
              <line x1="12" y1="18" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="6" y2="12"/>
              <line x1="18" y1="12" x2="22" y2="12"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-semibold tracking-tight text-gray-900 leading-none">
                ChangeLens
              </h1>
              <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1 leading-none font-normal">
              Quality &amp; Configuration OS
            </p>
          </div>
        </div>
      </div>

      {/* User Persona & Authority Card */}
      <div className="p-3.5 border-b border-gray-100 bg-[#FBFBFD]">
        <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 mb-2 px-1">
          <span className="flex items-center gap-1.5 font-medium">
            <UserCheck className="w-3.5 h-3.5 text-gray-400" />
            Acting Persona
          </span>
          <span className="text-[10px] font-mono text-gray-400 tracking-wider">FAA AC-05</span>
        </div>
        
        <div className="relative">
          <select
            value={currentUser?.id || ''}
            onChange={(e) => {
              const selected = allUsers.find((u) => u.id === e.target.value);
              if (selected) onUserChange(selected);
            }}
            className="w-full appearance-none bg-white text-xs text-gray-900 font-medium border border-gray-200/90 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-[#0071E3] cursor-pointer shadow-xs transition-all"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.display_name} ({u.role})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {currentUser && (
          <div className="mt-2.5 px-1 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Authority:</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              currentUser.role === 'APPROVER' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : currentUser.role === 'REQUESTER'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {currentUser.role === 'APPROVER' ? 'Final Sign-off' : currentUser.role === 'REQUESTER' ? 'Self-Sign Blocked' : 'Quality Inspector'}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Tab Menu */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
          Workspaces
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all duration-150 relative ${
                isActive
                  ? 'bg-blue-50/80 text-[#0071E3] font-semibold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {/* Apple-style left accent active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#0071E3] rounded-r-full" />
              )}
              
              <div className="flex items-center gap-3 min-w-0 pl-1">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#0071E3]' : 'text-gray-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
                <kbd className="hidden lg:inline-block text-[10px] font-mono text-gray-400 px-1.5 py-0.5 rounded-md bg-white border border-gray-200 shadow-2xs">
                  {item.shortcut}
                </kbd>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Showcase Tour & System Indicator */}
      <div className="p-3.5 border-t border-gray-100 space-y-2.5 bg-[#FBFBFD]">
        <button
          onClick={onOpenTour}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-200/90 text-xs font-medium transition-all shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Product Tour</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-100">
            Guide
          </span>
        </button>

        <div className="px-1 flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span className="flex items-center gap-1.5 text-gray-500 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-subtle" />
            ChangeLens v2.4
          </span>
          <span>Calibrated</span>
        </div>
      </div>
    </aside>
  );
};
