/**
 * MatProblemStudyosu — Matematik Problem Stüdyosu Tip Tanımları
 * Tamamen bağımsız modül — mevcut matSinav.ts'ye dokunmaz
 * Sadece açık uçlu gerçek yaşam matematik problemleri
 * MEB 2024-2025 Matematik Müfredatı (1-8. Sınıf)
 */

import type { MatOgrenmeAlani, MatKazanim, MatUnite, MatSinifMufredati, GrafikVerisi, MatZorluk } from './matSinav';

// Re-export ortak tipleri (müfredat yapısı aynı kalır)
export type { MatOgrenmeAlani, MatKazanim, MatUnite, MatSinifMufredati, GrafikVerisi, MatZorluk };

// ─── Problem Şema Türleri ─────────────────────────────────────
export type ProblemSemaTipi =
    | 'otomatik'
    | 'kutu-modeli'
    | 'sayı-doğrusu'
    | 'tablo'
    | 'grafik'
    | 'denklem-şeması'
    | 'çizim-alanı'
    | 'parça-bütün'
    | 'oran-orantı'
    | 'kesir-blokları'
    | 'geometrik-sekil'
    | 'zaman-tüneli'
    | 'para-matrisi'
    | 'yok';

// ─── Problem Kategorisi ───────────────────────────────────────
export type ProblemKategorisi =
    | 'gercek-yasam'
    | 'beceri-temelli'
    | 'sema-destekli'
    | 'lgs-pisa'
    | 'cok-adimli';

// ─── Font Ayarları ────────────────────────────────────────────
export type ProblemFontAilesi = 'Lexend' | 'Inter' | 'Times New Roman';
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
    gercekYasamBaglantisi: string;
    zorluk: MatZorluk;
    kazanimKodu: string;
    kazanimMetni?: string;
    sinif?: number;
    unite_adi?: string;
    semaTipi: ProblemSemaTipi;
    semaVerisi?: {
        sekilTipi?: string;
        etiketler?: Record<string, string>;
        kesirOrani?: { pay: number; paydaya: number; etiket?: string };
        zamanAkisi?: { baslangic: string; bitis: string; gecenSure?: string };
        paraMatrisi?: { verilen: string; tutar: string; paraUstu: string };
        kutuModeli?: { parcaA: string; parcaB: string; toplam: string };
        denklemSol?: string;
        denklemSag?: string;
        grafikSutunlari?: { etiket: string; deger: number }[];
    };
    kategori: ProblemKategorisi;
    grafikVerisi?: GrafikVerisi;
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
    gorselVeriEklensinMi: boolean;
    ozelTalimatlar?: string;
    ozelKonu?: string;
    kategori: ProblemKategorisi;
    semaTipiTercihi: ProblemSemaTipi;
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
