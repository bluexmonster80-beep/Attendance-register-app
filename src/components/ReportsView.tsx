import React, { useState } from 'react';
import { ClassItem, Student, RecentReport } from '../types';

interface ReportsViewProps {
  classes: ClassItem[];
  students: Student[];
  recentReports: RecentReport[];
  onBack?: () => void;
  onSelectStudent: (student: Student) => void;
  onSelectClass: (classId: string) => void;
  onShareReport: () => void;
  onDownloadReport: (report: RecentReport) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  classes,
  students,
  recentReports,
  onBack,
  onSelectStudent,
  onSelectClass,
  onShareReport,
  onDownloadReport,
}) => {
  const [trendPeriod, setTrendPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Month');

  // Trend data according to period
  const trendData = {
    weekly: {
      points: [
        { label: 'Sep 15', val: 70 },
        { label: 'Sep 16', val: 78 },
        { label: 'Sep 17', val: 68 },
        { label: 'Sep 18', val: 72 },
        { label: 'Sep 19', val: 74 },
        { label: 'Sep 20', val: 88 },
        { label: 'Sep 21', val: 87, active: true },
      ],
      pathD: 'M 30,55 C 60,50 70,44 95,44 C 120,44 130,60 155,58 C 185,55 195,50 220,50 C 245,49 260,35 285,32 C 305,30 320,38 335,40',
      areaD: 'M 30,55 C 60,50 70,44 95,44 C 120,44 130,60 155,58 C 185,55 195,50 220,50 C 245,49 260,35 285,32 C 305,30 320,38 335,40 L 335,115 L 30,115 Z',
    },
    monthly: {
      points: [
        { label: 'Week 1', val: 82 },
        { label: 'Week 2', val: 85 },
        { label: 'Week 3', val: 80 },
        { label: 'Week 4', val: 87, active: true },
      ],
      pathD: 'M 30,45 C 90,40 120,32 180,35 C 240,38 270,25 335,28',
      areaD: 'M 30,45 C 90,40 120,32 180,35 C 240,38 270,25 335,28 L 335,115 L 30,115 Z',
    },
    yearly: {
      points: [
        { label: 'Term 1', val: 84 },
        { label: 'Term 2', val: 87, active: true },
        { label: 'Term 3', val: 89 },
      ],
      pathD: 'M 30,48 C 120,42 180,35 260,30 C 290,28 320,25 335,24',
      areaD: 'M 30,48 C 120,42 180,35 260,30 C 290,28 320,25 335,24 L 335,115 L 30,115 Z',
    },
  };

  // Find most absent students
  const absentStudents = [
    students.find((s) => s.id === 'student-07') || {
      id: 'student-07',
      name: 'Ali Raza',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBDq7zRZbK4pONqVHfbQARUmFWKw5T67sW0dLTUF6q6LzEJ7JZlY_n-nxijNmKTfO344kL-bkqKOtU-q-j8aEtsk-V7cXIzlAmFn5kNEyap18fklLu2clOvK9SNXsbXd6t_Vpfppnn86kWl5tZVz_EQpvdYsZmlu_KbKPAwGq2nQ-OBKysJpf5zwcrrEMa6YSq-i18GAd5S7a0zsnNTwLZv_GGsJXC9pdOYemEmFRZNO7GxRbjapmMN',
      statusText: '8 days missed',
      attendanceStats: { overallPercentage: 52 },
    },
    students.find((s) => s.id === 'student-08') || {
      id: 'student-08',
      name: 'Zainab Fatima',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAVgdDioRnG6G-xammjtrguS6PihRFbmn7vK58cOSVRj0u6GAR_WXe_UbV6iSbVkeXrVmkHMGJc3vXm7YZVUYStAnHAiP8RgoIshLgVBwIsGsWusvbakU-7VXtCz-pIJDFPVCq1Nf5m-sPZHRHRJtpF7K8euV8B7JXaSt38-Mj6OKnL4yOCwnwRMYSS1osY-0Kjx7XsKWCYzogYdOwpFBlrcU5bihM7D9myDXtvXh9johMWFManeHpA',
      statusText: '7 days missed',
      attendanceStats: { overallPercentage: 58 },
    },
    students.find((s) => s.id === 'student-09') || {
      id: 'student-09',
      name: 'Usman Tariq',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDPMyUh3-2wVA_TjqtxiYHx1_Rp1TAlV7N-Zfj0w9RhG7JKmBvLPhrO4Dk_NMBlhRDAsHi9l6Zw6dPKB5wXgYcts_BHs3mqMEo7lHgx2cI1qEq-w_O2HOv86ixKBIr8lLcm7lSHrQXAL_xcRwzQjo8Lx3bGg62UE0-aCN54Hp66v3mH9seh4DqhXwvYhEsT5tIlng4Ve4TquPUh7OzZYEB7PLy9OH8U-No7_YHeD_KkP9COwYJYHkYC',
      statusText: '6 days missed',
      attendanceStats: { overallPercentage: 61 },
    },
    students.find((s) => s.id === 'student-10') || {
      id: 'student-10',
      name: 'Hira Khan',
      avatarUrl: '',
      statusText: '5 days missed',
      attendanceStats: { overallPercentage: 64 },
    },
    students.find((s) => s.id === 'student-11') || {
      id: 'student-11',
      name: 'Ahmed Shah',
      avatarUrl: '',
      statusText: '5 days missed',
      attendanceStats: { overallPercentage: 66 },
    },
  ];

  return (
    <div className="flex flex-col w-full pb-28 select-none space-y-3.5 pt-1">
      {/* Sub-Header Controls & Scope Filter */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#0B1C30] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          )}
          <div className="flex flex-col">
            <span className="text-[17px] font-bold text-[#0B1C30] leading-tight">Reports &amp; Analytics</span>
            <span className="text-xs text-[#565E74] truncate">Track attendance, performance &amp; progress</span>
          </div>
        </div>

        {/* Timeframe Filter Pill */}
        <button
          onClick={() => {
            const tfs = ['This Month', 'Last Month', 'Term 1', 'Term 2', 'Full Year'];
            const nextIdx = (tfs.indexOf(selectedTimeframe) + 1) % tfs.length;
            setSelectedTimeframe(tfs[nextIdx]);
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200/80 shadow-sm rounded-xl text-[#004AC6] text-xs font-semibold hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-[#2563EB]">calendar_month</span>
          <span>{selectedTimeframe}</span>
          <span className="material-symbols-outlined text-[14px] text-[#565E74]">expand_more</span>
        </button>
      </div>

      {/* Overall Attendance Hero Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Donut Metric Graphic */}
            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.6"
                />
                <path
                  className="text-[#007D55]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeDasharray="87, 100"
                  strokeLinecap="round"
                  strokeWidth="3.6"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[17px] font-extrabold text-[#0B1C30] leading-none tabular-nums">87%</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-[#0B1C30]">Overall Attendance</span>
              <span className="text-xs text-[#565E74]">For All Classes</span>
              <div className="flex items-center gap-1 mt-1 text-[#007D55] text-xs font-bold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>+5%</span>
                <span className="text-[#565E74] font-normal">vs last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Mini Stats Split */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* Total Students */}
          <div className="bg-[#EFF4FF] border border-blue-100/60 rounded-xl p-2.5 flex flex-col items-center text-center">
            <div className="w-6 h-6 rounded-full bg-[#DAE2FD] text-[#2563EB] flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[15px]">group</span>
            </div>
            <span className="text-[11px] text-[#565E74]">Total Students</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-[#0B1C30] tabular-nums">142</span>
              <span className="text-[10px] text-[#007D55] font-bold">+2↑</span>
            </div>
          </div>

          {/* Total Classes */}
          <div className="bg-[#EFF4FF] border border-blue-100/60 rounded-xl p-2.5 flex flex-col items-center text-center">
            <div className="w-6 h-6 rounded-full bg-[#D3E4FE] text-[#2563EB] flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[15px]">calendar_today</span>
            </div>
            <span className="text-[11px] text-[#565E74]">Total Classes</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-[#0B1C30] tabular-nums">5</span>
              <span className="text-[10px] text-[#565E74] font-bold">+0</span>
            </div>
          </div>

          {/* Absent Today */}
          <div className="bg-[#EFF4FF] border border-blue-100/60 rounded-xl p-2.5 flex flex-col items-center text-center">
            <div className="w-6 h-6 rounded-full bg-[#FFDAD6] text-[#BA1A1A] flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[15px]">person_off</span>
            </div>
            <span className="text-[11px] text-[#565E74]">Absent Today</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-[#0B1C30] tabular-nums">18</span>
              <span className="text-[10px] text-[#BA1A1A] font-bold">-6↓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Trend Chart Module */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#2563EB] text-[20px]">show_chart</span>
            <h2 className="text-[15px] font-bold text-[#0B1C30]">Attendance Trend</h2>
          </div>

          {/* Period Segment Toggle */}
          <div className="flex p-0.5 bg-[#EFF4FF] rounded-lg border border-blue-100/60">
            <button
              onClick={() => setTrendPeriod('weekly')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                trendPeriod === 'weekly' ? 'bg-[#2563EB] text-white shadow-sm' : 'text-[#565E74]'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTrendPeriod('monthly')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                trendPeriod === 'monthly' ? 'bg-[#2563EB] text-white shadow-sm' : 'text-[#565E74]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTrendPeriod('yearly')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                trendPeriod === 'yearly' ? 'bg-[#2563EB] text-white shadow-sm' : 'text-[#565E74]'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Responsive SVG Line Chart */}
        <div className="relative w-full pt-3 pb-1">
          <div className="absolute right-3 top-0 bg-[#2563EB] text-white px-2 py-0.5 rounded-md shadow-sm flex flex-col items-center">
            <span className="text-[11px] font-bold">87%</span>
            <span className="text-[9px] opacity-80">Sep 21</span>
          </div>

          <svg className="w-full h-36 overflow-visible" viewBox="0 0 340 120">
            <defs>
              <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            <line stroke="#E2E8F0" strokeDasharray="3,3" strokeWidth="1" x1="0" x2="340" y1="15" y2="15" />
            <line stroke="#E2E8F0" strokeDasharray="3,3" strokeWidth="1" x1="0" x2="340" y1="45" y2="45" />
            <line stroke="#E2E8F0" strokeDasharray="3,3" strokeWidth="1" x1="0" x2="340" y1="75" y2="75" />
            <line stroke="#E2E8F0" strokeDasharray="3,3" strokeWidth="1" x1="0" x2="340" y1="105" y2="105" />

            {/* Y Axis Markers */}
            <text className="text-[9px] fill-slate-400 font-medium" x="2" y="18">100%</text>
            <text className="text-[9px] fill-slate-400 font-medium" x="2" y="48">75%</text>
            <text className="text-[9px] fill-slate-400 font-medium" x="2" y="78">50%</text>
            <text className="text-[9px] fill-slate-400 font-medium" x="2" y="108">25%</text>

            {/* Area Fill */}
            <path d={trendData[trendPeriod].areaD} fill="url(#trendGradient)" />

            {/* Trend Line Path */}
            <path
              d={trendData[trendPeriod].pathD}
              fill="none"
              stroke="#2563EB"
              strokeLinecap="round"
              strokeWidth="2.5"
            />

            {/* Dot Node Markers */}
            <circle cx="30" cy="55" fill="#2563EB" r="3.5" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="95" cy="44" fill="#2563EB" r="3.5" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="155" cy="58" fill="#2563EB" r="3.5" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="220" cy="50" fill="#2563EB" r="3.5" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="285" cy="32" fill="#2563EB" r="3.5" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="335" cy="40" fill="#2563EB" r="4.5" stroke="#FFFFFF" strokeWidth="2" />
          </svg>

          {/* X-Axis Labels */}
          <div className="flex justify-between px-2 pt-1 text-[10px] text-[#565E74] font-medium">
            {trendData[trendPeriod].points.map((pt, i) => (
              <span key={i} className={pt.active ? 'font-bold text-[#2563EB]' : ''}>
                {pt.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Class Performance Breakdown */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#2563EB] text-[20px]">school</span>
            <h2 className="text-[15px] font-bold text-[#0B1C30]">Class Performance</h2>
          </div>
          <button
            onClick={() => onSelectClass('class-10-a')}
            className="flex items-center text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {classes.map((cls, idx) => {
            const performanceRates = [92, 88, 76, 81, 85];
            const rate = performanceRates[idx % performanceRates.length];

            return (
              <div
                key={cls.id}
                onClick={() => onSelectClass(cls.id)}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#EFF4FF]/70 hover:bg-[#EFF4FF] border border-blue-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      cls.badgeColor || 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {cls.categoryIcon || 'school'}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#0B1C30] truncate">{cls.name}</span>
                    <span className="text-[11px] text-[#565E74]">{cls.studentCount} Students</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-extrabold text-[#0B1C30] tabular-nums">{rate}%</span>
                    <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          rate >= 85 ? 'bg-[#007D55]' : rate >= 80 ? 'bg-[#2563EB]' : 'bg-amber-500'
                        }`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-[#565E74]">chevron_right</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance by Subject Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#2563EB] text-[20px]">pie_chart</span>
          <h2 className="text-[15px] font-bold text-[#0B1C30]">Attendance by Subject</h2>
        </div>

        <div className="flex items-center gap-3.5 pt-1">
          {/* Multi-Segment Donut Chart */}
          <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" fill="none" r="15" stroke="#E2E8F0" strokeWidth="4.5" />
              <circle
                cx="18"
                cy="18"
                fill="none"
                r="15"
                stroke="#2563EB"
                strokeDasharray="20 100"
                strokeDashoffset="0"
                strokeWidth="4.5"
              />
              <circle
                cx="18"
                cy="18"
                fill="none"
                r="15"
                stroke="#8B5CF6"
                strokeDasharray="18 100"
                strokeDashoffset="-20"
                strokeWidth="4.5"
              />
              <circle
                cx="18"
                cy="18"
                fill="none"
                r="15"
                stroke="#007D55"
                strokeDasharray="17 100"
                strokeDashoffset="-38"
                strokeWidth="4.5"
              />
              <circle
                cx="18"
                cy="18"
                fill="none"
                r="15"
                stroke="#F59E0B"
                strokeDasharray="16 100"
                strokeDashoffset="-55"
                strokeWidth="4.5"
              />
              <circle
                cx="18"
                cy="18"
                fill="none"
                r="15"
                stroke="#BA1A1A"
                strokeDasharray="14 100"
                strokeDashoffset="-71"
                strokeWidth="4.5"
              />
              <circle
                cx="18"
                cy="18"
                fill="none"
                r="15"
                stroke="#0053DB"
                strokeDasharray="15 100"
                strokeDashoffset="-85"
                strokeWidth="4.5"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[17px] font-extrabold text-[#0B1C30] leading-tight tabular-nums">87%</span>
              <span className="text-[10px] text-[#565E74]">Overall</span>
            </div>
          </div>

          {/* Subject Legends List */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 truncate text-[#0B1C30] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" /> Math
              </span>
              <span className="font-bold text-[#0B1C30]">90%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 truncate text-[#0B1C30] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shrink-0" /> Physics
              </span>
              <span className="font-bold text-[#0B1C30]">85%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 truncate text-[#0B1C30] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#007D55] shrink-0" /> Chemistry
              </span>
              <span className="font-bold text-[#0B1C30]">82%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 truncate text-[#0B1C30] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" /> English
              </span>
              <span className="font-bold text-[#0B1C30]">88%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 truncate text-[#0B1C30] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#BA1A1A] shrink-0" /> Urdu
              </span>
              <span className="font-bold text-[#0B1C30]">80%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 truncate text-[#0B1C30] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#0053DB] shrink-0" /> Comp Sci
              </span>
              <span className="font-bold text-[#0B1C30]">92%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview Metric Cards */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#2563EB] text-[20px]">insights</span>
          <h2 className="text-[15px] font-bold text-[#0B1C30]">Performance Overview</h2>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          {/* Average Marks */}
          <div className="bg-[#EFF4FF] border border-blue-100/50 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-[#565E74] font-medium">Average Marks</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[20px] font-extrabold text-[#0B1C30] tabular-nums">78%</span>
              <span className="text-[10px] text-[#007D55] font-bold">+6%</span>
            </div>
          </div>

          {/* Highest Marks */}
          <div className="bg-[#EFF4FF] border border-blue-100/50 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-[#565E74] font-medium">Highest Marks</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[20px] font-extrabold text-[#0B1C30] tabular-nums">98%</span>
              <span className="text-[10px] text-[#007D55] font-bold">+4%</span>
            </div>
          </div>

          {/* Pass Rate */}
          <div className="bg-[#EFF4FF] border border-blue-100/50 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-[#565E74] font-medium">Pass Rate</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[20px] font-extrabold text-[#0B1C30] tabular-nums">94%</span>
              <span className="text-[10px] text-[#007D55] font-bold">+3%</span>
            </div>
          </div>

          {/* Top Performer */}
          <div className="bg-[#EFF4FF] border border-blue-100/50 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#565E74] font-medium truncate">Top Performer</span>
              <span className="material-symbols-outlined text-amber-500 text-[18px]">crown</span>
            </div>
            <div className="mt-2 min-w-0">
              <span className="text-xs font-bold text-[#0B1C30] truncate block">Ayesha Khan</span>
              <span className="text-[10px] text-[#007D55] font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px]">arrow_drop_up</span> 96%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Most Absent Students Watchlist */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#BA1A1A] text-[20px]">person_alert</span>
            <h2 className="text-[15px] font-bold text-[#0B1C30]">Most Absent Students</h2>
          </div>
          <button
            onClick={() => onSelectStudent(absentStudents[0] as Student)}
            className="flex items-center text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {absentStudents.map((st, idx) => (
            <div
              key={st.id || idx}
              onClick={() => onSelectStudent(st as Student)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-[#EFF4FF] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {st.avatarUrl ? (
                  <img
                    src={st.avatarUrl}
                    alt={st.name}
                    className="w-8 h-8 rounded-full object-cover shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#DAE2FD] text-[#004AC6] flex items-center justify-center font-bold text-[11px] shrink-0">
                    {st.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#0B1C30] truncate">{st.name}</span>
                  <span className="text-[10px] text-[#BA1A1A] font-medium">{st.statusText}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#565E74] tabular-nums">
                  {st.attendanceStats?.overallPercentage}%
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#565E74]">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports & Export Documents */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#2563EB] text-[20px]">description</span>
          <h2 className="text-[15px] font-bold text-[#0B1C30]">Recent Reports</h2>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          {recentReports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-2.5 bg-[#EFF4FF]/70 border border-blue-50 rounded-xl"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    report.format === 'PDF'
                      ? 'bg-[#FFDAD6] text-[#BA1A1A]'
                      : 'bg-emerald-100 text-[#007D55]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {report.format === 'PDF' ? 'picture_as_pdf' : 'table_chart'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#0B1C30] truncate">{report.title}</span>
                  <span className="text-[10px] text-[#565E74]">{report.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    report.format === 'PDF'
                      ? 'bg-[#FFDAD6] text-[#BA1A1A]'
                      : 'bg-emerald-100 text-[#007D55]'
                  }`}
                >
                  {report.format}
                </span>
                <button
                  onClick={() => onDownloadReport(report)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 flex items-center justify-center text-[#2563EB] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Share Report CTA */}
        <button
          onClick={onShareReport}
          className="mt-2 w-full h-11 bg-[#EFF4FF] hover:bg-blue-100 text-[#2563EB] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.99] border border-blue-200/50 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">share</span>
          <span>Share Report</span>
        </button>
      </div>
    </div>
  );
};
