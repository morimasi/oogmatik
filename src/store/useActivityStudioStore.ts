import { create } from 'zustand';
import type {
  ActivityStudioState,
  CompactA4Config,
  ExportSettings,
  StudioGoalConfig,
  ThemeConfig,
  WizardStep,
} from '@/types/activityStudio';

const initialSteps: WizardStep[] = [
  { id: 'goal', status: 'active' },
  { id: 'content', status: 'pending' },
  { id: 'customize', status: 'pending' },
  { id: 'preview', status: 'pending' },
  { id: 'approval', status: 'pending' },
];

const emptyGoal: StudioGoalConfig | null = null;

export const useActivityStudioStore = create<ActivityStudioState>()((set) => ({
  currentStep: 'goal',
  steps: initialSteps,
  isGenerating: false,
  error: null,
  wizardData: {
    goal: emptyGoal,
    promptInput: null,
    generatedContent: null,
    customization: null,
    preview: null,
    approval: null,
  },
  content: null,
  themeConfig: null,
  compactA4Config: null,
  exportSettings: null,
  pedagogicalNote: '',
  selectedLibraryItemId: undefined,
  enhancementTopic: undefined,
  setStep: (step) =>
    set((state) => ({
      currentStep: step,
      steps: state.steps.map((item) => {
        if (item.id === step) return { ...item, status: 'active' };
        if (state.steps.findIndex((s) => s.id === item.id) < state.steps.findIndex((s) => s.id === step)) {
          return { ...item, status: 'completed' };
        }
        return { ...item, status: 'pending' };
      }),
    })),
  updateGoal: (data) =>
    set((state) => ({
      wizardData: {
        ...state.wizardData,
        goal: {
          ...(state.wizardData.goal ?? {}),
          ...data,
        } as StudioGoalConfig,
      },
    })),
  setSelectedLibraryItem: (id, topic) =>
    set({
      selectedLibraryItemId: id,
      enhancementTopic: topic,
    }),
  setContent: (blocks) => set({ content: blocks }),
  setThemeConfig: (config) =>
    set((state) => ({
      themeConfig: state.themeConfig
        ? { ...state.themeConfig, ...config }
        : (config as ThemeConfig),
    })),
  setCompactA4Config: (config) =>
    set((state) => ({
      compactA4Config: state.compactA4Config
        ? { ...state.compactA4Config, ...config }
        : (config as CompactA4Config),
    })),
  setExportSettings: (settings) =>
    set((state) => ({
      exportSettings: state.exportSettings
        ? { ...state.exportSettings, ...settings }
        : (settings as ExportSettings),
    })),
  setPedagogicalNote: (note) => set({ pedagogicalNote: note }),
  setGenerating: (value) => set({ isGenerating: value }),
  setError: (message) => set({ error: message }),
  resetStudio: () =>
    set({
      currentStep: 'goal',
      steps: initialSteps,
      isGenerating: false,
      error: null,
      wizardData: {
        goal: emptyGoal,
        promptInput: null,
        generatedContent: null,
        customization: null,
        preview: null,
        approval: null,
      },
      content: null,
      themeConfig: null,
      compactA4Config: null,
      exportSettings: null,
      pedagogicalNote: '',
      selectedLibraryItemId: undefined,
      enhancementTopic: undefined,
    }),
}));
