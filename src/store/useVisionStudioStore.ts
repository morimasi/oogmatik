// ============================================================
// VisionStudio — Zustand Store
// ============================================================
import { create } from 'zustand';
import type {
  VisionStudioState,
  UploadedFile,
  AIAnalysisResult,
  GeneratedActivity,
} from '../types/visionStudio';

interface VisionStudioActions {
  setStep: (step: VisionStudioState['step']) => void;
  setUploadedFile: (file: UploadedFile | null) => void;
  setAnalysisResult: (result: AIAnalysisResult | null) => void;
  setGeneratedActivities: (activities: GeneratedActivity[]) => void;
  updateActivity: (id: string, patch: Partial<GeneratedActivity>) => void;
  selectActivity: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: VisionStudioState = {
  step: 'upload',
  uploadedFile: null,
  analysisResult: null,
  generatedActivities: [],
  selectedActivityId: null,
  isLoading: false,
  error: null,
};

export const useVisionStudioStore = create<VisionStudioState & VisionStudioActions>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setUploadedFile: (file) => set({ uploadedFile: file }),

  setAnalysisResult: (result) => set({ analysisResult: result }),

  setGeneratedActivities: (activities) =>
    set({
      generatedActivities: activities,
      selectedActivityId: activities[0]?.id ?? null,
    }),

  updateActivity: (id, patch) =>
    set((state) => ({
      generatedActivities: state.generatedActivities.map((a) =>
        a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a
      ),
    })),

  selectActivity: (id) => set({ selectedActivityId: id }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
