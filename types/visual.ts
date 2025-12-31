
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
        markerStyle: 'dot' | 'circle' | 'none';
        difficulty: string;
    };
}

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
export interface ShapeCountingData extends BaseActivityData { figures: { targetShape: string; correctCount: number; svgPaths: { d: string; fill: string; stroke?: string; }[]; cubeData?: number[][]; }[]; }
export interface AnagramsData extends BaseActivityData { anagrams: { word: string; scrambled: string; letters: string[]; imagePrompt?: string }[]; sentencePrompt?: string; }
export interface WordSearchData extends BaseActivityData { grid: string[][]; words: string[]; hiddenMessage?: string; writingPrompt?: string; }
export interface CrosswordData extends BaseActivityData { theme: string; grid: (string | null)[][]; clues: any[]; passwordPrompt: string; }

// --- ADDED MISSING INTERFACES ---

export interface RomanNumeralConnectData extends BaseActivityData {
    puzzles: { id: number; gridDim: number; points: { label: string; x: number; y: number; color?: string; }[] }[];
}

export interface RomanArabicMatchConnectData extends BaseActivityData {
    gridDim: number;
    points: { label: string; pairId: number; x: number; y: number; imagePrompt?: string }[];
}

export interface WeightConnectData extends BaseActivityData {
    gridDim: number;
    points: { label: string; pairId: number; x: number; y: number; imagePrompt: string }[];
}

export interface LengthConnectData extends BaseActivityData {
    gridDim: number;
    points: { label: string; pairId: number; x: number; y: number; imagePrompt: string }[];
}

export interface WordMemoryItem { text: string; imagePrompt?: string; }
export interface WordMemoryData extends BaseActivityData {
    memorizeTitle: string;
    testTitle: string;
    wordsToMemorize: WordMemoryItem[];
    testWords: WordMemoryItem[];
}

export interface VisualMemoryItem { description: string; imagePrompt?: string; imageBase64?: string; }
export interface VisualMemoryData extends BaseActivityData {
    memorizeTitle: string;
    testTitle: string;
    itemsToMemorize: VisualMemoryItem[];
    testItems: VisualMemoryItem[];
}

export interface NumberSearchData extends BaseActivityData {
    numbers: (string | number)[];
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

export interface ColorWheelItem { name: string; color: string; imagePrompt?: string; }
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

export interface CharacterItem { description: string; imagePrompt?: string; imageBase64?: string; }
export interface CharacterMemoryData extends BaseActivityData {
    memorizeTitle: string;
    testTitle: string;
    charactersToMemorize: CharacterItem[];
    testCharacters: CharacterItem[];
}

export interface StroopItem { text: string; color: string; }
export interface StroopTestData extends BaseActivityData {
    items: StroopItem[];
}

export interface ChaoticNumber { value: number; x: number; y: number; size: number; rotation: number; color: string; }
export interface ChaoticNumberSearchData extends BaseActivityData {
    numbers: ChaoticNumber[];
    range: { start: number; end: number };
    prompt?: string;
}

export interface AttentionDevelopmentPuzzle { riddle: string; boxes: { label?: string; numbers: number[] }[]; options: string[]; answer: string; }
export interface AttentionDevelopmentData extends BaseActivityData {
    puzzles: AttentionDevelopmentPuzzle[];
}

export interface AttentionFocusPuzzle { riddle: string; boxes: { title?: string; items: string[] }[]; options: string[]; answer: string; }
export interface AttentionFocusData extends BaseActivityData {
    puzzles: AttentionFocusPuzzle[];
}

export interface CodeReadingKey { symbol: string; value: string; color?: string; }
export interface CodeReadingCode { sequence: string[]; answer: string; }
export interface CodeReadingData extends BaseActivityData {
    keyMap: CodeReadingKey[];
    codesToSolve: CodeReadingCode[];
}

export interface AttentionToQuestionData extends BaseActivityData {
    subType: 'letter-cancellation' | 'path-finding' | 'visual-logic';
    grid?: string[][];
    targetChars?: string[];
    password?: string;
    pathGrid?: string[][];
    correctPath?: {r: number, c: number}[];
    logicItems?: any[];
}

export interface ReadingFlowSyllable { text: string; color?: string; }
export interface ReadingFlowSentence { syllables: ReadingFlowSyllable[]; }
export interface ReadingFlowParagraph { sentences: ReadingFlowSentence[]; }
export interface ReadingFlowData extends BaseActivityData {
    text: { paragraphs: ReadingFlowParagraph[] };
}

export interface LetterDiscriminationData extends BaseActivityData {
    targetLetters: string[];
    rows: { letters: string[] }[];
}

export interface RapidNamingItem { type: 'color' | 'object' | 'letter' | 'number'; value: string; label?: string; }
export interface RapidNamingData extends BaseActivityData {
    grid: { items: RapidNamingItem[] };
    type: 'color' | 'object' | 'letter' | 'number';
}

export interface PhonologicalExercise { question: string; word: string; answer?: string; options?: string[]; }
export interface PhonologicalAwarenessData extends BaseActivityData {
    exercises: PhonologicalExercise[];
}

export interface MirrorLettersItem { letter: string; rotation: number; isMirrored: boolean; }
export interface MirrorLettersData extends BaseActivityData {
    targetPair: string;
    rows: { items: MirrorLettersItem[] }[];
}

export interface SyllableTrain { syllables: string[]; word: string; }
export interface SyllableTrainData extends BaseActivityData {
    trains: SyllableTrain[];
}

export interface BackwardSpellingItem { word: string; reversed: string; }
export interface BackwardSpellingData extends BaseActivityData {
    items: BackwardSpellingItem[];
}

export interface HandwritingLine { text: string; type: 'trace' | 'copy' | 'empty'; imagePrompt?: string; }
export interface HandwritingPracticeData extends BaseActivityData {
    guideType: 'standard' | 'dotted' | 'none';
    lines: HandwritingLine[];
}

export interface MissingPartsData extends BaseActivityData {
    storyWithBlanks: string[];
    wordBank: string[];
    answers: string[];
}
