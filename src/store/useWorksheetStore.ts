import { create } from 'zustand';
import { ActivityType, WorksheetData, ActiveCurriculumSession, View } from '../types';

export interface WorksheetStoreState {
  currentView: View;
  viewHistory: View[];
  forwardHistory: View[];
  selectedActivity: ActivityType | null;
  worksheetData: WorksheetData | null;
  activeCurriculumSession: ActiveCurriculumSession | null;
  activeWorksheetId: string | null;
  activeWorksheetTitle: string;
  isLoading: boolean;
  error: string | null;
  studioData: any | null;

  // Actions
  setCurrentView: (view: View) => void;
  addHistoryView: (view: View, clearForward?: boolean) => void;
  popHistoryView: () => View | undefined;
  addForwardView: (view: View) => void;
  popForwardView: () => View | undefined;
  clearForwardHistory: () => void;
  setSelectedActivity: (activity: ActivityType | null) => void;
  setWorksheetData: (data: WorksheetData | null) => void;
  setStudioData: (data: any | null) => void;
  setActiveCurriculumSession: (session: ActiveCurriculumSession | null) => void;
  setActiveWorksheet: (id: string | null, title?: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetGeneratorContext: () => void;
}

export const useWorksheetStore = create<WorksheetStoreState>((set: any, get: any) => ({
  currentView: 'generator',
  viewHistory: [],
  forwardHistory: [],
  selectedActivity: null,
  worksheetData: null,
  studioData: null,
  activeCurriculumSession: null,
  activeWorksheetId: null,
  activeWorksheetTitle: '',
  isLoading: false,
  error: null,

  setCurrentView: (view: View) => set({ currentView: view }),
  addHistoryView: (view: View, clearForward = true) =>
    set((state: WorksheetStoreState) => {
      const updated = [...state.viewHistory, view];
      const capped = updated.length > 5 ? updated.slice(updated.length - 5) : updated;
      return clearForward
        ? { viewHistory: capped, forwardHistory: [] }
        : { viewHistory: capped };
    }),
  popHistoryView: () => {
    const state = get();
    if (state.viewHistory.length === 0) return undefined;
    const newHistory = [...state.viewHistory];
    const lastView = newHistory.pop();
    set({ viewHistory: newHistory });
    return lastView;
  },
  addForwardView: (view: View) =>
    set((state: WorksheetStoreState) => {
      const updated = [...state.forwardHistory, view];
      const capped = updated.length > 5 ? updated.slice(updated.length - 5) : updated;
      return { forwardHistory: capped };
    }),
  popForwardView: () => {
    const state = get();
    if (state.forwardHistory.length === 0) return undefined;
    const newForward = [...state.forwardHistory];
    const nextView = newForward.pop();
    set({ forwardHistory: newForward });
    return nextView;
  },
  clearForwardHistory: () => set({ forwardHistory: [] }),
  setSelectedActivity: (activity: ActivityType | null) => set({ selectedActivity: activity }),
  setWorksheetData: (data: WorksheetData | null) => set({ worksheetData: data }),
  setStudioData: (data: any | null) => set({ studioData: data }),
  setActiveCurriculumSession: (session: ActiveCurriculumSession | null) =>
    set({ activeCurriculumSession: session }),
  setActiveWorksheet: (id: string | null, title?: string) =>
    set({
      activeWorksheetId: id,
      activeWorksheetTitle: title || '',
    }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  resetGeneratorContext: () =>
    set({
      selectedActivity: null,
      worksheetData: null,
      activeCurriculumSession: null,
      activeWorksheetId: null,
      activeWorksheetTitle: '',
    }),
}));
