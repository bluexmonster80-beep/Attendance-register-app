import React from 'react';
import { soundFX } from '../utils/audio';

export type NavTab = 'dashboard' | 'classes' | 'reports' | 'alerts' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadAlertsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  unreadAlertsCount = 3,
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: 'dashboard' },
    { id: 'classes' as NavTab, label: 'Classes', icon: 'school' },
    { id: 'reports' as NavTab, label: 'Reports', icon: 'bar_chart' },
    { id: 'alerts' as NavTab, label: 'Alerts', icon: 'notifications', badge: unreadAlertsCount },
    { id: 'settings' as NavTab, label: 'Settings', icon: 'settings' },
  ];

  const handleTabClick = (tabId: NavTab) => {
    soundFX.triggerHaptic('light');
    onTabChange(tabId);
  };

  return (
    <nav className="fixed sm:sticky bottom-0 left-0 right-0 w-full sm:max-w-[414px] mx-auto z-40 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-4px_24px_rgba(11,28,48,0.06)] pb-safe transition-all">
      <div className="h-16 px-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1 transition-all rounded-xl relative cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-[#2563EB] font-bold scale-[1.02]'
                  : 'text-[#64748B] hover:text-[#0B1C30]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className={`material-symbols-outlined text-[24px] ${
                    isActive ? 'material-symbols-filled' : ''
                  }`}
                >
                  {tab.icon}
                </span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[16px] h-4 rounded-full bg-[#BA1A1A] text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-white">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#2563EB] mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
