import { describe, expect, it } from 'vitest';
import { runClinicalValidation } from '../../src/components/ActivityStudio/validation/clinicalValidator';

describe('clinicalValidator', () => {
  it('tani koyucu dili yakalar', () => {
    const result = runClinicalValidation('Bu ogrencinin disleksisi var ve DEHB var.');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('kvkk birlikte gorunme ihlalini yakalar', () => {
    const result = runClinicalValidation('Ahmet Yilmaz disleksisi var ve skor: 92.');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('KVKK'))).toBe(true);
  });
});
