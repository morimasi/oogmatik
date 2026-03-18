import { create } from 'zustand';
import { ReadingStudioConfig, LayoutItem, Student } from '../types';
import { InteractiveStoryData } from '../types/verbal';
import { A4_HEIGHT_PX } from '../utils/layoutConstants';

interface ReadingState {
    config: ReadingStudioConfig;
    storyData: InteractiveStoryData | null;
    layout: LayoutItem[];
    selectedId: string | null;
    designMode: boolean;
    activeStudent: Student | null;
    isLoading: boolean;

    // History handling
    past: LayoutItem[][];
    future: LayoutItem[][];

    // Actions
    setConfig: (config: ReadingStudioConfig) => void;
    setStoryData: (data: InteractiveStoryData | null) => void;
    setLayout: (layout: LayoutItem[] | ((prev: LayoutItem[]) => LayoutItem[])) => void;
    setSelectedId: (id: string | null) => void;
    setDesignMode: (mode: boolean) => void;
    setActiveStudent: (student: Student | null) => void;
    setIsLoading: (val: boolean) => void;

    // Operations
    updateComponent: (instanceId: string, updates: Partial<LayoutItem>, saveToHistory?: boolean) => void;
    addComponent: (def: any) => void;
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
}

export const useReadingStore = create<ReadingState>((set, get) => ({
    config: {
        gradeLevel: '3. Sınıf', studentName: '', topic: '', genre: 'Macera', tone: 'Eğlenceli',
        length: 'medium', layoutDensity: 'comfortable', textComplexity: 'moderate',
        fontSettings: { family: 'OpenDyslexic', size: 16, lineHeight: 1.8, letterSpacing: 1, wordSpacing: 2 },
        includeImage: true, imageSize: 40, imageOpacity: 100, imagePosition: 'right',
        imageGeneration: { enabled: true, style: 'storybook', complexity: 'simple' },
        include5N1K: true, countMultipleChoice: 3, countTrueFalse: 2, countFillBlanks: 2, countLogic: 1, countInference: 1,
        focusVocabulary: true, includeCreativeTask: true, includeWordHunt: false, includeSpellingCheck: false,
        showReadingTracker: false, showSelfAssessment: false, showTeacherNotes: false, showDateSection: true
    },
    storyData: null,
    layout: [],
    selectedId: null,
    designMode: true,
    activeStudent: null,
    isLoading: false,
    past: [],
    future: [],

    // Methods
    setConfig: (config) => set({ config }),
    setStoryData: (storyData) => set({ storyData }),
    setLayout: (layoutUpdate) => set((state) => ({
        layout: typeof layoutUpdate === 'function' ? layoutUpdate(state.layout) : layoutUpdate
    })),
    setSelectedId: (selectedId) => set({ selectedId }),
    setDesignMode: (designMode) => set({ designMode }),
    setActiveStudent: (activeStudent) => set({ activeStudent }),
    setIsLoading: (isLoading) => set({ isLoading }),

    // Operations (Optimized for performance)
    updateComponent: (instanceId, updates, saveToHistory = false) => {
        const { layout, past } = get();
        if (saveToHistory) {
            // Bellek yönetimi: Geçmişi 20 adımda tut ve sadece gerektiğinde kopyala
            const nextPast = [...past.slice(-19), layout];
            set({ past: nextPast, future: [] });
        }
        set((state) => ({
            layout: state.layout.map(item => item.instanceId === instanceId ? { ...item, ...updates } : item)
        }));
    },

    addComponent: (def) => {
        const { layout, past } = get();
        set({ past: [...past.slice(-19), layout], future: [] });

        const lastPage = layout.length > 0 ? Math.max(...layout.map(l => l.pageIndex || 0)) : 0;
        const itemsOnLastPage = layout.filter(l => (l.pageIndex || 0) === lastPage);
        let lastY = itemsOnLastPage.length > 0 ? Math.max(...itemsOnLastPage.map(l => (l.style.y || 0) + (l.style.h || 0))) : 0;

        let newPageIndex = lastPage;
        if (lastY + 100 > A4_HEIGHT_PX - 40) {
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
        set((state) => ({
            layout: [...state.layout, newComp],
            selectedId: newComp.instanceId
        }));
    },

    undo: () => {
        const { past, layout, future } = get();
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        set({
            layout: previous,
            past: past.slice(0, past.length - 1),
            future: [layout, ...future]
        });
    },

    redo: () => {
        const { future, layout, past } = get();
        if (future.length === 0) return;
        const next = future[0];
        set({
            layout: next,
            future: future.slice(1),
            past: [...past, layout]
        });
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0
}));
