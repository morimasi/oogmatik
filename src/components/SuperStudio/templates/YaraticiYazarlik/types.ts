export interface YaraticiYazarlikSettings {
  storyDiceCount: number;
  clozeFormat: 'none' | 'fiil' | 'sifat' | 'rastgele';
  emotionRadar: boolean;
  minSentences: number;
  questionCount: number;
  taskCount: number;
  writingPrompts: number;
  includeWordBank: boolean;
  includeStoryMap: boolean;
  includePeerReview: boolean;
  includeAnswerKey: boolean;
  includeBonusSection: boolean;
  layoutDensity: 'standart' | 'yogun' | 'ultra-yogun';
}
