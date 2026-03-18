import { create } from 'zustand';
import { LayoutItem } from '../types';

interface CreativeState {
    // State
    layout: LayoutItem[];
    selectedId: string | null;
    selectedIds: string[];
    designMode: boolean;
    lockedItems: string[];
    groupedItems: Record<string, string[]>;

    // Actions
    setLayout: (layout: LayoutItem[] | ((prev: LayoutItem[]) => LayoutItem[])) => void;
    setSelectedId: (id: string | null) => void;
    setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    setDesignMode: (mode: boolean) => void;

    // Component Operations
    updateComponent: (instanceId: string, updates: Partial<LayoutItem>) => void;
    updateMultipleComponents: (instanceIds: string[], updates: Partial<LayoutItem>) => void;

    // Selection Management
    clearSelection: () => void;
    toggleSelection: (instanceId: string, isCtrlKey: boolean) => void;

    // Group & Lock Operations
    groupSelected: () => void;
    ungroupSelected: () => void;
    lockSelected: () => void;
    unlockSelected: () => void;
    deleteSelected: () => void;
}

/**
 * useCreativeStore - UniversalStudio Merkezi Deposu
 * Context API'den Zustand'a taşınmış, optimize edilmiş state yönetimi.
 */
export const useCreativeStore = create<CreativeState>((set, get) => ({
    // Initial State
    layout: [],
    selectedId: null,
    selectedIds: [],
    designMode: false,
    lockedItems: [],
    groupedItems: {},

    // Basic Setters
    setLayout: (layoutUpdate) => set((state) => ({
        layout: typeof layoutUpdate === 'function' ? layoutUpdate(state.layout) : layoutUpdate
    })),

    setSelectedId: (id) => set({ selectedId: id }),

    setSelectedIds: (idsUpdate) => set((state) => ({
        selectedIds: typeof idsUpdate === 'function' ? idsUpdate(state.selectedIds) : idsUpdate
    })),

    setDesignMode: (mode) => set({ designMode: mode }),

    // Advanced Actions
    updateComponent: (instanceId, updates) => set((state) => ({
        layout: state.layout.map((item) =>
            item.instanceId === instanceId ? { ...item, ...updates } : item
        )
    })),

    updateMultipleComponents: (instanceIds, updates) => set((state) => ({
        layout: state.layout.map((item) =>
            instanceIds.includes(item.instanceId) ? { ...item, ...updates } : item
        )
    })),

    clearSelection: () => set({ selectedId: null, selectedIds: [] }),

    toggleSelection: (instanceId, isCtrlKey) => {
        if (isCtrlKey) {
            set((state) => {
                const isSelected = state.selectedIds.includes(instanceId);
                const nextIds = isSelected
                    ? state.selectedIds.filter(id => id !== instanceId)
                    : [...state.selectedIds, instanceId];
                return { selectedIds: nextIds, selectedId: null };
            });
        } else {
            set({ selectedId: instanceId, selectedIds: [instanceId] });
        }
    },

    groupSelected: () => {
        const { selectedIds, selectedId } = get();
        const itemsToGroup = selectedIds.length > 0 ? selectedIds : (selectedId ? [selectedId] : []);
        if (itemsToGroup.length < 2) return;

        const groupId = `group_${Date.now()}`;
        set((state) => ({
            layout: state.layout.map((item) =>
                itemsToGroup.includes(item.instanceId) ? { ...item, groupId } : item
            ),
            groupedItems: { ...state.groupedItems, [groupId]: itemsToGroup }
        }));
    },

    ungroupSelected: () => {
        const { selectedId, selectedIds, layout } = get();
        const itemId = selectedId || selectedIds[0];
        if (!itemId) return;

        const item = layout.find((l) => l.instanceId === itemId);
        if (!item?.groupId) return;

        const groupId = item.groupId;
        set((state) => {
            const nextGroups = { ...state.groupedItems };
            delete nextGroups[groupId];
            return {
                layout: state.layout.map((l) =>
                    l.groupId === groupId ? { ...l, groupId: undefined } : l
                ),
                groupedItems: nextGroups
            };
        });
    },

    lockSelected: () => {
        const { selectedIds, selectedId } = get();
        const itemsToLock = selectedIds.length > 0 ? selectedIds : (selectedId ? [selectedId] : []);
        set((state) => ({
            lockedItems: [...new Set([...state.lockedItems, ...itemsToLock])]
        }));
    },

    unlockSelected: () => {
        const { selectedIds, selectedId } = get();
        const itemsToUnlock = selectedIds.length > 0 ? selectedIds : (selectedId ? [selectedId] : []);
        set((state) => ({
            lockedItems: state.lockedItems.filter((id) => !itemsToUnlock.includes(id))
        }));
    },

    deleteSelected: () => {
        const { selectedIds, selectedId, clearSelection } = get();
        const itemsToDelete = selectedIds.length > 0 ? selectedIds : (selectedId ? [selectedId] : []);
        set((state) => ({
            layout: state.layout.map((item) =>
                itemsToDelete.includes(item.instanceId) ? { ...item, isVisible: false } : item
            )
        }));
        clearSelection();
    }
}));
