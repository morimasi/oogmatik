export interface StyleSettings {
    fontSize: number;
    scale: number;
    borderColor: string;
    borderWidth: number;
    margin: number;
    columns: number;
    gap: number;
    orientation: 'portrait' | 'landscape';
    themeBorder: 'none' | 'simple' | 'math' | 'verbal' | 'stars' | 'geo';
    contentAlign: 'left' | 'center' | 'right' | 'justify';
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    visualStyle: 'card' | 'minimal';
    showPedagogicalNote: boolean;
    showMascot: boolean;
    showStudentInfo: boolean;
    showTitle: boolean;
    showInstruction: boolean;
    showImage: boolean;
    showFooter: boolean;
    footerText: string;
    smartPagination: boolean;
    fontFamily: string;
    lineHeight: number;
    letterSpacing: number;
    wordSpacing: number;
    paragraphSpacing: number;
    focusMode: boolean;
    rulerColor: string;
    rulerHeight: number;
    maskOpacity: number;
    title?: string;
    // Premium & Engineering Enhancements
    bionicReading?: boolean;
    colorOverlay?: string;
    overlayOpacity?: number;
    showPrintMarks?: boolean;
    bleed?: number;
    gridSystem?: 'none' | 'rule' | 'grid' | 'dot';
    gridSize?: number;
    highContrast?: boolean;
    letterCase?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    lineFocus?: boolean;
    syllableHighlight?: boolean;
    readingSpeed?: number;
}

export interface BaseActivityData {
    title: string;
    instruction: string;
    pedagogicalNote?: string;
    imagePrompt?: string;
    imageBase64?: string;
    targetedErrors?: string[];
}

export type CognitiveDomain =
    | 'visual_spatial_memory'
    | 'processing_speed'
    | 'selective_attention'
    | 'phonological_loop'
    | 'logical_reasoning'
    | 'visual_search';

export type ShapeType =
    | 'circle'
    | 'square'
    | 'triangle'
    | 'hexagon'
    | 'star'
    | 'diamond'
    | 'pentagon'
    | 'octagon';

export type VisualMathType = 'ten-frame' | 'dice' | 'blocks' | 'objects' | 'number-bond' | 'mixed';
