import { create } from 'zustand';
import { ActivityType, WorksheetData, ActiveCurriculumSession, View } from '../types';

export interface WorksheetStoreState {
    currentView: View;
    viewHistory: View[];
    selectedActivity: ActivityType | null;
    worksheetData: WorksheetData | null;
    activeCurriculumSession: ActiveCurriculumSession | null;
    activeWorksheetId: string | null;
    activeWorksheetTitle: string;
    isLoading: boolean;
    error: string | null;

    // Actions
    setCurrentView: (view: View) => void;
    addHistoryView: (view: View) => void;
    popHistoryView: () => View | undefined;
    setSelectedActivity: (activity: ActivityType | null) => void;
    setWorksheetData: (data: WorksheetData | null) => void;
    setActiveCurriculumSession: (session: ActiveCurriculumSession | null) => void;
    setActiveWorksheet: (id: string | null, title?: string) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    resetGeneratorContext: () => void;
}

export const useWorksheetStore = create<WorksheetStoreState>()((set: any, get: any) => ({
    currentView: 'generator',
    viewHistory: [],
    selectedActivity: null,
    worksheetData: null,
    activeCurriculumSession: null,
    activeWorksheetId: null,
    activeWorksheetTitle: '',
    isLoading: false,
    error: null,

    setCurrentView: (view: View) => set({ currentView: view }),
    addHistoryView: (view: View) => set((state: WorksheetStoreState) => ({ viewHistory: [...state.viewHistory, view] })),
    popHistoryView: () => {
        const state = get();
        if (state.viewHistory.length === 0) return undefined;
        const newHistory = [...state.viewHistory];
        const lastView = newHistory.pop();
        set({ viewHistory: newHistory });
        return lastView;
    },
    setSelectedActivity: (activity: ActivityType | null) => set({ selectedActivity: activity }),
    setWorksheetData: (data: WorksheetData | null) => set({ worksheetData: data }),
    setActiveCurriculumSession: (session: ActiveCurriculumSession | null) => set({ activeCurriculumSession: session }),
    setActiveWorksheet: (id: string | null, title?: string) => set({
        activeWorksheetId: id,
        activeWorksheetTitle: title || ''
    }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (error: string | null) => set({ error }),
    resetGeneratorContext: () => set({
        selectedActivity: null,
        worksheetData: null,
        activeCurriculumSession: null,
        activeWorksheetId: null,
        activeWorksheetTitle: ''
    })
}));
