export interface KelimeBilgisiSettings {
  generationMode: 'ai' | 'hizli';
  wordTypes: ('es-anlamli' | 'zit-anlamli' | 'es-sesli')[];
  aiSettings: {
    wordCount: number;
    difficulty: 'kolay' | 'orta' | 'zor';
    includeExamples: boolean;
    includeMnemonics: boolean;
    themeBased: boolean;
  };
  hizliSettings: {
    templateStyle: 'match-card' | 'fill-blank' | 'word-web' | 'bingo';
    difficulty: 'kolay' | 'orta' | 'zor';
    questionCount: number;
    timeLimit: number | null;
    includeAnswerKey: boolean;
  };
  visualSettings: {
    useColorCoding: boolean;
    useIcons: boolean;
    useFonts: boolean;
    useGrid: boolean;
  };
  taskCount: number;
  includeMatching: boolean;
  includeSentenceContext: boolean;
  includeWordSearch: boolean;
  includeBonusSection: boolean;
  layoutDensity: 'standart' | 'yogun' | 'ultra-yogun';
}
