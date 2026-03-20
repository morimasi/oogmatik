import { useState, useCallback } from 'react';
import type {
  Worksheet,
  WorksheetContent,
  WorksheetContentBlock,
  EditorState,
  DyslexiaSettings,
  ExportSettings,
  HistoryEntry,
} from '../types/worksheet';
import { DEFAULT_DYSLEXIA_SETTINGS, DEFAULT_EXPORT_SETTINGS, EMPTY_WORKSHEET_CONTENT } from '../constants/templates';

const MAX_HISTORY = 50;

function generateId() {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function makeEmptyWorksheet(): Worksheet {
  return {
    metadata: {
      id: generateId(),
      title: 'Yeni Çalışma Kağıdı',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    content: structuredClone(EMPTY_WORKSHEET_CONTENT),
  };
}

export interface UseWorksheetStateReturn {
  // Worksheet data
  worksheet: Worksheet;
  // Editor UI state
  editorState: EditorState;
  // Dyslexia settings
  dyslexiaSettings: DyslexiaSettings;
  // Export settings
  exportSettings: ExportSettings;
  // History helpers
  canUndo: boolean;
  canRedo: boolean;

  // Worksheet actions
  setWorksheet: (ws: Worksheet) => void;
  updateTitle: (title: string) => void;
  updateContent: (content: WorksheetContent, description?: string) => void;
  addBlock: (block: Omit<WorksheetContentBlock, 'id'>) => void;
  updateBlock: (id: string, patch: Partial<WorksheetContentBlock>) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;

  // Editor UI actions
  selectBlock: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  togglePrintMode: () => void;
  togglePreview: () => void;
  toggleExportPanel: () => void;
  toggleTemplateSelector: () => void;
  toggleDyslexiaControls: () => void;
  setAutoSaving: (v: boolean) => void;
  markSaved: () => void;

  // Dyslexia actions
  updateDyslexiaSettings: (patch: Partial<DyslexiaSettings>) => void;
  resetDyslexiaSettings: () => void;

  // Export actions
  updateExportSettings: (patch: Partial<ExportSettings>) => void;

  // History actions
  undo: () => void;
  redo: () => void;

  // Reset
  resetWorksheet: () => void;
}

export function useWorksheetState(initial?: Partial<Worksheet>): UseWorksheetStateReturn {
  const [worksheet, setWorksheetState] = useState<Worksheet>(() => ({
    ...makeEmptyWorksheet(),
    ...initial,
  }));

  const [editorState, setEditorState] = useState<EditorState>({
    selectedBlockId: null,
    isDirty: false,
    isAutoSaving: false,
    lastSavedAt: null,
    zoom: 100,
    isPrintMode: false,
    showPreview: false,
    showExportPanel: false,
    showTemplateSelector: false,
    showDyslexiaControls: false,
  });

  const [dyslexiaSettings, setDyslexiaSettings] = useState<DyslexiaSettings>(
    DEFAULT_DYSLEXIA_SETTINGS,
  );
  const [exportSettings, setExportSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);

  // Undo/redo stacks
  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);

  // ── helpers ──────────────────────────────────────────────────────────────────

  const pushHistory = useCallback(
    (prev: WorksheetContent, description?: string) => {
      setUndoStack((s) => [
        ...s.slice(-(MAX_HISTORY - 1)),
        { content: prev, timestamp: nowIso(), description },
      ]);
      setRedoStack([]);
    },
    [],
  );

  // ── worksheet actions ─────────────────────────────────────────────────────────

  const setWorksheet = useCallback((ws: Worksheet) => {
    setWorksheetState(ws);
    setUndoStack([]);
    setRedoStack([]);
    setEditorState((s) => ({ ...s, isDirty: false }));
  }, []);

  const updateTitle = useCallback((title: string) => {
    setWorksheetState((ws) => ({
      ...ws,
      metadata: { ...ws.metadata, title, updatedAt: nowIso() },
    }));
    setEditorState((s) => ({ ...s, isDirty: true }));
  }, []);

  const updateContent = useCallback(
    (content: WorksheetContent, description?: string) => {
      setWorksheetState((ws) => {
        pushHistory(ws.content, description);
        return { ...ws, content, metadata: { ...ws.metadata, updatedAt: nowIso() } };
      });
      setEditorState((s) => ({ ...s, isDirty: true }));
    },
    [pushHistory],
  );

  const addBlock = useCallback(
    (block: Omit<WorksheetContentBlock, 'id'>) => {
      setWorksheetState((ws) => {
        const newBlock: WorksheetContentBlock = { ...block, id: generateId() };
        const newContent: WorksheetContent = {
          ...ws.content,
          blocks: [...ws.content.blocks, newBlock],
        };
        pushHistory(ws.content, 'Blok eklendi');
        return { ...ws, content: newContent, metadata: { ...ws.metadata, updatedAt: nowIso() } };
      });
      setEditorState((s) => ({ ...s, isDirty: true }));
    },
    [pushHistory],
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<WorksheetContentBlock>) => {
      setWorksheetState((ws) => {
        const newContent: WorksheetContent = {
          ...ws.content,
          blocks: ws.content.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        };
        pushHistory(ws.content, 'Blok güncellendi');
        return { ...ws, content: newContent, metadata: { ...ws.metadata, updatedAt: nowIso() } };
      });
      setEditorState((s) => ({ ...s, isDirty: true }));
    },
    [pushHistory],
  );

  const removeBlock = useCallback(
    (id: string) => {
      setWorksheetState((ws) => {
        const newContent: WorksheetContent = {
          ...ws.content,
          blocks: ws.content.blocks.filter((b) => b.id !== id),
        };
        pushHistory(ws.content, 'Blok silindi');
        return { ...ws, content: newContent, metadata: { ...ws.metadata, updatedAt: nowIso() } };
      });
      setEditorState((s) => ({ ...s, isDirty: true, selectedBlockId: null }));
    },
    [pushHistory],
  );

  const moveBlock = useCallback(
    (id: string, direction: 'up' | 'down') => {
      setWorksheetState((ws) => {
        const blocks = [...ws.content.blocks];
        const idx = blocks.findIndex((b) => b.id === id);
        if (idx === -1) return ws;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= blocks.length) return ws;
        [blocks[idx], blocks[targetIdx]] = [blocks[targetIdx], blocks[idx]];
        const newContent: WorksheetContent = { ...ws.content, blocks };
        pushHistory(ws.content, 'Blok taşındı');
        return { ...ws, content: newContent, metadata: { ...ws.metadata, updatedAt: nowIso() } };
      });
      setEditorState((s) => ({ ...s, isDirty: true }));
    },
    [pushHistory],
  );

  // ── editor UI actions ─────────────────────────────────────────────────────────

  const selectBlock = useCallback((id: string | null) => {
    setEditorState((s) => ({ ...s, selectedBlockId: id }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setEditorState((s) => ({ ...s, zoom }));
  }, []);

  const togglePrintMode = useCallback(() => {
    setEditorState((s) => ({ ...s, isPrintMode: !s.isPrintMode }));
  }, []);

  const togglePreview = useCallback(() => {
    setEditorState((s) => ({ ...s, showPreview: !s.showPreview }));
  }, []);

  const toggleExportPanel = useCallback(() => {
    setEditorState((s) => ({ ...s, showExportPanel: !s.showExportPanel }));
  }, []);

  const toggleTemplateSelector = useCallback(() => {
    setEditorState((s) => ({ ...s, showTemplateSelector: !s.showTemplateSelector }));
  }, []);

  const toggleDyslexiaControls = useCallback(() => {
    setEditorState((s) => ({ ...s, showDyslexiaControls: !s.showDyslexiaControls }));
  }, []);

  const setAutoSaving = useCallback((v: boolean) => {
    setEditorState((s) => ({ ...s, isAutoSaving: v }));
  }, []);

  const markSaved = useCallback(() => {
    setEditorState((s) => ({
      ...s,
      isDirty: false,
      isAutoSaving: false,
      lastSavedAt: nowIso(),
    }));
  }, []);

  // ── dyslexia actions ──────────────────────────────────────────────────────────

  const updateDyslexiaSettings = useCallback((patch: Partial<DyslexiaSettings>) => {
    setDyslexiaSettings((s) => ({ ...s, ...patch }));
  }, []);

  const resetDyslexiaSettings = useCallback(() => {
    setDyslexiaSettings(DEFAULT_DYSLEXIA_SETTINGS);
  }, []);

  // ── export actions ────────────────────────────────────────────────────────────

  const updateExportSettings = useCallback((patch: Partial<ExportSettings>) => {
    setExportSettings((s) => ({ ...s, ...patch }));
  }, []);

  // ── history ───────────────────────────────────────────────────────────────────

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const entry = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setWorksheetState((ws) => {
      setRedoStack((r) => [
        ...r,
        { content: ws.content, timestamp: nowIso(), description: 'Geri alındı' },
      ]);
      return { ...ws, content: entry.content, metadata: { ...ws.metadata, updatedAt: nowIso() } };
    });
    setEditorState((s) => ({ ...s, isDirty: true }));
  }, [undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const entry = redoStack[redoStack.length - 1];
    setRedoStack((s) => s.slice(0, -1));
    setWorksheetState((ws) => {
      setUndoStack((u) => [
        ...u,
        { content: ws.content, timestamp: nowIso(), description: 'Yeniden yapıldı' },
      ]);
      return { ...ws, content: entry.content, metadata: { ...ws.metadata, updatedAt: nowIso() } };
    });
    setEditorState((s) => ({ ...s, isDirty: true }));
  }, [redoStack]);

  // ── reset ─────────────────────────────────────────────────────────────────────

  const resetWorksheet = useCallback(() => {
    setWorksheetState(makeEmptyWorksheet());
    setEditorState({
      selectedBlockId: null,
      isDirty: false,
      isAutoSaving: false,
      lastSavedAt: null,
      zoom: 100,
      isPrintMode: false,
      showPreview: false,
      showExportPanel: false,
      showTemplateSelector: false,
      showDyslexiaControls: false,
    });
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  return {
    worksheet,
    editorState,
    dyslexiaSettings,
    exportSettings,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    setWorksheet,
    updateTitle,
    updateContent,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    selectBlock,
    setZoom,
    togglePrintMode,
    togglePreview,
    toggleExportPanel,
    toggleTemplateSelector,
    toggleDyslexiaControls,
    setAutoSaving,
    markSaved,
    updateDyslexiaSettings,
    resetDyslexiaSettings,
    updateExportSettings,
    undo,
    redo,
    resetWorksheet,
  };
}
