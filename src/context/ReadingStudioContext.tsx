import { AppError } from '../utils/AppError';
import React, { createContext, useContext, useMemo } from 'react';
import { InteractiveStoryData, ReadingStudioConfig, LayoutItem, Student } from '../types';
import { useReadingStore } from '../store/useReadingStore';

interface ReadingStudioContextType {
    config: ReadingStudioConfig;
    setConfig: (config: ReadingStudioConfig) => void;
    storyData: InteractiveStoryData | null;
    setStoryData: (data: InteractiveStoryData | null) => void;
    layout: LayoutItem[];
    setLayout: (layout: LayoutItem[] | ((prev: LayoutItem[]) => LayoutItem[])) => void;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    designMode: boolean;
    setDesignMode: (mode: boolean) => void;
    activeStudent: Student | null;
    setActiveStudent: (student: Student | null) => void;
    isLoading: boolean;
    setIsLoading: (val: boolean) => void;
    updateComponent: (instanceId: string, updates: Partial<LayoutItem>, saveToHistory?: boolean) => void;
    addComponent: (def: any) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const ReadingStudioContext = createContext<ReadingStudioContextType | undefined>(undefined);

export function ReadingStudioProvider({ children }: { children: any }) {
    const store = useReadingStore();

    const value = useMemo(() => ({
        ...store,
        canUndo: store.canUndo(),
        canRedo: store.canRedo()
    }), [store]);

    return <ReadingStudioContext.Provider value={value as any}>{children}</ReadingStudioContext.Provider>;
}

export const useReadingStudio = () => {
    const context = useContext(ReadingStudioContext);
    if (!context) throw new AppError('useReadingStudio must be used within a ReadingStudioProvider', 'INTERNAL_ERROR', 500);
    return context;
};
