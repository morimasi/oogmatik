import { describe, it, expect, vi, beforeEach } from 'vitest';
import { progressService } from '../src/services/progressService';
import { ActivityCompletion } from '../src/types/progress';
import { ActivityType } from '../src/types';

// Firebase mockları
vi.mock('../src/services/firebaseClient', () => {
  return {
    db: {},
    collection: vi.fn(),
    doc: vi.fn(() => ({ id: 'mock-doc-id' })),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    Timestamp: {
      now: () => ({ toISOString: () => new Date().toISOString() })
    },
    writeBatch: vi.fn(),
    increment: vi.fn()
  };
});

// errorHandler mock
vi.mock('../src/utils/errorHandler', () => ({
  logError: vi.fn(),
  logInfo: vi.fn()
}));

describe('ProgressService', () => {
  const mockStudentId = 'student-123';
  const mockCompletion: ActivityCompletion = {
    id: 'activity-1',
    studentId: mockStudentId,
    activityType: ActivityType.DYSLEXIA_SYLLABLE_BREAK,
    score: 85,
    duration: 600, // 10 dk
    timestamp: new Date().toISOString(),
    difficulty: 'Orta',
    targetSkills: ['Görsel Algı'],
    errors: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logActivityCompletion çağrıldığında setDoc çalışmalı', async () => {
    const { setDoc } = await import('../src/services/firebaseClient');
    
    // updateProgressSnapshot'ı mocklayalım ki iç içe geçmesin (veya gerçek testi yapalım)
    const updateSpy = vi.spyOn(progressService, 'updateProgressSnapshot').mockResolvedValue(undefined);

    await progressService.logActivityCompletion(mockCompletion);

    expect(setDoc).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalledWith(mockStudentId, mockCompletion);
  });

  it('getStudentProgress veri varsa snapshot dönmeli', async () => {
    const { getDoc } = await import('../src/services/firebaseClient');
    (getDoc as any).mockResolvedValue({
      exists: () => true,
      data: () => ({ overallScore: 90 })
    });

    const result = await progressService.getStudentProgress(mockStudentId);
    expect(result).not.toBeNull();
    expect(result?.overallScore).toBe(90);
  });
});
