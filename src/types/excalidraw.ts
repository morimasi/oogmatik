/**
 * BDMIND — Excalidraw Vektörel Çizim & Karalama Katmanı Tipleri
 */

export interface ExcalidrawLayerData {
    id: string;
    elements: readonly unknown[];
    appState?: {
        viewBackgroundColor?: string;
        currentItemStrokeColor?: string;
        currentItemBackgroundColor?: string;
        currentItemFillStyle?: string;
        currentItemStrokeWidth?: number;
    };
    lastUpdated: number;
}

export interface ExcalidrawCanvasProps {
    initialElements?: readonly unknown[];
    onChange?: (elements: readonly unknown[]) => void;
    isReadOnly?: boolean;
    theme?: 'light' | 'dark';
    height?: string | number;
    width?: string | number;
    className?: string;
}
