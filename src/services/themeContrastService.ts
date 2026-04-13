import type { Difficulty } from '@/types/activityStudio';

const WCAG_AA_CONTRAST_RATIO = 4.5;

/**
 * Basit hex rengi to RGB dönüştürü
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
};

/**
 * Rengin parlaklığını hesapla (0-1)
 */
const getLuminance = (rgb: { r: number; g: number; b: number }): number => {
  const { r, g, b } = rgb;
  const luminanceValues = [r, g, b].map((v) => {
    const normalized = v / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * luminanceValues[0] + 0.7152 * luminanceValues[1] + 0.0722 * luminanceValues[2];
};

/**
 * İki renk arasının kontrast oranını hesapla
 */
const getContrastRatio = (rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number => {
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Safe kontrast text rengini döndür (tema ve arka plan için)
 */
export function ensureReadableTextColor(
  backgroundColor: string,
  preferredColor: string = '#ffffff',
  fallbackLight: string = '#ffffff',
  fallbackDark: string = '#000000'
): string {
  const bgRgb = hexToRgb(backgroundColor);
  const preferredRgb = hexToRgb(preferredColor);

  if (!bgRgb) return preferredColor;
  if (!preferredRgb) return preferredColor;

  const contrastRatio = getContrastRatio(bgRgb, preferredRgb);

  if (contrastRatio >= WCAG_AA_CONTRAST_RATIO) {
    return preferredColor;
  }

  const fallbackLightRgb = hexToRgb(fallbackLight);
  const fallbackDarkRgb = hexToRgb(fallbackDark);

  if (!fallbackLightRgb || !fallbackDarkRgb) return preferredColor;

  const lightContrast = getContrastRatio(bgRgb, fallbackLightRgb);
  const darkContrast = getContrastRatio(bgRgb, fallbackDarkRgb);

  return lightContrast > darkContrast ? fallbackLight : fallbackDark;
}

/**
 * Difficulty seviyesine göre renk temasını al
 */
export function getDifficultyColorTheme(
  difficulty: Difficulty
): {
  bg: string;
  text: string;
  accent: string;
} {
  switch (difficulty) {
    case 'Kolay':
      return { bg: '#d4f5d4', text: '#1b5e20', accent: '#388e3c' };
    case 'Orta':
      return { bg: '#fff3cd', text: '#856404', accent: '#ffc107' };
    case 'Zor':
      return { bg: '#f8d7da', text: '#721c24', accent: '#dc3545' };
    default:
      return { bg: '#e9ecef', text: '#495057', accent: '#6c757d' };
  }
}

/**
 * Tema token'larını resolve et veya fallback
 */
export function resolveThemeToken(tokenName: string): string {
  const cssRoot = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;

  if (cssRoot) {
    const value = cssRoot.getPropertyValue(`--${tokenName}`).trim();
    if (value) return value;
  }

  const fallbacks: Record<string, string> = {
    'accent-color': '#007bff',
    'surface-primary': '#ffffff',
    'surface-secondary': '#f8f9fa',
    'text-primary': '#212529',
    'text-secondary': '#6c757d',
    'border-color': '#dee2e6',
  };

  return fallbacks[tokenName] || '#cccccc';
}

/**
 * Activity Studio çıktısı için kontrast güvenliğini sağla
 */
export function applyContrastSafety(
  activityOutput: Record<string, unknown>,
  bgColor: string = '#ffffff',
  difficulty: Difficulty = 'Orta'
): Record<string, unknown> {
  const safeOutput = { ...activityOutput };
  const textColor = ensureReadableTextColor(bgColor);

  if (safeOutput.configuration && typeof safeOutput.configuration === 'object') {
    const config = safeOutput.configuration as Record<string, any>;
    config.backgroundColor = bgColor;
    config.textColor = textColor;
    config.theme = getDifficultyColorTheme(difficulty);
  }

  return safeOutput;
}
