import { create } from 'zustand';
import {
  PremiumModuleSettings,
  PremiumActivityData,
  GradeLevel,
  BloomLevel,
} from '../types/premiumModules';

interface PremiumStudioState {
  // Phase 1: Target & Scope
  gradeLevel: GradeLevel;
  subject: string;
  topic: string;
  bloomLevel: BloomLevel;
  studentProfile: string; // e.g., 'dyslexia_mild', 'adhd', 'standard'

  // Phase 2: Canvas Modules
  modules: PremiumModuleSettings[];
  activeModuleId: string | null; // For settings popover

  // Phase 3: AI Data
  generatedData: Record<string, any> | null;
  isGenerating: boolean;
  error: string | null;

  // Actions
  setTargetScope: (
    scope: Partial<
      Pick<PremiumStudioState, 'gradeLevel' | 'subject' | 'topic' | 'bloomLevel' | 'studentProfile'>
    >
  ) => void;
  addModule: (type: PremiumModuleSettings['type']) => void;
  removeModule: (id: string) => void;
  updateModuleSettings: (id: string, settings: Partial<PremiumModuleSettings>) => void;
  reorderModules: (startIndex: number, endIndex: number) => void;
  setActiveModule: (id: string | null) => void;

  setGenerating: (isGenerating: boolean) => void;
  setGeneratedData: (data: Record<string, any>) => void;
  setError: (error: string | null) => void;
  resetStudio: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const getDefaultSettings = (
  type: PremiumModuleSettings['type'],
  id: string
): PremiumModuleSettings => {
  switch (type) {
    case 'scaffolded_reading':
      return { id, type, maxWords: 60, syllableColoring: true, highlightKeywords: true };
    case 'concept_matching':
      return { id, type, pairCount: 3, hasDistractors: false };
    case 'guided_cloze':
      return { id, type, showWordPool: true, useElkoninBoxes: true };
    case 'true_false_logic':
      return { id, type, questionCount: 3, allowNegativePhrasing: false };
    case 'step_sequencing':
      return { id, type, stepCount: 4, useVisuals: true };
    case 'scaffolded_open_ended':
      return { id, type, provideSentenceStarter: true, lineCount: 3 };
    case 'visual_multiple_choice':
      return { id, type, optionCount: 3, layoutDirection: 'vertical' };
    case 'spot_and_highlight':
      return { id, type, targetType: 'letter', targetCount: 5 };
    case 'mini_mind_map':
      return { id, type, branchCount: 3, partialFill: true };
    case 'exit_ticket':
      return { id, type, showEmojisOnly: false, includeReflectionQuestion: true };
  }
};

export const usePremiumStudioStore = create<PremiumStudioState>((set) => ({
  gradeLevel: '3',
  subject: 'Türkçe',
  topic: 'Okuma Anlama',
  bloomLevel: 'understand',
  studentProfile: 'dyslexia_mild',

  modules: [],
  activeModuleId: null,

  generatedData: null,
  isGenerating: false,
  error: null,

  setTargetScope: (scope) => set((state) => ({ ...state, ...scope })),

  addModule: (type) =>
    set((state) => {
      const id = `${type}_${generateId()}`;
      return {
        modules: [...state.modules, getDefaultSettings(type, id)],
        activeModuleId: id, // Automatically open settings for the new module
      };
    }),

  removeModule: (id) =>
    set((state) => ({
      modules: state.modules.filter((m) => m.id !== id),
      activeModuleId: state.activeModuleId === id ? null : state.activeModuleId,
      // Also remove generated data for this module if it exists
      generatedData: state.generatedData
        ? Object.fromEntries(Object.entries(state.generatedData).filter(([key]) => key !== id))
        : null,
    })),

  updateModuleSettings: (id, settings) =>
    set((state) => ({
      modules: state.modules.map((m) =>
        m.id === id ? ({ ...m, ...settings } as PremiumModuleSettings) : m
      ),
    })),

  reorderModules: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.modules);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { modules: result };
    }),

  setActiveModule: (id) => set({ activeModuleId: id }),

  setGenerating: (isGenerating) => set({ isGenerating }),
  setGeneratedData: (data) => set({ generatedData: data, error: null }),
  setError: (error) => set({ error, isGenerating: false }),

  resetStudio: () =>
    set({
      modules: [],
      activeModuleId: null,
      generatedData: null,
      error: null,
      isGenerating: false,
    }),
}));
