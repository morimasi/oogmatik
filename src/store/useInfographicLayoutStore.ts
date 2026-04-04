/**
 * @file src/store/useInfographicLayoutStore.ts
 * @description İnfografik Stüdyosu v3 — Layout State Management
 * Sprint 2-3: Premium Edit Toolbar + Layout State
 *
 * ZUSTAND STORE: Undo/Redo destekli layout configuration
 * MAX HISTORY: 20 (memory optimization)
 */

import { create } from 'zustand';
import { CompactLayoutConfig, DEFAULT_LAYOUT_CONFIG } from '../services/layout/CompactLayoutEngine';

export interface InfographicLayoutState {
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

export const useInfographicLayoutStore = create<InfographicLayoutState>((set, get) => ({
  layoutConfig: DEFAULT_LAYOUT_CONFIG,
  history: [DEFAULT_LAYOUT_CONFIG],
  historyIndex: 0,

  updateLayout: (updates) => set((state) => {
    const newConfig = { ...state.layoutConfig, ...updates };
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newConfig);

    return {
      layoutConfig: newConfig,
      history: newHistory.slice(-20), // Max 20 history
      historyIndex: Math.min(newHistory.length - 1, 19)
    };
  }),

  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      return {
        historyIndex: state.historyIndex - 1,
        layoutConfig: state.history[state.historyIndex - 1]
      };
    }
    return state;
  }),

  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      return {
        historyIndex: state.historyIndex + 1,
        layoutConfig: state.history[state.historyIndex + 1]
      };
    }
    return state;
  }),

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  resetLayout: () => set({
    layoutConfig: DEFAULT_LAYOUT_CONFIG,
    history: [DEFAULT_LAYOUT_CONFIG],
    historyIndex: 0
  })
}));
