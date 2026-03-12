import { BaseActivityData, ShapeType, ActivityType } from './core';

export * from './core';

export interface SearchFieldItem {
  id: string;
  type: ShapeType;
  color: string;
  rotation: number;
  size: number;
  x: number; // 0-100 arası koordinat
  y: number; // 0-100 arası koordinat
}

export interface ShapeCountingData extends BaseActivityData {
  settings?: {
    difficulty: 'beginner' | 'intermediate' | 'expert' | 'clinical';
    layout: 'single' | 'grid_2x1' | 'grid_2x2';
    targetShape: ShapeType;
    overlapping: boolean; // Şekillerin iç içe geçme durumu
    isProfessionalMode: boolean;
    showClinicalNotes?: boolean;
  };
  sections: {
    searchField: SearchFieldItem[];
    correctCount: number;
    title: string;
    clinicalMeta?: {
      figureGroundComplexity: number;
      overlappingRatio: number;
    };
  }[];
}

export interface FindTheDifferenceData extends BaseActivityData {
  settings?: {
    difficulty: 'beginner' | 'intermediate' | 'expert' | 'clinical';
    differenceType: 'visual' | 'character' | 'morphological' | 'symbolic';
    itemType: 'svg' | 'text' | 'image' | 'character' | 'word';
    layout: 'single' | 'grid_compact' | 'ultra_dense' | 'side_by_side';
    isProfessionalMode: boolean;
    showClinicalNotes?: boolean;
  };
  gridA?: any[][];
  gridB?: any[][];
  diffCount?: number;
  rows: {
    items: any[]; // Supports strings, SVG objects, or references
    correctIndex: number;
    visualDistractionLevel: 'low' | 'medium' | 'high' | 'extreme';
    clinicalMeta?: {
      errorType?: string;
      rotationAngle?: number;
      isMirrored?: boolean;
      strokeDifference?: string;
    };
  }[];
}

export interface WordComparisonData extends BaseActivityData {
  groups: {
    target: string;
    options: string[];
    answer: string;
  }[];
}

export interface ShapeMatchingData extends BaseActivityData {
  leftColumn: { id: string; shapes: ShapeType[] }[];
  rightColumn: { id: string; shapes: ShapeType[] }[];
}

export interface FindIdenticalWordData extends BaseActivityData {
  groups: {
    words: string[];
    distractors: string[];
  }[];
}

export interface VisualOddOneOutItem {
  svg?: string; // Inline SVG content for clinical precision
  imagePrompt?: string;
  label?: string;
  rotation?: number;
  scale?: number;
  isMirrored?: boolean;
  segments?: boolean[];
  clinicalMeta?: {
    isModified?: boolean;
    modifiedPart?: string;
    strokeDifference?: number;
  };
}

export interface VisualOddOneOutData extends BaseActivityData {
  settings?: {
    difficulty: 'beginner' | 'intermediate' | 'expert' | 'clinical';
    layout: 'single' | 'grid_compact' | 'ultra_dense' | 'protocol';
    itemType: 'svg' | 'text' | 'image' | 'character';
    subType?: 'character_discrimination' | 'symbolic_logic' | 'object_recognition';
    isProfessionalMode: boolean;
    showClinicalNotes?: boolean;
    cognitiveLoad?: number;
  };
  rows: {
    items: VisualOddOneOutItem[];
    correctIndex: number;
    reason?: string;
    clinicalMeta?: {
      discriminationFactor?: number; // 0-1
      isMirrorTask?: boolean;
      targetCognitiveSkill?: string;
      targetedError?: string;
      cognitiveLoad?: number;
    };
  }[];
}

export interface GridDrawingData extends BaseActivityData {
  settings?: {
    difficulty: 'beginner' | 'intermediate' | 'expert' | 'clinical';
    layout: 'side_by_side' | 'stacked';
    gridType: 'dots' | 'squares' | 'crosses';
    transformMode: 'copy' | 'mirror_v' | 'mirror_h' | 'rotate_90' | 'rotate_180';
    showCoordinates: boolean;
    isProfessionalMode: boolean;
    showClinicalNotes?: boolean;
  };
  gridDim: number;
  drawings: {
    lines: [number, number][][];
    complexityLevel?: string;
    title: string;
    clinicalMeta?: {
      crossingPoints: number;
      angleTypes: string[];
      isSymmetric: boolean;
    };
  }[];
}

export interface SymmetryDrawingData extends BaseActivityData {
  settings?: {
    difficulty: 'beginner' | 'intermediate' | 'expert' | 'clinical';
    axis: 'vertical' | 'horizontal' | 'diagonal';
    gridType: 'dots' | 'squares' | 'crosses';
    layout: 'single' | 'grid_2x1' | 'grid_2x2';
    showGhostPoints: boolean;
    showCoordinates: boolean;
    isProfessionalMode: boolean;
    showClinicalNotes?: boolean;
  };
  gridDim: number;
  drawings: {
    lines: { x1: number; y1: number; x2: number; y2: number; color?: string }[];
    dots: { x: number; y: number; color?: string }[];
    title: string;
    clinicalMeta?: {
      asymmetryIndex: number; // 0-1 range
      complexity: number;
      targetCognitiveSkill: string;
    };
  }[];
}

export interface DirectionalTrackingData extends BaseActivityData {
  settings?: {
    difficulty: 'beginner' | 'intermediate' | 'expert' | 'clinical';
    layout: 'single' | 'grid_2x1' | 'grid_compact';
    rotationEnabled: boolean;
    pathComplexity: number;
    isProfessionalMode: boolean;
    showClinicalNotes?: boolean;
    gridSize?: number;
    contentType?: 'letters' | 'numbers' | 'mixed' | 'words';
  };
  puzzles: {
    grid: string[][];
    path: string[];
    startPos: { r: number; c: number };
    targetWord: string;
    title: string;
    clinicalMeta?: {
      perceptualLoad: number;
      attentionShiftCount: number;
    };
  }[];
}

export interface MapInstructionData extends BaseActivityData {
  instructions: string[];
  cities: {
    id: string;
    name: string;
    x: number;
    y: number;
    region?: string;
    isCoastal?: boolean;
    neighbors?: string[];
    gridCode?: string;
  }[];
  emphasizedRegion?: string;
  questionType?:
    | 'spatial_logic'
    | 'linguistic_geo'
    | 'attribute_search'
    | 'neighbor_path'
    | 'route_planning';
  difficultyLevel?: 1 | 2 | 3 | 4 | 5;
  settings?: {
    showCityNames: boolean;
    markerStyle: 'circle' | 'star' | 'target' | 'dot' | 'none';
    difficulty: string;
    mapType?: 'turkey' | 'world' | 'treasure';
    includeCompass?: boolean;
    useGridSystem?: boolean;
  };
  gridConfig?: { rows: number; cols: number };
}

export interface SymbolCipherData extends BaseActivityData {
  key: Record<string, string>;
  puzzles: string[];
}

export interface BlockPaintingData extends BaseActivityData {
  grid: number[][];
  colorMap: Record<number, string>;
}

export interface FindDifferentStringData extends BaseActivityData {
  rows: { items: string[] }[];
}

export interface DotPaintingData extends BaseActivityData {
  grid: number[][];
}

export interface AbcConnectVisualData extends BaseActivityData {
  points: { x: number; y: number; label: string }[];
}

export interface CoordinateCipherData extends BaseActivityData {
  grid: string[][];
  coords: { r: number; c: number }[];
}

export interface WordConnectData extends BaseActivityData {
  left: string[];
  right: string[];
}

export interface ProfessionConnectData extends BaseActivityData {
  professions: { name: string; tool: string }[];
}

export interface MatchstickSymmetryData extends BaseActivityData {
  sticks: { x1: number; y1: number; x2: number; y2: number }[];
}

export interface VisualOddOneOutThemedData extends BaseActivityData {
  rows: { items: { imagePrompt: string }[]; correctIndex: number }[];
}

export interface PunctuationColoringData extends BaseActivityData {
  text: string;
  marks: string[];
}

export interface SynonymAntonymColoringData extends BaseActivityData {
  words: { text: string; type: 'synonym' | 'antonym' }[];
}

export interface StarHuntData extends BaseActivityData {
  grid: string[][];
  target: string;
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

export interface DirectionalCodeReadingData extends BaseActivityData {
  settings?: {
    difficulty: 'çok kolay' | 'kolay' | 'orta' | 'zor';
    gridSize: number; // Örn: 5x5, 8x8
    obstacleDensity: number; // % yüzde
    cipherType: 'arrows' | 'letters' | 'colors';
  };
  content: {
    title: string;
    storyIntro?: string;
    grid: {
      x: number;
      y: number;
      type: 'empty' | 'obstacle' | 'start' | 'target' | 'path';
      icon?: string;
    }[][];
    startPos: { x: number; y: number };
    targetPos: { x: number; y: number };
    instructions: { step: number; count: number; direction: 'up' | 'down' | 'left' | 'right' }[];
  };
}

export interface PatternCell {
  x: number;
  y: number;
  isMissing: boolean; // Eksik (Soru İşareti) olan parça bu mu?
  shapes?: { type: ShapeType; color: string; rotation: number }[]; // Geometrik tipler için (Hücre içinde birden fazla şekil olabilir)
  color?: string; // Sadece color block modunda hücre rengi
  content?: string; // Logic mode modunda veya özel semboller (, sayı, harf)
}

export interface PatternCompletionData extends BaseActivityData {
  settings?: {
    difficulty: 'çok kolay' | 'kolay' | 'orta' | 'zor';
    patternType: 'geometric' | 'color_blocks' | 'logic_sequence';
    gridSize: number; // Örn: 3x3
  };
  content: {
    title: string;
    instruction: string;
    matrix: PatternCell[];
    options: {
      id: string; // A, B, C, D
      isCorrect: boolean;
      cell: PatternCell; // Seçenekteki parçanın görsel karşılığı
    }[];
  };
}
