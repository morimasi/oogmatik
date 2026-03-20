import type {
  WorksheetTemplate,
  WorksheetDocument,
  WorksheetContent,
  WorksheetMeta,
} from '../types/worksheet';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function nowIso(): string {
  return new Date().toISOString();
}

function makeMeta(
  overrides: Partial<WorksheetMeta> & { title: string; subject: string; grade: string },
): WorksheetMeta {
  return {
    id: makeId(),
    category: 'custom',
    tags: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...overrides,
  };
}

function makeContent(overrides: Partial<WorksheetContent> = {}): WorksheetContent {
  return {
    blocks: [],
    studentInfoVisible: true,
    titleVisible: true,
    instructionText: 'Aşağıdaki soruları dikkatlice okuyun ve cevaplayın.',
    footerText: '',
    ...overrides,
  };
}

function makeDocument(
  meta: WorksheetMeta,
  content: WorksheetContent,
): WorksheetDocument {
  return { meta, content, version: 1 };
}

// ── Built-In Templates ────────────────────────────────────────────────────────

const MATH_TEMPLATE: WorksheetTemplate = {
  id: 'builtin-math-basic',
  name: 'Temel Matematik',
  description: 'Toplama, çıkarma, çarpma ve bölme işlemleri içeren temel matematik çalışma sayfası.',
  category: 'math',
  isBuiltIn: true,
  document: makeDocument(
    makeMeta({ title: 'Matematik Çalışma Sayfası', subject: 'Matematik', grade: '3. Sınıf', category: 'math' }),
    makeContent({
      blocks: [
        { id: makeId(), type: 'heading', content: 'Dört İşlem Alıştırmaları', level: 1 },
        {
          id: makeId(),
          type: 'text',
          content: 'Her işlemi hesaplayın ve sonucu yazın.',
        },
        { id: makeId(), type: 'blank', lines: 8, label: 'İşlemler' },
        { id: makeId(), type: 'divider' },
        { id: makeId(), type: 'heading', content: 'Sözel Problem', level: 2 },
        {
          id: makeId(),
          type: 'text',
          content: 'Bir markette 24 elma ve 36 portakal vardır. Toplam kaç meyve vardır?',
        },
        { id: makeId(), type: 'blank', lines: 3, label: 'Cevap' },
      ],
      instructionText: 'Her soruyu çözün ve cevapları kutulara yazın.',
    }),
  ),
};

const LANGUAGE_TEMPLATE: WorksheetTemplate = {
  id: 'builtin-language-reading',
  name: 'Okuma Anlama',
  description: 'Okuduğunu anlama, kelime çalışması ve yazma egzersizleri içeren dil çalışma sayfası.',
  category: 'language',
  isBuiltIn: true,
  document: makeDocument(
    makeMeta({ title: 'Türkçe Okuma Anlama', subject: 'Türkçe', grade: '4. Sınıf', category: 'language' }),
    makeContent({
      blocks: [
        { id: makeId(), type: 'heading', content: 'Metin Okuma', level: 1 },
        {
          id: makeId(),
          type: 'text',
          content:
            'Aşağıdaki metni okuyun ve soruları cevaplayın.',
        },
        { id: makeId(), type: 'blank', lines: 6, label: 'Metin' },
        { id: makeId(), type: 'divider' },
        { id: makeId(), type: 'heading', content: 'Anlama Soruları', level: 2 },
        { id: makeId(), type: 'blank', lines: 4, label: 'Soru 1' },
        { id: makeId(), type: 'blank', lines: 4, label: 'Soru 2' },
        { id: makeId(), type: 'blank', lines: 4, label: 'Soru 3' },
      ],
      instructionText: 'Metni okuyun ve soruları cevaplandırın.',
    }),
  ),
};

const SCIENCE_TEMPLATE: WorksheetTemplate = {
  id: 'builtin-science-observation',
  name: 'Bilim Gözlem Sayfası',
  description: 'Deney gözlemi, hipotez kurma ve sonuç çıkarma içeren fen bilimleri çalışma sayfası.',
  category: 'science',
  isBuiltIn: true,
  document: makeDocument(
    makeMeta({ title: 'Fen Bilimleri Gözlem Defteri', subject: 'Fen Bilimleri', grade: '5. Sınıf', category: 'science' }),
    makeContent({
      blocks: [
        { id: makeId(), type: 'heading', content: 'Deney Adı', level: 1 },
        { id: makeId(), type: 'blank', lines: 2, label: 'Deney Adı' },
        { id: makeId(), type: 'heading', content: 'Hipotezim', level: 2 },
        { id: makeId(), type: 'blank', lines: 3, label: 'Hipotez' },
        { id: makeId(), type: 'heading', content: 'Gözlemlerim', level: 2 },
        { id: makeId(), type: 'blank', lines: 6, label: 'Gözlemler' },
        { id: makeId(), type: 'heading', content: 'Sonuç', level: 2 },
        { id: makeId(), type: 'blank', lines: 4, label: 'Sonuç' },
      ],
      instructionText: 'Deneyi yapın ve her bölümü doldurun.',
    }),
  ),
};

const SOCIAL_TEMPLATE: WorksheetTemplate = {
  id: 'builtin-social-map',
  name: 'Sosyal Bilgiler Harita',
  description: 'Harita okuma, coğrafya ve tarih içeren sosyal bilgiler çalışma sayfası.',
  category: 'social',
  isBuiltIn: true,
  document: makeDocument(
    makeMeta({ title: 'Sosyal Bilgiler Çalışma Sayfası', subject: 'Sosyal Bilgiler', grade: '4. Sınıf', category: 'social' }),
    makeContent({
      blocks: [
        { id: makeId(), type: 'heading', content: 'Coğrafi Bilgi', level: 1 },
        {
          id: makeId(),
          type: 'text',
          content: 'Haritayı inceleyin ve soruları cevaplayın.',
        },
        { id: makeId(), type: 'blank', lines: 3, label: 'Soru 1: Hangi yönler var?' },
        { id: makeId(), type: 'blank', lines: 3, label: 'Soru 2: Başkent neresi?' },
        { id: makeId(), type: 'divider' },
        { id: makeId(), type: 'heading', content: 'Tarihsel Olaylar', level: 2 },
        { id: makeId(), type: 'blank', lines: 5, label: 'Olayları listeleyin' },
      ],
      instructionText: 'Her soruyu dikkatlice cevaplayın.',
    }),
  ),
};

const BLANK_TEMPLATE: WorksheetTemplate = {
  id: 'builtin-blank',
  name: 'Boş Çalışma Sayfası',
  description: 'Tamamen özelleştirilebilir boş çalışma sayfası.',
  category: 'custom',
  isBuiltIn: true,
  document: makeDocument(
    makeMeta({ title: 'Başlıksız Çalışma Sayfası', subject: '', grade: '', category: 'custom' }),
    makeContent({
      blocks: [
        { id: makeId(), type: 'heading', content: 'Başlık', level: 1 },
        { id: makeId(), type: 'blank', lines: 15, label: '' },
      ],
    }),
  ),
};

// ── Exports ───────────────────────────────────────────────────────────────────

export const BUILT_IN_TEMPLATES: WorksheetTemplate[] = [
  BLANK_TEMPLATE,
  MATH_TEMPLATE,
  LANGUAGE_TEMPLATE,
  SCIENCE_TEMPLATE,
  SOCIAL_TEMPLATE,
];

export const TEMPLATE_CATEGORIES = [
  { value: 'all' as const, label: 'Tümü' },
  { value: 'math' as const, label: 'Matematik' },
  { value: 'language' as const, label: 'Dil' },
  { value: 'science' as const, label: 'Fen Bilimleri' },
  { value: 'social' as const, label: 'Sosyal Bilgiler' },
  { value: 'custom' as const, label: 'Özel' },
] as const;

export const ZOOM_LEVELS: readonly number[] = [50, 75, 100, 125, 150, 200];

export const DEFAULT_EDITOR_SETTINGS = {
  zoom: 100 as 100,
  showPageBreaks: true,
  showRuler: false,
  autoSave: true,
  autoSaveIntervalMs: 30_000,
} as const;

export const DEFAULT_DYSLEXIA_SETTINGS = {
  fontFamily: 'default' as const,
  lineHeight: 1.5,
  letterSpacing: 0,
  highContrast: false,
  backgroundColor: '#ffffff',
  reducedMotion: false,
} as const;

export const DEFAULT_EXPORT_SETTINGS = {
  format: 'pdf' as const,
  pageSize: 'A4' as const,
  orientation: 'portrait' as const,
  quality: 95,
  includeAnswerKey: false,
} as const;

export const STORAGE_KEY_CUSTOM_TEMPLATES = 'uwv_custom_templates';
