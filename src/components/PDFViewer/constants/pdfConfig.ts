/**
 * PDFViewer Configuration Constants
 * Disleksi-dostu, erişilebilir, performanslı PDF viewer için konfigürasyon
 */

export const ZOOM_PRESETS = [
  { label: '%50', value: 0.5 },
  { label: '%75', value: 0.75 },
  { label: '%100', value: 1 },
  { label: '%125', value: 1.25 },
  { label: '%150', value: 1.5 },
  { label: '%200', value: 2 },
] as const;

export const FIT_MODES = ['page', 'width', 'height'] as const;
export type FitMode = (typeof FIT_MODES)[number];

export const ZOOM_MIN = 0.3;
export const ZOOM_MAX = 3;
export const ZOOM_STEP = 0.1;

/** Disleksi-dostu font seçenekleri */
export const DYSLEXIA_FONTS = {
  default: {
    label: 'Varsayılan',
    value: 'default',
    family: 'inherit',
    icon: 'fa-font',
  },
  OpenDyslexic: {
    label: 'OpenDyslexic',
    value: 'OpenDyslexic',
    family: '"OpenDyslexic", "Comic Sans MS", cursive',
    icon: 'fa-a',
  },
  ReadingFont: {
    label: 'Okuma Fontu',
    value: 'ReadingFont',
    family: '"Atkinson Hyperlegible", "Arial", sans-serif',
    icon: 'fa-text-height',
  },
} as const;
export type FontFamilyKey = keyof typeof DYSLEXIA_FONTS;

/** Yüksek kontrast renk temaları */
export const CONTRAST_THEMES = {
  default: {
    label: 'Varsayılan',
    bg: 'bg-slate-200/50',
    pageBg: '#ffffff',
    text: '#1e293b',
    icon: 'fa-circle-half-stroke',
  },
  highContrast: {
    label: 'Yüksek Kontrast',
    bg: 'bg-zinc-900',
    pageBg: '#000000',
    text: '#ffffff',
    icon: 'fa-adjust',
  },
  cream: {
    label: 'Krem (Disleksi)',
    bg: 'bg-amber-50',
    pageBg: '#fffde7',
    text: '#33280a',
    icon: 'fa-sun',
  },
  blue: {
    label: 'Mavi Ton',
    bg: 'bg-blue-50',
    pageBg: '#e8f0fe',
    text: '#0d1b4b',
    icon: 'fa-droplet',
  },
} as const;
export type ContrastTheme = keyof typeof CONTRAST_THEMES;

/** Satır aralığı presetleri */
export const LINE_HEIGHT_PRESETS = [
  { label: 'Normal (1.5)', value: 1.5 },
  { label: 'Geniş (1.8)', value: 1.8 },
  { label: 'Çok Geniş (2.2)', value: 2.2 },
  { label: 'Maksimum (2.8)', value: 2.8 },
] as const;

/** Harf aralığı presetleri */
export const LETTER_SPACING_PRESETS = [
  { label: 'Normal (0px)', value: 0 },
  { label: 'Geniş (1px)', value: 1 },
  { label: 'Çok Geniş (2px)', value: 2 },
  { label: 'Maksimum (3px)', value: 3 },
] as const;

/** Sayfa boyutları (A4, Letter, vb.) */
export const PAGE_SIZES = {
  A4: { width: 794, height: 1123, label: 'A4' },
  Letter: { width: 816, height: 1056, label: 'Letter (US)' },
  A3: { width: 1123, height: 1587, label: 'A3' },
} as const;
export type PageSize = keyof typeof PAGE_SIZES;

/** Klavye kısayolları */
export const KEYBOARD_SHORTCUTS = {
  PREV_PAGE: ['ArrowLeft', 'ArrowUp', 'PageUp'],
  NEXT_PAGE: ['ArrowRight', 'ArrowDown', 'PageDown', ' '],
  ZOOM_IN: ['+', '='],
  ZOOM_OUT: ['-'],
  FIRST_PAGE: ['Home'],
  LAST_PAGE: ['End'],
  FIT_PAGE: ['f', 'F'],
} as const;

/** Performans: Görünür sayfaların sayfa havuzu boyutu */
export const PAGE_POOL_SIZE = 5;

/** Render gecikme eşiği (ms) */
export const RENDER_DEBOUNCE_MS = 150;

/** Maksimum thumbnail sayısı (bellek optimizasyonu) */
export const MAX_THUMBNAILS = 50;

export const DEFAULT_DYSLEXIA_SETTINGS = {
  dyslexiaMode: false,
  fontFamily: 'default' as FontFamilyKey,
  highContrast: false,
  contrastTheme: 'default' as ContrastTheme,
  lineHeight: 1.5,
  letterSpacing: 0,
  fontSize: 16,
} as const;

export const DEFAULT_VIEWER_SETTINGS = {
  zoom: 1,
  fitMode: 'page' as FitMode,
  currentPage: 1,
  showControls: true,
  showThumbnails: false,
  showAnnotations: false,
  darkMode: false,
} as const;
