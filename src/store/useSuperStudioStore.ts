import { create } from 'zustand';
import {
  GenerationMode,
  SuperStudioDifficulty,
  GeneratedContentPayload,
} from '../types/superStudio';

interface SuperStudioState {
  // Main Settings
  studentId: string | null;
  grade: string | null;
  topic: string;
  difficulty: SuperStudioDifficulty;
  generationMode: GenerationMode;

  // Templates
  selectedTemplates: string[];
  templateSettings: Record<string, unknown>;

  // Output
  generatedContents: GeneratedContentPayload[];
  isGenerating: boolean;

  // Actions
  setStudentId: (id: string | null) => void;
  setGrade: (grade: string | null) => void;
  setTopic: (topic: string) => void;
  setDifficulty: (diff: SuperStudioDifficulty) => void;
  setGenerationMode: (mode: GenerationMode) => void;

  toggleTemplate: (templateId: string) => void;
  setTemplateSetting: (templateId: string, payload: unknown) => void;

  addGeneratedContent: (content: GeneratedContentPayload) => void;
  clearGeneratedContents: () => void;
  setIsGenerating: (isGenerating: boolean) => void;

  resetStore: () => void;
}

const initialState = {
  studentId: null,
  grade: null,
  topic: '',
  difficulty: 'Orta' as SuperStudioDifficulty,
  generationMode: 'ai' as GenerationMode,
  selectedTemplates: [],
  templateSettings: {},
  generatedContents: [],
  isGenerating: false,
};

import { SUPER_STUDIO_REGISTRY } from '../components/SuperStudio/templates/registry';

export const useSuperStudioStore = create<SuperStudioState>()((set) => ({
  ...initialState,

  setStudentId: (id: string | null) => set({ studentId: id }),
  setGrade: (grade: string | null) => set({ grade }),
  setTopic: (topic: string) => set({ topic }),
  setDifficulty: (diff: SuperStudioDifficulty) => set({ difficulty: diff }),
  setGenerationMode: (mode: GenerationMode) => set({ generationMode: mode }),

  toggleTemplate: (templateId: string) =>
    set((state: SuperStudioState) => {
      const isSelected = state.selectedTemplates.includes(templateId);
      if (isSelected) {
        // Remove template
        const newSettings = { ...state.templateSettings };
        delete newSettings[templateId];
        return {
          selectedTemplates: state.selectedTemplates.filter((id: string) => id !== templateId),
          templateSettings: newSettings,
        };
      } else {
        // Add template with defaults from registry
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
    set((state: SuperStudioState) => ({
      templateSettings: {
        ...state.templateSettings,
        [templateId]: {
          ...(state.templateSettings[templateId] as Record<string, unknown> || {}),
          ...(payload as Record<string, unknown>),
        },
      },
    })),

  addGeneratedContent: (content: GeneratedContentPayload) =>
    set((state: SuperStudioState) => ({
      generatedContents: [...state.generatedContents, content],
    })),

  clearGeneratedContents: () => set({ generatedContents: [] }),

  setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),

  resetStore: () => set(initialState),
}));
