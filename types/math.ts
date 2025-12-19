
import { BaseActivityData, ShapeType, VisualMathType } from './core';

export * from './core';

// --- MATH STUDIO PRO TYPES ---

export type MathMode = 'drill' | 'problem_ai' | 'visual_tools';

export interface MathDrillConfig {
    selectedOperations: string[]; // Çoklu seçim için array'e dönüştürüldü ['add', 'sub']
    digit1: number; 
    digit2: number; 
    digit3?: number; // 3. Sayı basamağı (0 ise yok)
    count: number;  
    cols: number;   
    gap: number;    
    
    // Constraints
    allowCarry: boolean;      
    allowBorrow: boolean;     
    allowRemainder: boolean;  
    allowNegative: boolean;   
    
    // Advanced Features
    useThirdNumber: boolean; // 3. sayı var mı?
    showTextRepresentation: boolean; // "12 (On iki)" şeklinde göster
    autoFillPage: boolean; // Sayfayı otomatik doldur
    
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
}

export interface MathOperation {
    id: string;
    num1: number;
    num2: number;
    num3?: number; // 3. Sayı eklendi
    symbol: string;
    symbol2?: string; // 2. İşlem sembolü (eğer 3 sayı varsa)
    answer: number;
    remainder?: number;
}

// ... Rest of the file remains unchanged ...
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

export interface MathStudioConfig {
    gradeLevel: string;
    operations: string[];
    problemConfig: {
        topic: string;
        count: number;
        steps: number;
    };
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

export interface RomanArabicMatchConnectData extends BaseActivityData {
    gridDim: number;
    points: { label: string; pairId: number; x: number; y: number }[];
}

export interface WeightConnectData extends BaseActivityData {
    gridDim: number;
    points: { label: string; pairId: number; x: number; y: number }[];
}

export interface LengthConnectData extends BaseActivityData {
    gridDim: number;
    points: { label: string; pairId: number; x: number; y: number }[];
}

export interface VisualNumberPatternData extends BaseActivityData {
    puzzles: { items: { number: number; color: string; size: number }[]; rule: string; answer: number }[];
}

export interface LogicGridPuzzleData extends BaseActivityData {
    clues: string[];
    people: string[];
    categories: { title: string; items: { name: string; imageDescription?: string; imagePrompt?: string }[] }[];
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

export interface RomanNumeralConnectData extends BaseActivityData {
    gridDim: number;
    puzzles: { gridDim: number; points: { label: string; x: number; y: number }[] }[];
}

export interface RomanNumeralStarHuntData extends BaseActivityData {
    grid: string[][];
    starCount: number;
}

export interface RoundingConnectData extends BaseActivityData {
    numbers: { value: number; group: number; x: number; y: number }[];
}

export interface RomanNumeralMultiplicationData extends BaseActivityData {
    puzzles: {
        row1: string; row2: string; col1: string; col2: string;
        results: { r1c1: string; r1c2: string; r2c1: string; r2c2: string };
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

export interface ConceptMatchData extends BaseActivityData {
    layout: string;
    pairs: {
        item1: string;
        item2: string;
        type: string;
        imagePrompt1?: string;
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
