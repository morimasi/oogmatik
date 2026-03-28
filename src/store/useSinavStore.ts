/**
 * Super Türkçe Sınav Stüdyosu - Zustand Store
 * State management for exam creation workflow
 */

import { create } from 'zustand';
import { SinavAyarlari, Sinav } from '../types/sinav';

interface SinavStoreState {
  // Ayarlar
  ayarlar: SinavAyarlari;
  setAyarlar: (ayarlar: Partial<SinavAyarlari>) => void;

  // Sınıf seçimi
  setSinif: (sinif: number) => void;

  // Ünite seçimi
  setSecilenUniteler: (uniteler: string[]) => void;

  // Kazanım seçimi
  setSecilenKazanimlar: (kazanimlar: string[]) => void;

  // Soru dağılımı
  setSoruDagilimi: (tip: keyof SinavAyarlari['soruDagilimi'], sayi: number) => void;

  // Üretilmiş sınav
  aktifSinav: Sinav | null;
  setAktifSinav: (sinav: Sinav | null) => void;

  // Generating state
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;

  // Kaydedilmiş sınavlar
  kaydedilmisSinavlar: Sinav[];
  addKaydedilmisSinav: (sinav: Sinav) => void;

  // Reset
  reset: () => void;
}

const defaultAyarlar: SinavAyarlari = {
  sinif: null,
  secilenUniteler: [],
  secilenKazanimlar: [],
  soruDagilimi: {
    'coktan-secmeli': 2,
    'dogru-yanlis-duzeltme': 1,
    'bosluk-doldurma': 1,
    'acik-uclu': 0
  },
  zorlukDagilimi: {
    'Kolay': 2,
    'Orta': 2,
    'Zor': 0
  },
  ozelKonu: undefined
};

export const useSinavStore = create<SinavStoreState>((set) => ({
  ayarlar: defaultAyarlar,
  aktifSinav: null,
  isGenerating: false,
  kaydedilmisSinavlar: [],

  setAyarlar: (partial) =>
    set((state) => ({
      ayarlar: { ...state.ayarlar, ...partial }
    })),

  setSinif: (sinif) =>
    set((state) => ({
      ayarlar: {
        ...state.ayarlar,
        sinif,
        secilenUniteler: [],
        secilenKazanimlar: []
      }
    })),

  setSecilenUniteler: (uniteler) =>
    set((state) => ({
      ayarlar: { ...state.ayarlar, secilenUniteler: uniteler }
    })),

  setSecilenKazanimlar: (kazanimlar) =>
    set((state) => ({
      ayarlar: { ...state.ayarlar, secilenKazanimlar: kazanimlar }
    })),

  setSoruDagilimi: (tip, sayi) =>
    set((state) => ({
      ayarlar: {
        ...state.ayarlar,
        soruDagilimi: {
          ...state.ayarlar.soruDagilimi,
          [tip]: sayi
        }
      }
    })),

  setAktifSinav: (sinav) => set({ aktifSinav: sinav }),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  addKaydedilmisSinav: (sinav) =>
    set((state) => ({
      kaydedilmisSinavlar: [sinav, ...state.kaydedilmisSinavlar]
    })),

  reset: () =>
    set({
      ayarlar: defaultAyarlar,
      aktifSinav: null,
      isGenerating: false
    })
}));
