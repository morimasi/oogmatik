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
  secenekler?: string[];      // Çoktan seçmeli için (diğer tiplerde tanımsız)
  dogruCevap: string | number; // Cevap indeksi veya metin
  kazanimKodu: string;        // İlgili MEB kazanım kodu
  puan: number;
  tahminiSure: number;        // Saniye cinsinden
  aciklama?: string;          // Öğretmene yönelik çözüm açıklaması (öğrenci kâğıdında gösterilmez)
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
  /** Öğretmene "neden" açıklaması (AI aktivitesinde zorunlu). */
  pedagogicalNote?: string;

}

// Cevap Anahtarı — tek satır (tanı bilgisi ASLA eklenemez, KVKK)
export interface CevapAnahtariSorusu {
  soruNo: number;
  dogruCevap: string;
  puan: number;
  kazanimKodu: string;
}

// Cevap Anahtarı
export interface CevapAnahtari {
  sorular: CevapAnahtariSorusu[];
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
  columns: 2,
  marginMm: 18,
  questionSpacingMm: 8,
  lineHeight: 1.6,
  textAlign: 'left',
};

// Soru aralığı sınırları (mm) — SoruAyarlari kaydırıcısı ile aynı aralık
export const MIN_QUESTION_SPACING_MM = 4;
export const MAX_QUESTION_SPACING_MM = 14;

// --- unknown + type guard yardımcıları (any yasak) ---

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Soru aralığını 4–14mm bandına sabitler; geçersiz girdide varsayılanı döner. */
export function clampQuestionSpacingMm(value: unknown): number {
  const fallback = DEFAULT_PRINT_CONFIG.questionSpacingMm;
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  if (value < MIN_QUESTION_SPACING_MM) return MIN_QUESTION_SPACING_MM;
  if (value > MAX_QUESTION_SPACING_MM) return MAX_QUESTION_SPACING_MM;
  return value;
}

/** Sütun değerini 1|2 bandına sabitler; geçersiz girdide varsayılanı döner. */
export function clampColumns(value: unknown): 1 | 2 {
  return value === 1 ? 1 : value === 2 ? 2 : DEFAULT_PRINT_CONFIG.columns;
}

/** Bilinmeyen kaynaktan (localStorage, API, hydration) güvenli PrintConfig üretir. */
export function normalizePrintConfig(input: unknown): PrintConfig {
  if (!isRecord(input)) return { ...DEFAULT_PRINT_CONFIG };
  return {
    fontSize: typeof input.fontSize === 'number' && Number.isFinite(input.fontSize) ? input.fontSize : DEFAULT_PRINT_CONFIG.fontSize,
    fontFamily: input.fontFamily === 'times' ? 'times' : input.fontFamily === 'helvetica' ? 'helvetica' : DEFAULT_PRINT_CONFIG.fontFamily,
    columns: clampColumns(input.columns),
    marginMm: typeof input.marginMm === 'number' && Number.isFinite(input.marginMm) ? input.marginMm : DEFAULT_PRINT_CONFIG.marginMm,
    questionSpacingMm: clampQuestionSpacingMm(input.questionSpacingMm),
    lineHeight: typeof input.lineHeight === 'number' && Number.isFinite(input.lineHeight) ? input.lineHeight : DEFAULT_PRINT_CONFIG.lineHeight,
    textAlign: input.textAlign === 'justify' ? 'justify' : input.textAlign === 'left' ? 'left' : DEFAULT_PRINT_CONFIG.textAlign,
  };
}

/** Soru şekil denetimi — AI/hydration çıktısı doğrulanmadan render edilmez. */
export function isSoru(value: unknown): value is Soru {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.tip === 'string' &&
    typeof value.zorluk === 'string' &&
    typeof value.soruMetni === 'string' &&
    (typeof value.dogruCevap === 'string' || typeof value.dogruCevap === 'number') &&
    typeof value.kazanimKodu === 'string' &&
    typeof value.puan === 'number' &&
    typeof value.tahminiSure === 'number'
  );
}

/** Sınav şekil denetimi — hydration ve API yanıtları için. */
export function isSinav(value: unknown): value is Sinav {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.baslik === 'string' &&
    typeof value.sinif === 'number' &&
    Array.isArray(value.sorular) &&
    (value.sorular as unknown[]).every(isSoru) &&
    typeof value.toplamPuan === 'number' &&
    typeof value.tahminiSure === 'number' &&
    typeof value.olusturmaTarihi === 'string' &&
    typeof value.olusturanKullanici === 'string'
  );
}

/** Cevap anahtarı satırı şekil denetimi. */
export function isCevapAnahtariSorusu(value: unknown): value is CevapAnahtariSorusu {
  if (!isRecord(value)) return false;
  return (
    typeof value.soruNo === 'number' &&
    typeof value.dogruCevap === 'string' &&
    typeof value.puan === 'number' &&
    typeof value.kazanimKodu === 'string'
  );
}

/** Soru.dogruCevap (string|number) değerini cevap anahtarı metnine çevirir. */
export function normalizeDogruCevap(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

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
