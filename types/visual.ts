
import { BaseActivityData, ShapeType } from './core';

export * from './core';

export interface MapInstructionData extends BaseActivityData {
    mapSvg?: string;
    cities: { 
        name: string; 
        x: number; 
        y: number; 
        id: string;
        region?: string;
        isCoastal?: boolean;
    }[];
    instructions: string[];
    settings?: {
        showCityNames: boolean;
        markerStyle: 'dot' | 'circle' | 'star' | 'target' | 'none';
        difficulty: string;
    };
}

// Added VisualTrackingLineData missing from dyslexiaSupport.ts
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
        d: string; 
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

export type GridTransformMode = 'copy' | 'mirror_v' | 'mirror_h' | 'rotate_90' | 'rotate_180';

export interface GridDrawingData extends BaseActivityData { 
    gridDim: number; 
    showCoordinates: boolean;
    transformMode: GridTransformMode;
    drawings: { 
        lines: [number, number][][]; 
        complexityLevel: string; 
        title?: string;
    }[]; 
}

export interface SymbolCipherData extends BaseActivityData { cipherKey: { shape: string; letter: string; color: string; }[]; wordsToSolve: { shapeSequence: string[]; wordLength: number; answer: string; }[]; }
export interface BlockPaintingData extends BaseActivityData { grid: { rows: number; cols: number; }; targetPattern: number[][]; shapes: { id: number; color: string; pattern: number[][]; count: number; }[]; }

export interface VisualOddOneOutItem {
    svgPaths?: { d: string; fill?: string; stroke?: string; strokeWidth?: number }[];
    segments?: boolean[];
    rotation?: number;
    scale?: number;
    label?: string;
    isMirrored?: boolean;
}

export interface VisualOddOneOutData extends BaseActivityData { 
    difficultyLevel: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
    distractionLevel: 'low' | 'medium' | 'high' | 'extreme';
    visualType?: 'geometric' | 'abstract' | 'character' | 'complex';
    rows: { 
        items: VisualOddOneOutItem[]; 
        correctIndex: number; 
        reason: string;
        visualHint?: string;
    }[]; 
}

export interface SymmetryDrawingData extends BaseActivityData { 
    gridDim: number; 
    axis: 'vertical' | 'horizontal'; 
    showCoordinates: boolean;
    isMirrorImage: boolean;
    lines: { x1: number, y1: number, x2: number, y2: number, color: string }[];
    dots?: { x: number; y: number; color: string; }[]; 
}

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
export interface ShapeCountingData extends BaseActivityData { figures: { targetShape: string; correctCount: number; svgPaths: { d: string; fill: string; stroke?: string; }[]; cubeData?: number[][]; }[]; }
export interface AnagramsData extends BaseActivityData { anagrams: { word: string; scrambled: string; letters: string[]; imagePrompt?: string }[]; sentencePrompt?: string; }
export interface WordSearchData extends BaseActivityData { grid: string[][]; words: string[]; hiddenMessage?: string; writingPrompt?: string; }
export interface CrosswordData extends BaseActivityData { theme: string; grid: (string | null)[][]; clues: any[]; passwordPrompt: string; }

// Added missing data interfaces for logicProblems.ts and dyslexiaSupport.ts
export interface RomanNumeralConnectData extends BaseActivityData { items: any[]; }
export interface RomanArabicMatchConnectData extends BaseActivityData { gridDim: number; points: { label: string; pairId: number; x: number; y: number }[]; prompt?: string; }
export interface WeightConnectData extends BaseActivityData { gridDim: number; points: { label: string; pairId: number; x: number; y: number, imagePrompt: string }[]; prompt?: string; }
export interface LengthConnectData extends BaseActivityData { gridDim: number; points: { label: string; pairId: number; x: number; y: number, imagePrompt: string }[]; prompt?: string; }
export interface CodeReadingData extends BaseActivityData { keyMap: { symbol: string; value: string; color: string }[]; codesToSolve: { sequence: string[]; answer: string }[]; }
export interface AttentionToQuestionData extends BaseActivityData { subType: 'letter-cancellation' | 'path-finding' | 'visual-logic'; grid?: string[][]; targetChars?: string[]; pathGrid?: string[][]; correctPath?: {r: number, c: number}[]; logicItems?: any[]; }
export interface AttentionDevelopmentData extends BaseActivityData { puzzles: { riddle: string; boxes: { label?: string; numbers: number[] }[]; options: string[]; answer: string }[]; }
export interface AttentionFocusData extends BaseActivityData { puzzles: { riddle: string; boxes: { title?: string; items: string[] }[]; options: string[]; answer: string }[]; }
export interface MirrorLettersData extends BaseActivityData { targetPair: string; rows: { items: { letter: string; rotation: number; isMirrored: boolean }[] }[]; }
export interface RapidNamingData extends BaseActivityData { type: 'object' | 'color' | 'letter' | 'number'; grid: { items: { type: string; value: string; label?: string }[] }[]; }
export interface LetterDiscriminationData extends BaseActivityData { targetLetters: string[]; rows: { letters: string[] }[]; }
export interface MissingPartsData extends BaseActivityData { storyWithBlanks: string[]; wordBank: string[]; answers: string[]; }

// Added missing members from memoryAttention generators
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
    grid: string[][];
    targetPair: string;
}

export interface TargetSearchData extends BaseActivityData {
    grid: string[][];
    target: string;
    distractor: string;
}

export interface ColorWheelItem {
    name: string;
    color: string;
    imagePrompt: string;
}

export interface ColorWheelMemoryData extends BaseActivityData {
    memorizeTitle: string;
    testTitle: string;
    items: ColorWheelItem[];
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

export interface StroopTestItem {
    text: string;
    color: string;
}

export interface StroopTestData extends BaseActivityData {
    items: StroopTestItem[];
}

export interface ChaoticNumberItem {
    value: number;
    x: number;
    y: number;
    size: number;
    rotation: number;
    color: string;
}

export interface ChaoticNumberSearchData extends BaseActivityData {
    prompt?: string;
    numbers: ChaoticNumberItem[];
    range: { start: number; end: number };
}

// Added missing HiddenPasswordGridData
export interface HiddenPasswordGridData extends BaseActivityData {
    settings: {
        gridSize: number;
        itemCount: number;
        cellStyle: 'square' | 'rounded' | 'minimal';
        letterCase: 'upper' | 'lower';
    };
    grids: {
        targetLetter: string;
        hiddenWord: string;
        grid: string[][];
    }[];
}
