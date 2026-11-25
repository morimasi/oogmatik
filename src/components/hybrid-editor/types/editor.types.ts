import type { JSONContent } from '@tiptap/core';

/**
 * Hibrit Belge ve Vektör Editörü — birleşik tip ve şema katmanı.
 *
 * Tek bir `HybridDocumentSchema`; A4 sayfalarını (akış metni + vektör katmanı)
 * ve sınırsız tahtayı aynı JSON içinde taşır. Böylece kaydetme, geri alma ve
 * dışa aktarma tek bir doğruluk kaynağı üzerinden çalışır.
 */

export const A4_WIDTH = 794; // 210mm @ 96 DPI
export const A4_HEIGHT = 1123; // 297mm @ 96 DPI
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;
export const WHITEBOARD_WIDTH = 3000;
export const WHITEBOARD_HEIGHT = 2000;

export type EditorMode = 'document' | 'whiteboard';

export type VectorTool =
  | 'select'
  | 'pencil'
  | 'rect'
  | 'ellipse'
  | 'triangle'
  | 'star'
  | 'line'
  | 'arrow'
  | 'arrow-double'
  | 'text'
  | 'sticky';

export type LayerOrderAction = 'front' | 'forward' | 'backward' | 'back';

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Vektör katmanının kalıcı verisi (Fabric.js serialization). */
export interface CanvasSnapshot {
  json: string;
  width: number;
  height: number;
  zoom: number;
}

export interface HybridPage {
  id: string;
  name: string;
  margins: PageMargins;
  /** Word motoru: Tiptap JSON (başlık, paragraf, tablo, görsel). */
  doc: JSONContent | null;
  /** Sayfa üzerine bindirilen serbest çizim/şekil/metin katmanı. */
  canvas: CanvasSnapshot;
}

export interface WhiteboardState {
  canvas: CanvasSnapshot;
}

export interface VectorStyle {
  stroke: string;
  fill: string;
  strokeWidth: number;
  opacity: number;
  fontSize: number;
  fontFamily: string;
  textColor: string;
}

export interface HybridDocumentSchema {
  schemaVersion: 1;
  id: string;
  title: string;
  mode: EditorMode;
  activePageId: string;
  pages: HybridPage[];
  whiteboard: WhiteboardState;
  vectorStyle: VectorStyle;
  updatedAt: string;
}

export interface LayerInfo {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  opacity: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  fontSize: number;
  isGroup: boolean;
  hasText: boolean;
}

export interface LayerPatch {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  angle?: number;
  opacity?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
}

export interface VectorCanvasHandle {
  addShape: (tool: VectorTool) => void;
  addText: () => void;
  addSticky: () => void;
  addImage: (dataUrl: string) => void;
  nudgeSelection: (dx: number, dy: number) => void;
  clearSelection: () => void;
  deleteSelection: () => void;
  duplicateSelection: () => void;
  groupSelection: () => void;
  ungroupSelection: () => void;
  reorder: (action: LayerOrderAction) => void;
  toggleLock: () => void;
  toggleVisible: () => void;
  selectByIds: (ids: string[]) => void;
  updateSelection: (patch: LayerPatch) => void;
  applyStyle: (style: VectorStyle) => void;
  getSnapshot: () => CanvasSnapshot;
  loadSnapshot: (snapshot: CanvasSnapshot) => void;
  exportPng: (options?: { multiplier?: number; transparent?: boolean; selectionOnly?: boolean }) => string | null;
  clear: () => void;
}

export interface ExportResult {
  ok: boolean;
  message: string;
}

export const DEFAULT_MARGINS: PageMargins = { top: 64, right: 56, bottom: 64, left: 56 };

export const DEFAULT_VECTOR_STYLE: VectorStyle = {
  stroke: '#1e293b',
  fill: 'rgba(79, 70, 229, 0.14)',
  strokeWidth: 2,
  opacity: 1,
  fontSize: 20,
  fontFamily: 'Lexend, sans-serif',
  textColor: '#0f172a',
};

const newId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const emptySnapshot = (width: number, height: number): CanvasSnapshot => ({
  json: JSON.stringify({ version: '6.0.0', objects: [], background: '#ffffff' }),
  width,
  height,
  zoom: 1,
});

export const createEmptyPage = (index: number): HybridPage => ({
  id: newId('page'),
  name: `Sayfa ${index + 1}`,
  margins: { ...DEFAULT_MARGINS },
  doc: null,
  canvas: emptySnapshot(A4_WIDTH, A4_HEIGHT),
});

export const createEmptyDocument = (title = 'Yeni Hibrit Belge'): HybridDocumentSchema => {
  const page = createEmptyPage(0);
  return {
    schemaVersion: 1,
    id: newId('doc'),
    title,
    mode: 'document',
    activePageId: page.id,
    pages: [page],
    whiteboard: { canvas: emptySnapshot(WHITEBOARD_WIDTH, WHITEBOARD_HEIGHT) },
    vectorStyle: { ...DEFAULT_VECTOR_STYLE },
    updatedAt: new Date().toISOString(),
  };
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
