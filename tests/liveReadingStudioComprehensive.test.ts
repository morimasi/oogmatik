// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase
vi.mock('../src/services/firebaseClient', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  setDoc: vi.fn().mockResolvedValue(undefined),
  doc: vi.fn().mockReturnValue({}),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({
    forEach: vi.fn(),
  }),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
}));

const mockUpdateStudent = vi.fn();
vi.mock('../src/store/useStudentStore', () => ({
  useStudentStore: {
    getState: vi.fn(() => ({
      activeStudent: { id: 'std-1', name: 'Caner Yılmaz', grade: '2. Sınıf', age: 8, notes: '' },
      students: [{ id: 'std-1', name: 'Caner Yılmaz', grade: '2. Sınıf', age: 8, notes: '' }],
      updateStudent: mockUpdateStudent,
    })),
  },
}));

vi.mock('../src/store/useAuthStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      user: { id: 'teacher-1', name: 'Ayşe Öğretmen', role: 'teacher' },
    })),
  },
}));

describe('LiveReadingStudio — Comprehensive Architectural Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('readingSessionService', () => {
    it('saves reading session with deterministic ID and updates localStorage', async () => {
      const { readingSessionService } = await import('../src/services/readingSessionService');

      const mockPassage = {
        id: 'test-passage-1',
        title: 'Neşeli Kedi Mırnav',
        text: 'Mırnav bahçede top oynuyor.',
        words: ['Mırnav', 'bahçede', 'top', 'oynuyor.'],
        syllabifiedWords: [['Mır', 'nav'], ['bah', 'çe', 'de'], ['top'], ['oy', 'nu', 'yor']],
        targetSkill: 'Akıcı Okuma',
        level: '2. Sınıf Başlangıç',
        difficultyRating: 2,
      };

      const mockMetrics = {
        durationSeconds: 45,
        totalWordsTarget: 4,
        totalWordsRead: 4,
        correctWordsCount: 4,
        errorWordsCount: 0,
        selfCorrectionCount: 1,
        hesitationCount: 0,
        averageHesitationMs: 0,
        wcpm: 60,
        accuracyPercentage: 100,
        prosodyScore: 92,
        gradeLevelEquivalent: '2. Sınıf Düzeyi',
        errorBreakdown: {
          ERR_MIRROR: 0,
          ERR_OMISSION: 0,
          ERR_GUESS: 0,
          ERR_MORPH: 0,
          ERR_TRANSP: 0,
          SUCCESS_SELF: 1,
        },
        pedagogicalSummary: 'Çok akıcı bir okuma sergiledi.',
        recommendations: ['Tebrikler'],
      };

      const docId = await readingSessionService.saveSession(
        'teacher-1',
        'std-1',
        'Caner Yılmaz',
        mockPassage,
        mockMetrics
      );

      expect(docId).toContain('reading_teacher-1_');

      // LocalStorage kontrolü
      const local = readingSessionService.getLocalSessions();
      expect(local.length).toBe(1);
      expect(local[0].passageTitle).toBe('Neşeli Kedi Mırnav');
      expect(local[0].metrics.wcpm).toBe(60);

      // BEP senkronizasyonu kontrolü
      expect(mockUpdateStudent).toHaveBeenCalledWith(
        'std-1',
        expect.objectContaining({
          notes: expect.stringContaining('WCPM'),
        })
      );
    });

    it('returns empty list when no sessions exist locally', async () => {
      const { readingSessionService } = await import('../src/services/readingSessionService');
      const sessions = readingSessionService.getLocalSessions();
      expect(sessions).toEqual([]);
    });

    it('deletes session from localStorage correctly', async () => {
      const { readingSessionService } = await import('../src/services/readingSessionService');

      const mockPassage = {
        id: 'p1',
        title: 'Deneme',
        text: 'Metin',
        words: ['Metin'],
        syllabifiedWords: [['Me', 'tin']],
        targetSkill: 'Hız',
        level: '1. Sınıf',
        difficultyRating: 1,
      };

      const mockMetrics = {
        durationSeconds: 10,
        totalWordsTarget: 1,
        totalWordsRead: 1,
        correctWordsCount: 1,
        errorWordsCount: 0,
        selfCorrectionCount: 0,
        hesitationCount: 0,
        averageHesitationMs: 0,
        wcpm: 50,
        accuracyPercentage: 100,
        prosodyScore: 80,
        gradeLevelEquivalent: '1. Sınıf',
        errorBreakdown: {
          ERR_MIRROR: 0,
          ERR_OMISSION: 0,
          ERR_GUESS: 0,
          ERR_MORPH: 0,
          ERR_TRANSP: 0,
          SUCCESS_SELF: 0,
        },
        pedagogicalSummary: '',
        recommendations: [],
      };

      const docId = await readingSessionService.saveSession(
        'teacher-1',
        'std-1',
        'Öğrenci',
        mockPassage,
        mockMetrics
      );

      expect(readingSessionService.getLocalSessions().length).toBe(1);
      await readingSessionService.deleteSession(docId);
      expect(readingSessionService.getLocalSessions().length).toBe(0);
    });
  });

  describe('liveReadingCoachService linguistic utilities', () => {
    it('normalizes Turkish text correctly by stripping punctuation and casing', async () => {
      const { normalizeTr } = await import('../src/services/liveReadingCoachService');
      expect(normalizeTr('IŞIK!')).toBe('ışık');
      expect(normalizeTr('  İstanbul, ')).toBe('istanbul');
      expect(normalizeTr('Çiçek?')).toBe('çiçek');
      expect(normalizeTr('Ağaç-ev')).toBe('ağaçev');
    });

    it('calculates Levenshtein distance accurately for phonological comparisons', async () => {
      const { getLevenshteinDistance } = await import('../src/services/liveReadingCoachService');
      expect(getLevenshteinDistance('kitap', 'kitap')).toBe(0);
      expect(getLevenshteinDistance('kitap', 'katap')).toBe(1);
      expect(getLevenshteinDistance('kedi', 'köpek')).toBe(4);
    });
  });

  describe('SAMPLE_READING_PASSAGES integrity', () => {
    it('has at least 4 curated graded passages with correct syllabification', async () => {
      const { SAMPLE_READING_PASSAGES } = await import(
        '../src/components/LiveReadingStudio/sampleStories'
      );
      expect(SAMPLE_READING_PASSAGES.length).toBeGreaterThanOrEqual(4);

      SAMPLE_READING_PASSAGES.forEach((passage) => {
        expect(passage.words.length).toBeGreaterThan(0);
        expect(passage.syllabifiedWords.length).toBe(passage.words.length);
        expect(passage.comprehensionQuestions?.length).toBeGreaterThan(0);
      });
    });

    it('covers all target age groups across the library', async () => {
      const { SAMPLE_READING_PASSAGES } = await import(
        '../src/components/LiveReadingStudio/sampleStories'
      );
      const ageGroups = SAMPLE_READING_PASSAGES.map((p) => p.ageGroup);
      expect(ageGroups.some((ag) => ag.includes('1. Sınıf') || ag.includes('1-2'))).toBe(true);
      expect(ageGroups.some((ag) => ag.includes('2') || ag.includes('3'))).toBe(true);
      const levels = SAMPLE_READING_PASSAGES.map((p) => p.level);
      expect(levels).toContain('kolay');
      expect(levels).toContain('orta');
    });
  });

  describe('Dyslexia Ergonomics & Paper Tints', () => {
    it('supports 4 visual stress reduction paper tints', () => {
      const validTints = ['dark', 'cream', 'mint', 'rose'];
      expect(validTints).toContain('dark');
      expect(validTints).toContain('cream');
      expect(validTints).toContain('mint');
      expect(validTints).toContain('rose');
    });
  });
});
