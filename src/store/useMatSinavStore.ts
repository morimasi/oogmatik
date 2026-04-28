/**
 * MatSinavStudyosu — Zustand Store
 * Bağımsız state management (mevcut useSinavStore'a dokunmaz)
 */

import { create } from 'zustand';
import type { MatSinavAyarlari, MatSinav } from '../types/matSinav';

interface MatSinavStoreState {
    // Ayarlar
    ayarlar: MatSinavAyarlari;
    setAyarlar: (ayarlar: Partial<MatSinavAyarlari>) => void;
    setSinif: (sinif: number) => void;
    setSecilenUniteler: (uniteler: string[]) => void;
    setSecilenKazanimlar: (kazanimlar: string[]) => void;
    setSoruDagilimi: (tip: keyof MatSinavAyarlari['soruDagilimi'], sayi: number) => void;

    // Aktif sınav
    aktifSinav: MatSinav | null;
    setAktifSinav: (sinav: MatSinav | null) => void;

    // Generating
    isGenerating: boolean;
    setIsGenerating: (v: boolean) => void;

    // Geçmiş (localStorage persist)
    sinavGecmisi: MatSinav[];
    addSinavGecmisi: (sinav: MatSinav) => void;
    removeSinavGecmisi: (id: string) => void;
    clearSinavGecmisi: () => void;

    // Reset
    reset: () => void;
}

const defaultAyarlar: MatSinavAyarlari = {
    sinif: null,
    secilenUniteler: [],
    secilenKazanimlar: [],
    soruDagilimi: {
        coktan_secmeli: 4,
        dogru_yanlis: 2,
        bosluk_doldurma: 2,
        acik_uclu: 1,
    },
    zorlukSeviyesi: 'Otomatik',
    islemSayisi: undefined,
    gorselVeriEklensinMi: false,
    ozelTalimatlar: undefined,
    ozelKonu: undefined,
    isLgsMode: false,
};

// localStorage'dan geçmişi yükle
function loadGecmis(): MatSinav[] {
    try {
        const raw = localStorage.getItem('mat_sinav_gecmisi');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveGecmis(gecmis: MatSinav[]) {
    try {
        localStorage.setItem('mat_sinav_gecmisi', JSON.stringify(gecmis.slice(0, 50)));
    } catch {
        // Storage quota — sessizce yoksay
    }
}

export const useMatSinavStore = create<MatSinavStoreState>((set, get) => ({
    ayarlar: defaultAyarlar,
    aktifSinav: null,
    isGenerating: false,
    sinavGecmisi: loadGecmis(),

    setAyarlar: (partial) =>
        set((s) => ({ ayarlar: { ...s.ayarlar, ...partial } })),

    setSinif: (sinif) =>
        set((s) => ({
            ayarlar: {
                ...s.ayarlar,
                sinif,
                secilenUniteler: [],
                secilenKazanimlar: [],
            },
        })),

    setSecilenUniteler: (uniteler) =>
        set((s) => ({ ayarlar: { ...s.ayarlar, secilenUniteler: uniteler } })),

    setSecilenKazanimlar: (kazanimlar) =>
        set((s) => ({ ayarlar: { ...s.ayarlar, secilenKazanimlar: kazanimlar } })),

    setSoruDagilimi: (tip, sayi) =>
        set((s) => ({
            ayarlar: {
                ...s.ayarlar,
                soruDagilimi: { ...s.ayarlar.soruDagilimi, [tip]: sayi },
            },
        })),

    setAktifSinav: (sinav) => set({ aktifSinav: sinav }),
    setIsGenerating: (v) => set({ isGenerating: v }),

    addSinavGecmisi: (sinav) => {
        const gecmis = [sinav, ...get().sinavGecmisi].slice(0, 50);
        saveGecmis(gecmis);
        set({ sinavGecmisi: gecmis });
    },

    removeSinavGecmisi: (id) => {
        const gecmis = get().sinavGecmisi.filter((s: unknown) => s.id !== id);
        saveGecmis(gecmis);
        set({ sinavGecmisi: gecmis });
    },

    clearSinavGecmisi: () => {
        saveGecmis([]);
        set({ sinavGecmisi: [] });
    },

    reset: () =>
        set({
            ayarlar: defaultAyarlar,
            aktifSinav: null,
            isGenerating: false,
        }),
}));
