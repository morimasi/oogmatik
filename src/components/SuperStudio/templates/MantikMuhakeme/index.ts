export { default as Settings } from './Settings';
export { default as promptBuilder } from './promptBuilder';
export * from './types';

export const DEFAULT_SETTINGS = {
  sequenceSteps: 5,
  matrixSize: '4x4',
  logicMatrix: true,
  detailDetective: true,
  storyComplexity: 'Orta' as const,
  questionCount: 10,
  taskCount: 6,
  includePatternCompletion: true,
  includeCausalReasoning: true,
  includeAnswerKey: true,
  includeBonusSection: true,
  layoutDensity: 'yogun' as const,
};
