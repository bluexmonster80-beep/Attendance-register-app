/**
 * Runtime Validators to prevent frontend-backend data mismatches
 */

import { AttendanceStatus } from '../types';
import {
  UpdateAttendanceRequest,
  CreateClassRequest,
  CreateStudentRequest,
  UpdateTeacherRequest,
} from './contract';

export interface ValidationResult<T> {
  isValid: boolean;
  errors: string[];
  data?: T;
}

export function isValidAttendanceStatus(val: unknown): val is AttendanceStatus {
  return typeof val === 'string' && ['P', 'A', 'L', 'U'].includes(val);
}

export function validateUpdateAttendance(payload: unknown): ValidationResult<UpdateAttendanceRequest> {
  const errors: string[] = [];
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, errors: ['Request body must be an object'] };
  }

  const p = payload as Record<string, unknown>;

  if (typeof p.studentId !== 'string' || !p.studentId.trim()) {
    errors.push('studentId is required and must be a non-empty string');
  }

  if (typeof p.classId !== 'string' || !p.classId.trim()) {
    errors.push('classId is required and must be a non-empty string');
  }

  if (!isValidAttendanceStatus(p.status)) {
    errors.push(`status must be one of: 'P' (Present), 'A' (Absent), 'L' (Late), 'U' (Unmarked). Received: ${String(p.status)}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? (payload as UpdateAttendanceRequest) : undefined,
  };
}

export function validateCreateClass(payload: unknown): ValidationResult<CreateClassRequest> {
  const errors: string[] = [];
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, errors: ['Request body must be an object'] };
  }

  const p = payload as Record<string, unknown>;

  if (typeof p.name !== 'string' || !p.name.trim()) {
    errors.push('Class name is required');
  }

  if (typeof p.grade !== 'string' || !p.grade.trim()) {
    errors.push('Grade is required');
  }

  if (!Array.isArray(p.subjects) || p.subjects.length === 0) {
    errors.push('At least one subject is required');
  } else {
    for (let i = 0; i < p.subjects.length; i++) {
      const subj = p.subjects[i];
      if (!subj || typeof subj !== 'object' || typeof subj.name !== 'string' || !subj.name.trim()) {
        errors.push(`Subject at index ${i} must have a valid name`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? (payload as CreateClassRequest) : undefined,
  };
}

export function validateCreateStudent(payload: unknown): ValidationResult<CreateStudentRequest> {
  const errors: string[] = [];
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, errors: ['Request body must be an object'] };
  }

  const p = payload as Record<string, unknown>;

  if (typeof p.name !== 'string' || !p.name.trim()) {
    errors.push('Student name is required');
  }

  if (typeof p.rollNo !== 'string' || !p.rollNo.trim()) {
    errors.push('Roll number is required');
  }

  if (typeof p.classId !== 'string' || !p.classId.trim()) {
    errors.push('classId is required');
  }

  if (!p.contact || typeof p.contact !== 'object') {
    errors.push('contact information is required');
  }

  if (p.status !== undefined && !isValidAttendanceStatus(p.status)) {
    errors.push(`Invalid attendance status: ${String(p.status)}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? (payload as CreateStudentRequest) : undefined,
  };
}

export function validateUpdateTeacher(payload: unknown): ValidationResult<UpdateTeacherRequest> {
  const errors: string[] = [];
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, errors: ['Request body must be an object'] };
  }

  const p = payload as Record<string, unknown>;

  if (p.email !== undefined && typeof p.email === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(p.email)) {
      errors.push('Invalid email format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? (payload as UpdateTeacherRequest) : undefined,
  };
}
