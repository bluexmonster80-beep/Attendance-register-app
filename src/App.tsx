/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  initialTeacher,
  initialClasses,
  initialStudents,
  initialRecentReports,
} from './data/initialData';
import { ClassItem, Student, AttendanceStatus, RecentReport, TeacherProfile } from './types';
import { StatusBar } from './components/StatusBar';
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

import { usePWAInstall } from './hooks/usePWAInstall';

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

  // Navigation states
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string>('class-10-a');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('student-01');

  // Device frame toggle (for testing/previewing on desktop)
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
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
        showToast('EduAttend installed to home screen!');
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
    <div className="w-full min-h-[100dvh] bg-[#F8F9FF] sm:bg-[#E5EEFF] flex flex-col items-center justify-start text-[#0B1C30] p-0 sm:py-6 sm:px-4 font-sans select-none">
      {/* Top Floating Control Bar for Demo / Testing Viewports */}
      <header className="hidden sm:flex items-center justify-between w-full max-w-md mb-3 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-blue-100 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[13px] material-symbols-filled">fact_check</span>
          </div>
          <span className="font-bold text-[#0B1C30]">EduAttend</span>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-semibold">Play Store PWA</span>
        </div>

        <div className="flex items-center gap-1.5">
          {(!isInstalled && (isInstallable || isIOS)) && (
            <button
              onClick={handleInstallApp}
              className="px-2 py-0.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-[11px] flex items-center gap-1 border border-emerald-200"
            >
              <span className="material-symbols-outlined text-[14px]">download</span>
              Install
            </button>
          )}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              isPhoneFrame ? 'bg-[#2563EB] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isPhoneFrame ? 'Mobile Frame' : 'Full Canvas'}
          </button>
        </div>
      </header>

      {/* Main Mobile App Frame */}
      <div
        className={`w-full bg-[#F8F9FF] min-h-[100dvh] sm:min-h-0 relative flex flex-col transition-all overflow-x-hidden ${
          isPhoneFrame
            ? 'sm:max-w-[430px] sm:min-h-[890px] sm:rounded-[44px] sm:shadow-[0_25px_70px_rgba(11,28,48,0.2)] sm:border-[8px] sm:border-[#1E293B] sm:ring-1 sm:ring-black/10'
            : 'sm:max-w-xl sm:rounded-3xl sm:shadow-lg sm:border sm:border-slate-200'
        }`}
      >
        {/* iOS Dynamic Island / Speaker Notch ONLY in Mockup Mode on desktop */}
        {isPhoneFrame && (
          <div className="hidden sm:flex justify-center pt-2 w-full z-50">
            <div className="w-28 h-5 bg-[#1E293B] rounded-full flex items-center justify-between px-3">
              <div className="w-2 h-2 rounded-full bg-black/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-blue-950/80 border border-slate-700" />
            </div>
          </div>
        )}

        {/* Top Status Bar: only in desktop preview frame; on native mobile, phone's native bar handles it */}
        <div className="pt-safe sticky top-0 z-40 bg-[#F8F9FF]/95 backdrop-blur-md">
          {isPhoneFrame && (
            <div className="hidden sm:block">
              <StatusBar time="9:41" />
            </div>
          )}
        </div>

        {/* Main Scrollable View Area */}
        <main className="flex-1 px-3.5 sm:px-4 pt-1 pb-20 overflow-y-auto overscroll-contain">
          {currentView === 'dashboard' && (
            <DashboardView
              teacher={teacher}
              classes={classes}
              totalStudents={totalStudentsCount}
              overallAttendanceRate={overallAttendanceRate}
              onSelectClass={handleSelectClass}
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
              onBack={() => {
                setCurrentView('dashboard');
                setCurrentTab('dashboard');
              }}
              onSelectStudent={handleSelectStudent}
              onSelectClass={handleSelectClass}
              onShareReport={() => setIsShareModalOpen(true)}
              onDownloadReport={(report) => {
                showToast(`Downloading ${report.title} (${report.format})...`);
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
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#0B1C30]/90 text-white text-xs font-semibold py-2 px-4 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
                  <span>Launch <strong className="text-[#0B1C30]">EduAttend</strong> directly as a full-screen app.</span>
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
      </div>
    </div>
  );
}
