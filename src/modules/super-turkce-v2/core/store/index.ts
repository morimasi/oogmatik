import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    GradeLevel,
    Objective,
    EngineMode,
    TargetAudience,
    PrintSettings,
    WorksheetInstance
} from '../types';

export interface SuperTurkceV2State {
    // ========================
    // 1. NAVİGASYON VE STÜDYO
    // ========================
    activeStudioId: string | null;
    activeTemplateId: string | null;

    // ========================
    // 2. MÜFREDAT SEÇİMİ
    // ========================
    grade: GradeLevel | null;
    objective: Objective | null;

    // ========================
    // 3. ÜRETİM VE MOTOR
    // ========================
    engine: EngineMode;
    audience: TargetAudience;
    templateSettings: Record<string, any>; // Dinamik şablon ayarları (key-value)

    // ========================
    // 4. BASKI (PDF) AYARLARI
    // ========================
    printSettings: PrintSettings;

    // ========================
    // 5. ÜRETİM SONUÇLARI
    // ========================
    currentWorksheet: WorksheetInstance | null;
    worksheetHistory: WorksheetInstance[]; // Arşiv (Kumbaralar)

    // ========================
    // AKSİYONLAR
    // ========================
    setStudioId: (id: string | null) => void;
    setTemplateId: (id: string | null) => void;

    setGrade: (grade: GradeLevel | null) => void;
    setObjective: (obj: Objective | null) => void;

    setEngine: (mode: EngineMode) => void;
    setAudience: (aud: TargetAudience) => void;
    setTemplateSetting: (key: string, value: any) => void;

    updatePrintSettings: (updates: Partial<PrintSettings>) => void;

    setCurrentWorksheet: (ws: WorksheetInstance | null) => void;
    saveToHistory: (ws: WorksheetInstance) => void;

    resetSession: () => void;
}

const defaultPrintSettings: PrintSettings = {
    watermarkText: 'Özel Öğrenme Güçlüğü Destek Materyali',
    showWatermark: true,
    institutionName: 'Bursa Disleksi Kurumu',

    fontFamily: 'Arial',
    lineHeight: 'normal',
    letterSpacing: 'normal',
    wordSpacing: 'normal',

    b_d_spacing: false,
    highContrast: false,
};

export const useSuperTurkceV2Store = create<SuperTurkceV2State>()(
    persist(
        (set) => ({
            // Başlangıç Değerleri
            activeStudioId: null,
            activeTemplateId: null,
            grade: null,
            objective: null,
            engine: 'fast',
            audience: 'normal',
            templateSettings: {},
            printSettings: { ...defaultPrintSettings },
            currentWorksheet: null,
            worksheetHistory: [],

            // Aksiyon Setleri
            setStudioId: (id) => set({ activeStudioId: id, activeTemplateId: null, templateSettings: {} }),
            setTemplateId: (id) => set({ activeTemplateId: id, templateSettings: {} }),

            setGrade: (grade) => set({ grade, objective: null }),
            setObjective: (objective) => set({ objective }),

            setEngine: (engine) => set({ engine }),
            setAudience: (audience) => set({ audience }),
            setTemplateSetting: (key, value) =>
                set((state) => ({ templateSettings: { ...state.templateSettings, [key]: value } })),

            updatePrintSettings: (updates) =>
                set((state) => ({ printSettings: { ...state.printSettings, ...updates } })),

            setCurrentWorksheet: (ws) => set({ currentWorksheet: ws }),
            saveToHistory: (ws) =>
                set((state) => ({ worksheetHistory: [ws, ...state.worksheetHistory] })),

            resetSession: () => set({
                activeStudioId: null,
                activeTemplateId: null,
                grade: null,
                objective: null,
                engine: 'fast',
                audience: 'normal',
                templateSettings: {},
                printSettings: { ...defaultPrintSettings },
                currentWorksheet: null
            })
        }),
        {
            name: 'superturkce-v2-factory-store',
        }
    )
);
