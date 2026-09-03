/**
 * MatProblemStudyosu — Ana Servis
 * Tamamen bağımsız modül — mevcut matSinavService.ts'ye dokunmaz
 * Problem üretimi, offline fallback ve yardımcı fonksiyonlar
 */

import type {
    MatProblemAyarlari,
    MatProblemSeti,
} from '../types/matProblem';
import { generateMathProblems } from './generators/mathProblemGenerator';

import { getMebMufredatBySinif } from '../constants/mebMathCurriculum';

// ─── Müfredat Helper Fonksiyonu ──────────────────────────────────
export const getMatMufredatBySinif = (sinif: number) => {
    const mufredat = getMebMufredatBySinif(sinif);
    if (mufredat) return mufredat;
    return {
        sinif,
        uniteler: [],
    };
};

// ─── Ana Üretim Fonksiyonu (AI + Offline Fallback) ────────────
export const generateMatProblemSeti = async (settings: MatProblemAyarlari): Promise<MatProblemSeti> => {
    try {
        return await generateMathProblems(settings);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn('Gemini API başarısız, fallback olarak zengin offline problemler kullanılıyor:', message);
        // Yeni nesil offline üretici: sınıfa özel ≥3 şablon + MEB kazanım uyumu
        // (sema/görsel yok — tamamen metin tabanlı problemler)
        const { generateOfflineMatProblemSeti } = await import('./offlineGenerators/mathProblemOffline');
        return generateOfflineMatProblemSeti(settings);
    }
};
