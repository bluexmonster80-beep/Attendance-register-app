import React from 'react';
import { ClassItem, TeacherProfile } from '../types';

interface DashboardViewProps {
  teacher: TeacherProfile;
  classes: ClassItem[];
  totalStudents: number;
  overallAttendanceRate: number;
  onSelectClass: (classId: string) => void;
  onCreateClass: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onViewAllClasses?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  teacher,
  classes,
  totalStudents,
  overallAttendanceRate,
  onSelectClass,
  onCreateClass,
  onOpenNotifications,
  onOpenSettings,
  onViewAllClasses,
}) => {
  return (
    <div className="flex flex-col w-full gap-4 select-none pb-24">
      {/* Top App Bar */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-[0_4px_16px_-2px_rgba(37,99,235,0.35)]">
            <span className="material-symbols-outlined text-[22px] material-symbols-filled">fact_check</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#565E74] uppercase tracking-wider">EduAttend</span>
            <h1 className="text-[17px] font-bold text-[#0B1C30] tracking-tight leading-none">Dashboard</h1>
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full bg-[#004AC6] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(0,74,198,0.2)] hover:opacity-90 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
        </button>
      </div>

      {/* Teacher Profile Greeting Header */}
      <div className="flex items-center justify-between w-full pt-1">
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 rounded-full bg-blue-50 shadow-sm overflow-hidden flex items-center justify-center ring-2 ring-blue-100">
            <img
              src={teacher.avatarUrl}
              alt={teacher.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#565E74]">Good Morning,</span>
            <h2 className="text-[19px] font-bold text-[#0B1C30] leading-tight">{teacher.name}</h2>
            <span className="text-xs text-[#565E74]">{teacher.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNotifications}
            className="relative w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[#434655] hover:text-[#2563EB] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#BA1A1A] text-white text-[10px] flex items-center justify-center font-bold">
              3
            </span>
          </button>
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[#434655] hover:text-[#2563EB] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>
        </div>
      </div>

      {/* Hero Banner: Create a New Class */}
      <div className="relative w-full rounded-[24px] bg-gradient-to-r from-[#EFF4FF] via-[#FFFFFF] to-[#E5EEFF] p-4 border border-blue-100/70 shadow-sm overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-200/40 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-indigo-200/30 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3.5 relative z-10">
          {/* 3D Book & Graduation Cap Graphic Art */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center rounded-2xl bg-white/80 shadow-sm border border-blue-50">
            <div className="relative flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-[#2563EB] text-[46px] drop-shadow-sm material-symbols-filled">
                school
              </span>
              <div className="absolute -bottom-1 w-10 h-2 rounded-full bg-blue-900/10 blur-[1px]" />
              <span className="material-symbols-outlined absolute -top-1 -right-1 text-emerald-500 text-[16px] animate-pulse">
                auto_awesome
              </span>
              <span className="material-symbols-outlined absolute bottom-2 -left-2 text-blue-400 text-[14px]">
                sparkles
              </span>
            </div>
          </div>

          {/* Action & Description */}
          <div className="flex flex-col flex-1 min-w-0 pr-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[17px] font-bold text-[#0B1C30]">Create a New Class</h3>
                <p className="text-xs text-[#565E74] mt-0.5 line-clamp-2 leading-relaxed">
                  Start managing attendance, performance and progress for your students.
                </p>
              </div>
              <button
                onClick={onCreateClass}
                className="w-8 h-8 rounded-full bg-white text-[#2563EB] shadow-sm flex items-center justify-center shrink-0 ml-1 hover:bg-blue-50 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            <div className="mt-3">
              <button
                onClick={onCreateClass}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold shadow-[0_4px_12px_rgba(37,99,235,0.25)] active:scale-95 hover:bg-blue-700 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Create New Class</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Overview Tiles (4 cards 2x2 grid) */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {/* Stat 1: Total Classes */}
        <div className="flex flex-col p-3.5 rounded-[20px] bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#DBE1FF] flex items-center justify-center text-[#004AC6]">
              <span className="material-symbols-outlined text-[22px] material-symbols-filled">school</span>
            </div>
          </div>
          <span className="text-xs text-[#565E74] font-medium">Total Classes</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-[22px] font-extrabold text-[#0B1C30] tabular-nums">{classes.length}</span>
            <span className="text-[11px] font-bold text-[#007D55] bg-emerald-50 px-1.5 py-0.5 rounded-md">+1 term</span>
          </div>
        </div>

        {/* Stat 2: Total Students */}
        <div className="flex flex-col p-3.5 rounded-[20px] bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#BDFFDB]/40 flex items-center justify-center text-[#007D55]">
              <span className="material-symbols-outlined text-[22px] material-symbols-filled">groups</span>
            </div>
          </div>
          <span className="text-xs text-[#565E74] font-medium">Total Students</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-[22px] font-extrabold text-[#0B1C30] tabular-nums">{totalStudents}</span>
            <span className="text-[11px] text-[#565E74]">Across {classes.length} grp</span>
          </div>
        </div>

        {/* Stat 3: Today's Classes */}
        <div className="flex flex-col p-3.5 rounded-[20px] bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#DAE2FD] flex items-center justify-center text-[#565E74]">
              <span className="material-symbols-outlined text-[22px] material-symbols-filled">calendar_today</span>
            </div>
          </div>
          <span className="text-xs text-[#565E74] font-medium">Today's Classes</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-[22px] font-extrabold text-[#0B1C30] tabular-nums">3</span>
            <span className="text-[11px] font-bold text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded-md">2 Finished</span>
          </div>
        </div>

        {/* Stat 4: Overall Attendance */}
        <div className="flex flex-col p-3.5 rounded-[20px] bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#D3E4FE] flex items-center justify-center text-[#2563EB]">
              <span className="material-symbols-outlined text-[22px] material-symbols-filled">verified</span>
            </div>
          </div>
          <span className="text-xs text-[#565E74] font-medium">Overall Attendance</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-[22px] font-extrabold text-[#0B1C30] tabular-nums">{overallAttendanceRate}%</span>
            <span className="text-[11px] font-bold text-[#007D55] bg-emerald-50 px-1.5 py-0.5 rounded-md">+2.4%</span>
          </div>
        </div>
      </div>

      {/* Class List Section Header */}
      <div className="flex items-center justify-between w-full mt-1">
        <div className="flex items-center gap-2">
          <h3 className="text-[17px] font-bold text-[#0B1C30] tracking-tight">My Classes</h3>
          <span className="px-2 py-0.5 rounded-full bg-[#E5EEFF] text-[#004AC6] text-[11px] font-bold">
            {classes.length} Active
          </span>
        </div>
        <button
          onClick={onViewAllClasses}
          className="text-xs font-bold text-[#2563EB] flex items-center gap-0.5 hover:underline cursor-pointer"
        >
          <span>View All</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>

      {/* Class Cards Stack */}
      <div className="flex flex-col gap-2.5 w-full">
        {classes.map((cls) => (
          <div
            key={cls.id}
            onClick={() => onSelectClass(cls.id)}
            className="flex items-center justify-between p-3.5 rounded-[20px] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-blue-200 cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${cls.badgeColor || 'bg-blue-100 text-blue-700'}`}
              >
                <span className="material-symbols-outlined text-[26px]">
                  {cls.categoryIcon || 'school'}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="text-[15px] font-bold text-[#0B1C30] truncate">{cls.name}</h4>
                <span className="text-xs text-[#565E74] truncate">
                  {cls.subjects.map((s) => s.name).join(' • ')}
                </span>
                <div className="flex items-center gap-1 text-[#434655] text-[11px] mt-0.5">
                  <span className="material-symbols-outlined text-[14px]">person</span>
                  <span>{cls.studentCount} Students</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 pl-1">
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#BDFFDB]/30 text-[#007D55] border border-emerald-200/40">
                <span className="material-symbols-outlined text-[15px] material-symbols-filled">check_circle</span>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-[#007D55] font-semibold leading-none">Today</span>
                  <span className="text-[11px] font-bold text-[#0B1C30] leading-tight tabular-nums">
                    {cls.todayAttendance.percentage}%
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#737686] text-[18px]">chevron_right</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
