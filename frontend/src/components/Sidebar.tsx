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
    { id: 'overview' as NavTab, label: 'Dashboard', icon: LayoutDashboard, shortcut: '1' },
    { id: 'changes' as NavTab, label: 'Changes', icon: GitBranch, shortcut: '2' },
    { id: 'impact' as NavTab, label: 'Impact Graph', icon: Network, shortcut: '3' },
    { id: 'risks' as NavTab, label: 'Risk Controls', icon: ShieldAlert, shortcut: '4' },
    { 
      id: 'evidence' as NavTab, 
      label: 'Verification', 
      icon: FileCheck2, 
      shortcut: '5',
      badge: blockedCount > 0 ? `${blockedCount} Blocked` : undefined,
      badgeColor: 'bg-red-50 text-red-600 border border-red-200'
    },
    { id: 'approvals' as NavTab, label: 'Reviews', icon: CheckSquare, shortcut: '6' },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileSpreadsheet, shortcut: '7' },
    { id: 'ilm' as NavTab, label: 'Case Study', icon: GraduationCap, shortcut: '8' }
  ];

  return (
    <aside className="w-60 h-screen bg-white border-r border-gray-200 flex flex-col shrink-0 select-none font-sans z-20">
      {/* Brand Header */}
      <div className="h-14 px-5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Aperture className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-gray-900">
              ChangeLens
            </h1>
            <p className="text-[11px] text-gray-400 leading-tight">
              Governance Platform
            </p>
          </div>
        </div>
      </div>

      {/* User Persona & Separation-of-Duties Card */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 mb-2 px-1">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-gray-400" />
            Active Persona
          </span>
          <span className="text-[10px] text-gray-400">SoD</span>
        </div>
        
        <div className="relative">
          <select
            value={currentUser?.id || ''}
            onChange={(e) => {
              const selected = allUsers.find((u) => u.id === e.target.value);
              if (selected) onUserChange(selected);
            }}
            className="w-full appearance-none bg-gray-50 hover:bg-gray-100 text-xs text-gray-700 border border-gray-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium transition-all"
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
          <div className="mt-2 px-1 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Authority:</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
              currentUser.role === 'APPROVER' 
                ? 'bg-green-50 text-green-700 border-green-200'
                : currentUser.role === 'REQUESTER'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {currentUser.role === 'APPROVER' ? 'Final Sign-off' : currentUser.role === 'REQUESTER' ? 'Self-Sign Blocked' : 'Quality Verify'}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Tab Menu */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium flex items-center justify-between transition-all duration-150 ${
                isActive
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
                <kbd className="hidden lg:inline-block text-[10px] text-gray-400 px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200">
                  {item.shortcut}
                </kbd>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Tour & System Status */}
      <div className="p-3 border-t border-gray-200 space-y-2">
        <button
          onClick={onOpenTour}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-xs font-semibold transition-all"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Interactive Tour</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">
            Guide
          </span>
        </button>

        <div className="px-1 flex items-center justify-between text-[10px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            ChangeLens v2.6.0
          </span>
          <span>Boeing 737-9</span>
        </div>
      </div>
    </aside>
  );
};
