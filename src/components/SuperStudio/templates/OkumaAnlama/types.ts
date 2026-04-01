export interface OkumaAnlamaSettings {
  cognitiveLoadLimit: 6 | 8 | 12 | 15;
  chunkingEnabled: boolean;
  visualScaffolding: boolean;
  typographicHighlight: boolean;
  mindMap5N1K: boolean;
  questionCount: number;
  taskCount: number;
  readingLength: 'kisa' | 'orta' | 'uzun';
  questionTypes: (
    | 'coktan-secmeli'
    | 'bosluk-doldurma'
    | 'dogru-yanlis'
    | 'acik-uc'
    | 'eslestirme'
  )[];
  includeAnswerKey: boolean;
  includeWordWork: boolean;
  includeDetectiveTask: boolean;
  includeBonusSection: boolean;
  layoutDensity: 'standart' | 'yogun' | 'ultra-yogun';
}
