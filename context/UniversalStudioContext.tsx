import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { LayoutItem } from '../types';

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

export function UniversalStudioProvider({ children }: { children: any }) {
    const [layout, setLayout] = useState<LayoutItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [designMode, setDesignMode] = useState(false);
    const [lockedItems, setLockedItems] = useState<string[]>([]);
    const [groupedItems, setGroupedItems] = useState<Record<string, string[]>>({});

    const updateComponent = useCallback((instanceId: string, updates: Partial<LayoutItem>) => {
        setLayout((prev: LayoutItem[]) => prev.map(item => item.instanceId === instanceId ? { ...item, ...updates } : item));
    }, []);

    const updateMultipleComponents = useCallback((instanceIds: string[], updates: Partial<LayoutItem>) => {
        setLayout((prev: LayoutItem[]) => prev.map(item => instanceIds.includes(item.instanceId) ? { ...item, ...updates } : item));
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedId(null);
        setSelectedIds([]);
    }, []);

    const toggleSelection = useCallback((instanceId: string, isCtrlKey: boolean) => {
        if (isCtrlKey) {
            setSelectedIds(prev => {
                if (prev.includes(instanceId)) {
                    return prev.filter(id => id !== instanceId);
                }
                return [...prev, instanceId];
            });
            setSelectedId(null);
        } else {
            setSelectedId(instanceId);
            setSelectedIds([instanceId]);
        }
    }, []);

    const groupSelected = useCallback(() => {
        const itemsToGroup = selectedIds.length > 0 ? selectedIds : (selectedId ? [selectedId] : []);
        if (itemsToGroup.length < 2) return;
        
        const groupId = `group_${Date.now()}`;
        setLayout(prev => prev.map(item => itemsToGroup.includes(item.instanceId) ? { ...item, groupId } : item));
        setGroupedItems(prev => ({ ...prev, [groupId]: itemsToGroup }));
    }, [selectedIds, selectedId]);

    const ungroupSelected = useCallback(() => {
        const itemId = selectedId || selectedIds[0];
        if (!itemId) return;
        
        const item = layout.find(l => l.instanceId === itemId);
        if (!item?.groupId) return;
        
        const groupId = item.groupId;
        setLayout(prev => prev.map(l => l.groupId === groupId ? { ...l, groupId: undefined } : l));
        setGroupedItems(prev => {
            const newGroups = { ...prev };
            delete newGroups[groupId];
            return newGroups;
        });
    }, [selectedId, selectedIds, layout]);

    const lockSelected = useCallback(() => {
        const itemsToLock = selectedIds.length > 0 ? selectedIds : (selectedId ? [selectedId] : []);
        setLockedItems(prev => [...new Set([...prev, ...itemsToLock])]);
    }, [selectedIds, selectedId]);

    const unlockSelected = useCallback(() => {
        const itemsToUnlock = selectedIds.length > 0 ? selectedIds : (selectedId ? [selectedId] : []);
        setLockedItems(prev => prev.filter(id => !itemsToUnlock.includes(id)));
    }, [selectedIds, selectedId]);

    const deleteSelected = useCallback(() => {
        const itemsToDelete = selectedIds.length > 0 ? selectedIds : (selectedId ? [selectedId] : []);
        setLayout(prev => prev.map(item => itemsToDelete.includes(item.instanceId) ? { ...item, isVisible: false } : item));
        clearSelection();
    }, [selectedIds, selectedId, clearSelection]);

    const value = useMemo(() => ({
        layout, setLayout, selectedId, setSelectedId, selectedIds, setSelectedIds, 
        designMode, setDesignMode, updateComponent, updateMultipleComponents,
        groupSelected, ungroupSelected, lockSelected, unlockSelected, deleteSelected,
        clearSelection, toggleSelection, lockedItems, groupedItems
    }), [layout, selectedId, selectedIds, designMode, updateComponent, updateMultipleComponents,
        groupSelected, ungroupSelected, lockSelected, unlockSelected, deleteSelected,
        clearSelection, toggleSelection, lockedItems, groupedItems]);

    return <UniversalStudioContext.Provider value={value}>{children}</UniversalStudioContext.Provider>;
}

export const useUniversalStudio = () => {
    const context = useContext(UniversalStudioContext);
    if (!context) throw new Error('useUniversalStudio must be used within a UniversalStudioProvider');
    return context;
};
