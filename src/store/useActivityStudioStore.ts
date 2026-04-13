import { create } from 'zustand';
import type { ActivityStudioState, StudioGoalConfig, WizardStep } from '@/types/activityStudio';

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
    }),
}));
