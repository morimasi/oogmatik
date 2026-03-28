import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  WorksheetEditorState,
  WorksheetDocument,
  WorksheetContent,
  WorksheetBlock,
  EditorSettings,
  DyslexiaSettings,
  ExportSettings,
  UseWorksheetStateReturn,
} from '../types/worksheet';
import {
  DEFAULT_EDITOR_SETTINGS,
  DEFAULT_DYSLEXIA_SETTINGS,
  DEFAULT_EXPORT_SETTINGS,
  BUILT_IN_TEMPLATES,
} from '../constants/templates';

// ── Initial document ──────────────────────────────────────────────────────────

const initialDocument: WorksheetDocument = BUILT_IN_TEMPLATES[0].document;

function buildInitialState(initialWorksheet?: Partial<WorksheetDocument>): WorksheetEditorState {
  const document = initialWorksheet ? { ...initialDocument, ...initialWorksheet } : initialDocument;
  return {
    document,
    editorSettings: { ...DEFAULT_EDITOR_SETTINGS },
    dyslexiaSettings: { ...DEFAULT_DYSLEXIA_SETTINGS },
    exportSettings: { ...DEFAULT_EXPORT_SETTINGS },
    selectedBlockId: null,
    isDirty: false,
    isSaving: false,
    isAutoSaving: false,
    lastSavedAt: null,
    zoom: 100,
    isPrintMode: false,
    showPreview: false,
    showExportPanel: false,
    showTemplateSelector: false,
    showDyslexiaControls: false,
    history: [document],
    historyIndex: 0,
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWorksheetState(
  initialWorksheet?: Partial<WorksheetDocument>
): UseWorksheetStateReturn {
  const [state, setState] = useState<WorksheetEditorState>(() =>
    buildInitialState(initialWorksheet)
  );
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auto-save ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!state.editorSettings.autoSave || !state.isDirty) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      setState((s) => ({
        ...s,
        isDirty: false,
        isSaving: false,
        lastSavedAt: new Date().toISOString(),
      }));
    }, state.editorSettings.autoSaveIntervalMs);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [state.isDirty, state.editorSettings.autoSave, state.editorSettings.autoSaveIntervalMs]);

  // ── Push history ─────────────────────────────────────────────────────────
  const pushHistory = useCallback((newDoc: WorksheetDocument) => {
    setState((s) => {
      const trimmed = s.history.slice(0, s.historyIndex + 1);
      const newHistory = [...trimmed, newDoc].slice(-50); // keep last 50 states
      return {
        ...s,
        document: newDoc,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
      };
    });
  }, []);

  // ── Document operations ───────────────────────────────────────────────────
  const setDocument = useCallback(
    (doc: WorksheetDocument) => {
      pushHistory(doc);
    },
    [pushHistory]
  );

  const updateContent = useCallback((content: Partial<WorksheetContent>) => {
    setState((s) => {
      const updated: WorksheetDocument = {
        ...s.document,
        content: { ...s.document.content, ...content },
      };
      const trimmed = s.history.slice(0, s.historyIndex + 1);
      const newHistory = [...trimmed, updated].slice(-50);
      return {
        ...s,
        document: updated,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
      };
    });
  }, []);

  // ── Block operations ──────────────────────────────────────────────────────
  const addBlock = useCallback((block: WorksheetBlock) => {
    setState((s) => {
      const blocks = [...s.document.content.blocks, block];
      const updated: WorksheetDocument = {
        ...s.document,
        content: { ...s.document.content, blocks },
      };
      const trimmed = s.history.slice(0, s.historyIndex + 1);
      const newHistory = [...trimmed, updated].slice(-50);
      return {
        ...s,
        document: updated,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
      };
    });
  }, []);

  const updateBlock = useCallback((id: string, updates: Partial<WorksheetBlock>) => {
    setState((s) => {
      const blocks = s.document.content.blocks.map((b) =>
        b.id === id ? ({ ...b, ...updates } as WorksheetBlock) : b
      );
      const updated: WorksheetDocument = {
        ...s.document,
        content: { ...s.document.content, blocks },
      };
      const trimmed = s.history.slice(0, s.historyIndex + 1);
      const newHistory = [...trimmed, updated].slice(-50);
      return {
        ...s,
        document: updated,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
      };
    });
  }, []);

  const removeBlock = useCallback((id: string) => {
    setState((s) => {
      const blocks = s.document.content.blocks.filter((b) => b.id !== id);
      const updated: WorksheetDocument = {
        ...s.document,
        content: { ...s.document.content, blocks },
      };
      const trimmed = s.history.slice(0, s.historyIndex + 1);
      const newHistory = [...trimmed, updated].slice(-50);
      return {
        ...s,
        document: updated,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
        selectedBlockId: null,
      };
    });
  }, []);

  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    setState((s) => {
      const blocks = [...s.document.content.blocks];
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx === -1) return s;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= blocks.length) return s;
      [blocks[idx], blocks[newIdx]] = [blocks[newIdx], blocks[idx]];
      const updated: WorksheetDocument = {
        ...s.document,
        content: { ...s.document.content, blocks },
      };
      const trimmed = s.history.slice(0, s.historyIndex + 1);
      const newHistory = [...trimmed, updated].slice(-50);
      return {
        ...s,
        document: updated,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
      };
    });
  }, []);

  const selectBlock = useCallback((id: string | null) => {
    setState((s) => ({ ...s, selectedBlockId: id }));
  }, []);

  // ── Settings operations ───────────────────────────────────────────────────
  const _updateEditorSettings = useCallback((settings: Partial<EditorSettings>) => {
    setState((s) => ({ ...s, editorSettings: { ...s.editorSettings, ...settings } }));
  }, []);

  const updateDyslexiaSettings = useCallback((settings: Partial<DyslexiaSettings>) => {
    setState((s) => ({ ...s, dyslexiaSettings: { ...s.dyslexiaSettings, ...settings } }));
  }, []);

  const updateExportSettings = useCallback((settings: Partial<ExportSettings>) => {
    setState((s) => ({ ...s, exportSettings: { ...s.exportSettings, ...settings } }));
  }, []);

  // ── Undo / Redo ───────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    setState((s) => {
      if (s.historyIndex <= 0) return s;
      const newIndex = s.historyIndex - 1;
      return { ...s, document: s.history[newIndex], historyIndex: newIndex, isDirty: true };
    });
  }, []);

  const redo = useCallback(() => {
    setState((s) => {
      if (s.historyIndex >= s.history.length - 1) return s;
      const newIndex = s.historyIndex + 1;
      return { ...s, document: s.history[newIndex], historyIndex: newIndex, isDirty: true };
    });
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const _save = useCallback(async () => {
    setState((s) => ({ ...s, isSaving: true }));
    // In a real app, this would call an API. Here we simulate a brief delay.
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
    setState((s) => ({
      ...s,
      isSaving: false,
      isDirty: false,
      lastSavedAt: new Date().toISOString(),
    }));
  }, []);

  const setZoom = useCallback((zoom: number) => setState((s) => ({ ...s, zoom })), []);
  const togglePrintMode = useCallback(
    () => setState((s) => ({ ...s, isPrintMode: !s.isPrintMode })),
    []
  );
  const togglePreview = useCallback(
    () => setState((s) => ({ ...s, showPreview: !s.showPreview })),
    []
  );
  const toggleExportPanel = useCallback(
    () => setState((s) => ({ ...s, showExportPanel: !s.showExportPanel })),
    []
  );
  const toggleTemplateSelector = useCallback(
    () => setState((s) => ({ ...s, showTemplateSelector: !s.showTemplateSelector })),
    []
  );
  const toggleDyslexiaControls = useCallback(
    () => setState((s) => ({ ...s, showDyslexiaControls: !s.showDyslexiaControls })),
    []
  );
  const setAutoSaving = useCallback(
    (isAutoSaving: boolean) => setState((s) => ({ ...s, isAutoSaving })),
    []
  );
  const markSaved = useCallback(
    () => setState((s) => ({ ...s, isDirty: false, lastSavedAt: new Date().toISOString() })),
    []
  );
  const resetDyslexiaSettings = useCallback(
    () => setState((s) => ({ ...s, dyslexiaSettings: { ...DEFAULT_DYSLEXIA_SETTINGS } })),
    []
  );

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetWorksheet = useCallback(() => {
    setState(buildInitialState(initialWorksheet));
  }, [initialWorksheet]);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return {
    editorState: state,
    worksheet: state.document,
    exportSettings: state.exportSettings,
    dyslexiaSettings: state.dyslexiaSettings,
    canUndo,
    canRedo,
    setDocument,
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
    updateTitle: (title: string, saveToHistory?: boolean) => {
      setState((s) => {
        const updated = {
          ...s.document,
          metadata: { ...s.document.metadata, title },
        };
        const newHistory = saveToHistory
          ? [...s.history.slice(0, s.historyIndex + 1), updated]
          : s.history;
        return {
          ...s,
          document: updated,
          history: newHistory,
          historyIndex: saveToHistory ? s.historyIndex + 1 : s.historyIndex,
          isDirty: true,
        };
      });
    },
    undo,
    redo,
    resetWorksheet,
  };
}
