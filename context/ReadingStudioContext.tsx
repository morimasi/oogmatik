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
    updateComponent: (instanceId: string, updates: Partial<LayoutItem>) => void;
    addComponent: (def: any) => void;
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

    const updateComponent = useCallback((instanceId: string, updates: Partial<LayoutItem>) => {
        setLayout(prev => prev.map(item => item.instanceId === instanceId ? { ...item, ...updates } : item));
    }, []);

    const addComponent = useCallback((def: any) => {
        const lastY = layout.length > 0 ? Math.max(...layout.map(l => (l.style.y || 0) + (l.style.h || 0))) : 0;
        const newComp: LayoutItem = {
            ...def,
            instanceId: `inst_${Date.now()}`,
            isVisible: true,
            style: {
                x: 20, y: lastY + 20, w: 754, h: 100, zIndex: 1, rotation: 0,
                padding: 10, backgroundColor: 'transparent', borderColor: 'transparent',
                borderWidth: 0, borderStyle: 'solid', borderRadius: 0, opacity: 1,
                boxShadow: 'none', textAlign: 'left', color: '#000000', fontSize: 14,
                fontFamily: 'OpenDyslexic', lineHeight: 1.5, ...def.defaultStyle
            },
            specificData: {}
        };
        setLayout(prev => [...prev, newComp]);
        setSelectedId(newComp.instanceId);
    }, [layout]);

    const value = useMemo(() => ({
        config, setConfig, storyData, setStoryData, layout, setLayout,
        selectedId, setSelectedId, designMode, setDesignMode,
        activeStudent, setActiveStudent: setActiveStudentState, isLoading, setIsLoading,
        updateComponent, addComponent
    }), [config, storyData, layout, selectedId, designMode, activeStudent, isLoading, updateComponent, addComponent]);

    return <ReadingStudioContext.Provider value={value}>{children}</ReadingStudioContext.Provider>;
};

export const useReadingStudio = () => {
    const context = useContext(ReadingStudioContext);
    if (!context) throw new Error('useReadingStudio must be used within a ReadingStudioProvider');
    return context;
};
