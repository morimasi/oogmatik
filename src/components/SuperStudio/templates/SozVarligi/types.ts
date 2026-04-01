export interface SozVarligiSettings {
  itemTypes: ('deyim' | 'atasozu' | 'mecaz')[];
  count: number;
  taskCount: number;
  visualAnalogy: boolean;
  contextualUsage: boolean;
  includeMatching: boolean;
  includeSentenceCreation: boolean;
  includeScenarioSection: boolean;
  includeAnswerKey: boolean;
  includeBonusSection: boolean;
  layoutDensity: 'standart' | 'yogun' | 'ultra-yogun';
}
