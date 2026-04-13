import { describe, expect, it } from 'vitest';
import { validatePedagogicRules } from '../../src/components/ActivityStudio/validation/pedagogicValidator';

describe('pedagogicValidator', () => {
  it('pedagogicalNote kisa ise fail doner', () => {
    const result = validatePedagogicRules({
      ageGroup: '8-10',
      difficulty: 'Orta',
      targetSkills: ['okuma', 'dikkat'],
      pedagogicalNote: 'kisa',
      itemDifficulties: ['Kolay', 'Kolay', 'Orta'],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('pedagogicalNote'))).toBe(true);
  });

  it('ilk iki madde kolay degilse fail doner', () => {
    const result = validatePedagogicRules({
      ageGroup: '11-13',
      difficulty: 'Orta',
      targetSkills: ['okuma', 'dikkat'],
      pedagogicalNote: 'Bu etkinlik fonolojik farkindalik ve dikkat becerilerini gelistirmek icin tasarlandi.',
      itemDifficulties: ['Orta', 'Kolay', 'Zor'],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Ilk 2 madde'))).toBe(true);
  });

  it('kurallar saglaninca valid doner', () => {
    const result = validatePedagogicRules({
      ageGroup: '11-13',
      difficulty: 'Orta',
      targetSkills: ['okuma', 'dikkat'],
      pedagogicalNote: 'Bu etkinlik fonolojik farkindalik ve dikkat becerilerini guvenli bir zorluk artisiyla desteklemek icin tasarlandi.',
      itemDifficulties: ['Kolay', 'Kolay', 'Orta'],
    });

    expect(result.valid).toBe(true);
  });
});
