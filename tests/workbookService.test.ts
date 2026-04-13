/**
 * OOGMATIK — Workbook Service Tests
 *
 * Test suite for workbook ultra-premium transformation
 *
 * @module tests/workbookService.test
 * @version 2.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createWorkbook,
  getWorkbookById,
  updateWorkbook,
  deleteWorkbook,
  restoreWorkbook,
  duplicateWorkbook,
  listWorkbooks,
  getWorkbookStats,
} from '../src/services/workbook/workbookService';
import {
  addCollaborator,
  removeCollaborator,
  updateShareSettings,
  generateShareLink,
} from '../src/services/workbook/workbookSharingService';
import { exportWorkbook } from '../src/services/workbook/workbookExport';
import {
  getAllTemplates,
  getTemplateById,
  getTemplateByType,
} from '../src/services/workbook/workbookTemplates';
import type { CreateWorkbookPayload } from '../src/types/workbook';

// ============================================================================
// MOCKS
// ============================================================================

vi.mock('../src/services/firebaseClient', () => ({
  db: {},
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  Timestamp: { now: () => ({ seconds: 1234567890 }) },
  writeBatch: vi.fn(),
  runTransaction: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  increment: vi.fn((value?: number) => ({ _mockIncrement: value ?? 1 })),
  runTransaction: vi.fn(),
  writeBatch: vi.fn(),
  Timestamp: { now: () => ({ seconds: 1234567890 }) },
}));

// ============================================================================
// TEMPLATE TESTS
// ============================================================================

describe('Workbook Templates', () => {
  it('should return 12 premium templates', () => {
    const templates = getAllTemplates();
    expect(templates).toHaveLength(12);
  });

  it('should retrieve template by ID', () => {
    const template = getTemplateById('academic-standard-001');
    expect(template).toBeDefined();
    expect(template.type).toBe('academic-standard');
  });

  it('should retrieve template by type', () => {
    const template = getTemplateByType('dyslexia-friendly');
    expect(template).toBeDefined();
    expect(template.targetProfile).toBe('dyslexia');
  });

  it('should have correct difficulty distribution for dyslexia template', () => {
    const template = getTemplateByType('dyslexia-friendly');
    expect(template.difficultyDistribution.kolay).toBeGreaterThan(40); // Güven inşası
    expect(template.difficultyDistribution.kolay).toBeLessThanOrEqual(50);
  });

  it('should throw error for non-existent template', () => {
    expect(() => getTemplateById('non-existent')).toThrow();
  });
});

// ============================================================================
// WORKBOOK SERVICE TESTS
// ============================================================================

describe('Workbook Service', () => {
  const mockUserId = 'test-user-123';
  const mockPayload: CreateWorkbookPayload = {
    title: 'Test Workbook',
    description: 'Test description',
    templateType: 'academic-standard',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createWorkbook', () => {
    it('should validate title length (min 3 chars)', async () => {
      const invalidPayload = { ...mockPayload, title: 'ab' };
      await expect(createWorkbook(mockUserId, invalidPayload)).rejects.toThrow();
    });

    it('should validate title length (max 100 chars)', async () => {
      const invalidPayload = { ...mockPayload, title: 'a'.repeat(101) };
      await expect(createWorkbook(mockUserId, invalidPayload)).rejects.toThrow();
    });

    it('should create workbook with default settings', async () => {
      // Mock Firestore setDoc
      const { setDoc } = await import('firebase/firestore');
      (setDoc as any).mockResolvedValue(undefined);

      const workbook = await createWorkbook(mockUserId, mockPayload);
      expect(workbook.title).toBe(mockPayload.title);
      expect(workbook.settings.fontFamily).toBe('Lexend'); // Disleksi uyumlu default
      expect(workbook.status).toBe('draft');
      expect(workbook.version).toBe(1);
    });

    it('should enforce KVKV anonymization default', async () => {
      const { setDoc } = await import('firebase/firestore');
      (setDoc as any).mockResolvedValue(undefined);

      const workbook = await createWorkbook(mockUserId, mockPayload);
      expect(workbook.shareSettings.anonymizeStudentData).toBe(true); // KVKV
    });
  });

  describe('updateWorkbook', () => {
    it('should validate page count (min 1, max 200)', async () => {
      const emptyPages: any[] = [];
      await expect(
        updateWorkbook('workbook-id', mockUserId, { pages: emptyPages })
      ).rejects.toThrow('en az 1 sayfa');

      const tooManyPages = Array(201).fill({} as any);
      await expect(
        updateWorkbook('workbook-id', mockUserId, { pages: tooManyPages })
      ).rejects.toThrow('en fazla 200 sayfa');
    });

    it('should increment version number on update', async () => {
      // TODO: Mock getWorkbookById + updateDoc
    });
  });

  describe('deleteWorkbook (soft delete)', () => {
    it('should set status to deleted instead of hard delete', async () => {
      // TODO: Mock soft delete (status: 'deleted', deletedAt: timestamp)
    });

    it('should allow restoration within 30 days', async () => {
      // TODO: Mock restoreWorkbook
    });
  });

  describe('listWorkbooks', () => {
    it('should apply status filter', async () => {
      // TODO: Mock getDocs with where('status', '==', 'active')
    });

    it('should limit results to max 100 per page', async () => {
      // TODO: Mock pagination limit
    });
  });
});

// ============================================================================
// SHARING SERVICE TESTS (KVKV)
// ============================================================================

describe('Workbook Sharing (KVKV Compliance)', () => {
  const mockWorkbookId = 'workbook-123';
  const mockUserId = 'user-123';

  describe('addCollaborator', () => {
    it('should enforce permission levels (view/comment/edit/admin)', async () => {
      // TODO: Mock addCollaborator
    });

    it('should prevent duplicate collaborators', async () => {
      // TODO: Test duplicate email rejection
    });
  });

  describe('updateShareSettings', () => {
    it('should REQUIRE anonymization if student assigned', async () => {
      // KVKV critical test
      const settingsWithStudent = {
        isPublic: true,
        anonymizeStudentData: false, // YASAK
      };

      await expect(
        updateShareSettings(mockWorkbookId, mockUserId, settingsWithStudent)
      ).rejects.toThrow('anonimleştirme zorunludur');
    });

    it('should allow public sharing without student data', async () => {
      const settingsNoStudent = {
        isPublic: true,
        anonymizeStudentData: true,
      };

      // TODO: Mock success
    });
  });

  describe('generateShareLink', () => {
    it('should create unique link token', async () => {
      // TODO: Mock UUID generation
    });

    it('should set expiry date (default 30 days)', async () => {
      // TODO: Mock expiry calculation
    });

    it('should support password protection', async () => {
      // TODO: Mock password setting
    });
  });
});

// ============================================================================
// EXPORT SERVICE TESTS
// ============================================================================

describe('Workbook Export', () => {
  const mockWorkbook: any = {
    id: 'workbook-123',
    title: 'Test Workbook',
    pages: [],
    settings: { orientation: 'portrait', pageSize: 'A4' },
  };

  describe('exportToPDF', () => {
    it('should generate PDF blob', async () => {
      const blob = await exportWorkbook(mockWorkbook, {
        format: 'pdf',
        includeAnswers: true,
        includeStudentData: false,
      });

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toContain('pdf');
    });

    it('should anonymize student data if includeStudentData=false', async () => {
      const workbookWithStudent = {
        ...mockWorkbook,
        assignedStudentId: 'student-123',
        studentProfile: { name: 'Test Student' },
      };

      const blob = await exportWorkbook(workbookWithStudent, {
        format: 'pdf',
        includeAnswers: false,
        includeStudentData: false, // KVKV: Anonimleştir
      });

      expect(blob).toBeDefined();
      // TODO: Verify student data not in export
    });
  });

  describe('exportToInteractiveHTML', () => {
    it('should generate self-contained HTML', async () => {
      const blob = await exportWorkbook(mockWorkbook, {
        format: 'interactive',
        includeAnswers: true,
        includeStudentData: false,
      });

      expect(blob.type).toBe('text/html;charset=utf-8');

      const text = await blob.text();
      expect(text).toContain('<!DOCTYPE html>');
      expect(text).toContain(mockWorkbook.title);
    });
  });

  describe('exportWithProgress', () => {
    it('should call progress callback at multiple stages', async () => {
      // TODO: Test progress tracking (0%, 20%, 40%, 80%, 100%)
    });
  });
});

// ============================================================================
// ANALYTICS TESTS
// ============================================================================

describe('Workbook Analytics', () => {
  it('should calculate total pages across all workbooks', async () => {
    // TODO: Mock getWorkbookStats
  });

  it('should track most used templates', async () => {
    // TODO: Mock template usage counts
  });

  it('should calculate average completion rate', async () => {
    // TODO: Mock student progress data
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Workbook Integration Tests', () => {
  it('should create → update → export workflow', async () => {
    // 1. Create workbook
    // 2. Add pages
    // 3. Update settings
    // 4. Export to PDF
    // TODO: Full workflow test
  });

  it('should create → share → collaborate workflow', async () => {
    // 1. Create workbook
    // 2. Add collaborator
    // 3. Generate share link
    // 4. Update by collaborator
    // TODO: Full collaboration test
  });

  it('should enforce KVKV throughout entire workflow', async () => {
    // 1. Create with student assigned
    // 2. Attempt public share without anonymization → FAIL
    // 3. Update share settings with anonymization → SUCCESS
    // 4. Export without student data → SUCCESS
    // TODO: KVKV end-to-end test
  });
});
