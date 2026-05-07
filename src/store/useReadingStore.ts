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
  updateComponent: (
    instanceId: string,
    updates: Partial<LayoutItem>,
    saveToHistory?: boolean
  ) => void;
  toggleVisibility: (instanceId: string) => void;
  recalculateLayout: () => void;
  addComponent: (def: unknown) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useReadingStore = create<ReadingState>()((set, get) => ({
  config: {
    gradeLevel: '3. Sınıf',
    studentName: '',
    topic: '',
    genre: 'Macera',
    tone: 'Eğlenceli',
    length: 'medium',
    layoutDensity: 'comfortable',
    textComplexity: 'moderate',
    fontSettings: {
      family: 'OpenDyslexic',
      size: 16,
      lineHeight: 1.8,
      letterSpacing: 1,
      wordSpacing: 2,
    },
    includeImage: true,
    imageSize: 40,
    imageOpacity: 100,
    imagePosition: 'right',
    imageGeneration: { enabled: true, style: 'storybook', complexity: 'simple' },
    include5N1K: true,
    countMultipleChoice: 3,
    countTrueFalse: 2,
    countFillBlanks: 2,
    countLogic: 1,
    countInference: 1,
    focusVocabulary: true,
    includeCreativeTask: true,
    includeWordHunt: false,
    includeSpellingCheck: false,
    showReadingTracker: false,
    showSelfAssessment: false,
    showTeacherNotes: false,
    showDateSection: true,
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
  setLayout: (layoutUpdate) =>
    set((state: ReadingState) => ({
      layout: typeof layoutUpdate === 'function' ? layoutUpdate(state.layout) : layoutUpdate,
    })),
  setSelectedId: (selectedId) => set({ selectedId }),
  setDesignMode: (designMode) => set({ designMode }),
  setActiveStudent: (activeStudent) => set({ activeStudent }),
  setIsLoading: (isLoading) => set({ isLoading }),

  // Operations (Optimized for performance)
  updateComponent: (instanceId, updates, saveToHistory = false) => {
    const { layout, past } = get();
    if (saveToHistory) {
      const nextPast = [...past.slice(-19), layout];
      set({ past: nextPast, future: [] });
    }
    set((state: ReadingState) => ({
      layout: state.layout.map((item: LayoutItem) =>
        item.instanceId === instanceId ? { ...item, ...updates } : item
      ),
    }));
  },

  toggleVisibility: (instanceId) => {
    const { layout, updateComponent, recalculateLayout } = get();
    const item = layout.find(i => i.instanceId === instanceId);
    if (!item) return;

    updateComponent(instanceId, { isVisible: !item.isVisible }, true);
    // Her görünürlük değişiminden sonra mizanpajı otomatik kapat (Reflow)
    recalculateLayout();
  },

  recalculateLayout: () => {
    set((state: ReadingState) => {
      const margin = 30;
      let currentY = 20;
      let currentPage = 0;
      const sortedItems = [...state.layout].sort((a, b) => {
         // Id bazlı sabit sıra (User'ın istediği sıra)
         const orderIndex: Record<string, number> = {
            'header': 0,
            'story_block': 1,
            '5n1k': 2,
            'vocabulary': 3,
            'pedagogical_goals': 4,
            'test_questions': 5,
            'logic_problem': 6,
            'syllable_train': 7,
            'creative_area': 8,
            'note_area': 9
         };
         return (orderIndex[a.id] ?? 99) - (orderIndex[b.id] ?? 99);
      });

      const updatedLayout = sortedItems.map((item) => {
        if (!item.isVisible) return item;

        const h = Number(item.style.h) || 100;
        if (currentY + h > A4_HEIGHT_PX - 40) {
          currentPage++;
          currentY = 20;
        }

        const newItem = {
          ...item,
          pageIndex: currentPage,
          style: {
            ...item.style,
            y: currentY,
            x: 20, // Reset X to standard
            w: 754  // Reset W to standard width
          }
        };

        currentY += h + margin;
        return newItem;
      });

      return { layout: updatedLayout };
    });
  },

  addComponent: (def: unknown) => {
    const { layout, past, recalculateLayout } = get();
    set({ past: [...past.slice(-19), layout], future: [] });

    const compDef = def as Record<string, unknown>;
    const newComp = {
      ...compDef,
      instanceId: `inst_${Date.now()}`,
      isVisible: true,
      style: {
        x: 20,
        y: 0, // Recalculate will fix this
        w: 754,
        h: 150,
        zIndex: 1,
        rotation: 0,
        padding: 15,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        borderStyle: 'solid',
        borderRadius: 8,
        opacity: 1,
        boxShadow: 'none',
        textAlign: 'left',
        color: '#000000',
        fontSize: 14,
        fontFamily: 'Lexend',
        lineHeight: 1.5,
        ...((compDef.defaultStyle as object) || {}),
      },
      specificData: compDef.specificData || {},
    } as unknown as LayoutItem;

    set((state: ReadingState) => ({
      layout: [...state.layout, newComp],
      selectedId: newComp.instanceId,
    }));
    
    recalculateLayout();
  },

  undo: () => {
    const { past, layout, future } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set({
      layout: previous,
      past: past.slice(0, past.length - 1),
      future: [layout, ...future],
    });
  },

  redo: () => {
    const { future, layout, past } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      layout: next,
      future: future.slice(1),
      past: [...past, layout],
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}));
