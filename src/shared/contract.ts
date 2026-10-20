/**
 * Shared API Contract & Data Transfer Objects (DTOs)
 * Single Source of Truth to prevent frontend-backend mismatches.
 */

import { AttendanceStatus, ClassItem, Student, TeacherProfile, RecentReport } from '../types';

export const API_VERSION = '1.0.0';

export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  CLASSES: '/api/classes',
  CLASS_BY_ID: (id: string) => `/api/classes/${id}`,
  STUDENTS: '/api/students',
  STUDENT_BY_ID: (id: string) => `/api/students/${id}`,
  UPDATE_ATTENDANCE: '/api/attendance/update',
  MARK_ALL_PRESENT: '/api/attendance/mark-all',
  TEACHER: '/api/teacher',
  REPORTS: '/api/reports',
} as const;

/**
 * Standard API Response Envelope
 * Every endpoint returns this structure to guarantee consistency.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
  meta: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

/**
 * Request & Response DTOs
 */
export interface UpdateAttendanceRequest {
  studentId: string;
  classId: string;
  status: AttendanceStatus;
  date?: string;
}

export interface UpdateAttendanceResponse {
  student: Student;
  updatedClass: ClassItem;
}

export interface MarkAllPresentRequest {
  classId: string;
  date?: string;
}

export interface MarkAllPresentResponse {
  updatedStudents: Student[];
  updatedClass: ClassItem;
}

export interface CreateClassRequest {
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  teacherName: string;
  subjects: Array<{ name: string; color: string }>;
  studentCount?: number;
  schedule?: {
    days: string;
    startTime: string;
    endTime: string;
  };
  categoryIcon?: string;
  badgeColor?: string;
}

export interface CreateStudentRequest {
  name: string;
  rollNo: string;
  classId: string;
  className: string;
  avatarUrl?: string;
  status?: AttendanceStatus;
  contact: {
    fatherName: string;
    studentPhone: string;
    fatherPhone: string;
    address: string;
  };
  notes?: string;
}

export interface UpdateTeacherRequest {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  schoolName?: string;
  avatarUrl?: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  uptimeSeconds: number;
  environment: string;
  apiVersion: string;
}

export interface AppBootstrapData {
  classes: ClassItem[];
  students: Student[];
  teacher: TeacherProfile;
  recentReports: RecentReport[];
}
