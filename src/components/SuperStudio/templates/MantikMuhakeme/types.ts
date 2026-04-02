export interface MantikMuhakemeSettings {
  sequenceSteps: number;
  logicMatrix: boolean;
  matrixSize: '3x3' | '3x4' | '4x4' | '5x5';
  detailDetective: boolean;
  storyComplexity: 'Kolay' | 'Orta' | 'Zor';
  questionCount: number;
  taskCount: number;
  includePatternCompletion: boolean;
  includeCausalReasoning: boolean;
  includeAnswerKey: boolean;
  includeBonusSection: boolean;
  layoutDensity: 'standart' | 'yogun' | 'ultra-yogun';
}
