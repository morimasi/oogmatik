export { default as Settings } from './Settings';
export { default as promptBuilder } from './promptBuilder';
export * from './types';

export const DEFAULT_SETTINGS = {
  focusRules: ['buyuk-harf', 'kesme-isareti', 'noktalama', 'bitisik-ayri'] as (
    | 'buyuk-harf'
    | 'kesme-isareti'
    | 'noktalama'
    | 'bitisik-ayri'
  )[],
  exerciseCount: 15,
  taskCount: 6,
  showRuleHint: true,
  errorCorrectionMode: true,
  paragraphLength: 'orta' as const,
  includeAnswerKey: true,
  includeScenarioWriting: true,
  includeTestSection: true,
  includeBonusSection: true,
  layoutDensity: 'yogun' as const,
};
