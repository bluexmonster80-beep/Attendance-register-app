import React from 'react';

interface StatusBarProps {
  time?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ time = '9:41' }) => {
  return (
    <div className="h-7 px-5 flex items-center justify-between text-[#0B1C30] select-none text-xs font-semibold tracking-tight w-full bg-inherit">
      <span className="font-bold">{time}</span>
      <div className="flex items-center gap-1.5 text-[#0B1C30]">
        <span className="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
        <span className="material-symbols-outlined text-[16px]">wifi</span>
        <span className="material-symbols-outlined text-[18px]">battery_full</span>
      </div>
    </div>
  );
};
