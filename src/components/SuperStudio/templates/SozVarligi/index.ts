export { default as Settings } from './Settings';
export { default as promptBuilder } from './promptBuilder';
export * from './types';

export const DEFAULT_SETTINGS = {
  itemTypes: ['deyim', 'atasozu', 'mecaz'] as ('deyim' | 'atasozu' | 'mecaz')[],
  count: 12,
  taskCount: 6,
  visualAnalogy: true,
  contextualUsage: true,
  includeMatching: true,
  includeSentenceCreation: true,
  includeScenarioSection: true,
  includeAnswerKey: true,
  includeBonusSection: true,
  layoutDensity: 'yogun' as const,
};
