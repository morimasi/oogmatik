import { BaseActivityData, _ShapeType, VisualMathType } from './common';
import { _ActivityType, _Student } from './core';

export interface NumberLogicRiddleData extends BaseActivityData {
  sumTarget: number;
  sumMessage?: string;
  showVisualAid?: boolean;
  numberRangeStart?: number;
  numberRangeEnd?: number;
  puzzles: {
    id: string;
    riddleParts: {
      text: string;
      icon: string;
      type: 'parity' | 'digits' | 'comparison' | 'arithmetic' | 'range';
    }[];
    visualDistraction: number[]; // Arka plandaki şüpheli sayılar
    options: string[];
    answer: string;
    answerValue: number;
    // logicProblems.ts and other generators might use these
    riddle?: string;
    boxes?: unknown[];
    visualHint?: string;
  }[];
}

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
  legend: { symbol: string; operation: string; value: number; color: string }[];
  chains: { startNumber: number; steps: { symbol: string; expectedValue?: number | null }[] }[];
}

export interface NumberPatternData extends BaseActivityData {
  patterns: { sequence: string; answer: string }[];
}

export interface ShapeNumberPatternData extends BaseActivityData {
  patterns: {
    shapes: {
      type: 'triangle';
      numbers: string[];
    }[];
  }[];
}

export interface FutoshikiData extends BaseActivityData {
  puzzles: { size: number; grid: (number | string | null)[][]; constraints?: unknown[] }[];
}

export interface NumberPyramidData extends BaseActivityData {
  pyramids: { rows: (number | string | null)[][] }[];
}

export interface NumberCapsuleData extends BaseActivityData {
  capsules: {
    id: string;
    target: number;
    cells: { x: number; y: number }[];
  }[];
  grid: (number | null)[][];
  rowTargets?: number[];
  colTargets?: number[];
}

export interface OddEvenSudokuData extends BaseActivityData {
  puzzles: { size: number; grid: (number | null)[][]; oddEvenMask: ('odd' | 'even' | null)[][] }[];
}

export interface ArithmeticConnectData extends BaseActivityData {
  example?: string;
  expressions: { text: string; value: number; group: number; x: number; y: number }[];
}

export interface KendokuData extends BaseActivityData {
  puzzles: unknown[];
}

export interface OperationSquareFillInData extends BaseActivityData {
  items: unknown[];
}

export interface MultiplicationWheelData extends BaseActivityData {
  items: unknown[];
}

export interface TargetNumberData extends BaseActivityData {
  items: unknown[];
}

export interface ShapeSudokuData extends BaseActivityData {
  puzzles: unknown[];
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
    difficulty?: string;
  };
}

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
  imagePrompt?: string; // AI tarafından üretilen görsel istemi
  type?: 'standard' | 'fill-in' | 'true-false' | 'comparison'; // Soru tipi
  options?: string[]; // Çoktan seçmeli/doğru-yanlış için opsiyonel şıklar
  steps?: string[]; // Çözüm adımları
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
  problemTypes: ('standard' | 'fill-in' | 'true-false' | 'comparison')[]; // Eklendi: Çoklu soru tipleri
  generateImages: boolean; // Eklendi: Görsel ipucu üretme toggle'ı
}

export interface LogicGridPuzzleData extends BaseActivityData {
  clues: string[];
  people: string[];
  categories: {
    title: string;
    items: {
      name: string;
      imageDescription: string;
      imagePrompt: string;
    }[];
  }[];
  prompt?: string;
}

export interface ThematicOddOneOutData extends BaseActivityData {
  theme: string;
  rows: {
    words: { text: string; imagePrompt: string }[];
    oddWord: string;
  }[];
  sentencePrompt: string;
  prompt?: string;
}

export interface ThematicOddOneOutSentenceData extends BaseActivityData {
  rows: {
    words: string[];
    oddWord: string;
  }[];
  sentencePrompt: string;
  prompt?: string;
}

export interface ColumnOddOneOutSentenceData extends BaseActivityData {
  columns: {
    words: string[];
    oddWord: string;
  }[];
  sentencePrompt: string;
  prompt?: string;
}

export interface PunctuationMazeData extends BaseActivityData {
  punctuationMark: string;
  grid: number[][];
  rules: { id: number; text: string; isCorrect: boolean; isPath: boolean }[];
  prompt?: string;
  correctSentences?: string[];
  incorrectSentences?: string[];
}

export interface PunctuationPhoneNumberData extends BaseActivityData {
  clues: { id: number; text: string }[];
  solution: { punctuationMark: string; number: number }[];
  prompt?: string;
}

export interface RomanArabicMatchConnectData extends BaseActivityData {
  gridDim: number;
  points: { label: string; pairId: number; x: number; y: number }[];
  prompt?: string;
}

export interface WeightConnectData extends BaseActivityData {
  gridDim: number;
  points: { label: string; pairId: number; x: number; y: number; imagePrompt: string }[];
  prompt?: string;
}

export interface LengthConnectData extends BaseActivityData {
  gridDim: number;
  points: { label: string; pairId: number; x: number; y: number; imagePrompt: string }[];
  prompt?: string;
}

export interface VisualNumberPatternData extends BaseActivityData {
  puzzles: {
    items: { number: number; color: string; size: number }[];
    rule: string;
    answer: number;
  }[];
  prompt?: string;
}

export interface OddOneOutData extends BaseActivityData {
  groups: { words: string[] }[];
}

export interface RomanNumeralStarHuntData extends BaseActivityData {
  items: unknown[];
}

export interface RoundingConnectData extends BaseActivityData {
  items: unknown[];
}

export interface RomanNumeralMultiplicationData extends BaseActivityData {
  items: unknown[];
}

export interface RomanNumeralConnectData extends BaseActivityData {
  items: unknown[];
}

export interface OperationSquareData extends BaseActivityData {
  items: unknown[];
}

export interface AbcConnectData extends BaseActivityData {
  gridDim: number;
  variant: 'roman' | 'case' | 'dots' | 'math';
  paths: {
    start: { x: number; y: number };
    end: { x: number; y: number };
    value: string | number;
    matchValue: string | number;
    id: string;
  }[];
  prompt?: string;
}

export interface MagicPyramidData extends BaseActivityData {
  pyramids: {
    layers: number;
    apex: number;
    step: number;
    grid: number[][];
    correctPath: number[];
  }[];
  instructionPrefix?: string;
}

export interface ApartmentResident {
  id: string; // Örn: R1, R2
  floor: number;
  room: number;
  variables: Record<string, string>; // Örn: { "name": "Ali", "color": "Kırmızı", "pet": "Kedi" }
}

export interface ApartmentLogicData extends BaseActivityData {
  settings?: {
    difficulty: 'çok kolay' | 'kolay' | 'orta' | 'zor';
    apartmentFloors: number;
    apartmentRoomsPerFloor: number;
    variableCount: number;
    negativeClues: boolean;
  };
  content: {
    title: string;
    variableTypes: string[]; // Örn: ["İsim", "Kapı Rengi", "Evcil Hayvan"]
    residents: ApartmentResident[];
    clues: string[];
  };
}

export interface FinancialMarketItem {
  id: string;
  name: string; // Örn: Elma, Süt, Oyuncak Araba
  price: number;
  category: 'food' | 'toy' | 'book' | 'clothes';
  icon: string; // FontAwesome class
}

export interface FinancialMarketData extends BaseActivityData {
  settings?: {
    difficulty: 'çok kolay' | 'kolay' | 'orta' | 'zor';
    currency: 'TRY' | 'USD' | 'EUR';
    useCents: boolean;
    budgetLimit: number;
  };
  content: {
    title: string;
    shopName: string; // Örn: Ali'nin Bakkalı
    walletBalance: number; // Öğrencinin sahip olduğu başlangıç parası
    shelves: FinancialMarketItem[]; // Marketteki tüm ürünler
    tasks: {
      id: string;
      instruction: string; // Örn: "2 tane süt ve 1 elma alırsan kaç lira ödersin?"
      cart: { itemId: string; quantity: number }[]; // Sepetteki ürünler
      expectedTotal: number;
      expectedChange: number; // Para üstü
    }[];
  };
}

export interface NumberSenseData extends BaseActivityData {
  exercises: {
    type: 'missing' | 'comparison' | 'ordering';
    values: number[];
    target: number;
    visualType: string;
    step?: number;
  }[];
  layout?: string;
}

export interface BoxMathProblem {
  id: string;
  expression: string;
  targetValue?: number;
  givenValue?: number;
  answer: number | string;
  result?: number;
}

export interface BoxMathData extends BaseActivityData {
  mode: 'reverse' | 'substitution' | 'simplification';
  problems: BoxMathProblem[];
}

