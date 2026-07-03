import { create } from 'zustand';
import {
  GenerationMode,
  SuperStudioDifficulty,
  GeneratedContentPayload,
} from '../types/superStudio';

export interface GenerationParams {
  temperature: number;
  topP: number;
  thinkingBudget: number;
}

export type GenerationStep = 'idle' | 'prompt' | 'api' | 'processing' | 'saving' | 'done';
export type WizardStep = 'settings' | 'templates' | 'preview';

export interface GenerationHistoryEntry {
  id: string;
  templateId: string;
  prompt: string;
  temperature: number;
  topP: number;
  thinkingBudget: number;
  difficulty: SuperStudioDifficulty;
  grade: string | null;
  topic: string;
  qualityScore?: number;
  createdAt: number;
  output: GeneratedContentPayload;
}

interface SuperStudioState {
  // Main Settings
  studentId: string | null;
  grade: string | null;
  topic: string;
  difficulty: SuperStudioDifficulty;
  generationMode: GenerationMode;

  // Wizard
  wizardStep: WizardStep;

  // Generation Params (motor.md Phase 1.1)
  generationParams: GenerationParams;

  // Templates
  selectedTemplates: string[];
  templateSettings: Record<string, unknown>;

  // Output
  generatedContents: GeneratedContentPayload[];
  isGenerating: boolean;

  // Progress (motor.md Phase 1.3)
  generationProgress: number;
  generationStep: GenerationStep;
  currentTemplate: string;

  // History (motor.md Phase 3.1)
  generationHistory: GenerationHistoryEntry[];

  // Actions
  setStudentId: (id: string | null) => void;
  setGrade: (grade: string | null) => void;
  setTopic: (topic: string) => void;
  setDifficulty: (diff: SuperStudioDifficulty) => void;
  setGenerationMode: (mode: GenerationMode) => void;
  setWizardStep: (step: WizardStep) => void;
  goNextWizardStep: () => void;
  goPrevWizardStep: () => void;

  setGenerationParams: (params: Partial<GenerationParams>) => void;

  toggleTemplate: (templateId: string) => void;
  setTemplateSetting: (templateId: string, payload: unknown) => void;

  addGeneratedContent: (content: GeneratedContentPayload) => void;
  clearGeneratedContents: () => void;
  setIsGenerating: (isGenerating: boolean) => void;

  setGenerationProgress: (progress: number) => void;
  setGenerationStep: (step: GenerationStep) => void;
  setCurrentTemplate: (templateId: string) => void;

  addToHistory: (entry: GenerationHistoryEntry) => void;
  clearHistory: () => void;

  resetStore: () => void;
}

const initialState = {
  studentId: null,
  grade: null,
  topic: '',
  difficulty: 'Orta' as SuperStudioDifficulty,
  generationMode: 'ai' as GenerationMode,
  wizardStep: 'settings' as WizardStep,
  generationParams: {
    temperature: 0.7,
    topP: 0.9,
    thinkingBudget: 2048,
  } as GenerationParams,
  selectedTemplates: [],
  templateSettings: {},
  generatedContents: [],
  isGenerating: false,
  generationProgress: 0,
  generationStep: 'idle' as GenerationStep,
  currentTemplate: '',
  generationHistory: [] as GenerationHistoryEntry[],
};

import { SUPER_STUDIO_REGISTRY } from '../components/SuperStudio/templates/registry';

export const useSuperStudioStore = create<SuperStudioState>()((set, get) => ({
  ...initialState,

  setStudentId: (id: string | null) => set({ studentId: id }),
  setGrade: (grade: string | null) => set({ grade }),
  setTopic: (topic: string) => set({ topic }),
  setDifficulty: (diff: SuperStudioDifficulty) => set({ difficulty: diff }),
  setGenerationMode: (mode: GenerationMode) => set({ generationMode: mode }),
  setWizardStep: (step: WizardStep) => set({ wizardStep: step }),

  goNextWizardStep: () =>
    set((state) => {
      const steps: WizardStep[] = ['settings', 'templates', 'preview'];
      const idx = steps.indexOf(state.wizardStep);
      if (idx < steps.length - 1) return { wizardStep: steps[idx + 1] };
      return {};
    }),

  goPrevWizardStep: () =>
    set((state) => {
      const steps: WizardStep[] = ['settings', 'templates', 'preview'];
      const idx = steps.indexOf(state.wizardStep);
      if (idx > 0) return { wizardStep: steps[idx - 1] };
      return {};
    }),

  setGenerationParams: (params: Partial<GenerationParams>) =>
    set((state) => ({
      generationParams: { ...state.generationParams, ...params },
    })),

  toggleTemplate: (templateId: string) =>
    set((state) => {
      const isSelected = state.selectedTemplates.includes(templateId);
      if (isSelected) {
        const newSettings = { ...state.templateSettings };
        delete newSettings[templateId];
        return {
          selectedTemplates: state.selectedTemplates.filter((id) => id !== templateId),
          templateSettings: newSettings,
        };
      } else {
        const templateDef = SUPER_STUDIO_REGISTRY.find((t) => t.id === templateId);
        return {
          selectedTemplates: [...state.selectedTemplates, templateId],
          templateSettings: {
            ...state.templateSettings,
            [templateId]: templateDef ? { ...templateDef.defaultSettings } : {},
          },
        };
      }
    }),

  setTemplateSetting: (templateId: string, payload: unknown) =>
    set((state) => ({
      templateSettings: {
        ...state.templateSettings,
        [templateId]: {
          ...(state.templateSettings[templateId] as Record<string, unknown> || {}),
          ...(payload as Record<string, unknown>),
        },
      },
    })),

  addGeneratedContent: (content: GeneratedContentPayload) =>
    set((state) => ({
      generatedContents: [...state.generatedContents, content],
    })),

  clearGeneratedContents: () => set({ generatedContents: [] }),

  setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),

  setGenerationProgress: (progress: number) => set({ generationProgress: progress }),
  setGenerationStep: (step: GenerationStep) => set({ generationStep: step }),
  setCurrentTemplate: (templateId: string) => set({ currentTemplate: templateId }),

  addToHistory: (entry: GenerationHistoryEntry) =>
    set((state) => ({
      generationHistory: [entry, ...state.generationHistory].slice(0, 100),
    })),

  clearHistory: () => set({ generationHistory: [] }),

  resetStore: () => set(initialState),
}));
