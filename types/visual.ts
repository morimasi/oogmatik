
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
        itemType: 'svg' | 'text' | 'image' | 'character';
        layout: 'single' | 'grid_compact' | 'ultra_dense';
        isProfessionalMode: boolean;
        showClinicalNotes?: boolean;
    };
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
        layout: 'single' | 'grid_compact' | 'ultra_dense';
        itemType: 'svg' | 'text' | 'image';
        isProfessionalMode: boolean;
        showClinicalNotes?: boolean;
    };
    rows: {
        items: VisualOddOneOutItem[];
        correctIndex: number;
        reason?: string;
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
    cities: { id: string; name: string; x: number; y: number; region?: string; isCoastal?: boolean; neighbors?: string[] }[];
    settings?: {
        showCityNames: boolean;
        markerStyle: 'circle' | 'star' | 'target' | 'dot' | 'none';
        difficulty: string;
    };
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
