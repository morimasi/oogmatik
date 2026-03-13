import { create } from 'zustand';
import { ActivityType, WorksheetData, ActiveCurriculumSession } from '../types';

export type View = 'generator' | 'favorites' | 'history' | 'archive';

export interface WorksheetStoreState {
    currentView: View;
    viewHistory: View[];
    selectedActivity: ActivityType | null;
    worksheetData: WorksheetData | null;
    activeCurriculumSession: ActiveCurriculumSession | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setCurrentView: (view: View) => void;
    addHistoryView: (view: View) => void;
    popHistoryView: () => View | undefined;
    setSelectedActivity: (activity: ActivityType | null) => void;
    setWorksheetData: (data: WorksheetData | null) => void;
    setActiveCurriculumSession: (session: ActiveCurriculumSession | null) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    resetGeneratorContext: () => void;
}

export const useWorksheetStore = create<WorksheetStoreState>((set, get) => ({
    currentView: 'generator',
    viewHistory: [],
    selectedActivity: null,
    worksheetData: null,
    activeCurriculumSession: null,
    isLoading: false,
    error: null,

    setCurrentView: (view) => set({ currentView: view }),
    addHistoryView: (view) => set((state) => ({ viewHistory: [...state.viewHistory, view] })),
    popHistoryView: () => {
        const state = get();
        if (state.viewHistory.length === 0) return undefined;
        const newHistory = [...state.viewHistory];
        const lastView = newHistory.pop();
        set({ viewHistory: newHistory });
        return lastView;
    },
    setSelectedActivity: (activity) => set({ selectedActivity: activity }),
    setWorksheetData: (data) => set({ worksheetData: data }),
    setActiveCurriculumSession: (session) => set({ activeCurriculumSession: session }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    resetGeneratorContext: () => set({
        selectedActivity: null,
        worksheetData: null,
        activeCurriculumSession: null
    })
}));
