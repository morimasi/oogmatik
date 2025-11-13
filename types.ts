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
  grid: string[][];
  words: string[];
}

export interface AnagramData {
  word: string;
  scrambled: string;
}

export interface MathPuzzleData {
  title: string;
  puzzles: {
    problem: string;
    question: string;
    answer: string;
  }[];
}

export interface StoryData {
  title: string;
  story: string;
  questions: {
    question: string;
    options: string[];
    answerIndex: number;
  }[];
}

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
    wordList: {
        word: string;
        isInStory: boolean;
    }[];
}

export interface OddOneOutData {
    title: string;
    groups: {
        words: string[];
    }[];
}

export type ShapeType = 'circle' | 'square' | 'triangle' | 'hexagon' | 'star' | 'diamond' | 'pentagon' | 'octagon';

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
    }[];
}

export interface LetterBridgeData {
    title: string;
    pairs: {
        word1: string;
        word2: string;
    }[];
}

export interface FindDuplicateData {
    title: string;
    rows: string[][];
}

export interface WordLadderData {
    title: string;
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
}

export interface ReverseWordData {
    title: string;
    words: string[];
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
    questions: {
        question: string;
        context: string;
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
    imageBase64: string;
    questions: string[];
}

export interface CharacterMemoryData {
    title: string;
    memorizeTitle: string;
    testTitle: string;
    charactersToMemorize: string[]; // Array of character descriptions
    testCharacters: string[]; // Array of character descriptions for the test
}

export interface StorySequencingData {
    title: string;
    prompt: string;
    panels: {
        id: string; // A, B, C...
        description: string;
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


export type WorksheetData = 
  | WordSearchData 
  | AnagramData[] 
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
  | null;