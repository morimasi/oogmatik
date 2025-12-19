
import { BaseActivityData, ShapeType, VisualMathType } from './core';

export * from './core';

// --- MATH STUDIO PRO TYPES ---

export type MathComponentType = 
    | 'header' 
    | 'text_block'
    | 'operation_drill' 
    | 'word_problem' 
    | 'fraction_visual' 
    | 'analog_clock' 
    | 'number_line' 
    | 'geometry_shape' 
    | 'base10_block';

export interface MathComponentBase {
    id: string;
    type: MathComponentType;
    x: number;
    y: number;
    w: number;
    h: number;
    isSelected?: boolean;
}

export interface MathHeaderComponent extends MathComponentBase {
    type: 'header';
    data: {
        title: string;
        subtitle: string;
        showDate: boolean;
        showName: boolean;
    };
}

export interface MathDrillComponent extends MathComponentBase {
    type: 'operation_drill';
    data: {
        count: number;
        cols: number;
        gap: number;
        fontSize: number;
        opType: 'add' | 'sub' | 'mult' | 'div' | 'mixed';
        orientation: 'vertical' | 'horizontal';
        showAnswer: boolean;
        operations: any[];
    };
    settings: {
        digit1: number; // 1. Sayı Basamak (0 = Rastgele Aralıktan)
        digit2: number; // 2. Sayı Basamak
        rangeMin: number; // Custom range fallback
        rangeMax: number; // Custom range fallback
        allowCarry: boolean; // Eldeli
        allowBorrow: boolean; // Onluk bozma
        allowRemainder: boolean; // Kalanlı
        forceResultMax?: number; // Sonuç tavanı (örn: toplam 100'ü geçmesin)
    };
}

export interface MathClockComponent extends MathComponentBase {
    type: 'analog_clock';
    data: {
        time: string;
        showNumbers: boolean;
        showMinuteMarks: boolean;
        label: string;
    };
}

export interface MathFractionComponent extends MathComponentBase {
    type: 'fraction_visual';
    data: {
        numerator: number;
        denominator: number;
        visualType: 'pie' | 'bar' | 'group';
        showLabel: boolean;
    };
}

export interface MathNumberLineComponent extends MathComponentBase {
    type: 'number_line';
    data: {
        start: number;
        end: number;
        step: number;
        missingCount: number; // Kaç sayı boş bırakılsın
        showTicks: boolean;
    };
}

export interface MathShapeComponent extends MathComponentBase {
    type: 'geometry_shape';
    data: {
        shape: 'circle' | 'square' | 'triangle' | 'hexagon' | 'pentagon' | 'star';
        color: string;
        fill: boolean;
        strokeWidth: number;
        label: string;
    };
}

export interface MathBase10Component extends MathComponentBase {
    type: 'base10_block';
    data: {
        number: number;
        showLabel: boolean;
        layout: 'row' | 'wrap';
    };
}

export interface MathProblemComponent extends MathComponentBase {
    type: 'word_problem';
    data: {
        text: string;
        showWorkSpace: boolean;
        workspaceHeight: number;
    }
}

export type MathStudioItem = 
    | MathHeaderComponent 
    | MathDrillComponent 
    | MathClockComponent 
    | MathFractionComponent
    | MathShapeComponent
    | MathProblemComponent
    | MathNumberLineComponent
    | MathBase10Component
    | any; // Fallback

export interface MathPageConfig {
    paperType: 'blank' | 'grid' | 'dot' | 'line';
    gridSize: number;
    margin: number;
    orientation: 'portrait' | 'landscape';
}

export interface MathStudioConfig {
    gradeLevel: string;
    studentName: string;
    problemConfig: {
        topic: string;
        count: number;
        steps: number;
    };
    operations: string[];
}

// --- NEW MATH & LOGIC ACTIVITY DATA TYPES ---

export interface NumberPatternData extends BaseActivityData {
    patterns: { sequence: string; answer: string }[];
}

export interface ShapeNumberPatternData extends BaseActivityData {
    patterns: { shapes: { type: string; numbers: (string|number)[] }[] }[];
}

export interface ArithmeticConnectData extends BaseActivityData {
    expressions: { text: string; value: number; group: number; x: number; y: number }[];
}

export interface RomanArabicMatchConnectData extends BaseActivityData {
    gridDim: number;
    points: { label: string; pairId: number; x: number; y: number }[];
}

export interface WeightConnectData extends BaseActivityData {
    gridDim: number;
    points: { label: string; pairId: number; x: number; y: number; imagePrompt?: string }[];
}

export interface LengthConnectData extends BaseActivityData {
    gridDim: number;
    points: { label: string; pairId: number; x: number; y: number; imagePrompt?: string }[];
}

export interface VisualNumberPatternData extends BaseActivityData {
    puzzles: { items: { number: number; color: string; size: number }[]; rule: string; answer: number }[];
}

export interface LogicGridPuzzleData extends BaseActivityData {
    clues: string[];
    people: string[];
    categories: { title: string; items: { name: string; imageDescription?: string; imagePrompt?: string }[] }[];
}

export interface MathPuzzleData extends BaseActivityData {
    puzzles: { problem: string; question: string; answer: string; objects?: { name: string; imagePrompt: string; imageBase64?: string }[] }[];
}

export interface FutoshikiData extends BaseActivityData {
    puzzles: { size: number; numbers: (number | null)[][]; constraints: { row1: number; col1: number; row2: number; col2: number; symbol: string }[]; units?: any[] }[];
}

export interface NumberPyramidData extends BaseActivityData {
    pyramids: { rows: (number | null)[][] }[];
}

export interface NumberCapsuleData extends BaseActivityData {
    puzzles: { grid: (number | null)[][]; capsules: { cells: { row: number; col: number }[]; sum: number }[]; numbersToUse: string }[];
}

export interface OddEvenSudokuData extends BaseActivityData {
    puzzles: { grid: (number | null)[][]; shadedCells: { row: number; col: number }[]; numbersToUse: string; constrainedCells?: any[] }[];
}

export interface RomanNumeralConnectData extends BaseActivityData {
    gridDim: number;
    puzzles?: { gridDim: number; points: { label: string; x: number; y: number }[] }[]; 
    points?: { label: string; x: number; y: number }[];
}

export interface RomanNumeralStarHuntData extends BaseActivityData {
    grid: string[][];
    starCount: number;
}

export interface RoundingConnectData extends BaseActivityData {
    numbers: { value: number; group: number; x: number; y: number }[];
}

export interface RomanNumeralMultiplicationData extends BaseActivityData {
    puzzles: { row1: string; row2: string; col1: string; col2: string; results: { r1c1: string; r1c2: string; r2c1: string; r2c2: string } }[];
}

export interface KendokuData extends BaseActivityData {
    puzzles: { size: number; grid: (number | null)[][]; cages: { cells: { row: number; col: number }[]; operation?: string; target: number }[] }[];
}

export interface OperationSquareFillInData extends BaseActivityData {
    puzzles: { grid: string[][]; numbersToUse: number[]; results: number[] }[];
}

export interface MultiplicationWheelData extends BaseActivityData {
    puzzles: { outerNumbers: number[]; innerResult: number }[];
}

export interface TargetNumberData extends BaseActivityData {
    puzzles: { target: number; givenNumbers: number[] }[];
}

export interface ShapeSudokuData extends BaseActivityData {
    puzzles: { grid: string[][]; shapesToUse: { shape: string; label: string }[] }[];
}

export interface BasicOperationsData extends BaseActivityData {
    isVertical: boolean;
    operations: { num1: number; num2: number; num3?: number; operator: string; answer: number; remainder?: number }[];
}

export interface RealLifeProblemData extends BaseActivityData {
    problems: { text: string; solution: string; operationHint: string; imagePrompt?: string }[];
}

export interface NumberBoxLogicData extends BaseActivityData {
    puzzles: { box1: number[]; box2: number[]; questions: { text: string; options: string[]; correctAnswer: string }[] }[];
}

export interface MindGamesData extends BaseActivityData {
    puzzles: {
        type: 'shape_math' | 'matrix_logic' | 'number_pyramid' | 'hexagon_logic' | 'function_machine';
        shape?: string;
        numbers?: (number | string)[];
        grid?: (number | string | null)[][];
        input?: number;
        output?: string;
        rule?: string;
        question?: string;
        answer?: string;
        hint?: string;
        imagePrompt?: string;
        imageBase64?: string;
    }[];
}

export interface MindGames56Data extends BaseActivityData {
    puzzles: {
        type: 'word_problem' | 'number_sequence' | 'visual_logic' | 'cipher';
        title: string;
        question: string;
        answer: string;
        hint?: string;
        imagePrompt?: string;
        imageBase64?: string;
    }[];
}

export interface NumberSenseData extends BaseActivityData {
    layout: 'list' | 'visual';
    exercises: {
        type: 'number-line' | 'comparison' | 'ordering' | 'missing';
        values: number[];
        target: number;
        visualType: string;
        step?: number;
    }[];
}

export interface VisualArithmeticData extends BaseActivityData {
    layout: 'visual';
    problems: {
        num1: number;
        num2: number;
        operator: string;
        answer: number;
        visualType: VisualMathType;
        imagePrompt?: string;
    }[];
}

export interface SpatialGridData extends BaseActivityData {
    layout: 'grid';
    gridSize: number;
    cubeData?: number[][];
    tasks: {
        type: 'position' | 'direction' | 'copy' | 'path' | 'count-cubes';
        grid: (string | null)[][];
        instruction: string;
        target: { r: number; c: number };
    }[];
}

export interface ConceptMatchData extends BaseActivityData {
    layout: 'list' | 'visual';
    pairs: {
        item1: string;
        item2: string;
        type: string;
        imagePrompt1?: string;
    }[];
}

export interface EstimationData extends BaseActivityData {
    layout: 'visual';
    items: {
        count: number;
        visualType: string;
        options: number[];
        imagePrompt: string;
    }[];
}
