import { AppError } from '../utils/AppError';
import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { LayoutItem } from '../types';
import { useCreativeStore } from '../store/useCreativeStore';

interface UniversalStudioContextType {
    layout: LayoutItem[];
    setLayout: (layout: LayoutItem[] | ((prev: LayoutItem[]) => LayoutItem[])) => void;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    selectedIds: string[];
    setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    designMode: boolean;
    setDesignMode: (mode: boolean) => void;
    updateComponent: (instanceId: string, updates: Partial<LayoutItem>) => void;
    updateMultipleComponents: (instanceIds: string[], updates: Partial<LayoutItem>) => void;
    groupSelected: () => void;
    ungroupSelected: () => void;
    lockSelected: () => void;
    unlockSelected: () => void;
    deleteSelected: () => void;
    clearSelection: () => void;
    toggleSelection: (instanceId: string, isCtrlKey: boolean) => void;
    lockedItems: string[];
    groupedItems: Record<string, string[]>;
}

const UniversalStudioContext = createContext<UniversalStudioContextType | undefined>(undefined);

export function UniversalStudioProvider({ children }: { children: ReactNode }) {
    const store = useCreativeStore();

    const value = useMemo(() => ({
        ...store
    }), [store]);

    return <UniversalStudioContext.Provider value={value}>{children}</UniversalStudioContext.Provider>;
}

export const useUniversalStudio = () => {
    const context = useContext(UniversalStudioContext);
    if (!context) throw new AppError('useUniversalStudio must be used within a UniversalStudioProvider', 'INTERNAL_ERROR', 500);
    return context;
};
