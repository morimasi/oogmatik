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
