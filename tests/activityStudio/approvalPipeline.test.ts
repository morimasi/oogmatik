import { describe, it, expect } from 'vitest';
import { detectDiagnosticLanguage } from '@/components/ActivityStudio/validation/clinicalValidator';

describe('activity studio approval pipeline', () => {
  it('tani koyucu dili yakalar', () => {
    const violations = detectDiagnosticLanguage('Bu ogrencinin disleksisi var.');
    expect(violations.length).toBeGreaterThan(0);
  });
});
