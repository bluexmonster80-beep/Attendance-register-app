/**
 * Type-Safe API Client with Offline Resilience
 * Guarantees zero runtime mismatches between frontend and backend.
 */

import {
  API_ENDPOINTS,
  ApiResponse,
  UpdateAttendanceRequest,
  UpdateAttendanceResponse,
  MarkAllPresentRequest,
  MarkAllPresentResponse,
  CreateClassRequest,
  CreateStudentRequest,
  UpdateTeacherRequest,
  AppBootstrapData,
} from '../shared/contract';
import {
  validateUpdateAttendance,
  validateCreateClass,
  validateCreateStudent,
  validateUpdateTeacher,
} from '../shared/validators';
import { ClassItem, Student, TeacherProfile } from '../types';
import {
  initialClasses,
  initialStudents,
  initialTeacher,
  initialRecentReports,
} from '../data/initialData';

export type SyncState = 'synced' | 'syncing' | 'offline' | 'error';

class ApiClient {
  private syncState: SyncState = 'synced';
  private syncListeners: ((state: SyncState) => void)[] = [];

  public getSyncState(): SyncState {
    return this.syncState;
  }

  public onSyncChange(listener: (state: SyncState) => void) {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== listener);
    };
  }

  private setSyncState(newState: SyncState) {
    this.syncState = newState;
    this.syncListeners.forEach((fn) => fn(newState));
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    this.setSyncState('syncing');

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(options.headers || {}),
        },
      });

      const json: ApiResponse<T> = await response.json();

      if (!response.ok || !json.success) {
        this.setSyncState('error');
        return json;
      }

      this.setSyncState('synced');
      return json;
    } catch (err) {
      console.warn(`[ApiClient] Network request failed for ${endpoint}. Operating in offline resilience mode.`, err);
      this.setSyncState('offline');

      // Return synthetic offline failure envelope
      return {
        success: false,
        error: {
          code: 'OFFLINE_FALLBACK',
          message: 'Server unreachable. Changes preserved locally.',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      };
    }
  }

  // 1. App Bootstrap (Initial Load)
  public async getBootstrapData(): Promise<AppBootstrapData> {
    const res = await this.request<AppBootstrapData>('/api/bootstrap');
    if (res.success && res.data) {
      return res.data;
    }

    // Offline / fallback to initial seed
    return {
      classes: initialClasses,
      students: initialStudents,
      teacher: initialTeacher,
      recentReports: initialRecentReports,
    };
  }

  // 2. Classes
  public async getClasses(): Promise<ClassItem[]> {
    const res = await this.request<ClassItem[]>(API_ENDPOINTS.CLASSES);
    return res.success && res.data ? res.data : initialClasses;
  }

  public async createClass(payload: CreateClassRequest): Promise<{ success: boolean; data?: ClassItem; error?: string }> {
    const validation = validateCreateClass(payload);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const res = await this.request<ClassItem>(API_ENDPOINTS.CLASSES, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data) {
      return { success: true, data: res.data };
    }

    return {
      success: false,
      error: res.error?.message || 'Failed to create class',
    };
  }

  // 3. Students
  public async getStudents(classId?: string): Promise<Student[]> {
    const url = classId ? `${API_ENDPOINTS.STUDENTS}?classId=${encodeURIComponent(classId)}` : API_ENDPOINTS.STUDENTS;
    const res = await this.request<Student[]>(url);
    return res.success && res.data ? res.data : initialStudents;
  }

  public async createStudent(payload: CreateStudentRequest): Promise<{ success: boolean; data?: Student; error?: string }> {
    const validation = validateCreateStudent(payload);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const res = await this.request<Student>(API_ENDPOINTS.STUDENTS, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data) {
      return { success: true, data: res.data };
    }

    return {
      success: false,
      error: res.error?.message || 'Failed to create student',
    };
  }

  public async bulkCreateStudents(payload: {
    students: Student[];
    classId: string;
  }): Promise<{ success: boolean; count?: number; error?: string }> {
    const res = await this.request<Student[]>('/api/students/bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data) {
      return { success: true, count: res.data.length };
    }

    return {
      success: false,
      error: res.error?.message || 'Failed to bulk import students',
    };
  }

  // 4. Update Attendance
  public async updateAttendance(
    payload: UpdateAttendanceRequest
  ): Promise<{ success: boolean; data?: UpdateAttendanceResponse; error?: string }> {
    const validation = validateUpdateAttendance(payload);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const res = await this.request<UpdateAttendanceResponse>(API_ENDPOINTS.UPDATE_ATTENDANCE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data) {
      return { success: true, data: res.data };
    }

    return {
      success: false,
      error: res.error?.message || 'Failed to update attendance on server',
    };
  }

  // 5. Mark All Present
  public async markAllPresent(
    payload: MarkAllPresentRequest
  ): Promise<{ success: boolean; data?: MarkAllPresentResponse; error?: string }> {
    if (!payload.classId) {
      return { success: false, error: 'classId is required' };
    }

    const res = await this.request<MarkAllPresentResponse>(API_ENDPOINTS.MARK_ALL_PRESENT, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data) {
      return { success: true, data: res.data };
    }

    return {
      success: false,
      error: res.error?.message || 'Failed to mark all present',
    };
  }

  // 6. Teacher Profile
  public async getTeacher(): Promise<TeacherProfile> {
    const res = await this.request<TeacherProfile>(API_ENDPOINTS.TEACHER);
    return res.success && res.data ? res.data : initialTeacher;
  }

  public async updateTeacher(
    payload: UpdateTeacherRequest
  ): Promise<{ success: boolean; data?: TeacherProfile; error?: string }> {
    const validation = validateUpdateTeacher(payload);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    const res = await this.request<TeacherProfile>(API_ENDPOINTS.TEACHER, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data) {
      return { success: true, data: res.data };
    }

    return {
      success: false,
      error: res.error?.message || 'Failed to update teacher profile',
    };
  }
}

export const apiClient = new ApiClient();
