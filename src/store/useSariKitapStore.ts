import { create } from 'zustand';
import type {
  SariKitapConfig,
  SariKitapActivityType,
  SariKitapGeneratedContent,
  SariKitapBaseConfig,
} from '../types/sariKitap';

// ─── Default Typography (Elif Yıldız koşulları) ─────────────────
const DEFAULT_TYPOGRAPHY: SariKitapBaseConfig['typography'] = {
  fontSize: 22,
  lineHeight: 1.8,
  letterSpacing: 0.04,
  wordSpacing: 1.5,
};

// ─── Default Base Config ─────────────────────────────────────────
const DEFAULT_BASE = {
  ageGroup: '8-10' as const,
  difficulty: 'Başlangıç' as const,
  profile: 'dyslexia' as const,
  durationMins: 15,
  topics: ['Doğa'],
  learningObjectives: ['Okuma akıcılığını geliştirme'],
  targetSkills: ['reading_fluency'],
  typography: DEFAULT_TYPOGRAPHY,
};

export function createDefaultConfig(type: SariKitapActivityType): SariKitapConfig {
  switch (type) {
    case 'pencere':
      return { ...DEFAULT_BASE, type: 'pencere', windowSize: 2, revealSpeed: 'orta', maskOpacity: 0.6, maskColor: '#1e293b', showSequential: true };
    case 'nokta':
      return { ...DEFAULT_BASE, type: 'nokta', dotPlacement: 'kelime', dotDensity: 1, dotStyle: 'yuvarlak', dotSize: 12, dotColor: '#000000', showGuideLine: false, compactFontSize: 22, wordGap: 1.5 };
    case 'kopru':
      return { ...DEFAULT_BASE, type: 'kopru', bridgePlacement: 'kelime', bridgeHeight: 14, bridgeGap: 6, bridgeWidth: 4, charGap: 1, bridgeStyle: 'yay', bridgeColor: '#000000', bridgeThickness: 1.5, textDensity: 'orta' };
    case 'cift_metin':
      return { ...DEFAULT_BASE, type: 'cift_metin', interleaveMode: 'satir', interleaveRatio: 1, sourceAColor: '#2563eb', sourceBColor: '#ea580c', sourceAStyle: 'bold', sourceBStyle: 'italic', showSourceLabels: true };
    case 'bellek':
      return { ...DEFAULT_BASE, type: 'bellek', blockCount: 16, blockSize: 'orta', gridColumns: 4, showNumbers: true, repetitionCount: 1, phases: ['A', 'B', 'C', 'D'], blankRatio: 0.5, distractorRatio: 'orta', category: 'karışık', sentenceLines: 4 };
    case 'hizli_okuma':
      return { ...DEFAULT_BASE, type: 'hizli_okuma', wordsPerBlock: 3, blockRows: 35, showTimer: false, rhythmicMode: true, autoFill: true, columnMode: 'tek', lineSpacing: 'sıkı' };
  }
}

// ─── State Interface ─────────────────────────────────────────────
interface SariKitapState {
  activeType: SariKitapActivityType;
  config: SariKitapConfig;
  isGenerating: boolean;
  generationMode: 'ai' | 'offline';
  generatedContent: SariKitapGeneratedContent | null;
  error: string | null;
  previewScale: number;
  showGrid: boolean;
  isFullscreen: boolean;
  recentGenerations: SariKitapGeneratedContent[];

  setActiveType: (type: SariKitapActivityType) => void;
  updateConfig: (updates: Partial<SariKitapConfig>) => void;
  replaceConfig: (config: SariKitapConfig) => void;
  setGenerating: (value: boolean) => void;
  setGenerationMode: (mode: 'ai' | 'offline') => void;
  setContent: (content: SariKitapGeneratedContent | null) => void;
  setError: (error: string | null) => void;
  setPreviewScale: (scale: number) => void;
  toggleGrid: () => void;
  toggleFullscreen: () => void;
  addToHistory: (content: SariKitapGeneratedContent) => void;
  resetStudio: () => void;
}

// ─── Store ───────────────────────────────────────────────────────
export const useSariKitapStore = create<SariKitapState>()((set, get) => ({
  activeType: 'pencere',
  config: createDefaultConfig('pencere'),
  isGenerating: false,
  generationMode: 'ai',
  generatedContent: null,
  error: null,
  previewScale: 1,
  showGrid: false,
  isFullscreen: false,
  recentGenerations: [],

  setActiveType: (type: SariKitapActivityType) => set({
    activeType: type,
    config: createDefaultConfig(type),
    generatedContent: null,
    error: null,
  }),

  updateConfig: (updates: Partial<SariKitapConfig>) => set((state: SariKitapState) => ({
    config: { ...state.config, ...updates } as SariKitapConfig,
  })),

  replaceConfig: (config: SariKitapConfig) => set({ config }),

  setGenerating: (value: boolean) => set({ isGenerating: value }),

  setGenerationMode: (mode: 'ai' | 'offline') => set({ generationMode: mode }),

  setContent: (content: SariKitapGeneratedContent | null) => {
    set({ generatedContent: content, error: null });
    if (content) {
      get().addToHistory(content);
    }
  },

  setError: (error: string | null) => set({ error, isGenerating: false }),

  setPreviewScale: (scale: number) => set({
    previewScale: Math.min(1.5, Math.max(0.3, scale)),
  }),

  toggleGrid: () => set((state: SariKitapState) => ({ showGrid: !state.showGrid })),

  toggleFullscreen: () => set((state: SariKitapState) => ({ isFullscreen: !state.isFullscreen })),

  addToHistory: (content: SariKitapGeneratedContent) => set((state: SariKitapState) => ({
    recentGenerations: [content, ...state.recentGenerations].slice(0, 10),
  })),

  resetStudio: () => set({
    activeType: 'pencere',
    config: createDefaultConfig('pencere'),
    isGenerating: false,
    generationMode: 'ai',
    generatedContent: null,
    error: null,
    previewScale: 1,
    showGrid: false,
    isFullscreen: false,
  }),
}));
