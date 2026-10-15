import React, { useState } from 'react';
import { Student } from '../types';

interface StudentProfileViewProps {
  student: Student;
  onBack: () => void;
  onEditStudent?: (student: Student) => void;
  onCallFather: (phone: string, name: string) => void;
  onSendMessage: (student: Student) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  onBack,
  onEditStudent,
  onCallFather,
  onSendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'performance' | 'result' | 'notes'>('attendance');
  const [timeframe, setTimeframe] = useState('Last 30 Days');

  return (
    <div className="flex flex-col w-full pb-28 select-none space-y-3.5 pt-1">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#0B1C30] hover:bg-slate-50 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <h1 className="text-[17px] font-bold text-[#0B1C30] tracking-tight">Student Details</h1>
        </div>

        <button
          onClick={() => onEditStudent && onEditStudent(student)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm text-[#004AC6] text-xs font-semibold hover:bg-blue-50 transition-all active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          <span>Edit</span>
        </button>
      </div>

      {/* Top Utility Context Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#007D55] animate-pulse" />
          <span className="text-[11px] font-bold text-[#007D55] tracking-wide uppercase">
            Active Academic Year 2025-26
          </span>
        </div>
      </div>

      {/* Hero Profile & Attendance Card */}
      <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 shadow-inner ring-2 ring-blue-100/80">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-lg">
                    {student.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full ring-2 ring-white flex items-center justify-center ${
                  student.status === 'P'
                    ? 'bg-[#10B981]'
                    : student.status === 'A'
                    ? 'bg-[#EF4444]'
                    : student.status === 'L'
                    ? 'bg-[#F59E0B]'
                    : 'bg-slate-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <h2 className="text-[19px] font-bold text-[#0B1C30] truncate">{student.name}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    student.status === 'P'
                      ? 'bg-[#BDFFDB]/30 text-[#007D55]'
                      : student.status === 'A'
                      ? 'bg-[#FFDAD6] text-[#93000A]'
                      : student.status === 'L'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px] material-symbols-filled">
                    {student.status === 'P'
                      ? 'check_circle'
                      : student.status === 'A'
                      ? 'cancel'
                      : student.status === 'L'
                      ? 'schedule'
                      : 'hourglass_empty'}
                  </span>
                  {student.status === 'P'
                    ? 'Present Today'
                    : student.status === 'A'
                    ? 'Absent Today'
                    : student.status === 'L'
                    ? 'Late Today'
                    : 'Not Marked'}
                </span>
              </div>
              <p className="text-xs text-[#565E74] mt-1">
                Roll No: {student.rollNo} &nbsp;|&nbsp; {student.className}
              </p>
            </div>
          </div>

          {/* Donut Progress Ring */}
          <div className="shrink-0 flex flex-col items-center justify-center p-2 rounded-xl bg-[#EFF4FF] min-w-[96px] border border-blue-100/50">
            <span className="text-[11px] font-medium text-[#565E74] mb-1">Overall Attendance</span>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  className="text-slate-200"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <circle
                  className="text-[#007D55]"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="14"
                  stroke="currentColor"
                  strokeDasharray={`${student.attendanceStats.overallPercentage}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-extrabold text-[#0B1C30] tabular-nums">
                  {student.attendanceStats.overallPercentage}%
                </span>
              </div>
            </div>
            <span className="text-[10px] text-[#565E74] mt-1 tabular-nums font-semibold">
              {student.attendanceStats.present} / {student.attendanceStats.totalDays} Days
            </span>
          </div>
        </div>
      </section>

      {/* Contact Information Bento Block */}
      <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#DAE2FD]/60 flex items-center justify-center text-[#2563EB] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[#565E74] truncate">Father's Name</p>
              <p className="text-xs font-bold text-[#0B1C30] truncate">{student.contact.fatherName}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#DAE2FD]/60 flex items-center justify-center text-[#2563EB] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">smartphone</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[#565E74] truncate">Student's Phone</p>
              <a
                href={`tel:${student.contact.studentPhone}`}
                className="text-xs font-bold text-[#2563EB] hover:underline truncate block"
              >
                {student.contact.studentPhone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#DAE2FD]/60 flex items-center justify-center text-[#2563EB] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">call</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[#565E74] truncate">Father's Phone</p>
              <a
                href={`tel:${student.contact.fatherPhone}`}
                className="text-xs font-bold text-[#2563EB] hover:underline truncate block"
              >
                {student.contact.fatherPhone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#DAE2FD]/60 flex items-center justify-center text-[#2563EB] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">home_pin</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-[#565E74] truncate">Address</p>
              <p className="text-xs font-bold text-[#0B1C30] truncate">{student.contact.address}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Segmented Sticky Navigation Tabs */}
      <nav className="flex items-center gap-1.5 p-1 bg-[#EFF4FF] rounded-xl overflow-x-auto no-scrollbar border border-blue-100/60">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 min-w-[76px] flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'attendance'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#565E74] hover:text-[#0B1C30] hover:bg-white/60'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          <span>Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`flex-1 min-w-[76px] flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'performance'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#565E74] hover:text-[#0B1C30] hover:bg-white/60'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">insights</span>
          <span>Performance</span>
        </button>

        <button
          onClick={() => setActiveTab('result')}
          className={`flex-1 min-w-[76px] flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'result'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#565E74] hover:text-[#0B1C30] hover:bg-white/60'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">assignment</span>
          <span>Result</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 min-w-[76px] flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'notes'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#565E74] hover:text-[#0B1C30] hover:bg-white/60'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">description</span>
          <span>Notes</span>
        </button>
      </nav>

      {/* Attendance Overview Section */}
      {(activeTab === 'attendance' || activeTab === 'notes') && (
        <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2563EB] text-[20px]">date_range</span>
              <h3 className="text-[15px] font-bold text-[#0B1C30]">Attendance Overview</h3>
            </div>
            <button
              onClick={() => {
                const tf = ['Last 30 Days', 'Last 60 Days', 'This Term', 'All Academic Year'];
                const nextIdx = (tf.indexOf(timeframe) + 1) % tf.length;
                setTimeframe(tf[nextIdx]);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFF4FF] text-[#004AC6] text-[11px] font-semibold border border-blue-100/70 cursor-pointer"
            >
              <span>{timeframe}</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
          </div>

          {/* 4 Segmented Status Tiles */}
          <div className="grid grid-cols-4 gap-2">
            {/* Present Tile */}
            <div className="p-2.5 rounded-xl bg-[#BDFFDB]/20 border border-emerald-100/80 flex flex-col items-start gap-1">
              <div className="w-6 h-6 rounded-full bg-[#007D55] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[14px] font-bold">check</span>
              </div>
              <span className="text-[11px] text-[#565E74]">Present</span>
              <span className="text-[17px] font-extrabold text-[#0B1C30] leading-none mt-0.5 tabular-nums">
                {student.attendanceStats.present}
              </span>
              <span className="text-[10px] text-[#007D55] font-bold">
                {Math.round((student.attendanceStats.present / student.attendanceStats.totalDays) * 100)}%
              </span>
            </div>

            {/* Absent Tile */}
            <div className="p-2.5 rounded-xl bg-[#FFDAD6]/40 border border-rose-100/80 flex flex-col items-start gap-1">
              <div className="w-6 h-6 rounded-full bg-[#BA1A1A] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[14px] font-bold">close</span>
              </div>
              <span className="text-[11px] text-[#565E74]">Absent</span>
              <span className="text-[17px] font-extrabold text-[#0B1C30] leading-none mt-0.5 tabular-nums">
                {student.attendanceStats.absent}
              </span>
              <span className="text-[10px] text-[#BA1A1A] font-bold">
                {Math.round((student.attendanceStats.absent / student.attendanceStats.totalDays) * 100)}%
              </span>
            </div>

            {/* Late Tile */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-100 flex flex-col items-start gap-1">
              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[14px] font-bold">schedule</span>
              </div>
              <span className="text-[11px] text-[#565E74]">Late</span>
              <span className="text-[17px] font-extrabold text-[#0B1C30] leading-none mt-0.5 tabular-nums">
                {student.attendanceStats.late}
              </span>
              <span className="text-[10px] text-amber-700 font-bold">
                {Math.round((student.attendanceStats.late / student.attendanceStats.totalDays) * 100)}%
              </span>
            </div>

            {/* Total Days Tile */}
            <div className="p-2.5 rounded-xl bg-[#EFF4FF] border border-blue-100/80 flex flex-col items-start gap-1">
              <div className="w-6 h-6 rounded-full bg-[#2563EB] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[14px] font-bold">calendar_month</span>
              </div>
              <span className="text-[11px] text-[#565E74] truncate w-full">Total Days</span>
              <span className="text-[17px] font-extrabold text-[#0B1C30] leading-none mt-0.5 tabular-nums">
                {student.attendanceStats.totalDays}
              </span>
              <span className="text-[10px] text-[#565E74] truncate w-full font-medium">(Class Days)</span>
            </div>
          </div>

          {/* Attendance Streak and Reminder Micro-Bento */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#EFF4FF] border border-blue-100/60">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 32 32">
                  <circle className="text-blue-100" cx="16" cy="16" fill="none" r="12" stroke="currentColor" strokeWidth="3" />
                  <circle
                    className="text-[#007D55]"
                    cx="16"
                    cy="16"
                    fill="none"
                    r="12"
                    stroke="currentColor"
                    strokeDasharray="75"
                    strokeDashoffset="25"
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                </svg>
                <span className="material-symbols-outlined text-[15px] text-[#007D55] absolute">
                  local_fire_department
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[#565E74]">Attendance Streak</p>
                <p className="text-xs font-extrabold text-[#0B1C30] truncate tabular-nums">
                  {student.attendanceStats.streakDays} Days
                </p>
              </div>
            </div>

            <div
              onClick={() => onSendMessage(student)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#EFF4FF] border border-blue-100/60 cursor-pointer active:scale-98 transition-transform hover:bg-blue-100/50"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-[20px] text-[#2563EB] shrink-0">
                  notifications
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#565E74]">Reminder</p>
                  <p className="text-xs font-semibold text-[#0B1C30] truncate">
                    {student.reminder || 'No reminder set'}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[16px] text-[#565E74] shrink-0">
                chevron_right
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Performance Summary Section */}
      {(activeTab === 'performance' || activeTab === 'attendance') && (
        <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2563EB] text-[20px]">military_tech</span>
              <h3 className="text-[15px] font-bold text-[#0B1C30]">Performance</h3>
            </div>
            <span className="text-[11px] text-[#007D55] bg-[#BDFFDB]/30 border border-emerald-200/50 px-2 py-0.5 rounded-full font-bold">
              Term 2
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Performance Ring Gauge */}
            <div className="shrink-0 flex flex-col items-center justify-center p-3 rounded-xl bg-[#EFF4FF] border border-blue-100/60">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                  <circle className="text-blue-100" cx="20" cy="20" fill="none" r="16" stroke="currentColor" strokeWidth="4" />
                  <circle
                    className="text-[#007D55]"
                    cx="20"
                    cy="20"
                    fill="none"
                    r="16"
                    stroke="currentColor"
                    strokeDasharray={`${student.performance.averageScore}, 100`}
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[18px] font-extrabold text-[#0B1C30] tabular-nums">
                    {student.performance.averageScore}%
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-[#565E74] mt-1 font-medium">Average Score</span>
            </div>

            {/* Performance Metrics 2x2 Grid */}
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-[#EFF4FF] border border-blue-100/50 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-[#2563EB] mb-0.5">
                  <span className="material-symbols-outlined text-[16px]">emoji_events</span>
                  <span className="text-[10px] text-[#565E74]">Class Rank</span>
                </div>
                <p className="text-xs font-bold text-[#0B1C30] tabular-nums">
                  {student.performance.classRank} / {student.performance.totalInClass}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#EFF4FF] border border-blue-100/50 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-[#2563EB] mb-0.5">
                  <span className="material-symbols-outlined text-[16px]">grade</span>
                  <span className="text-[10px] text-[#565E74]">Position</span>
                </div>
                <p className="text-xs font-bold text-[#0B1C30] truncate">{student.performance.position}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#EFF4FF] border border-blue-100/50 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-[#007D55] mb-0.5">
                  <span className="material-symbols-outlined text-[16px]">sentiment_satisfied</span>
                  <span className="text-[10px] text-[#565E74]">Behavior</span>
                </div>
                <p className="text-xs font-bold text-[#007D55]">{student.performance.behavior}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#EFF4FF] border border-blue-100/50 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-[#565E74] mb-0.5">
                  <span className="material-symbols-outlined text-[16px]">fact_check</span>
                  <span className="text-[10px] text-[#565E74]">Remarks</span>
                </div>
                <p className="text-xs font-bold text-[#0B1C30] truncate">{student.performance.remarks}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Subject Results Section */}
      {(activeTab === 'result' || activeTab === 'attendance') && (
        <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2563EB] text-[20px]">menu_book</span>
              <h3 className="text-[15px] font-bold text-[#0B1C30]">Result</h3>
            </div>
            <span className="text-xs text-[#2563EB] font-bold cursor-pointer hover:underline">
              View Full Report
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {student.subjectScores.map((subj, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-[#EFF4FF] border border-blue-100/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-[#2563EB] shrink-0">
                      {subj.icon}
                    </span>
                    <span className="text-xs font-semibold text-[#0B1C30] truncate">{subj.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#565E74] shrink-0 tabular-nums">
                    {subj.score !== null ? (
                      <>
                        {subj.score}
                        <span className="text-[9px] font-normal text-slate-400">/{subj.maxScore}</span>
                      </>
                    ) : (
                      <span className="text-slate-400">--/{subj.maxScore}</span>
                    )}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      subj.score !== null
                        ? subj.score >= 80
                          ? 'bg-[#007D55]'
                          : subj.score >= 70
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                        : 'bg-slate-300'
                    }`}
                    style={{ width: subj.score !== null ? `${(subj.score / subj.maxScore) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Teacher Notes Card */}
      <section className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="w-9 h-9 rounded-xl bg-[#DAE2FD]/60 flex items-center justify-center text-[#2563EB] shrink-0">
            <span className="material-symbols-outlined text-[20px]">sticky_note_2</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#0B1C30]">Notes</p>
            <p className="text-xs text-[#565E74] truncate">{student.notes || 'No teacher notes added yet.'}</p>
          </div>
        </div>
        <span className="material-symbols-outlined text-[18px] text-[#565E74] shrink-0">chevron_right</span>
      </section>

      {/* Native Docked Mobile Action Strip */}
      <div className="sticky bottom-0 z-30 pt-3 pb-safe bg-gradient-to-t from-[#F8F9FF] via-[#F8F9FF]/95 to-transparent -mx-1 px-1">
        <div className="grid grid-cols-2 gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-lg">
          <button
            onClick={() => onCallFather(student.contact.fatherPhone, student.contact.fatherName)}
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#EFF4FF] hover:bg-blue-100 text-[#2563EB] text-xs font-bold transition-transform active:scale-95 shadow-xs border border-blue-200/60 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">call</span>
            <span>Call Father</span>
          </button>

          <button
            onClick={() => onSendMessage(student)}
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-transform active:scale-95 shadow-md shadow-blue-500/25 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span>Message</span>
          </button>
        </div>
      </div>
    </div>
  );
};
