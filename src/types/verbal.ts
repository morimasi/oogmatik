import { BaseActivityData } from './common';
import { ActivityType, Student, SingleWorksheetData } from './core';

export interface StoryQuestion {
  type:
  | 'multiple-choice'
  | 'true-false'
  | 'open-ended'
  | 'who'
  | 'where'
  | 'when'
  | 'what'
  | 'why'
  | 'how';
  question: string;
  options?: string[];
  answer: string;
  isTrue?: boolean;
  hint?: string;
}

export interface StoryData extends BaseActivityData {
  story: string;
  genre?: string;
  gradeLevel?: string;
  mainIdea: string;
  characters: string[];
  setting: string;
  vocabulary: { word: string; definition: string }[];
  creativeTask: string;
  questions: StoryQuestion[];
  fiveW1H?: {
    type: 'who' | 'where' | 'when' | 'what' | 'why' | 'how';
    question: string;
    answer: string;
  }[];
}

export interface StoryAnalysisData extends BaseActivityData {
  settings?: {
    difficulty: 'çok kolay' | 'kolay' | 'orta' | 'zor';
    topic: string;
    analysisDepth: 'temel' | 'detaylı';
    showStoryMap: boolean;
  };
  content: {
    title: string;
    story: string;
    analysis: {
      characters: { name: string; traits: string[] }[];
      setting: { place: string; time: string };
      conflict: string;
      resolution: string;
      mainIdea: string;
      subThemes: string[];
    };
  };
  questions: StoryQuestion[];
}

export interface StoryCreationPromptData extends BaseActivityData {
  prompt: string;
  keywords: string[];
  structureHints: Record<string, string>;
}

export interface WordsInStoryData extends BaseActivityData {
  story: string;
  vocabWork: { word: string; contextQuestion: string; type: 'meaning' | 'usage' }[];
}

export interface StorySequencingPanel {
  id: string;
  text: string;
  correctOrder: number;
  imagePrompt?: string;
}

export interface StorySequencingData extends BaseActivityData {
  settings?: {
    difficulty: 'çok kolay' | 'kolay' | 'orta' | 'zor';
    panelCount: number;
    showTransitionWords: boolean;
  };
  content: {
    title: string;
    panels: StorySequencingPanel[];
    transitionWords?: string[];
    fullStory: string;
  };
}

export interface InteractiveStoryData extends StoryData {
  syllabifiedStory: string;
  creativePrompt?: string; // Yaratıcı alan yönergesi
  syllableTrain?: { word: string; syllables: string[] }[]; // Hece treni verisi
  fiveW1H: {
    type: 'who' | 'where' | 'when' | 'what' | 'why' | 'how';
    question: string;
    answer: string;
  }[];
  trueFalse: { question: string; answer: boolean }[];
  fillBlanks: { sentence: string; answer: string }[];
  logicQuestions: { question: string; answer: string; hint: string }[];
  inferenceQuestions: { question: string; answer: string }[];
  multipleChoice: StoryQuestion[];
}

export interface ReadingStroopData extends BaseActivityData {
  grid: { text: string; color: string }[];
  settings: { cols: number; fontSize: number; wordType: string };
  evaluationBox: boolean;
}

export interface ReadingFlowData extends BaseActivityData {
  text: { paragraphs: { sentences: { syllables: { text: string }[] }[] }[] };
}

export interface PhonologicalAwarenessData extends BaseActivityData {
  exercises: { question: string; word: string }[];
}

export interface SyllableTrainData extends BaseActivityData {
  trains: {
    syllables: string[];
    word?: string;
    missingSyllableIndex?: number;
    isPseudo?: boolean;
  }[];
}

export interface BackwardSpellingData extends BaseActivityData {
  items: { original: string; reversed: string }[];
}

export interface HandwritingPracticeData extends BaseActivityData {
  lines: { text: string; type: 'trace' | 'copy' | 'empty'; imagePrompt?: string }[];
  guideType: string;
  settings?: Record<string, unknown>;
}

export interface SyllableWordBuilderData extends BaseActivityData {
  words: {
    id: number;
    targetWord: string;
    syllables: string[];
    imagePrompt: string;
    imageBase64?: string;
  }[];
  syllableBank: string[];
}

export interface SyllableMasterLabItem {
  word: string;
  syllables: string[];
  missingIndex?: number;
  scrambledIndices?: number[];
  syllableCount: number;
}

export interface SyllableMasterLabData extends BaseActivityData {
  mode: 'split' | 'combine' | 'complete' | 'rainbow' | 'scrambled';
  items: SyllableMasterLabItem[];
}

export interface LetterVisualMatchingData extends BaseActivityData {
  pairs: {
    letter: string;
    imagePrompt: string;
    imageBase64?: string;
    word: string;
  }[];
  settings: {
    fontFamily: string;
    letterCase: 'upper' | 'lower';
    showTracing: boolean;
    gridCols: number;
  };
}

export interface SynonymAntonymMatchData extends BaseActivityData {
  mode: 'synonym' | 'antonym' | 'mixed';
  pairs: {
    source: string;
    target: string;
    type: 'synonym' | 'antonym';
    imagePrompt?: string;
  }[];
  sentences: {
    text: string;
    word: string;
    target: string;
    type: 'synonym' | 'antonym';
  }[];
}

export interface ReadingSudokuData extends BaseActivityData {
  grid: (string | null)[][];
  solution: string[][];
  symbols: { value: string; imagePrompt?: string; label?: string }[];
  settings: {
    size: number;
    variant: 'letters' | 'words' | 'visuals' | 'numbers';
    fontFamily: string;
  };
}

export interface FamilyRelationPair {
  definition: string;
  label: string;
  side: 'mom' | 'dad' | 'both' | 'none';
}

export interface FamilyRelationsData extends BaseActivityData {
  pairs: FamilyRelationPair[];
  momRelatives: string[];
  dadRelatives: string[];
  difficulty: string;
}

export interface FamilyLogicStatement {
  text: string;
  isTrue: boolean;
}

export interface FamilyLogicTestData extends BaseActivityData {
  statements: FamilyLogicStatement[];
  difficulty: string;
}

export interface MorphologyMatrixData extends BaseActivityData {
  settings?: {
    difficulty: 'beginner' | 'intermediate' | 'expert' | 'clinical';
    layout: 'single' | 'grid_2x1';
    fontScale: number;
    isProfessionalMode: boolean;
    showClinicalNotes?: boolean;
  };
  items: {
    root: string;
    suffixes: string[];
    hint?: string;
  }[];
  clinicalMeta?: {
    morphologicalComplexity: number;
    derivationalVariety: number;
  };
}

export interface ReadingPyramidData extends BaseActivityData {
  pyramids: {
    levels: string[];
    title: string;
  }[];
  difficulty: string;
}

export interface WordMemoryItem {
  text: string;
  imagePrompt?: string;
}

export interface WordMemoryData extends BaseActivityData {
  memorizeTitle: string;
  testTitle: string;
  wordsToMemorize: WordMemoryItem[];
  testWords: WordMemoryItem[];
}

export interface VisualMemoryItem {
  description: string;
  imagePrompt: string;
  imageBase64?: string;
}

export interface VisualMemoryData extends BaseActivityData {
  memorizeTitle: string;
  testTitle: string;
  itemsToMemorize: VisualMemoryItem[];
  testItems: VisualMemoryItem[];
}

export interface NumberSearchData extends BaseActivityData {
  numbers: number[];
  range: { start: number; end: number };
}

export interface FindDuplicateData extends BaseActivityData {
  rows: string[][];
}

export interface LetterGridTestData extends BaseActivityData {
  grid: string[][];
  targetLetters: string[];
}

export interface FindLetterPairData extends BaseActivityData {
  grids: { grid: string[][]; targetPair: string }[];
  settings: { gridSize: number; itemCount: number; difficulty: string };
}

export interface TargetSearchData extends BaseActivityData {
  grid: string[][];
  target: string;
  distractor: string;
}

export interface ColorWheelMemoryItem {
  name: string;
  color: string;
  imagePrompt: string;
}

export interface ColorWheelMemoryData extends BaseActivityData {
  memorizeTitle: string;
  testTitle: string;
  items: ColorWheelMemoryItem[];
}

export interface ImageComprehensionData extends BaseActivityData {
  memorizeTitle: string;
  testTitle: string;
  sceneDescription: string;
  questions: string[];
}

export interface CharacterMemoryItem {
  description: string;
  imagePrompt: string;
  imageBase64?: string;
}

export interface CharacterMemoryData extends BaseActivityData {
  memorizeTitle: string;
  testTitle: string;
  charactersToMemorize: CharacterMemoryItem[];
  testCharacters: CharacterMemoryItem[];
}

export interface StroopTestData extends BaseActivityData {
  items: { text: string; color: string }[];
}

export interface ChaoticNumberSearchItem {
  value: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
}

export interface ChaoticNumberSearchData extends BaseActivityData {
  numbers: ChaoticNumberSearchItem[];
  range: { start: number; end: number };
  prompt?: string;
}

export interface AttentionDevelopmentPuzzle {
  riddle: string;
  boxes: { label?: string; numbers: number[] }[];
  options: string[];
  answer: string;
}

export interface AttentionDevelopmentData extends BaseActivityData {
  puzzles: AttentionDevelopmentPuzzle[];
}

export interface AttentionFocusPuzzle {
  riddle: string;
  boxes: { title?: string; items: string[] }[];
  options: string[];
  answer: string;
}

export interface AttentionFocusData extends BaseActivityData {
  puzzles: AttentionFocusPuzzle[];
}

export interface MissingPartsData extends BaseActivityData {
  settings?: {
    // Temel Ayarlar
    difficulty: 'çok kolay' | 'kolay' | 'orta' | 'zor' | 'uzman';
    blankType: 'word' | 'phrase' | 'sentence' | 'number';
    showWordBank: boolean;
    topic: string;
    
    // Ultra Özelleştirme
    blankCount: number;
    blankSize: 'small' | 'medium' | 'large';
    blankStyle: 'underline' | 'dashed' | 'solid' | 'dotted';
    showLineNumber: boolean;
    showParagraphNumbers: boolean;
    
    // Görsel Ayarlar
    compactLayout: boolean;
    syllableColoring: boolean;
    useIcons: boolean;
    showVisualHints: boolean;
    
    // Zorluk Detayları
    includeDistractors: boolean;
    distractorCount: number;
    semanticComplexity: 'low' | 'medium' | 'high';
    sentenceComplexity: 'simple' | 'compound' | 'complex';
    
    // Pedagojik
    showInstructions: boolean;
    showExamples: boolean;
    includeTimer: boolean;
    showProgress: boolean;
    
    // A4 Optimizasyon
    fontSize: 'small' | 'medium' | 'large';
    lineHeight: 'tight' | 'normal' | 'relaxed';
    columnLayout: 'single' | 'two-column';
    maxParagraphsPerPage: number;
  };
  content: {
    title: string;
    instruction: string;
    paragraphs: {
      id: string;
      parts: { 
        text: string; 
        isBlank: boolean; 
        answer?: string;
        hints?: string[];
        distractors?: string[];
        difficulty?: 'easy' | 'medium' | 'hard';
      }[];
    }[];
    wordBank: {
      words: string[];
      categories?: string[];
      showCategories: boolean;
      randomOrder: boolean;
    };
    visualElements?: {
      icons: { position: number; icon: string; style: string }[];
      images: { position: number; url: string; caption: string }[];
      decorations: { type: string; position: string; style: string }[];
    };
    pedagogicalSupport?: {
      examples: { sentence: string; answer: string }[];
      tips: string[];
      strategies: string[];
    };
  };
}

export interface CodeReadingData extends BaseActivityData {
  keyMap: { symbol: string; value: string; color: string }[];
  codesToSolve: { sequence: string[] }[];
}

export interface AttentionToQuestionData extends BaseActivityData {
  subType: 'letter-cancellation' | 'other';
  grid?: string[][];
  targetChars?: string[];
}

export interface LetterDiscriminationData extends BaseActivityData {
  targetLetters: string[];
  rows: { letters: string[] }[];
}

export interface RapidNamingData extends BaseActivityData {
  settings?: {
    difficulty: 'beginner' | 'intermediate' | 'expert' | 'clinical';
    category: 'letters' | 'numbers' | 'colors' | 'objects' | 'mixed';
    layout: 'grid' | 'rows';
    isProfessionalMode: boolean;
    showClinicalNotes?: boolean;
  };
  grid: { items: { type: string; value: string; label?: string }[] }[];
  clinicalMeta?: {
    targetSpeed?: number;
    interferenceFactor?: number;
  };
}

export interface MirrorLettersData extends BaseActivityData {
  settings?: {
    difficulty: 'beginner' | 'intermediate' | 'expert' | 'clinical';
    layout: 'single' | 'compact';
    isProfessionalMode: boolean;
    showClinicalNotes?: boolean;
  };
  targetPair: string;
  rows: { items: { letter: string; rotation: number; isMirrored: boolean }[] }[];
  clinicalMeta?: {
    reversalProbability: number;
    discriminationComplexity: number;
  };
}

export interface VisualTrackingLineData extends BaseActivityData {
  settings?: {
    difficulty: 'beginner' | 'intermediate' | 'expert' | 'clinical';
    layout: 'single' | 'compact';
    pathComplexity: number;
    isProfessionalMode: boolean;
    showClinicalNotes?: boolean;
  };
  paths: {
    id: number;
    d: string;
    color: string;
    strokeWidth: number;
    startLabel?: string;
    endLabel?: string;
    yStart: number;
    yEnd: number;
  }[];
  width: number;
  height: number;
  clinicalMeta?: {
    perceptualLoad: number;
    visualSearchEfficiency: number;
  };
}

export interface AnagramsData extends BaseActivityData {
  anagrams: { scrambled: string; original: string }[];
}

export interface WordSearchData extends BaseActivityData {
  settings?: {
    difficulty: 'beginner' | 'intermediate' | 'expert' | 'clinical';
    layout: 'classic' | 'compact' | 'ultra_dense';
    gridSize: number;
    directions: ('horizontal' | 'vertical' | 'diagonal' | 'reverse')[];
    showClinicalNotes?: boolean;
    isProfessionalMode: boolean;
  };
  grid: string[][];
  words: string[];
  clinicalMeta?: {
    intersections: number;
    reversals: number;
    density: number;
  };
}

export interface CrosswordData extends BaseActivityData {
  settings?: {
    difficulty: 'beginner' | 'intermediate' | 'expert' | 'clinical';
    layout: 'single' | 'compact';
    theme: 'classic' | 'modern' | 'minimal';
    isProfessionalMode: boolean;
    showClinicalNotes?: boolean;
  };
  grid: (string | null)[][];
  clues: { id: number; text: string; direction: 'across' | 'down'; row: number; col: number }[];
  clinicalMeta?: {
    connectivityIndex: number; // 0-1
    clueComplexity: number;
    vocabularyLevel: string;
  };
}

export interface HiddenPasswordGridData extends BaseActivityData {
  settings?: {
    gridSize: number;
    itemCount: number;
    cellStyle: string;
    letterCase: string;
  };
  grids: {
    targetLetter: string;
    hiddenWord: string;
    grid: string[][];
  }[];
}

export interface LogicErrorHunterData extends BaseActivityData {
  settings?: {
    difficulty: 'çok kolay' | 'kolay' | 'orta' | 'zor';
    absurdityDegree: 'minimal' | 'obvious' | 'surreal';
    errorCount: number;
  };
  content: {
    title: string;
    story: string; // Hataları barındıran uzun paragraf (Hatalı kelimelerin indekslerini tutabilmek veya özel işaretleyici ile sarabilmek için). Örn: "Güneş **gece** doğar." Ancak sadece düz metin olarak verilsin, biz UI'da vurgulamayacağız, çocuk kendisi bulacak.
    errors: {
      id: string;
      faultyWordOrPhrase: string; // Metin içindeki absürt kelime (örn: "gece")
      correction: string; // Doğrusu ne olmalıydı (örn: "sabah")
      explanation: string; // Neden mantıksız (örn: "Güneş gündüzleri doğduğu için gece doğması mantıksızdır.")
    }[];
  };
}

export interface FiveWOneHQuestion {
  id: string;
  type: 'who' | 'what' | 'where' | 'when' | 'how' | 'why' | 'inference';
  questionText: string;
  answerType: 'open_ended' | 'multiple_choice' | 'fill_in_the_blank';
  options?: string[];
  correctAnswer: string;
}

export interface FiveWOneHData extends SingleWorksheetData {
  settings?: {
    difficulty: 'çok kolay' | 'kolay' | 'orta' | 'zor';
    topic: string; // Kullanıcının seçeceği ilgi alanı
    textLength: 'kısa' | 'orta' | 'uzun';
    syllableColoring: boolean; // Renkli hece aktif mi?
    fontFamily: string; // Disleksi / Normal font
    questionStyle: 'test_and_open' | 'only_open_ended' | 'only_test';
  };
  content: {
    title: string;
    text: string;
    paragraphs: string[];
  };
  questions: FiveWOneHQuestion[];
}

export interface Sentence5W1HItem {
  [key: string]: unknown;
  id: string;
  predicate?: string;
  questions: {
    type: 'who' | 'what' | 'where' | 'when' | 'how' | 'why';
    question: string;
    answer: string;
  }[];
}

export interface Sentence5W1HData extends SingleWorksheetData {
  settings?: {
    difficulty: 'çok kolay' | 'kolay' | 'orta' | 'zor';
    topic: string;
    itemCount: number;
    showIcons: boolean;
    showPredicate?: boolean;
  };
  items: Sentence5W1HItem[];
}

export interface ColorfulSyllableReadingData extends BaseActivityData {
  settings?: {
    difficulty: 'çok kolay' | 'kolay' | 'orta' | 'zor';
    topic: string;
    textLength: 'kısa' | 'orta' | 'uzun';
    wpmTarget: number;
    colorPalette: 'red_blue' | 'contrast' | 'pastel';
    highlightType: 'vowels_only' | 'syllables' | 'words';
  };
  content: {
    title: string;
    paragraphs: {
      text: string;
      syllabified: { word: string; parts: string[] }[];
    }[];
  };
}

export interface FamilyTreeNode {
  id: string; // Örn: P1, P2
  role: string; // Örn: Baba, Anne, Dede, Çocuk 1
  name?: string; // Boş bırakılacak düğümler için boş olabilir
  gender: 'M' | 'F';
  generation: number; // 0: Dede/Nine, 1: Anne/Baba, 2: Çocuklar
  partnersWith?: string; // Evli olduğu kişinin ID'si
  parents?: [string, string]; // Anne ve Baba ID'leri (varsa)
  isHidden: boolean; // Öğrencinin bulması istenen kişi mi?
}

export interface FamilyTreeMatrixData extends BaseActivityData {
  settings?: {
    difficulty: 'çok kolay' | 'kolay' | 'orta' | 'zor';
    familySize: 'nuclear' | 'extended';
    clueComplexity: 'direct' | 'logical';
    emptyNodesCount: number;
  };
  content: {
    title: string;
    storyIntro: string; // Kısa başlangıç hikayesi (Örn: "Yılmaz ailesi hafta sonu toplandı...")
    nodes: FamilyTreeNode[];
    clues: string[]; // Çözüme götüren ipuçları
  };
}

export interface KavramHaritasiNode {
  id: string;
  label: string;
  isEmpty: boolean;
  level: number; // 0=center, 1=main branch, 2=sub branch
}

export interface KavramHaritasiEdge {
  from: string;
  to: string;
  label?: string;
}

export interface KavramHaritasiData extends BaseActivityData {
  activityType: 'KAVRAM_HARITASI';
  settings?: {
    concept?: string;
    depth?: 1 | 2 | 3;
    branchCount?: number;
    fillRatio?: number;
    showExamples?: boolean;
    layout?: 'radial' | 'tree' | 'spider';
  };
  nodes: KavramHaritasiNode[];
  edges: KavramHaritasiEdge[];
  examples?: string[];
}

export interface EsAnlamliKelimeItem {
  id: string;
  sourceWord: string;
  synonyms: string[];
  antonym?: string;
  exampleSentence: string;
  correctAnswer: string;
  emoji?: string;
  etymologyNote?: string;
  usageContext?: string; // "Resmi" | "Günlük" | "Edebi"
}

export interface EsAnlamliKelimelerData extends BaseActivityData {
  activityType: 'ES_ANLAMLI_KELIMELER';
  settings?: {
    wordCount?: number;
    includeAntonyms?: boolean;
    includeExamples?: boolean;
    includeEtymology?: boolean;
    topic?: string;
    layout?: 'card_grid' | 'list' | 'match_columns';
  };
  items: EsAnlamliKelimeItem[];
}
