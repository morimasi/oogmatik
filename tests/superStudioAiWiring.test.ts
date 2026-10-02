import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Gemini istemcisi (gerçek API çağrısı yapılmaz)
vi.mock('../src/services/geminiClient.js', () => ({
  generateWithSchema: vi.fn(),
}));

import { generateWithSchema } from '../src/services/geminiClient.js';
import {
  generateSuperStudioContent,
  sanitizeSuperStudioTopic,
  clampSuperStudioParams,
  extractPedagogicalNote,
} from '../src/services/generators/superStudioGenerator';
import { AppError } from '../src/utils/AppError';
import { useSuperStudioStore } from '../src/store/useSuperStudioStore';

const LONG_NOTE = 'Disleksi destegine ihtiyaci olan ogrenciler icin hazirlanan ogretmen notu.';

describe('superStudio AI wiring — ayarlar → generator aktarımı', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sanitizeSuperStudioTopic (prompt injection koruması)', () => {
    it('konuyu max 2000 karaktere indirger', () => {
      const long = `a`.repeat(2500);
      expect(sanitizeSuperStudioTopic(long)).toHaveLength(2000);
    });

    it('script ve açı parantez kalıplarını temizler', () => {
      const dirty = 'Mevsimler <script>alert(1)</script> javascript:foo';
      const clean = sanitizeSuperStudioTopic(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('javascript:');
    });

    it('string olmayan girdide varsayılan döner', () => {
      expect(sanitizeSuperStudioTopic(null)).toBe('Genel');
      expect(sanitizeSuperStudioTopic(undefined)).toBe('Genel');
      expect(sanitizeSuperStudioTopic('   ')).toBe('Genel');
    });
  });

  describe('clampSuperStudioParams (aralık koruma)', () => {
    it('temperature/topP değerini 0-1 aralığına indirger', () => {
      expect(clampSuperStudioParams({ temperature: 5 }).temperature).toBe(1);
      expect(clampSuperStudioParams({ temperature: -2 }).temperature).toBe(0);
      expect(clampSuperStudioParams({ topP: 9 }).topP).toBe(1);
      expect(clampSuperStudioParams({ topP: -1 }).topP).toBe(0);
    });

    it('thinkingBudget değerini 0-8192 aralığına indirger', () => {
      expect(clampSuperStudioParams({ thinkingBudget: 99999 }).thinkingBudget).toBe(8192);
      expect(clampSuperStudioParams({ thinkingBudget: -50 }).thinkingBudget).toBe(0);
    });

    it('geçersiz (NaN) değerlerde varsayılanlara döner', () => {
      const clamped = clampSuperStudioParams({ temperature: NaN, topP: NaN, thinkingBudget: NaN });
      expect(clamped).toEqual({ temperature: 0.7, topP: 0.9, thinkingBudget: 2048 });
    });
  });

  describe('extractPedagogicalNote (zorunlu öğretmen notu)', () => {
    it('geçerli notu kırparak döner', () => {
      expect(extractPedagogicalNote({ pedagogicalNote: `  ${LONG_NOTE}  ` }, 'okuma-anlama')).toBe(LONG_NOTE);
    });

    it('eksik notta AppError fırlatır', () => {
      expect(() => extractPedagogicalNote({ title: 'x' }, 'okuma-anlama')).toThrow(AppError);
      expect(() => extractPedagogicalNote({ pedagogicalNote: 'kısa' }, 'okuma-anlama')).toThrow(AppError);
      expect(() => extractPedagogicalNote(null, 'okuma-anlama')).toThrow(AppError);
    });
  });

  describe('generateSuperStudioContent — AI parametre aktarımı', () => {
    const okumaResponse = {
      title: 'Test Metni',
      text: 'Bu bir test metnidir.',
      questions: [{ question: 'Soru 1?', answer: 'Cevap 1' }],
      pedagogicalNote: LONG_NOTE,
    };

    it('store parametrelerini Gemini çağrısına aynen geçirir', async () => {
      vi.mocked(generateWithSchema).mockResolvedValueOnce(okumaResponse);

      await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '3. Sınıf',
        topic: 'Mevsimler',
        difficulty: 'Kolay',
        studentId: null,
        temperature: 0.3,
        topP: 0.8,
        thinkingBudget: 1024,
      });

      expect(generateWithSchema).toHaveBeenCalledTimes(1);
      const options = vi.mocked(generateWithSchema).mock.calls[0][2] as Record<string, unknown>;
      expect(options).toMatchObject({ temperature: 0.3, topP: 0.8, thinkingBudget: 1024 });
    });

    it('aralık dışı parametreleri kırparak geçirir', async () => {
      vi.mocked(generateWithSchema).mockResolvedValueOnce(okumaResponse);

      await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '3. Sınıf',
        topic: 'Mevsimler',
        difficulty: 'Kolay',
        studentId: null,
        temperature: 7,
        topP: -3,
        thinkingBudget: 100000,
      });

      const options = vi.mocked(generateWithSchema).mock.calls[0][2] as Record<string, unknown>;
      expect(options).toMatchObject({ temperature: 1, topP: 0, thinkingBudget: 8192 });
    });

    it('uzun/zararlı konuyu sanitize ederek prompta işler', async () => {
      vi.mocked(generateWithSchema).mockResolvedValueOnce(okumaResponse);
      const evil = `${'a'.repeat(1990)}<script>alert(1)</script>${'b'.repeat(100)}`;

      await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '3. Sınıf',
        topic: evil,
        difficulty: 'Kolay',
        studentId: null,
      });

      const prompt = vi.mocked(generateWithSchema).mock.calls[0][0] as string;
      expect(prompt).not.toContain('<script>');
      expect(prompt).not.toContain('b'.repeat(100));
    });

    it('pedagogicalNote eksikse BATCH_GENERATION_FAILED fırlatır', async () => {
      vi.mocked(generateWithSchema).mockResolvedValueOnce({
        title: 'Test',
        text: 'Metin',
        questions: [{ question: 'S?', answer: 'C' }],
      });

      let caught: unknown;
      try {
        await generateSuperStudioContent({
          templates: ['okuma-anlama'],
          settings: {},
          mode: 'ai',
          grade: '3. Sınıf',
          topic: 'Test',
          difficulty: 'Kolay',
          studentId: null,
        });
      } catch (e: unknown) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(AppError);
      expect((caught as AppError).code).toBe('BATCH_GENERATION_FAILED');
    });

    it('pedagogicalNote sayfalara işlenir', async () => {
      vi.mocked(generateWithSchema).mockResolvedValueOnce(okumaResponse);

      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'ai',
        grade: '3. Sınıf',
        topic: 'Test',
        difficulty: 'Kolay',
        studentId: null,
      });

      expect(result).toHaveLength(1);
      expect(result[0].pages[0].pedagogicalNote).toBe(LONG_NOTE);
    });
  });

  describe('generateSuperStudioContent — fast mod yönlendirmesi', () => {
    it('fast modda Gemini çağrılmaz, offline motor çalışır', async () => {
      const result = await generateSuperStudioContent({
        templates: ['okuma-anlama'],
        settings: {},
        mode: 'fast',
        grade: '3. Sınıf',
        topic: 'Mevsimler',
        difficulty: 'Kolay',
        studentId: null,
        temperature: 0.3,
        topP: 0.8,
        thinkingBudget: 1024,
      });

      expect(generateWithSchema).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].pages[0].content).toContain('[HIZLI MOD');
      expect(result[0].pages[0].pedagogicalNote).toBeDefined();
      expect(result[0].pages[0].pedagogicalNote ?? '').not.toContain('disleksisi var');
    });
  });
});

describe('useSuperStudioStore — parametre + wizard korumaları', () => {
  beforeEach(() => {
    useSuperStudioStore.getState().resetStore();
  });

  it('setGenerationParams aralık dışı değerleri kırpar', () => {
    useSuperStudioStore.getState().setGenerationParams({ temperature: 5, topP: -2, thinkingBudget: 99999 });
    const params = useSuperStudioStore.getState().generationParams;
    expect(params.temperature).toBe(1);
    expect(params.topP).toBe(0);
    expect(params.thinkingBudget).toBe(8192);
  });

  it('içerik yokken preview adımına geçilemez', () => {
    useSuperStudioStore.getState().setWizardStep('preview');
    expect(useSuperStudioStore.getState().wizardStep).not.toBe('preview');

    useSuperStudioStore.getState().setWizardStep('templates');
    useSuperStudioStore.getState().goNextWizardStep();
    expect(useSuperStudioStore.getState().wizardStep).toBe('templates');
  });

  it('içerik varken preview adımına geçilebilir', () => {
    useSuperStudioStore.getState().addGeneratedContent({
      id: 'gen-1',
      templateId: 'okuma-anlama',
      pages: [{ title: 'T', content: 'içerik', pedagogicalNote: LONG_NOTE }],
      createdAt: Date.now(),
    });
    useSuperStudioStore.getState().setWizardStep('preview');
    expect(useSuperStudioStore.getState().wizardStep).toBe('preview');
  });

  it('goNext/goPrev sınır kontrolleri taşmaz', () => {
    const store = useSuperStudioStore.getState();
    expect(store.wizardStep).toBe('settings');
    store.goPrevWizardStep();
    expect(useSuperStudioStore.getState().wizardStep).toBe('settings');

    useSuperStudioStore.getState().setWizardStep('templates');
    useSuperStudioStore.getState().goPrevWizardStep();
    expect(useSuperStudioStore.getState().wizardStep).toBe('settings');
  });
});
