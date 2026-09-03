/**
 * MatProblemStudyosu — Matematik Problem Stüdyosu Tip Tanımları
 * Tamamen bağımsız modül — mevcut matSinav.ts'ye dokunmaz
 * Sadece açık uçlu gerçek yaşam matematik problemleri
 * MEB 2024-2025 Matematik Müfredatı (1-8. Sınıf)
 */

import type { MatOgrenmeAlani, MatKazanim, MatUnite, MatSinifMufredati, GrafikVerisi, MatZorluk } from './matSinav';

// Re-export ortak tipleri (müfredat yapısı aynı kalır)
export type { MatOgrenmeAlani, MatKazanim, MatUnite, MatSinifMufredati, GrafikVerisi, MatZorluk };

// ─── Problem Kategorisi ───────────────────────────────────────
export type ProblemKategorisi =
    | 'gercek-yasam'
    | 'beceri-temelli'
    | 'lgs-pisa'
    | 'cok-adimli';

// ─── Font Ayarları ────────────────────────────────────────────
export type ProblemFontAilesi = 'Lexend' | 'OpenDyslexic' | 'Inter' | 'Times New Roman';
export type ProblemFontBoyutu = '9pt' | '10pt' | '11pt' | '12pt';
export type ProblemKenarBoslugu = 'dar' | 'orta' | 'genis';
export type ProblemSutunDuzeni = 'tek' | 'cift';
export type ProblemMetinHizalama = 'left' | 'justify';
export type ProblemSatirAraligi = 'siki' | 'normal' | 'ayrik';

// ─── Dizgi Ayarları ───────────────────────────────────────────
export interface ProblemDizgiAyarlari {
    fontAilesi: ProblemFontAilesi;
    fontBoyutu: ProblemFontBoyutu;
    kenarBoslugu: ProblemKenarBoslugu;
    sutunDuzeni: ProblemSutunDuzeni;
    metinHizalama: ProblemMetinHizalama;
    satirAraligi: ProblemSatirAraligi;
}

// ─── Tek Problem ──────────────────────────────────────────────
export interface MatProblem {
    id: string;
    soruMetni: string;
    verilenler: string[];
    istenenler: string;
    cozumAdimlari: string[];
    dogruCevap: string;
    altSorular?: string[];
    altCevaplar?: string[];
    gercekYasamBaglantisi: string;
    zorluk: MatZorluk;
    kazanimKodu: string;
    kazanimMetni?: string;
    sinif?: number;
    unite_adi?: string;
    kategori: ProblemKategorisi;
    puan: number;
    tahminiSure: number; // saniye
    isDuzenlenmisMi?: boolean;
}

// ─── Cevap Anahtarı ───────────────────────────────────────────
export interface MatProblemCevapAnahtari {
    problemler: {
        problemNo: number;
        dogruCevap: string;
        puan: number;
        kazanimKodu: string;
        cozumAdimlari: string[];
        gercekYasamBaglantisi?: string;
        seviye: MatZorluk;
    }[];
}

// ─── Problem Seti (Çalışma Kâğıdı) ───────────────────────────
export interface MatProblemSeti {
    id: string;
    baslik: string;
    sinif: number;
    secilenKazanimlar: string[];
    problemler: MatProblem[];
    toplamPuan: number;
    tahminiSure: number; // saniye
    olusturmaTarihi: string;
    olusturanKullanici: string;
    cevapAnahtari: MatProblemCevapAnahtari;
    dizgiAyarlari: ProblemDizgiAyarlari;
}

// ─── Problem Ayarları (UI State) ──────────────────────────────
export interface MatProblemAyarlari {
    sinif: number | null;
    secilenUniteler: string[];
    secilenKazanimlar: string[];
    problemSayisi: number;
    zorlukSeviyesi: 'Otomatik' | 'Kolay' | 'Orta' | 'Zor';
    ozelTalimatlar?: string;
    ozelKonu?: string;
    kategori: ProblemKategorisi;
    verilenlerGosterilsinMi: boolean;
    cozumKutusuGosterilsinMi: boolean;
    isLgsMode?: boolean;
}

// ─── API Response ─────────────────────────────────────────────
export interface MatProblemGenerationResponse {
    success: boolean;
    data?: MatProblemSeti;
    error?: {
        message: string;
        code: string;
    };
    timestamp: string;
}
