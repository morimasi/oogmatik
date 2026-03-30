/**
 * MatSinavStudyosu - Matematik Sınav Tip Tanımları
 * Tamamen bağımsız modül — mevcut sinav.ts'ye dokunmaz
 * MEB 2024-2025 Matematik Müfredatı
 */

// ─── Öğrenme Alanları ─────────────────────────────────────────
export type MatOgrenmeAlani =
    | 'Sayılar ve İşlemler'
    | 'Geometri'
    | 'Geometri ve Ölçme'
    | 'Ölçme'
    | 'Veri İşleme'
    | 'Cebir'
    | 'Olasılık';

// ─── Grafik Veri Tipleri ──────────────────────────────────────
export type GrafikVeriTipi =
    | 'siklik_tablosu'
    | 'sutun_grafigi'
    | 'pasta_grafigi'
    | 'cizgi_grafigi'
    | 'ucgen'
    | 'kare'
    | 'dikdortgen'
    | 'daire'
    | 'dogru_parcasi'
    | 'aci'
    | 'koordinat_sistemi'
    | 'sayi_dogrusu'
    | 'kesir_modeli'
    | 'simetri';

// ─── Grafik Verisi ────────────────────────────────────────────
export interface GrafikVerisi {
    tip: GrafikVeriTipi;
    baslik: string;
    veri: Array<{
        etiket: string;
        deger?: number;
        nesne?: string;
        birim?: string;
        x?: number;
        y?: number;
    }>;
    not?: string;
    /** Geometrik şekiller için ek özellikler */
    ozellikler?: {
        kenarlar?: number[];
        acilar?: number[];
        yaricap?: number;
        birim?: string;
        renk?: string;
    };
}

// ─── Soru Tipleri ─────────────────────────────────────────────
export type MatSoruTipi =
    | 'coktan_secmeli'
    | 'dogru_yanlis'
    | 'bosluk_doldurma'
    | 'acik_uclu';

// ─── Zorluk Seviyeleri ────────────────────────────────────────
export type MatZorluk = 'Kolay' | 'Orta' | 'Zor';

// ─── Tek Soru ─────────────────────────────────────────────────
export interface MatSoru {
    id: string;
    tip: MatSoruTipi;
    zorluk: MatZorluk;
    soruMetni: string;
    secenekler?: { A: string; B: string; C: string; D: string };
    dogruCevap: string;
    kazanimKodu: string;
    kazanimMetni?: string;
    puan: number;
    tahminiSure: number; // saniye
    grafik_verisi?: GrafikVerisi;
    gercek_yasam_baglantisi: string;
    cozum_anahtari: string;
    yanlis_secenek_tipleri?: string[];
    /** Inline editing — düzenlenmiş mi? */
    isDuzenlenmisMi?: boolean;
}

// ─── Cevap Anahtarı ───────────────────────────────────────────
export interface MatCevapAnahtari {
    sorular: {
        soruNo: number;
        dogruCevap: string;
        puan: number;
        kazanimKodu: string;
        cozumAciklamasi?: string;
        gercekYasamBaglantisi?: string;
        seviye: MatZorluk;
    }[];
}

// ─── Sınav ────────────────────────────────────────────────────
export interface MatSinav {
    id: string;
    baslik: string;
    sinif: number;
    secilenKazanimlar: string[];
    sorular: MatSoru[];
    toplamPuan: number;
    tahminiSure: number; // saniye
    olusturmaTarihi: string;
    olusturanKullanici: string;
    pedagogicalNote: string; // ZORUNLU
    cevapAnahtari: MatCevapAnahtari;
}

// ─── Sınav Ayarları (UI State) ────────────────────────────────
export interface MatSinavAyarlari {
    sinif: number | null;
    secilenUniteler: string[];
    secilenKazanimlar: string[];
    soruDagilimi: {
        coktan_secmeli: number;
        dogru_yanlis: number;
        bosluk_doldurma: number;
        acik_uclu: number;
    };
    zorlukSeviyesi: 'Otomatik' | 'Kolay' | 'Orta' | 'Zor';
    islemSayisi?: number; // 1, 2, 3+
    gorselVeriEklensinMi: boolean;
    ozelTalimatlar?: string;
    ozelKonu?: string;
}

// ─── MEB Kazanım Yapısı ───────────────────────────────────────
export interface MatKazanim {
    kod: string;
    tanim: string;
}

export interface MatUnite {
    id: string;
    baslik: string;
    ogrenmeAlani: MatOgrenmeAlani;
    kazanimlar: MatKazanim[];
}

export interface MatSinifMufredati {
    sinif: number;
    uniteler: MatUnite[];
}

// ─── API Response ─────────────────────────────────────────────
export interface MatSinavGenerationResponse {
    success: boolean;
    data?: MatSinav;
    error?: {
        message: string;
        code: string;
    };
    timestamp: string;
}
