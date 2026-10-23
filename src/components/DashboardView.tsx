import React, { useState, useMemo, useEffect } from 'react';
import { ClassItem, Student, TeacherProfile, TeacherLog } from '../types';
import { initialTeacherLogs } from '../data/initialData';
import { soundFX } from '../utils/audio';

interface DashboardViewProps {
  teacher: TeacherProfile;
  classes: ClassItem[];
  students: Student[];
  totalStudents: number;
  overallAttendanceRate: number;
  onSelectClass: (classId: string) => void;
  onSelectStudent?: (student: Student) => void;
  onCreateClass: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onViewAllClasses?: () => void;
}

const STORAGE_KEY = 'eduattend_teacher_logs';

export const DashboardView: React.FC<DashboardViewProps> = ({
  teacher,
  classes,
  students,
  totalStudents,
  overallAttendanceRate,
  onSelectClass,
  onSelectStudent,
  onCreateClass,
  onOpenNotifications,
  onOpenSettings,
  onViewAllClasses,
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilterType, setSearchFilterType] = useState<'all' | 'classes' | 'students'>('all');

  // Daily Teacher Logs state with localStorage persistence
  const [logs, setLogs] = useState<TeacherLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return initialTeacherLogs;
  });

  // Save logs on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save teacher logs to localStorage', e);
    }
  }, [logs]);

  // Log filter & creation modal state
  const [logFilter, setLogFilter] = useState<'all' | TeacherLog['type']>('all');
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [newLogType, setNewLogType] = useState<TeacherLog['type']>('observation');
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogContent, setNewLogContent] = useState('');
  const [newLogClassId, setNewLogClassId] = useState<string>('all');
  const [newLogPinned, setNewLogPinned] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showLocalToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered search results
  const filteredClasses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.grade.toLowerCase().includes(query) ||
        c.section.toLowerCase().includes(query) ||
        c.subjects.some((s) => s.name.toLowerCase().includes(query))
    );
  }, [classes, searchQuery]);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.rollNo.toLowerCase().includes(query) ||
        s.contact.fatherName.toLowerCase().includes(query) ||
        (s.className && s.className.toLowerCase().includes(query))
    );
  }, [students, searchQuery]);

  // Filtered logs
  const displayLogs = useMemo(() => {
    let result = [...logs];
    if (logFilter !== 'all') {
      result = result.filter((l) => l.type === logFilter);
    }
    // Sort pinned to top, then recent first
    return result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [logs, logFilter]);

  // Handle Add Note
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogTitle.trim() || !newLogContent.trim()) {
      showLocalToast('Please fill in both title and note content.');
      return;
    }

    const matchedClass = classes.find((c) => c.id === newLogClassId);
    const newLog: TeacherLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: newLogType,
      title: newLogTitle.trim(),
      content: newLogContent.trim(),
      classId: newLogClassId === 'all' ? undefined : newLogClassId,
      className: newLogClassId === 'all' ? 'All Classes' : matchedClass?.name || 'Class',
      createdAt: new Date().toISOString(),
      pinned: newLogPinned,
    };

    setLogs((prev) => [newLog, ...prev]);
    soundFX.triggerHaptic('success');
    showLocalToast('Log entry saved successfully!');

    // Reset and close
    setNewLogTitle('');
    setNewLogContent('');
    setNewLogClassId('all');
    setNewLogPinned(false);
    setIsAddNoteModalOpen(false);
  };

  // Handle Delete Note
  const handleDeleteNote = (id: string, title: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    soundFX.triggerHaptic('medium');
    showLocalToast(`Note "${title.substring(0, 20)}..." deleted.`);
  };

  // Handle Pin/Unpin
  const handleTogglePin = (id: string) => {
    setLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l))
    );
    soundFX.triggerHaptic('light');
  };

  // Helper for type styling
  const getTypeBadge = (type: TeacherLog['type']) => {
    switch (type) {
      case 'announcement':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
          icon: 'campaign',
          label: 'Announcement',
        };
      case 'urgent':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
          icon: 'priority_high',
          label: 'Urgent Notice',
        };
      case 'reminder':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
          icon: 'alarm',
          label: 'Reminder',
        };
      case 'observation':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          icon: 'visibility',
          label: 'Observation',
        };
    }
  };

  // Format relative or date string
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffMins < 5) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Today';
    }
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col w-full gap-5 pb-24">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1C30] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700/50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top App Bar (Mobile only) */}
      <div className="flex md:hidden items-center justify-between py-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-[0_4px_16px_-2px_rgba(37,99,235,0.35)]">
            <span className="material-symbols-outlined text-[22px] material-symbols-filled">fact_check</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#565E74] uppercase tracking-wider">Attendance Manager</span>
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
            <span className="text-xs text-[#565E74]">{teacher.title} · {teacher.schoolName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNotifications}
            className="relative w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[#434655] hover:text-[#2563EB] active:scale-95 transition-all cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#BA1A1A] text-white text-[10px] flex items-center justify-center font-bold">
              3
            </span>
          </button>
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[#434655] hover:text-[#2563EB] active:scale-95 transition-all cursor-pointer"
            title="Settings"
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>
        </div>
      </div>

      {/* Search Bar for Classes and Students */}
      <div className="relative w-full">
        <div className="relative flex items-center bg-white rounded-2xl border border-slate-200/90 shadow-xs focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <div className="pl-4 pr-2 text-slate-400 flex items-center justify-center pointer-events-none">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search classes or students by name, roll #, subject..."
            className="w-full py-3.5 pr-10 text-sm text-[#0B1C30] placeholder:text-slate-400 bg-transparent outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              title="Clear search"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Search Results Drawer / Live Panel */}
        {isSearching && (
          <div className="mt-3 p-4 bg-white rounded-2xl border border-blue-100 shadow-lg animate-in fade-in zoom-in-95 duration-150">
            {/* Filter category pills */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#0B1C30]">Search Results:</span>
                <span className="text-xs text-[#565E74]">
                  {filteredClasses.length} {filteredClasses.length === 1 ? 'class' : 'classes'}, {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSearchFilterType('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    searchFilterType === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({filteredClasses.length + filteredStudents.length})
                </button>
                <button
                  onClick={() => setSearchFilterType('classes')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    searchFilterType === 'classes'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Classes ({filteredClasses.length})
                </button>
                <button
                  onClick={() => setSearchFilterType('students')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    searchFilterType === 'students'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Students ({filteredStudents.length})
                </button>
              </div>
            </div>

            {/* Empty search state */}
            {filteredClasses.length === 0 && filteredStudents.length === 0 && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[24px]">search_off</span>
                </div>
                <h4 className="text-sm font-bold text-[#0B1C30]">No matching classes or students</h4>
                <p className="text-xs text-[#565E74] max-w-sm mt-0.5">
                  Try checking your spelling or searching with a different name or roll number.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Matched Classes Section */}
            {(searchFilterType === 'all' || searchFilterType === 'classes') && filteredClasses.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-[#565E74] uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px] text-blue-600">school</span>
                  <span>Classes ({filteredClasses.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {filteredClasses.map((cls) => (
                    <div
                      key={cls.id}
                      onClick={() => onSelectClass(cls.id)}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 transition-all flex items-center justify-between cursor-pointer active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">
                            {cls.categoryIcon || 'school'}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-[#0B1C30] truncate">{cls.name}</span>
                          <span className="text-[11px] text-[#565E74] truncate">
                            {cls.subjects.map((s) => s.name).join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {cls.todayAttendance.percentage}% Today
                        </span>
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Students Section */}
            {(searchFilterType === 'all' || searchFilterType === 'students') && filteredStudents.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-[#565E74] uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">groups</span>
                  <span>Students ({filteredStudents.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {filteredStudents.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => onSelectStudent?.(st)}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-200 transition-all flex items-center justify-between cursor-pointer active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border border-slate-300/50">
                          {st.avatarUrl ? (
                            <img src={st.avatarUrl} alt={st.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-slate-600">{st.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[#0B1C30] truncate">{st.name}</span>
                          <div className="flex items-center gap-1 text-[11px] text-[#565E74]">
                            <span>Roll #{st.rollNo}</span>
                            <span>•</span>
                            <span className="truncate">{st.className || 'Class'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            st.status === 'P'
                              ? 'bg-emerald-100 text-emerald-800'
                              : st.status === 'A'
                              ? 'bg-rose-100 text-rose-800'
                              : st.status === 'L'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {st.status === 'P' ? 'Present' : st.status === 'A' ? 'Absent' : st.status === 'L' ? 'Late' : 'Unmarked'}
                        </span>
                        <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
                className="w-8 h-8 rounded-full bg-white text-[#2563EB] shadow-sm flex items-center justify-center shrink-0 ml-1 hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
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

      {/* Metric Overview Tiles (4 cards on desktop, 2x2 on mobile) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
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

      {/* Class Cards Stack / Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
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

      {/* DAILY TEACHER LOG & ANNOUNCEMENTS SECTION */}
      <section className="mt-4 pt-4 border-t border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">edit_note</span>
              </div>
              <h3 className="text-[17px] font-bold text-[#0B1C30] tracking-tight">
                Daily Teacher's Log
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                {logs.length} Notes
              </span>
            </div>
            <p className="text-xs text-[#565E74] mt-0.5">
              Record classroom observations, student behavior logs, and announcements for the day.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddNoteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold shadow-sm hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Daily Log</span>
            </button>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
          <button
            onClick={() => setLogFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              logFilter === 'all'
                ? 'bg-[#0B1C30] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Notes ({logs.length})
          </button>
          <button
            onClick={() => setLogFilter('observation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              logFilter === 'observation'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Observations</span>
          </button>
          <button
            onClick={() => setLogFilter('announcement')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              logFilter === 'announcement'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Announcements</span>
          </button>
          <button
            onClick={() => setLogFilter('reminder')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              logFilter === 'reminder'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Reminders</span>
          </button>
          <button
            onClick={() => setLogFilter('urgent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              logFilter === 'urgent'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Urgent</span>
          </button>
        </div>

        {/* Logs List Grid */}
        {displayLogs.length === 0 ? (
          <div className="p-8 rounded-[20px] bg-white border border-slate-200 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[24px]">notes</span>
            </div>
            <h4 className="text-sm font-bold text-[#0B1C30]">No log entries found</h4>
            <p className="text-xs text-[#565E74] max-w-sm mt-0.5 mb-3">
              {logFilter !== 'all'
                ? `There are no ${logFilter} logs recorded yet.`
                : 'No daily notes recorded yet. Add your first note to keep track of today’s class events.'}
            </p>
            <button
              onClick={() => setIsAddNoteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Create Note</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayLogs.map((log) => {
              const badge = getTypeBadge(log.type);
              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-[20px] bg-white border transition-all hover:shadow-md flex flex-col justify-between relative ${
                    log.pinned ? 'border-blue-300 ring-1 ring-blue-200/50 bg-gradient-to-b from-blue-50/20 to-white' : 'border-slate-100 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Top row: Type badge, target class, pin and delete */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}
                        >
                          <span className="material-symbols-outlined text-[13px]">{badge.icon}</span>
                          <span>{badge.label}</span>
                        </span>
                        {log.className && (
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {log.className}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePin(log.id)}
                          className={`p-1 rounded-lg text-xs transition-colors cursor-pointer ${
                            log.pinned
                              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                          }`}
                          title={log.pinned ? 'Unpin note' : 'Pin note to top'}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {log.pinned ? 'push_pin' : 'keep'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteNote(log.id, log.title)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete note"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-[14px] font-bold text-[#0B1C30] leading-snug line-clamp-2 mb-1.5">
                      {log.title}
                    </h4>

                    {/* Content */}
                    <p className="text-xs text-[#565E74] leading-relaxed whitespace-pre-wrap line-clamp-4">
                      {log.content}
                    </p>
                  </div>

                  {/* Timestamp footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">schedule</span>
                      <span>{formatTime(log.createdAt)}</span>
                    </span>
                    {log.pinned && (
                      <span className="flex items-center gap-0.5 text-blue-600 font-semibold text-[10px]">
                        <span className="material-symbols-outlined text-[12px]">push_pin</span>
                        <span>Pinned</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ADD DAILY LOG MODAL */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">note_add</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B1C30]">Add Daily Teacher's Log</h3>
                  <p className="text-xs text-[#565E74]">Record observation or announcement for today</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddNoteModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
              {/* Note Category Selection */}
              <div>
                <label className="block text-xs font-bold text-[#0B1C30] mb-1.5">Note Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewLogType('observation')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      newLogType === 'observation'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">visibility</span>
                    <span className="text-xs font-bold">Observation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewLogType('announcement')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      newLogType === 'announcement'
                        ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-blue-600">campaign</span>
                    <span className="text-xs font-bold">Announcement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewLogType('reminder')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      newLogType === 'reminder'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-amber-600">alarm</span>
                    <span className="text-xs font-bold">Reminder</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewLogType('urgent')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      newLogType === 'urgent'
                        ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-rose-600">priority_high</span>
                    <span className="text-xs font-bold">Urgent</span>
                  </button>
                </div>
              </div>

              {/* Related Class */}
              <div>
                <label className="block text-xs font-bold text-[#0B1C30] mb-1.5">Target Class</label>
                <select
                  value={newLogClassId}
                  onChange={(e) => setNewLogClassId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#0B1C30] bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all cursor-pointer"
                >
                  <option value="all">All Classes (General School)</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.studentCount} students)
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#0B1C30] mb-1.5">Note Title</label>
                <input
                  type="text"
                  required
                  value={newLogTitle}
                  onChange={(e) => setNewLogTitle(e.target.value)}
                  placeholder="e.g. Midterm practical test reminder, classroom discipline notice..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0B1C30] placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-[#0B1C30] mb-1.5">Detailed Notes / Content</label>
                <textarea
                  required
                  rows={4}
                  value={newLogContent}
                  onChange={(e) => setNewLogContent(e.target.value)}
                  placeholder="Enter detailed observations, specific student names, instructions or agenda items..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0B1C30] placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                />
              </div>

              {/* Pinned Checkbox */}
              <label className="flex items-center gap-2 text-xs font-semibold text-[#0B1C30] cursor-pointer">
                <input
                  type="checkbox"
                  checked={newLogPinned}
                  onChange={(e) => setNewLogPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>Pin this note to the top of the teacher's log</span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Save Log Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
