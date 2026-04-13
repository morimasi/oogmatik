import { describe, it, expect } from 'vitest';
import {
  getContrastRatio,
  isAccessibleContrast,
  ensureReadableTextColor,
  isDarkBackground,
  hexToRgb,
} from '@/services/themeContrastService';

describe('themeContrastService', () => {
  it('converts hex to rgb', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('bad')).toBeNull();
  });

  it('calculates contrast ratio between two colors', () => {
    const ratio = getContrastRatio('#FFFFFF', '#000000');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('validates WCAG AAA 7:1 minimum', () => {
    expect(isAccessibleContrast(7.1, 'AAA')).toBe(true);
    expect(isAccessibleContrast(6.9, 'AAA')).toBe(false);
  });

  it('validates WCAG AA 4.5:1', () => {
    expect(isAccessibleContrast(4.5, 'AA')).toBe(true);
    expect(isAccessibleContrast(4.4, 'AA')).toBe(false);
  });

  it('auto-fixes low contrast text color', () => {
    const fixed = ensureReadableTextColor('#CCCCCC', '#CCCCCC', 7.0);
    const fixedRatio = getContrastRatio(fixed, '#CCCCCC');
    expect(fixedRatio).toBeGreaterThanOrEqual(7.0);
  });

  it('detects dark background', () => {
    expect(isDarkBackground('#000000')).toBe(true);
    expect(isDarkBackground('#FFFFFF')).toBe(false);
  });
});
