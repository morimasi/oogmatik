// Math Studio — A4 & Layout Constants

// A4 Portrait dimensions in pixels (96dpi)
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

// Page structure heights (px)
export const HEADER_HEIGHT = 52;
export const FOOTER_HEIGHT = 32;

// Default margins (mm → approx px)
export const DEFAULT_MARGIN = {
  top: 45, // ~12mm
  side: 38, // ~10mm
  bottom: 30, // ~8mm
};

// Layout constraints
export const COLS_MIN = 1;
export const COLS_MAX = 8;
export const COUNT_MIN = 1;
export const COUNT_MAX = 200;
export const FONT_SIZE_MIN = 14;
export const FONT_SIZE_MAX = 48;

// Default drill config
export const DEFAULT_DRILL_CONFIG = {
  selectedOperations: ['add'] as string[],
  digit1: 2,
  digit2: 1,
  digit3: 1,
  count: 24, // Optimized default for A4
  cols: 4,
  gap: 12,
  allowCarry: true,
  allowBorrow: true,
  allowRemainder: false,
  allowNegative: false,
  useThirdNumber: false,
  showTextRepresentation: false,
  autoFillPage: true,
  orientation: 'vertical' as const,
  showAnswer: false,
  fontSize: 28, // Slighly larger premium default
};

// Default problem config
export const DEFAULT_PROBLEM_CONFIG = {
  topic: 'Uzay Yolculuğu',
  count: 4,
  includeSolutionBox: true,
  studentName: '',
  difficulty: 'Orta',
  selectedOperations: ['add', 'sub'] as string[],
  numberRange: '1-20',
  problemStyle: 'simple' as const,
  complexity: '1-step' as const,
  problemTypes: ['standard'] as ('standard' | 'fill-in' | 'true-false' | 'comparison')[],
  generateImages: false,
};

// Default page config
export const DEFAULT_PAGE_CONFIG = {
  paperType: 'blank' as const,
  gridSize: 20,
  margin: 38,
  showDate: true,
  showName: true,
  title: 'MATEMATİK ÇALIŞMASI',
};

// --- THEME SYSTEM ---

export type PaperTheme = 'classic' | 'pastel-yellow' | 'pastel-blue' | 'sepia' | 'karne';
export type FontTheme = 'standard' | 'dyslexic' | 'handwritten';
export type BorderStyle = 'none' | 'thin' | 'thick' | 'rounded';
export type NumberingStyle = 'numeric' | 'alpha' | 'roman' | 'none';

export interface ThemeConfig {
  paperTheme: PaperTheme;
  fontTheme: FontTheme;
  borderStyle: BorderStyle;
  numberingStyle: NumberingStyle;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  paperTheme: 'classic',
  fontTheme: 'standard',
  borderStyle: 'none',
  numberingStyle: 'numeric',
};

export const PAPER_THEMES: Record<
  PaperTheme,
  { 
    label: string; 
    bg: string; 
    border: string; 
    text: string; 
    accent: string;
    secondary: string;
    patternOpacity: number;
    seal?: boolean;
  }
> = {
  classic: { 
    label: 'Klasik', 
    bg: '#ffffff', 
    border: '#000000', 
    text: '#000000', 
    accent: '#3b82f6', 
    secondary: '#f1f5f9',
    patternOpacity: 0.1 
  },
  'pastel-yellow': { 
    label: 'Pastel Sarı', 
    bg: '#fdfce8', 
    border: '#a16207', 
    text: '#422006', 
    accent: '#eab308', 
    secondary: '#fef9c3',
    patternOpacity: 0.2 
  },
  'pastel-blue': { 
    label: 'Pastel Mavi', 
    bg: '#eff6ff', 
    border: '#1e40af', 
    text: '#172554', 
    accent: '#3b82f6', 
    secondary: '#dbeafe',
    patternOpacity: 0.15 
  },
  sepia: { 
    label: 'Sepia', 
    bg: '#faf5f0', 
    border: '#78350f', 
    text: '#451a03', 
    accent: '#b45309', 
    secondary: '#f3e8d2',
    patternOpacity: 0.3 
  },
  karne: { 
    label: 'Karne', 
    bg: '#ffffff', 
    border: '#1e293b', 
    text: '#0f172a', 
    accent: '#e11d48', 
    secondary: '#f1f5f9',
    patternOpacity: 0.05,
    seal: true 
  },
};

export const FONT_THEMES: Record<FontTheme, { label: string; fontFamily: string; icon: string }> = {
  standard: { 
    label: 'Standart', 
    fontFamily: "'Lexend', 'Inter', sans-serif", 
    icon: 'fa-font' 
  },
  dyslexic: {
    label: 'Disleksi Dostu',
    fontFamily: "'Lexend', 'OpenDyslexic', sans-serif",
    icon: 'fa-universal-access',
  },
  handwritten: { 
    label: 'El Yazısı', 
    fontFamily: "'Caveat', 'Dancing Script', cursive", 
    icon: 'fa-pen-fancy' 
  },
};

export const BORDER_STYLES: Record<BorderStyle, { label: string; css: string; radius?: string }> = {
  none: { label: 'Yok', css: 'none' },
  thin: { label: 'İnce', css: '1px solid', radius: '0.25rem' },
  thick: { label: 'Kalın', css: '2px solid', radius: '0.4rem' },
  rounded: { label: 'Yuvarlak', css: '2px dashed', radius: '1.25rem' },
};

export const NUMBERING_STYLES: Record<
  NumberingStyle,
  { label: string; format: (n: number) => string }
> = {
  numeric: { label: '1, 2, 3...', format: (n) => `${n}` },
  alpha: { label: 'A, B, C...', format: (n) => String.fromCharCode(64 + n) },
  roman: {
    label: 'I, II, III...',
    format: (n) =>
      [
        '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
        'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'
      ][n] || `${n}`,
  },
  none: { label: 'Yok', format: () => '' },
};
