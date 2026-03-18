// =============================================================================
// ActivityFormat Tip Sistemi
// Her bir etkinlik bileşeninin tanımlı tip yapısı.
// Kategori, ikonlar, açıklamalar ve render ayarları bu tip üzerinden taşınır.
// =============================================================================

// 6 Ana Stüdyo Kategorisi
export type StudioCategory =
  | 'okuma_anlama'
  | 'mantik_muhakeme'
  | 'dil_bilgisi'
  | 'yazim_noktalama'
  | 'soz_varligi'
  | 'ses_olaylari';

// Bir etkinlik bileşeninin ince ayarlarını betimleyen tanım
export interface SettingDef {
  key: string; // Store'a aktarılacak ayar anahtarı
  label: string; // UI'da görünecek etiket
  type: 'number' | 'select' | 'toggle' | 'range'; // Ayar widget tipi
  defaultValue: number | string | boolean;
  options?: string[]; // type: 'select' için seçenekler
  min?: number; // type: 'range' / 'number' için
  max?: number;
  step?: number;
}

// Bir etkinlik formatının (bileşenin) tam tanımı
export interface ActivityFormatDef {
  id: string; // 'N5K1_HABER', 'SEBEP_SONUC', vb.
  category: StudioCategory; // Hangi alt stüdyoya ait
  icon: string; // FontAwesome class adı
  label: string; // UI'da görünecek isim
  description: string; // Kısa açıklama
  difficulty: 'all' | 'easy' | 'medium' | 'hard' | 'lgs'; // Uyumlu zorluk seviyeleri
  settings: SettingDef[]; // Ultra ince ayarlar listesi
  // Google Gen AI Schema Formatı (Opsiyonel ama önerilir)
  schema?: any;
  // Hızlı Motor: ayarları alır → JSON içerik döndürür
  fastGenerate: (
    settings: Record<string, any>,
    grade: number | null,
    topic: string
  ) => Record<string, any>;
  // AI Prompt Builder: ayarları alır → Gemini'ye gönderilecek prompt döndürür
  buildAiPrompt: (settings: Record<string, any>, grade: number | null, topic: string) => string;
}
