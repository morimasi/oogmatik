/**
 * worksheetActivity.ts
 * Etkinlik Oluşturucu Stüdyosu — Çalışma kağıdı etkinlik tipleri
 * 
 * Bora Demir standardı: TypeScript strict, any yasak.
 * Elif Yıldız onaylı: pedagogicalNote zorunlu, ZPD uyumu.
 * Dr. Ahmet Kaya onaylı: Tanı koyucu dil yok, KVKK uyumu.
 */

// ── Etkinlik Şablon Türleri ──────────────────────────────────────────────────

export type WorksheetTemplateType =
  // Görsel & Mekansal
  | 'pattern-completion'      // Desen tamamlama
  | 'symmetry-drawing'        // Simetri çizimi
  | 'grid-copy'               // Kare kopyalama
  | 'spot-difference'         // Farkı bul
  | 'word-search-grid'        // Kelime bulmaca
  | 'directional-tracking'    // Yön iz sürme
  | 'shape-counting'          // Şekil sayma
  | 'maze'                    // Labirent
  // Okuduğunu Anlama
  | 'five-w-one-h-questions'  // 5N1K soruları
  | 'true-false'              // Doğru/Yanlış
  | 'fill-in-blanks'          // Boşluk doldurma
  | 'event-sequencing'        // Olay sıralama
  | 'main-idea'               // Ana fikir bulma
  | 'inference'               // Çıkarım yapma
  | 'character-analysis'      // Karakter analizi
  | 'cause-effect-matching'   // Neden-sonuç eşleştirme
  // Okuma & Dil
  | 'syllable-splitting'      // Hece ayırma
  | 'syllable-combining'      // Hece birleştirme
  | 'synonym-matching'        // Eş anlamlı eşleştirme
  | 'antonym-matching'        // Zıt anlamlı eşleştirme
  | 'root-suffix-analysis'    // Kök-ek ayrıştırma
  | 'sentence-elements'       // Cümle ögesi bulma
  | 'word-type-classification'// Kelime türü sınıflandırma
  | 'spelling-rules'          // Yazım kuralları
  // Matematik & Mantık
  | 'number-pyramid'          // Sayı piramidi
  | 'operation-boxes'         // İşlem kutuları
  | 'simple-sudoku'           // Basit sudoku
  | 'clock-reading'           // Saat okuma
  | 'money-calculation'       // Para hesaplama
  | 'sequence-pattern'        // Sıralama/örüntü
  | 'graph-reading'           // Grafik okuma
  | 'word-problem';           // Problem çözme

// ── Cevap Alanı Türleri ──────────────────────────────────────────────────────

export type AnswerAreaType =
  | 'blank-line'              // Alt çizgili boş satır (yazma)
  | 'blank-box'               // Boş kutu (sayı/harf yazma)
  | 'grid'                    // Çizilebilir grid (desen/simetri/sudoku)
  | 'matching-lines'          // Eşleştirme çizgileri (2 kolon)
  | 'multiple-choice'         // A/B/C/D seçenekleri
  | 'true-false-check'        // Doğru/Yanlış işaretleme
  | 'classification-table'    // Sınıflandırma tablosu
  | 'numbering'               // Sıra numarası kutuları
  | 'drawing-area'            // Serbest çizim alanı
  | 'circle-mark';            // Daire ile işaretleme

// ── Cevap Alanı Yapısı ───────────────────────────────────────────────────────

export interface AnswerArea {
  type: AnswerAreaType;
  /** Cevap alanının genişliği (karakter veya px) */
  width?: number;
  /** Satır sayısı (blank-line için) */
  lines?: number;
  /** Grid boyutu (grid için) */
  gridSize?: { rows: number; cols: number };
  /** Önceden dolu hücreler (grid/sudoku için) */
  prefilled?: Record<string, string>;
}

// ── Etkinlik Bölümü ──────────────────────────────────────────────────────────

export interface WorksheetSection {
  /** Bölüm ID'si */
  id: string;
  /** Soru/madde numarası */
  order: number;
  /** Yönerge metni (öğrenciye) */
  instruction: string;
  /** Ana içerik (soru metni, kelime listesi, metin, vb.) */
  content: string;
  /** Opsiyonel ek veri (seçenekler, kelime havuzu, grid verisi vb.) */
  options?: string[];
  /** Eşleştirme ikilileri */
  matchingPairs?: Array<{ left: string; right: string }>;
  /** Grid verileri (satır × sütun matris) */
  gridData?: string[][];
  /** Cevap alanı tanımı */
  answerArea: AnswerArea;
  /** Doğru cevap (öğretmen cevap anahtarı için) */
  correctAnswer?: string | string[];
}

// ── Etkinlik Ana Yapısı ──────────────────────────────────────────────────────

export interface WorksheetActivityData {
  /** Etkinlik başlığı */
  title: string;
  /** Etkinlik genel yönergesi */
  generalInstruction: string;
  /** Şablon türü */
  templateType: WorksheetTemplateType;
  /** Kategori */
  category: WorksheetActivityCategory;
  /** Etkinlik bölümleri (sorular/maddeler) */
  sections: WorksheetSection[];
  /** Pedagojik not (öğretmen için) — ZORUNLU */
  pedagogicalNote: string;
  /** Zorluk seviyesi */
  difficultyLevel: 'Kolay' | 'Orta' | 'Zor';
  /** Hedef beceriler */
  targetSkills: string[];
  /** Yaş grubu */
  ageGroup: '5-7' | '8-10' | '11-13' | '14+';
  /** Öğrenme profili */
  profile: 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed' | 'general';
  /** Tahmini süre (dakika) */
  estimatedDuration: number;
  /** Üretim modu */
  generationMode: 'ai' | 'offline';
  /** Cevap anahtarı dahil mi? */
  hasAnswerKey: boolean;
}

// ── Kategori Türleri ─────────────────────────────────────────────────────────

export type WorksheetActivityCategory =
  | 'ws-visual-spatial'         // Görsel & Mekansal
  | 'ws-reading-comprehension'  // Okuduğunu Anlama
  | 'ws-language-literacy'      // Okuma & Dil
  | 'ws-math-logic';            // Matematik & Mantık

// ── Şablon Metadata ──────────────────────────────────────────────────────────

export interface WorksheetTemplateMeta {
  id: WorksheetTemplateType;
  categoryId: WorksheetActivityCategory;
  title: string;
  description: string;
  /** Öğrenci ne yapar? (kısa açıklama) */
  studentAction: string;
  icon: string; // Lucide icon name
  /** Offline üretilebilir mi? */
  supportsOffline: boolean;
  /** AI ile üretilebilir mi? */
  supportsAI: boolean;
  /** Varsayılan bölüm (soru) sayısı */
  defaultSectionCount: number;
}

// ── Üretici Parametre Tipi ───────────────────────────────────────────────────

export interface WorksheetGeneratorParams {
  /** Konu/bağlam */
  topic: string;
  /** Yaş grubu */
  ageGroup: '5-7' | '8-10' | '11-13' | '14+';
  /** Öğrenme profili */
  profile: 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed' | 'general';
  /** Zorluk seviyesi */
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  /** Soru/madde sayısı */
  sectionCount: number;
  /** Üretim modu */
  mode: 'ai' | 'offline';
}

// ── Üretici Fonksiyon Tipi ───────────────────────────────────────────────────

export type WorksheetGeneratorFn = (
  params: WorksheetGeneratorParams
) => Promise<WorksheetActivityData>;
