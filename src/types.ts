export type AttendanceStatus = 'P' | 'A' | 'L' | 'U'; // Present, Absent, Late, Unmarked

export interface SubjectItem {
  name: string;
  color: string; // dot or pill color
}

export interface ClassItem {
  id: string;
  name: string; // e.g. "Class 10 - A"
  grade: string; // e.g. "10"
  section: string; // e.g. "A"
  academicYear: string; // e.g. "2025 - 2026"
  teacherName: string; // e.g. "Muhammad Asif"
  subjects: SubjectItem[];
  studentCount: number;
  todayAttendance: {
    present: number;
    total: number;
    percentage: number;
  };
  schedule: {
    days: string; // "Monday - Friday"
    startTime: string; // "08:00 AM"
    endTime: string; // "09:00 AM"
  };
  categoryIcon?: string; // Material icon name
  badgeColor?: string; // background color class for icon
}

export interface SubjectScore {
  name: string;
  score: number | null; // null if pending (e.g. "--")
  maxScore: number;
  icon: string;
  colorClass?: string;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  classId: string;
  className: string;
  avatarUrl: string;
  status: AttendanceStatus;
  statusText?: string;
  contact: {
    fatherName: string;
    studentPhone: string;
    fatherPhone: string;
    address: string;
  };
  attendanceStats: {
    present: number;
    absent: number;
    late: number;
    totalDays: number;
    overallPercentage: number;
    streakDays: number;
  };
  performance: {
    averageScore: number;
    classRank: number;
    totalInClass: number;
    position: string; // e.g. "Top 15%"
    behavior: string; // "Excellent"
    remarks: string; // "Good Progress"
  };
  subjectScores: SubjectScore[];
  notes: string;
  reminder?: string;
  admissionDate?: string;
}

export interface RecentReport {
  id: string;
  title: string;
  date: string;
  format: 'PDF' | 'Excel';
  fileSize: string;
}

export interface TeacherProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  schoolName: string;
  avatarUrl: string;
}
