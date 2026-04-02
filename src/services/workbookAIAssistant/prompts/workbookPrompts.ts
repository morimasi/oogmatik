/**
 * Workbook AI Assistant — Prompt Sablonlari
 *
 * ANATOMY v4 Prompt Standardi:
 * - [SISTEM ROL] — AI'in kimligi
 * - [OGRENCI PROFILI] — ZPD icin kritik
 * - [GOREV] — Net talimat
 * - [KISITLAR] — Sinirlar
 * - [CIKTI] — JSON schema referansi
 *
 * @author Selin Arslan (AI Muhendisi)
 * @created 2026-04-02
 */

import type { CollectionItem, WorkbookSettings } from '../../../types';

// ============================================================
// CONTEXT TYPES
// ============================================================

export interface WorkbookContext {
  gradeLevel?: number;
  studentProfile?: {
    diagnosis?: string;
    ageGroup?: string;
    strengths?: string[];
    challenges?: string[];
  };
  currentPageCount: number;
  activityDistribution: Array<{ type: string; count: number }>;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}

// ============================================================
// 1. SMART CONTENT SUGGESTIONS
// ============================================================

/**
 * Aktivite onerisi prompt'u
 * Max token: ~800 input, ~400 output
 */
export const buildActivitySuggestionPrompt = (context: WorkbookContext): string => `
[SISTEM ROL: OZEL EGITIM MUFREDAT UZMANI]
MEB 2024-2025 ${context.gradeLevel || 5}. sinif mufredatinda uzman, disleksi-sensitif ogretmen.

[OGRENCI PROFILI]
Tani: ${context.studentProfile?.diagnosis || 'belirtilmedi'}
Yas Grubu: ${context.studentProfile?.ageGroup || '8-10'}
Guclu Yanlar: ${context.studentProfile?.strengths?.join(', ') || 'belirtilmedi'}
Destek Alanlari: ${context.studentProfile?.challenges?.join(', ') || 'genel'}

[MEVCUT KITAPCIK]
Sayfa: ${context.currentPageCount}
Aktiviteler:
${context.activityDistribution.map((d) => `- ${d.type}: ${d.count}`).join('\n')}
Zorluk: K${context.difficultyDistribution.easy}% O${context.difficultyDistribution.medium}% Z${context.difficultyDistribution.hard}%

[GOREV]
3 aktivite tur onerisi yap. Her oneri icin:
1. Aktivite turu (ActivityType enum)
2. Neden? (ZPD analizi)
3. Zorluk seviyesi
4. Hedef beceri

[KISITLAR]
- ZPD sinirlari icinde kal
- Mevcut dagilimi dengele
- Disleksi dostu aktiviteler oncelikli

[CIKTI]
SADECE JSON. Markdown YASAK.
`;

/**
 * Eksik beceri tespiti prompt'u
 */
export const buildSkillGapPrompt = (items: CollectionItem[]): string => {
  const compressed = compressItemsForPrompt(items);

  return `
[SISTEM ROL: EGITIM PROGRAMI ANALISTI]
Bilisssel gelisim alanlari ve MEB kazanimlari uzmani.

[KITAPCIK ICERIGI]
${compressed}

[GOREV]
Kitapcikta eksik kalan beceri alanlarini tespit et:
1. Hangi bilisssel alanlar eksik? (gorsel, sozel, mantik, bellek, dikkat)
2. Her eksik alan icin hangi aktivite turleri onerilir?

[CIKTI]
JSON formati. Maksimum 5 eksik alan.
`;
};

// ============================================================
// 2. REAL-TIME FEEDBACK
// ============================================================

/**
 * Sayfa dengesi analiz prompt'u
 * Max token: ~1200 input, ~350 output
 */
export const buildPageBalancePrompt = (items: CollectionItem[]): string => {
  const compressed = compressItemsForPrompt(items);

  return `
[SISTEM ROL: EGITIM MATERYALI TASARIM UZMANI]
Calisma kitapcigi sayfa kompozisyonu ve pedagojik denge uzmani.

[KITAPCIK]
${compressed}

[DENETIM KRITERLERI]
1. Bilisssel cok yonluluk (gorsel, sozel, mantik dengesi)
2. Zorluk gradyani (scaffolding)
3. Dikkat suresi uyumu (ard arda 3+ yogun aktivite)
4. Tema tutarliligi
5. Disleksi hassasiyeti (metin agirlikli aktiviteler)

[CIKTI]
{
  "overallScore": 0-100,
  "verdict": "Mukemmel|Iyi|Iyilestirilebilir|Kritik",
  "balanceIssues": [{pageIndex, issue, severity, suggestion}],
  "strengths": [],
  "recommendations": []
}
`;
};

/**
 * Zorluk dagilimi analiz prompt'u
 */
export const buildDifficultyAnalysisPrompt = (items: CollectionItem[]): string => {
  const difficulties = items
    .filter((i) => i.itemType !== 'divider')
    .map((i, idx) => `${idx + 1}:${(i as any).difficulty || 'Orta'}`)
    .join(',');

  return `
[SISTEM ROL: PEDAGOJIK ZORLUK KALIBRASYONU UZMANI]

[ZORLUK SIRASI]
${difficulties}

[GOREV]
Zorluk dagiliminini analiz et:
1. Scaffolding (kolay->zor) var mi?
2. Ani zorluk artislari var mi?
3. Ideal %25 Kolay, %50 Orta, %25 Zor — sapma var mi?

[CIKTI]
{
  "distribution": {easy, medium, hard},
  "scaffoldingScore": 0-100,
  "issues": [],
  "recommendation": ""
}
`;
};

/**
 * Tema tutarliligi analiz prompt'u
 */
export const buildThemeConsistencyPrompt = (
  items: CollectionItem[],
  settings: WorkbookSettings
): string => {
  const compressed = compressItemsForPrompt(items);

  return `
[SISTEM ROL: ICERIK TUTARLILIGI UZMANI]

[KITAPCIK BILGISI]
Baslik: ${settings.title || '-'}
Ogrenci: ${settings.studentName || '-'}
Tema: ${settings.theme || 'default'}

[AKTIVITELER]
${compressed}

[GOREV]
Tema tutarliligini analiz et:
1. Hangi temalar/konular tespit edildi?
2. Tutarsizlik var mi?
3. Aktiviteler arasinda mantiksal gecis var mi?

[CIKTI]
{
  "consistencyScore": 0-100,
  "detectedThemes": [],
  "inconsistencies": [{pageIndex, issue}],
  "suggestion": ""
}
`;
};

// ============================================================
// 3. AUTO-COMPLETE
// ============================================================

/**
 * Pedagojik not uretim prompt'u
 * Max token: ~500 input, ~100 output
 */
export const buildPedagogicalNotePrompt = (item: CollectionItem): string => `
[SISTEM ROL: OZEL EGITIM PEDAGOJI UZMANI]
Disleksi, diskalkuli ve DEHB alanlarinda uzman.

[AKTIVITE]
Tur: ${item.activityType}
Baslik: ${item.title}
Zorluk: ${(item as any).difficulty || 'Orta'}

[GOREV]
Ogretmen/veliye pedagojik not yaz:
1. Hangi beceriyi gelistirir?
2. Disleksili ogrenci icin neden uygun?
3. Dikkat edilecekler
4. Basari kriteri

[KISITLAR]
- Maks 3 cumle
- Teknik jargondan kacin
- Olumlu dil kullan

[CIKTI]
{"pedagogicalNote": "..."}
`;

/**
 * Batch pedagojik not prompt'u (5'li grup)
 */
export const buildBatchPedagogicalNotePrompt = (items: CollectionItem[]): string => {
  const itemList = items
    .map((item, idx) => `${idx + 1}. ${item.activityType}: ${item.title}`)
    .join('\n');

  return `
[SISTEM ROL: OZEL EGITIM PEDAGOJI UZMANI]

[AKTIVITELER]
${itemList}

[GOREV]
Her aktivite icin tek cumlelik pedagojik not yaz.
Sirasi ile notes dizisinde dondur.

[KISITLAR]
- Her not maks 2 cumle
- Olumlu, guclu-yanli dil
- Teknik jargon yok

[CIKTI]
{"notes": ["not1", "not2", ...]}
`;
};

/**
 * Onsoz uretim prompt'u (optimize edilmis)
 * Max token: ~700 input, ~200 output
 */
export const buildPrefacePrompt = (
  settings: WorkbookSettings,
  items: CollectionItem[]
): string => {
  // Aktivite dagilimi analizi
  const activityCounts = items.reduce(
    (acc, item) => {
      if (item.itemType !== 'divider') {
        acc[item.activityType] = (acc[item.activityType] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const topActivities = Object.entries(activityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);

  return `
[SISTEM ROL: OZEL EGITIM ILETISIM UZMANI]
Veli ve ogretmenlerle empati kuran uzman.

[KITAPCIK]
Baslik: ${settings.title || 'Calisma Kitapcigi'}
Ogrenci: ${settings.studentName || 'Ogrenci'}
Okul: ${settings.schoolName || '-'}
Yil: ${settings.year || '-'}
Sayfa: ${items.filter((i) => i.itemType !== 'divider').length}
Odak: ${topActivities.join(', ')}

[YAZIM]
1. GIRIS (1 cumle): Amac
2. GELISME (2 cumle): ${topActivities.slice(0, 2).join(' ve ')} etkisi
3. SONUC (1 cumle): Tesekkur + motivasyon

[KURALLAR]
- Maks 150 kelime
- Kisa cumleler
- "disleksili" yerine "bireysel ogrenme ozellikleri"
- Samimi, guclendirici ton

[CIKTI]
{"preface": "..."}
`;
};

/**
 * Metadata tamamlama prompt'u
 */
export const buildMetadataFillPrompt = (item: CollectionItem): string => {
  const contentSummary = JSON.stringify((item as any).data?.[0] || {}).substring(0, 300);

  return `
[SISTEM ROL: EGITIM ICERIGI SINIFLANDIRMA UZMANI]

[AKTIVITE]
Tur: ${item.activityType}
Baslik: ${item.title}
Icerik: ${contentSummary}

[GOREV]
Eksik metadata'yi doldur:
1. category: Matematik/Turkce/Fen/Sosyal/Bilisssel
2. targetSkills: Hedef beceriler (maks 3)
3. cognitiveDomain: gorsel/sozel/mantik/bellek/dikkat
4. estimatedDuration: Tahmini sure (dakika)
5. pedagogicalNote: Pedagojik aciklama

[CIKTI]
JSON formati.
`;
};

/**
 * Siralama optimizasyonu prompt'u
 */
export const buildSequenceOptimizationPrompt = (items: CollectionItem[]): string => {
  const compressed = compressItemsForPrompt(items);

  return `
[SISTEM ROL: EGITIM MATERYALI SIRALAMASI UZMANI]
Bilisssel yuk yonetimi ve scaffolding uzmani.

[MEVCUT SIRALAMA]
${compressed}

[GOREV]
Optimal siralama oner:
1. Kolay'dan zor'a gecis
2. Bilisssel cok yonluluk (art arda ayni tur yok)
3. Dikkat suresi yonetimi

[CIKTI]
{
  "optimizedOrder": [{originalIndex, newIndex, reason}],
  "improvementScore": 0-100,
  "pedagogicalRationale": ""
}
`;
};

// ============================================================
// YARDIMCI FONKSIYONLAR
// ============================================================

/**
 * Token tasarrufu icin item'lari sikiştir
 * ~%70 token tasarrufu saglar
 */
export const compressItemsForPrompt = (items: CollectionItem[]): string => {
  return items
    .map(
      (item, idx) =>
        `${idx + 1}|${item.itemType === 'divider' ? 'DIV' : item.activityType}|${(item.title || '').substring(0, 25)}|${(item as any).difficulty || '-'}`
    )
    .join('\n');
};

/**
 * Workbook context olustur
 */
export const buildWorkbookContext = (
  items: CollectionItem[],
  settings: WorkbookSettings,
  studentProfile?: WorkbookContext['studentProfile']
): WorkbookContext => {
  // Aktivite dagilimi
  const activityCounts: Record<string, number> = {};
  let easyCount = 0;
  let mediumCount = 0;
  let hardCount = 0;

  items.forEach((item) => {
    if (item.itemType !== 'divider') {
      activityCounts[item.activityType] = (activityCounts[item.activityType] || 0) + 1;

      const difficulty = (item as any).difficulty || 'Orta';
      if (difficulty === 'Kolay') easyCount++;
      else if (difficulty === 'Zor') hardCount++;
      else mediumCount++;
    }
  });

  const totalActivities = items.filter((i) => i.itemType !== 'divider').length || 1;

  return {
    gradeLevel: 5, // Default
    studentProfile,
    currentPageCount: items.length,
    activityDistribution: Object.entries(activityCounts).map(([type, count]) => ({
      type,
      count,
    })),
    difficultyDistribution: {
      easy: Math.round((easyCount / totalActivities) * 100),
      medium: Math.round((mediumCount / totalActivities) * 100),
      hard: Math.round((hardCount / totalActivities) * 100),
    },
  };
};
