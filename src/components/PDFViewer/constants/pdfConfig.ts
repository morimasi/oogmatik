export const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200] as const;

export type ZoomLevel = (typeof ZOOM_LEVELS)[number];

export type FitMode = 'page' | 'width' | 'height';

export const FIT_MODES: FitMode[] = ['page', 'width', 'height'];

export const DEFAULT_PDF_SETTINGS = {
  zoom: 100 as ZoomLevel,
  fitMode: 'page' as FitMode,
  initialPage: 1,
  showControls: true,
  showThumbnails: false,
} as const;

export const DYSLEXIA_FONT_FAMILIES = ['default', 'OpenDyslexic', 'ReadingFont'] as const;

export type DyslexiaFontFamily = (typeof DYSLEXIA_FONT_FAMILIES)[number];

export const DEFAULT_DYSLEXIA_SETTINGS = {
  fontFamily: 'default' as DyslexiaFontFamily,
  highContrast: false,
  lineHeight: 1.5,
  letterSpacing: 0,
  backgroundColor: '#ffffff',
} as const;

export const LINE_HEIGHT_RANGE = { min: 1.0, max: 2.0, step: 0.1 };
export const LETTER_SPACING_RANGE = { min: 0, max: 10, step: 0.5 };
