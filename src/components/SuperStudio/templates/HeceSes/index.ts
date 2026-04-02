export { default as Settings } from './Settings';
export { default as promptBuilder } from './promptBuilder';
export * from './types';

export const DEFAULT_SETTINGS = {
  focusEvents: ['heceleme', 'yumusama', 'sertlesme', 'ses-dusmesi'] as (
    | 'heceleme'
    | 'yumusama'
    | 'sertlesme'
    | 'ses-dusmesi'
  )[],
  wordCount: 20,
  taskCount: 6,
  syllableHighlight: true,
  multisensorySupport: true,
  includeSyllableCounting: true,
  includeWordBuilding: true,
  includeSoundDetection: true,
  includeAnswerKey: true,
  includeBonusSection: true,
  layoutDensity: 'yogun' as const,
};
