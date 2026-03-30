import type {
  WorksheetTemplate,
  WorksheetContent,
  DyslexiaSettings,
  ExportSettings,
  EditorSettings,
} from '../types/worksheet';

// ─── Default Dyslexia Settings ────────────────────────────────────────────────

export const DEFAULT_DYSLEXIA_SETTINGS: DyslexiaSettings = {
  fontFamily: 'default',
  lineHeight: 1.5,
  letterSpacing: 0,
  contrastMode: 'normal',
  backgroundColor: '#ffffff',
  fontSize: 16,
};

// ─── Default Export Settings ──────────────────────────────────────────────────

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: 'pdf',
  pageSize: 'A4',
  orientation: 'portrait',
  includeHeader: true,
  includeFooter: true,
  headerText: '',
  footerText: '',
  pngDpi: 150,
};

// ─── Font Family Labels ───────────────────────────────────────────────────────

export const FONT_FAMILY_LABELS: Record<string, string> = {
  default: 'Varsayılan',
  OpenDyslexic: 'OpenDyslexic',
  ReadingFont: 'Okuma Fontu',
};

// ─── Background Color Presets ─────────────────────────────────────────────────

export const BACKGROUND_COLOR_PRESETS = [
  { label: 'Beyaz', value: '#ffffff' },
  { label: 'Krem', value: '#fef9e7' },
  { label: 'Açık Mavi', value: '#e8f4f8' },
  { label: 'Açık Sarı', value: '#fffde7' },
  { label: 'Açık Yeşil', value: '#f1f8e9' },
  { label: 'Lavanta', value: '#f3e8ff' },
];

// ─── Zoom Levels ──────────────────────────────────────────────────────────────

export const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200] as const;
export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

// ─── Template Categories ──────────────────────────────────────────────────────

export const TEMPLATE_CATEGORY_LABELS: Record<string, string> = {
  math: 'Matematik',
  language: 'Dil',
  science: 'Fen',
  social: 'Sosyal',
  art: 'Sanat',
  custom: 'Özel',
};

export const TEMPLATE_CATEGORIES = Object.keys(TEMPLATE_CATEGORY_LABELS);

// ─── Default Editor Settings ──────────────────────────────────────────────────

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  autoSave: true,
  autoSaveIntervalMs: 2000,
};

// ─── Empty Worksheet Content ──────────────────────────────────────────────────

export const EMPTY_WORKSHEET_CONTENT: WorksheetContent = {
  blocks: [
    {
      id: 'block-1',
      type: 'heading',
      content: 'Çalışma Kağıdı Başlığı',
      headingLevel: 1,
    },
    {
      id: 'block-2',
      type: 'text',
      content: 'İçeriğinizi buraya ekleyin...',
    },
  ],
};

// ─── Built-in Templates ───────────────────────────────────────────────────────

export const BUILT_IN_TEMPLATES: WorksheetTemplate[] = [
  {
    id: 'tpl-math-basic',
    name: 'Temel Matematik',
    description: 'Dört işlem alıştırmaları için basit çalışma kağıdı',
    category: 'math',
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    content: {
      blocks: [
        {
          id: 'b1',
          type: 'heading',
          content: 'Matematik Alıştırmaları',
          headingLevel: 1,
        },
        {
          id: 'b2',
          type: 'text',
          content: 'Ad: ________________________  Tarih: ____________',
        },
        { id: 'b3', type: 'divider', content: '' },
        {
          id: 'b4',
          type: 'heading',
          content: 'Toplama ve Çıkarma',
          headingLevel: 2,
        },
        {
          id: 'b5',
          type: 'list',
          content: '',
          listItems: ['1) 15 + 27 = ____', '2) 43 - 18 = ____', '3) 36 + 45 = ____'],
        },
      ],
    },
  },
  {
    id: 'tpl-reading',
    name: 'Okuma Anlama',
    description: 'Metin okuma ve anlama soruları için şablon',
    category: 'language',
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    content: {
      blocks: [
        {
          id: 'b1',
          type: 'heading',
          content: 'Okuma Anlama Etkinliği',
          headingLevel: 1,
        },
        {
          id: 'b2',
          type: 'text',
          content: 'Ad: ________________________  Sınıf: ____________',
        },
        { id: 'b3', type: 'divider', content: '' },
        {
          id: 'b4',
          type: 'heading',
          content: 'Metin',
          headingLevel: 2,
        },
        {
          id: 'b5',
          type: 'text',
          content: 'Okuma metnini buraya yazın...',
        },
        { id: 'b6', type: 'divider', content: '' },
        {
          id: 'b7',
          type: 'heading',
          content: 'Sorular',
          headingLevel: 2,
        },
        {
          id: 'b8',
          type: 'list',
          content: '',
          listItems: [
            '1) Metnin ana konusu nedir?',
            '2) Metinde geçen önemli olaylar nelerdir?',
            '3) Metnin sonunda ne olmuştur?',
          ],
        },
      ],
    },
  },
  {
    id: 'tpl-science',
    name: 'Deney Raporu',
    description: 'Fen bilimleri deney raporu şablonu',
    category: 'science',
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    content: {
      blocks: [
        {
          id: 'b1',
          type: 'heading',
          content: 'Deney Raporu',
          headingLevel: 1,
        },
        {
          id: 'b2',
          type: 'text',
          content: 'Ad: ________________________  Tarih: ____________',
        },
        {
          id: 'b3',
          type: 'heading',
          content: 'Deneyin Adı',
          headingLevel: 2,
        },
        { id: 'b4', type: 'text', content: '________________________' },
        {
          id: 'b5',
          type: 'heading',
          content: 'Amaç',
          headingLevel: 2,
        },
        { id: 'b6', type: 'text', content: 'Deneyin amacını yazın...' },
        {
          id: 'b7',
          type: 'heading',
          content: 'Malzemeler',
          headingLevel: 2,
        },
        {
          id: 'b8',
          type: 'list',
          content: '',
          listItems: ['Malzeme 1', 'Malzeme 2', 'Malzeme 3'],
        },
        {
          id: 'b9',
          type: 'heading',
          content: 'Sonuç',
          headingLevel: 2,
        },
        { id: 'b10', type: 'text', content: 'Deney sonucunu yazın...' },
      ],
    },
  },
  {
    id: 'tpl-blank',
    name: 'Boş Şablon',
    description: 'Sıfırdan başlamak için boş çalışma kağıdı',
    category: 'custom',
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    content: {
      blocks: [
        {
          id: 'b1',
          type: 'heading',
          content: 'Başlık',
          headingLevel: 1,
        },
        { id: 'b2', type: 'text', content: '' },
      ],
    },
  },
];
