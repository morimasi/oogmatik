import { create } from 'zustand';
import type { ScreeningResult } from '../../../types/screening';
import type { ScreeningState, ScreeningActions, ScreeningView, ScreeningFilterStatus, ScreeningType } from '../types';

type ScreeningStore = ScreeningState & ScreeningActions;

const initialState: ScreeningState = {
  activeView: 'dashboard',
  screeningData: [],
  currentScreening: null,
  selectedStudents: [],
  searchQuery: '',
  filterStatus: 'all',
  filterRiskLevel: 'all',
  sortBy: 'newest',
  selectedScreeningType: 'cognitive',
  selectedStudentName: '',
  selectedStudentId: null,
  selectedStudentAge: 7,
  selectedStudentGrade: '1. Sınıf',
  selectedStudentConcerns: [],
  selectedStudentStrengths: [],
  selectedStudentDiagnosis: [],
  isAdvancedScreeningOpen: false,
  isSaving: false,
  isLoading: false,
};

export const useScreeningStore = create<ScreeningStore>((set: (partial: Partial<ScreeningStore> | ((state: ScreeningStore) => Partial<ScreeningStore>)) => void) => ({
  ...initialState,

  setActiveView: (view: ScreeningView) => set({ activeView: view }),
  setScreeningData: (data: ScreeningResult[]) => set({ screeningData: data }),
  setCurrentScreening: (screening: ScreeningResult | null) => set({ currentScreening: screening }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setFilterStatus: (status: ScreeningFilterStatus) => set({ filterStatus: status }),
  setFilterRiskLevel: (level) => set({ filterRiskLevel: level }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSelectedScreeningType: (type: ScreeningType) => set({ selectedScreeningType: type }),
  setSelectedStudentName: (name: string) => set({ selectedStudentName: name }),
  setSelectedStudentId: (id: string | null) => set({ selectedStudentId: id }),
  setSelectedStudentAge: (age: number) => set({ selectedStudentAge: age }),
  setSelectedStudentGrade: (grade: string) => set({ selectedStudentGrade: grade }),
  setSelectedStudentConcerns: (concerns: string[]) => set({ selectedStudentConcerns: concerns }),
  setSelectedStudentStrengths: (strengths: string[]) => set({ selectedStudentStrengths: strengths }),
  setSelectedStudentDiagnosis: (diagnosis: string[]) => set({ selectedStudentDiagnosis: diagnosis }),
  setSelectedStudents: (students: string[]) => set({ selectedStudents: students }),
  setIsSaving: (saving: boolean) => set({ isSaving: saving }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setIsAdvancedScreeningOpen: (open: boolean) => set({ isAdvancedScreeningOpen: open }),

  archiveScreening: (id: string) =>
    set((state: ScreeningStore) => ({
      screeningData: state.screeningData.map((item: ScreeningResult) =>
        item.id === id ? { ...item, status: 'archived' as const } : item
      ),
    })),

  deleteScreening: (id: string) =>
    set((state: ScreeningStore) => ({
      screeningData: state.screeningData.filter((item: ScreeningResult) => item.id !== id),
    })),

  resetScreening: () => set(initialState),
}));
