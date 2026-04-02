export interface YazimNoktalamaSettings {
  focusRules: ('buyuk-harf' | 'kesme-isareti' | 'noktalama' | 'bitisik-ayri')[];
  exerciseCount: number;
  taskCount: number;
  showRuleHint: boolean;
  errorCorrectionMode: boolean;
  paragraphLength: 'kisa' | 'orta' | 'uzun';
  includeAnswerKey: boolean;
  includeScenarioWriting: boolean;
  includeTestSection: boolean;
  includeBonusSection: boolean;
  layoutDensity: 'standart' | 'yogun' | 'ultra-yogun';
}
