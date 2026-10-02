import { describe, expect, it } from 'vitest';
import { findLikelyEnglishUserFacingText } from '../src/utils/turkishOutputValidation';

describe('findLikelyEnglishUserFacingText', () => {
  it('finds English in learner-facing strings nested in generated results', () => {
    const result: unknown = {
      title: 'The fox is looking for a friend in the forest.',
      items: [{ question: 'Why did the fox leave the house?' }],
      imagePrompt: 'A fox in a forest, watercolor illustration',
    };

    expect(findLikelyEnglishUserFacingText(result)).toEqual([
      'title',
      'items[0].question',
    ]);
  });

  it('checks localized API field names used by the exam generator', () => {
    const result: unknown = {
      baslik: 'A reading test is for the students.',
      sorular: [{ soruMetni: 'What is the main idea of the passage?' }],
    };

    expect(findLikelyEnglishUserFacingText(result)).toEqual([
      'baslik',
      'sorular[0].soruMetni',
    ]);
  });

  it('checks localized snake-case fields and multiple-choice options', () => {
    const result: unknown = {
      questions: [{
        soru_metni: 'What is the total number of apples in the basket?',
        secenekler: {
          A: 'There are twelve apples in the basket.',
        },
      }],
    };

    expect(findLikelyEnglishUserFacingText(result)).toEqual([
      'questions[0].soru_metni',
      'questions[0].secenekler.A',
    ]);
  });

  it('checks natural-language fields in generated advertisement results', () => {
    const result: unknown = {
      script: 'Our platform helps every child learn through personalized practice.',
      scenes: [{
        voiceover: 'Every student can succeed with the right support.',
        textOverlay: 'Learn at your own pace as you grow',
        sceneVisual: '<svg><text>This is the best way to learn with your child</text></svg>',
      }],
      sceneVisuals: {
        '1': '<svg><text>This is the best way to learn with your child</text></svg>',
      },
      imagePrompt: 'A colorful classroom illustration',
    };

    expect(findLikelyEnglishUserFacingText(result)).toEqual([
      'script',
      'scenes[0].voiceover',
      'scenes[0].textOverlay',
      'scenes[0].sceneVisual',
      'sceneVisuals.1',
    ]);
  });

  it('accepts Turkish content and leaves technical identifiers untouched', () => {
    const result: unknown = {
      title: 'Ormandaki küçük tilki yeni bir arkadaş arıyor.',
      activityType: 'STORY_COMPREHENSION',
      difficultyLevel: 'Medium',
      id: 'worksheet-123',
      imagePrompt: 'A fox in a forest, watercolor illustration',
    };

    expect(findLikelyEnglishUserFacingText(result)).toEqual([]);
  });

  it('does not inspect unknown fields or short enum labels as prose', () => {
    const result: unknown = {
      metadata: { title: 'The story is ready for your class.' },
      title: 'Easy',
    };

    expect(findLikelyEnglishUserFacingText(result)).toEqual([]);
  });
});
