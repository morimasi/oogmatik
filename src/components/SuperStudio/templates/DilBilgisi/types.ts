export interface DilBilgisiSettings {
  targetDistractors: 'b-d' | 'p-q' | 'm-n' | 'none';
  syllableSimulation: boolean;
  camouflageGrid: boolean;
  gridSize: 'none' | '3x3' | '4x4' | '5x5' | '6x6';
  hintBox: boolean;
  questionCount: number;
  taskCount: number;
  wordCount: number;
  includeAnswerKey: boolean;
  includeWordChain: boolean;
  includeErrorDetective: boolean;
  includeBonusSection: boolean;
  layoutDensity: 'standart' | 'yogun' | 'ultra-yogun';
}
