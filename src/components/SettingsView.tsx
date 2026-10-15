import React, { useState } from 'react';
import { TeacherProfile } from '../types';

interface SettingsViewProps {
  teacher: TeacherProfile;
  onUpdateTeacher: (updated: TeacherProfile) => void;
  onResetData: () => void;
  onInstallApp?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  teacher,
  onUpdateTeacher,
  onResetData,
  onInstallApp,
}) => {
  const [autoSmsLate, setAutoSmsLate] = useState(true);
  const [autoSmsAbsent, setAutoSmsAbsent] = useState(true);
  const [threshold, setThreshold] = useState('75');
  const [academicYear, setAcademicYear] = useState('2025 - 2026');
  const [isSavedToast, setIsSavedToast] = useState(false);

  const handleSave = () => {
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2000);
  };

  return (
    <div className="flex flex-col w-full pb-28 select-none space-y-4 pt-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-[18px] font-bold text-[#0B1C30] leading-tight">Settings &amp; Preferences</h1>
          <p className="text-xs text-[#565E74]">Manage your account, school year and alerts</p>
        </div>

        {isSavedToast && (
          <span className="text-xs font-bold text-[#007D55] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
            Saved!
          </span>
        )}
      </div>

      {/* Teacher Profile Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 ring-2 ring-blue-100 shrink-0">
          <img src={teacher.avatarUrl} alt={teacher.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col min-w-0">
          <h2 className="text-[16px] font-bold text-[#0B1C30] truncate">{teacher.name}</h2>
          <span className="text-xs text-[#2563EB] font-semibold">{teacher.title}</span>
          <span className="text-[11px] text-[#565E74] truncate mt-0.5">{teacher.schoolName}</span>
        </div>
      </div>

      {/* Academic Configuration */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2563EB] text-[20px]">school</span>
          <h3 className="text-sm font-bold text-[#0B1C30]">Academic Configuration</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#0B1C30]">Current Academic Year</p>
              <p className="text-[11px] text-[#565E74]">Active school calendar session</p>
            </div>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="bg-[#EFF4FF] border border-blue-200 text-[#004AC6] text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="2025 - 2026">2025 - 2026</option>
              <option value="2024 - 2025">2024 - 2025</option>
              <option value="2026 - 2027">2026 - 2027</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs font-semibold text-[#0B1C30]">Low Attendance Threshold</p>
              <p className="text-[11px] text-[#565E74]">Trigger warning alerts if below</p>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-16 bg-[#EFF4FF] border border-blue-200 text-[#0B1C30] text-xs font-bold rounded-xl px-2.5 py-1.5 text-center focus:outline-none"
              />
              <span className="text-xs font-bold text-[#565E74]">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Automated Parent Notifications */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2563EB] text-[20px]">notifications_active</span>
          <h3 className="text-sm font-bold text-[#0B1C30]">Automated Parent Notifications</h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-[#0B1C30]">Instant Absence SMS Alert</p>
              <p className="text-[11px] text-[#565E74]">Send SMS when marked Absent</p>
            </div>
            <input
              type="checkbox"
              checked={autoSmsAbsent}
              onChange={(e) => setAutoSmsAbsent(e.target.checked)}
              className="w-4 h-4 text-[#2563EB] rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between pt-2 border-t border-slate-100 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-[#0B1C30]">Late Arrival Alert</p>
              <p className="text-[11px] text-[#565E74]">Send notification for late arrivals</p>
            </div>
            <input
              type="checkbox"
              checked={autoSmsLate}
              onChange={(e) => setAutoSmsLate(e.target.checked)}
              className="w-4 h-4 text-[#2563EB] rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* App Installation / Play Store PWA Status */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2563EB] text-[20px]">install_mobile</span>
          <h3 className="text-sm font-bold text-[#0B1C30]">App &amp; Device Setup</h3>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-[#0B1C30]">Mobile App Experience</p>
            <p className="text-[11px] text-[#565E74]">Install on Android or iOS home screen</p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#007D55] text-[10px] font-bold border border-emerald-200">
            PWA Ready
          </span>
        </div>

        <button
          onClick={onInstallApp}
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
          <span>Install EduAttend App</span>
        </button>
      </div>

      {/* System Actions */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2.5">
        <button
          onClick={handleSave}
          className="w-full h-11 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>Save Preferences</span>
        </button>

        <button
          onClick={onResetData}
          className="w-full h-11 bg-white border border-slate-200 text-[#565E74] hover:text-[#BA1A1A] hover:border-rose-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          <span>Reset Sample Demo Data</span>
        </button>
      </div>
    </div>
  );
};
