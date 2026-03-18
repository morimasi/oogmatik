import { create } from 'zustand';
import { SuperTurkceModuleSettings, GradeLevel, BloomLevel } from '../types/superTurkceModules';
import { getFastModeModules } from '../services/superTurkceAiService';

interface SuperTurkceV2State {
  gradeLevel: GradeLevel;
  unit: string;
  bloomLevel: BloomLevel;
  studentProfile: string;

  modules: SuperTurkceModuleSettings[];
  activeModuleId: string | null;

  generatedData: Record<string, any> | null;
  isGenerating: boolean;
  error: string | null;

  setScope: (
    scope: Partial<
      Pick<SuperTurkceV2State, 'gradeLevel' | 'unit' | 'bloomLevel' | 'studentProfile'>
    >
  ) => void;
  addModule: (type: SuperTurkceModuleSettings['type']) => void;
  removeModule: (id: string) => void;
  updateModuleSettings: (id: string, settings: Partial<SuperTurkceModuleSettings>) => void;
  reorderModules: (startIndex: number, endIndex: number) => void;
  setActiveModule: (id: string | null) => void;

  applyFastMode: () => void;

  setGenerating: (isGenerating: boolean) => void;
  setGeneratedData: (data: Record<string, any>) => void;
  setError: (error: string | null) => void;
  resetStudio: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const getDefaultSettings = (
  type: SuperTurkceModuleSettings['type'],
  id: string
): SuperTurkceModuleSettings => {
  switch (type) {
    case 'st_fluency_pyramid':
      return { id, type, linesCount: 4 };
    case 'st_scaffolded_reading':
      return { id, type, maxWords: 60, syllableColoring: true, focusBar: true };
    case 'st_semantic_mapping':
      return {
        id,
        type,
        askWho: true,
        askWhat: true,
        askWhere: true,
        askWhen: false,
        askHow: false,
        askWhy: true,
      };
    case 'st_guided_cloze':
      return { id, type, distractorCount: 1 };
    case 'st_dual_coding_match':
      return { id, type, matchType: 'synonym', pairCount: 3 };
    case 'st_story_sequencing':
      return { id, type, stepCount: 4 };
    case 'st_cause_effect_analysis':
      return { id, type, difficulty: 'direct' };
    case 'st_radar_true_false':
      return { id, type, statementCount: 4, forbidNegativePhrasing: true };
    case 'st_spot_highlight':
      return { id, type, targetType: 'word', targetCount: 5 };
    case 'st_scaffolded_open':
      return { id, type, includeStarter: true };
  }
};

export const useSuperTurkceV2Store = create<SuperTurkceV2State>((set, get) => ({
  gradeLevel: '3',
  unit: 'Okuma Anlama',
  bloomLevel: 'understand',
  studentProfile: 'dyslexia_mild',

  modules: [],
  activeModuleId: null,

  generatedData: null,
  isGenerating: false,
  error: null,

  setScope: (scope) => set((state) => ({ ...state, ...scope })),

  addModule: (type) =>
    set((state) => {
      const id = `${type}_${generateId()}`;
      return {
        modules: [...state.modules, getDefaultSettings(type, id)],
        activeModuleId: id,
      };
    }),

  removeModule: (id) =>
    set((state) => ({
      modules: state.modules.filter((m) => m.id !== id),
      activeModuleId: state.activeModuleId === id ? null : state.activeModuleId,
      generatedData: state.generatedData
        ? Object.fromEntries(Object.entries(state.generatedData).filter(([key]) => key !== id))
        : null,
    })),

  updateModuleSettings: (id, settings) =>
    set((state) => ({
      modules: state.modules.map((m) =>
        m.id === id ? ({ ...m, ...settings } as SuperTurkceModuleSettings) : m
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

  applyFastMode: () => {
    const { gradeLevel } = get();
    const fastModules = getFastModeModules(gradeLevel);
    set({ modules: fastModules, activeModuleId: null, generatedData: null, error: null });
  },

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
