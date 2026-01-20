
import { BaseActivityData, ShapeType } from './core';

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
    settings: {
        difficulty: string;
        itemCount: number; // Toplam nesne sayısı
        targetShape: ShapeType;
        colorComplexity: 'monochrome' | 'simple' | 'full';
        layoutType: 'grid' | 'chaotic';
        // Fix: Added missing properties used in offline generator
        showClues?: boolean;
        density?: string;
        variety?: string;
    };
    searchField: SearchFieldItem[];
    correctCount: number; // Hedef şeklin toplam sayısı
    clues: string[];
}

/**
 * FIX: Added missing visual perception data interfaces
 */

export interface FindTheDifferenceData extends BaseActivityData {
    rows: {
        items: string[];
        correctIndex: number;
        visualDistractionLevel: 'low' | 'medium' | 'high' | 'extreme';
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
    svgPaths?: { d: string; fill?: string; stroke?: string; strokeWidth?: number }[];
    label?: string;
    rotation?: number;
    scale?: number;
    isMirrored?: boolean;
    segments?: boolean[]; // For SegmentDisplay compatibility
}

export interface VisualOddOneOutData extends BaseActivityData {
    difficultyLevel: string;
    distractionLevel: 'low' | 'medium' | 'high' | 'extreme';
    rows: {
        items: VisualOddOneOutItem[];
        correctIndex: number;
        reason?: string;
    }[];
}

export interface GridDrawingData extends BaseActivityData {
    gridDim: number;
    showCoordinates: boolean;
    transformMode: 'copy' | 'mirror_v' | 'mirror_h' | 'rotate_90';
    drawings: {
        lines: [number, number][][];
        complexityLevel: string;
        title: string;
    }[];
}

export interface SymmetryDrawingData extends BaseActivityData {
    gridDim: number;
    axis: 'vertical' | 'horizontal';
    showCoordinates: boolean;
    isMirrorImage: boolean;
    lines: { x1: number; y1: number; x2: number; y2: number; color: string }[];
    dots: { x: number; y: number; color: string }[];
}

export interface DirectionalTrackingData extends BaseActivityData {
    puzzles: {
        grid: string[][];
        path: string[];
        startPos: { r: number; c: number };
        targetWord: string;
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

export interface AbcConnectData extends BaseActivityData {
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
