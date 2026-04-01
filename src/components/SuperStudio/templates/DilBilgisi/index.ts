export { default as Settings } from './Settings';
export { default as promptBuilder } from './promptBuilder';
export * from './types';

export const DEFAULT_SETTINGS = {
  targetDistractors: 'b-d',
  gridSize: '5x5',
  syllableSimulation: true,
  camouflageGrid: true,
  hintBox: true,
  questionCount: 10,
  taskCount: 6,
  wordCount: 15,
  includeAnswerKey: true,
  includeWordChain: true,
  includeErrorDetective: true,
  includeBonusSection: true,
  layoutDensity: 'yogun' as const,
};
