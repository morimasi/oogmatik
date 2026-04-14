import { create } from 'zustand';
import { ActivityType, SingleWorksheetData } from '../types';

/**
 * OOGMATIK — useSariKitapStore
 * 
 * Sarı Kitap Etkinlik Stüdyosu için merkezi state yönetimi.
 */

interface SariKitapParams {
  topic: string;
  ageGroup: string;
  difficulty: 'Başlangıç' | 'Orta' | 'İleri' | 'Uzman';
  profile: string;
  duration: number;
}

interface SariKitapState {
  selectedActivity: ActivityType | null;
  mode: 'AI' | 'QUICK';
  params: SariKitapParams;
  result: SingleWorksheetData | null;
  isGenerating: boolean;
  error: string | null;

  // Actions
  setSelectedActivity: (activity: ActivityType | null) => void;
  setMode: (mode: 'AI' | 'QUICK') => void;
  setParams: (params: Partial<SariKitapParams>) => void;
  setResult: (result: SingleWorksheetData | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSariKitapStore = create<SariKitapState>((set) => ({
  selectedActivity: null,
  mode: 'AI',
  params: {
    topic: '',
    ageGroup: '8-10',
    difficulty: 'Orta',
    profile: 'mixed',
    duration: 15,
  },
  result: null,
  isGenerating: false,
  error: null,

  setSelectedActivity: (activity: ActivityType | null) => set({ selectedActivity: activity }),
  setMode: (mode: 'AI' | 'QUICK') => set({ mode }),
  setParams: (newParams: Partial<SariKitapParams>) => set((state: SariKitapState) => ({ params: { ...state.params, ...newParams } })),
  setResult: (result: SingleWorksheetData | null) => set({ result }),
  setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),
  setError: (error: string | null) => set({ error }),
  reset: () => set({
    selectedActivity: null,
    mode: 'AI',
    params: {
      topic: '',
      ageGroup: '8-10',
      difficulty: 'Orta',
      profile: 'mixed',
      duration: 15,
    },
    result: null,
    isGenerating: false,
    error: null,
  }),
}));
