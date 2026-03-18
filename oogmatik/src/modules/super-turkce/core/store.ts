import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    GradeLevel,
    Objective,
    DifficultyLevel,
    TargetAudience,
    ActivityType,
    EngineMode,
    DraftComponent,
    ArchiveItem,
    VocabularyItem
} from './types';

export interface SuperTurkceState {
    // Navigasyon (Yeni V2 Mimarisi)
    activeCategory: string | null;

    // Seçilen Rotasyon (Müfredat)
    selectedGrade: GradeLevel | null;
    selectedUnitId: string | null;
    selectedObjective: Objective | null;

    // Çift Çekirdek (Dual Engine) Seçimi
    engineMode: EngineMode;

    // Geliştirilmiş Özelleştirmeler (Ultra Settings)
    difficulty: DifficultyLevel;
    audience: TargetAudience;
    interestArea: string;       // Örn: Uzay, Dinozorlar, Futbol
    wordLimit: number;          // Üretilecek kelime/içerik limiti
    avoidLetters: string[];     // ['b', 'd'] gibi disletik dışlamalar

    // Çıktı Formatları (FSD Alt Modülleri)
    selectedActivityTypes: ActivityType[];

    // Taslak (Draft) Bileşenleri (Faz 3)
    draftComponents: DraftComponent[];

    // Premium Ayarlar: Branding, Tema vb.
    themeColor: 'eco-black' | 'vibrant' | 'minimalist';
    includeWatermark: boolean;
    watermarkText?: string;
    institutionName?: string;
    includeIllustration: boolean;

    // Faz 10: Arşiv (Geçmiş Üretimler) ve Kelime Kumbarası
    archiveHistory: ArchiveItem[];
    vocabularyBank: VocabularyItem[];

    // Aksiyonlar
    setActiveCategory: (categoryId: string | null) => void;
    setGrade: (grade: GradeLevel) => void;
    setUnitId: (unitId: string | null) => void;
    setObjective: (objective: Objective | null) => void;

    setEngineMode: (mode: EngineMode) => void;

    setDifficulty: (level: DifficultyLevel) => void;
    setAudience: (audience: TargetAudience) => void;
    setInterestArea: (interest: string) => void;
    setWordLimit: (limit: number) => void;
    toggleAvoidLetter: (letter: string) => void;

    toggleActivityType: (type: ActivityType) => void;

    setThemeColor: (theme: 'eco-black' | 'vibrant' | 'minimalist') => void;
    setIncludeWatermark: (include: boolean) => void;
    setWatermarkText: (text: string) => void;
    setInstitutionName: (name: string) => void;
    setIncludeIllustration: (include: boolean) => void;

    // Taslak İşlemleri (Faz 3)
    setDraftComponents: (components: DraftComponent[]) => void;
    updateDraftData: (id: string, data: any) => void;

    // Faz 10 Aksiyonları
    saveToArchive: (grade: GradeLevel, objectiveTitle: string, engineMode: EngineMode, drafts: DraftComponent[]) => void;
    deleteFromArchive: (archiveId: string) => void;

    addVocabularyWord: (word: string, context?: string, meaning?: string) => void;
    removeVocabularyWord: (vocabId: string) => void;

    // Modülü Sıfırlama
    resetStore: () => void;
}

export const useSuperTurkceStore = create<SuperTurkceState>()(
    persist(
        (set) => ({
            activeCategory: null,
            selectedGrade: null,
            selectedUnitId: null,
            selectedObjective: null,
            engineMode: 'fast', // Varsayılan olarak API maliyeti olmayan "Hızlı Mod"

            difficulty: 'orta',
            audience: 'normal',
            interestArea: '',
            wordLimit: 100, // Varsayılan 100 kelime
            avoidLetters: [],

            selectedActivityTypes: [], // Başlangıçta boş
            draftComponents: [], // Başlangıçta taslak yok

            themeColor: 'eco-black',
            includeWatermark: true,
            watermarkText: 'OOGMATIK',
            institutionName: 'Oogmatik Eğitim Kurumları',
            includeIllustration: true,

            // Faz 10 - Persist Arrays
            archiveHistory: [],
            vocabularyBank: [],

            setActiveCategory: (categoryId: string | null) => set({ activeCategory: categoryId }),
            setGrade: (grade: GradeLevel) => set({ selectedGrade: grade, selectedUnitId: null, selectedObjective: null }),
            setUnitId: (unitId: string | null) => set({ selectedUnitId: unitId, selectedObjective: null }),
            setObjective: (objective: Objective | null) => set({ selectedObjective: objective }),

            setEngineMode: (mode: EngineMode) => set({ engineMode: mode }),

            setDifficulty: (level: DifficultyLevel) => set({ difficulty: level }),
            setAudience: (audience: TargetAudience) => set({ audience }),
            setInterestArea: (interest: string) => set({ interestArea: interest }),
            setWordLimit: (limit: number) => set({ wordLimit: limit }),

            toggleAvoidLetter: (letter: string) => set((state: SuperTurkceState) => ({
                avoidLetters: state.avoidLetters.includes(letter)
                    ? state.avoidLetters.filter((l: string) => l !== letter)
                    : [...state.avoidLetters, letter]
            })),

            toggleActivityType: (type: ActivityType) => set((state: SuperTurkceState) => {
                const types = [...state.selectedActivityTypes];
                const index = types.indexOf(type);
                if (index > -1) {
                    types.splice(index, 1);
                } else {
                    types.push(type);
                }
                return { selectedActivityTypes: types };
            }),

            setThemeColor: (theme: 'eco-black' | 'vibrant' | 'minimalist') => set({ themeColor: theme }),
            setIncludeWatermark: (include: boolean) => set({ includeWatermark: include }),
            setIncludeIllustration: (include: boolean) => set({ includeIllustration: include }),

            setDraftComponents: (components: DraftComponent[]) => set({ draftComponents: components }),
            updateDraftData: (id: string, data: any) => set((state: SuperTurkceState) => ({
                draftComponents: state.draftComponents.map(comp => comp.id === id ? { ...comp, data } : comp)
            })),

            // Faz 10: Arşiv Kaydetme
            saveToArchive: (grade: GradeLevel, objectiveTitle: string, engineMode: EngineMode, drafts: DraftComponent[]) =>
                set((state: SuperTurkceState) => ({
                    archiveHistory: [
                        {
                            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
                            createdAt: Date.now(),
                            grade,
                            objectiveTitle,
                            engineMode,
                            totalActivities: drafts.length,
                            drafts: [...drafts] // Deep clone
                        },
                        ...state.archiveHistory
                    ]
                })),

            deleteFromArchive: (archiveId: string) =>
                set((state: SuperTurkceState) => ({
                    archiveHistory: state.archiveHistory.filter(a => a.id !== archiveId)
                })),

            // Faz 10: Kelime Kumbarası
            addVocabularyWord: (word: string, contextSource?: string, meaning?: string) =>
                set((state: SuperTurkceState) => {
                    // Aynı kelime zaten varsa ekleme
                    if (state.vocabularyBank.some(v => v.word.toLowerCase() === word.toLowerCase())) return state;

                    return {
                        vocabularyBank: [
                            {
                                id: Date.now().toString(36) + Math.random().toString(36).substring(2),
                                word,
                                contextSource,
                                meaning,
                                discoveredAt: Date.now()
                            },
                            ...state.vocabularyBank
                        ]
                    };
                }),

            removeVocabularyWord: (vocabId: string) =>
                set((state: SuperTurkceState) => ({
                    vocabularyBank: state.vocabularyBank.filter(v => v.id !== vocabId)
                })),

            resetStore: () => set({
                activeCategory: null,
                selectedGrade: null,
                selectedUnitId: null,
                selectedObjective: null,
                engineMode: 'fast',
                difficulty: 'orta',
                audience: 'normal',
                interestArea: '',
                wordLimit: 100,
                avoidLetters: [],
                selectedActivityTypes: [],
                themeColor: 'eco-black',
                includeWatermark: true,
                includeIllustration: true
            }),
        }),
        {
            name: 'oogmatik-super-turkce-store',
        }
    )
);
