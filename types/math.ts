
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

export interface BasicOperationsData extends BaseActivityData {
    isVertical?: boolean;
    operations: {
        num1: number;
        num2: number;
        num3?: number;
        operator: string;
        answer: number;
        remainder?: number;
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

export interface NumberBoxLogicData extends BaseActivityData {
    puzzles: {
        box1: number[];
        box2: number[];
        questions: {
            text: string;
            options: string[];
            correctAnswer: string;
        }[];
    }[];
}

export interface MindGamesData extends BaseActivityData {
    puzzles: {
        type: string;
        shape?: string;
        numbers?: (number | string)[];
        grid?: (number | string | null)[][];
        input?: number;
        output?: string;
        rule?: string;
        question?: string;
        answer: string;
        hint?: string;
        imagePrompt?: string;
        imageBase64?: string;
        title?: string;
    }[];
}

export interface MindGames56Data extends BaseActivityData {
    puzzles: {
        type: string;
        title: string;
        question: string;
        answer: string;
        hint?: string;
        imagePrompt?: string;
        imageBase64?: string;
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

export interface LogicGridPuzzleData extends BaseActivityData {
    prompt: string;
    clues: string[];
    people: string[];
    categories: {
        title: string;
        items: { name: string; imageDescription: string; imagePrompt: string }[];
    }[];
}

export interface VisualNumberPatternData extends BaseActivityData {
    prompt: string;
    puzzles: {
        items: { number: number; color: string; size: number }[];
        rule: string;
        answer: number;
    }[];
}

export interface RomanNumeralStarHuntData extends BaseActivityData {
    items: any[];
}

export interface RoundingConnectData extends BaseActivityData {
    items: any[];
}

export interface RomanNumeralMultiplicationData extends BaseActivityData {
    items: any[];
}

// Added missing Math types for offline generators and components
export interface NumberLogicRiddleData extends BaseActivityData {
    sumTarget: number;
    sumMessage: string;
    puzzles: {
        riddle: string;
        boxes: number[][];
        options: string[];
        answer: string;
        answerValue: number;
    }[];
}

export interface ClockReadingData extends BaseActivityData {
    clocks: {
        hour: number;
        minute: number;
        displayType: 'analog' | 'digital';
        question?: string;
        options?: string[];
        correctAnswer: string;
    }[];
}

export interface MoneyCountingData extends BaseActivityData {
    puzzles: {
        totalAmount: number;
        coins?: { value: number; count: number }[];
        notes?: { value: number; count: number }[];
        question: string;
        options: number[];
        correctAnswer: number;
    }[];
}

export interface MathMemoryCardsData extends BaseActivityData {
    pairs: {
        card1: { type: 'operation' | 'visual' | 'text'; value: string; visualType?: string; num?: number };
        card2: { type: string; value: string };
    }[];
}
