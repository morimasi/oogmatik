/**
 * Super Türkçe Sınav Stüdyosu - Type Definitions
 * MEB 2024-2025 Müfredat Entegrasyonu
 */

// MEB Öğrenme Alanları
export type MEBOgrenmeAlani =
  | 'Dinleme/İzleme'
  | 'Konuşma'
  | 'Okuma'
  | 'Yazma'
  | 'Dil Bilgisi';

// MEB Kazanım Yapısı
export interface MEBKazanim {
  kod: string;              // Örn: "T.5.3.7"
  sinif: number;            // 4-9 arası
  ogrenmeAlani: MEBOgrenmeAlani;
  tanim: string;            // "Okuduğu metindeki ana fikri belirler."
  unite: string;            // "Ünite 3: Dünya ve Uzayı Keşfediyorum"
}

// Ünite Yapısı
export interface MEBUnite {
  id: string;               // "unite-5-3"
  sinif: number;
  uniteNo: number;
  baslik: string;           // "Dünya ve Uzayı Keşfediyorum"
  kazanimlar: MEBKazanim[];
}

// Sınıf Müfredatı
export interface MEBSinifMufredati {
  sinif: number;
  uniteler: MEBUnite[];
}

// Soru Tipleri
export type SoruTipi =
  | 'coktan-secmeli'
  | 'dogru-yanlis-duzeltme'
  | 'bosluk-doldurma'
  | 'acik-uclu';

// Zorluk Seviyeleri
export type Zorluk = 'Kolay' | 'Orta' | 'Zor';

// Tek Soru
export interface Soru {
  id: string;
  tip: SoruTipi;
  zorluk: Zorluk;
  soruMetni: string;
  secenekler?: string[];      // Çoktan seçmeli için
  dogruCevap: string | number; // Cevap indeksi veya metin
  kazanimKodu: string;        // İlgili MEB kazanım kodu
  puan: number;
  tahminiSure: number;        // Saniye cinsinden
}

// Sınav
export interface Sinav {
  id: string;
  baslik: string;
  sinif: number;
  secilenKazanimlar: string[]; // Kazanım kodları array
  sorular: Soru[];
  toplamPuan: number;
  tahminiSure: number;
  olusturmaTarihi: string;
  olusturanKullanici: string;
  cevapAnahtari: CevapAnahtari;
}

// Cevap Anahtarı
export interface CevapAnahtari {
  sorular: {
    soruNo: number;
    dogruCevap: string;
    puan: number;
    kazanimKodu: string;
  }[];
}

// Sınav Ayarları (UI State)
export interface SinavAyarlari {
  sinif: number | null;
  secilenUniteler: string[];      // Ünite ID'leri
  secilenKazanimlar: string[];    // Kazanım kodları
  soruDagilimi: {
    'coktan-secmeli': number;
    'dogru-yanlis-duzeltme': number;
    'bosluk-doldurma': number;
    'acik-uclu': number;
  };
  zorlukDagilimi: {
    'Kolay': number;
    'Orta': number;
    'Zor': number;
  };
  ozelKonu?: string;              // Opsiyonel tema (örn: "Uzay keşfi")
}

// Yazdırma Ayarları
export interface PrintConfig {
  fontSize: number;       // 9 | 10 | 11 | 12
  fontFamily: 'helvetica' | 'times';
  columns: 1 | 2;
  marginMm: number;       // 10 | 15 | 20 | 25
  questionSpacingMm: number; // 6 | 8 | 10 | 14
  lineHeight: number;     // 1.4 | 1.6 | 1.8
  textAlign: 'left' | 'justify';
}

export const DEFAULT_PRINT_CONFIG: PrintConfig = {
  fontSize: 10,
  fontFamily: 'helvetica',
  columns: 1,
  marginMm: 18,
  questionSpacingMm: 8,
  lineHeight: 1.6,
  textAlign: 'left',
};

// API Response Types
export interface SinavGenerationResponse {
  success: boolean;
  data?: Sinav;
  error?: {
    message: string;
    code: string;
  };
  timestamp: string;
}
