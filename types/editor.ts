import React from 'react';

export interface EditorElementState {
    id: string;
    x: number;
    y: number;
    width: number | string;
    height: number | string;
    rotation: number;
    zIndex: number;
    style?: React.CSSProperties;
    type: 'text' | 'image' | 'shape' | 'group' | 'block';
    content?: string;
}

export interface EditorHistoryState {
    past: EditorElementState[][];
    present: EditorElementState[];
    future: EditorElementState[][];
}

export type AlignType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export type DistributeType = 'horizontal' | 'vertical';