




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
  // New activity types from images
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
}

export type AppTheme = 'light' | 'dark' | 'contrast' | 'pastel' | 'sepia';

// NEW: Interface for dynamic generation options
export interface GeneratorOptions {
    mode: 'ai' | 'fast';
    difficulty: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
    worksheetCount: number;
    timestamp?: number;
    
    // Dynamic fields - keeping this flexible for now
    // as strictly typing it would require a massive union type
    // and complex type guards in the generator view.
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

// Data structures for generated worksheets
export interface WordSearchData {
  title: string;
  grid: string[][];
  words: string[];
  hiddenMessage?: string;
  followUpQuestion?: string;
}

export interface AnagramItem {
  word: string;
  scrambled: string;
  imageBase64?: string;
}

export interface AnagramsData {
  title: string;
  prompt: string;
  anagrams: AnagramItem[];
  sentencePrompt: string;
}

export interface MathPuzzleData {
  title: string;
  puzzles: {
    problem: string;
    question: string;
    answer: string;
  }[];
}

// --- STORY COMPREHENSION: Professional Level Types ---
export interface MultipleChoiceStoryQuestion {
    type: 'multiple-choice';
    question: string;
    options: string[];
    answerIndex: number;
}

export interface OpenEndedStoryQuestion {
    type: 'open-ended';
    question: string;
}

export type StoryQuestion = MultipleChoiceStoryQuestion | OpenEndedStoryQuestion;

export interface StoryData {
  title: string;
  story: string;
  imageBase64?: string; // Optional field for the generated image
  mainIdea: string; // The main idea of the story
  characters: string[]; // List of characters
  setting: string; // Description of the setting
  questions: StoryQuestion[];
}
// --- END STORY COMPREHENSION ---


export interface StroopTestData {
  title: string;
  items: {
    text: string;
    color: string;
  }[];
}

export interface NumberPatternData {
    title: string;
    patterns: {
        sequence: string;
        answer: string;
    }[];
}

export interface SpellingCheckData {
    title: string;
    checks: {
        correct: string;
        options: string[];
    }[];
}

export interface LetterGridTestData {
    title: string;
    grid: string[][];
    targetLetters: string[];
}

export interface NumberSearchData {
    title: string;
    numbers: (number | string)[];
    range: {
        start: number;
        end: number;
    }
}

export interface WordMemoryData {
    title: string;
    memorizeTitle: string;
    testTitle: string;
    wordsToMemorize: string[];
    testWords: string[];
}

export interface StoryCreationPromptData {
    title: string;
    prompt: string;
    keywords: string[];
    imageBase64?: string;
}

export interface FindTheDifferenceData {
  title: string;
  rows: {
    items: string[];
    correctIndex: number;
  }[];
}

export interface WordComparisonData {
    title: string;
    box1Title: string;
    box2Title: string;
    wordList1: string[];
    wordList2: string[];
}

export interface WordsInStoryData {
    title: string;
    story: string;
    questions: {
        word: string;
        question: string; // "Anlamı nedir?" or "Cümle içinde kullan."
    }[];
}

export interface OddOneOutData {
    title: string;
    groups: {
        words: string[];
    }[];
}

export type ShapeType = 'circle' | 'square' | 'triangle' | 'hexagon' | 'star' | 'diamond' | 'pentagon' | 'octagon' | 'cube' | 'sphere' | 'pyramid' | 'cone';

export interface ShapeMatchingData {
    title: string;
    leftColumn: { id: number; shapes: ShapeType[] }[];
    rightColumn: { id: string; shapes: ShapeType[] }[];
}

export interface SymbolCipherData {
    title: string;
    cipherKey: { shape: ShapeType; letter: string }[];
    wordsToSolve: { shapeSequence: ShapeType[]; wordLength: number }[];
}

export interface ProverbFillData {
    title: string;
    proverbs: {
        start: string;
        end: string;
        full: string;
    }[];
    meaning: string;
    usagePrompt: string;
}

export interface LetterBridgeData {
    title: string;
    pairs: {
        word1: string;
        word2: string;
    }[];
    followUpPrompt?: string;
}

export interface FindDuplicateData {
    title: string;
    rows: string[][];
}

export interface WordLadderData {
    title: string;
    theme?: string;
    ladders: {
        startWord: string;
        endWord: string;
        steps: number;
    }[];
}

export interface FindIdenticalWordData {
    title: string;
    groups: {
        words: [string, string];
    }[];
}

export interface WordFormationData {
    title: string;
    sets: {
        letters: string[];
        jokerCount: number;
    }[];
    mysteryWordChallenge?: {
        prompt: string;
        solution: string;
    };
}

export interface ReverseWordData {
    title: string;
    words: string[];
    funFact?: string;
}

export interface FindLetterPairData {
    title: string;
    grid: string[][];
    targetPair: string;
}

export interface WordGroupingData {
    title: string;
    words: string[];
    categoryNames: string[];
}

export interface VisualMemoryData {
    title: string;
    memorizeTitle: string;
    testTitle: string;
    itemsToMemorize: string[];
    testItems: string[];
}

export interface StoryAnalysisData {
    title: string;
    story: string;
    imageBase64?: string;
    analysisQuestions: {
        type: 'tema' | 'karakter' | 'sebep-sonuç' | 'çıkarım';
        question: string;
    }[];
}

export interface CoordinateCipherData {
    title: string;
    grid: string[][];
    wordsToFind: string[];
    cipherCoordinates: string[];
}

export interface ProverbSearchData {
    title: string;
    grid: string[][];
    proverb: string;
    meaning: string;
}

export interface TargetSearchData {
    title: string;
    grid: string[][];
    target: string;
    distractor: string;
}

export interface ShapeNumberPatternData {
    title: string;
    patterns: {
        shapes: { 
            type: 'triangle'; 
            numbers: (number | string)[];
        }[];
    }[];
}

export interface GridDrawingData {
    title: string;
    gridDim: number;
    drawings: {
        lines: [number, number][][];
    }[];
}

export interface ColorWheelObject {
    name: string; // e.g., "Kitap 📕"
    color: string; // e.g., "#FF0000"
}
export interface ColorWheelMemoryData {
    title: string;
    memorizeTitle: string;
    testTitle: string;
    items: ColorWheelObject[];
}

export interface ImageComprehensionData {
    title: string;
    memorizeTitle: string;
    testTitle: string;
    sceneDescription: string;
    imageBase64?: string;
    questions: string[];
}

export interface CharacterObject {
    description: string;
    imageBase64?: string;
}

export interface CharacterMemoryData {
    title: string;
    memorizeTitle: string;
    testTitle: string;
    charactersToMemorize: CharacterObject[];
    testCharacters: CharacterObject[];
}

export interface StorySequencingData {
    title: string;
    prompt: string;
    panels: {
        id: string; // A, B, C...
        description: string;
        imageBase64?: string;
    }[];
}

export interface ChaoticNumberSearchData {
    title: string;
    prompt: string;
    numbers: {
        value: number;
        x: number; // %
        y: number; // %
        size: number; // rem
        rotation: number; // deg
        color: string; // css color
    }[];
    range: {
        start: number;
        end: number;
    }
}

export interface BlockPaintingData {
    title: string;
    prompt: string;
    grid: { rows: number; cols: number };
    shapes: {
        color: string; // CSS color
        pattern: number[][]; 
    }[];
}

export interface MiniWordGridData {
    title: string;
    prompt: string;
    puzzles: {
        grid: string[][];
        start: { row: number; col: number };
    }[];
}

export interface VisualOddOneOutData {
    title: string;
    prompt: string;
    rows: {
        items: {
            segments: boolean[]; 
        }[];
    }[];
}

export interface ShapeCountingData {
    title: string;
    prompt: string;
    figures: {
        svgPaths: { d: string; fill: string }[];
    }[];
}

export interface SymmetryDrawingData {
    title: string;
    prompt: string;
    gridDim: number;
    dots: { x: number; y: number }[];
    axis: 'vertical' | 'horizontal';
}

export interface FindDifferentStringData {
    title: string;
    prompt: string;
    rows: {
        items: string[];
    }[];
}

export interface DotPaintingData {
    title: string;
    prompt1: string;
    prompt2: string;
    svgViewBox: string;
    gridPaths: string[];
    dots: {
        cx: number;
        cy: number;
        color: string;
    }[];
}

export interface AbcConnectData {
    title: string;
    prompt: string;
    puzzles: {
        id: number;
        gridDim: number;
        points: {
            letter: string;
            x: number;
            y: number;
        }[];
    }[];
}

export interface PasswordFinderData {
    title: string;
    prompt: string;
    words: {
        word: string;
        passwordLetter: string;
        isProperNoun: boolean;
    }[];
    passwordLength: number;
}

export interface SyllableCompletionData {
    title: string;
    prompt: string;
    theme: string;
    wordParts: {
        first: string;
        second: string;
    }[];
    syllables: string[];
    storyTemplate?: string;
    storyPrompt: string;
}

export interface SynonymWordSearchData {
    title: string;
    prompt: string;
    wordsToMatch: {
        word: string;
        synonym: string;
    }[];
    grid: string[][];
}

export interface WordConnectData {
    title: string;
    prompt: string;
    gridDim: number;
    points: {
        word: string;
        pairId: number;
        x: number;
        y: number;
    }[];
}

export interface SpiralPuzzleData {
    title: string;
    prompt: string;
    theme: string;
    clues: string[];
    grid: string[][];
    wordStarts: {
        id: number;
        row: number;
        col: number;
    }[];
    passwordPrompt: string;
}

export interface CrosswordClue {
    id: number;
    direction: 'across' | 'down';
    text: string;
    start: { row: number; col: number };
    word: string;
    imageBase64?: string;
}

export interface CrosswordData {
    title: string;
    prompt: string;
    theme: string;
    grid: (string | null)[][];
    clues: CrosswordClue[];
    passwordCells: {
        row: number;
        col: number;
    }[];
    passwordLength: number;
    passwordPrompt: string;
}

export interface JumbledWordStoryData {
    title: string;
    prompt: string;
    theme: string;
    puzzles: {
        jumbled: string[];
        word: string;
    }[];
    storyPrompt: string;
}

export interface HomonymSentenceItem {
    word: string;
    meaning1: string;
    imageBase64_1?: string;
    meaning2: string;
    imageBase64_2?: string;
}

export interface HomonymSentenceData {
    title: string;
    prompt: string;
    items: HomonymSentenceItem[];
}


export interface WordGridPuzzleData {
    title: string;
    prompt: string;
    theme: string;
    wordList: string[];
    grid: (string | null)[][];
    unusedWordPrompt: string;
}

export interface ProverbSayingSortData {
    title: string;
    prompt: string;
    items: {
        text: string;
        type: 'atasözü' | 'özdeyiş';
    }[];
}

export interface HomonymImageMatchData {
    title: string;
    prompt: string;
    leftImages: { id: number; word: string; imageBase64?: string }[];
    rightImages: { id: number; word: string; imageBase64?: string }[];
    wordScramble: {
        letters: string[];
        word: string;
    };
}

export interface AntonymFlowerPuzzleData {
    title: string;
    prompt: string;
    puzzles: {
        centerWord: string;
        antonym: string;
        petalLetters: string[];
    }[];
    passwordLength: number;
}

export interface ProverbWordChainData {
    title: string;
    prompt: string;
    wordCloud: {
        word: string;
        color: string;
    }[];
    solutions: string[];
}

export interface ThematicOddOneOutData {
    title: string;
    prompt: string;
    theme: string;
    rows: {
        words: string[];
        oddWord: string;
    }[];
    sentencePrompt: string;
}

export interface SynonymAntonymGridData {
    title: string;
    prompt: string;
    antonyms: { word: string }[];
    synonyms: { word: string }[];
    grid: string[][];
    nuanceQuestion?: {
        sentence: string;
        word: string;
        options: string[];
    };
}

export interface PunctuationColoringData {
    title: string;
    prompt: string;
    sentences: {
        text: string;
        color: string;
        correctMark: string;
    }[];
}

export interface PunctuationMazeData {
    title: string;
    prompt: string;
    punctuationMark: string;
    rules: {
        id: number;
        text: string;
        isCorrect: boolean;
    }[];
}

export interface AntonymResfebeData {
    title: string;
    prompt: string;
    puzzles: {
        word: string;
        antonym: string;
        imageBase64?: string;
        clues: {
            type: 'text' | 'image';
            value: string;
        }[];
    }[];
    antonymsPrompt: string;
}

export interface ThematicWordSearchColorData {
    title: string;
    prompt: string;
    theme: string;
    words: string[];
    grid: string[][];
}

export interface ThematicOddOneOutSentenceData {
    title: string;
    prompt: string;
    rows: {
        words: string[];
        oddWord: string;
    }[];
    sentencePrompt: string;
}

export interface ProverbSentenceFinderData {
    title: string;
    prompt: string;
    wordCloud: {
        word: string;
        color: string;
    }[];
    solutions: string[];
}

export interface SynonymSearchAndStoryData {
    title: string;
    prompt: string;
    wordTable: {
        word: string;
        synonym: string;
    }[];
    grid: string[][];
    storyPrompt: string;
}

export interface ColumnOddOneOutSentenceData {
    title: string;
    prompt: string;
    columns: {
        words: string[];
        oddWord: string;
    }[];
    sentencePrompt: string;
}

export interface SynonymAntonymColoringData {
    title: string;
    prompt: string;
    colorKey: {
        text: string; // "Cömert'in zıt anlamlısı"
        color: string;
    }[];
    wordsOnImage: {
        word: string; // "Cimri"
        x: number; // percentage
        y: number; // percentage
    }[];
}

export interface PunctuationPhoneNumberData {
    title: string;
    prompt: string;
    instruction: string;
    clues: {
        id: number;
        text: string;
    }[];
    solution: {
        punctuationMark: string;
        number: number;
    }[];
}

export interface PunctuationSpiralPuzzleData {
    title: string;
    prompt: string;
    theme: string;
    clues: string[];
    grid: string[][];
    wordStarts: {
        id: number;
        row: number;
        col: number;
    }[];
    passwordPrompt: string;
}

export interface ThematicJumbledWordStoryData {
    title: string;
    prompt: string;
    theme: string;
    puzzles: {
        jumbled: string[];
        word: string;
    }[];
    storyPrompt: string;
}

export interface SynonymMatchingPatternData {
    title: string;
    prompt: string;
    theme: string;
    pairs: {
        word: string;
        synonym: string;
    }[];
}

export interface FutoshikiData {
    title: string;
    prompt: string;
    puzzles: {
        size: number;
        numbers: (number | null)[][];
        constraints: {
            row1: number; col1: number;
            row2: number; col2: number;
            symbol: '>' | '<';
        }[];
    }[];
}

export interface NumberPyramidData {
    title: string;
    prompt: string;
    pyramids: {
        title: string;
        rows: (number | null)[][];
    }[];
}

export interface NumberCapsuleData {
    title: string;
    prompt: string;
    puzzles: {
        title: string;
        numbersToUse: string;
        grid: (number | null)[][];
        capsules: {
            cells: { row: number; col: number }[];
            sum: number;
        }[];
    }[];
}

export interface OddEvenSudokuData {
    title: string;
    prompt: string;
    puzzles: {
        title: string;
        numbersToUse: string;
        grid: (number | null)[][];
        constrainedCells: { row: number; col: number }[];
    }[];
}

export interface RomanNumeralConnectData {
    title: string;
    prompt: string;
    puzzles: {
        title: string;
        gridDim: number;
        points: {
            label: string; // "I", "II", etc.
            x: number;
            y: number;
        }[];
    }[];
}

export interface RomanNumeralStarHuntData {
    title: string;
    prompt: string;
    grid: (string | null)[][]; // Roman numerals or null
    starCount: number;
}

export interface RoundingConnectData {
    title: string;
    prompt: string;
    example: string;
    numbers: {
        value: number;
        group: number;
        x: number; // %
        y: number; // %
    }[];
}

export interface RomanNumeralMultiplicationData {
    title: string;
    prompt: string;
    puzzles: {
        row1: (string | number | null);
        row2: (string | number | null);
        col1: (string | number | null);
        col2: (string | number | null);
        results: {
            r1c1: (string | number | null);
            r1c2: (string | number | null);
            r2c1: (string | number | null);
            r2c2: (string | number | null);
        }
    }[];
}

export interface ArithmeticConnectData {
    title: string;
    prompt: string;
    example: string;
    expressions: {
        text: string;
        value: number;
        group: number;
        x: number;
        y: number;
    }[];
}

export interface RomanArabicMatchConnectData {
    title: string;
    prompt: string;
    gridDim: number;
    points: {
        label: string;
        pairId: number;
        x: number;
        y: number;
    }[];
}

export interface Sudoku6x6ShadedData {
    title: string;
    prompt: string;
    puzzles: {
        grid: (number | null)[][];
        shadedCells: { row: number; col: number }[];
    }[];
}

export interface KendokuData {
    title: string;
    prompt: string;
    puzzles: {
        size: number;
        grid: (number | null)[][];
        cages: {
            cells: { row: number; col: number }[];
            operation: '+' | '−' | '×' | '÷';
            target: number;
        }[];
    }[];
}

export interface DivisionPyramidData {
    title: string;
    prompt: string;
    pyramids: {
        rows: (number | null)[][];
    }[];
}

export interface MultiplicationPyramidData {
    title: string;
    prompt: string;
    pyramids: {
        rows: (number | null)[][];
    }[];
}

export interface OperationSquareSubtractionData {
    title: string;
    prompt: string;
    puzzles: {
        grid: (string | null)[][];
    }[];
}

export interface OperationSquareFillInData {
    title: string;
    prompt: string;
    puzzles: {
        grid: (string | null)[][];
        numbersToUse: number[];
        results: (number | null)[];
    }[];
}

export interface MultiplicationWheelData {
    title: string;
    prompt: string;
    puzzles: {
        outerNumbers: (number | null)[];
        innerResult: number;
    }[];
}

export interface TargetNumberData {
    title: string;
    prompt: string;
    puzzles: {
        target: number;
        givenNumbers: number[];
    }[];
}

export interface OperationSquareMultDivData {
    title: string;
    prompt: string;
    puzzles: {
        grid: (string | null)[][];
    }[];
}

export interface ShapeSudokuData {
    title: string;
    prompt: string;
    puzzles: {
        grid: (ShapeType | null)[][];
        shapesToUse: {
            shape: ShapeType;
            label: string;
        }[];
    }[];
}

export interface WeightConnectData {
    title: string;
    prompt: string;
    gridDim: number;
    points: {
        label: string;
        pairId: number;
        x: number;
        y: number;
    }[];
}

export interface ResfebeClue {
    type: 'text' | 'image';
    value: string; 
    imageBase64?: string;
}

export interface ResfebeData {
    title: string;
    prompt: string;
    puzzles: {
        clues: ResfebeClue[];
        answer: string;
    }[];
}

export interface FutoshikiLengthData {
    title: string;
    prompt: string;
    puzzles: {
        size: number;
        units: (string | null)[][];
        constraints: {
            row1: number; col1: number;
            row2: number; col2: number;
            symbol: '>' | '<';
        }[];
    }[];
}

export interface MatchstickSymmetryData {
    title: string;
    prompt: string;
    puzzles: {
      number: number;
      lines: { x1: number; y1: number; x2: number; y2: number }[];
    }[];
}

export interface WordWebData {
    title: string;
    prompt: string;
    wordsToFind: string[];
    grid: (string | null)[][];
    keyWordPrompt: string;
}

export interface StarHuntData {
    title: string;
    prompt: string;
    grid: (ShapeType | 'star' | 'question' | null)[][];
}

export interface LengthConnectData {
    title: string;
    prompt: string;
    gridDim: number;
    points: {
        label: string;
        pairId: number;
        x: number;
        y: number;
    }[];
}

export interface VisualNumberPatternData {
    title: string;
    prompt: string;
    puzzles: {
        items: {
            number: number;
            color: string;
            size: number; // e.g., 1, 1.2, 1.5
        }[];
        rule: string;
        answer: number;
    }[];
}

export interface MissingPartsData {
    title: string;
    prompt: string;
    leftParts: { id: number; text: string }[];
    rightParts: { id: number; text: string }[];
    givenParts: { word: string; parts: string[] }[];
}

export interface ProfessionConnectData {
    title: string;
    prompt: string;
    gridDim: number;
    points: {
        label: string;
        imageDescription: string;
        imageBase64?: string;
        x: number;
        y: number;
    }[];
}

// Interfaces for new activities from images
export interface VisualOddOneOutThemedData {
    title: string;
    prompt: string;
    rows: {
        theme: string;
        items: {
            description: string;
            imageBase64?: string;
        }[];
        oddOneOutIndex: number;
    }[];
}

export interface LogicGridPuzzleData {
    title: string;
    prompt: string;
    clues: string[];
    people: string[];
    categories: {
        title: string;
        items: {
            name: string;
            imageDescription: string;
            imageBase64?: string;
        }[];
    }[];
}

export interface ImageAnagramSortData {
    title: string;
    prompt: string;
    cards: {
        imageDescription: string;
        imageBase64?: string;
        scrambledWord: string;
        correctWord: string;
    }[];
}

export interface AnagramImageMatchData {
    title: string;
    prompt: string;
    wordBank: string[];
    puzzles: {
        imageDescription: string;
        imageBase64?: string;
        partialAnswer: string;
        correctWord: string;
    }[];
}

export interface SyllableWordSearchData {
    title: string;
    prompt: string;
    syllablesToCombine: string[];
    wordsToCreate: {
        syllable1: string;
        syllable2: string;
        answer: string;
    }[];
    wordsToFindInSearch: string[];
    grid: string[][];
    passwordPrompt: string;
}

export interface WordSearchWithPasswordData {
    title: string;
    prompt: string;
    grid: string[][];
    words: string[];
    passwordCells: { row: number; col: number }[];
}

export interface WordWebWithPasswordData {
    title: string;
    prompt: string;
    words: string[];
    grid: (string | null)[][];
    passwordColumnIndex: number;
}

export interface LetterGridWordFindData {
    title: string;
    prompt: string;
    words: string[];
    grid: string[][];
    writingPrompt: string;
}

export interface WordPlacementPuzzleData {
    title: string;
    prompt: string;
    grid: (string | null)[][];
    wordGroups: {
        length: number;
        words: string[];
    }[];
    unusedWordPrompt: string;
}

export interface PositionalAnagramData {
    title: string;
    prompt: string;
    puzzles: {
        id: number;
        scrambled: string;
        answer: string;
    }[];
}

export type SingleWorksheetData = 
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
  | FindTheDifferenceData
  | WordComparisonData
  | WordsInStoryData
  | OddOneOutData
  | ShapeMatchingData
  | SymbolCipherData
  | ProverbFillData
  | LetterBridgeData
  | FindDuplicateData
  | WordLadderData
  | FindIdenticalWordData
  | WordFormationData
  | ReverseWordData
  | FindLetterPairData
  | WordGroupingData
  | VisualMemoryData
  | StoryAnalysisData
  | CoordinateCipherData
  | ProverbSearchData
  | TargetSearchData
  | ShapeNumberPatternData
  | GridDrawingData
  | ColorWheelMemoryData
  | ImageComprehensionData
  | CharacterMemoryData
  | StorySequencingData
  | ChaoticNumberSearchData
  | BlockPaintingData
  | MiniWordGridData
  | VisualOddOneOutData
  | ShapeCountingData
  | SymmetryDrawingData
  | FindDifferentStringData
  | DotPaintingData
  | AbcConnectData
  | PasswordFinderData
  | SyllableCompletionData
  | SynonymWordSearchData
  | WordConnectData
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
  | PunctuationColoringData
  | PunctuationMazeData
  | AntonymResfebeData
  | ThematicWordSearchColorData
  | ThematicOddOneOutSentenceData
  | ProverbSentenceFinderData
  | SynonymSearchAndStoryData
  | ColumnOddOneOutSentenceData
  | SynonymAntonymColoringData
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
  | MatchstickSymmetryData
  | WordWebData
  | StarHuntData
  | LengthConnectData
  | VisualNumberPatternData
  | MissingPartsData
  | ProfessionConnectData
  | VisualOddOneOutThemedData
  | LogicGridPuzzleData
  | ImageAnagramSortData
  | AnagramImageMatchData
  | SyllableWordSearchData
  | WordSearchWithPasswordData
  | WordWebWithPasswordData
  | LetterGridWordFindData
  | WordPlacementPuzzleData
  | PositionalAnagramData;

export type WorksheetData = SingleWorksheetData[] | null;

export interface SavedWorksheet {
  id: string;
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