
import { BaseActivityData, ShapeType, VisualMathType } from './core';

export * from './core';

export interface NumberPatternData extends BaseActivityData { patterns: { sequence: string; answer: string; }[]; }
export interface ShapeNumberPatternData extends BaseActivityData { patterns: { shapes: { type: string; numbers: (string|number)[]; }[] }[]; }
export interface MathPuzzleData extends BaseActivityData { puzzles: { problem: string; question: string; answer: string; objects?: { name: string; imageBase64?: string; imagePrompt?: string; }[]; }[]; }
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
export interface ShapeCountingData extends BaseActivityData { figures: { svgPaths: { d: string; fill: string; stroke?: string; }[]; targetShape: string; correctCount: number; cubeData?: number[][]; }[]; }
export interface RomanArabicMatchConnectData extends BaseActivityData { gridDim: number; points: { label: string; pairId: number; x: number; y: number; }[]; prompt?: string; }
export interface WeightConnectData extends BaseActivityData { gridDim: number; points: { label: string; pairId: number; x: number; y: number; imagePrompt?: string; }[]; prompt?: string; }
export interface LengthConnectData extends BaseActivityData { gridDim: number; points: { label: string; pairId: number; x: number; y: number; imagePrompt?: string; }[]; prompt?: string; }
export interface BasicOperationsData extends BaseActivityData { operations: { num1: number; num2: number; num3?: number; operator: string; answer: number; remainder?: number; }[]; isVertical?: boolean; }
export interface RealLifeProblemData extends BaseActivityData { problems: { text: string; solution: string; operationHint: string; imagePrompt: string; imageBase64?: string; }[]; }
export interface NumberSenseData extends BaseActivityData { layout: 'list'|'visual'; exercises: { type: string; values: number[]; target: number; visualType: string; step?: number; }[]; }
export interface VisualArithmeticData extends BaseActivityData { layout: 'visual'; problems: { num1: number; num2: number; operator: string; answer: number; visualType: VisualMathType | string; imagePrompt: string; }[]; }
export interface SpatialGridData extends BaseActivityData { layout: 'grid'; gridSize: number; cubeData?: number[][]; tasks: { type: string; grid: any; instruction: string; target: { r: number; c: number; }; }[]; }
export interface ConceptMatchData extends BaseActivityData { layout: 'list'|'visual'; pairs: { item1: string; item2: string; type: string; imagePrompt1?: string; }[]; }
export interface EstimationData extends BaseActivityData { layout: 'visual'; items: { count: number; visualType: string; options: number[]; imagePrompt: string; }[]; }
export interface MindGamesData extends BaseActivityData { puzzles: { type: string; shape?: string; numbers?: (number|string)[]; grid?: (number|string|null)[][]; input?: number; output?: string; rule?: string; question?: string; answer: string; hint?: string; imagePrompt: string; imageBase64?: string; }[]; }
export interface MindGames56Data extends BaseActivityData { puzzles: { type: string; title: string; question: string; answer: string; hint?: string; imagePrompt: string; imageBase64?: string; }[]; }

export interface FamilyRelationsData extends BaseActivityData {
    leftColumn: { text: string; id: number; }[];
    rightColumn: { text: string; id: number; }[];
}

export interface LogicDeductionData extends BaseActivityData {
    scoringText?: string;
    questions: { riddle: string; options: string[]; answerIndex: number; correctLetter: string; }[];
}

export interface NumberBoxLogicData extends BaseActivityData {
    puzzles: { box1: number[]; box2: number[]; questions: { text: string; options: string[]; correctAnswer: string; }[]; }[];
}

export interface MapInstructionData extends BaseActivityData {
    mapSvg: string;
    cities: { name: string; x: number; y: number; }[];
    instructions: string[];
}
