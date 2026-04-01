export { default as Settings } from './Settings';
export { default as promptBuilder } from './promptBuilder';
export * from './types';

export const DEFAULT_SETTINGS = {
  storyDiceCount: 4,
  clozeFormat: 'fiil' as const,
  emotionRadar: true,
  minSentences: 6,
  questionCount: 8,
  taskCount: 6,
  writingPrompts: 4,
  includeWordBank: true,
  includeStoryMap: true,
  includePeerReview: true,
  includeAnswerKey: true,
  includeBonusSection: true,
  layoutDensity: 'yogun' as const,
};
