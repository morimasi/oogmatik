
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { EditorElementState, AlignType } from '../types/editor';

interface EditorContextType {
    isEditMode: boolean;
    zoom: number;
    selectedIds: string[];
    elements: Record<string, EditorElementState>;
    
    // Actions
    selectElement: (id: string, multi: boolean) => void;
    clearSelection: () => void;
    updateElement: (id: string, updates: Partial<EditorElementState>) => void;
    registerElement: (id: string, initialState: Partial<EditorElementState>) => void;
    
    // Tools
    alignSelected: (type: AlignType) => void;
    bringToFront: () => void;
    sendToBack: () => void;
    deleteSelected: () => void;
    duplicateSelected: () => void;
}

const EditorContext = createContext<EditorContextType>({} as any);

export const EditorProvider: React.FC<{ children: React.ReactNode, isEditMode: boolean, zoom: number }> = ({ children, isEditMode, zoom }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [elements, setElements] = useState<Record<string, EditorElementState>>({});
    
    // Element Registration
    const registerElement = useCallback((id: string, initialState: Partial<EditorElementState>) => {
        setElements(prev => {
            if (prev[id]) return prev; // Already registered
            return {
                ...prev,
                [id]: {
                    id,
                    x: 0, y: 0, width: 'auto', height: 'auto', rotation: 0, zIndex: 1, type: 'block',
                    ...initialState
                }
            };
        });
    }, []);

    // Selection Logic
    const selectElement = useCallback((id: string, multi: boolean) => {
        if (!isEditMode) return;
        setSelectedIds(prev => {
            if (multi) {
                return prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
            }
            return [id];
        });
    }, [isEditMode]);

    const clearSelection = useCallback(() => {
        setSelectedIds([]);
    }, []);

    // Update Logic
    const updateElement = useCallback((id: string, updates: Partial<EditorElementState>) => {
        setElements(prev => ({
            ...prev,
            [id]: { ...prev[id], ...updates }
        }));
    }, []);

    // Alignment Tools
    const alignSelected = useCallback((type: AlignType) => {
        if (selectedIds.length < 2) return;
        
        // Calculate bounds of selection group
        // Note: In a real DOM implementation, we might need actual DOM rects. 
        // Here we rely on state. For complex layouts, this might need getBoundingClientRect logic injected.
        // For now, we assume simple alignment based on x/y state.
        
        const selectedEls = selectedIds.map(id => elements[id]).filter(Boolean);
        if (selectedEls.length === 0) return;

        let targetVal = 0;
        if (type === 'left') targetVal = Math.min(...selectedEls.map(e => e.x));
        if (type === 'top') targetVal = Math.min(...selectedEls.map(e => e.y));
        if (type === 'right') targetVal = Math.max(...selectedEls.map(e => e.x + (typeof e.width === 'number' ? e.width : 0))); // Simplified
        if (type === 'bottom') targetVal = Math.max(...selectedEls.map(e => e.y + (typeof e.height === 'number' ? e.height : 0)));

        selectedEls.forEach(el => {
            let updates: any = {};
            if (type === 'left') updates.x = targetVal;
            if (type === 'top') updates.y = targetVal;
            // Right/Bottom/Center require width/height knowledge which might be 'auto'. 
            // Only applied if width is number for safety in this version.
            if (type === 'right' && typeof el.width === 'number') updates.x = targetVal - el.width;
            
            updateElement(el.id, updates);
        });
    }, [selectedIds, elements, updateElement]);

    // Z-Index Tools
    const bringToFront = useCallback(() => {
        selectedIds.forEach(id => {
            updateElement(id, { zIndex: 100 + Math.floor(Math.random() * 50) }); // Simplified layering
        });
    }, [selectedIds, updateElement]);

    const sendToBack = useCallback(() => {
        selectedIds.forEach(id => {
            updateElement(id, { zIndex: 0 });
        });
    }, [selectedIds, updateElement]);

    const deleteSelected = useCallback(() => {
        // Since elements are rendered by parents (Worksheet), we can't delete them from state here easily 
        // without a global store for content. 
        // We will trigger a 'hidden' state style.
        selectedIds.forEach(id => {
            updateElement(id, { style: { ...elements[id]?.style, display: 'none' } });
        });
        clearSelection();
    }, [selectedIds, elements, updateElement, clearSelection]);

    const duplicateSelected = useCallback(() => {
        // Duplicate logic would require cloning the component tree which is complex in this architecture.
        // For now, alerting user.
        alert("Bu versiyonda çoğaltma işlemi henüz aktif değil.");
    }, []);

    return (
        <EditorContext.Provider value={{
            isEditMode,
            zoom,
            selectedIds,
            elements,
            selectElement,
            clearSelection,
            updateElement,
            registerElement,
            alignSelected,
            bringToFront,
            sendToBack,
            deleteSelected,
            duplicateSelected
        }}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditor = () => useContext(EditorContext);
