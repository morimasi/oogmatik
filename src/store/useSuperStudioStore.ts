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
  difficulty: 'Orta' as SuperStudioDifficulty,
  generationMode: 'ai' as GenerationMode,
  selectedTemplates: [],
  templateSettings: {},
  generatedContents: [],
  isGenerating: false,
};

import { SUPER_STUDIO_REGISTRY } from '../components/SuperStudio/templates/registry';

export const useSuperStudioStore = create<SuperStudioState>((set) => ({
  ...initialState,

  setStudentId: (id) => set({ studentId: id }),
  setGrade: (grade) => set({ grade }),
  setDifficulty: (diff) => set({ difficulty: diff }),
  setGenerationMode: (mode) => set({ generationMode: mode }),

  toggleTemplate: (templateId) =>
    set((state) => {
      const isSelected = state.selectedTemplates.includes(templateId);
      if (isSelected) {
        // Remove template
        const newSettings = { ...state.templateSettings };
        delete newSettings[templateId];
        return {
          selectedTemplates: state.selectedTemplates.filter((id) => id !== templateId),
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

  setTemplateSetting: (templateId, payload) =>
    set((state) => ({
      templateSettings: {
        ...state.templateSettings,
        [templateId]: {
          ...state.templateSettings[templateId],
          ...payload,
        },
      },
    })),

  addGeneratedContent: (content) =>
    set((state) => ({
      generatedContents: [...state.generatedContents, content],
    })),

  clearGeneratedContents: () => set({ generatedContents: [] }),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  resetStore: () => set(initialState),
}));
