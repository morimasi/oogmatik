import { describe, it, expect } from 'vitest';
import { generateSemanticLinkerOffline } from '../src/modules/activities/semantic-linker/generators';

describe('SEMANTIC_LINKER offline generator tests', () => {
  it('generates requested count with valid structure', () => {
    const data = generateSemanticLinkerOffline(6);
    expect(data.title).toBe('Anlamsal İlişki Kurma');
    expect(data.instruction).toBeTruthy();
    expect(data.pedagogicalNote).toBeTruthy();
    expect(data.items).toHaveLength(6);

    for (const item of data.items) {
      expect(item.id).toBeTruthy();
      expect(item.targetWord).toBeTruthy();
      expect(typeof item.isNegated).toBe('boolean');
      expect(item.options).toHaveLength(3);
      expect(item.correctAnswerId).toBeTruthy();

      const correctOptions = item.options.filter((o) => o.isCorrect);
      expect(correctOptions).toHaveLength(1);
      expect(correctOptions[0].id).toBe(item.correctAnswerId);
    }
  });

  it('contains both positive and negated relation items', () => {
    const data = generateSemanticLinkerOffline(10);
    const positiveItems = data.items.filter((i) => !i.isNegated);
    const negatedItems = data.items.filter((i) => i.isNegated);

    expect(positiveItems.length).toBeGreaterThan(0);
    expect(negatedItems.length).toBeGreaterThan(0);
  });
});
