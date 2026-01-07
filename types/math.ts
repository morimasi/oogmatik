
import { BaseActivityData, ShapeType, VisualMathType } from './core';

export * from './core';

// --- MATH STUDIO PRO TYPES ---

export type MathMode = 'drill' | 'problem_ai' | 'visual_tools';

export interface MathDrillConfig {
    selectedOperations: string[]; 
    digit1: number; 
    digit2: number; 
    digit3?: number; 
    count: number;  
    cols: number;   
    gap: number;    
    
    // Constraints
    allowCarry: boolean;      
    allowBorrow: boolean;     
    allowRemainder: boolean;  
    allowNegative: boolean;   
    
    // Advanced Features
    useThirdNumber: boolean; 
    showTextRepresentation: boolean; 
    autoFillPage: boolean; 
    
    // Visuals
    orientation: 'vertical' | 'horizontal';
    showAnswer: boolean;
    fontSize: number;
}

export interface MathProblemConfig {
    topic: string; 
    count: number;
    includeSolutionBox: boolean;
    studentName?: string;
    
    // Advanced AI Control
    selectedOperations: string[]; 
    numberRange: string; 
    problemStyle: 'simple' | 'story' | 'logic'; 
    complexity: '1-step' | '2-step' | 'multi-step'; 
    difficulty?: string;
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
    steps?: string[];
    operationHint?: string;
}

export interface MathPageConfig {
    paperType: 'blank' | 'grid' | 'dot' | 'line';
    gridSize: number;
    margin: number;
    showDate: boolean;
    showName: boolean;
    title: string;
}

export interface AlgorithmStep {
    id: number;
    type: 'start' | 'process' | 'decision' | 'input' | 'output' | 'end';
    text: string;
}

export interface AlgorithmData extends BaseActivityData {
    challenge: string;
    steps: AlgorithmStep[];
}

export interface MathPuzzleData extends BaseActivityData {
    puzzles: {
        problem: string;
        question: string;
        answer: string;
        objects?: { name: string; imageBase64?: string; imagePrompt?: string }[];
    }[];
}

export interface NumberPatternData extends BaseActivityData {
    patterns: { sequence: string; answer: string }[];
}

export interface ShapeNumberPatternData extends BaseActivityData {
    patterns: { shapes: { type: string; numbers: number[] }[] }[];
}

export interface ArithmeticConnectData extends BaseActivityData {
    expressions: { text: string; value: number; group: number; x: number; y: number }[];
}

export interface FutoshikiData extends BaseActivityData {
    puzzles: {
        size: number;
        numbers: (number | null)[][];
        constraints: { row1: number; col1: number; row2: number; col2: number; symbol: string }[];
        units?: string[][];
    }[];
}

export interface NumberPyramidData extends BaseActivityData {
    pyramids: { rows: (number | null)[][] }[];
}

export interface NumberCapsuleData extends BaseActivityData {
    puzzles: {
        grid: (number | null)[][];
        capsules: { cells: { row: number; col: number }[]; sum: number }[];
        numbersToUse: string;
    }[];
}

export interface OddEvenSudokuData extends BaseActivityData {
    puzzles: {
        grid: (number | null)[][];
        shadedCells: { row: number; col: number }[];
        numbersToUse: string;
    }[];
}

export interface KendokuData extends BaseActivityData {
    puzzles: {
        size: number;
        grid: (number | null)[][];
        cages: { cells: { row: number; col: number }[]; operation?: string; target: number }[];
    }[];
}

export interface OperationSquareFillInData extends BaseActivityData {
    puzzles: {
        grid: string[][];
        numbersToUse: number[];
        results: number[];
    }[];
}

export interface MultiplicationWheelData extends BaseActivityData {
    puzzles: { outerNumbers: number[]; innerResult: number }[];
}

export interface TargetNumberData extends BaseActivityData {
    puzzles: { target: number; givenNumbers: number[] }[];
}

export interface ShapeSudokuData extends BaseActivityData {
    puzzles: {
        grid: string[][];
        shapesToUse: { shape: string; label: string }[];
    }[];
}

export interface RealLifeProblemData extends BaseActivityData {
    problems: {
        text: string;
        solution: string;
        operationHint?: string;
        imagePrompt?: string;
    }[];
}

export interface NumberSenseData extends BaseActivityData {
    layout: string;
    exercises: {
        type: string;
        values: number[];
        target: number;
        visualType: string;
        step?: number;
    }[];
}

export interface VisualArithmeticData extends BaseActivityData {
    layout: string;
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
    layout: string;
    gridSize: number;
    cubeData?: number[][];
    tasks: {
        type: string;
        grid: any[];
        instruction: string;
        target: { r: number; c: number };
    }[];
}

export interface EstimationData extends BaseActivityData {
    layout: string;
    items: {
        count: number;
        visualType: string;
        options: number[];
        imagePrompt?: string;
    }[];
}

export interface MathMemoryCard {
    id: string;
    pairId: string;
    type: 'operation' | 'number' | 'visual' | 'text';
    content: string;
    visualType?: VisualMathType;
    numValue: number;
}

export interface MathMemoryCardsData extends BaseActivityData {
    cards: MathMemoryCard[];
    settings: {
        gridCols: number;
        cardCount: number;
        difficulty: string;
        variant: 'op-res' | 'vis-num' | 'eq-eq' | 'mixed';
    };
}

export interface NumberLogicRiddleData extends BaseActivityData {
    sumTarget: number;
    sumMessage: string;
    puzzles: {
        riddle: string;
        visualHint?: string;
        boxes: number[][];
        options: string[];
        answer: string;
        answerValue: number;
    }[];
}

export interface MoneyCountingData extends BaseActivityData {
    puzzles: {
        notes?: { value: number; count: number }[];
        coins?: { value: number; count: number }[];
        question: string;
        options: string[];
        answer: string;
    }[];
}

export interface ClockReadingData extends BaseActivityData {
    variant: 'analog-to-digital' | 'digital-to-analog' | 'verbal-match' | 'elapsed-time';
    clocks: {
        id: string;
        hour: number;
        minute: number;
        timeString: string;
        verbalTime?: string;
        options?: string[];
        answer: string;
        problemText?: string;
        imagePrompt?: string;
    }[];
    settings: {
        showNumbers: boolean;
        is24Hour: boolean;
        showTicks: boolean;
        /**
         * Added showOptions and showHands to settings to support generator configurations
         * This fixes type errors in generators where these properties are assigned.
         */
        showOptions: boolean;
        showHands: boolean;
        difficulty: string;
    };
}

export interface ConceptMatchData extends BaseActivityData {
    pairs: {
        item1: string;
        item2: string;
    }[];
}
