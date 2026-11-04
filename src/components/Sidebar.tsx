import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Users2,
  GraduationCap,
  Award,
  Settings,
  FileSpreadsheet,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  openRollCall: () => void;
  openDefaulters: () => void;
  openAuditLog: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  openRollCall,
  openDefaulters,
  openAuditLog,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'departments', label: 'Departments', icon: FolderKanban },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'faculty', label: 'Faculty', icon: Users2 },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'results', label: 'Results', icon: Award },
    { id: 'management', label: 'Management', icon: Settings },
    { id: 'reports', label: 'Report Settings', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-64 bg-[#091426] text-white flex flex-col justify-between shrink-0 select-none border-r border-[#1e293b]">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 flex items-center gap-3 border-b border-[#1e293b]/70">
          {/* Logo icon with distinctive cyan/emerald gradient */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00C48C] via-[#00A3FF] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <path d="M18 20V10" />
              <path d="M12 20V4" />
              <path d="M6 20v-4" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight flex items-center gap-1.5">
              <span>Attendora</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
              Academic OS
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-[#1e293b] text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131f33]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#00C48C]' : 'text-slate-400'
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C48C]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Operations Section */}
        <div className="px-4 pt-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Operations
          </div>
          <div className="space-y-1.5">
            <button
              onClick={openRollCall}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 text-xs font-semibold transition"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Roll-Call
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            <button
              onClick={openDefaulters}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 text-xs font-medium transition"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Defaulters List
              </span>
              <span className="text-[10px] bg-amber-900/50 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                &lt;75%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Compliance Footer */}
      <div className="p-4 border-t border-[#1e293b]/70 bg-[#060e1a]">
        <button
          onClick={openAuditLog}
          className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#131f33] transition text-left text-xs text-slate-300"
        >
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="min-w-0">
            <div className="font-medium text-slate-200 truncate">Audit & Non-Repudiation</div>
            <div className="text-[10px] text-slate-400">Immutable ledger</div>
          </div>
        </button>
      </div>
    </aside>
  );
};
