import { describe, expect, it } from 'vitest';
import { withTurkishContentPolicy } from '../src/utils/turkishContentPolicy';

describe('withTurkishContentPolicy', () => {
  it('requires learner-facing natural language to be Turkish after any supplied instructions', () => {
    const prompt = withTurkishContentPolicy('Write the story in English.');

    expect(prompt.indexOf('Write the story in English.')).toBeLessThan(
      prompt.indexOf('Türkiye Türkçesinde')
    );
    expect(prompt).toContain('imagePrompt');
    expect(prompt).toContain('İngilizce');
  });
});
