// @ts-ignore - Vercel types optional
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  AppError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  toAppError,
} from '../src/utils/AppError.js';
import { rateLimiter } from '../src/services/rateLimiter.js';
import { hasPermission, enforcePermission } from '../src/services/rbac.js';
import { logError } from '../src/utils/errorHandler.js';
import { corsMiddleware } from '../src/utils/cors.js';
import { db } from '../src/services/firebaseClient.js';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import type { Student } from '../src/types/student.js';
import type { UserRole } from '../src/services/rbac.js';

// ============================================================
// ZOD VALIDATION SCHEMAS
// ============================================================

import { z } from 'zod';

const StudentCreateSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(100, 'İsim çok uzun'),
  age: z.number().int().min(4, 'Yaş en az 4 olmalı').max(18, 'Yaş en fazla 18 olmalı'),
  grade: z.string().min(1, 'Sınıf gereklidir').max(20),
  avatar: z.string().default(''),
  diagnosis: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  learningStyle: z.enum(['Görsel', 'İşitsel', 'Kinestetik', 'Karma']).default('Karma'),
  parentName: z.string().max(100).optional(),
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email('Geçerli email adresi giriniz').optional().or(z.literal('')),
  notes: z.string().max(5000).optional(),
});

const StudentUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  age: z.number().int().min(4).max(18).optional(),
  grade: z.string().min(1).max(20).optional(),
  avatar: z.string().optional(),
  diagnosis: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  learningStyle: z.enum(['Görsel', 'İşitsel', 'Kinestetik', 'Karma']).optional(),
  parentName: z.string().max(100).optional(),
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  notes: z.string().max(5000).optional(),
});

type StudentCreateInput = z.infer<typeof StudentCreateSchema>;
type StudentUpdateInput = z.infer<typeof StudentUpdateSchema>;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Extract user from request headers (Firebase Auth token)
 * In production, this would validate JWT token
 */
const getUserFromRequest = (req: VercelRequest): { userId: string; role: UserRole } => {
  const userId = req.headers['x-user-id'] as string;
  const role = (req.headers['x-user-role'] as UserRole) || 'teacher';

  if (!userId) {
    throw new ValidationError('Kullanıcı kimliği gereklidir', { userId: 'Missing x-user-id header' });
  }

  return { userId, role };
};

/**
 * Sanitize student data before storing in Firestore
 */
const sanitizeStudent = (data: StudentCreateInput | StudentUpdateInput): Partial<Student> => {
  return {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.age !== undefined && { age: data.age }),
    ...(data.grade !== undefined && { grade: data.grade }),
    ...(data.avatar !== undefined && { avatar: data.avatar }),
    ...(data.diagnosis !== undefined && { diagnosis: data.diagnosis }),
    ...(data.interests !== undefined && { interests: data.interests }),
    ...(data.strengths !== undefined && { strengths: data.strengths }),
    ...(data.weaknesses !== undefined && { weaknesses: data.weaknesses }),
    ...(data.learningStyle !== undefined && { learningStyle: data.learningStyle }),
    ...(data.parentName !== undefined && { parentName: data.parentName }),
    ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone }),
    ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail }),
    ...(data.notes !== undefined && { notes: data.notes }),
  };
};

/**
 * Check if user owns the student (for RBAC)
 */
const checkStudentOwnership = async (
  studentId: string,
  userId: string,
  role: UserRole
): Promise<void> => {
  // Admins can access all students
  if (role === 'admin') return;

  const studentDoc = await getDoc(doc(db, 'students', studentId));

  if (!studentDoc.exists()) {
    throw new ValidationError('Öğrenci bulunamadı', { studentId: 'Not found' });
  }

  const studentData = studentDoc.data();

  if (studentData.teacherId !== userId) {
    throw new AppError(
      'Bu öğrenciye erişim yetkiniz yok',
      'FORBIDDEN',
      403,
      { studentId, userId }
    );
  }
};

// ============================================================
// ROUTE HANDLERS
// ============================================================

/**
 * GET /api/students - List students for current teacher
 */
const handleGetStudents = async (req: VercelRequest, res: VercelResponse) => {
  const { userId, role } = getUserFromRequest(req);

  // Rate limiting
  const tier = role === 'admin' ? 'admin' : 'free';
  await rateLimiter.enforceLimit(userId, tier, 'apiQuery', 1);

  // RBAC: Teachers and admins can read students
  enforcePermission(role, 'read:worksheet', 'student list');

  // Fetch students
  const studentsQuery = query(
    collection(db, 'students'),
    where('teacherId', '==', userId)
  );

  const snapshot = await getDocs(studentsQuery);
  const students: Student[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    students.push({
      id: doc.id,
      teacherId: data.teacherId || '',
      name: data.name || 'İsimsiz Öğrenci',
      age: data.age || 0,
      grade: data.grade || '',
      avatar: data.avatar || '',
      diagnosis: data.diagnosis || [],
      interests: data.interests || [],
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      learningStyle: data.learningStyle || 'Karma',
      parentName: data.parentName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      notes: data.notes,
      notesHistory: data.notesHistory,
      createdAt: data.createdAt || new Date().toISOString(),
    });
  });

  return res.status(200).json({
    success: true,
    data: students,
    timestamp: new Date().toISOString(),
  });
};

/**
 * POST /api/students - Create new student
 */
const handleCreateStudent = async (req: VercelRequest, res: VercelResponse) => {
  const { userId, role } = getUserFromRequest(req);

  // Rate limiting
  const tier = role === 'admin' ? 'admin' : 'free';
  await rateLimiter.enforceLimit(userId, tier, 'apiGeneration', 1);

  // RBAC: Teachers and admins can create students
  enforcePermission(role, 'create:worksheet', 'student create');

  // Validate input
  const validationResult = StudentCreateSchema.safeParse(req.body);

  if (!validationResult.success) {
    const errors: Record<string, string> = {};
    validationResult.error.issues.forEach((err) => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });
    throw new ValidationError('Geçersiz öğrenci verisi', errors);
  }

  const studentData = validationResult.data;
  const sanitized = sanitizeStudent(studentData);

  // Create student in Firestore
  const docRef = await addDoc(collection(db, 'students'), {
    ...sanitized,
    teacherId: userId,
    createdAt: new Date().toISOString(),
    notesHistory: '[]',
  });

  // Audit log
  logError(
    new AppError('Audit: öğrenci oluşturuldu', 'AUDIT', 200),
    { action: 'student_created', userId, studentId: docRef.id, timestamp: new Date().toISOString() }
  );

  return res.status(201).json({
    success: true,
    data: {
      id: docRef.id,
      ...sanitized,
      teacherId: userId,
      createdAt: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * PUT /api/students/:id - Update student
 */
const handleUpdateStudent = async (req: VercelRequest, res: VercelResponse) => {
  const { userId, role } = getUserFromRequest(req);
  const studentId = req.query.id as string;

  if (!studentId) {
    throw new ValidationError('Öğrenci ID gereklidir', { id: 'Missing student ID' });
  }

  // Rate limiting
  const tier = role === 'admin' ? 'admin' : 'free';
  await rateLimiter.enforceLimit(userId, tier, 'apiGeneration', 1);

  // RBAC: Check ownership
  await checkStudentOwnership(studentId, userId, role);
  enforcePermission(role, 'update:worksheet', 'student update');

  // Validate input
  const validationResult = StudentUpdateSchema.safeParse(req.body);

  if (!validationResult.success) {
    const errors: Record<string, string> = {};
    validationResult.error.issues.forEach((err) => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });
    throw new ValidationError('Geçersiz güncelleme verisi', errors);
  }

  const updates = validationResult.data;
  const sanitized = sanitizeStudent(updates);

  // Update in Firestore
  await updateDoc(doc(db, 'students', studentId), sanitized);

  // Audit log
  logError(
    new AppError('Audit: öğrenci güncellendi', 'AUDIT', 200),
    { action: 'student_updated', userId, studentId, changes: Object.keys(sanitized), timestamp: new Date().toISOString() }
  );

  return res.status(200).json({
    success: true,
    data: {
      id: studentId,
      ...sanitized,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * DELETE /api/students/:id - Delete student
 */
const handleDeleteStudent = async (req: VercelRequest, res: VercelResponse) => {
  const { userId, role } = getUserFromRequest(req);
  const studentId = req.query.id as string;

  if (!studentId) {
    throw new ValidationError('Öğrenci ID gereklidir', { id: 'Missing student ID' });
  }

  // Rate limiting
  const tier = role === 'admin' ? 'admin' : 'free';
  await rateLimiter.enforceLimit(userId, tier, 'apiGeneration', 1);

  // RBAC: Check ownership
  await checkStudentOwnership(studentId, userId, role);
  enforcePermission(role, 'delete:worksheet', 'student delete');

  // Delete from Firestore
  await deleteDoc(doc(db, 'students', studentId));

  // Audit log
  logError(
    new AppError('Audit: öğrenci silindi', 'AUDIT', 200),
    { action: 'student_deleted', userId, studentId, timestamp: new Date().toISOString() }
  );

  return res.status(200).json({
    success: true,
    data: { id: studentId, deleted: true },
    timestamp: new Date().toISOString(),
  });
};

// ============================================================
// MAIN HANDLER
// ============================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  await corsMiddleware(req, res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Route to appropriate handler
    if (req.method === 'GET') {
      return await handleGetStudents(req, res);
    } else if (req.method === 'POST') {
      return await handleCreateStudent(req, res);
    } else if (req.method === 'PUT') {
      return await handleUpdateStudent(req, res);
    } else if (req.method === 'DELETE') {
      return await handleDeleteStudent(req, res);
    } else {
      return res.status(405).json({
        success: false,
        error: {
          message: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED',
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: unknown) {
    const appError = toAppError(error);

    // Log error
    logError(appError);

    // Return error response
    return res.status(appError.httpStatus).json({
      success: false,
      error: {
        message: appError.userMessage,
        code: appError.code,
        ...(process.env.NODE_ENV === 'development' && { details: appError.details }),
      },
      timestamp: new Date().toISOString(),
    });
  }
}
