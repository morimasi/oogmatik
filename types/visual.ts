
import { BaseActivityData, ShapeType } from './core';

export * from './core';

export interface FindTheDifferenceData extends BaseActivityData { rows: { items: string[]; correctIndex: number; visualDistractionLevel: 'low' | 'medium' | 'high'; }[]; }
export interface WordComparisonData extends BaseActivityData { box1Title: string; box2Title: string; wordList1: string[]; wordList2: string[]; correctDifferences: string[]; }
export interface ShapeMatchingData extends BaseActivityData { leftColumn: { id: number|string; shapes?: ShapeType[]; color: string; imageBase64?: string }[]; rightColumn: { id: number|string; shapes?: ShapeType[]; color: string; imageBase64?: string }[]; complexity: number; }
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
export interface ChaoticNumberSearchData extends BaseActivityData { prompt: string; numbers: { value: number; x: number; y: number; size: number; rotation: number; color: string; }[]; range: { start: number; end: number; }; }
