import { describe, expect, it } from 'vitest';
import { getTurkishDifficultyLabel, getTurkishQuestionLabel } from '../src/utils/turkishDisplay';

describe('getTurkishQuestionLabel', () => {
  it('maps all six 5N1K keys to Turkish display labels', () => {
    expect(['who', 'what', 'where', 'when', 'why', 'how'].map(getTurkishQuestionLabel)).toEqual([
      'Kim?',
      'Ne?',
      'Nerede?',
      'Ne zaman?',
      'Neden?',
      'Nasıl?',
    ]);
  });

  it('does not expose unknown or English enum values to learners', () => {
    expect(getTurkishQuestionLabel('unknown_question')).toBe('Soru');
    expect(getTurkishQuestionLabel(undefined)).toBe('Soru');
  });
});

describe('getTurkishDifficultyLabel', () => {
  it('maps persisted English levels without changing their stored identifiers', () => {
    expect(['Easy', 'Medium', 'Hard'].map(getTurkishDifficultyLabel)).toEqual([
      'Kolay',
      'Orta',
      'Zor',
    ]);
  });

  it('keeps Turkish levels and uses a safe default for unknown values', () => {
    expect(getTurkishDifficultyLabel('Kolay')).toBe('Kolay');
    expect(getTurkishDifficultyLabel('unmapped-level')).toBe('Orta');
  });
});
