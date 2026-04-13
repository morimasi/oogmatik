/**
 * OOGMATIK — OCR Prompt Kütüphanesi
 *
 * Tüm OCR üretim promptlarının merkezi kaynağı.
 * Hem varyasyon hem klonlama akışlarında kullanılır.
 *
 * Elif Yıldız: Her aktivitede pedagogicalNote zorunlu.
 * Bora Demir: any yasak, AppError standardı.
 * Selin Arslan: Gemini 2.5 Flash sabit model.
 */

// ─── OCR ile tespit edilen aktivite tipleri ───────────────────────────────
export type OCRDetectedType =
  | 'MATH_WORKSHEET'
  | 'READING_COMPREHENSION'
  | 'FILL_IN_THE_BLANK'
  | 'MATCHING'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'OTHER';

// ─── Bileşen gereksinimleri ───────────────────────────────────────────────
export interface ComponentRequirements {
  requiresGraphic: boolean;
  requiresTable: boolean;
  requiresAnswerBoxes: boolean;
  requiresWordBank: boolean;
  requiresMatchingColumns: boolean;
  requiresMultipleChoice: boolean;
}

// ─── Yoğunluk ipuçları ───────────────────────────────────────────────────
export interface DensityHints {
  /** Sayfanın doluluk oranı 0-100 */
  densityScore: number;
  /** Tahmini font boyutu (pt) */
  estimatedFontSize: number;
  /** Tahmini satır aralığı */
  estimatedLineHeight: number;
  /** Önerilen sütun sayısı (1-3) */
  recommendedColumns: number;
  /** A4'ü doldurmak için önerilen madde sayısı */
  recommendedItemCount: number;
}

// ─── A4 DOLULUK KURALLARI — her üretim promptuna eklenir ─────────────────

/** Sayfayı dolduracak şekilde kompakt HTML üretimi için zorunlu direktif */
export const A4_COMPACT_INSTRUCTION = `
[A4 SAYFA DOLULUK KURALLARI — ZORUNLU]
Bu direktifler ihlal edilemez:
- Sayfayı %80+ dolulukla doldur — boş alan kalmaz
- Soru sayısı: blueprint'teki kadar veya fazla (minimum 8 madde)
- Font: 11-12px, satır aralığı: 1.3, paragraf arası: 4-6px
- Kenar boşluğu: 8-10mm (minimum)
- 1 sütun yetmiyorsa 2 sütunlu CSS grid kullan (grid-template-columns: 1fr 1fr)
- Her soru bloğu sıkışık fakat okunaklı — margin-bottom: 6px
- Lexend font ZORUNLU — disleksi uyumluluğu için kritik
- Inline style olarak font-family: 'Lexend', sans-serif ekle
- Tablo, grid ve liste yapıları için padding: 4px kullan
`.trim();

// ─── BİLEŞEN KONTROL LİSTESİ ─────────────────────────────────────────────

/** Her üretim promptuna eklenen bileşen kontrol listesi */
export const COMPONENT_CHECKLIST_PROMPT = `
[ETKİNLİK BİLEŞEN KONTROL LİSTESİ]
Aşağıdaki bileşenlerden aktivite tipine uygun olanları HTML içine dahil et:
- ÇOKTAN SEÇMELİ → (A) (B) (C) (D) format, her şık ayrı satırda, border:1px solid #ccc kutucuklu
- BOŞ DOLDURMA → _______ formatında yeterli uzunlukta alt çizgi (min 6 karakter)
- EŞLEŞTİRME → 2 sütun CSS grid layout, sol sütun terimler (numaralı), sağ sütun tanımlar (harfli)
- TABLO → net kenarlı (border:1px solid #999), başlık satırı kalın, hücre padding: 4px
- GRAFİK/ŞEKİL → grafikVeri alanını doldur; GraphicRenderer otomatik render eder
- SORU NUMARALARI → her soru başına 1. 2. 3. numaralama, font-weight:bold
- CEVAP ALANI → açık uçlu sorularda noktalı çizgiler (border-bottom: 1px dotted #999; width:100%)
- KELİME BANKASI → boşluk doldurma varsa üstte border:2px solid #333 kutu içinde kelime listesi
`.trim();

// ─── GÖRSEL ÇIKARIM DİREKTİFİ ────────────────────────────────────────────

/** OCR analiz promptuna eklenen görsel çıkarım talimatı */
export const VISUAL_EXTRACTION_DIRECTIVE = `
[GÖRSEL ÇIKARIM PROTOKOLÜ]
Sayfadaki her grafik, tablo ve geometrik şekil için visualDescriptors dizisine ekle:
- tipi: sutun_grafigi | pasta_grafigi | cizgi_grafigi | tablo | ucgen | dikdortgen |
        daire | koordinat_sistemi | sayi_dogrusu | venn_diyagrami | koordinat_grafigi |
        dogru_parcasi | aci | kesir_modeli | simetri | dik_ucgen | paralel_kenar |
        cokgen | kup | silindir | koni | piramit | nesne_grafigi
- aciklama: Türkçe açıklama (içerik, değerler, boyutlar dahil)
- veri: [ { etiket: string, deger: number, birim?: string } ] — sayısal veriler için
Görsel yoksa visualDescriptors: [] (boş dizi) döndür.
`.trim();

// ─── YOĞUNLUK ANALİZİ DİREKTİFİ ─────────────────────────────────────────

/** OCR analiz promptuna eklenen yoğunluk analizi talimatı */
export const DENSITY_ANALYSIS_DIRECTIVE = `
[YOĞUNLUK ANALİZİ]
Sayfanın doluluk yoğunluğunu analiz et ve densityHints alanını doldur:
- densityScore: Sayfanın %kaçı dolu (0-100, tahmin)
- estimatedFontSize: Tahmini font boyutu (pt cinsinden, örn: 10, 11, 12)
- estimatedLineHeight: Satır aralığı katsayısı (örn: 1.2, 1.4, 1.6)
- recommendedColumns: Aynı yoğunluğu korumak için önerilen sütun sayısı (1-3)
- recommendedItemCount: A4'ü doldurmak için minimum madde/soru sayısı (örn: 8, 10, 12, 15)
`.trim();

// ─── BİLEŞEN GEREKSİNİM DİREKTİFİ ───────────────────────────────────────

/** OCR analiz promptuna eklenen bileşen gereksinim talimatı */
export const COMPONENT_REQUIREMENTS_DIRECTIVE = `
[BİLEŞEN GEREKSİNİMLERİ]
Bu aktiviteyi doğru üretmek için hangi UI bileşenleri gerekiyor?
componentRequirements alanını doldur (true/false):
- requiresGraphic: Grafik, şekil veya geometrik çizim gerekiyor mu?
- requiresTable: Tablo veya ızgara yapısı gerekiyor mu?
- requiresAnswerBoxes: Cevap kutuları veya yazma alanları gerekiyor mu?
- requiresWordBank: Kelime bankası kutusu gerekiyor mu?
- requiresMatchingColumns: Eşleştirme sütunları gerekiyor mu?
- requiresMultipleChoice: Çoktan seçmeli format (A/B/C/D) gerekiyor mu?
`.trim();

// ─── TİP BAZLI PROMPT YANAMALARI ─────────────────────────────────────────

/**
 * Aktivite tipine göre özel üretim direktifleri döndürür.
 * Hem varyasyon hem klonlama akışında kullanılır.
 */
export const buildDetectedTypePromptPatch = (detectedType: OCRDetectedType | string): string => {
  switch (detectedType) {
    case 'MATH_WORKSHEET':
      return `
[MATEMATİK ETKİNLİĞİ DİREKTİFLERİ]
- Sayısal işlemleri border:2px solid #333 kutu içinde göster
- Her işlem satırı: soru + boşluk + = kutusu formatında
- Grafik/geometrik şekil varsa grafikVeri alanını doldur (GraphicRenderer render eder)
- Sayı dizileri ve örüntüler için grid layout (grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)))
- İşlem adımları için alt alta numaralı bloklar
- Kesir, ondalık, yüzde içeren sorularda HTML entity kullan (½ → &frac12;)
`.trim();

    case 'READING_COMPREHENSION':
      return `
[OKUMA ANLAMA ETKİNLİĞİ DİREKTİFLERİ]
- Okuma metnini üstte font-size:11px, line-height:1.5, border:1px solid #ddd kutu içinde ver
- Metni 3-4 paragrafa böl, her paragraf arasında 4px boşluk
- Sorular metinden hemen sonra, numaralı liste halinde
- Anlama soruları: metin altında border-bottom:1px dotted #999 cevap çizgileri
- Kelime anlamı soruları: 2 sütunlu eşleştirme formatı
- Metindeki anahtar kelimeler bold formatında vurgulanabilir
`.trim();

    case 'FILL_IN_THE_BLANK':
      return `
[BOŞ DOLDURMA ETKİNLİĞİ DİREKTİFLERİ]
- Boşluklar _______ formatında (min 8 alt çizgi, display:inline-block; border-bottom:2px solid #333; min-width:80px)
- Her cümle ayrı satırda, numaralı
- Kelime bankası: sayfanın üstünde veya altında border:2px solid #333; padding:8px; border-radius:4px kutu içinde
- Kelime bankası başlığı: "KELİME BANKASI" — font-weight:bold; font-size:10px; text-transform:uppercase
- Toplam boşluk sayısı + kelime sayısı eşit olmalı
- Zorlayıcı varyant: kelime bankasında 2-3 fazla kelime ekle
`.trim();

    case 'MATCHING':
      return `
[EŞLEŞTİRME ETKİNLİĞİ DİREKTİFLERİ]
- 2 sütun CSS grid: display:grid; grid-template-columns:1fr 1fr; gap:4px
- Sol sütun: numaralı terimler (1. 2. 3. ...) border:1px solid #ccc; padding:4px
- Sağ sütun: harfli tanımlar (A. B. C. ...) border:1px solid #ccc; padding:4px; karışık sıra
- Her satır aynı yükseklikte: min-height:28px
- Cevap alanı: sol sütun terimlerinin yanında [ ] kutucuk
- Karıştırılmış eşleştirme: tanımları rastgele sıraya koy
`.trim();

    case 'MULTIPLE_CHOICE':
      return `
[ÇOKTAN SEÇMELİ ETKİNLİĞİ DİREKTİFLERİ]
- Her soru numaralı, font-weight:bold, margin-bottom:2px
- Şıklar: (A) (B) (C) (D) her biri ayrı satırda
- Şık kutuları: display:inline-block; border:1px solid #ccc; padding:2px 6px; margin:1px; border-radius:2px
- Şık metni şık kutusunun sağında
- Sorular arası margin-bottom:8px
- 2 sütunlu layout tercih et: display:grid; grid-template-columns:1fr 1fr; gap:6px
`.trim();

    case 'TRUE_FALSE':
      return `
[DOĞRU-YANLIŞI ETKİNLİĞİ DİREKTİFLERİ]
- Her ifade ayrı satırda, numaralı
- Format: [Numara]. [İfade metni]  D [ ]  Y [ ]
- D ve Y kutuları: display:inline-block; border:1px solid #333; width:16px; height:16px; margin:0 4px
- İfade metni: max-width:75% inline-block
- Satırlar arası: margin-bottom:6px
- Gerekirse ek açıklama alanı: border-bottom:1px dotted #999; width:80%; display:block; margin-top:2px
`.trim();


    case 'OTHER':
    default:
      return `
[GENEL ETKİNLİK DİREKTİFLERİ]
- İçeriğe en uygun düzeni seç, A4'ü mümkün olduğunca doldur
- Benzer aktivite gruplarını tek bir blokta topla
- Her başlık: font-weight:bold; font-size:12px; border-bottom:1px solid #333; margin-bottom:4px
- Farklı bölümler arasında horizontal rule: border-top:1px solid #eee; margin:6px 0
`.trim();
  }
};

// ─── BİLEŞEN KONTROL LİSTESİ OLUŞTURUCU ─────────────────────────────────

/**
 * componentRequirements'a göre promptta kullanılacak özel direktif üretir.
 * Sadece true olan bileşenler için direktif üretilir.
 */
export const buildComponentChecklist = (
  requirements: Partial<ComponentRequirements> | undefined
): string => {
  if (!requirements) return '';

  const directives: string[] = [];

  if (requirements.requiresGraphic) {
    directives.push(
      '- GRAFİK/ŞEKİL GEREKİYOR: grafikVeri alanını doldur. tip, baslik ve veri[] alanlarını eksiksiz ver.'
    );
  }
  if (requirements.requiresTable) {
    directives.push(
      '- TABLO GEREKİYOR: HTML table elementi ile oluştur. border:1px solid #999; border-collapse:collapse; hücre padding:4px'
    );
  }
  if (requirements.requiresAnswerBoxes) {
    directives.push(
      '- CEVAP ALANI GEREKİYOR: Her soru için border-bottom:1px dotted #999; display:block; width:90%; margin-top:3px çizgisi ekle'
    );
  }
  if (requirements.requiresWordBank) {
    directives.push(
      '- KELİME BANKASI GEREKİYOR: Sayfanın üstüne border:2px solid #333; padding:6px; border-radius:4px kutu ekle'
    );
  }
  if (requirements.requiresMatchingColumns) {
    directives.push(
      '- EŞLEŞTİRME SÜTUNLARI GEREKİYOR: display:grid; grid-template-columns:1fr 1fr formatı kullan'
    );
  }
  if (requirements.requiresMultipleChoice) {
    directives.push(
      '- ÇOKTAN SEÇMELİ GEREKİYOR: (A)(B)(C)(D) şıklarını her birini ayrı satırda ver, border:1px solid #ccc kutucuk ekle'
    );
  }

  if (directives.length === 0) return '';

  return `[BİLEŞEN GEREKSİNİMLERİ — ZORUNLU]\n${directives.join('\n')}`;
};

// ─── YOĞUNLUK HEDEFİ DİREKTİFİ ──────────────────────────────────────────

/**
 * densityHints'e göre A4 doluluk hedefini belirten prompt direktifi üretir.
 * Yoğunluk bilgisi yoksa varsayılan değerler kullanılır.
 */
export const buildDensityDirective = (densityHints: Partial<DensityHints> | undefined): string => {
  const score = densityHints?.densityScore ?? 70;
  const itemCount = densityHints?.recommendedItemCount ?? 10;
  const columns = densityHints?.recommendedColumns ?? 1;

  return `
[YOĞUNLUK HEDEFİ]
- Kaynak materyalin tahmini doluluk oranı: %${score}
- Hedef: en az aynı yoğunlukta veya daha dolu bir A4 sayfası üret
- Minimum madde/soru sayısı: ${itemCount}
- Önerilen sütun sayısı: ${columns} (${columns > 1 ? 'display:grid; grid-template-columns: repeat(' + columns + ', 1fr); gap:8px kullan' : 'tek sütun, tam genişlik'})
`.trim();
};
