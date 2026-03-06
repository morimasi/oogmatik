import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { LayoutItem } from '../types';

interface UniversalStudioContextType {
    layout: LayoutItem[];
    setLayout: (layout: LayoutItem[] | ((prev: LayoutItem[]) => LayoutItem[])) => void;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
    designMode: boolean;
    setDesignMode: (mode: boolean) => void;
    updateComponent: (instanceId: string, updates: Partial<LayoutItem>) => void;
}

const UniversalStudioContext = createContext<UniversalStudioContextType | undefined>(undefined);

export function UniversalStudioProvider({ children }: { children: any }) {
    const [layout, setLayout] = useState<LayoutItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [designMode, setDesignMode] = useState(false);

    const updateComponent = useCallback((instanceId: string, updates: Partial<LayoutItem>) => {
        setLayout((prev: LayoutItem[]) => prev.map(item => item.instanceId === instanceId ? { ...item, ...updates } : item));
    }, []);

    const value = useMemo(() => ({
        layout, setLayout, selectedId, setSelectedId, designMode, setDesignMode, updateComponent
    }), [layout, selectedId, designMode, updateComponent]);

    return <UniversalStudioContext.Provider value={value}>{children}</UniversalStudioContext.Provider>;
}

export const useUniversalStudio = () => {
    const context = useContext(UniversalStudioContext);
    if (!context) throw new Error('useUniversalStudio must be used within a UniversalStudioProvider');
    return context;
};
