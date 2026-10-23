/**
 * Full-Stack Express Server with Vite Middleware
 * Implements type-safe API routes adhering to src/shared/contract.ts
 */

import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import {
  API_VERSION,
  API_ENDPOINTS,
  ApiResponse,
  HealthCheckResponse,
  AppBootstrapData,
} from './src/shared/contract';
import {
  validateUpdateAttendance,
  validateCreateClass,
  validateCreateStudent,
  validateUpdateTeacher,
} from './src/shared/validators';
import {
  initialClasses,
  initialStudents,
  initialTeacher,
  initialRecentReports,
} from './src/data/initialData';
import { AttendanceStatus, ClassItem, Student, TeacherProfile } from './src/types';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// In-memory data store seeded with initial demo data
let classesStore: ClassItem[] = [...initialClasses];
let studentsStore: Student[] = [...initialStudents];
let teacherStore: TeacherProfile = { ...initialTeacher };
const reportsStore = [...initialRecentReports];

const app = express();
app.use(express.json());

// Helper function to build uniform ApiResponse envelopes
function makeResponse<T>(data?: T, error?: { code: string; message: string; details?: string[] }): ApiResponse<T> {
  return {
    success: !error,
    data,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      version: API_VERSION,
    },
  };
}

// Global API Request Logger
app.use('/api', (req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] [API] ${req.method} ${req.originalUrl}`);
  next();
});

// 1. Health & Status
app.get(API_ENDPOINTS.HEALTH, (_req: Request, res: Response) => {
  const healthData: HealthCheckResponse = {
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    apiVersion: API_VERSION,
  };
  res.json(makeResponse(healthData));
});

// 2. Full Bootstrap Data (for initial frontend hydration)
app.get('/api/bootstrap', (_req: Request, res: Response) => {
  const bootstrap: AppBootstrapData = {
    classes: classesStore,
    students: studentsStore,
    teacher: teacherStore,
    recentReports: reportsStore,
  };
  res.json(makeResponse(bootstrap));
});

// 3. Classes API
app.get(API_ENDPOINTS.CLASSES, (_req: Request, res: Response) => {
  res.json(makeResponse(classesStore));
});

app.post(API_ENDPOINTS.CLASSES, (req: Request, res: Response) => {
  const validation = validateCreateClass(req.body);
  if (!validation.isValid) {
    res.status(400).json(
      makeResponse(undefined, {
        code: 'VALIDATION_ERROR',
        message: 'Invalid class payload provided',
        details: validation.errors,
      })
    );
    return;
  }

  const payload = validation.data!;
  const newClass: ClassItem = {
    id: `class-${Date.now()}`,
    name: payload.name,
    grade: payload.grade,
    section: payload.section || 'A',
    academicYear: payload.academicYear || '2025 - 2026',
    teacherName: payload.teacherName || teacherStore.name,
    subjects: payload.subjects,
    studentCount: payload.studentCount || 0,
    todayAttendance: {
      present: 0,
      total: payload.studentCount || 0,
      percentage: 0,
    },
    schedule: payload.schedule || {
      days: 'Monday - Friday',
      startTime: '08:00 AM',
      endTime: '09:00 AM',
    },
    categoryIcon: payload.categoryIcon || 'school',
    badgeColor: payload.badgeColor || 'bg-blue-100 text-blue-700',
  };

  classesStore = [newClass, ...classesStore];
  res.status(201).json(makeResponse(newClass));
});

// 4. Students API
app.get(API_ENDPOINTS.STUDENTS, (req: Request, res: Response) => {
  const { classId } = req.query;
  if (typeof classId === 'string' && classId) {
    const filtered = studentsStore.filter((s) => s.classId === classId);
    res.json(makeResponse(filtered));
    return;
  }
  res.json(makeResponse(studentsStore));
});

app.post(API_ENDPOINTS.STUDENTS, (req: Request, res: Response) => {
  const validation = validateCreateStudent(req.body);
  if (!validation.isValid) {
    res.status(400).json(
      makeResponse(undefined, {
        code: 'VALIDATION_ERROR',
        message: 'Invalid student payload provided',
        details: validation.errors,
      })
    );
    return;
  }

  const payload = validation.data!;
  const newStudent: Student = {
    id: `student-${Date.now()}`,
    name: payload.name,
    rollNo: payload.rollNo,
    classId: payload.classId,
    className: payload.className,
    avatarUrl: payload.avatarUrl || '',
    status: payload.status || 'P',
    statusText: payload.status === 'P' ? 'Present today' : payload.status === 'A' ? 'Absent today' : payload.status === 'L' ? 'Late today' : 'Not marked',
    contact: payload.contact,
    attendanceStats: {
      present: 20,
      absent: 0,
      late: 0,
      totalDays: 20,
      overallPercentage: 100,
      streakDays: 5,
    },
    performance: {
      averageScore: 85,
      classRank: 5,
      totalInClass: 30,
      position: 'Top 20%',
      behavior: 'Excellent',
      remarks: 'Newly Enrolled Student',
    },
    subjectScores: [
      { name: 'Mathematics', score: 85, maxScore: 100, icon: 'functions' },
      { name: 'Physics', score: 80, maxScore: 100, icon: 'science' },
      { name: 'English', score: 90, maxScore: 100, icon: 'menu_book' },
    ],
    notes: payload.notes || '',
  };

  studentsStore = [newStudent, ...studentsStore];

  // Update target class student count
  classesStore = classesStore.map((c) =>
    c.id === payload.classId
      ? {
          ...c,
          studentCount: c.studentCount + 1,
          todayAttendance: {
            ...c.todayAttendance,
            total: c.todayAttendance.total + 1,
          },
        }
      : c
  );

  res.status(201).json(makeResponse(newStudent));
});

app.post('/api/students/bulk', (req: Request, res: Response) => {
  const { students: incomingStudents, classId } = req.body;
  if (!Array.isArray(incomingStudents) || incomingStudents.length === 0) {
    res.status(400).json(
      makeResponse(undefined, {
        code: 'VALIDATION_ERROR',
        message: 'Valid array of students is required',
      })
    );
    return;
  }

  studentsStore = [...incomingStudents, ...studentsStore];

  if (classId) {
    const presentAdded = incomingStudents.filter((s: Student) => s.status === 'P').length;
    classesStore = classesStore.map((c) =>
      c.id === classId
        ? {
            ...c,
            studentCount: c.studentCount + incomingStudents.length,
            todayAttendance: {
              ...c.todayAttendance,
              total: c.todayAttendance.total + incomingStudents.length,
              present: c.todayAttendance.present + presentAdded,
              percentage: Math.round(
                ((c.todayAttendance.present + presentAdded) / (c.todayAttendance.total + incomingStudents.length)) * 100
              ),
            },
          }
        : c
    );
  }

  res.status(201).json(makeResponse(incomingStudents));
});

// 5. Update Student Attendance Status
app.post(API_ENDPOINTS.UPDATE_ATTENDANCE, (req: Request, res: Response) => {
  const validation = validateUpdateAttendance(req.body);
  if (!validation.isValid) {
    res.status(400).json(
      makeResponse(undefined, {
        code: 'VALIDATION_ERROR',
        message: 'Invalid attendance update payload',
        details: validation.errors,
      })
    );
    return;
  }

  const { studentId, classId, status } = validation.data!;
  const studentIndex = studentsStore.findIndex((s) => s.id === studentId);

  if (studentIndex === -1) {
    res.status(404).json(
      makeResponse(undefined, {
        code: 'STUDENT_NOT_FOUND',
        message: `Student with id '${studentId}' was not found.`,
      })
    );
    return;
  }

  const statusTextMap: Record<AttendanceStatus, string> = {
    P: 'Present today',
    A: 'Absent today',
    L: 'Late today',
    U: 'Not marked',
  };

  studentsStore[studentIndex] = {
    ...studentsStore[studentIndex],
    status,
    statusText: statusTextMap[status],
  };

  // Recompute class today attendance metrics on the backend
  const targetClass = classesStore.find((c) => c.id === classId);
  if (targetClass) {
    const classStudents = studentsStore.filter((s) => s.classId === classId);
    const presentCount = classStudents.filter((s) => s.status === 'P').length;
    const totalCount = targetClass.studentCount || classStudents.length || 1;
    const percentage = Math.round((presentCount / totalCount) * 100);

    const updatedClass: ClassItem = {
      ...targetClass,
      todayAttendance: {
        present: presentCount,
        total: totalCount,
        percentage,
      },
    };

    classesStore = classesStore.map((c) => (c.id === classId ? updatedClass : c));

    res.json(
      makeResponse({
        student: studentsStore[studentIndex],
        updatedClass,
      })
    );
    return;
  }

  res.json(
    makeResponse({
      student: studentsStore[studentIndex],
      updatedClass: classesStore[0],
    })
  );
});

// 6. Mark All Present
app.post([API_ENDPOINTS.MARK_ALL_PRESENT, '/api/attendance/mark-all-present'], (req: Request, res: Response) => {
  const { classId } = req.body;
  if (typeof classId !== 'string' || !classId) {
    res.status(400).json(
      makeResponse(undefined, {
        code: 'VALIDATION_ERROR',
        message: 'classId is required',
      })
    );
    return;
  }

  studentsStore = studentsStore.map((s) =>
    s.classId === classId || !s.classId
      ? {
          ...s,
          status: 'P',
          statusText: 'Present today',
        }
      : s
  );

  const targetClass = classesStore.find((c) => c.id === classId);
  const updatedClass: ClassItem = targetClass
    ? {
        ...targetClass,
        todayAttendance: {
          present: targetClass.studentCount,
          total: targetClass.studentCount,
          percentage: 100,
        },
      }
    : classesStore[0];

  if (targetClass) {
    classesStore = classesStore.map((c) => (c.id === classId ? updatedClass : c));
  }

  const updatedStudents = studentsStore.filter((s) => s.classId === classId);
  res.json(makeResponse({ updatedStudents, updatedClass }));
});

// 7. Teacher Profile API
app.get(API_ENDPOINTS.TEACHER, (_req: Request, res: Response) => {
  res.json(makeResponse(teacherStore));
});

app.put(API_ENDPOINTS.TEACHER, (req: Request, res: Response) => {
  const validation = validateUpdateTeacher(req.body);
  if (!validation.isValid) {
    res.status(400).json(
      makeResponse(undefined, {
        code: 'VALIDATION_ERROR',
        message: 'Invalid teacher update payload',
        details: validation.errors,
      })
    );
    return;
  }

  teacherStore = {
    ...teacherStore,
    ...validation.data!,
  };

  res.json(makeResponse(teacherStore));
});

// 8. Reports API
app.get(API_ENDPOINTS.REPORTS, (_req: Request, res: Response) => {
  res.json(makeResponse(reportsStore));
});

// Unknown API routes return structured JSON (never HTML)
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json(
    makeResponse(undefined, {
      code: 'NOT_FOUND',
      message: 'The requested API endpoint does not exist',
    })
  );
});

// Server bootstrap with Vite
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduAttend Full-Stack server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
