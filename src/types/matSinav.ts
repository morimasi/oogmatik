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
  | 'cetele_tablosu'
  | 'sutun_grafigi'
  | 'pasta_grafigi'
  | 'cizgi_grafigi'
  | 'ucgen'
  | 'dik_ucgen'
  | 'kare'
  | 'dikdortgen'
  | 'paralel_kenar'
  | 'cokgen'
  | 'daire'
  | 'dogru_parcasi'
  | 'aci'
  | 'koordinat_sistemi'
  | 'koordinat_grafigi'
  | 'sayi_dogrusu'
  | 'kesir_modeli'
  | 'simetri'
  | 'venn_diyagrami'
  | 'olaslik_cark';

// ─── Grafik Veri Ögesi ────────────────────────────────────────
export interface GrafikVeriOgesi {
  etiket: string;
  deger?: number;
  nesne?: string;
  birim?: string;
  x?: number;
  y?: number;
}

// ─── Grafik Verisi ────────────────────────────────────────────
export interface GrafikVerisi {
  tip: GrafikVeriTipi | string;
  baslik: string;
  veri: GrafikVeriOgesi[];
  not?: string;
  x?: number;
  y?: number;
  /** Geometrik şekiller için ek özellikler */
  ozellikler?: {
    kenarlar?: number[];
    acilar?: number[];
    yaricap?: number;
    birim?: string;
    renk?: string;
    kenarSayisi?: number;
    etiketler?: string[];
  };
}

// ─── Soru Tipleri ─────────────────────────────────────────────
export type MatSoruTipi = 'coktan_secmeli' | 'dogru_yanlis' | 'bosluk_doldurma' | 'acik_uclu';

// ─── Zorluk Seviyeleri ────────────────────────────────────────
export type MatZorluk = 'Kolay' | 'Orta' | 'Zor';

// ─── Tek Soru ─────────────────────────────────────────────────
export interface MatSoru {
  // ─── Sistem ve UI Alanları ────────────────────────────────────
  id: string;
  puan: number;
  tahminiSure: number; // saniye
  kazanimMetni?: string;
  /** Inline editing — düzenlenmiş mi? */
  isDuzenlenmisMi?: boolean;

  // ─── Geriye Dönük Uyumluluk (Eski Alanlar) ────────────────────
  tip: MatSoruTipi | string;
  zorluk: MatZorluk | string;
  soruMetni: string;
  dogruCevap: string;
  kazanimKodu: string;

  // ─── Yeni AI JSON Şeması (Bölüm 4) ────────────────────────────
  sinif?: number;
  unite_adi?: string;
  kazanim_kodu?: string;
  soru_tipi?: string;
  soru_metni?: string;
  dogru_cevap?: string;
  seviye?: string;

  secenekler?: { A: string; B: string; C: string; D: string };
  grafik_verisi?: GrafikVerisi;
  gercek_yasam_baglantisi: string;
  cozum_anahtari: string;
  yanlis_secenek_tipleri?: string[];
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
  isLgsMode?: boolean; // Yeni Nesil LGS Denemesi Modu
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
