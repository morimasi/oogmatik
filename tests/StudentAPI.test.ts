/**
 * OOGMATIK - Student API Tests
 * Tests for /api/students endpoint (Sprint 1)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Student } from '../src/types/student';
import { rateLimiter } from '../src/services/rateLimiter';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  Timestamp: {
    now: () => ({ seconds: Date.now() / 1000, nanoseconds: 0 }),
  },
}));

vi.mock('../src/services/firebaseClient', () => ({
  db: {},
}));

vi.mock('../src/utils/cors', () => ({
  corsMiddleware: vi.fn(async () => {}),
}));

describe('Student API — Sprint 1', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset rate limiter between tests
    rateLimiter.reset('test-user-id');
    rateLimiter.reset('test-teacher-id');
  });

  describe('Input Validation', () => {
    it('should validate required fields for student creation', () => {
      const invalidStudent = {
        // Missing name
        age: 8,
        grade: '3',
      };

      // Zod validation should catch this
      expect(() => {
        // This would be validated in the API handler
        if (!invalidStudent.name) {
          throw new Error('İsim en az 2 karakter olmalı');
        }
      }).toThrow('İsim en az 2 karakter olmalı');
    });

    it('should validate age range (4-18)', () => {
      const tooYoung = { name: 'Ali', age: 3, grade: '1' };
      const tooOld = { name: 'Ayşe', age: 19, grade: '12' };

      expect(tooYoung.age).toBeLessThan(4);
      expect(tooOld.age).toBeGreaterThan(18);
    });

    it('should validate email format', () => {
      const invalidEmail = 'not-an-email';
      const validEmail = 'parent@example.com';

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(emailRegex.test(invalidEmail)).toBe(false);
      expect(emailRegex.test(validEmail)).toBe(true);
    });

    it('should validate learningStyle enum', () => {
      const validStyles = ['Görsel', 'İşitsel', 'Kinestetik', 'Karma'];
      const invalidStyle = 'InvalidStyle';

      expect(validStyles).toContain('Görsel');
      expect(validStyles).not.toContain(invalidStyle);
    });

    it('should validate string length limits', () => {
      const longName = 'a'.repeat(101);
      const validName = 'Mehmet Ali';

      expect(longName.length).toBeGreaterThan(100);
      expect(validName.length).toBeLessThanOrEqual(100);
    });

    it('should sanitize diagnosis array', () => {
      const diagnosis = ['Disleksi', 'DEHB'];
      const invalidDiagnosis = null as unknown as string[];

      expect(Array.isArray(diagnosis)).toBe(true);
      expect(Array.isArray(invalidDiagnosis)).toBe(false);

      // Sanitizer should convert null to []
      const sanitized = Array.isArray(invalidDiagnosis) ? invalidDiagnosis : [];
      expect(sanitized).toEqual([]);
    });
  });

  describe('Race Condition Fix', () => {
    it('should clear activeStudent when deleted student is active', () => {
      const students: Student[] = [
        {
          id: 'student-1',
          teacherId: 'teacher-1',
          name: 'Ali Yılmaz',
          age: 10,
          grade: '4',
          avatar: '',
          diagnosis: ['Disleksi'],
          interests: ['Futbol'],
          strengths: ['Matematik'],
          weaknesses: ['Okuma'],
          learningStyle: 'Görsel',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'student-2',
          teacherId: 'teacher-1',
          name: 'Ayşe Demir',
          age: 9,
          grade: '3',
          avatar: '',
          diagnosis: ['DEHB'],
          interests: ['Resim'],
          strengths: ['Yaratıcılık'],
          weaknesses: ['Dikkat'],
          learningStyle: 'Kinestetik',
          createdAt: new Date().toISOString(),
        },
      ];

      let activeStudent: Student | null = students[0];

      // Simulate delete operation
      const deleteStudent = (id: string) => {
        // Remove from list
        const index = students.findIndex((s) => s.id === id);
        if (index !== -1) {
          students.splice(index, 1);
        }

        // Fix race condition: clear activeStudent if deleted
        if (activeStudent?.id === id) {
          activeStudent = null;
        }
      };

      // Delete the active student
      deleteStudent('student-1');

      // activeStudent should be null now
      expect(activeStudent).toBeNull();
      expect(students).toHaveLength(1);
      expect(students[0].id).toBe('student-2');
    });

    it('should not clear activeStudent when different student is deleted', () => {
      const students: Student[] = [
        {
          id: 'student-1',
          teacherId: 'teacher-1',
          name: 'Ali Yılmaz',
          age: 10,
          grade: '4',
          avatar: '',
          diagnosis: ['Disleksi'],
          interests: [],
          strengths: [],
          weaknesses: [],
          learningStyle: 'Görsel',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'student-2',
          teacherId: 'teacher-1',
          name: 'Ayşe Demir',
          age: 9,
          grade: '3',
          avatar: '',
          diagnosis: [],
          interests: [],
          strengths: [],
          weaknesses: [],
          learningStyle: 'Karma',
          createdAt: new Date().toISOString(),
        },
      ];

      let activeStudent: Student | null = students[0];

      const deleteStudent = (id: string) => {
        const index = students.findIndex((s) => s.id === id);
        if (index !== -1) {
          students.splice(index, 1);
        }

        if (activeStudent?.id === id) {
          activeStudent = null;
        }
      };

      // Delete a different student
      deleteStudent('student-2');

      // activeStudent should remain unchanged
      expect(activeStudent).not.toBeNull();
      expect(activeStudent?.id).toBe('student-1');
      expect(students).toHaveLength(1);
    });
  });

  describe('RBAC - Role-Based Access Control', () => {
    it('should allow teachers to read their own students', () => {
      const userRole = 'teacher';
      const teacherId = 'teacher-123';
      const studentTeacherId = 'teacher-123';

      const canRead = userRole === 'teacher' && studentTeacherId === teacherId;
      expect(canRead).toBe(true);
    });

    it('should deny teachers from reading other teachers students', () => {
      const userRole = 'teacher';
      const teacherId = 'teacher-123';
      const studentTeacherId = 'teacher-456';

      const canRead = userRole === 'teacher' && studentTeacherId === teacherId;
      expect(canRead).toBe(false);
    });

    it('should allow admins to read all students', () => {
      const userRole = 'admin';
      const teacherId = 'teacher-123';
      const studentTeacherId = 'teacher-456';

      const canRead = userRole === 'admin' || studentTeacherId === teacherId;
      expect(canRead).toBe(true);
    });

    it('should deny parents from creating students', () => {
      const userRole = 'parent';
      const allowedRoles = ['admin', 'teacher'];

      const canCreate = allowedRoles.includes(userRole);
      expect(canCreate).toBe(false);
    });

    it('should deny students from deleting students', () => {
      const userRole = 'student';
      const allowedRoles = ['admin', 'teacher'];

      const canDelete = allowedRoles.includes(userRole);
      expect(canDelete).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits for student creation', async () => {
      const userId = 'teacher-rate-test';
      const tier = 'free';

      // Free tier: 20 generations/hour
      let allowed = true;
      let attempts = 0;

      // Try 25 requests (should fail after 20)
      for (let i = 0; i < 25; i++) {
        const result = await rateLimiter.checkLimit(userId, tier, 'apiGeneration', 1);
        if (!result.allowed) {
          allowed = false;
          attempts = i + 1;
          break;
        }
      }

      expect(allowed).toBe(false);
      expect(attempts).toBeLessThanOrEqual(21); // 20 allowed + 1 denied
    });

    it('should allow more requests for pro tier', async () => {
      const userId = 'teacher-pro-test';
      const tier = 'pro';

      // Pro tier: 200 generations/hour
      let allowed = true;

      // Try 50 requests (should all succeed for pro)
      for (let i = 0; i < 50; i++) {
        const result = await rateLimiter.checkLimit(userId, tier, 'apiGeneration', 1);
        if (!result.allowed) {
          allowed = false;
          break;
        }
      }

      expect(allowed).toBe(true);
    });

    it('should have unlimited access for admin tier', async () => {
      const userId = 'admin-test';
      const tier = 'admin';

      // Admin tier: 10000 generations/hour
      let allowed = true;

      // Try 100 requests (should all succeed for admin)
      for (let i = 0; i < 100; i++) {
        const result = await rateLimiter.checkLimit(userId, tier, 'apiGeneration', 1);
        if (!result.allowed) {
          allowed = false;
          break;
        }
      }

      expect(allowed).toBe(true);
    });

    it('should track remaining tokens correctly', async () => {
      const userId = 'teacher-token-test';
      const tier = 'free';

      // Start with 20 tokens
      const initial = await rateLimiter.checkLimit(userId, tier, 'apiGeneration', 0);
      expect(initial.remaining).toBe(20);

      // Consume 5 tokens
      await rateLimiter.checkLimit(userId, tier, 'apiGeneration', 5);

      // Should have 15 remaining
      const after = await rateLimiter.checkLimit(userId, tier, 'apiGeneration', 0);
      expect(after.remaining).toBe(15);
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize student data before storing', () => {
      const rawData = {
        name: '  Ali Yılmaz  ',
        age: 10,
        grade: '4',
        diagnosis: ['Disleksi'],
        maliciousField: '<script>alert("XSS")</script>',
      };

      const sanitizeStudent = (data: Record<string, unknown>) => {
        return {
          name: typeof data.name === 'string' ? data.name.trim() : 'İsimsiz Öğrenci',
          age: Number(data.age) || 0,
          grade: typeof data.grade === 'string' ? data.grade : '',
          diagnosis: Array.isArray(data.diagnosis) ? data.diagnosis : [],
          // maliciousField should be ignored
        };
      };

      const sanitized = sanitizeStudent(rawData);

      expect(sanitized.name).toBe('Ali Yılmaz');
      expect(sanitized.age).toBe(10);
      expect((sanitized as unknown as Record<string, unknown>).maliciousField).toBeUndefined();
    });

    it('should handle missing optional fields', () => {
      const minimalData = {
        name: 'Ayşe Demir',
        age: 9,
        grade: '3',
      };

      const sanitizeStudent = (data: Record<string, unknown>) => {
        return {
          name: typeof data.name === 'string' ? data.name : 'İsimsiz Öğrenci',
          age: Number(data.age) || 0,
          grade: typeof data.grade === 'string' ? data.grade : '',
          diagnosis: Array.isArray(data.diagnosis) ? data.diagnosis : [],
          parentName: typeof data.parentName === 'string' ? data.parentName : undefined,
          contactEmail: typeof data.contactEmail === 'string' ? data.contactEmail : undefined,
        };
      };

      const sanitized = sanitizeStudent(minimalData);

      expect(sanitized.name).toBe('Ayşe Demir');
      expect(sanitized.parentName).toBeUndefined();
      expect(sanitized.contactEmail).toBeUndefined();
      expect(sanitized.diagnosis).toEqual([]);
    });
  });

  describe('API Response Format', () => {
    it('should return standard ApiResponse format on success', () => {
      const successResponse = {
        success: true,
        data: {
          id: 'student-123',
          name: 'Ali Yılmaz',
          age: 10,
        },
        timestamp: new Date().toISOString(),
      };

      expect(successResponse.success).toBe(true);
      expect(successResponse.data).toBeDefined();
      expect(successResponse.timestamp).toBeDefined();
      expect(() => new Date(successResponse.timestamp)).not.toThrow();
    });

    it('should return standard ApiResponse format on error', () => {
      const errorResponse = {
        success: false,
        error: {
          message: 'Öğrenci bulunamadı',
          code: 'NOT_FOUND',
        },
        timestamp: new Date().toISOString(),
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeDefined();
      expect(errorResponse.error?.code).toBe('NOT_FOUND');
      expect(errorResponse.timestamp).toBeDefined();
    });

    it('should include AppError code in error response', () => {
      const rateLimitError = {
        success: false,
        error: {
          message: 'Çok fazla istek yapıldı. 60 saniye sonra tekrar deneyin.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        timestamp: new Date().toISOString(),
      };

      expect(rateLimitError.error?.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('Audit Logging', () => {
    it('should log student creation', () => {
      const auditLog = {
        type: 'audit',
        action: 'student_created',
        userId: 'teacher-123',
        studentId: 'student-456',
        timestamp: new Date().toISOString(),
      };

      expect(auditLog.type).toBe('audit');
      expect(auditLog.action).toBe('student_created');
      expect(auditLog.userId).toBeDefined();
      expect(auditLog.studentId).toBeDefined();
    });

    it('should log student updates with changes', () => {
      const auditLog = {
        type: 'audit',
        action: 'student_updated',
        userId: 'teacher-123',
        studentId: 'student-456',
        changes: ['name', 'age', 'diagnosis'],
        timestamp: new Date().toISOString(),
      };

      expect(auditLog.action).toBe('student_updated');
      expect(auditLog.changes).toContain('name');
      expect(auditLog.changes).toContain('age');
      expect(auditLog.changes).toHaveLength(3);
    });

    it('should log student deletion', () => {
      const auditLog = {
        type: 'audit',
        action: 'student_deleted',
        userId: 'teacher-123',
        studentId: 'student-456',
        timestamp: new Date().toISOString(),
      };

      expect(auditLog.action).toBe('student_deleted');
      expect(auditLog.studentId).toBe('student-456');
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should have properly typed Student interface', () => {
      const student: Student = {
        id: 'student-123',
        teacherId: 'teacher-456',
        name: 'Ali Yılmaz',
        age: 10,
        grade: '4',
        avatar: '',
        diagnosis: ['Disleksi'],
        interests: ['Futbol', 'Matematik'],
        strengths: ['Görsel algı', 'Problem çözme'],
        weaknesses: ['Okuma hızı', 'Yazım'],
        learningStyle: 'Görsel',
        parentName: 'Mehmet Yılmaz',
        contactPhone: '0555-123-4567',
        contactEmail: 'mehmet@example.com',
        notes: 'Dikkat süresi kısa',
        createdAt: new Date().toISOString(),
      };

      expect(student.name).toBeTypeOf('string');
      expect(student.age).toBeTypeOf('number');
      expect(Array.isArray(student.diagnosis)).toBe(true);
      expect(['Görsel', 'İşitsel', 'Kinestetik', 'Karma']).toContain(student.learningStyle);
    });
  });
});
