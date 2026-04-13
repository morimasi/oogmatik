import { describe, expect, it } from 'vitest';
import { validateContentQuality } from '../../src/components/ActivityStudio/validation/contentValidator';

describe('contentValidator', () => {
  it('eksik alanlarda fail doner', () => {
    const result = validateContentQuality({
      title: 'x',
      scenario: 'kisa',
      materials: [],
      steps: [],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('minimum kosullar saglaninca valid doner', () => {
    const result = validateContentQuality({
      title: 'Hece atolyesi',
      scenario: 'Bu senaryo ogrencinin fonolojik farkindalik becerisini desteklemek icin kademeli adimlar sunar.',
      materials: ['kalem'],
      steps: ['isindirici alistirma'],
    });

    expect(result.valid).toBe(true);
  });
});
