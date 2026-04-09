// tests/shapeCounting.test.ts
import { describe, it, expect } from 'vitest';
import { generateShapeCountingFromAI } from '../src/services/generators/mathGeometry';

describe('ShapeCounting generator', () => {
  it('should respect targetShape option', async () => {
    const options = {
      difficulty: 'Kolay',
      itemCount: 30,
      targetShape: 'circle',
      variant: 'mixed',
      overlapping: false,
      aestheticMode: 'glassmorphism',
      layout: 'single',
    } as any;
    const result = await generateShapeCountingFromAI(options);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].settings?.targetShape).toBe('circle');
  });
});
