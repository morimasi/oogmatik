import type { Difficulty } from '@/types/activityStudio';

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((x) => {
    const normalized = x / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(fg: string, bg: string): number {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function isAccessibleContrast(ratio: number, level: 'AA' | 'AAA' = 'AAA'): boolean {
  const threshold = level === 'AAA' ? 7.0 : 4.5;
  return ratio >= threshold;
}

export function ensureReadableTextColor(
  textColor: string,
  bgColor: string,
  minRatio: number = 7.0
): string {
  let adjustedColor = textColor;
  const initialRatio = getContrastRatio(adjustedColor, bgColor);

  if (initialRatio >= minRatio) return adjustedColor;
  if (getContrastRatio('#000000', bgColor) >= minRatio) return '#000000';
  if (getContrastRatio('#FFFFFF', bgColor) >= minRatio) return '#FFFFFF';

  const bgRgb = hexToRgb(bgColor);
  if (!bgRgb) return textColor;

  const bgLum = (bgRgb.r + bgRgb.g + bgRgb.b) / 3;
  adjustedColor = bgLum > 128 ? '#1A1A2E' : '#FFFFFF';
  return adjustedColor;
}

export function isDarkBackground(bgColor: string): boolean {
  const lum = getLuminance(bgColor);
  return lum < 0.5;
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
  const textColor = ensureReadableTextColor('#1A1A2E', bgColor, 7.0);

  if (safeOutput.configuration && typeof safeOutput.configuration === 'object') {
    const config = safeOutput.configuration as Record<string, unknown>;
    config.backgroundColor = bgColor;
    config.textColor = textColor;
    config.theme = getDifficultyColorTheme(difficulty);
  }

  return safeOutput;
}
