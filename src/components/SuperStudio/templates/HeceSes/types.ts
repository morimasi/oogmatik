export interface HeceSesSettings {
  focusEvents: ('heceleme' | 'yumusama' | 'sertlesme' | 'ses-dusmesi')[];
  wordCount: number;
  taskCount: number;
  syllableHighlight: boolean;
  multisensorySupport: boolean;
  includeSyllableCounting: boolean;
  includeWordBuilding: boolean;
  includeSoundDetection: boolean;
  includeAnswerKey: boolean;
  includeBonusSection: boolean;
  layoutDensity: 'standart' | 'yogun' | 'ultra-yogun';
}
