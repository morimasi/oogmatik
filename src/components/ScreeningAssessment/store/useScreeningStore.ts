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
  selectedScreeningType: 'cognitive',
  selectedStudentName: '',
  isAdvancedScreeningOpen: false,
  isSaving: false,
  isLoading: false,
};

export const useScreeningStore = create<ScreeningStore>((set) => ({
  ...initialState,

  setActiveView: (view: ScreeningView) => set({ activeView: view }),
  setScreeningData: (data: ScreeningResult[]) => set({ screeningData: data }),
  setCurrentScreening: (screening: ScreeningResult | null) => set({ currentScreening: screening }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setFilterStatus: (status: ScreeningFilterStatus) => set({ filterStatus: status }),
  setSelectedScreeningType: (type: ScreeningType) => set({ selectedScreeningType: type }),
  setSelectedStudentName: (name: string) => set({ selectedStudentName: name }),
  setSelectedStudents: (students: string[]) => set({ selectedStudents: students }),
  setIsSaving: (saving: boolean) => set({ isSaving: saving }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setIsAdvancedScreeningOpen: (open: boolean) => set({ isAdvancedScreeningOpen: open }),

  archiveScreening: (id: string) =>
    set((state) => ({
      screeningData: state.screeningData.map((item) =>
        item.id === id ? { ...item, status: 'archived' as const } : item
      ),
    })),

  deleteScreening: (id: string) =>
    set((state) => ({
      screeningData: state.screeningData.filter((item) => item.id !== id),
    })),

  resetScreening: () => set(initialState),
}));
