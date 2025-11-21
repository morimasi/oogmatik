

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
  PROVERB_SENTENCE_FINDER = 'PROVERB_SENTENCE_FINDER',
  SYNONYM_SEARCH_STORY = 'SYNONYM_SEARCH_STORY',
  COLUMN_ODD_ONE_OUT_SENTENCE = 'COLUMN_ODD_ONE_OUT_SENTENCE',
  SYNONYM_ANTONYM_COLORING = 'SYNONYM_ANTONYM_COLORING',
  PUNCTUATION_PHONE_NUMBER = 'PUNCTUATION_PHONE_NUMBER',
  PUNCTUATION_SPIRAL_PUZZLE = 'PUNCTUATION_SPIRAL_PUZZLE',
  THEMATIC_JUMBLED_WORD_STORY = 'THEMATIC_JUMBLED_WORD_STORY',
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
  SUDOKU_6X6_SHADED = 'SUDOKU_6X6_SHADED',
  KENDOKU = 'KENDOKU',
  DIVISION_PYRAMID = 'DIVISION_PYRAMID',
  MULTIPLICATION_PYRAMID = 'MULTIPLICATION_PYRAMID',
  OPERATION_SQUARE_SUBTRACTION = 'OPERATION_SQUARE_SUBTRACTION',
  OPERATION_SQUARE_FILL_IN = 'OPERATION_SQUARE_FILL_IN',
  MULTIPLICATION_WHEEL = 'MULTIPLICATION_WHEEL',
  TARGET_NUMBER = 'TARGET_NUMBER',
  OPERATION_SQUARE_MULT_DIV = 'OPERATION_SQUARE_MULT_DIV',
  SHAPE_SUDOKU = 'SHAPE_SUDOKU',
  WEIGHT_CONNECT = 'WEIGHT_CONNECT',
  RESFEBE = 'RESFEBE',
  FUTOSHIKI_LENGTH = 'FUTOSHIKI_LENGTH',
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
  // DYSLEXIA SUPPORT MODULES
  READING_FLOW = 'READING_FLOW',
  LETTER_DISCRIMINATION = 'LETTER_DISCRIMINATION',
  RAPID_NAMING = 'RAPID_NAMING',
  PHONOLOGICAL_AWARENESS = 'PHONOLOGICAL_AWARENESS'
}

export type AppTheme = 'light' | 'dark' | 'contrast' | 'pastel' | 'sepia';

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

// --- USER & AUTH TYPES ---
export type UserRole = 'user' | 'admin';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    createdAt: string;
    worksheetCount: number; // Stats
}

export interface FeedbackItem {
    id: string;
    userId?: string;
    userEmail?: string; // For non-logged in or fallback
    activityType: string | null;
    rating: number;
    message: string;
    timestamp: string;
    status: 'new' | 'read' | 'archived';
}

// --- BASE INTERFACES ---
export interface BaseActivityData {
    title: string;
    instruction?: string;
    pedagogicalNote?: string;
}

// --- DYSLEXIA SUPPORT TYPES ---
export interface ReadingFlowData extends BaseActivityData {
    prompt: string;
    text: {
        paragraphs: {
            sentences: {
                syllables: { text: string; color: string }[];
            }[];
        }[];
    };
    readingSpeedTarget?: string;
}

export interface LetterDiscriminationData extends BaseActivityData {
    prompt: string;
    targetLetters: string[]; // e.g. ['b', 'd']
    rows: {
        letters: string[];
        targetCount: number;
    }[];
}

export interface RapidNamingData extends BaseActivityData {
    prompt: string;
    grid: {
        items: { type: 'color' | 'icon' | 'number' | 'letter'; value: string; label: string }[];
    };
    type: 'color' | 'object' | 'number' | 'letter';
}

export interface PhonologicalAwarenessData extends BaseActivityData {
    prompt: string;
    exercises: {
        type: 'syllable-counting' | 'rhyming';
        question: string;
        word: string;
        imagePrompt?: string;
        imageBase64?: string;
        options: number[] | string[]; // numbers for counting, strings for rhyming
        answer: number | string;
    }[];
}

// ... (Existing interfaces remain the same, omitted for brevity but they are implicitly here) ...
// --- 1. Find The Difference & Word Comparison ---
export interface FindTheDifferenceData extends BaseActivityData {
  rows: {
    items: string[];
    correctIndex: number;
    visualDistractionLevel: 'low' | 'medium' | 'high'; 
  }[];
}

export interface WordComparisonData extends BaseActivityData {
    box1Title: string;
    box2Title: string;
    wordList1: string[];
    wordList2: string[];
    correctDifferences: string[]; 
}

// --- 2. Shape & Object Matching ---
export type ShapeType = 'circle' | 'square' | 'triangle' | 'hexagon' | 'star' | 'diamond' | 'pentagon' | 'octagon' | 'cube' | 'sphere' | 'pyramid' | 'cone' | 'heart' | 'cloud' | 'moon';

export interface ShapeMatchingData extends BaseActivityData {
    leftColumn: { id: number | string; shapes: ShapeType[]; color?: string }[];
    rightColumn: { id: string; shapes: ShapeType[]; color?: string }[];
    complexity: number; 
}

export interface FindIdenticalWordData extends BaseActivityData {
    groups: {
        words: [string, string]; 
        distractors: string[]; 
    }[];
}

// --- 3. Drawing & Copying Skills ---
export interface GridDrawingData extends BaseActivityData {
    gridDim: number;
    drawings: {
        lines: [number, number][][]; 
        complexityLevel: string; 
    }[];
}

export interface SymmetryDrawingData extends BaseActivityData {
    gridDim: number;
    dots: { x: number; y: number; color?: string }[];
    lines?: { x1: number; y1: number; x2: number; y2: number }[];
    axis: 'vertical' | 'horizontal';
    isMirrorImage: boolean; 
}

export interface MatchstickSymmetryData extends BaseActivityData {
    puzzles: {
      id: number;
      lines: { x1: number; y1: number; x2: number; y2: number; color?: string }[];
      axis: 'vertical' | 'horizontal';
    }[];
}

// --- 4. Visual Discrimination & Logic ---
export interface SymbolCipherData extends BaseActivityData {
    cipherKey: { shape: ShapeType; letter: string; color?: string }[];
    wordsToSolve: { shapeSequence: ShapeType[]; wordLength: number; answer: string }[];
}

export interface VisualOddOneOutData extends BaseActivityData {
    rows: {
        items: {
            segments: boolean[]; 
            rotation?: number;
        }[];
        correctIndex: number;
        reason: string; 
    }[];
}

export interface VisualOddOneOutThemedData extends BaseActivityData {
    rows: {
        theme: string;
        items: {
            description: string;
            imagePrompt?: string;
            imageBase64?: string;
            isOdd: boolean;
        }[];
    }[];
}

// --- 5. Spatial Relations & Scanning ---
export interface BlockPaintingData extends BaseActivityData {
    grid: { rows: number; cols: number };
    targetPattern: number[][]; 
    shapes: {
        id: number;
        color: string; 
        pattern: number[][]; 
        count: number; 
    }[];
}

export interface ShapeCountingData extends BaseActivityData {
    figures: {
        svgPaths: { d: string; fill: string; stroke?: string }[];
        targetShape: ShapeType | 'triangle';
        correctCount: number;
    }[];
}

export interface DotPaintingData extends BaseActivityData {
    prompt1: string;
    prompt2: string; 
    svgViewBox: string;
    gridPaths: string[];
    dots: {
        cx: number;
        cy: number;
        color: string;
    }[];
    hiddenImageName: string; 
}

export interface StarHuntData extends BaseActivityData {
    grid: (ShapeType | 'star' | 'question' | null)[][];
    targetCount: number;
}

// --- 6. Connecting & Maze ---
export interface AbcConnectData extends BaseActivityData {
    puzzles: {
        id: number;
        gridDim: number;
        points: {
            label: string;
            x: number;
            y: number;
            color?: string;
        }[];
        paths?: { x: number; y: number }[][]; 
    }[];
}

export interface WordConnectData extends BaseActivityData {
    gridDim: number;
    points: {
        word: string;
        pairId: number;
        x: number;
        y: number;
        color?: string;
    }[];
}

export interface CoordinateCipherData extends BaseActivityData {
    grid: string[][];
    wordsToFind: string[];
    cipherCoordinates: string[];
    decodedMessage: string;
}

export interface ProfessionConnectData extends BaseActivityData {
    gridDim: number;
    points: {
        label: string;
        imageDescription: string;
        imagePrompt?: string;
        imageBase64?: string;
        x: number;
        y: number;
        pairId: number;
    }[];
}

export interface FindDifferentStringData extends BaseActivityData {
    rows: {
        items: string[];
        correctIndex: number;
    }[];
}

export interface PunctuationColoringData extends BaseActivityData {
    sentences: {
        text: string;
        color: string;
        correctMark: string;
    }[];
}

export interface SynonymAntonymColoringData extends BaseActivityData {
    colorKey: {
        text: string;
        color: string;
    }[];
    wordsOnImage: {
        word: string;
        x: number;
        y: number;
    }[];
}

// --- MATH & LOGIC GAMES ---
export interface MathPuzzleObject { name: string; imagePrompt?: string; imageBase64?: string; }
export interface MathPuzzleItem { problem: string; question: string; answer: string; objects?: MathPuzzleObject[]; }
export interface MathPuzzleData extends BaseActivityData { puzzles: MathPuzzleItem[]; }
export interface NumberPatternData extends BaseActivityData { patterns: { sequence: string; answer: string; }[]; }
export interface OddOneOutData extends BaseActivityData { groups: { words: string[]; }[]; }
export interface FutoshikiData extends BaseActivityData { prompt: string; puzzles: { size: number; numbers: (number | null)[][]; constraints: { row1: number; col1: number; row2: number; col2: number; symbol: '>' | '<'; }[]; }[]; }
export interface NumberPyramidData extends BaseActivityData { prompt: string; pyramids: { title: string; rows: (number | null)[][]; }[]; }
export interface NumberCapsuleData extends BaseActivityData { prompt: string; puzzles: { title: string; numbersToUse: string; grid: (number | null)[][]; capsules: { cells: { row: number; col: number }[]; sum: number; }[]; }[]; }
export interface OddEvenSudokuData extends BaseActivityData { prompt: string; puzzles: { title: string; numbersToUse: string; grid: (number | null)[][]; constrainedCells: { row: number; col: number }[]; }[]; }
export interface RomanNumeralConnectData extends BaseActivityData { prompt: string; puzzles: { title: string; gridDim: number; points: { label: string; x: number; y: number; }[]; }[]; }
export interface RomanNumeralStarHuntData extends BaseActivityData { prompt: string; grid: (string | null)[][]; starCount: number; }
export interface RoundingConnectData extends BaseActivityData { prompt: string; example: string; numbers: { value: number; group: number; x: number; y: number; }[]; }
export interface RomanNumeralMultiplicationData extends BaseActivityData { prompt: string; puzzles: { row1: (string | number | null); row2: (string | number | null); col1: (string | number | null); col2: (string | number | null); results: { r1c1: (string | number | null); r1c2: (string | number | null); r2c1: (string | number | null); r2c2: (string | number | null); } }[]; }
export interface ArithmeticConnectData extends BaseActivityData { prompt: string; example: string; expressions: { text: string; value: number; group: number; x: number; y: number; }[]; }
export interface RomanArabicMatchConnectData extends BaseActivityData { prompt: string; gridDim: number; points: { label: string; pairId: number; x: number; y: number; }[]; }
export interface Sudoku6x6ShadedData extends BaseActivityData { prompt: string; puzzles: { grid: (number | null)[][]; shadedCells: { row: number; col: number }[]; }[]; }
export interface KendokuData extends BaseActivityData { prompt: string; puzzles: { size: number; grid: (number | null)[][]; cages: { cells: { row: number; col: number }[]; operation: '+' | '−' | '×' | '÷'; target: number; }[]; }[]; }
export interface DivisionPyramidData extends BaseActivityData { prompt: string; pyramids: { rows: (number | null)[][]; }[]; }
export interface MultiplicationPyramidData extends BaseActivityData { prompt: string; pyramids: { rows: (number | null)[][]; }[]; }
export interface OperationSquareSubtractionData extends BaseActivityData { prompt: string; puzzles: { grid: (string | null)[][]; }[]; }
export interface OperationSquareFillInData extends BaseActivityData { prompt: string; puzzles: { grid: (string | null)[][]; numbersToUse: number[]; results: (number | null)[]; }[]; }
export interface MultiplicationWheelData extends BaseActivityData { prompt: string; puzzles: { outerNumbers: (number | null)[]; innerResult: number; }[]; }
export interface TargetNumberData extends BaseActivityData { prompt: string; puzzles: { target: number; givenNumbers: number[]; }[]; }
export interface OperationSquareMultDivData extends BaseActivityData { prompt: string; puzzles: { grid: (string | null)[][]; }[]; }
export interface ShapeSudokuData extends BaseActivityData { prompt: string; puzzles: { grid: (ShapeType | null)[][]; shapesToUse: { shape: ShapeType; label: string; }[]; }[]; }
export interface WeightConnectDataPoint { label: string; pairId: number; x: number; y: number; imagePrompt?: string; imageBase64?: string; }
export interface WeightConnectData extends BaseActivityData { prompt: string; gridDim: number; points: WeightConnectDataPoint[]; }
export interface ResfebeClue { type: 'text' | 'image'; value: string; imageBase64?: string; }
export interface ResfebeData extends BaseActivityData { prompt: string; puzzles: { clues: ResfebeClue[]; answer: string; }[]; }
export interface FutoshikiLengthData extends BaseActivityData { prompt: string; puzzles: { size: number; units: (string | null)[][]; constraints: { row1: number; col1: number; row2: number; col2: number; symbol: '>' | '<'; }[]; }[]; }
export interface WordWebData extends BaseActivityData { prompt: string; wordsToFind: string[]; grid: (string | null)[][]; keyWordPrompt: string; }
export interface LengthConnectDataPoint { label: string; pairId: number; x: number; y: number; imagePrompt?: string; imageBase64?: string; }
export interface LengthConnectData extends BaseActivityData { prompt: string; gridDim: number; points: LengthConnectDataPoint[]; }
export interface VisualNumberPatternData extends BaseActivityData { prompt: string; puzzles: { items: { number: number; color: string; size: number; }[]; rule: string; answer: number; }[]; }
export interface MissingPartsData extends BaseActivityData { prompt: string; leftParts: { id: number; text: string }[]; rightParts: { id: number; text: string }[]; givenParts: { word: string; parts: string[] }[]; }
export interface LogicGridPuzzleData extends BaseActivityData { prompt: string; clues: string[]; people: string[]; categories: { title: string; items: { name: string; imageDescription: string; imageBase64?: string; }[]; }[]; }
export interface ThematicOddOneOutWord { text: string; imagePrompt?: string; imageBase64?: string; }
export interface ThematicOddOneOutData extends BaseActivityData { prompt: string; theme: string; rows: { words: ThematicOddOneOutWord[]; oddWord: string; }[]; sentencePrompt: string; }
export interface ThematicOddOneOutSentenceData extends BaseActivityData { prompt: string; rows: { words: string[]; oddWord: string; }[]; sentencePrompt: string; }
export interface ColumnOddOneOutSentenceData extends BaseActivityData { prompt: string; columns: { words: string[]; oddWord: string; }[]; sentencePrompt: string; }
export interface PunctuationMazeData extends BaseActivityData { prompt: string; punctuationMark: string; rules: { id: number; text: string; isCorrect: boolean; }[]; }
export interface PunctuationPhoneNumberData extends BaseActivityData { prompt: string; instruction: string; clues: { id: number; text: string; }[]; solution: { punctuationMark: string; number: number; }[]; }
export interface ShapeNumberPatternData extends BaseActivityData { patterns: { shapes: { type: 'triangle'; numbers: (number | string)[]; }[]; }[]; }


// Other Exports
export interface WordSearchData extends BaseActivityData { grid: string[][]; words: string[]; hiddenMessage?: string; followUpQuestion?: string; writingPrompt?: string; }
export interface AnagramItem { word: string; scrambled: string; imageBase64?: string; }
export interface AnagramsData extends BaseActivityData { prompt: string; anagrams: AnagramItem[]; sentencePrompt: string; }
export interface MultipleChoiceStoryQuestion { type: 'multiple-choice'; question: string; options: string[]; answerIndex: number; }
export interface OpenEndedStoryQuestion { type: 'open-ended'; question: string; }
export type StoryQuestion = MultipleChoiceStoryQuestion | OpenEndedStoryQuestion;
export interface StoryData extends BaseActivityData { story: string; imageBase64?: string; mainIdea: string; characters: string[]; setting: string; questions: StoryQuestion[]; }
export interface StroopTestData extends BaseActivityData { items: { text: string; color: string; }[]; }
export interface SpellingCheckItem { correct: string; options: string[]; imagePrompt?: string; imageBase64?: string; }
export interface SpellingCheckData extends BaseActivityData { checks: SpellingCheckItem[]; }
export interface LetterGridTestData extends BaseActivityData { grid: string[][]; targetLetters: string[]; }
export interface NumberSearchData extends BaseActivityData { numbers: (number | string)[]; range: { start: number; end: number; } }
export interface WordMemoryItem { text: string; imagePrompt?: string; imageBase64?: string; }
export interface WordMemoryData extends BaseActivityData { memorizeTitle: string; testTitle: string; wordsToMemorize: WordMemoryItem[]; testWords: WordMemoryItem[]; }
export interface StoryCreationPromptData extends BaseActivityData { prompt: string; keywords: string[]; imageBase64?: string; }
export interface WordsInStoryData extends BaseActivityData { story: string; questions: { word: string; question: string; }[]; imagePrompt?: string; imageBase64?: string; }
export interface ProverbFillData extends BaseActivityData { proverbs: { start: string; end: string; full: string; }[]; meaning: string; usagePrompt: string; imagePrompt?: string; imageBase64?: string; }
export interface LetterBridgeData extends BaseActivityData { pairs: { word1: string; word2: string; }[]; followUpPrompt?: string; }
export interface FindDuplicateData extends BaseActivityData { rows: string[][]; }
export interface WordLadderData extends BaseActivityData { theme?: string; ladders: { startWord: string; endWord: string; steps: number; }[]; }
export interface WordFormationData extends BaseActivityData { sets: { letters: string[]; jokerCount: number; }[]; mysteryWordChallenge?: { prompt: string; solution: string; }; }
export interface ReverseWordData extends BaseActivityData { words: string[]; funFact?: string; }
export interface FindLetterPairData extends BaseActivityData { grid: string[][]; targetPair: string; }
export interface WordGroupItem { text: string; imagePrompt?: string; imageBase64?: string; }
export interface WordGroupingData extends BaseActivityData { words: WordGroupItem[]; categoryNames: string[]; }
export interface VisualMemoryItem { description: string; imagePrompt?: string; imageBase64?: string; }
export interface VisualMemoryData extends BaseActivityData { memorizeTitle: string; testTitle: string; itemsToMemorize: VisualMemoryItem[]; testItems: VisualMemoryItem[]; }
export interface StoryAnalysisData extends BaseActivityData { story: string; imageBase64?: string; analysisQuestions: { type: 'tema' | 'karakter' | 'sebep-sonuç' | 'çıkarım'; question: string; }[]; }
export interface ProverbSearchData extends BaseActivityData { grid: string[][]; proverb: string; meaning: string; }
export interface TargetSearchData extends BaseActivityData { grid: string[][]; target: string; distractor: string; }
export interface ColorWheelObject { name: string; color: string; imagePrompt?: string; imageBase64?: string; }
export interface ColorWheelMemoryData extends BaseActivityData { memorizeTitle: string; testTitle: string; items: ColorWheelObject[]; }
export interface ImageComprehensionData extends BaseActivityData { memorizeTitle: string; testTitle: string; sceneDescription: string; imageBase64?: string; questions: string[]; }
export interface CharacterObject { description: string; imageBase64?: string; }
export interface CharacterMemoryData extends BaseActivityData { memorizeTitle: string; testTitle: string; charactersToMemorize: CharacterObject[]; testCharacters: CharacterObject[]; }
export interface StorySequencingData extends BaseActivityData { prompt: string; panels: { id: string; description: string; imageBase64?: string; }[]; }
export interface ChaoticNumberSearchData extends BaseActivityData { prompt: string; numbers: { value: number; x: number; y: number; size: number; rotation: number; color: string; }[]; range: { start: number; end: number; } }
export interface MiniWordGridData extends BaseActivityData { prompt: string; puzzles: { grid: string[][]; start: { row: number; col: number }; }[]; }
export interface PasswordFinderData extends BaseActivityData { prompt: string; words: { word: string; passwordLetter: string; isProperNoun: boolean; }[]; passwordLength: number; }
export interface SyllableCompletionData extends BaseActivityData { prompt: string; theme: string; wordParts: { first: string; second: string; }[]; syllables: string[]; storyTemplate?: string; storyPrompt: string; }
export interface SynonymWordSearchData extends BaseActivityData { prompt: string; wordsToMatch: { word: string; synonym: string; }[]; grid: string[][]; }
export interface SpiralPuzzleData extends BaseActivityData { prompt: string; theme: string; clues: string[]; grid: string[][]; wordStarts: { id: number; row: number; col: number; }[]; passwordPrompt: string; }
export interface CrosswordClue { id: number; direction: 'across' | 'down'; text: string; start: { row: number; col: number }; word: string; imageBase64?: string; }
export interface CrosswordData extends BaseActivityData { prompt: string; theme: string; grid: (string | null)[][]; clues: CrosswordClue[]; passwordCells: { row: number; col: number; }[]; passwordLength: number; passwordPrompt: string; }
export interface JumbledWordStoryData extends BaseActivityData { prompt: string; theme: string; puzzles: { jumbled: string[]; word: string; }[]; storyPrompt: string; }
export interface HomonymSentenceItem { word: string; meaning1: string; imageBase64_1?: string; meaning2: string; meaning2_text?:string; imageBase64_2?: string; } 
export interface HomonymSentenceData extends BaseActivityData { prompt: string; items: HomonymSentenceItem[]; }
export interface WordGridPuzzleData extends BaseActivityData { prompt: string; theme: string; wordList: string[]; grid: (string | null)[][]; unusedWordPrompt: string; }
export interface ProverbSayingSortData extends BaseActivityData { prompt: string; items: { text: string; type: 'atasözü' | 'özdeyiş'; }[]; }
export interface HomonymImageMatchData extends BaseActivityData { prompt: string; leftImages: { id: number; word: string; imageBase64?: string }[]; rightImages: { id: number; word: string; imageBase64?: string }[]; wordScramble: { letters: string[]; word: string; }; }
export interface AntonymFlowerPuzzleData extends BaseActivityData { prompt: string; puzzles: { centerWord: string; antonym: string; petalLetters: string[]; }[]; passwordLength: number; }
export interface ProverbWordChainData extends BaseActivityData { prompt: string; wordCloud: { word: string; color: string; }[]; solutions: string[]; }
export interface SynonymAntonymGridData extends BaseActivityData { prompt: string; antonyms: { word: string }[]; synonyms: { word: string }[]; grid: string[][]; nuanceQuestion?: { sentence: string; word: string; options: string[]; }; }
export interface AntonymResfebeData extends BaseActivityData { prompt: string; puzzles: { word: string; antonym: string; imageBase64?: string; clues: { type: 'text' | 'image'; value: string; }[]; }[]; antonymsPrompt: string; }
export interface ThematicWordSearchColorData extends BaseActivityData { prompt: string; theme: string; words: string[]; grid: string[][]; }
export interface ProverbSentenceFinderData extends BaseActivityData { prompt: string; wordCloud: { word: string; color: string; }[]; solutions: string[]; }
export interface SynonymSearchAndStoryData extends BaseActivityData { prompt: string; wordTable: { word: string; synonym: string; }[]; grid: string[][]; storyPrompt: string; }
export interface PunctuationSpiralPuzzleData extends BaseActivityData { prompt: string; theme: string; clues: string[]; grid: string[][]; wordStarts: { id: number; row: number; col: number; }[]; passwordPrompt: string; }
export interface ThematicJumbledWordStoryData extends BaseActivityData { prompt: string; theme: string; puzzles: { jumbled: string[]; word: string; }[]; storyPrompt: string; }
export interface SynonymMatchingPatternData extends BaseActivityData { prompt: string; theme: string; pairs: { word: string; synonym: string; }[]; }
export interface ImageAnagramSortData extends BaseActivityData { prompt: string; cards: { imageDescription: string; imageBase64?: string; scrambledWord: string; correctWord: string; }[]; }
export interface AnagramImageMatchData extends BaseActivityData { prompt: string; wordBank: string[]; puzzles: { imageDescription: string; imageBase64?: string; partialAnswer: string; correctWord: string; }[]; }
export interface SyllableWordSearchData extends BaseActivityData { prompt: string; syllablesToCombine: string[]; wordsToCreate: { syllable1: string; syllable2: string; answer: string; }[]; wordsToFindInSearch: string[]; grid: string[][]; passwordPrompt: string; }
export interface WordSearchWithPasswordData extends BaseActivityData { prompt: string; grid: string[][]; words: string[]; passwordCells: { row: number; col: number; }[]; }
export interface WordWebWithPasswordData extends BaseActivityData { prompt: string; words: string[]; grid: (string | null)[][]; passwordColumnIndex: number; }
export interface LetterGridWordFindData extends BaseActivityData { prompt: string; words: string[]; grid: string[][]; writingPrompt: string; }
export interface WordPlacementPuzzleData extends BaseActivityData { prompt: string; grid: (string | null)[][]; wordGroups: { length: number; words: string[]; }[]; unusedWordPrompt: string; }
export interface PositionalAnagramData extends BaseActivityData { prompt: string; puzzles: { id: number; scrambled: string; answer: string; }[]; }

export type SingleWorksheetData = 
  | FindTheDifferenceData
  | WordComparisonData
  | ShapeMatchingData
  | FindIdenticalWordData
  | GridDrawingData
  | SymbolCipherData
  | BlockPaintingData
  | VisualOddOneOutData
  | SymmetryDrawingData
  | FindDifferentStringData
  | DotPaintingData
  | AbcConnectData
  | WordConnectData
  | CoordinateCipherData
  | ProfessionConnectData
  | MatchstickSymmetryData
  | VisualOddOneOutThemedData
  | PunctuationColoringData
  | SynonymAntonymColoringData
  | StarHuntData
  | WordSearchData 
  | AnagramsData
  | MathPuzzleData 
  | StoryData 
  | StroopTestData
  | NumberPatternData
  | SpellingCheckData
  | LetterGridTestData
  | NumberSearchData
  | WordMemoryData
  | StoryCreationPromptData
  | WordsInStoryData
  | OddOneOutData
  | ProverbFillData
  | LetterBridgeData
  | FindDuplicateData
  | WordLadderData
  | WordFormationData
  | ReverseWordData
  | FindLetterPairData
  | WordGroupingData
  | VisualMemoryData
  | StoryAnalysisData
  | ProverbSearchData
  | TargetSearchData
  | ShapeNumberPatternData
  | ColorWheelMemoryData
  | ImageComprehensionData
  | CharacterMemoryData
  | StorySequencingData
  | ChaoticNumberSearchData
  | MiniWordGridData
  | ShapeCountingData
  | PasswordFinderData
  | SyllableCompletionData
  | SynonymWordSearchData
  | SpiralPuzzleData
  | CrosswordData
  | JumbledWordStoryData
  | HomonymSentenceData
  | WordGridPuzzleData
  | ProverbSayingSortData
  | HomonymImageMatchData
  | AntonymFlowerPuzzleData
  | ProverbWordChainData
  | ThematicOddOneOutData
  | SynonymAntonymGridData
  | PunctuationMazeData
  | AntonymResfebeData
  | ThematicWordSearchColorData
  | ThematicOddOneOutSentenceData
  | ProverbSentenceFinderData
  | SynonymSearchAndStoryData
  | ColumnOddOneOutSentenceData
  | PunctuationPhoneNumberData
  | PunctuationSpiralPuzzleData
  | ThematicJumbledWordStoryData
  | SynonymMatchingPatternData
  | FutoshikiData
  | NumberPyramidData
  | NumberCapsuleData
  | OddEvenSudokuData
  | RomanNumeralConnectData
  | RomanNumeralStarHuntData
  | RoundingConnectData
  | RomanNumeralMultiplicationData
  | ArithmeticConnectData
  | RomanArabicMatchConnectData
  | Sudoku6x6ShadedData
  | KendokuData
  | DivisionPyramidData
  | MultiplicationPyramidData
  | OperationSquareSubtractionData
  | OperationSquareFillInData
  | MultiplicationWheelData
  | TargetNumberData
  | OperationSquareMultDivData
  | ShapeSudokuData
  | WeightConnectData
  | ResfebeData
  | FutoshikiLengthData
  | WordWebData
  | LengthConnectData
  | VisualNumberPatternData
  | MissingPartsData
  | LogicGridPuzzleData
  | ImageAnagramSortData
  | AnagramImageMatchData
  | SyllableWordSearchData
  | WordSearchWithPasswordData
  | WordWebWithPasswordData
  | LetterGridWordFindData
  | WordPlacementPuzzleData
  | PositionalAnagramData
  | ReadingFlowData
  | LetterDiscriminationData
  | RapidNamingData
  | PhonologicalAwarenessData;

export type WorksheetData = SingleWorksheetData[] | null;

export interface SavedWorksheet {
  id: string;
  userId: string; // New field for user ownership
  name: string;
  activityType: ActivityType;
  worksheetData: SingleWorksheetData[];
  createdAt: string;
  icon: string;
  category: {
    id: string;
    title: string;
  };
}

export interface HistoryItem {
  id: string;
  userId: string; // New field
  activityType: ActivityType;
  data: SingleWorksheetData[];
  timestamp: string;
  title: string;
  category: {
      id: string;
      title: string;
  };
}
