
import { BaseActivityData, ShapeType, VisualMathType, ActivityType } from './core';

export * from './core';

export interface NumberLogicRiddleData extends BaseActivityData {
    sumTarget: number;
    sumMessage?: string;
    showVisualAid?: boolean;
    numberRangeStart?: number;
    numberRangeEnd?: number;
    puzzles: {
        id: string;
        riddleParts: { text: string; icon: string; type: 'parity' | 'digits' | 'comparison' | 'arithmetic' }[];
        visualDistraction: number[]; // Arka plandaki şüpheli sayılar
        options: string[];
        answer: string;
        answerValue: number;
        // logicProblems.ts and other generators might use these
        riddle?: string;
        boxes?: any[];
        visualHint?: string;
    }[];
}

/**
 * FIX: Added missing interfaces for various Math/Logic activities
 */

export interface MathPuzzleData extends BaseActivityData {
    puzzles: {
        id: string;
        equations: {
            leftSide: { objectName: string; multiplier: number }[];
            operator: string;
            rightSide: number;
        }[];
        finalQuestion: string;
        answer: string;
        objects: { name: string; value: number; imagePrompt: string }[];
    }[];
}

export interface NumberPathLogicData extends BaseActivityData {
    legend: { symbol: string; operation: string; value: number; color: string; }[];
    chains: { startNumber: number; steps: { symbol: string; expectedValue?: number | null; }[]; }[];
}

export interface NumberPatternData extends BaseActivityData {
    patterns: { sequence: string; answer: string }[];
}

export interface ShapeNumberPatternData extends BaseActivityData {
    patterns: { 
        shapes: { 
            type: 'triangle'; 
            numbers: string[] 
        }[] 
    }[];
}

export interface FutoshikiData extends BaseActivityData {
    puzzles: { size: number; grid: (number | string | null)[][]; constraints?: any[] }[];
}

export interface NumberPyramidData extends BaseActivityData {
    pyramids: { rows: (number | string | null)[][] }[];
}

export interface NumberCapsuleData extends BaseActivityData {
    items: any[];
}

export interface OddEvenSudokuData extends BaseActivityData {
    puzzles: any[];
}

export interface ArithmeticConnectData extends BaseActivityData {
    example?: string;
    expressions: { text: string; value: number; group: number; x: number; y: number }[];
}

export interface KendokuData extends BaseActivityData {
    puzzles: any[];
}

export interface OperationSquareFillInData extends BaseActivityData {
    items: any[];
}

export interface MultiplicationWheelData extends BaseActivityData {
    items: any[];
}

export interface TargetNumberData extends BaseActivityData {
    items: any[];
}

export interface ShapeSudokuData extends BaseActivityData {
    puzzles: any[];
}

export interface RealLifeProblemData extends BaseActivityData {
    problems: { text: string; answer: string; imagePrompt?: string; operationHint?: string }[];
}

export interface MathMemoryCard {
    id: string;
    pairId: string;
    type: 'operation' | 'number' | 'visual' | 'text';
    content: string;
    numValue: number;
    visualType?: string;
}

export interface MathMemoryCardsData extends BaseActivityData {
    cards: MathMemoryCard[];
    settings?: {
        gridCols: number;
        cardCount: number;
        difficulty: string;
        variant: string;
        showNumbers?: boolean;
    };
}

export interface NumberSenseData extends BaseActivityData {
    layout?: string;
    exercises: {
        type: 'missing' | 'comparison' | 'ordering';
        values: number[];
        target: number;
        visualType: string;
        step?: number;
    }[];
}

export interface VisualArithmeticData extends BaseActivityData {
    layout?: string;
    problems: {
        num1: number;
        num2: number;
        operator: string;
        answer: number;
        visualType?: VisualMathType;
    }[];
}

export interface SpatialGridData extends BaseActivityData {
    gridSize: number;
    cubeData?: number[][];
    tasks: {
        type: 'count-cubes' | 'copy';
        grid?: string[][];
    }[];
}

export interface ConceptMatchData extends BaseActivityData {
    pairs: {
        item1: string;
        item2: string;
    }[];
}

export interface EstimationData extends BaseActivityData {
    items: {
        count: number;
        options: string[];
        answer: string;
    }[];
}

export interface MoneyCountingData extends BaseActivityData {
    puzzles: {
        notes: { value: number; count: number }[];
        coins: { value: number; count: number }[];
        question: string;
        options: string[];
        answer: string;
    }[];
}

export interface ClockReadingData extends BaseActivityData {
    variant?: string;
    clocks: {
        hour: number;
        minute: number;
        timeString?: string;
        problemText?: string;
        verbalTime?: string;
        options?: string[];
    }[];
    settings?: {
        showNumbers?: boolean;
        showTicks?: boolean;
        showHands?: boolean;
        showOptions?: boolean;
    };
}

// Math Studio types
export type MathMode = 'drill' | 'problem_ai';

export interface MathDrillConfig {
    selectedOperations: string[];
    digit1: number;
    digit2: number;
    digit3: number;
    count: number;
    cols: number;
    gap: number;
    allowCarry: boolean;
    allowBorrow: boolean;
    allowRemainder: boolean;
    allowNegative: boolean;
    useThirdNumber: boolean;
    showTextRepresentation: boolean;
    autoFillPage: boolean;
    orientation: 'vertical' | 'horizontal';
    showAnswer: boolean;
    fontSize: number;
}

export interface MathPageConfig {
    paperType: 'blank' | 'grid' | 'dot';
    gridSize: number;
    margin: number;
    showDate: boolean;
    showName: boolean;
    title: string;
}

export interface MathOperation {
    id: string;
    num1: number;
    num2: number;
    num3?: number;
    symbol: string;
    symbol2?: string;
    answer: number;
    remainder?: number;
}

export interface MathProblem {
    id: string;
    text: string;
    answer: string;
    operationHint?: string;
}

export interface MathProblemConfig {
    topic: string;
    count: number;
    includeSolutionBox: boolean;
    studentName: string;
    difficulty: string;
    selectedOperations: string[];
    numberRange: string;
    problemStyle: 'simple' | 'story' | 'logic';
    complexity: '1-step' | '2-step' | 'multi-step';
}
