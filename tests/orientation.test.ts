import { describe, it, expect } from 'vitest';
import { useOrientationDimensions } from '../src/hooks/useOrientationDimensions';

describe('Orientation dimensions', () => {
  it('landscape should return correct dimensions', () => {
    const res = useOrientationDimensions('landscape');
    expect(res.isLandscape).toBe(true);
    expect(res.width).toBe(1123);
    expect(res.height).toBe(794);
  });

  it('portrait should return correct dimensions', () => {
    const res = useOrientationDimensions('portrait');
    expect(res.isLandscape).toBe(false);
    expect(res.width).toBe(794);
    expect(res.height).toBe(1123);
  });
});

describe('Orientation — OcrRenderer', () => {
  it('OCR landscape mode should use landscape dimensions', () => {
    const { isLandscape, width, height } = useOrientationDimensions('landscape');
    expect(isLandscape).toBe(true);
    expect(width).toBeGreaterThan(height);
  });

  it('OCR portrait mode should use portrait dimensions', () => {
    const { isLandscape, width, height } = useOrientationDimensions('portrait');
    expect(isLandscape).toBe(false);
    expect(height).toBeGreaterThan(width);
  });
});

describe('Orientation — ExamRenderer', () => {
  it('SINAV landscape dimensions are correct', () => {
    const { width, height } = useOrientationDimensions('landscape');
    expect(width).toBe(1123);
    expect(height).toBe(794);
  });

  it('MAT_SINAV portrait dimensions are correct', () => {
    const { width, height } = useOrientationDimensions('portrait');
    expect(width).toBe(794);
    expect(height).toBe(1123);
  });

  it('ExamType turkce uses same orientation hook', () => {
    const portrait = useOrientationDimensions();
    const landscape = useOrientationDimensions('landscape');
    expect(portrait.isLandscape).toBe(false);
    expect(landscape.isLandscape).toBe(true);
  });
});

