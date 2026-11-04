import { describe, it, expect, beforeEach } from 'vitest';
import {
  AnalyzeRequestSchema,
  GeneratedActivitySchema,
  AIAnalysisResultSchema,
  ActivitySectionSchema,
} from '../src/utils/schemas/visionStudio';
import { useVisionStudioStore } from '../src/store/useVisionStudioStore';
import type { GeneratedActivity, ActivitySection } from '../src/types/visionStudio';

describe('VisionStudio — Zod Şema Doğrulamaları', () => {
  it('AnalyzeRequestSchema geçerli bir isteği doğrulamalı', () => {
    const valid = {
      fileUrl: 'https://storage.googleapis.com/test-bucket/doc123.pdf',
      fileType: 'pdf' as const,
      fileId: 'file-123',
      userId: 'user-abc',
      generateVariations: 1,
    };
    const res = AnalyzeRequestSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('AnalyzeRequestSchema geçersiz URL veya eksi varyasyonda hata vermeli', () => {
    const invalid = {
      fileUrl: 'not-a-url',
      fileType: 'pdf' as const,
      fileId: 'file-123',
      userId: 'user-abc',
      generateVariations: 0,
    };
    const res = AnalyzeRequestSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('AIAnalysisResultSchema geçerli analiz sonucunu doğrulamalı', () => {
    const validAnalysis = {
      detectedCategory: 'matematik' as const,
      detectedGrade: '4. Sınıf',
      detectedSubject: 'Matematik',
      detectedDifficulty: 'orta' as const,
      detectedObjectives: [{ code: 'M.4.1.2', text: 'Kesirlerle toplama yapar.' }],
      detectedActivityType: 'çalışma sayfası',
      summary: 'Kesirlerle toplama ve çıkarma alıştırmaları içeren çalışma sayfası.',
      tokensUsed: 1250,
      modelUsed: 'gemini-2.5-flash',
    };
    const res = AIAnalysisResultSchema.safeParse(validAnalysis);
    expect(res.success).toBe(true);
  });

  it('ActivitySectionSchema discriminated union (question) doğru ayrıştırmalı', () => {
    const validQuestionSection: ActivitySection = {
      id: 'sec-1',
      order: 1,
      type: 'question',
      title: '1. Soru',
      points: 10,
      objectiveRefs: ['M.4.1.2'],
      content: {
        type: 'question',
        questionText: '3/4 + 1/4 işleminin sonucu kaçtır?',
        options: ['1', '2/4', '4/8', '0'],
        correctAnswer: '1',
        explanation: 'Paydalar eşit olduğu için paylar toplanır: 4/4 = 1.',
      },
    };
    const res = ActivitySectionSchema.safeParse(validQuestionSection);
    expect(res.success).toBe(true);
  });

  it('GeneratedActivitySchema tam pedagojik aktiviteyi doğrulamalı', () => {
    const validActivity: GeneratedActivity = {
      id: 'act-uuid-1',
      schemaVersion: 1,
      title: 'Kesirlerle Eğlenceli Toplama',
      grade: '4. Sınıf',
      subject: 'Matematik',
      category: 'matematik',
      difficulty: 'kolay',
      durationMinutes: 30,
      objectives: [{ code: 'M.4.1.2', text: 'Basit kesirleri toplar.' }],
      instructions: 'Aşağıdaki soruları dikkatlice okuyup cevaplayınız.',
      sections: [
        {
          id: 'sec-1',
          order: 1,
          type: 'text',
          title: 'Giriş',
          points: 0,
          objectiveRefs: [],
          content: { type: 'text', text: 'Kesirler günlük hayatımızda çok kullanılır.' },
        },
      ],
      answerKey: [{ sectionId: 'sec-1', answer: 'A', explanation: 'Doğru cevap' }],
      teacherNotes: 'Görsel kartlarla desteklenebilir.',
      pedagogicalNote: 'ZPD seviyesinde somutlaştırma için renkli blok temsilleri önerilir.',
      status: 'ready',
      ownerId: 'teacher-1',
      sourceFileId: 'file-1',
      createdAt: '2026-11-04T22:00:00.000Z',
      updatedAt: '2026-11-04T22:00:00.000Z',
      version: 1,
    };
    const res = GeneratedActivitySchema.safeParse(validActivity);
    expect(res.success).toBe(true);
  });
});

describe('VisionStudio — Zustand Store Mantığı', () => {
  beforeEach(() => {
    useVisionStudioStore.getState().reset();
  });

  it('başlangıç durumunda step="upload" olmalı', () => {
    const state = useVisionStudioStore.getState();
    expect(state.step).toBe('upload');
    expect(state.uploadedFile).toBeNull();
    expect(state.generatedActivities).toHaveLength(0);
  });

  it('setStep adımı güncellemeli', () => {
    useVisionStudioStore.getState().setStep('preview');
    expect(useVisionStudioStore.getState().step).toBe('preview');
  });

  it('setGeneratedActivities aktiviteleri ekleyip ilkini seçmeli', () => {
    const dummyAct = {
      id: 'test-act-1',
      schemaVersion: 1 as const,
      title: 'Test',
      grade: '3',
      subject: 'Türkçe',
      category: 'turkce' as const,
      difficulty: 'kolay' as const,
      durationMinutes: 20,
      objectives: [{ code: 'T.1', text: 'Okur' }],
      instructions: 'Yönerge',
      sections: [],
      answerKey: [],
      teacherNotes: '',
      pedagogicalNote: 'Pedagojik not',
      status: 'ready' as const,
      ownerId: 'user-1',
      sourceFileId: 'f-1',
      createdAt: '2026-11-04T22:00:00.000Z',
      updatedAt: '2026-11-04T22:00:00.000Z',
      version: 1,
    };

    useVisionStudioStore.getState().setGeneratedActivities([dummyAct]);
    const state = useVisionStudioStore.getState();
    expect(state.generatedActivities).toHaveLength(1);
    expect(state.selectedActivityId).toBe('test-act-1');
  });
});
