
export enum ActivityType {
  WORD_SEARCH = 'WORD_SEARCH',
  ANAGRAM = 'ANAGRAM',
  FIND_THE_DIFFERENCE = 'FIND_THE_DIFFERENCE',
  MATH_PUZZLE = 'MATH_PUZZLE',
  STORY_COMPREHENSION = 'STORY_COMPREHENSION',
  STROOP_TEST = 'STROOP_TEST',
  NUMBER_PATTERN = 'NUMBER_PATTERN',
  SPELLING_CHECK = 'SPELLING_CHECK',
  LETTER_GRID_TEST = 'LETTER_GRID_TEST',
  NUMBER_SEARCH = 'NUMBER_SEARCH',
  WORD_MEMORY = 'WORD_MEMORY',
  STORY_CREATION_PROMPT = 'STORY_CREATION_PROMPT',
  WORD_COMPARISON = 'WORD_COMPARISON',
  WORDS_IN_STORY = 'WORDS_IN_STORY',
  ODD_ONE_OUT = 'ODD_ONE_OUT',
  SHAPE_MATCHING = 'SHAPE_MATCHING',
  SYMBOL_CIPHER = 'SYMBOL_CIPHER',
  PROVERB_FILL_IN_THE_BLANK = 'PROVERB_FILL_IN_THE_BLANK',
  LETTER_BRIDGE = 'LETTER_BRIDGE',
  FIND_THE_DUPLICATE_IN_ROW = 'FIND_THE_DUPLICATE_IN_ROW',
  WORD_LADDER = 'WORD_LADDER',
  FIND_IDENTICAL_WORD = 'FIND_IDENTICAL_WORD',
  WORD_FORMATION = 'WORD_FORMATION',
  REVERSE_WORD = 'REVERSE_WORD',
  FIND_LETTER_PAIR = 'FIND_LETTER_PAIR',
  WORD_GROUPING = 'WORD_GROUPING',
  VISUAL_MEMORY = 'VISUAL_MEMORY',
  STORY_ANALYSIS = 'STORY_ANALYSIS',
  COORDINATE_CIPHER = 'COORDINATE_CIPHER',
  PROVERB_SEARCH = 'PROVERB_SEARCH',
  TARGET_SEARCH = 'TARGET_SEARCH',
  SHAPE_NUMBER_PATTERN = 'SHAPE_NUMBER_PATTERN',
  GRID_DRAWING = 'GRID_DRAWING',
  COLOR_WHEEL_MEMORY = 'COLOR_WHEEL_MEMORY',
  IMAGE_COMPREHENSION = 'IMAGE_COMPREHENSION',
  CHARACTER_MEMORY = 'CHARACTER_MEMORY',
  STORY_SEQUENCING = 'STORY_SEQUENCING',
  CHAOTIC_NUMBER_SEARCH = 'CHAOTIC_NUMBER_SEARCH',
  BLOCK_PAINTING = 'BLOCK_PAINTING',
  MINI_WORD_GRID = 'MINI_WORD_GRID',
  VISUAL_ODD_ONE_OUT = 'VISUAL_ODD_ONE_OUT',
  SHAPE_COUNTING = 'SHAPE_COUNTING',
  SYMMETRY_DRAWING = 'SYMMETRY_DRAWING',
  BURDON_TEST = 'BURDON_TEST',
  FIND_DIFFERENT_STRING = 'FIND_DIFFERENT_STRING',
  DOT_PAINTING = 'DOT_PAINTING',
  ABC_CONNECT = 'ABC_CONNECT',
  PASSWORD_FINDER = 'PASSWORD_FINDER',
  SYLLABLE_COMPLETION = 'SYLLABLE_COMPLETION',
  SYNONYM_WORD_SEARCH = 'SYNONYM_WORD_SEARCH',
  WORD_CONNECT = 'WORD_CONNECT',
  SPIRAL_PUZZLE = 'SPIRAL_PUZZLE',
  CROSSWORD = 'CROSSWORD',
  JUMBLED_WORD_STORY = 'JUMBLED_WORD_STORY',
  HOMONYM_SENTENCE_WRITING = 'HOMONYM_SENTENCE_WRITING',
  WORD_GRID_PUZZLE = 'WORD_GRID_PUZZLE',
  PROVERB_SAYING_SORT = 'PROVERB_SAYING_SORT',
  HOMONYM_IMAGE_MATCH = 'HOMONYM_IMAGE_MATCH',
  ANTONYM_FLOWER_PUZZLE = 'ANTONYM_FLOWER_PUZZLE',
  PROVERB_WORD_CHAIN = 'PROVERB_WORD_CHAIN',
  THEMATIC_ODD_ONE_OUT = 'THEMATIC_ODD_ONE_OUT',
  SYNONYM_ANTONYM_GRID = 'SYNONYM_ANTONYM_GRID',
  PUNCTUATION_COLORING = 'PUNCTUATION_COLORING',
  PUNCTUATION_MAZE = 'PUNCTUATION_MAZE',
  ANTONYM_RESFEBE = 'ANTONYM_RESFEBE',
  THEMATIC_WORD_SEARCH_COLOR = 'THEMATIC_WORD_SEARCH_COLOR',
  THEMATIC_ODD_ONE_OUT_SENTENCE = 'THEMATIC_ODD_ONE_OUT_SENTENCE',
  SYNONYM_SEARCH_STORY = 'SYNONYM_SEARCH_STORY',
  COLUMN_ODD_ONE_OUT_SENTENCE = 'COLUMN_ODD_ONE_OUT_SENTENCE',
  SYNONYM_ANTONYM_COLORING = 'SYNONYM_ANTONYM_COLORING',
  PUNCTUATION_PHONE_NUMBER = 'PUNCTUATION_PHONE_NUMBER',
  PUNCTUATION_SPIRAL_PUZZLE = 'PUNCTUATION_SPIRAL_PUZZLE',
  SYNONYM_MATCHING_PATTERN = 'SYNONYM_MATCHING_PATTERN',
  FUTOSHIKI = 'FUTOSHIKI',
  NUMBER_PYRAMID = 'NUMBER_PYRAMID',
  NUMBER_CAPSULE = 'NUMBER_CAPSULE',
  ODD_EVEN_SUDOKU = 'ODD_EVEN_SUDOKU',
  ROMAN_NUMERAL_CONNECT = 'ROMAN_NUMERAL_CONNECT',
  ROMAN_NUMERAL_STAR_HUNT = 'ROMAN_NUMERAL_STAR_HUNT',
  ROUNDING_CONNECT = 'ROUNDING_CONNECT',
  ROMAN_NUMERAL_MULTIPLICATION = 'ROMAN_NUMERAL_MULTIPLICATION',
  ARITHMETIC_CONNECT = 'ARITHMETIC_CONNECT',
  ROMAN_ARABIC_MATCH_CONNECT = 'ROMAN_ARABIC_MATCH_CONNECT',
  KENDOKU = 'KENDOKU',
  OPERATION_SQUARE_FILL_IN = 'OPERATION_SQUARE_FILL_IN',
  MULTIPLICATION_WHEEL = 'MULTIPLICATION_WHEEL',
  TARGET_NUMBER = 'TARGET_NUMBER',
  SHAPE_SUDOKU = 'SHAPE_SUDOKU',
  WEIGHT_CONNECT = 'WEIGHT_CONNECT',
  RESFEBE = 'RESFEBE',
  MATCHSTICK_SYMMETRY = 'MATCHSTICK_SYMMETRY',
  WORD_WEB = 'WORD_WEB',
  STAR_HUNT = 'STAR_HUNT',
  LENGTH_CONNECT = 'LENGTH_CONNECT',
  VISUAL_NUMBER_PATTERN = 'VISUAL_NUMBER_PATTERN',
  MISSING_PARTS = 'MISSING_PARTS',
  PROFESSION_CONNECT = 'PROFESSION_CONNECT',
  VISUAL_ODD_ONE_OUT_THEMED = 'VISUAL_ODD_ONE_OUT_THEMED',
  LOGIC_GRID_PUZZLE = 'LOGIC_GRID_PUZZLE',
  IMAGE_ANAGRAM_SORT = 'IMAGE_ANAGRAM_SORT',
  ANAGRAM_IMAGE_MATCH = 'ANAGRAM_IMAGE_MATCH',
  SYLLABLE_WORD_SEARCH = 'SYLLABLE_WORD_SEARCH',
  WORD_SEARCH_WITH_PASSWORD = 'WORD_SEARCH_WITH_PASSWORD',
  WORD_WEB_WITH_PASSWORD = 'WORD_WEB_WITH_PASSWORD',
  LETTER_GRID_WORD_FIND = 'LETTER_GRID_WORD_FIND',
  WORD_PLACEMENT_PUZZLE = 'WORD_PLACEMENT_PUZZLE',
  POSITIONAL_ANAGRAM = 'POSITIONAL_ANAGRAM',
  READING_FLOW = 'READING_FLOW',
  LETTER_DISCRIMINATION = 'LETTER_DISCRIMINATION',
  RAPID_NAMING = 'RAPID_NAMING',
  PHONOLOGICAL_AWARENESS = 'PHONOLOGICAL_AWARENESS',
  MIRROR_LETTERS = 'MIRROR_LETTERS',
  SYLLABLE_TRAIN = 'SYLLABLE_TRAIN',
  VISUAL_TRACKING_LINES = 'VISUAL_TRACKING_LINES',
  BACKWARD_SPELLING = 'BACKWARD_SPELLING',
  BASIC_OPERATIONS = 'BASIC_OPERATIONS',
  REAL_LIFE_MATH_PROBLEMS = 'REAL_LIFE_MATH_PROBLEMS',
  PROVERB_SENTENCE_FINDER = 'PROVERB_SENTENCE_FINDER',
  FAMILY_RELATIONS = 'FAMILY_RELATIONS',
  LOGIC_DEDUCTION = 'LOGIC_DEDUCTION',
  NUMBER_BOX_LOGIC = 'NUMBER_BOX_LOGIC',
  MAP_INSTRUCTION = 'MAP_INSTRUCTION',
  CODE_READING = 'CODE_READING',
  ATTENTION_TO_QUESTION = 'ATTENTION_TO_QUESTION',
  ATTENTION_DEVELOPMENT = 'ATTENTION_DEVELOPMENT',
  ATTENTION_FOCUS = 'ATTENTION_FOCUS',
  
  MIND_GAMES = 'MIND_GAMES',
  MIND_GAMES_56 = 'MIND_GAMES_56',

  // --- DYSCALCULIA ACTIVITIES ---
  NUMBER_SENSE = 'NUMBER_SENSE',
  ARITHMETIC_FLUENCY = 'ARITHMETIC_FLUENCY',
  NUMBER_GROUPING = 'NUMBER_GROUPING',
  PROBLEM_SOLVING_STRATEGIES = 'PROBLEM_SOLVING_STRATEGIES',
  MATH_LANGUAGE = 'MATH_LANGUAGE',
  TIME_MEASUREMENT_GEOMETRY = 'TIME_MEASUREMENT_GEOMETRY',
  SPATIAL_REASONING = 'SPATIAL_REASONING',
  ESTIMATION_SKILLS = 'ESTIMATION_SKILLS',
  FRACTIONS_DECIMALS = 'FRACTIONS_DECIMALS',
  VISUAL_NUMBER_REPRESENTATION = 'VISUAL_NUMBER_REPRESENTATION',
  VISUAL_ARITHMETIC = 'VISUAL_ARITHMETIC',
  APPLIED_MATH_STORY = 'APPLIED_MATH_STORY',
  SPATIAL_AWARENESS_DISCOVERY = 'SPATIAL_AWARENESS_DISCOVERY',
  POSITIONAL_CONCEPTS = 'POSITIONAL_CONCEPTS',
  DIRECTIONAL_CONCEPTS = 'DIRECTIONAL_CONCEPTS',
  VISUAL_DISCRIMINATION_MATH = 'VISUAL_DISCRIMINATION_MATH'
}

export type AppTheme = 'light' | 'dark' | 'anthracite' | 'anthracite-gold' | 'anthracite-cyber' | 'anthracite-bumblebee' | 'anthracite-stone' | 'anthracite-honey' | 'anthracite-onyx';

export interface UiSettings {
    fontFamily: 'Lexend' | 'OpenDyslexic' | 'Inter' | 'Lora' | 'Comic Neue';
    fontSizeScale: number; 
    letterSpacing: 'normal' | 'wide';
    lineHeight: number; 
    saturation: number; 
}

export interface StyleSettings {
  fontSize: number;
  borderColor: string;
  borderWidth: number;
  margin: number;
  columns: number;
  gap: number;
  showPedagogicalNote: boolean;
}

export type View = 'generator' | 'savedList' | 'profile' | 'admin' | 'messages' | 'shared' | 'assessment' | 'favorites';

export interface GeneratorOptions {
    mode: 'ai' | 'fast';
    difficulty: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
    worksheetCount: number;
    timestamp?: number;
    [key: string]: any;
}

export interface Activity {
  id: ActivityType;
  title: string;
  description: string;
  icon: string;
}

export interface ActivityCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  activities: ActivityType[];
}

export interface ActivityStats {
    activityId: ActivityType;
    title: string;
    generationCount: number;
    lastGenerated: string;
    avgCompletionTime: number;
}

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    createdAt: string;
    lastLogin: string;
    worksheetCount: number;
    status: UserStatus;
    subscriptionPlan: SubscriptionPlan;
    favorites?: ActivityType[];
    lastActiveActivity?: {
        id: string;
        title: string;
        date: string;
    };
}

export interface FeedbackItem {
    id: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    activityType: string | null;
    activityTitle?: string;
    rating: number;
    message: string;
    timestamp: string;
    status: 'new' | 'read' | 'archived' | 'replied';
    adminReply?: string;
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    senderName: string;
    content: string;
    timestamp: string;
    isRead: boolean;
    relatedFeedbackId?: string;
}

export type TestCategory = 'reading' | 'math' | 'attention' | 'visual' | 'cognitive';

export interface TestResult {
    id: TestCategory;
    name: string;
    score: number;
    total: number;
    accuracy: number;
    duration: number;
    timestamp: number;
}

export interface AssessmentProfile {
    studentName: string;
    gender: 'Kız' | 'Erkek';
    age: number;
    grade: string;
    observations: string[];
    testResults: Record<string, TestResult>; 
}

export interface AssessmentReport {
    overallSummary: string;
    scores: {
        reading: number;
        writing: number;
        math: number;
        attention: number;
        cognitive: number;
    };
    chartData?: { label: string; value: number; fullMark: number }[];
    analysis: {
        strengths: string[];
        weaknesses: string[];
    };
    roadmap: {
        activityId: string;
        reason: string;
        frequency: string;
    }[];
}

export interface SavedAssessment {
    id: string;
    userId: string;
    studentName: string;
    gender: 'Kız' | 'Erkek';
    age: number;
    grade: string;
    createdAt: string;
    report: AssessmentReport;
    sharedBy?: string;
    sharedByName?: string;
    sharedWith?: string;
}

export interface BaseActivityData {
    title: string;
    instruction?: string;
    pedagogicalNote?: string;
    imagePrompt?: string;
    imageBase64?: string;
}

export type ShapeType = 'circle' | 'square' | 'triangle' | 'hexagon' | 'star' | 'diamond' | 'pentagon' | 'octagon' | 'cube' | 'sphere' | 'pyramid' | 'cone' | 'heart' | 'cloud' | 'moon';

// --- MATH & LOGIC DATA TYPES ---
export interface NumberPatternData extends BaseActivityData { patterns: { sequence: string; answer: string; }[]; }
export interface ShapeNumberPatternData extends BaseActivityData { patterns: { shapes: { type: string; numbers: (string|number)[]; }[] }[]; }
export interface MathPuzzleData extends BaseActivityData { puzzles: { problem: string; question: string; answer: string; objects?: { name: string; imageBase64?: string; }[]; }[]; }
export interface FutoshikiData extends BaseActivityData { puzzles: { size: number; numbers: (number | null)[][]; constraints: { row1: number; col1: number; row2: number; col2: number; symbol: string; }[]; units?: (string|null)[][]; }[]; }
export interface NumberPyramidData extends BaseActivityData { pyramids: { title?: string; rows: (number | null)[][]; }[]; }
export interface NumberCapsuleData extends BaseActivityData { puzzles: { title?: string; grid: (number|null)[][]; capsules: { cells: {row: number; col: number}[]; sum: number; }[]; numbersToUse: string; }[]; }
export interface OddEvenSudokuData extends BaseActivityData { puzzles: { title?: string; grid: (number|null)[][]; constrainedCells?: {row: number; col: number}[]; shadedCells?: {row: number; col: number}[]; numbersToUse: string; }[]; }
export interface RomanNumeralConnectData extends BaseActivityData { puzzles: { title?: string; gridDim: number; points: { label: string; x: number; y: number; }[]; }[]; }
export interface RomanNumeralStarHuntData extends BaseActivityData { grid: (string | null)[][]; starCount: number; prompt?: string; }
export interface RoundingConnectData extends BaseActivityData { numbers: { value: number; group: number; x: number; y: number; text?: string; }[]; example?: string; prompt?: string; }
export interface ArithmeticConnectData extends BaseActivityData { expressions: { text: string; value: number; group: number; x: number; y: number; }[]; example?: string; prompt?: string; }
export interface RomanNumeralMultiplicationData extends BaseActivityData { puzzles: { row1: string; row2: string; col1: string; col2: string; results: { r1c1: string | null; r1c2: string | null; r2c1: string | null; r2c2: string | null; }; }[]; }
export interface KendokuData extends BaseActivityData { puzzles: { size: number; grid: (number|null)[][]; cages: { cells: {row: number; col: number}[]; operation: string; target: number; }[]; }[]; }
export interface OperationSquareFillInData extends BaseActivityData { puzzles: { grid: (string|null)[][]; numbersToUse: number[]; results: number[]; }[]; }
export interface MultiplicationWheelData extends BaseActivityData { puzzles: { outerNumbers: (number|null)[]; innerResult: number; }[]; }
export interface TargetNumberData extends BaseActivityData { puzzles: { target: number; givenNumbers: number[]; }[]; }
export interface ShapeSudokuData extends BaseActivityData { puzzles: { grid: (string|null)[][]; shapesToUse: {shape: string; label: string}[]; }[]; }
export interface VisualNumberPatternData extends BaseActivityData { puzzles: { items: { number: number; color: string; size: number; }[]; rule: string; answer: number; }[]; }
export interface LogicGridPuzzleData extends BaseActivityData { clues: string[]; people: string[]; categories: { title: string; items: { name: string; imageDescription: string; imagePrompt: string; imageBase64?: string; }[]; }[]; }
export interface OddOneOutData extends BaseActivityData { groups: { words: string[]; }[]; }
export interface ShapeCountingData extends BaseActivityData { figures: { svgPaths: { d: string; fill: string; stroke?: string; }[]; targetShape: string; correctCount: number; }[]; }
export interface ThematicOddOneOutData extends BaseActivityData { theme: string; rows: { words: { text: string; imagePrompt?: string; imageBase64?: string; }[]; oddWord: string; }[]; sentencePrompt: string; prompt?: string; }
export interface ThematicOddOneOutSentenceData extends BaseActivityData { rows: { words: string[]; oddWord: string; }[]; sentencePrompt: string; prompt?: string; }
export interface ColumnOddOneOutSentenceData extends BaseActivityData { columns: { words: string[]; oddWord: string; }[]; sentencePrompt: string; prompt?: string; }
export interface PunctuationMazeData extends BaseActivityData { punctuationMark: string; grid?: number[][]; rules: { id: number; text: string; isCorrect: boolean; isPath?: boolean; }[]; prompt?: string; }
export interface PunctuationPhoneNumberData extends BaseActivityData { clues: { id: number; text: string; }[]; solution: { punctuationMark: string; number: number; }[]; prompt?: string; }
export interface BasicOperationsData extends BaseActivityData { operations: { num1: number; num2: number; num3?: number; operator: string; answer: number; remainder?: number; }[]; isVertical?: boolean; }
export interface RealLifeProblemData extends BaseActivityData { problems: { text: string; solution: string; operationHint: string; imagePrompt: string; imageBase64?: string; }[]; }
export interface RomanArabicMatchConnectData extends BaseActivityData { gridDim: number; points: { label: string; pairId: number; x: number; y: number; }[]; prompt?: string; }
export interface WeightConnectData extends BaseActivityData { gridDim: number; points: { label: string; pairId: number; x: number; y: number; imagePrompt?: string; }[]; prompt?: string; }
export interface LengthConnectData extends BaseActivityData { gridDim: number; points: { label: string; pairId: number; x: number; y: number; imagePrompt?: string; }[]; prompt?: string; }

// --- VISUAL PERCEPTION DATA TYPES ---
export interface FindTheDifferenceData extends BaseActivityData { rows: { items: string[]; correctIndex: number; visualDistractionLevel: 'low' | 'medium' | 'high'; }[]; }
export interface WordComparisonData extends BaseActivityData { box1Title: string; box2Title: string; wordList1: string[]; wordList2: string[]; correctDifferences: string[]; }
export interface ShapeMatchingData extends BaseActivityData { leftColumn: { id: number|string; shapes: ShapeType[]; color: string; }[]; rightColumn: { id: number|string; shapes: ShapeType[]; color: string; }[]; complexity: number; }
export interface FindIdenticalWordData extends BaseActivityData { groups: { words: [string, string]; distractors: string[]; }[]; }
export interface GridDrawingData extends BaseActivityData { gridDim: number; drawings: { lines: [number, number][][]; complexityLevel: string; }[]; }
export interface SymbolCipherData extends BaseActivityData { cipherKey: { shape: string; letter: string; color: string; }[]; wordsToSolve: { shapeSequence: string[]; wordLength: number; answer: string; }[]; }
export interface BlockPaintingData extends BaseActivityData { grid: { rows: number; cols: number; }; targetPattern: number[][]; shapes: { id: number; color: string; pattern: number[][]; count: number; }[]; }
export interface VisualOddOneOutData extends BaseActivityData { rows: { items: { segments: boolean[]; rotation?: number; }[]; correctIndex: number; reason: string; }[]; }
export interface SymmetryDrawingData extends BaseActivityData { gridDim: number; dots: { x: number; y: number; color: string; }[]; axis: 'vertical' | 'horizontal'; isMirrorImage: boolean; }
export interface FindDifferentStringData extends BaseActivityData { rows: { items: string[]; correctIndex: number; }[]; }
export interface DotPaintingData extends BaseActivityData { prompt1: string; prompt2: string; svgViewBox: string; gridPaths: string[]; dots: { cx: number; cy: number; color: string; }[]; hiddenImageName: string; }
export interface AbcConnectData extends BaseActivityData { puzzles: { id: number; gridDim: number; points: { label: string; x: number; y: number; color?: string; imagePrompt?: string; }[]; }[]; }
export interface CoordinateCipherData extends BaseActivityData { grid: string[][]; wordsToFind: string[]; cipherCoordinates: string[]; decodedMessage: string; }
export interface WordConnectData extends BaseActivityData { gridDim: number; points: { word: string; pairId: number; x: number; y: number; color: string; }[]; }
export interface ProfessionConnectData extends BaseActivityData { gridDim: number; points: { label: string; imageDescription: string; imagePrompt: string; x: number; y: number; pairId: number; }[]; }
export interface MatchstickSymmetryData extends BaseActivityData { puzzles: { id: number; axis: string; lines: { x1: number; y1: number; x2: number; y2: number; color: string; }[]; }[]; }
export interface VisualOddOneOutThemedData extends BaseActivityData { rows: { theme: string; items: { description: string; imagePrompt: string; isOdd: boolean; imageBase64?: string; }[]; }[]; }
export interface PunctuationColoringData extends BaseActivityData { sentences: { text: string; color: string; correctMark: string; }[]; }
export interface SynonymAntonymColoringData extends BaseActivityData { colorKey: { text: string; color: string; }[]; wordsOnImage: { word: string; x: number; y: number; }[]; }
export interface StarHuntData extends BaseActivityData { grid: (string | null)[][]; targetCount: number; }

// --- WORD GAMES DATA TYPES ---
export interface WordSearchData extends BaseActivityData { grid: string[][]; words: string[]; hiddenMessage?: string; followUpQuestion?: string; writingPrompt?: string; theme?: string; prompt?: string; }
export interface WordSearchWithPasswordData extends BaseActivityData { grid: string[][]; words: string[]; passwordCells: { row: number; col: number; }[]; prompt?: string; }
export interface LetterGridWordFindData extends BaseActivityData { grid: string[][]; words: string[]; writingPrompt: string; prompt?: string; }
export interface ThematicWordSearchColorData extends WordSearchData {}
export interface SynonymWordSearchData extends BaseActivityData { grid: string[][]; wordsToMatch: { word: string; synonym: string; }[]; prompt?: string; }
export interface SynonymSearchAndStoryData extends BaseActivityData { grid: string[][]; wordTable: { word: string; synonym: string; }[]; storyPrompt: string; prompt?: string; }
export interface AnagramsData extends BaseActivityData { anagrams: { word: string; scrambled: string; imageBase64: string; }[]; sentencePrompt: string; prompt?: string; }
export interface SpellingCheckData extends BaseActivityData { checks: { correct: string; options: string[]; imageBase64?: string; imagePrompt: string; }[]; }
export interface LetterBridgeData extends BaseActivityData { pairs: { word1: string; word2: string; }[]; followUpPrompt: string; }
export interface WordLadderData extends BaseActivityData { theme: string; ladders: { startWord: string; endWord: string; steps: number; }[]; }
export interface WordFormationData extends BaseActivityData { sets: { letters: string[]; jokerCount: number; }[]; mysteryWordChallenge?: { prompt: string; solution: string; }; }
export interface ReverseWordData extends BaseActivityData { words: string[]; funFact: string; }
export interface WordGroupingData extends BaseActivityData { words: { text: string; imageBase64?: string; imagePrompt: string; }[]; categoryNames: string[]; }
export interface MiniWordGridData extends BaseActivityData { prompt: string; puzzles: { grid: string[][]; start: { row: number; col: number; }; }[]; }
export interface PasswordFinderData extends BaseActivityData { prompt: string; words: { word: string; passwordLetter: string; isProperNoun: boolean; }[]; passwordLength: number; }
export interface SyllableCompletionData extends BaseActivityData { prompt: string; theme: string; wordParts: { first: string; second: string; }[]; syllables: string[]; storyTemplate?: string; storyPrompt: string; }
export interface SpiralPuzzleData extends BaseActivityData { theme: string; prompt: string; clues: string[]; grid: string[][]; wordStarts: { id: number; row: number; col: number; }[]; passwordPrompt: string; }
export interface PunctuationSpiralPuzzleData extends SpiralPuzzleData {}
export interface CrosswordClue { id: number; direction: 'across'|'down'; text: string; start: { row: number; col: number; }; word: string; imageBase64?: string; }
export interface CrosswordData extends BaseActivityData { theme: string; prompt: string; grid: (string|null)[][]; clues: CrosswordClue[]; passwordCells?: { row: number; col: number; }[]; passwordLength?: number; passwordPrompt?: string; }
export interface JumbledWordStoryData extends BaseActivityData { theme: string; prompt: string; puzzles: { jumbled: string[]; word: string; }[]; storyPrompt: string; }
export interface HomonymSentenceData extends BaseActivityData { prompt: string; items: { word: string; meaning1: string; meaning2: string; imageBase64_1?: string; imageBase64_2?: string; }[]; }
export interface WordGridPuzzleData extends BaseActivityData { theme: string; prompt: string; wordList: string[]; grid: (string|null)[][]; unusedWordPrompt: string; }
export interface HomonymImageMatchData extends BaseActivityData { prompt: string; leftImages: { id: number; word: string; imageBase64: string; }[]; rightImages: { id: number; word: string; imageBase64: string; }[]; wordScramble: { letters: string[]; word: string; }; }
export interface AntonymFlowerPuzzleData extends BaseActivityData { prompt: string; puzzles: { centerWord: string; antonym: string; petalLetters: string[]; }[]; passwordLength: number; }
export interface SynonymAntonymGridData extends BaseActivityData { prompt: string; antonyms: { word: string; }[]; synonyms: { word: string; }[]; grid: string[][]; }
export interface ResfebeClue { type: 'text'|'image'; value: string; imageBase64?: string; imagePrompt?: string; }
export interface AntonymResfebeData extends BaseActivityData { prompt: string; puzzles: { word: string; antonym: string; clues: ResfebeClue[]; imagePrompt?: string; }[]; antonymsPrompt: string; }
export interface SynonymMatchingPatternData extends BaseActivityData { theme: string; prompt: string; pairs: { word: string; synonym: string; }[]; }
export interface MissingPartsData extends BaseActivityData { prompt: string; leftParts: { id: number; text: string; }[]; rightParts: { id: number; text: string; }[]; givenParts: { word: string; parts: string[]; }[]; }
export interface WordWebData extends BaseActivityData { prompt: string; wordsToFind: string[]; grid: string[][]; keyWordPrompt: string; }
export interface SyllableWordSearchData extends BaseActivityData { prompt: string; syllablesToCombine: string[]; wordsToCreate: { syllable1: string; syllable2: string; answer: string; }[]; wordsToFindInSearch: string[]; grid: string[][]; passwordPrompt: string; }
export interface WordWebWithPasswordData extends BaseActivityData { prompt: string; words: string[]; grid: string[][]; passwordColumnIndex: number; }
export interface WordPlacementPuzzleData extends BaseActivityData { prompt: string; grid: (string|null)[][]; wordGroups: { length: number; words: string[]; }[]; unusedWordPrompt: string; }
export interface PositionalAnagramData extends BaseActivityData { prompt: string; puzzles: { id: number; scrambled: string; answer: string; }[]; }
export interface ImageAnagramSortData extends BaseActivityData { prompt: string; cards: { imageDescription: string; imageBase64?: string; imagePrompt?: string; scrambledWord: string; correctWord: string; }[]; }
export interface AnagramImageMatchData extends BaseActivityData { prompt: string; wordBank: string[]; puzzles: { imageDescription: string; imageBase64?: string; imagePrompt?: string; partialAnswer: string; correctWord: string; }[]; }
export interface ResfebeData extends BaseActivityData { prompt: string; puzzles: { clues: ResfebeClue[]; answer: string; }[]; }

// --- MEMORY & ATTENTION DATA TYPES ---
export interface WordMemoryItem { text: string; imagePrompt?: string; }
export interface WordMemoryData extends BaseActivityData { memorizeTitle: string; testTitle: string; wordsToMemorize: WordMemoryItem[]; testWords: WordMemoryItem[]; }
export interface VisualMemoryData extends BaseActivityData { memorizeTitle: string; testTitle: string; itemsToMemorize: { description: string; imagePrompt?: string; }[]; testItems: { description: string; imagePrompt?: string; }[]; }
export interface NumberSearchData extends BaseActivityData { numbers: number[]; range: { start: number; end: number; }; }
export interface FindDuplicateData extends BaseActivityData { rows: string[][]; }
export interface LetterGridTestData extends BaseActivityData { grid: string[][]; targetLetters: string[]; }
export interface FindLetterPairData extends BaseActivityData { grid: string[][]; targetPair: string; }
export interface TargetSearchData extends BaseActivityData { grid: string[][]; target: string; distractor: string; }
export interface ColorWheelMemoryData extends BaseActivityData { memorizeTitle: string; testTitle: string; items: { name: string; color: string; imagePrompt?: string; }[]; }
export interface ImageComprehensionData extends BaseActivityData { memorizeTitle: string; testTitle: string; sceneDescription: string; imageBase64?: string; questions: string[]; }
export interface CharacterMemoryData extends BaseActivityData { memorizeTitle: string; testTitle: string; charactersToMemorize: { description: string; imageBase64?: string; imagePrompt?: string; }[]; testCharacters: { description: string; imageBase64?: string; imagePrompt?: string; }[]; }
export interface StroopTestData extends BaseActivityData { items: { text: string; color: string; }[]; }
export interface ChaoticNumberSearchData extends BaseActivityData { prompt: string; numbers: { value: number; x: number; y: number; size: number; rotation: number; color: string; }[]; range: { start: number; end: number; }; }

// --- DYSLEXIA SUPPORT DATA TYPES ---
export interface ReadingFlowData extends BaseActivityData { prompt?: string; text: { paragraphs: { sentences: { syllables: { text: string; color: string; }[] }[] }[] }; }
export interface LetterDiscriminationData extends BaseActivityData { targetLetters: string[]; rows: { letters: string[]; targetCount: number; }[]; prompt?: string; }
export interface RapidNamingData extends BaseActivityData { grid: { items: { type: 'icon'|'color'|'number'; value: string; label: string; }[] }; type: 'color'|'object'|'number'; prompt?: string; }
export interface PhonologicalAwarenessData extends BaseActivityData { exercises: { type: string; question: string; word: string; options: (string|number)[]; answer: string|number; }[]; prompt?: string; }
export interface MirrorLettersData extends BaseActivityData { targetPair: string; rows: { items: { letter: string; isMirrored: boolean; rotation: number; }[] }[]; }
export interface SyllableTrainData extends BaseActivityData { trains: { word: string; syllables: string[]; }[]; }
export interface VisualTrackingLineData extends BaseActivityData { width: number; height: number; paths: { id: number; color: string; d: string; startLabel: string; endLabel: string; }[]; }
export interface BackwardSpellingData extends BaseActivityData { items: { reversed: string; correct: string; }[]; }
export interface CodeReadingData extends BaseActivityData { keyMap: { symbol: string; value: string; color: string; }[]; codesToSolve: { sequence: string[]; answer: string; }[]; }
export interface AttentionToQuestionData extends BaseActivityData { subType: 'letter-cancellation'|'path-finding'|'visual-logic'; grid?: string[][]; targetChars?: string[]; password?: string; pathGrid?: string[][]; logicItems?: { id: number; isOdd: boolean; correctAnswer: string; shapes: any[]; }[]; }
export interface AttentionDevelopmentData extends BaseActivityData { puzzles: { riddle: string; boxes: { label: string; numbers: number[]; }[]; options: string[]; answer: string; }[]; }
export interface AttentionFocusData extends BaseActivityData { puzzles: { riddle: string; boxes: { title?: string; items: string[]; }[]; options: string[]; answer: string; }[]; }

// --- READING COMPREHENSION DATA TYPES ---
export interface MultipleChoiceStoryQuestion { type: 'multiple-choice'; question: string; options: string[]; answerIndex: number; }
export interface OpenEndedStoryQuestion { type: 'open-ended'; question: string; }
export type StoryQuestion = MultipleChoiceStoryQuestion | OpenEndedStoryQuestion;
export interface StoryData extends BaseActivityData { story: string; mainIdea: string; characters: string[]; setting: string; questions: StoryQuestion[]; }
export interface StoryAnalysisData extends BaseActivityData { story: string; analysisQuestions: { type: string; question: string; }[]; }
export interface StoryCreationPromptData extends BaseActivityData { prompt: string; keywords: string[]; }
export interface WordsInStoryData extends BaseActivityData { story: string; questions: { word: string; question: string; }[]; }
export interface StorySequencingData extends BaseActivityData { prompt: string; panels: { id: string; description: string; imageBase64?: string; imagePrompt?: string; }[]; }
export interface ProverbFillData extends BaseActivityData { proverbs: { start: string; end: string; full: string; }[]; meaning: string; usagePrompt: string; }
export interface ProverbSayingSortData extends BaseActivityData { prompt: string; items: { text: string; type: 'atasözü'|'özdeyiş'; }[]; }
export interface ProverbWordChainData extends BaseActivityData { prompt: string; wordCloud: { word: string; color: string; }[]; solutions: string[]; }
export interface ProverbSentenceFinderData extends ProverbWordChainData {}
export interface ProverbSearchData extends BaseActivityData { grid: string[][]; proverb: string; meaning: string; }

// --- NEW ACTIVITY TYPES ---
export interface FamilyRelationsData extends BaseActivityData { leftColumn: { text: string; id: number; }[]; rightColumn: { text: string; id: number; }[]; }
export interface LogicDeductionData extends BaseActivityData { questions: { riddle: string; options: string[]; answerIndex: number; correctLetter: string; }[]; scoringText?: string; }
export interface NumberBoxLogicData extends BaseActivityData { puzzles: { box1: number[]; box2: number[]; questions: { text: string; options: string[]; correctAnswer: string; }[]; }[]; }
export interface MapInstructionData extends BaseActivityData { mapSvg?: string; cities: { name: string; x: number; y: number; }[]; instructions: string[]; }
export interface MindGamesData extends BaseActivityData { puzzles: { type: string; shape?: string; numbers?: (number|string)[]; grid?: (number|string|null)[][]; input?: number; output?: string; rule?: string; question?: string; answer: string; hint?: string; imagePrompt: string; imageBase64?: string; }[]; }
export interface MindGames56Data extends BaseActivityData { puzzles: { type: string; title: string; question: string; answer: string; hint?: string; imagePrompt: string; imageBase64?: string; }[]; }

// --- DYSCALCULIA SPECIFIC TYPES ---
export interface NumberSenseData extends BaseActivityData { layout: 'list'|'visual'; exercises: { type: string; values: number[]; target: number; visualType: string; step?: number; }[]; }
export interface VisualArithmeticData extends BaseActivityData { layout: 'visual'; problems: { num1: number; num2: number; operator: string; answer: number; visualType: VisualMathType; imagePrompt: string; }[]; }
export type VisualMathType = 'objects' | 'ten-frame' | 'number-bond' | 'dice' | 'mixed' | 'blocks' | 'number-line-advanced' | 'estimation-jar';
export interface SpatialGridData extends BaseActivityData { layout: 'grid'; gridSize: number; cubeData?: number[][]; tasks: { type: string; grid: any; instruction: string; target: { r: number; c: number; }; }[]; }
export interface ConceptMatchData extends BaseActivityData { layout: 'list'|'visual'; pairs: { item1: string; item2: string; type: string; imagePrompt1?: string; }[]; }
export interface EstimationData extends BaseActivityData { layout: 'visual'; items: { count: number; visualType: string; options: number[]; imagePrompt: string; }[]; }

export type SingleWorksheetData = 
    | NumberPatternData | ShapeNumberPatternData | MathPuzzleData | FutoshikiData | NumberPyramidData | NumberCapsuleData | OddEvenSudokuData 
    | RomanNumeralConnectData | RomanNumeralStarHuntData | RoundingConnectData | ArithmeticConnectData | RomanNumeralMultiplicationData 
    | KendokuData | OperationSquareFillInData | MultiplicationWheelData | TargetNumberData | ShapeSudokuData | VisualNumberPatternData 
    | LogicGridPuzzleData | OddOneOutData | ShapeCountingData | ThematicOddOneOutData | ThematicOddOneOutSentenceData | ColumnOddOneOutSentenceData 
    | PunctuationMazeData | PunctuationPhoneNumberData | BasicOperationsData | RealLifeProblemData | RomanArabicMatchConnectData | WeightConnectData 
    | LengthConnectData | FindTheDifferenceData | WordComparisonData | ShapeMatchingData | FindIdenticalWordData | GridDrawingData | SymbolCipherData 
    | BlockPaintingData | VisualOddOneOutData | SymmetryDrawingData | FindDifferentStringData | DotPaintingData | AbcConnectData | CoordinateCipherData 
    | WordConnectData | ProfessionConnectData | MatchstickSymmetryData | VisualOddOneOutThemedData | PunctuationColoringData | SynonymAntonymColoringData 
    | StarHuntData | StoryData | StoryAnalysisData | StoryCreationPromptData | WordsInStoryData | StorySequencingData | ProverbFillData | ProverbSayingSortData 
    | ProverbWordChainData | ProverbSentenceFinderData | ProverbSearchData | WordSearchData | WordSearchWithPasswordData | LetterGridWordFindData 
    | ThematicWordSearchColorData | SynonymWordSearchData | SynonymSearchAndStoryData | AnagramsData | SpellingCheckData | LetterBridgeData | WordLadderData 
    | WordFormationData | ReverseWordData | WordGroupingData | MiniWordGridData | PasswordFinderData | SyllableCompletionData | SpiralPuzzleData 
    | PunctuationSpiralPuzzleData | CrosswordData | JumbledWordStoryData | HomonymSentenceData | WordGridPuzzleData | HomonymImageMatchData 
    | AntonymFlowerPuzzleData | SynonymAntonymGridData | AntonymResfebeData | SynonymMatchingPatternData | MissingPartsData | WordWebData 
    | SyllableWordSearchData | WordWebWithPasswordData | WordPlacementPuzzleData | PositionalAnagramData | ImageAnagramSortData | AnagramImageMatchData 
    | ResfebeData | WordMemoryData | VisualMemoryData | NumberSearchData | FindDuplicateData | LetterGridTestData | FindLetterPairData | TargetSearchData 
    | ColorWheelMemoryData | ImageComprehensionData | CharacterMemoryData | StroopTestData | ChaoticNumberSearchData | ReadingFlowData | LetterDiscriminationData 
    | RapidNamingData | PhonologicalAwarenessData | MirrorLettersData | SyllableTrainData | VisualTrackingLineData | BackwardSpellingData | CodeReadingData 
    | AttentionToQuestionData | AttentionDevelopmentData | AttentionFocusData | NumberSenseData | VisualArithmeticData | SpatialGridData | ConceptMatchData 
    | EstimationData | FamilyRelationsData | LogicDeductionData | NumberBoxLogicData | MapInstructionData | MindGamesData | MindGames56Data;

export type WorksheetData = SingleWorksheetData[];

export interface SavedWorksheet {
  id: string;
  userId: string;
  name: string;
  activityType: ActivityType;
  worksheetData: SingleWorksheetData[]; 
  createdAt: string;
  icon: string;
  category: {
    id: string;
    title: string;
  };
  sharedBy?: string;
  sharedByName?: string;
  sharedWith?: string;
}

export interface HistoryItem {
  id: string;
  userId: string;
  activityType: ActivityType;
  data: SingleWorksheetData[];
  timestamp: string;
  title: string;
  category: {
      id: string;
      title: string;
  };
}
