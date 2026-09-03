/**
 * MatProblemStudyosu — Zustand Store
 * Bağımsız state management (mevcut useMatSinavStore'a dokunmaz)
 */

import { create } from 'zustand';
import type {
    MatProblemAyarlari,
    MatProblemSeti,
    ProblemDizgiAyarlari,
} from '../types/matProblem';

interface MatProblemStoreState {
    // Ayarlar
    ayarlar: MatProblemAyarlari;
    setAyarlar: (ayarlar: Partial<MatProblemAyarlari>) => void;
    setSinif: (sinif: number) => void;
    setSecilenUniteler: (uniteler: string[]) => void;
    setSecilenKazanimlar: (kazanimlar: string[]) => void;
    setProblemSayisi: (sayi: number) => void;

    // Dizgi Ayarları
    dizgiAyarlari: ProblemDizgiAyarlari;
    setDizgiAyarlari: (ayarlar: Partial<ProblemDizgiAyarlari>) => void;

    // Aktif problem seti
    aktifProblemSeti: MatProblemSeti | null;
    setAktifProblemSeti: (set: MatProblemSeti | null) => void;

    // Generating
    isGenerating: boolean;
    setIsGenerating: (v: boolean) => void;

    // Geçmiş (localStorage persist)
    problemGecmisi: MatProblemSeti[];
    addProblemGecmisi: (set: MatProblemSeti) => void;
    removeProblemGecmisi: (id: string) => void;
    clearProblemGecmisi: () => void;

    // Reset
    reset: () => void;
}

const defaultAyarlar: MatProblemAyarlari = {
    sinif: null,
    secilenUniteler: [],
    secilenKazanimlar: [],
    problemSayisi: 5,
    zorlukSeviyesi: 'Otomatik',
    ozelTalimatlar: undefined,
    ozelKonu: undefined,
    kategori: 'gercek-yasam',
    verilenlerGosterilsinMi: true,
    cozumKutusuGosterilsinMi: true,
    isLgsMode: false,
};

const defaultDizgiAyarlari: ProblemDizgiAyarlari = {
    fontAilesi: 'Lexend',
    fontBoyutu: '11pt',
    kenarBoslugu: 'orta',
    sutunDuzeni: 'tek',
    metinHizalama: 'left',
    satirAraligi: 'normal',
};

// localStorage'dan geçmişi yükle
function loadGecmis(): MatProblemSeti[] {
    try {
        const raw = localStorage.getItem('mat_problem_gecmisi');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveGecmis(gecmis: MatProblemSeti[]) {
    try {
        localStorage.setItem('mat_problem_gecmisi', JSON.stringify(gecmis.slice(0, 50)));
    } catch {
        // Storage quota — sessizce yoksay
    }
}

export const useMatProblemStore = create<MatProblemStoreState>((set, get) => ({
    ayarlar: defaultAyarlar,
    dizgiAyarlari: defaultDizgiAyarlari,
    aktifProblemSeti: null,
    isGenerating: false,
    problemGecmisi: loadGecmis(),

    setAyarlar: (partial: Partial<MatProblemAyarlari>) =>
        set((s) => ({ ayarlar: { ...s.ayarlar, ...partial } })),

    setSinif: (sinif: number) =>
        set((s) => ({
            ayarlar: {
                ...s.ayarlar,
                sinif,
                secilenUniteler: [],
                secilenKazanimlar: [],
            },
        })),

    setSecilenUniteler: (uniteler: string[]) =>
        set((s) => ({ ayarlar: { ...s.ayarlar, secilenUniteler: uniteler } })),

    setSecilenKazanimlar: (kazanimlar: string[]) =>
        set((s) => ({ ayarlar: { ...s.ayarlar, secilenKazanimlar: kazanimlar } })),

    setProblemSayisi: (sayi: number) =>
        set((s) => ({ ayarlar: { ...s.ayarlar, problemSayisi: Math.max(1, Math.min(50, sayi)) } })),

    setDizgiAyarlari: (partial: Partial<ProblemDizgiAyarlari>) =>
        set((s) => ({ dizgiAyarlari: { ...s.dizgiAyarlari, ...partial } })),

    setAktifProblemSeti: (problemSeti: MatProblemSeti | null) =>
        set({ aktifProblemSeti: problemSeti }),

    setIsGenerating: (v: boolean) => set({ isGenerating: v }),

    addProblemGecmisi: (problemSeti: MatProblemSeti) => {
        const gecmis = [problemSeti, ...get().problemGecmisi].slice(0, 50);
        saveGecmis(gecmis);
        set({ problemGecmisi: gecmis });
    },

    removeProblemGecmisi: (id: string) => {
        const gecmis = get().problemGecmisi.filter((s) => s.id !== id);
        saveGecmis(gecmis);
        set({ problemGecmisi: gecmis });
    },

    clearProblemGecmisi: () => {
        saveGecmis([]);
        set({ problemGecmisi: [] });
    },

    reset: () =>
        set({
            ayarlar: defaultAyarlar,
            dizgiAyarlari: defaultDizgiAyarlari,
            aktifProblemSeti: null,
            isGenerating: false,
        }),
}));
