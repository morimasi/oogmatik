import { create } from 'zustand';
import type { WorksheetData, WorksheetBlock } from '../types';
import {
  addBlock as addBlockToData,
  allBlockIds,
  applyLayoutSettings,
  copyBlockStyle,
  duplicateBlocks as duplicateBlocksInData,
  moveBlocks as moveBlocksInData,
  removeBlocks as removeBlocksInData,
  resetBlockStyle as resetBlockStyleInData,
  updateBlockContent as updateBlockContentInData,
  updateBlockFlags as updateBlockFlagsInData,
  updateBlockMeta as updateBlockMetaInData,
  type BlockMetaPatch,
  updateBlockStyle as updateBlockStyleInData,
  type BlockStylePatch,
} from '../services/a4EditorService';

export type A4EditorTab =
  | 'library'
  | 'layers'
  | 'content'
  | 'styling'
  | 'page'
  | 'insights';
export type A4BlockAction =
  | 'duplicate'
  | 'delete'
  | 'hide'
  | 'show'
  | 'lock'
  | 'unlock'
  | 'move-up'
  | 'move-down'
  | 'reset-style'
  | 'copy-style'
  | 'paste-style';

interface DataBridge {
  get: () => WorksheetData;
  set: (data: WorksheetData) => void;
}

export interface A4Diagnostics {
  /** Aynı bileşen birden çok A4 sayfasına bölündüyse kimlikleri. */
  splitBlockIds: string[];
  /** Tek başına sayfaya sığmayan (ölçülen) bileşen kimlikleri. */
  overflowBlockIds: string[];
  /** Ölçüm yapılan sayfa sayısı. */
  measuredPages: number;
}

const EMPTY_DIAGNOSTICS: A4Diagnostics = {
  splitBlockIds: [],
  overflowBlockIds: [],
  measuredPages: 0,
};

const sameIds = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((id, index) => id === b[index]);

const HISTORY_LIMIT = 40;
const MERGE_WINDOW_MS = 700;
/** Bellek bütçesi: büyük etkinliklerde 40 JSON anlık görüntüsü tarayıcıyı kilitler. */
export const HISTORY_BYTE_BUDGET = 4_000_000;

const historyBytesOf = (history: string[]): number =>
  history.reduce((total, snapshot) => total + snapshot.length * 2, 0);

/** Anlık görüntüyü ekler; adım ve bayt bütçesini aşınca en eskiyi düşürür. */
const pushSnapshot = (history: string[], snapshot: string): string[] => {
  if (!snapshot) return history;
  const next = [...history, snapshot].slice(-HISTORY_LIMIT);
  let bytes = historyBytesOf(next);
  while (next.length > 1 && bytes > HISTORY_BYTE_BUDGET) {
    const removed = next.shift();
    bytes -= (removed?.length ?? 0) * 2;
  }
  return next;
};

const serialize = (data: WorksheetData): string => {
  try {
    return JSON.stringify(data ?? null);
  } catch {
    return '';
  }
};

const revive = (raw: string): WorksheetData => {
  try {
    return JSON.parse(raw) as WorksheetData;
  } catch {
    return null;
  }
};

interface A4EditorState {
  isEditorOpen: boolean;
  setEditorOpen: (isOpen: boolean) => void;

  selectedBlockId: string | null;
  selectedBlockIds: string[];
  setSelectedBlockId: (id: string | null, additive?: boolean) => void;
  toggleBlockSelection: (id: string) => void;
  selectBlocks: (ids: string[]) => void;
  clearSelection: () => void;

  editorTab: A4EditorTab;
  setEditorTab: (tab: A4EditorTab) => void;

  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;

  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showRulers: boolean;
  setShowRulers: (show: boolean) => void;
  showSafeArea: boolean;
  setShowSafeArea: (show: boolean) => void;
  isPrintPreview: boolean;
  setPrintPreview: (preview: boolean) => void;

  /** Sayfa üzerinde doğrudan düzenlenen bileşen (inline edit). */
  editingBlockId: string | null;
  setEditingBlockId: (id: string | null) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (isOpen: boolean) => void;

  /** Cevap anahtarı görünümü — öğrenci nüshası / öğretmen nüshası. */
  answerKeyMode: 'off' | 'overlay' | 'appendix';
  setAnswerKeyMode: (mode: 'off' | 'overlay' | 'appendix') => void;

  /** Kağıt ekonomisi ve baskı yardımcıları. */
  printLayout: 'single' | 'nup2';
  setPrintLayout: (layout: 'single' | 'nup2') => void;
  cutLines: boolean;
  setCutLines: (enabled: boolean) => void;

  /** Renderer tarafından ölçülen taşma/bölünme tanıları. */
  diagnostics: A4Diagnostics;
  setDiagnostics: (diagnostics: A4Diagnostics) => void;
  historyBytes: number;

  copiedStyle: NonNullable<WorksheetBlock['style']> | null;
  setCopiedStyle: (style: NonNullable<WorksheetBlock['style']> | null) => void;

  history: string[];
  future: string[];
  mergeKey: string | null;
  mergeAt: number;
  dirty: boolean;
  lastSavedAt: number | null;

  bridge: DataBridge | null;
  registerBridge: (bridge: DataBridge | null) => void;

  applyMutation: (
    updater: (data: WorksheetData) => WorksheetData,
    mergeKey?: string
  ) => void;
  undo: () => boolean;
  redo: () => boolean;
  clearHistory: () => void;
  markSaved: () => void;
  resetSession: () => void;

  updateBlockStyle: (ids: string[], patch: BlockStylePatch, mergeKey?: string) => void;
  updateBlockContent: (id: string, patch: Record<string, unknown>, mergeKey?: string) => void;
  updateBlockFlags: (ids: string[], flags: { hidden?: boolean; locked?: boolean }) => void;
  updateBlockMeta: (id: string, patch: BlockMetaPatch) => void;
  addBlock: (block: WorksheetBlock, afterId?: string | null) => void;
  applyBlockAction: (action: A4BlockAction, ids: string[]) => void;
  applyLayout: (patch: { cols?: number; gap?: number }) => void;

  excalidrawElements: readonly unknown[];
  setExcalidrawElements: (elements: readonly unknown[]) => void;
}

export const useA4EditorStore = create<A4EditorState>()((set, get) => ({
  isEditorOpen: false,
  setEditorOpen: (isOpen: boolean) =>
    set((state) => ({
      isEditorOpen: isOpen,
      selectedBlockId: isOpen ? state.selectedBlockId : null,
      selectedBlockIds: isOpen ? state.selectedBlockIds : [],
      isPrintPreview: isOpen ? state.isPrintPreview : false,
    })),

  selectedBlockId: null,
  selectedBlockIds: [],
  setSelectedBlockId: (id: string | null, additive = false) =>
    set((state) => {
      if (!id) {
        return { selectedBlockId: null, selectedBlockIds: [], editorTab: state.editorTab };
      }
      const alreadySelected = state.selectedBlockIds.includes(id);
      const ids = additive
        ? alreadySelected
          ? state.selectedBlockIds.filter((item) => item !== id)
          : [...state.selectedBlockIds, id]
        : [id];
      const primary = ids.length ? (alreadySelected && additive ? (ids[ids.length - 1] ?? null) : id) : null;
      return {
        selectedBlockIds: ids,
        selectedBlockId: primary,
        editorTab: state.editorTab === 'library' || state.editorTab === 'layers' ? 'content' : state.editorTab,
      };
    }),
  toggleBlockSelection: (id: string) => get().setSelectedBlockId(id, true),
  selectBlocks: (ids: string[]) =>
    set({ selectedBlockIds: ids, selectedBlockId: ids[ids.length - 1] ?? null }),
  clearSelection: () => set({ selectedBlockId: null, selectedBlockIds: [] }),

  editorTab: 'library',
  setEditorTab: (tab: A4EditorTab) => set({ editorTab: tab }),

  snapToGrid: false,
  setSnapToGrid: (snap: boolean) => set({ snapToGrid: snap }),
  gridSize: 10,
  setGridSize: (size: number) => set({ gridSize: Math.min(100, Math.max(4, Math.round(size))) }),

  showGrid: false,
  setShowGrid: (show: boolean) => set({ showGrid: show }),
  showRulers: true,
  setShowRulers: (show: boolean) => set({ showRulers: show }),
  showSafeArea: true,
  setShowSafeArea: (show: boolean) => set({ showSafeArea: show }),
  isPrintPreview: false,
  setPrintPreview: (preview: boolean) =>
    set({
      isPrintPreview: preview,
      selectedBlockId: preview ? null : get().selectedBlockId,
      selectedBlockIds: preview ? [] : get().selectedBlockIds,
      editingBlockId: preview ? null : get().editingBlockId,
    }),

  editingBlockId: null,
  setEditingBlockId: (id) => set({ editingBlockId: id }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (isOpen) => set({ commandPaletteOpen: isOpen }),

  answerKeyMode: 'off',
  setAnswerKeyMode: (mode) => set({ answerKeyMode: mode }),

  printLayout: 'single',
  setPrintLayout: (layout) => set({ printLayout: layout }),
  cutLines: false,
  setCutLines: (enabled) => set({ cutLines: enabled }),

  diagnostics: EMPTY_DIAGNOSTICS,
  setDiagnostics: (diagnostics) => {
    const current = get().diagnostics;
    if (
      current.measuredPages === diagnostics.measuredPages &&
      sameIds(current.splitBlockIds, diagnostics.splitBlockIds) &&
      sameIds(current.overflowBlockIds, diagnostics.overflowBlockIds)
    ) {
      return;
    }
    set({ diagnostics });
  },
  historyBytes: 0,

  copiedStyle: null,
  setCopiedStyle: (style) => set({ copiedStyle: style }),

  history: [],
  future: [],
  mergeKey: null,
  mergeAt: 0,
  dirty: false,
  lastSavedAt: null,

  bridge: null,
  registerBridge: (bridge) => set({ bridge }),

  applyMutation: (updater, mergeKey) => {
    const { bridge, history, future, mergeKey: currentMergeKey, mergeAt } = get();
    if (!bridge) return;
    const current = bridge.get();
    const next = updater(current);
    if (next === current) return;

    const snapshot = serialize(current);
    const now = Date.now();
    const canMerge =
      !!mergeKey && mergeKey === currentMergeKey && now - mergeAt < MERGE_WINDOW_MS && history.length > 0;

    const nextHistory = canMerge ? history : pushSnapshot(history, snapshot);

    bridge.set(next);
    set({
      history: nextHistory,
      historyBytes: historyBytesOf(nextHistory),
      future: [],
      mergeKey: mergeKey ?? null,
      mergeAt: now,
      dirty: true,
    });
  },

  undo: () => {
    const { bridge, history, future } = get();
    if (!bridge || history.length === 0) return false;
    const current = serialize(bridge.get());
    const previous = history[history.length - 1];
    const restored = revive(previous);
    if (!restored) return false;
    bridge.set(restored);
    set({
      history: history.slice(0, -1),
      historyBytes: historyBytesOf(history.slice(0, -1)),
      future: current ? [...future, current].slice(-HISTORY_LIMIT) : future,
      mergeKey: null,
      mergeAt: 0,
      dirty: true,
      editingBlockId: null,
    });
    return true;
  },

  redo: () => {
    const { bridge, history, future } = get();
    if (!bridge || future.length === 0) return false;
    const current = serialize(bridge.get());
    const next = future[future.length - 1];
    const restored = revive(next);
    if (!restored) return false;
    const nextHistory = current ? [...history, current].slice(-HISTORY_LIMIT) : history;
    bridge.set(restored);
    set({
      history: nextHistory,
      historyBytes: historyBytesOf(nextHistory),
      future: future.slice(0, -1),
      mergeKey: null,
      mergeAt: 0,
      dirty: true,
      editingBlockId: null,
    });
    return true;
  },

  clearHistory: () =>
    set({ history: [], future: [], mergeKey: null, mergeAt: 0, historyBytes: 0 }),

  markSaved: () => set({ dirty: false, lastSavedAt: Date.now() }),

  resetSession: () =>
    set({
      history: [],
      future: [],
      historyBytes: 0,
      mergeKey: null,
      mergeAt: 0,
      dirty: false,
      copiedStyle: null,
      selectedBlockId: null,
      selectedBlockIds: [],
      editingBlockId: null,
      diagnostics: EMPTY_DIAGNOSTICS,
    }),

  updateBlockStyle: (ids, patch, mergeKey) =>
    get().applyMutation(
      (data) => updateBlockStyleInData(data, ids, patch),
      mergeKey ?? `style:${ids.join(',')}`
    ),
  updateBlockContent: (id, patch, mergeKey) =>
    get().applyMutation(
      (data) => updateBlockContentInData(data, id, patch),
      mergeKey ?? `content:${id}`
    ),
  updateBlockFlags: (ids, flags) =>
    get().applyMutation((data) => updateBlockFlagsInData(data, ids, flags)),
  updateBlockMeta: (id, patch) =>
    get().applyMutation((data) => updateBlockMetaInData(data, id, patch), `meta:${id}`),
  addBlock: (block, afterId) => get().applyMutation((data) => addBlockToData(data, block, afterId)),
  applyLayout: (patch) => get().applyMutation((data) => applyLayoutSettings(data, patch)),

  applyBlockAction: (action, ids) => {
    if (!ids.length) return;
    const { applyMutation, copiedStyle, setCopiedStyle, setSelectedBlockId, clearSelection, bridge } = get();

    switch (action) {
      case 'duplicate':
        applyMutation((data) => duplicateBlocksInData(data, ids));
        break;
      case 'delete':
        applyMutation((data) => removeBlocksInData(data, ids));
        clearSelection();
        break;
      case 'hide':
        applyMutation((data) => updateBlockFlagsInData(data, ids, { hidden: true }));
        break;
      case 'show':
        applyMutation((data) => updateBlockFlagsInData(data, ids, { hidden: false }));
        break;
      case 'lock':
        applyMutation((data) => updateBlockFlagsInData(data, ids, { locked: true }));
        break;
      case 'unlock':
        applyMutation((data) => updateBlockFlagsInData(data, ids, { locked: false }));
        break;
      case 'move-up':
        applyMutation((data) => moveBlocksInData(data, ids, -1));
        break;
      case 'move-down':
        applyMutation((data) => moveBlocksInData(data, ids, 1));
        break;
      case 'reset-style':
        applyMutation((data) => resetBlockStyleInData(data, ids));
        break;
      case 'copy-style': {
        const data = bridge?.get() ?? null;
        const style = data ? copyBlockStyle(data, ids[0]) : null;
        setCopiedStyle(style);
        break;
      }
      case 'paste-style':
        if (copiedStyle) {
          applyMutation((data) => updateBlockStyleInData(data, ids, copiedStyle));
        }
        break;
      default:
        break;
    }
    if (action === 'duplicate') setSelectedBlockId(ids[0]);
  },

  excalidrawElements: [],
  setExcalidrawElements: (elements: readonly unknown[]) => set({ excalidrawElements: elements }),
}));

/** Araç çubuğu ve klavye kısayolları için yardımcı seçiciler. */
export const selectCanUndo = (state: A4EditorState): boolean => state.history.length > 0;
export const selectCanRedo = (state: A4EditorState): boolean => state.future.length > 0;

export const applyAllBlocks = (data: WorksheetData): string[] => allBlockIds(data);
