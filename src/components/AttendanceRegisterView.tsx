import React, { useState, useMemo } from 'react';
import { ClassItem, Student, AttendanceStatus } from '../types';

interface AttendanceRegisterViewProps {
  currentClass: ClassItem;
  students: Student[];
  onBack: () => void;
  onSelectStudent: (student: Student) => void;
  onAddStudent: () => void;
  onUpdateStudentStatus: (studentId: string, newStatus: AttendanceStatus) => void;
  onMarkAllPresent: () => void;
  onContactStudent: (student: Student, type: 'call' | 'message') => void;
}

export const AttendanceRegisterView: React.FC<AttendanceRegisterViewProps> = ({
  currentClass,
  students,
  onBack,
  onSelectStudent,
  onAddStudent,
  onUpdateStudentStatus,
  onMarkAllPresent,
  onContactStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AttendanceStatus>('ALL');
  const [sortBy, setSortBy] = useState<'roll' | 'name' | 'status'>('roll');
  const [selectedDate, setSelectedDate] = useState('Today • 25 Sep 2025');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeMenuStudentId, setActiveMenuStudentId] = useState<string | null>(null);

  // Compute live attendance summary metrics
  const classStudents = useMemo(() => {
    const list = students.filter((s) => s.classId === currentClass.id);
    if (list.length === 0) {
      return students.map((s) => ({
        ...s,
        classId: currentClass.id,
        className: currentClass.name,
      }));
    }
    return list;
  }, [students, currentClass.id, currentClass.name]);

  const stats = useMemo(() => {
    const present = classStudents.filter((s) => s.status === 'P').length;
    const absent = classStudents.filter((s) => s.status === 'A').length;
    const late = classStudents.filter((s) => s.status === 'L').length;
    const unmarked = classStudents.filter((s) => s.status === 'U').length;
    const total = classStudents.length;
    const presentPercentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;
    return { present, absent, late, unmarked, total, presentPercentage };
  }, [classStudents]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return classStudents
      .filter((student) => {
        const matchesSearch =
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.rollNo.includes(searchQuery);
        const matchesFilter = statusFilter === 'ALL' || student.status === statusFilter;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'roll') {
          return parseInt(a.rollNo, 10) - parseInt(b.rollNo, 10);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return a.status.localeCompare(b.status);
      });
  }, [classStudents, searchQuery, statusFilter, sortBy]);

  const handleCycleFilter = () => {
    const sequence: ('ALL' | AttendanceStatus)[] = ['ALL', 'P', 'A', 'L', 'U'];
    const nextIndex = (sequence.indexOf(statusFilter) + 1) % sequence.length;
    setStatusFilter(sequence[nextIndex]);
  };

  const handleCycleSort = () => {
    const sorts: ('roll' | 'name' | 'status')[] = ['roll', 'name', 'status'];
    const nextIndex = (sorts.indexOf(sortBy) + 1) % sorts.length;
    setSortBy(sorts[nextIndex]);
  };

  const availableDates = [
    'Today • 25 Sep 2025',
    'Yesterday • 24 Sep 2025',
    'Wed • 23 Sep 2025',
    'Tue • 22 Sep 2025',
    'Mon • 21 Sep 2025',
  ];

  return (
    <div className="flex flex-col w-full pb-28 select-none relative">
      {/* Top Bar Context / Header Extension */}
      <div className="flex items-center justify-between mb-3 pt-1">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#0B1C30] hover:bg-slate-50 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-[#DAE2FD] flex items-center justify-center text-[#2563EB] shadow-sm">
              <span className="material-symbols-outlined text-[24px] material-symbols-filled">school</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[17px] font-bold text-[#0B1C30] leading-tight">{currentClass.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#E5EEFF] text-[#004AC6] text-[10px] font-bold">
                  Sec {currentClass.section}
                </span>
              </div>
              <span className="text-xs text-[#565E74]">Attendance Register</span>
            </div>
          </div>
        </div>

        <button
          onClick={onAddStudent}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold shadow-[0_3px_10px_rgba(37,99,235,0.25)] active:scale-95 hover:bg-blue-700 transition-all cursor-pointer min-h-[44px]"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Add Student</span>
        </button>
      </div>

      {/* Date Navigation Pill & Action */}
      <div className="relative mb-3.5">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-100 shadow-sm text-[#0B1C30] text-xs font-semibold active:bg-slate-50 transition-colors min-h-[44px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#2563EB] text-[18px]">calendar_today</span>
            <span>{selectedDate}</span>
            <span className="material-symbols-outlined text-[#565E74] text-[16px]">expand_more</span>
          </button>

          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-100 shadow-sm text-[#565E74] text-xs font-medium hover:text-[#2563EB] transition-colors min-h-[44px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
            <span>Change Date</span>
          </button>
        </div>

        {/* Date Selector Popover */}
        {showDatePicker && (
          <div className="absolute top-12 left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1.5 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B1C30]">Select Attendance Date</span>
              <button onClick={() => setShowDatePicker(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {availableDates.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setSelectedDate(d);
                    setShowDatePicker(false);
                  }}
                  className={`px-3 py-2 text-left rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedDate === d ? 'bg-blue-50 text-[#2563EB]' : 'text-[#0B1C30] hover:bg-slate-50'
                  }`}
                >
                  <span>{d}</span>
                  {selectedDate === d && (
                    <span className="material-symbols-outlined text-[16px] text-[#2563EB]">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Attendance Summary Hero Card */}
      <div className="w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-3.5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[15px] font-bold text-[#0B1C30]">Attendance Summary</span>
          <span className="text-[11px] font-bold text-[#007D55] flex items-center gap-1 bg-[#BDFFDB]/30 px-2 py-0.5 rounded-full border border-emerald-200/50">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> On Track
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Circular Progress Meter */}
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.6"
              />
              <path
                className="text-[#007D55] transition-all duration-500 ease-out"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${stats.presentPercentage}, 100`}
                strokeLinecap="round"
                strokeWidth="3.6"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[17px] font-extrabold leading-tight text-[#0B1C30] tabular-nums">
                {stats.presentPercentage}%
              </span>
              <span className="text-[10px] text-[#007D55] font-bold">Present</span>
            </div>
          </div>

          {/* Breakdown Stat Grid */}
          <div className="grid grid-cols-4 gap-2 flex-1 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-[11px] text-[#565E74]">Present</span>
              </div>
              <span className="text-[16px] font-bold text-[#007D55] tabular-nums">{stats.present}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span className="text-[11px] text-[#565E74]">Absent</span>
              </div>
              <span className="text-[16px] font-bold text-[#BA1A1A] tabular-nums">{stats.absent}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="text-[11px] text-[#565E74]">Late</span>
              </div>
              <span className="text-[16px] font-bold text-amber-600 tabular-nums">{stats.late}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-[11px] text-[#565E74]">Total</span>
              </div>
              <span className="text-[16px] font-bold text-[#0B1C30] tabular-nums">{stats.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex items-center gap-2 mb-3.5">
        <div className="flex-1 flex items-center bg-white border border-slate-100 rounded-xl px-3 h-11 shadow-sm">
          <span className="material-symbols-outlined text-[#565E74] text-[20px] mr-2">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or roll no..."
            className="w-full bg-transparent text-xs text-[#0B1C30] placeholder:text-[#737686] focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <button
          onClick={handleCycleFilter}
          className={`h-11 px-3 rounded-xl border shadow-sm flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
            statusFilter !== 'ALL'
              ? 'bg-blue-50 border-blue-200 text-[#2563EB]'
              : 'bg-white border-slate-100 text-[#565E74]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          <span>{statusFilter === 'ALL' ? 'Filter' : statusFilter}</span>
          <span className="material-symbols-outlined text-[16px]">expand_more</span>
        </button>

        <button
          onClick={handleCycleSort}
          className="h-11 px-3 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center gap-1 text-[#565E74] text-xs font-semibold active:bg-slate-50 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">swap_vert</span>
          <span className="capitalize">{sortBy}</span>
        </button>
      </div>

      {/* Student Roster List */}
      <div className="flex flex-col gap-3">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-[#565E74]">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">person_search</span>
            <p className="text-sm font-semibold">No students match your filter</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or filter</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isMenuOpen = activeMenuStudentId === student.id;

            return (
              <div
                key={student.id}
                className="w-full bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex flex-col gap-2.5 transition-all hover:border-blue-100 relative"
              >
                {/* Student header row */}
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => onSelectStudent(student)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
                  >
                    <div className="relative w-11 h-11 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-100">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-600">
                          {student.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                      {/* Presence indicator dot */}
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                          student.status === 'P'
                            ? 'bg-[#10B981]'
                            : student.status === 'A'
                            ? 'bg-[#EF4444]'
                            : student.status === 'L'
                            ? 'bg-[#F59E0B]'
                            : 'bg-slate-400'
                        }`}
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-[15px] font-bold text-[#0B1C30] truncate group-hover:text-[#2563EB] transition-colors">
                        {student.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#565E74]">Roll No: {student.rollNo}</span>
                        {/* Status Badge */}
                        {student.status === 'P' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#BDFFDB]/30 text-[#007D55] text-[10px] font-bold">
                            <span className="material-symbols-outlined text-[12px] material-symbols-filled">check_circle</span>
                            Present today
                          </span>
                        )}
                        {student.status === 'A' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFDAD6] text-[#93000A] text-[10px] font-bold">
                            <span className="material-symbols-outlined text-[12px] material-symbols-filled">cancel</span>
                            Absent today
                          </span>
                        )}
                        {student.status === 'L' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            <span className="material-symbols-outlined text-[12px] material-symbols-filled">schedule</span>
                            Late today
                          </span>
                        )}
                        {student.status === 'U' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                            <span className="material-symbols-outlined text-[12px]">hourglass_empty</span>
                            Not marked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuStudentId(isMenuOpen ? null : student.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#565E74] hover:bg-slate-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>

                    {/* Popover menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-9 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-30">
                        <button
                          onClick={() => {
                            setActiveMenuStudentId(null);
                            onSelectStudent(student);
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-[#0B1C30] hover:bg-blue-50 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px] text-blue-600">badge</span>
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuStudentId(null);
                            onContactStudent(student, 'call');
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-[#0B1C30] hover:bg-blue-50 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px] text-emerald-600">call</span>
                          Call Father
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuStudentId(null);
                            onContactStudent(student, 'message');
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-[#0B1C30] hover:bg-blue-50 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px] text-indigo-600">chat</span>
                          Send SMS
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Segmented Buttons P / A / L / U */}
                <div className="grid grid-cols-4 gap-2 pt-0.5">
                  <button
                    onClick={() => onUpdateStudentStatus(student.id, 'P')}
                    className={`h-10 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center transition-all cursor-pointer ${
                      student.status === 'P'
                        ? 'bg-[#10B981] text-white ring-2 ring-emerald-200 scale-[1.02]'
                        : 'bg-[#EFF4FF] text-[#565E74] hover:bg-blue-50'
                    }`}
                  >
                    P
                  </button>
                  <button
                    onClick={() => onUpdateStudentStatus(student.id, 'A')}
                    className={`h-10 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center transition-all cursor-pointer ${
                      student.status === 'A'
                        ? 'bg-[#EF4444] text-white ring-2 ring-rose-200 scale-[1.02]'
                        : 'bg-[#EFF4FF] text-[#565E74] hover:bg-blue-50'
                    }`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => onUpdateStudentStatus(student.id, 'L')}
                    className={`h-10 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center transition-all cursor-pointer ${
                      student.status === 'L'
                        ? 'bg-[#F59E0B] text-white ring-2 ring-amber-200 scale-[1.02]'
                        : 'bg-[#EFF4FF] text-[#565E74] hover:bg-blue-50'
                    }`}
                  >
                    L
                  </button>
                  <button
                    onClick={() => onUpdateStudentStatus(student.id, 'U')}
                    className={`h-10 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center transition-all cursor-pointer ${
                      student.status === 'U'
                        ? 'bg-[#64748B] text-white ring-2 ring-slate-300 scale-[1.02]'
                        : 'bg-[#EFF4FF] text-[#565E74] hover:bg-blue-50'
                    }`}
                  >
                    U
                  </button>
                </div>

                {/* Optional notification / reminder card (e.g. for Usman Ali or when late) */}
                {(student.reminder || student.status === 'L') && (
                  <div
                    onClick={() => onContactStudent(student, 'message')}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#EFF4FF] text-[#2563EB] text-[11px] font-semibold cursor-pointer hover:bg-blue-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] material-symbols-filled">
                        notifications_active
                      </span>
                      <span>{student.reminder || 'Reminder: Parent notified of late arrival'}</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-[#565E74]">chevron_right</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Quick Scan / Action Bar with safe bottom clearance */}
      <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-4 z-30">
        <button
          onClick={onMarkAllPresent}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#2563EB] text-white shadow-[0_8px_24px_rgba(37,99,235,0.4)] hover:bg-blue-700 active:scale-95 transition-all cursor-pointer min-h-[44px]"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-none">Quick Scan</span>
            <span className="text-[10px] text-white/80 mt-0.5">Mark All Present</span>
          </div>
        </button>
      </div>
    </div>
  );
};
