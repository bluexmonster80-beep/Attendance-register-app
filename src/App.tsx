/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  initialTeacher,
  initialClasses,
  initialStudents,
  initialRecentReports,
} from './data/initialData';
import { ClassItem, Student, AttendanceStatus, RecentReport, TeacherProfile } from './types';
import { DesktopSidebar } from './components/DesktopSidebar';
import { BottomNav, NavTab } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { AttendanceRegisterView } from './components/AttendanceRegisterView';
import { StudentProfileView } from './components/StudentProfileView';
import { CreateClassView } from './components/CreateClassView';
import { AddStudentView } from './components/AddStudentView';
import { ReportsView } from './components/ReportsView';
import { AlertsView } from './components/AlertsView';
import { SettingsView } from './components/SettingsView';
import { ContactModal, ShareModal } from './components/Modals';
import { ImportRosterModal } from './components/ImportRosterModal';

import { usePWAInstall } from './hooks/usePWAInstall';
import { apiClient, SyncState } from './services/apiClient';

type ViewMode =
  | 'dashboard'
  | 'attendance_register'
  | 'student_profile'
  | 'create_class'
  | 'add_student'
  | 'reports'
  | 'alerts'
  | 'settings';

export default function App() {
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [teacher, setTeacher] = useState<TeacherProfile>(initialTeacher);
  const [recentReports] = useState<RecentReport[]>(initialRecentReports);

  const [syncState, setSyncState] = useState<SyncState>('synced');

  // Hydrate data from backend API with transparent fallback
  useEffect(() => {
    const unsub = apiClient.onSyncChange((state) => {
      setSyncState(state);
    });

    apiClient.getBootstrapData().then((bootstrap) => {
      if (bootstrap) {
        setClasses(bootstrap.classes);
        setStudents(bootstrap.students);
        setTeacher(bootstrap.teacher);
      }
    });

    return () => unsub();
  }, []);

  // Navigation states
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string>('class-10-a');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('student-01');

  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // PWA install hook
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Modals & Feedback
  const [contactModalState, setContactModalState] = useState<{
    isOpen: boolean;
    type: 'call' | 'message';
    student: Student | null;
  }>({
    isOpen: false,
    type: 'call',
    student: null,
  });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleInstallApp = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        showToast('Attendance Manager installed to home screen!');
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      showToast('To install: open browser menu and select "Install" or "Add to Home Screen"');
    }
  };

  // Find currently selected class & student
  const activeClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Derived overall statistics
  const totalStudentsCount = useMemo(() => {
    return students.length > 0 ? 142 : 0;
  }, [students]);

  const overallAttendanceRate = useMemo(() => {
    const presentCount = students.filter((s) => s.status === 'P').length;
    const lateCount = students.filter((s) => s.status === 'L').length;
    const total = students.length;
    if (total === 0) return 87;
    return Math.round(((presentCount + lateCount * 0.5) / total) * 100);
  }, [students]);

  // Update a student's attendance status (P / A / L / U)
  const handleUpdateStudentStatus = (studentId: string, newStatus: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const statusTextMap: Record<AttendanceStatus, string> = {
            P: 'Present today',
            A: 'Absent today',
            L: 'Late today',
            U: 'Not marked',
          };
          return {
            ...s,
            status: newStatus,
            statusText: statusTextMap[newStatus],
          };
        }
        return s;
      })
    );

    // Also update current class todayAttendance
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === selectedClassId) {
          const classStudents = students.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s));
          const p = classStudents.filter((s) => s.status === 'P').length;
          const total = c.studentCount;
          return {
            ...c,
            todayAttendance: {
              present: p,
              total: total,
              percentage: Math.round((p / total) * 100),
            },
          };
        }
        return c;
      })
    );

    showToast(`Marked ${newStatus === 'P' ? 'Present' : newStatus === 'A' ? 'Absent' : newStatus === 'L' ? 'Late' : 'Unmarked'}`);

    // Synchronize with API (with transparent offline fallback)
    apiClient
      .updateAttendance({
        studentId,
        classId: selectedClassId,
        status: newStatus,
      })
      .then((res) => {
        if (res.success && res.data) {
          setClasses((prev) =>
            prev.map((c) => (c.id === res.data!.updatedClass.id ? res.data!.updatedClass : c))
          );
        }
      });
  };

  // Quick Scan: Mark all students as Present
  const handleMarkAllPresent = () => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'P',
        statusText: 'Present today',
      }))
    );

    setClasses((prev) =>
      prev.map((c) =>
        c.id === selectedClassId
          ? {
              ...c,
              todayAttendance: {
                present: c.studentCount,
                total: c.studentCount,
                percentage: 100,
              },
            }
          : c
      )
    );

    showToast('Quick Scan: All students marked Present!');

    // Synchronize with API
    apiClient.markAllPresent({ classId: selectedClassId }).then((res) => {
      if (res.success && res.data) {
        setClasses((prev) =>
          prev.map((c) => (c.id === res.data!.updatedClass.id ? res.data!.updatedClass : c))
        );
      }
    });
  };

  // Handle Tab Switch
  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    if (tab === 'dashboard') {
      setCurrentView('dashboard');
    } else if (tab === 'classes') {
      setCurrentView('attendance_register');
    } else if (tab === 'reports') {
      setCurrentView('reports');
    } else if (tab === 'alerts') {
      setCurrentView('alerts');
    } else if (tab === 'settings') {
      setCurrentView('settings');
    }
  };

  // Class selection
  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
    setCurrentView('attendance_register');
    setCurrentTab('classes');
  };

  // Student selection
  const handleSelectStudent = (student: Student) => {
    setSelectedStudentId(student.id);
    setCurrentView('student_profile');
  };

  // Create class submission
  const handleClassCreated = (newClass: ClassItem) => {
    setClasses([newClass, ...classes]);
    setSelectedClassId(newClass.id);
    setCurrentView('attendance_register');
    showToast(`Class "${newClass.name}" created successfully!`);

    // Synchronize with API
    apiClient.createClass(newClass);
  };

  // Add student submission
  const handleStudentSaved = (newStudent: Student) => {
    setStudents([newStudent, ...students]);
    setClasses((prev) =>
      prev.map((c) =>
        c.id === selectedClassId
          ? {
              ...c,
              studentCount: c.studentCount + 1,
              todayAttendance: {
                ...c.todayAttendance,
                total: c.todayAttendance.total + 1,
              },
            }
          : c
      )
    );
    setSelectedStudentId(newStudent.id);
    setCurrentView('student_profile');
    showToast(`Student ${newStudent.name} saved!`);

    // Synchronize with API
    apiClient.createStudent({
      name: newStudent.name,
      rollNo: newStudent.rollNo,
      classId: selectedClassId,
      className: activeClass.name,
      avatarUrl: newStudent.avatarUrl,
      contact: newStudent.contact,
      notes: newStudent.notes,
    });
  };

  // Bulk import students from CSV
  const handleImportStudents = async (newStudentsList: Student[], targetClassId: string) => {
    // Merge new students avoiding duplicate ids
    setStudents((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const filteredNew = newStudentsList.filter((s) => !existingIds.has(s.id));
      return [...prev, ...filteredNew];
    });

    const targetClass = classes.find((c) => c.id === targetClassId) || activeClass;

    // Update target class student count
    setClasses((prev) =>
      prev.map((c) =>
        c.id === targetClassId
          ? {
              ...c,
              studentCount: c.studentCount + newStudentsList.length,
              todayAttendance: {
                ...c.todayAttendance,
                total: c.todayAttendance.total + newStudentsList.length,
              },
            }
          : c
      )
    );

    setSelectedClassId(targetClassId);
    showToast(`Successfully imported ${newStudentsList.length} students into ${targetClass.name}!`);

    // Sync to API
    apiClient.bulkCreateStudents({ students: newStudentsList, classId: targetClassId }).then((res) => {
      if (res.success) {
        setSyncState('synced');
      }
    });
  };

  // Update teacher profile
  const handleUpdateTeacher = (updated: TeacherProfile) => {
    setTeacher(updated);
    apiClient.updateTeacher(updated);
  };

  // Contact parent
  const handleContactStudent = (student: Student, type: 'call' | 'message') => {
    setContactModalState({
      isOpen: true,
      type,
      student,
    });
  };

  // Reset data
  const handleResetData = () => {
    setClasses(initialClasses);
    setStudents(initialStudents);
    setTeacher(initialTeacher);
    setSelectedClassId('class-10-a');
    setSelectedStudentId('student-01');
    setCurrentView('dashboard');
    setCurrentTab('dashboard');
    showToast('Demo data reset to initial default state.');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col md:flex-row text-[#0B1C30] font-sans antialiased">
      {/* Dedicated Desktop Sidebar (hidden on mobile, visible on desktop) */}
      <DesktopSidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        unreadAlertsCount={3}
        teacher={teacher}
        onCreateClass={() => setCurrentView('create_class')}
        onAddStudent={() => setCurrentView('add_student')}
        onImportRoster={() => setIsImportModalOpen(true)}
        syncState={syncState}
      />

      {/* Main Responsive Application Shell */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Desktop Top Header Bar (hidden on mobile) */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-10 py-3.5 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[#0B1C30] tracking-tight">
              {currentView === 'dashboard' && 'School Dashboard'}
              {currentView === 'attendance_register' && `${activeClass.name} · Attendance Register`}
              {currentView === 'student_profile' && `${activeStudent.name} · Profile & Record`}
              {currentView === 'create_class' && 'Create New Classroom'}
              {currentView === 'add_student' && `Add Student · ${activeClass.name}`}
              {currentView === 'reports' && 'Attendance Reports & Analytics'}
              {currentView === 'alerts' && 'Attendance Alerts & Notices'}
              {currentView === 'settings' && 'App & Account Settings'}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
              Academic Year 2025 - 2026
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Class Switcher Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <span className="material-symbols-outlined text-slate-400 text-[16px]">school</span>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setCurrentTab('classes');
                  setCurrentView('attendance_register');
                }}
                className="bg-transparent text-[#0B1C30] font-bold outline-none cursor-pointer"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.studentCount} students)
                  </option>
                ))}
              </select>
            </div>

            {(!isInstalled && (isInstallable || isIOS)) && (
              <button
                onClick={handleInstallApp}
                className="px-3 py-1.5 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Install App
              </button>
            )}

            <button
              onClick={() => {
                setCurrentTab('alerts');
                setCurrentView('alerts');
              }}
              title="Alerts & Notices"
              className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#BA1A1A]" />
            </button>

            <button
              onClick={() => {
                setCurrentTab('settings');
                setCurrentView('settings');
              }}
              title="Settings"
              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
          </div>
        </header>

        {/* Main Content Area: Smooth, natural document scrolling on both mobile and desktop! */}
        <main className="flex-1 px-3.5 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-6 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {currentView === 'dashboard' && (
            <DashboardView
              teacher={teacher}
              classes={classes}
              students={students}
              totalStudents={totalStudentsCount}
              overallAttendanceRate={overallAttendanceRate}
              onSelectClass={handleSelectClass}
              onSelectStudent={handleSelectStudent}
              onCreateClass={() => setCurrentView('create_class')}
              onOpenNotifications={() => {
                setCurrentTab('alerts');
                setCurrentView('alerts');
              }}
              onOpenSettings={() => {
                setCurrentTab('settings');
                setCurrentView('settings');
              }}
              onViewAllClasses={() => {
                setCurrentTab('classes');
                setCurrentView('attendance_register');
              }}
            />
          )}

          {currentView === 'attendance_register' && (
            <AttendanceRegisterView
              currentClass={activeClass}
              students={students}
              onBack={() => {
                setCurrentView('dashboard');
                setCurrentTab('dashboard');
              }}
              onSelectStudent={handleSelectStudent}
              onAddStudent={() => setCurrentView('add_student')}
              onImportRoster={() => setIsImportModalOpen(true)}
              onUpdateStudentStatus={handleUpdateStudentStatus}
              onMarkAllPresent={handleMarkAllPresent}
              onContactStudent={handleContactStudent}
            />
          )}

          {currentView === 'student_profile' && (
            <StudentProfileView
              student={activeStudent}
              onBack={() => setCurrentView('attendance_register')}
              onEditStudent={() => setCurrentView('add_student')}
              onCallFather={(phone, name) => {
                handleContactStudent(activeStudent, 'call');
              }}
              onSendMessage={(student) => {
                handleContactStudent(student, 'message');
              }}
              onToast={(msg) => showToast(msg)}
            />
          )}

          {currentView === 'create_class' && (
            <CreateClassView
              onBack={() => {
                setCurrentView('dashboard');
                setCurrentTab('dashboard');
              }}
              onClassCreated={handleClassCreated}
            />
          )}

          {currentView === 'add_student' && (
            <AddStudentView
              currentClassId={selectedClassId}
              currentClassName={activeClass.name}
              onBack={() => setCurrentView('attendance_register')}
              onStudentSaved={handleStudentSaved}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              classes={classes}
              students={students}
              recentReports={recentReports}
              teacherProfile={teacher}
              onBack={() => {
                setCurrentView('dashboard');
                setCurrentTab('dashboard');
              }}
              onSelectStudent={handleSelectStudent}
              onSelectClass={handleSelectClass}
              onShareReport={() => setIsShareModalOpen(true)}
              onToast={(msg) => showToast(msg)}
              onDownloadReport={(report) => {
                showToast(`Downloaded ${report.title} (${report.format})`);
              }}
            />
          )}

          {currentView === 'alerts' && (
            <AlertsView
              onBack={() => {
                setCurrentView('dashboard');
                setCurrentTab('dashboard');
              }}
              onTakeAction={(alert) => {
                if (alert.type === 'late' || alert.type === 'absence') {
                  handleContactStudent(activeStudent, 'message');
                } else if (alert.type === 'reminder') {
                  showToast('Daily register submitted to school administration!');
                }
              }}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              teacher={teacher}
              onUpdateTeacher={setTeacher}
              onResetData={handleResetData}
              onInstallApp={handleInstallApp}
            />
          )}
        </main>

        {/* Fixed Bottom Tab Bar */}
        {currentView !== 'create_class' && currentView !== 'add_student' && currentView !== 'student_profile' && (
          <BottomNav
            currentTab={currentTab}
            onTabChange={handleTabChange}
            unreadAlertsCount={3}
          />
        )}

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#0B1C30]/90 text-white text-xs font-semibold py-2 px-4 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* iOS Guided Install Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">install_mobile</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0B1C30]">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              <div className="space-y-2 text-xs text-[#565E74] leading-relaxed bg-[#EFF4FF] p-3 rounded-xl border border-blue-100/60">
                <p className="flex items-start gap-2">
                  <span className="font-bold text-[#2563EB]">1.</span>
                  <span>Tap the <strong className="text-[#0B1C30]">Share</strong> icon at the bottom of your Safari browser bar.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-[#2563EB]">2.</span>
                  <span>Scroll down and select <strong className="text-[#0B1C30]">Add to Home Screen</strong>.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-[#2563EB]">3.</span>
                  <span>Launch <strong className="text-[#0B1C30]">Attendance Manager</strong> directly as a full-screen app.</span>
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full h-11 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        <ContactModal
          isOpen={contactModalState.isOpen}
          type={contactModalState.type}
          student={contactModalState.student}
          onClose={() => setContactModalState({ ...contactModalState, isOpen: false })}
          onConfirm={(msg) => {
            showToast(
              contactModalState.type === 'call'
                ? `Calling ${contactModalState.student?.contact.fatherName}...`
                : 'SMS notification sent successfully to parent!'
            );
          }}
        />

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onCopied={() => showToast('Report link copied to clipboard!')}
        />

        <ImportRosterModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          classes={classes}
          selectedClassId={selectedClassId}
          existingStudents={students}
          onImportStudents={handleImportStudents}
          onToast={showToast}
        />
      </div>
    </div>
  );
}
