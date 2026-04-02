export { default as Settings } from './Settings';
export { default as promptBuilder } from './promptBuilder';
export * from './types';

export const DEFAULT_SETTINGS = {
  cognitiveLoadLimit: 10,
  chunkingEnabled: true,
  visualScaffolding: true,
  typographicHighlight: true,
  mindMap5N1K: true,
  questionCount: 8,
  taskCount: 6,
  readingLength: 'orta' as const,
  questionTypes: ['coktan-secmeli', 'bosluk-doldurma', 'dogru-yanlis'] as (
    | 'coktan-secmeli'
    | 'bosluk-doldurma'
    | 'dogru-yanlis'
    | 'acik-uc'
    | 'eslestirme'
  )[],
  includeAnswerKey: true,
  includeWordWork: true,
  includeDetectiveTask: true,
  includeBonusSection: true,
  layoutDensity: 'yogun' as const,
};
