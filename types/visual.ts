
import { BaseActivityData, ShapeType } from './core';

export * from './core';

export interface VisualTrackingLineData extends BaseActivityData { 
    width: number; 
    height: number; 
    difficultyLevel: 'easy' | 'medium' | 'hard' | 'expert';
    lineStyle: 'solid' | 'dashed' | 'dotted' | 'mixed';
    nodeStyle: 'icon' | 'letter' | 'number' | 'dot';
    showGridBackground: boolean;
    paths: { 
        id: number; 
        color: string; 
        d: string; // SVG Path Data
        strokeWidth: number;
        startLabel?: string; 
        endLabel?: string; 
        startImage?: string; 
        endImage?: string; 
    }[]; 
}

export interface FindTheDifferenceData extends BaseActivityData { rows: { items: string[]; correctIndex: number; visualDistractionLevel: 'low' | 'medium' | 'high'; }[]; }
export interface WordComparisonData extends BaseActivityData { box1Title: string; box2Title: string; wordList1: string[]; wordList2: string[]; correctDifferences: string[]; }
export interface ShapeMatchingData extends BaseActivityData { leftColumn: { id: number|string; shapes?: ShapeType[]; color: string; imageBase64?: string; rotation?: number; scale?: number; }[]; rightColumn: { id: number|string; shapes?: ShapeType[]; color: string; imageBase64?: string; rotation?: number; scale?: number; }[]; complexity: number; }
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
export interface WordConnectData extends BaseActivityData { gridDim: number; points: { word: string; pairId: number; x: number; y: number; color: string; imagePrompt?: string; }[]; }
export interface ProfessionConnectData extends BaseActivityData { gridDim: number; points: { label: string; imageDescription: string; imagePrompt: string; x: number; y: number; pairId: number; }[]; }
export interface MatchstickSymmetryData extends BaseActivityData { puzzles: { id: number; axis: string; lines: { x1: number; y1: number; x2: number; y2: number; color: string; }[]; }[]; }
export interface VisualOddOneOutThemedData extends BaseActivityData { rows: { theme: string; items: { description: string; imagePrompt: string; isOdd: boolean; imageBase64?: string; }[]; }[]; }
export interface PunctuationColoringData extends BaseActivityData { sentences: { text: string; color: string; correctMark: string; }[]; }
export interface SynonymAntonymColoringData extends BaseActivityData { colorKey: { text: string; color: string; }[]; wordsOnImage: { word: string; x: number; y: number; }[]; }
export interface StarHuntData extends BaseActivityData { grid: (string | null)[][]; targetCount: number; }
export interface OddOneOutData extends BaseActivityData { groups: { words: string[]; }[]; }
export interface ThematicOddOneOutData extends BaseActivityData { theme: string; rows: { words: { text: string; imagePrompt?: string; imageBase64?: string; }[]; oddWord: string; }[]; sentencePrompt: string; prompt?: string; }
export interface ThematicOddOneOutSentenceData extends BaseActivityData { rows: { words: string[]; oddWord: string; }[]; sentencePrompt: string; prompt?: string; }
export interface ColumnOddOneOutSentenceData extends BaseActivityData { columns: { words: string[]; oddWord: string; }[]; sentencePrompt: string; prompt?: string; }
export interface PunctuationMazeData extends BaseActivityData { punctuationMark: string; grid?: number[][]; rules: { id: number; text: string; isCorrect: boolean; isPath?: boolean; }[]; prompt?: string; }
export interface PunctuationPhoneNumberData extends BaseActivityData { clues: { id: number; text: string; }[]; solution: { punctuationMark: string; number: number; }[]; prompt?: string; }
export interface WordMemoryItem { text: string; imagePrompt?: string; }
export interface WordMemoryData extends BaseActivityData { memorizeTitle: string; testTitle: string; wordsToMemorize: WordMemoryItem[]; testWords: WordMemoryItem[]; }
export interface VisualMemoryData extends BaseActivityData { memorizeTitle: string; testTitle: string; itemsToMemorize: { description: string; imagePrompt?: string; imageBase64?: string; }[]; testItems: { description: string; imagePrompt?: string; imageBase64?: string; }[]; }
export interface NumberSearchData extends BaseActivityData { numbers: number[]; range: { start: number; end: number; }; }
export interface FindDuplicateData extends BaseActivityData { rows: string[][]; }
export interface LetterGridTestData extends BaseActivityData { grid: string[][]; targetLetters: string[]; }
export interface FindLetterPairData extends BaseActivityData { grid: string[][]; targetPair: string; }
export interface TargetSearchData extends BaseActivityData { grid: string[][]; target: string; distractor: string; }
export interface ColorWheelMemoryData extends BaseActivityData { memorizeTitle: string; testTitle: string; items: { name: string; color: string; imagePrompt?: string; }[]; }
export interface ImageComprehensionData extends BaseActivityData { memorizeTitle: string; testTitle: string; sceneDescription: string; imageBase64?: string; questions: string[]; }
export interface CharacterMemoryData extends BaseActivityData { memorizeTitle: string; testTitle: string; charactersToMemorize: { description: string; imageBase64?: string; imagePrompt?: string; }[]; testCharacters: { description: string; imageBase64?: string; imagePrompt?: string; }[]; }
export interface StroopTestData extends BaseActivityData { items: { text: string; color: string; }[]; }
export interface ChaoticNumberSearchData extends BaseActivityData { prompt?: string; numbers: { value: number; x: number; y: number; size: number; rotation: number; color: string; }[]; range: { start: number; end: number; }; }
export interface MirrorLettersData extends BaseActivityData { targetPair: string; rows: { items: { letter: string; isMirrored: boolean; rotation: number; }[]; }[]; }
export interface CodeReadingData extends BaseActivityData { keyMap: { symbol: string; value: string; color: string; }[]; codesToSolve: { sequence: string[]; answer: string; }[]; }
export interface AttentionToQuestionData extends BaseActivityData { subType: string; grid?: string[][]; targetChars?: string[]; password?: string; pathGrid?: string[][]; correctPath?: {r:number, c:number}[]; logicItems?: { id: number; isOdd: boolean; correctAnswer: string; shapes: any[]; }[]; }
export interface LetterDiscriminationData extends BaseActivityData { targetLetters: string[]; rows: { letters: string[]; targetCount: number; }[]; }
export interface AttentionDevelopmentData extends BaseActivityData { puzzles: { riddle: string; boxes: { label?: string; numbers: number[]; }[]; options: string[]; answer: string; }[]; }
export interface AttentionFocusData extends BaseActivityData { puzzles: { riddle: string; boxes: { title?: string; items: string[]; }[]; options: string[]; answer: string; }[]; }
export interface ReadingFlowData extends BaseActivityData { text: { paragraphs: { sentences: { syllables: { text: string; }[]; }[]; }[]; }; }
export interface SyllableTrainData extends BaseActivityData { trains: { syllables: string[]; }[]; }
export interface BackwardSpellingData extends BaseActivityData { items: { reversed: string; }[]; }
export interface HandwritingPracticeData extends BaseActivityData { guideType: string; lines: { text: string; type: 'trace' | 'copy' | 'empty'; imagePrompt?: string; }[]; }

export interface ShapeCountingData extends BaseActivityData {
    figures: {
        targetShape: string;
        correctCount: number;
        svgPaths: { d: string; fill: string; stroke?: string; }[];
        cubeData?: number[][];
    }[];
}

export interface RomanArabicMatchConnectData extends BaseActivityData {
    prompt: string;
    gridDim: number;
    points: { label: string; pairId: number; x: number; y: number }[];
}

export interface WeightConnectData extends BaseActivityData {
    prompt: string;
    gridDim: number;
    points: { label: string; pairId: number; x: number; y: number; imagePrompt: string }[];
}

export interface LengthConnectData extends BaseActivityData {
    prompt: string;
    gridDim: number;
    points: { label: string; pairId: number; x: number; y: number; imagePrompt: string }[];
}

export interface RomanNumeralConnectData extends BaseActivityData {
    gridDim: number;
    points: { label: string; pairId: number; x: number; y: number }[];
}

export interface WordSearchData extends BaseActivityData {
    grid: string[][];
    words: string[];
    hiddenMessage?: string;
    writingPrompt?: string;
    followUpQuestion?: string;
}

export interface MissingPartsData extends BaseActivityData {
    storyWithBlanks: string[];
    wordBank: string[];
    answers?: string[];
    leftParts?: {id: number, text: string}[];
    rightParts?: {id: number, text: string}[];
    givenParts?: {word: string, parts: string[]}[];
}

// Added missing types for Map and Word Games
export interface MapInstructionData extends BaseActivityData {
    mapSvg?: string;
    cities: { name: string; x: number; y: number }[];
    instructions: string[];
}

export interface WordSearchWithPasswordData extends WordSearchData {
    passwordCells: { row: number; col: number }[];
}

export interface LetterGridWordFindData extends WordSearchData {
    writingPrompt: string;
}

export interface ThematicWordSearchColorData extends WordSearchData {}
export interface SynonymWordSearchData extends WordSearchData {}
export interface SynonymSearchAndStoryData extends WordSearchData {}

export interface AnagramsData extends BaseActivityData {
    anagrams: { word: string; scrambled: string; letters: string[]; imagePrompt?: string }[];
    sentencePrompt?: string;
}

export interface SpellingCheckData extends BaseActivityData {
    checks: { correct: string; options: string[]; imagePrompt?: string }[];
}

export interface LetterBridgeData extends BaseActivityData {
    pairs: { word1: string; word2: string; bridgeLetter: string }[];
    followUpPrompt?: string;
}

export interface WordLadderData extends BaseActivityData {
    theme: string;
    ladders: { startWord: string; endWord: string; steps: number; intermediateWords: string[] }[];
}

export interface WordFormationData extends BaseActivityData {
    sets: { letters: string[]; jokerCount: number; targetCount: number }[];
    mysteryWordChallenge?: { prompt: string; solution: string };
}

export interface ReverseWordData extends BaseActivityData {
    words: string[];
    funFact?: string;
}

export interface WordGroupingData extends BaseActivityData {
    groups: { category: string; items: string[] }[];
}

export interface MiniWordGridData extends BaseActivityData {
    puzzles: { grid: string[][]; start: { row: number; col: number } }[];
}

export interface PasswordFinderData extends BaseActivityData {
    words: { word: string; passwordLetter: string; isProperNoun: boolean }[];
    passwordLength: number;
}

export interface SyllableCompletionData extends BaseActivityData {
    theme: string;
    puzzles: { id: number; syllables: string[]; imagePrompt?: string }[];
    syllables: string[];
    wordParts: string[];
    storyPrompt?: string;
}

export interface SpiralPuzzleData extends BaseActivityData {
    theme: string;
    clues: string[];
    grid: (string | null)[][];
    wordStarts: { id: number; row: number; col: number }[];
    passwordPrompt: string;
}

export interface PunctuationSpiralPuzzleData extends SpiralPuzzleData {}

export interface CrosswordClue {
    id: number;
    direction: 'across' | 'down';
    text: string;
    start: { row: number; col: number };
    word: string;
    imagePrompt?: string;
}

export interface CrosswordData extends BaseActivityData {
    theme: string;
    grid: (string | null)[][];
    clues: CrosswordClue[];
    passwordCells?: { row: number; col: number }[];
    passwordLength?: number;
    passwordPrompt: string;
}

export interface JumbledWordStoryData extends BaseActivityData {
    theme: string;
    puzzles: { jumbled: string[]; word: string }[];
    storyPrompt: string;
}

export interface HomonymSentenceData extends BaseActivityData {
    items: { word: string; meaning1: string; imagePrompt_1?: string; meaning2: string; imagePrompt_2?: string }[];
}

export interface WordGridPuzzleData extends BaseActivityData {
    theme: string;
    wordList: string[];
    grid: (string | null)[][];
    unusedWordPrompt: string;
}

export interface HomonymImageMatchData extends BaseActivityData {
    leftImages: { id: number; word: string; imagePrompt: string }[];
    rightImages: { id: number; word: string; imagePrompt: string }[];
    wordScramble: { letters: string[]; word: string };
}

export interface AntonymFlowerPuzzleData extends BaseActivityData {
    puzzles: { centerWord: string; antonym: string; petalLetters: string[] }[];
    passwordLength: number;
}

export interface SynonymAntonymGridData extends BaseActivityData {
    antonyms: any[];
    synonyms: any[];
    grid: string[][];
}

export interface AntonymResfebeData extends BaseActivityData {
    puzzles: { clues: ResfebeClue[]; answer: string }[];
}

export interface SynonymMatchingPatternData extends BaseActivityData {
    theme: string;
    pairs: { word: string; synonym: string }[];
}

export interface WordWebData extends BaseActivityData {
    wordsToFind: string[];
    grid: string[][];
    keyWordPrompt: string;
}

export interface SyllableWordSearchData extends WordSearchData {}

export interface WordWebWithPasswordData extends WordWebData {
    passwordColumnIndex: number;
    words: string[];
}

export interface WordPlacementPuzzleData extends BaseActivityData {
    grid: string[][];
    wordGroups: { length: number; words: string[] }[];
    unusedWordPrompt: string;
}

export interface PositionalAnagramData extends BaseActivityData {
    puzzles: { id: number; scrambled: string; answer: string }[];
}

export interface ImageAnagramSortData extends BaseActivityData {
    cards: { imageDescription: string; imagePrompt: string; scrambledWord: string; correctWord: string }[];
}

export interface AnagramImageMatchData extends BaseActivityData {
    wordBank: string[];
    puzzles: { imageDescription: string; imagePrompt: string; partialAnswer: string; correctWord: string }[];
}

export interface ResfebeClue {
    type: 'text' | 'image';
    value: string;
    imagePrompt?: string;
}

export interface ResfebeData extends BaseActivityData {
    puzzles: { clues: ResfebeClue[]; answer: string }[];
}
