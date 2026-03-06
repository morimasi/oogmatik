import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { InteractiveStoryData, ReadingStudioConfig, LayoutItem, Student } from '../types';

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
    const [config, setConfig] = useState<ReadingStudioConfig>({
        gradeLevel: '3. Sınıf', studentName: '', topic: '', genre: 'Macera', tone: 'Eğlenceli',
        length: 'medium', layoutDensity: 'comfortable', textComplexity: 'moderate',
        fontSettings: { family: 'OpenDyslexic', size: 16, lineHeight: 1.8, letterSpacing: 1, wordSpacing: 2 },
        includeImage: true, imageSize: 40, imageOpacity: 100, imagePosition: 'right',
        imageGeneration: { enabled: true, style: 'storybook', complexity: 'simple' },
        include5N1K: true, countMultipleChoice: 3, countTrueFalse: 2, countFillBlanks: 2, countLogic: 1, countInference: 1,
        focusVocabulary: true, includeCreativeTask: true, includeWordHunt: false, includeSpellingCheck: false,
        showReadingTracker: false, showSelfAssessment: false, showTeacherNotes: false, showDateSection: true
    });

    const [storyData, setStoryData] = useState<InteractiveStoryData | null>(null);
    const [layout, setLayout] = useState<LayoutItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [designMode, setDesignMode] = useState(true);
    const [activeStudent, setActiveStudentState] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Undo/Redo stacks
    const [past, setPast] = useState<LayoutItem[][]>([]);
    const [future, setFuture] = useState<LayoutItem[][]>([]);

    const saveHistory = useCallback((currentLayout: LayoutItem[]) => {
        setPast((prev: LayoutItem[][]) => [...prev.slice(-19), currentLayout]); // Keep last 20 steps
        setFuture([]);
    }, []);

    const undo = useCallback(() => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        setFuture((prev: LayoutItem[][]) => [layout, ...prev]);
        setLayout(previous);
        setPast(newPast);
    }, [past, layout]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);
        setPast((prev: LayoutItem[][]) => [...prev, layout]);
        setLayout(next);
        setFuture(newFuture);
    }, [future, layout]);

    const updateComponent = useCallback((instanceId: string, updates: Partial<LayoutItem>, saveToHistory = false) => {
        if (saveToHistory) {
            saveHistory(layout);
        }
        setLayout((prev: LayoutItem[]) => prev.map(item => item.instanceId === instanceId ? { ...item, ...updates } : item));
    }, [layout, saveHistory]);

    const addComponent = useCallback((def: any) => {
        saveHistory(layout);
        const lastPage = layout.length > 0 ? Math.max(...layout.map(l => l.pageIndex || 0)) : 0;
        const itemsOnLastPage = layout.filter(l => (l.pageIndex || 0) === lastPage);
        let lastY = itemsOnLastPage.length > 0 ? Math.max(...itemsOnLastPage.map(l => (l.style.y || 0) + (l.style.h || 0))) : 0;
        
        let newPageIndex = lastPage;
        if (lastY + 100 > 1123 - 40) { // A4_HEIGHT_PX = 1123
            newPageIndex++;
            lastY = 0;
        }

        const newComp: LayoutItem = {
            ...def,
            instanceId: `inst_${Date.now()}`,
            isVisible: true,
            pageIndex: newPageIndex,
            style: {
                x: 20, y: lastY + 20, w: 754, h: 100, zIndex: 1, rotation: 0,
                padding: 10, backgroundColor: 'transparent', borderColor: 'transparent',
                borderWidth: 0, borderStyle: 'solid', borderRadius: 0, opacity: 1,
                boxShadow: 'none', textAlign: 'left', color: '#000000', fontSize: 14,
                fontFamily: 'OpenDyslexic', lineHeight: 1.5, ...def.defaultStyle
            },
            specificData: {}
        };
        setLayout((prev: LayoutItem[]) => [...prev, newComp]);
        setSelectedId(newComp.instanceId);
    }, [layout, saveHistory]);

    const value = useMemo(() => ({
        config, setConfig, storyData, setStoryData, layout, setLayout,
        selectedId, setSelectedId, designMode, setDesignMode,
        activeStudent, setActiveStudent: setActiveStudentState, isLoading, setIsLoading,
        updateComponent, addComponent,
        undo, redo, canUndo: past.length > 0, canRedo: future.length > 0
    }), [config, storyData, layout, selectedId, designMode, activeStudent, isLoading, updateComponent, addComponent, undo, redo, past.length, future.length]);

    return <ReadingStudioContext.Provider value={value}>{children}</ReadingStudioContext.Provider>;
};

export const useReadingStudio = () => {
    const context = useContext(ReadingStudioContext);
    if (!context) throw new Error('useReadingStudio must be used within a ReadingStudioProvider');
    return context;
};
