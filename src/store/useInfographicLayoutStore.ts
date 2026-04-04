/**
 * @file src/store/useInfographicLayoutStore.ts
 * @description InfographicStudio v3 Ultra Premium — Layout State Management
 *
 * Zustand store for layout configuration with undo/redo support.
 */

import { create } from 'zustand';
import { CompactLayoutConfig } from '../services/layout/CompactLayoutEngine';

interface InfographicLayoutState {
  layoutConfig: CompactLayoutConfig;
  history: CompactLayoutConfig[];
  historyIndex: number;

  updateLayout: (updates: Partial<CompactLayoutConfig>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  resetLayout: () => void;
}

const DEFAULT_LAYOUT_CONFIG: CompactLayoutConfig = {
  pageSize: 'A4',
  orientation: 'portrait',
  margins: { top: 15, right: 15, bottom: 15, left: 15 },
  contentDensity: 70,
  columnCount: 2,
  gutterWidth: 5,
  typography: { baseFontSize: 11, lineHeight: 1.5, headingScale: 1.5 },
  gridSystem: { enabled: false, rows: 3, cols: 2, cellGap: 5 },
};

export const useInfographicLayoutStore = create<InfographicLayoutState>((set, get) => ({
  layoutConfig: { ...DEFAULT_LAYOUT_CONFIG },
  history: [],
  historyIndex: -1,

  updateLayout: (updates) =>
    set((state) => {
      const newConfig = { ...state.layoutConfig, ...updates };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newConfig);
      const trimmedHistory = newHistory.slice(-20);

      return {
        layoutConfig: newConfig,
        history: trimmedHistory,
        historyIndex: Math.min(trimmedHistory.length - 1, 19),
      };
    }),

  undo: () =>
    set((state) => {
      if (state.historyIndex > 0) {
        return {
          historyIndex: state.historyIndex - 1,
          layoutConfig: state.history[state.historyIndex - 1],
        };
      }
      return state;
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        return {
          historyIndex: state.historyIndex + 1,
          layoutConfig: state.history[state.historyIndex + 1],
        };
      }
      return state;
    }),

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  resetLayout: () =>
    set({
      layoutConfig: { ...DEFAULT_LAYOUT_CONFIG },
      history: [],
      historyIndex: -1,
    }),
}));
