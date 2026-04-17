import { create } from 'zustand';
import type {
  SariKitapConfig,
  SariKitapActivityType,
  SariKitapGeneratedContent,
  SariKitapBaseConfig,
} from '../types/sariKitap';

// ─── Default Typography (Ultra Premium Standartları) ────
const DEFAULT_TYPOGRAPHY: SariKitapBaseConfig['typography'] = {
  fontSize: 22,
  lineHeight: 3.0,
  letterSpacing: 0.04,
  wordSpacing: 1.5,
};

const createDefaultConfig = (type: SariKitapActivityType): SariKitapConfig => {
  const base: SariKitapBaseConfig = {
    ageGroup: '8-10',
    difficulty: 'Orta',
    profile: 'dyslexia',
    durationMins: 20,
    topics: ['Genel'],
    learningObjectives: ['Okuma akıcılığı ve dikkat gelişimi'],
    targetSkills: ['Görsel Algı', 'Dikkat'],
    typography: { ...DEFAULT_TYPOGRAPHY },
  };

  switch (type) {
    case 'pencere':
      return {
        ...base,
        type: 'pencere',
        windowSize: 2,
        revealSpeed: 'orta',
        maskOpacity: 0.6,
        maskColor: '#000000',
        showSequential: true,
      };
    case 'nokta':
      return {
        ...base,
        type: 'nokta',
        dotPlacement: 'kelime',
        dotDensity: 1, // Her kelime
        dotStyle: 'yuvarlak',
        dotSize: 12,
        dotColor: '#000000',
        showGuideLine: false,
        compactFontSize: 22,
        wordGap: 1.5,
      };
    case 'kopru':
      return {
        ...base,
        type: 'kopru',
        bridgePlacement: 'kelime',
        bridgeHeight: 15,
        bridgeGap: 8,
        bridgeWidth: 2,
        charGap: 1.5,
        bridgeStyle: 'yay',
        bridgeColor: '#000000',
        bridgeThickness: 1,
        textDensity: 'orta',
      };
    case 'cift_metin':
      return {
        ...base,
        type: 'cift_metin',
        interleaveMode: 'satir',
        interleaveRatio: 1,
        sourceAColor: '#000000',
        sourceBColor: '#2563eb',
        sourceAStyle: 'normal',
        sourceBStyle: 'bold',
        showSourceLabels: true,
      };
    case 'bellek':
      return {
        ...base,
        type: 'bellek',
        blockCount: 12,
        blockSize: 'orta',
        gridColumns: 4,
        showNumbers: false,
        repetitionCount: 2,
        phases: ['A', 'B'],
        blankRatio: 0.4,
        distractorRatio: 'orta',
        category: 'hayvanlar',
        sentenceLines: 4,
      };
    case 'hizli_okuma':
      return {
        ...base,
        type: 'hizli_okuma',
        wordsPerBlock: 3,
        blockRows: 10,
        showTimer: true,
        rhythmicMode: true,
        autoFill: true,
        columnMode: 'tek',
        lineSpacing: 'normal',
      };
  }
};

interface SariKitapState {
  config: SariKitapConfig;
  generatedContent: SariKitapGeneratedContent | null;
  isLoading: boolean;
  activeId: string | null;
  
  // Actions
  setConfig: (config: SariKitapConfig) => void;
  updateConfig: (updates: Partial<SariKitapConfig>) => void;
  setGeneratedContent: (content: SariKitapGeneratedContent | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  reset: (type?: SariKitapActivityType) => void;
  setType: (type: SariKitapActivityType) => void;
}

export const useSariKitapStore = create<SariKitapState>((set) => ({
  config: createDefaultConfig('nokta'),
  generatedContent: null,
  isLoading: false,
  activeId: null,

  setConfig: (config: SariKitapConfig) => set({ config }),
  
  updateConfig: (updates: Partial<SariKitapConfig>) => set((state: SariKitapState) => ({
    config: { ...state.config, ...updates } as SariKitapConfig
  })),

  setGeneratedContent: (generatedContent: SariKitapGeneratedContent | null) => set({ generatedContent }),
  
  setIsLoading: (isLoading: boolean) => set({ isLoading }),

  reset: (type?: SariKitapActivityType) => set((state: SariKitapState) => ({
    config: createDefaultConfig(type || state.config.type),
    generatedContent: null,
    activeId: null
  })),

  setType: (type: SariKitapActivityType) => set({
    config: createDefaultConfig(type),
    generatedContent: null
  }),
}));
