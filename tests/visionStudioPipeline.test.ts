import { describe, expect, it } from 'vitest';
import {
  dedupeByTitle,
  normalizeActivityDraft,
  normalizeAnalysis,
} from '../src/utils/visionStudio/normalizeActivity';
import { canTransition } from '../src/services/visionStudio/statusMachine';
import { AnalyzeResponseSchema } from '../src/utils/schemas/visionStudio';
import { decodeActivity, encodeActivity } from '../src/utils/visionStudio/persistenceCodec';
import type { GeneratedActivity } from '../src/types/visionStudio';

const RAW_ACTIVITY = {
  title: 'Kesirlerde Karşılaştırma',
  grade: '4. Sınıf',
  subject: 'Matematik',
  category: 'MATEMATİK',
  difficulty: 'Kolay',
  durationMinutes: '45',
  objectives: [{ code: 'M.4.1.2', text: 'Kesirleri karşılaştırır.' }],
  instructions: 'Aşağıdaki soruları yanıtlayın.',
  sections: [
    {
      type: 'question',
      title: 'Soru 1',
      content: {
        type: 'question',
        questionText: '1/2 mi büyük, 1/3 mü?',
        options: ['1/2', '1/3'],
      },
    },
    {
      // Geçersiz görsel URL'i: bölüm düşürülmeli, etkinlik ayakta kalmalı.
      type: 'image',
      content: { type: 'image', url: 'gecersiz-url', alt: 'Görsel' },
    },
  ],
  answerKey: [{ answer: '1/2', explanation: 'Paydası küçük olan kesir daha büyüktür.' }],
};

describe('VisionStudio AI çıktısı normalizasyonu', () => {
  it('Türkçe/büyük harf kategori ve zorluk değerlerini şemaya uydurur', () => {
    const draft = normalizeActivityDraft(RAW_ACTIVITY);

    expect(draft).not.toBeNull();
    expect(draft?.category).toBe('matematik');
    expect(draft?.difficulty).toBe('kolay');
    expect(draft?.durationMinutes).toBe(45);
  });

  it('geçersiz görsel bölümünü düşürür ve cevap anahtarını bölüme bağlar', () => {
    const draft = normalizeActivityDraft(RAW_ACTIVITY);

    expect(draft?.sections).toHaveLength(1);
    expect(draft?.sections[0].id).toBeTruthy();
    expect(draft?.answerKey[0].sectionId).toBe(draft?.sections[0].id);
  });

  it('pedagogicalNote eksikse pedagojik gerekçe üretir', () => {
    const draft = normalizeActivityDraft(RAW_ACTIVITY);
    expect(draft?.pedagogicalNote.length).toBeGreaterThan(20);
    expect(draft?.pedagogicalNote.toLowerCase()).not.toContain('disleksisi var');
  });

  it('boşluklu cümlede cevap yoksa bölümü atar, bölüm kalmazsa null döner', () => {
    const draft = normalizeActivityDraft({
      ...RAW_ACTIVITY,
      sections: [{ type: 'fillInTheBlank', content: { type: 'fillInTheBlank', sentence: 'Bir ___ iki' } }],
    });
    expect(draft).toBeNull();
  });

  it('tablo başlıkları eksik/ragged olsa da satırları başlık sayısına tamamlar', () => {
    const draft = normalizeActivityDraft({
      ...RAW_ACTIVITY,
      sections: [
        {
          type: 'table',
          content: { type: 'table', headers: ['Ad', 'Puan'], rows: [['Ali'], ['Ayşe', '90']] },
        },
      ],
    });

    const table = draft?.sections[0].content;
    expect(table?.type).toBe('table');
    if (table?.type === 'table') {
      expect(table.rows[0]).toHaveLength(2);
      expect(table.rows[1]).toEqual(['Ayşe', '90']);
    }
  });

  it('normalize edilmiş etkinlik API yanıt şemasından geçer', () => {
    const draft = normalizeActivityDraft(RAW_ACTIVITY);
    expect(draft).not.toBeNull();
    if (!draft) return;

    const now = new Date().toISOString();
    const activity = {
      ...draft,
      id: 'activity-1',
      schemaVersion: 1,
      status: 'ready',
      ownerId: 'user-1',
      sourceFileId: 'file-1',
      createdAt: now,
      updatedAt: now,
      version: 1,
      deletedAt: null,
    };

    const response = {
      analysis: normalizeAnalysis({}, draft, { modelUsed: 'gemini-2.5-flash' }),
      activities: [activity],
    };

    expect(AnalyzeResponseSchema.safeParse(response).success).toBe(true);
  });

  it('aynı başlıklı varyasyonları tekilleştirir', () => {
    const result = dedupeByTitle([{ title: 'Kesirler' }, { title: ' kesirler ' }, { title: 'Ondalık' }]);
    expect(result).toHaveLength(2);
  });
});

describe('VisionStudio Firestore kodeği', () => {
  it('tablo satırlarını iç içe dizi olmadan kodlar ve geri çözer', () => {
    const activity = {
      id: 'a1',
      schemaVersion: 1,
      title: 'Tablo Etkinliği',
      grade: '4. Sınıf',
      subject: 'Matematik',
      category: 'matematik',
      difficulty: 'kolay',
      durationMinutes: 30,
      objectives: [{ code: 'M.4.1', text: 'Veri toplar.' }],
      instructions: 'Tabloyu doldurun.',
      sections: [
        {
          id: 's1',
          order: 1,
          type: 'table',
          title: 'Ölçümler',
          content: { type: 'table', headers: ['Ad', 'Puan'], rows: [['Ali', '80'], ['Ayşe', '90']] },
          points: 10,
          objectiveRefs: [],
        },
      ],
      answerKey: [],
      teacherNotes: '',
      pedagogicalNote: 'ZPD desteği.',
      status: 'ready',
      ownerId: 'u1',
      sourceFileId: 'f1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    } as unknown as GeneratedActivity;

    const encoded = encodeActivity(activity);
    const encodedRow = encoded.sections[0].content;
    expect(encodedRow.type).toBe('table');
    if (encodedRow.type === 'table') {
      expect(Array.isArray(encodedRow.rows[0])).toBe(false);
      expect(encodedRow.rows[0]).toEqual({ cells: ['Ali', '80'] });
    }

    const decoded = decodeActivity(encoded);
    const table = decoded.sections[0].content;
    expect(table.type).toBe('table');
    if (table.type === 'table') {
      expect(table.rows).toEqual([
        ['Ali', '80'],
        ['Ayşe', '90'],
      ]);
    }
  });
});

describe('VisionStudio durum makinesi', () => {
  it('öğretmen akışını izin verir', () => {
    expect(canTransition('ready', 'pending')).toBe(true);
    expect(canTransition('rejected', 'pending')).toBe(true);
  });

  it('onaylı etkinliğin geri dönüşüne izin vermez', () => {
    expect(canTransition('approved', 'pending')).toBe(false);
    expect(canTransition('approved', 'rejected')).toBe(false);
  });

  it('yönetici kararını yalnızca pending durumundan kabul eder', () => {
    expect(canTransition('pending', 'approved')).toBe(true);
    expect(canTransition('pending', 'rejected')).toBe(true);
    expect(canTransition('ready', 'approved')).toBe(false);
  });
});
