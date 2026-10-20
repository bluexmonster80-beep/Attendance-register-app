import React from 'react';
import { NavTab } from './BottomNav';
import { TeacherProfile } from '../types';
import { SyncState } from '../services/apiClient';
import { soundFX } from '../utils/audio';

interface DesktopSidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadAlertsCount?: number;
  teacher: TeacherProfile;
  onCreateClass: () => void;
  onAddStudent: () => void;
  syncState?: SyncState;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentTab,
  onTabChange,
  unreadAlertsCount = 3,
  teacher,
  onCreateClass,
  onAddStudent,
  syncState = 'synced',
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: 'dashboard',
      description: 'Overview & Today summary',
    },
    {
      id: 'classes' as NavTab,
      label: 'Classes & Register',
      icon: 'school',
      description: 'Rosters & attendance marking',
    },
    {
      id: 'reports' as NavTab,
      label: 'Reports & Analytics',
      icon: 'bar_chart',
      description: 'Statistics, trends & export',
    },
    {
      id: 'alerts' as NavTab,
      label: 'Alerts & Notices',
      icon: 'notifications',
      description: 'Absence alerts & reminders',
      badge: unreadAlertsCount,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: 'settings',
      description: 'Profile & preferences',
    },
  ];

  const handleNavClick = (tabId: NavTab) => {
    soundFX.triggerHaptic('light');
    onTabChange(tabId);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-slate-200/80 shrink-0 h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-[0_4px_16px_-2px_rgba(37,99,235,0.35)]">
            <span className="material-symbols-outlined text-[22px] material-symbols-filled">fact_check</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-[17px] text-[#0B1C30] tracking-tight leading-none">EduAttend</span>
            <span className="text-[11px] font-semibold text-[#565E74] mt-1">Class & Attendance App</span>
          </div>
        </div>
      </div>

      {/* School Badge Pill */}
      <div className="px-5 pt-3.5 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
          <span className="material-symbols-outlined text-blue-600 text-[18px]">domain</span>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-[#0B1C30] truncate">{teacher.schoolName}</span>
            <span className="text-[10px] text-[#565E74]">Academic Year 2025 - 2026</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                isActive
                  ? 'bg-blue-50 text-[#2563EB] font-bold shadow-xs'
                  : 'text-[#475569] hover:bg-slate-50 hover:text-[#0B1C30]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-105 ${
                    isActive ? 'text-[#2563EB] material-symbols-filled' : 'text-[#64748B]'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-semibold truncate">{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-[#BA1A1A] text-white text-[10px] font-bold">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}

        {/* Quick Actions in Sidebar */}
        <div className="pt-5 px-1 space-y-2">
          <div className="px-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Actions
          </div>
          <button
            onClick={onCreateClass}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold shadow-sm hover:bg-blue-700 active:scale-98 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Create New Class</span>
          </button>
          <button
            onClick={onAddStudent}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#0B1C30] hover:bg-slate-50 text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-blue-600 text-[18px]">person_add</span>
            <span>Add Student</span>
          </button>
        </div>
      </nav>

      {/* Sync Status Badge */}
      <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              syncState === 'synced'
                ? 'bg-emerald-500 animate-pulse'
                : syncState === 'syncing'
                ? 'bg-blue-500 animate-ping'
                : 'bg-amber-500'
            }`}
          />
          <span className="text-[11px] font-medium capitalize">
            {syncState === 'synced' ? 'Cloud Synced' : syncState === 'syncing' ? 'Syncing...' : 'Local Offline'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400">v1.2.0</span>
      </div>

      {/* Teacher Profile Footer Card */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60">
        <button
          onClick={() => handleNavClick('settings')}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-9 h-9 rounded-full bg-blue-100 overflow-hidden ring-1 ring-blue-200 shrink-0">
              <img
                src={teacher.avatarUrl}
                alt={teacher.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#0B1C30] truncate group-hover:text-blue-600 transition-colors">
                {teacher.name}
              </span>
              <span className="text-[10px] text-[#565E74] truncate">{teacher.title}</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
        </button>
      </div>
    </aside>
  );
};
