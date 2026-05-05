import { create } from 'zustand';
import type {
  ActivityStudioState,
  CompactA4Config,
  ContentBlock,
  ExportSettings,
  StudioGoalConfig,
  ThemeConfig,
  WizardStep,
  WizardStepId,
} from '@/types/activityStudio';

const initialSteps: WizardStep[] = [
  { id: 'goal', status: 'active' },
  { id: 'content', status: 'pending' },
  { id: 'customize', status: 'pending' },
  { id: 'preview', status: 'pending' },
  { id: 'approval', status: 'pending' },
];

const emptyGoal: StudioGoalConfig | null = null;

export const useActivityStudioStore = create<ActivityStudioState>()((set: any, get: any) => ({
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
  pedagogicalNote: null,
  themeConfig: null,
  compactA4Config: null,
  exportSettings: null,
  selectedLibraryItemId: undefined,
  enhancementTopic: undefined,
  setStep: (step: WizardStepId) => {
    const { steps } = get();
    const targetIndex = steps.findIndex((s: WizardStep) => s.id === step);
    set({
      currentStep: step,
      steps: steps.map((item: WizardStep, index: number) => {
        if (item.id === step) return { ...item, status: 'active' };
        if (index < targetIndex) return { ...item, status: 'completed' };
        return { ...item, status: 'pending' };
      }),
    });
  },
  updateGoal: (data: Partial<StudioGoalConfig>) =>
    set((state: ActivityStudioState) => ({
      wizardData: {
        ...state.wizardData,
        goal: {
          ...(state.wizardData.goal ?? {}),
          ...data,
        } as StudioGoalConfig,
      },
    })),
  setSelectedLibraryItem: (id: string, topic?: string) =>
    set({
      selectedLibraryItemId: id,
      enhancementTopic: topic,
    }),
  setContent: (blocks: ContentBlock[]) => set({ content: blocks }),
  setPedagogicalNote: (note: string | null) => set({ pedagogicalNote: note }),
  setThemeConfig: (config: Partial<ThemeConfig>) =>
    set((state: ActivityStudioState) => ({
      themeConfig: state.themeConfig
        ? { ...state.themeConfig, ...config }
        : (config as ThemeConfig),
    })),
  setCompactA4Config: (config: Partial<CompactA4Config>) =>
    set((state: ActivityStudioState) => ({
      compactA4Config: state.compactA4Config
        ? { ...state.compactA4Config, ...config }
        : (config as CompactA4Config),
    })),
  setExportSettings: (settings: Partial<ExportSettings>) =>
    set((state: ActivityStudioState) => ({
      exportSettings: state.exportSettings
        ? { ...state.exportSettings, ...settings }
        : (settings as ExportSettings),
    })),
  setGenerating: (value: boolean) => set({ isGenerating: value }),
  setError: (message: string | null) => set({ error: message }),
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
      pedagogicalNote: null,
      themeConfig: null,
      compactA4Config: null,
      exportSettings: null,
      selectedLibraryItemId: undefined,
      enhancementTopic: undefined,
    }),
}));
