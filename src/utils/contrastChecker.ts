// src/utils/contrastChecker.ts
// WCAG 2.1 Contrast Ratio Checker - AAA Compliance
// Ensures dyslexia-friendly color combinations

/**
 * Convert HSL to RGB
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
}

/**
 * Get relative luminance of an RGB color
 * Formula: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * @returns Contrast ratio (1:1 to 21:1)
 *
 * WCAG 2.1 Standards:
 * - Level AA: Normal text ≥ 4.5:1, Large text ≥ 3:1
 * - Level AAA: Normal text ≥ 7:1, Large text ≥ 4.5:1
 */
export function getContrastRatio(
  color1: [number, number, number],
  color2: [number, number, number]
): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG standards
 */
export interface ContrastCheck {
  ratio: number;
  passAA: boolean;
  passAAA: boolean;
  passAALarge: boolean;
  passAAALarge: boolean;
}

export function checkContrast(
  foreground: [number, number, number],
  background: [number, number, number]
): ContrastCheck {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio,
    passAA: ratio >= 4.5,
    passAAA: ratio >= 7,
    passAALarge: ratio >= 3,
    passAAALarge: ratio >= 4.5,
  };
}

/**
 * Parse CSS color variable to RGB
 */
export function getCSSVariableRGB(varName: string): [number, number, number] | null {
  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue(varName).trim();

  // Handle HSL format: "240 5% 10%"
  if (value.includes('%')) {
    const [h, s, l] = value
      .split(/\s+/)
      .map((v) => parseFloat(v.replace('%', '')));
    return hslToRgb(h, s, l);
  }

  // Handle hex format
  if (value.startsWith('#')) {
    return hexToRgb(value);
  }

  // Handle RGB format: "rgb(255, 255, 255)"
  const rgbMatch = value.match(/\d+/g);
  if (rgbMatch && rgbMatch.length === 3) {
    return [parseInt(rgbMatch[0]), parseInt(rgbMatch[1]), parseInt(rgbMatch[2])];
  }

  return null;
}

/**
 * Validate theme contrast compliance
 */
export interface ThemeContrastResult {
  valid: boolean;
  ratio: number;
  level: 'AAA' | 'AA' | 'Fail';
  warnings: string[];
  recommendations: string[];
}

export function validateThemeContrast(): ThemeContrastResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Get text and background colors from CSS variables
  const textRgb = getCSSVariableRGB('--text-primary');
  const bgRgb = getCSSVariableRGB('--panel-bg-solid');

  if (!textRgb || !bgRgb) {
    return {
      valid: false,
      ratio: 1,
      level: 'Fail',
      warnings: ['Could not read theme colors'],
      recommendations: ['Check CSS variable definitions'],
    };
  }

  const check = checkContrast(textRgb, bgRgb);
  const ratio = check.ratio;

  // Determine compliance level
  let level: 'AAA' | 'AA' | 'Fail';
  if (check.passAAA) {
    level = 'AAA';
  } else if (check.passAA) {
    level = 'AA';
    warnings.push(`Contrast ratio ${ratio.toFixed(2)}:1 meets AA but not AAA standard`);
    recommendations.push('Increase text darkness or lighten background for AAA compliance');
  } else {
    level = 'Fail';
    warnings.push(`Contrast ratio ${ratio.toFixed(2)}:1 fails WCAG standards`);
    recommendations.push('Text color must have at least 4.5:1 contrast with background');
  }

  return {
    valid: check.passAAA,
    ratio,
    level,
    warnings,
    recommendations,
  };
}

/**
 * Auto-adjust color for better contrast
 * @param foreground Current foreground color
 * @param background Background color
 * @param targetRatio Desired contrast ratio (default: 7 for AAA)
 * @returns Adjusted foreground color
 */
export function adjustForContrast(
  foreground: [number, number, number],
  background: [number, number, number],
  targetRatio: number = 7
): [number, number, number] {
  let [r, g, b] = foreground;
  const bgLuminance = getLuminance(background);

  // Determine if we need lighter or darker text
  const shouldBeLighter = bgLuminance < 0.5;

  let iterations = 0;
  const maxIterations = 50;

  while (iterations < maxIterations) {
    const currentRatio = getContrastRatio([r, g, b], background);

    if (currentRatio >= targetRatio) {
      break;
    }

    // Adjust brightness
    if (shouldBeLighter) {
      r = Math.min(255, r + 5);
      g = Math.min(255, g + 5);
      b = Math.min(255, b + 5);
    } else {
      r = Math.max(0, r - 5);
      g = Math.max(0, g - 5);
      b = Math.max(0, b - 5);
    }

    iterations++;
  }

  return [r, g, b];
}

/**
 * Check if color is suitable for dyslexia-friendly design
 * British Dyslexia Association recommends:
 * - Cream/beige backgrounds
 * - Dark blue or black text
 * - Avoid pure white backgrounds
 * - Avoid red/green combinations
 */
export function isDyslexiaFriendly(
  foreground: [number, number, number],
  background: [number, number, number]
): { friendly: boolean; issues: string[] } {
  const issues: string[] = [];
  const bgLuminance = getLuminance(background);

  // Check if background is pure white
  if (background[0] === 255 && background[1] === 255 && background[2] === 255) {
    issues.push('Pure white background not recommended for dyslexia');
  }

  // Check if background is too bright
  if (bgLuminance > 0.9) {
    issues.push('Background is too bright - consider cream/beige tones');
  }

  // Check contrast
  const ratio = getContrastRatio(foreground, background);
  if (ratio < 7) {
    issues.push(`Low contrast ratio (${ratio.toFixed(2)}:1) - AAA requires 7:1`);
  }

  return {
    friendly: issues.length === 0,
    issues,
  };
}
