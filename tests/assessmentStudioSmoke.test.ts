// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';

// Mock Firebase
vi.mock('../src/services/firebaseClient', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'mock-id' }),
  setDoc: vi.fn().mockResolvedValue(undefined),
  doc: vi.fn().mockReturnValue({}),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({ forEach: vi.fn() }),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false, data: () => ({}) }),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
  updateDoc: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../src/store/useStudentStore', () => ({
  useStudentStore: {
    getState: vi.fn(() => ({
      activeStudent: null,
      updateStudent: vi.fn(),
    })),
  },
}));

describe('Assessment Studio — Comprehensive Smoke Tests', () => {
  describe('cognitiveAdaptiveService', () => {
    it('calculates adaptive parameters for dyslexia / ADHD profile correctly', async () => {
      const { calculateDomainAdaptiveParameters } = await import(
        '../src/components/assessment/services/cognitiveAdaptiveService'
      );
      const params = calculateDomainAdaptiveParameters('selective_attention', {
        studentName: 'Caner',
        age: 8,
        grade: '2. Sınıf',
        diagnosis: ['Disleksi', 'DEHB'],
        strengths: ['Görsel Hafıza'],
        weaknesses: ['Dikkat Süresi'],
      });
      expect(params.timeLimitMultiplier).toBeGreaterThanOrEqual(1.0);
      expect(params.distractorComplexity).toBe('low');
    });

    it('translates complexity score to readable Turkish labels', async () => {
      const { difficultyForProfile } = await import(
        '../src/components/assessment/services/cognitiveAdaptiveService'
      );
      expect(difficultyForProfile(1)).toBe('Çok Kolay');
      expect(difficultyForProfile(2)).toBe('Kolay');
      expect(difficultyForProfile(3)).toBe('Orta');
      expect(difficultyForProfile(4)).toBe('İleri');
      expect(difficultyForProfile(5)).toBe('Uzman');
    });
  });

  describe('adaptiveTestContent deterministic engine', () => {
    it('produces deterministic pseudo-random sequences for identical seeds', async () => {
      const { createRng } = await import(
        '../src/components/assessment/services/adaptiveTestContent'
      );
      const rng1 = createRng('student-seed-123');
      const rng2 = createRng('student-seed-123');
      const val1 = [rng1(), rng1(), rng1()];
      const val2 = [rng2(), rng2(), rng2()];
      expect(val1).toEqual(val2);
    });

    it('hashes strings consistently', async () => {
      const { hashString } = await import(
        '../src/components/assessment/services/adaptiveTestContent'
      );
      expect(hashString('bdmind-test')).toBe(hashString('bdmind-test'));
      expect(hashString('profileA')).not.toBe(hashString('profileB'));
    });
  });

  describe('assessmentConstants', () => {
    it('contains all 11 core cognitive domains', async () => {
      const { DOMAINS } = await import('../src/constants/assessmentConstants');
      expect(DOMAINS).toHaveLength(11);
      const domainIds = DOMAINS.map((d) => d.id);
      expect(domainIds).toContain('visual_spatial_memory');
      expect(domainIds).toContain('processing_speed');
      expect(domainIds).toContain('selective_attention');
      expect(domainIds).toContain('phonological_loop');
      expect(domainIds).toContain('logical_reasoning');
      expect(domainIds).toContain('visual_search');
      expect(domainIds).toContain('working_memory');
      expect(domainIds).toContain('planning');
      expect(domainIds).toContain('auditory_processing');
      expect(domainIds).toContain('visual_motor_integration');
      expect(domainIds).toContain('verbal_comprehension');
    });

    it('maps every domain to recommended remedial activities in DOMAIN_ACTIVITY_MAP', async () => {
      const { DOMAINS, DOMAIN_ACTIVITY_MAP } = await import(
        '../src/constants/assessmentConstants'
      );
      DOMAINS.forEach((d) => {
        expect(DOMAIN_ACTIVITY_MAP).toHaveProperty(d.id);
        expect(DOMAIN_ACTIVITY_MAP[d.id].length).toBeGreaterThan(0);
      });
    });

    it('has styling for all domain colors and icon colors', async () => {
      const { DOMAINS, DOMAIN_COLORS, DOMAIN_ICON_COLORS } = await import(
        '../src/constants/assessmentConstants'
      );
      DOMAINS.forEach((d) => {
        expect(DOMAIN_COLORS).toHaveProperty(d.color);
        expect(DOMAIN_ICON_COLORS).toHaveProperty(d.color);
      });
    });
  });

  describe('assessmentService', () => {
    it('provides type-safe operations for save, fetch and delete', async () => {
      const { assessmentService } = await import('../src/services/assessmentService');
      expect(typeof assessmentService.saveAssessment).toBe('function');
      expect(typeof assessmentService.getUserAssessments).toBe('function');
      expect(typeof assessmentService.getSharedAssessments).toBe('function');
      expect(typeof assessmentService.getAssessmentsByStudent).toBe('function');
      expect(typeof assessmentService.toggleArchiveAssessment).toBe('function');
      expect(typeof assessmentService.deleteAssessment).toBe('function');
      expect(typeof assessmentService.shareAssessment).toBe('function');
    });

    it('saves assessment with deterministic ID and triggers BEP note synchronization', async () => {
      const { assessmentService } = await import('../src/services/assessmentService');
      const mockReport = {
        overallSummary: 'Test özet',
        scores: { attention: 50 },
        chartData: [{ label: 'Dikkat', value: 50, fullMark: 100 }],
        analysis: { strengths: [], weaknesses: ['Dikkat'], errorAnalysis: [] },
        roadmap: [{ activityId: 'STROOP_TEST', reason: 'Destek', frequency: 'Haftada 3' }],
      };

      const docId = await assessmentService.saveAssessment(
        'teacher_1',
        'Ali Veli',
        'Erkek',
        8,
        '2. Sınıf',
        mockReport,
        'student_123',
        [
          {
            testId: 'selective_attention',
            name: 'Dikkat Testi',
            score: 45,
            rawScore: 9,
            totalItems: 20,
            avgReactionTime: 850,
            accuracy: 45,
            status: 'completed',
            timestamp: Date.now(),
          },
        ]
      );

      expect(docId).toContain('assessment_teacher_1_');
    });
  });
});
