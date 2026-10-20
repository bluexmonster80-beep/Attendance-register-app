import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { soundFX } from '../utils/audio';

export interface AttendanceBadge {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tier: 'Diamond' | 'Gold' | 'Silver' | 'Bronze';
  unlocked: boolean;
  progress: number;
  currentVal: string;
  targetVal: string;
  description: string;
  benefit: string;
  theme: {
    pill: string;
    cardBg: string;
    badgeGlow: string;
    border: string;
    iconBg: string;
    iconColor: string;
    progressFill: string;
  };
}

interface StudentProfileViewProps {
  student: Student;
  onBack: () => void;
  onEditStudent?: (student: Student) => void;
  onCallFather: (phone: string, name: string) => void;
  onSendMessage: (student: Student) => void;
  onToast?: (message: string) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  student,
  onBack,
  onEditStudent,
  onCallFather,
  onSendMessage,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'achievements' | 'performance' | 'result' | 'notes'>('attendance');
  const [timeframe, setTimeframe] = useState('Last 30 Days');
  const [selectedBadge, setSelectedBadge] = useState<AttendanceBadge | null>(null);
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'unlocked' | 'in_progress'>('all');
  const [badgeSharedToast, setBadgeSharedToast] = useState<string | null>(null);

  // Compute attendance achievements dynamically from student attendance statistics
  const badges: AttendanceBadge[] = useMemo(() => {
    const stats = student.attendanceStats || {
      present: 0,
      absent: 0,
      late: 0,
      totalDays: 1,
      overallPercentage: 0,
      streakDays: 0,
    };

    const isPerfect = stats.overallPercentage >= 95 || (stats.totalDays >= 10 && stats.absent === 0);
    const isMostImproved = stats.streakDays >= 5 || (stats.overallPercentage >= 75 && stats.absent <= 5);
    const isStreakMaster = stats.streakDays >= 10;
    const isPunctualityMaster = stats.late <= 2 && stats.totalDays > 0;
    const isCenturyClub = stats.present >= 100;
    const isHonorRoll = stats.overallPercentage >= 85 && (student.performance?.classRank <= 5 || student.performance?.averageScore >= 80);

    return [
      {
        id: 'perfect-attendance',
        title: 'Perfect Attendance',
        subtitle: 'Flawless 95%+ Presence Record',
        icon: 'workspace_premium',
        tier: 'Gold',
        unlocked: isPerfect,
        progress: Math.min(100, Math.round((stats.overallPercentage / 95) * 100)),
        currentVal: `${stats.overallPercentage}% Attendance`,
        targetVal: '95%+ Attendance',
        description: 'Awarded to students demonstrating exceptional consistency with 95% or higher overall attendance.',
        benefit: 'Official Term Honor Roll & Assembly Recognition',
        theme: {
          pill: 'bg-amber-100 text-amber-900 border border-amber-300',
          cardBg: isPerfect ? 'bg-gradient-to-br from-amber-50/90 via-white to-amber-100/30' : 'bg-slate-50/70',
          badgeGlow: 'shadow-[0_4px_16px_rgba(245,158,11,0.25)]',
          border: isPerfect ? 'border-amber-200' : 'border-slate-200',
          iconBg: isPerfect ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white' : 'bg-slate-200 text-slate-400',
          iconColor: isPerfect ? 'text-white' : 'text-slate-400',
          progressFill: 'bg-amber-500',
        },
      },
      {
        id: 'most-improved',
        title: 'Most Improved',
        subtitle: 'Continuous Attendance Momentum',
        icon: 'trending_up',
        tier: 'Silver',
        unlocked: isMostImproved,
        progress: Math.min(100, Math.round((Math.max(stats.streakDays, 2) / 5) * 100)),
        currentVal: `${stats.streakDays} Day Momentum`,
        targetVal: '5+ Consecutive Days',
        description: 'Earned through consistent upward momentum in classroom attendance over recent academic weeks.',
        benefit: 'Teacher Commendation Letter sent to parents',
        theme: {
          pill: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
          cardBg: isMostImproved ? 'bg-gradient-to-br from-emerald-50/90 via-white to-emerald-100/30' : 'bg-slate-50/70',
          badgeGlow: 'shadow-[0_4px_16px_rgba(16,185,129,0.25)]',
          border: isMostImproved ? 'border-emerald-200' : 'border-slate-200',
          iconBg: isMostImproved ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white' : 'bg-slate-200 text-slate-400',
          iconColor: isMostImproved ? 'text-white' : 'text-slate-400',
          progressFill: 'bg-emerald-500',
        },
      },
      {
        id: 'streak-master',
        title: 'Iron Streak Master',
        subtitle: '10+ Days Unbroken Streak',
        icon: 'local_fire_department',
        tier: 'Diamond',
        unlocked: isStreakMaster,
        progress: Math.min(100, Math.round((stats.streakDays / 10) * 100)),
        currentVal: `${stats.streakDays} Days In a Row`,
        targetVal: '10 Consecutive Days',
        description: 'Achieved an unbroken attendance streak of 10 or more days with zero unexcused missed sessions.',
        benefit: 'Featured on Classroom Attendance Wall of Fame',
        theme: {
          pill: 'bg-orange-100 text-orange-900 border border-orange-300',
          cardBg: isStreakMaster ? 'bg-gradient-to-br from-orange-50/90 via-white to-orange-100/30' : 'bg-slate-50/70',
          badgeGlow: 'shadow-[0_4px_16px_rgba(249,115,22,0.25)]',
          border: isStreakMaster ? 'border-orange-200' : 'border-slate-200',
          iconBg: isStreakMaster ? 'bg-gradient-to-tr from-orange-500 to-red-500 text-white' : 'bg-slate-200 text-slate-400',
          iconColor: isStreakMaster ? 'text-white' : 'text-slate-400',
          progressFill: 'bg-orange-500',
        },
      },
      {
        id: 'punctuality-master',
        title: 'Punctuality Master',
        subtitle: 'Flawless On-Time Arrival',
        icon: 'alarm_on',
        tier: 'Gold',
        unlocked: isPunctualityMaster,
        progress: isPunctualityMaster ? 100 : Math.max(0, 100 - (stats.late - 2) * 25),
        currentVal: `${stats.late} Late Arrivals`,
        targetVal: '≤ 2 Late Marks',
        description: 'Arrives promptly before morning homeroom bell with no more than 2 late marks all term.',
        benefit: 'School Punctuality Excellence Badge',
        theme: {
          pill: 'bg-sky-100 text-sky-900 border border-sky-300',
          cardBg: isPunctualityMaster ? 'bg-gradient-to-br from-sky-50/90 via-white to-sky-100/30' : 'bg-slate-50/70',
          badgeGlow: 'shadow-[0_4px_16px_rgba(14,165,233,0.25)]',
          border: isPunctualityMaster ? 'border-sky-200' : 'border-slate-200',
          iconBg: isPunctualityMaster ? 'bg-gradient-to-tr from-sky-500 to-blue-500 text-white' : 'bg-slate-200 text-slate-400',
          iconColor: isPunctualityMaster ? 'text-white' : 'text-slate-400',
          progressFill: 'bg-sky-500',
        },
      },
      {
        id: 'century-club',
        title: '100+ Days Century Club',
        subtitle: '100 Classroom Days Logged',
        icon: 'stars',
        tier: 'Diamond',
        unlocked: isCenturyClub,
        progress: Math.min(100, Math.round((stats.present / 100) * 100)),
        currentVal: `${stats.present} Present Days`,
        targetVal: '100 Active Days',
        description: 'Celebrates completing 100 or more full days present in the active school academic session.',
        benefit: 'Permanent Century Milestone recorded on Student Transcript',
        theme: {
          pill: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
          cardBg: isCenturyClub ? 'bg-gradient-to-br from-indigo-50/90 via-white to-indigo-100/30' : 'bg-slate-50/70',
          badgeGlow: 'shadow-[0_4px_16px_rgba(99,102,241,0.25)]',
          border: isCenturyClub ? 'border-indigo-200' : 'border-slate-200',
          iconBg: isCenturyClub ? 'bg-gradient-to-tr from-indigo-600 to-purple-500 text-white' : 'bg-slate-200 text-slate-400',
          iconColor: isCenturyClub ? 'text-white' : 'text-slate-400',
          progressFill: 'bg-indigo-500',
        },
      },
      {
        id: 'honor-roll',
        title: 'Honor Roll Presence',
        subtitle: 'Top Academic & Attendance Tier',
        icon: 'military_tech',
        tier: 'Gold',
        unlocked: isHonorRoll,
        progress: Math.min(100, Math.round((stats.overallPercentage / 85) * 100)),
        currentVal: `Rank #${student.performance?.classRank || 1} • ${stats.overallPercentage}%`,
        targetVal: 'Top 5 Rank & 85%+',
        description: 'High-achieving balance of superior academic performance alongside steadfast classroom attendance.',
        benefit: 'Annual Crescent Model Honor Roll Laureate',
        theme: {
          pill: 'bg-purple-100 text-purple-900 border border-purple-300',
          cardBg: isHonorRoll ? 'bg-gradient-to-br from-purple-50/90 via-white to-purple-100/30' : 'bg-slate-50/70',
          badgeGlow: 'shadow-[0_4px_16px_rgba(168,85,247,0.25)]',
          border: isHonorRoll ? 'border-purple-200' : 'border-slate-200',
          iconBg: isHonorRoll ? 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white' : 'bg-slate-200 text-slate-400',
          iconColor: isHonorRoll ? 'text-white' : 'text-slate-400',
          progressFill: 'bg-purple-500',
        },
      },
    ];
  }, [student]);

  const unlockedCount = useMemo(() => badges.filter((b) => b.unlocked).length, [badges]);
  const totalBadges = badges.length;

  const filteredBadges = useMemo(() => {
    if (badgeFilter === 'unlocked') return badges.filter((b) => b.unlocked);
    if (badgeFilter === 'in_progress') return badges.filter((b) => !b.unlocked);
    return badges;
  }, [badges, badgeFilter]);

  const handleShareBadge = (badge: AttendanceBadge) => {
    soundFX.triggerHaptic('success');
    const msg = `Achievement Unlocked: ${student.name} earned the "${badge.title}" badge (${badge.currentVal})!`;
    if (onToast) onToast(msg);
    setBadgeSharedToast(msg);
    setTimeout(() => setBadgeSharedToast(null), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-28 space-y-3.5 pt-1">
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

              {/* Visual Achievement Badges Quick Strip */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {badges.filter((b) => b.unlocked).slice(0, 3).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      soundFX.triggerHaptic('light');
                      setSelectedBadge(b);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${b.theme.pill} cursor-pointer active:scale-95 transition-all shadow-2xs hover:brightness-105`}
                    title="Click to view achievement badge details"
                  >
                    <span className="material-symbols-outlined text-[13px]">{b.icon}</span>
                    <span>{b.title}</span>
                  </button>
                ))}
                {unlockedCount === 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                    <span className="material-symbols-outlined text-[12px]">star_border</span>
                    <span>Aiming for first badge</span>
                  </span>
                )}
                {unlockedCount > 3 && (
                  <button
                    onClick={() => {
                      soundFX.triggerHaptic('light');
                      setActiveTab('achievements');
                    }}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors cursor-pointer"
                  >
                    +{unlockedCount - 3} more
                  </button>
                )}
              </div>
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
          className={`flex-1 min-w-[76px] flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'attendance'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#565E74] hover:text-[#0B1C30] hover:bg-white/60'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          <span>Attendance</span>
        </button>

        <button
          onClick={() => {
            soundFX.triggerHaptic('light');
            setActiveTab('achievements');
          }}
          className={`flex-1 min-w-[76px] flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-bold transition-all relative ${
            activeTab === 'achievements'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'text-[#565E74] hover:text-[#0B1C30] hover:bg-white/60'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">military_tech</span>
          <span>Badges</span>
          {unlockedCount > 0 && (
            <span
              className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'achievements' ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {unlockedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`flex-1 min-w-[76px] flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
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
          className={`flex-1 min-w-[76px] flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
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
          className={`flex-1 min-w-[76px] flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
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

          {/* Attendance Badges Spotlight Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50/60 via-blue-50/40 to-indigo-50/50 border border-amber-200/60 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[20px] material-symbols-filled">workspace_premium</span>
                <span className="text-xs font-bold text-[#0B1C30]">Attendance Badges</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {unlockedCount} of {totalBadges} Unlocked
                </span>
              </div>
              <button
                onClick={() => {
                  soundFX.triggerHaptic('light');
                  setActiveTab('achievements');
                }}
                className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All Badges</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5">
              {badges.slice(0, 3).map((badge) => (
                <div
                  key={badge.id}
                  onClick={() => {
                    soundFX.triggerHaptic('light');
                    setSelectedBadge(badge);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 flex items-center gap-2.5 ${
                    badge.unlocked
                      ? 'bg-white shadow-2xs border-amber-200/80 hover:border-amber-300'
                      : 'bg-white/60 opacity-80 border-slate-200/60 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${badge.theme.iconBg}`}>
                    <span className="material-symbols-outlined text-[18px]">{badge.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-[#0B1C30] truncate">{badge.title}</p>
                    <p className={`text-[9px] font-semibold truncate ${badge.unlocked ? 'text-[#007D55]' : 'text-slate-500'}`}>
                      {badge.unlocked ? '✓ Unlocked' : `${badge.progress}% Progress`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Achievements & Badges Dedicated Section */}
      {activeTab === 'achievements' && (
        <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-4">
          {/* Header & Level Progress Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-indigo-500/15 p-4 rounded-2xl border border-amber-200/60">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-[0_4px_16px_rgba(245,158,11,0.3)] shrink-0">
                <span className="material-symbols-outlined text-[28px] material-symbols-filled">military_tech</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#0B1C30]">Attendance Badges</h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    {unlockedCount >= 4 ? 'Grandmaster Rank' : unlockedCount >= 2 ? 'Honor Attendee' : 'Active Regular'}
                  </span>
                </div>
                <p className="text-xs text-[#565E74] mt-0.5">
                  Earn academic distinctions and attendance pins through consistency & punctuality
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end">
              <span className="text-xs font-bold text-[#0B1C30]">
                {unlockedCount} / {totalBadges} Badges Unlocked
              </span>
              <div className="w-32 h-2 rounded-full bg-slate-200/80 mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-[#007D55] rounded-full transition-all duration-700"
                  style={{ width: `${(unlockedCount / totalBadges) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setBadgeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                badgeFilter === 'all'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-[#EFF4FF] text-[#565E74] hover:bg-blue-100/60'
              }`}
            >
              All Badges ({totalBadges})
            </button>
            <button
              onClick={() => setBadgeFilter('unlocked')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                badgeFilter === 'unlocked'
                  ? 'bg-[#007D55] text-white shadow-xs'
                  : 'bg-[#EFF4FF] text-[#565E74] hover:bg-blue-100/60'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => setBadgeFilter('in_progress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                badgeFilter === 'in_progress'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-[#EFF4FF] text-[#565E74] hover:bg-blue-100/60'
              }`}
            >
              In Progress ({totalBadges - unlockedCount})
            </button>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                onClick={() => {
                  soundFX.triggerHaptic('light');
                  setSelectedBadge(badge);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] relative flex flex-col justify-between ${
                  badge.theme.cardBg
                } ${badge.theme.border} ${badge.unlocked ? badge.theme.badgeGlow : 'hover:border-slate-300'}`}
              >
                <div>
                  {/* Top Tier & Status row */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/90 shadow-2xs border border-slate-200/60 text-[#0B1C30]">
                      {badge.tier} Tier
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        badge.unlocked
                          ? 'bg-[#BDFFDB]/50 text-[#007D55] border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {badge.unlocked ? 'check_circle' : 'lock'}
                      </span>
                      {badge.unlocked ? 'Unlocked' : `${badge.progress}%`}
                    </span>
                  </div>

                  {/* Emblem and Title */}
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${badge.theme.iconBg}`}>
                      <span className="material-symbols-outlined text-[24px] material-symbols-filled">
                        {badge.icon}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[14px] font-bold text-[#0B1C30] leading-tight truncate">
                        {badge.title}
                      </h4>
                      <p className="text-[11px] text-[#565E74] line-clamp-1 mt-0.5">
                        {badge.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#565E74] mt-2.5 leading-relaxed line-clamp-2">
                    {badge.description}
                  </p>
                </div>

                {/* Progress bar & Current stat */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100/80">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-[#565E74] font-medium">Progress</span>
                    <span className="font-bold text-[#0B1C30]">{badge.currentVal}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${badge.theme.progressFill}`}
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[9px] text-[#565E74]">
                    <span>Target: {badge.targetVal}</span>
                    <span className="text-[#2563EB] font-bold flex items-center gap-0.5">
                      Details <span className="material-symbols-outlined text-[11px]">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
      {/* Interactive Badge Detail Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative glow */}
            <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-30 ${selectedBadge.theme.progressFill}`} />

            {/* Close Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            {/* Badge Emblem */}
            <div className="relative my-2">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-xl ${selectedBadge.theme.iconBg} ${selectedBadge.theme.badgeGlow}`}>
                <span className="material-symbols-outlined text-[42px] material-symbols-filled">
                  {selectedBadge.icon}
                </span>
              </div>
              {selectedBadge.unlocked && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white shadow-sm">
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
              )}
            </div>

            {/* Badge Title & Tier */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#0B1C30] border border-slate-200">
                {selectedBadge.tier} Tier Milestone
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  selectedBadge.unlocked
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedBadge.unlocked ? 'Unlocked' : 'In Progress'}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-[#0B1C30] mt-1.5 tracking-tight">
              {selectedBadge.title}
            </h3>
            <p className="text-xs font-semibold text-[#565E74] mt-0.5">
              {selectedBadge.subtitle}
            </p>

            {/* Progress Meter Bar */}
            <div className="w-full bg-[#F8FAFF] p-3 rounded-2xl border border-slate-100 mt-4 text-left">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#565E74] font-semibold">Attendance Progress</span>
                <span className="font-extrabold text-[#0B1C30]">{selectedBadge.currentVal}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${selectedBadge.theme.progressFill}`}
                  style={{ width: `${selectedBadge.progress}%` }}
                />
              </div>
              <p className="text-[10px] text-[#565E74] mt-1.5 flex items-center justify-between">
                <span>Requirement: {selectedBadge.targetVal}</span>
                <span className="font-bold text-[#0B1C30]">{selectedBadge.progress}% Complete</span>
              </p>
            </div>

            {/* Description & Perk */}
            <div className="mt-3.5 space-y-2 text-left w-full">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Criteria</p>
                <p className="text-xs text-[#0B1C30] font-medium mt-0.5">{selectedBadge.description}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100/60">
                <p className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">award_star</span>
                  Perk &amp; Recognition
                </p>
                <p className="text-xs text-blue-950 font-medium mt-0.5">{selectedBadge.benefit}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-2.5 w-full mt-4">
              <button
                onClick={() => handleShareBadge(selectedBadge)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#EFF4FF] hover:bg-blue-100 text-[#2563EB] text-xs font-bold transition-all active:scale-95 border border-blue-200/60 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
                <span>Share Praise</span>
              </button>

              <button
                onClick={() => setSelectedBadge(null)}
                className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Praise Notification */}
      {badgeSharedToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#0B1C30] text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 max-w-sm w-full mx-4 animate-bounce">
          <span className="material-symbols-outlined text-amber-400 text-[18px]">verified</span>
          <span className="truncate">{badgeSharedToast}</span>
        </div>
      )}
    </div>
  );
};
