import { ActivityType, SingleWorksheetData, StyleSettings } from '../types';
import { paginationService } from '../services/paginationService';

/**
 * FascicleContentNormalizer
 *
 * Each activity type stores content in a different shape when added to the fascicle.
 * This normalizer extracts the actual renderable data and passes it to SheetRenderer
 * in the format it expects (SingleWorksheetData).
 *
 * Content shapes by activity type:
 * - SINAV: { ...Sinav, printConfig } → needs sorular/baslik for ExamRenderer
 * - MAT_SINAV: { ...MatSinav, printConfig } → needs sorular/baslik for ExamRenderer
 * - ACTIVITY_STUDIO: { wizardData, content: ContentBlock[] } → needs layout/blocks for UnifiedContentRenderer
 * - MATH_STUDIO: { mode, config, pageConfig, items } → MathStudioRenderer expects this shape
 * - SUPER_STUDIO: { content: GeneratedContentPayload[] } → SuperStudioRenderer expects { content: [...] }
 * - KELIME_CUMLE: { content, config } → KelimeCumleRenderer expects { activityType, ...data }
 * - FascicleActivityPicker: { data, title, generatedAt } → needs data[0] extraction
 * - Generic: raw WorksheetData → pass through
 */

interface NormalizedContent {
  data: SingleWorksheetData;
  activityType: ActivityType;
  pageCount: number;
}

/** Kaç sorunun tek A4 sayfasına yerleştirileceği (sınav türleri). */
const EXAM_QUESTIONS_PER_PAGE = 4;

/** Sınav türleri iki kolon, etkinlikler tek kolon basılır. */
export function defaultColumnsForActivity(type: string): number {
  return type === ActivityType.SINAV || type === ActivityType.MAT_SINAV ? 2 : 1;
}

/** Fasikül öğesinin render edilebilir sayfa listesi. */
export interface FasciclePageBundle {
  activityType: ActivityType;
  pages: SingleWorksheetData[];
}

const LIST_KEYS = ['blocks', 'puzzles', 'operations', 'steps', 'problems', 'items'] as const;

/**
 * Kâğıt üzerinde taşacak tek sayfalık içeriği ağırlık bazlı, blok sınırlarından böler.
 * Bilinmeyen/özel şekillerde ve zaten sayfalanmış modern layout'larda dokunmaz.
 */
function splitOverflowingPage(page: SingleWorksheetData, activityType: ActivityType): SingleWorksheetData[] {
  const raw = page as unknown as Record<string, unknown> | null;
  if (!raw || typeof raw !== 'object') return [page];

  // Modern layout zaten kendi sayfa yapısını taşıyor; çift render riski nedeniyle bölmeyiz.
  if (raw.layoutArchitecture || raw.blocksArchitecture) return [page];

  const hasList = LIST_KEYS.some(key => Array.isArray(raw[key]) && (raw[key] as unknown[]).length > 0);
  if (!hasList) return [page];

  const paged = paginationService.process([page], activityType, { smartPagination: true } as StyleSettings);
  return Array.isArray(paged) && paged.length > 0 ? paged : [page];
}

/** Kelime-Cümle Stüdyosu'nun sayfa başına öğe sayısı (stüdyo ile birebir aynı). */
function kelimeCumleItemsPerPage(config: Record<string, unknown> | undefined): number {
  const explicit = Number(config?.itemsPerPage);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;

  switch (config?.type) {
    case 'test': return 5;
    case 'kelime_tamamlama': return 12;
    case 'karisik_cumle': return 8;
    case 'zit_anlam': return 15;
    default: return 10;
  }
}

/**
 * Bir fasikül öğesinin TÜM A4 sayfalarını üretir.
 *
 * Kural: Fasikülde hiçbir içerik kırpılmaz. Etkinlik kaç sayfa üretiyorsa
 * (çok sayfalı havuz içeriği, Süper Stüdyo sayfaları, Kelime-Cümle parçaları,
 * sınav soru blokları) hepsi sırayla ayrı A4 sayfası olarak döner.
 * TOC / toplam sayfa / render bu fonksiyonun aynı çıktısını kullanır.
 */
export function buildFasciclePages(
  item: { type: string; content: unknown },
  defaultColumns?: number
): FasciclePageBundle {
  const activityType = item.type as ActivityType;
  const raw = (item.content as Record<string, unknown>) || {};
  const columns = defaultColumns ?? defaultColumnsForActivity(item.type);

  // ─── Ham WorksheetData[] (ActionModule / arşivden ekleme): her öğe bir A4 sayfasıdır
  if (Array.isArray(item.content)) {
    const dataPages = item.content as SingleWorksheetData[];
    const pages = dataPages.flatMap(page => splitOverflowingPage(page, activityType));
    if (pages.length > 0) return { activityType, pages };
  }

  // ─── Etkinlik Havuzu / arşiv sarmalı: { data: WorksheetData[], title, generatedAt }
  const isWrapper = Array.isArray(raw.data) && (raw.data as unknown[]).length > 0 &&
    typeof raw.title === 'string' && !raw.layout && !raw.layoutArchitecture && !raw.storyData;

  if (isWrapper) {
    const dataPages = raw.data as SingleWorksheetData[];
    const pages = dataPages.flatMap(page => splitOverflowingPage(page, activityType));
    if (pages.length > 0) return { activityType, pages };
  }

  // ─── SUPER_STUDIO: { content: GeneratedContentPayload[] } → her payload bir sayfa
  if (activityType === ActivityType.SUPER_STUDIO) {
    const payloads = Array.isArray(raw.content) ? (raw.content as unknown[]) : [];
    if (payloads.length > 0) {
      return {
        activityType,
        pages: payloads.map(payload => ({ content: [payload] }) as unknown as SingleWorksheetData),
      };
    }
  }

  // ─── KELIME_CUMLE: { content: KelimeCumleGeneratedContent, config }
  if (activityType === ActivityType.KELIME_CUMLE) {
    const inner = raw.content as Record<string, unknown> | undefined;
    const innerItems: unknown[] = Array.isArray(inner?.items) ? inner.items as unknown[] : [];
    if (innerItems.length > 0) {
      const perPage = kelimeCumleItemsPerPage(raw.config as Record<string, unknown> | undefined);
      const chunkActivityType = typeof inner?.activityType === 'string' ? inner.activityType : 'bosluk_doldurma';
      const chunks: SingleWorksheetData[] = [];
      for (let i = 0; i < innerItems.length; i += perPage) {
        chunks.push({
          ...raw,
          content: { ...inner, items: innerItems.slice(i, i + perPage) },
          activityType: chunkActivityType,
        } as unknown as SingleWorksheetData);
      }
      if (chunks.length > 0) return { activityType, pages: chunks };
    }
  }

  // ─── SINAV / MAT_SINAV: soruları sayfa başına 4'erli bloklara böl
  if (activityType === ActivityType.SINAV || activityType === ActivityType.MAT_SINAV) {
    const sorular = Array.isArray(raw.sorular) ? (raw.sorular as unknown[]) : [];
    if (sorular.length > EXAM_QUESTIONS_PER_PAGE) {
      const pages: SingleWorksheetData[] = [];
      for (let i = 0; i < sorular.length; i += EXAM_QUESTIONS_PER_PAGE) {
        pages.push({
          ...raw,
          sorular: sorular.slice(i, i + EXAM_QUESTIONS_PER_PAGE),
          totalSoruOverride: sorular.length,
        } as unknown as SingleWorksheetData);
      }
      return { activityType, pages };
    }
  }

  // ─── Genel: normalize et, tek sayfaya sığmayan içeriği blok sınırından böl
  const normalized = normalizeFascicleContent(item, columns);
  return { activityType: normalized.activityType, pages: splitOverflowingPage(normalized.data, normalized.activityType) };
}

/**
 * Bir fasikül öğesinin kapladığı gerçek A4 sayfa sayısı.
 * Render ile aynı kaynaktan (buildFasciclePages) hesaplanır; TOC ve toplam sayfa tutarlıdır.
 */
export function getFasciclePageCount(item: { type: string; content: unknown; pageCount: number }): number {
  return Math.max(buildFasciclePages(item).pages.length, 1);
}

/**
 * Normalize fascicle item content for SheetRenderer.
 * Returns the data in the format SheetRenderer expects for each activity type.
 */
export function normalizeFascicleContent(
  item: { type: string; content: unknown },
  defaultColumns: number
): NormalizedContent {
  const raw = (item.content as Record<string, unknown>) || {};
  const type = item.type as ActivityType;

  switch (type) {
    // ─── SINAV ─────────────────────────────────────────────
    // Stores: { ...Sinav, printConfig } → Sorular, baslik, cevapAnahtari, etc.
    // SheetRenderer → ExamRenderer expects: { sorular, baslik, printConfig, ... }
    case ActivityType.SINAV:
    case ActivityType.MAT_SINAV: {
      // Content is already in the right shape (flat Sinav + printConfig)
      // ExamRenderer reads data.sorular, data.baslik, data.printConfig directly
      return {
        data: raw as SingleWorksheetData,
        activityType: type,
        pageCount: Math.ceil(((raw.sorular as unknown[])?.length || 1) / 4),
      };
    }

    // ─── ACTIVITY_STUDIO ───────────────────────────────────
    // Stores: { wizardData, content: ContentBlock[] }
    // SheetRenderer expects blocks or layout format for UnifiedContentRenderer
    case ActivityType.ACTIVITY_STUDIO: {
      const contentBlocks = (raw.content as unknown[]) || [];
      const wizardData = raw.wizardData as Record<string, unknown> | undefined;
      const goal = wizardData?.goal as Record<string, unknown> | undefined;

      // Convert ContentBlock[] to blocks format for UnifiedContentRenderer
      const blocks = contentBlocks.map((block: any, idx: number) => ({
        id: block.id || `block-${idx}`,
        type: block.type || 'text',
        order: block.order ?? idx,
        content: block.content || '',
        ...(block.imageUrl ? { imageUrl: block.imageUrl } : {}),
        ...(block.videoUrl ? { videoUrl: block.videoUrl } : {}),
      }));

      return {
        data: {
          title: (goal?.title as string) || (wizardData?.promptInput as any)?.topic || 'Etkinlik',
          instruction: (goal?.description as string) || '',
          blocks,
          blocksArchitecture: blocks.length > 0 ? blocks : undefined,
        } as unknown as SingleWorksheetData,
        activityType: type,
        pageCount: 1,
      };
    }

    // ─── MATH_STUDIO ──────────────────────────────────────
    // Stores: { mode, config, pageConfig, items }
    // MathStudioRenderer expects exactly this shape
    case ActivityType.MATH_STUDIO: {
      return {
        data: raw as unknown as SingleWorksheetData,
        activityType: type,
        pageCount: 1,
      };
    }

    // ─── SUPER_STUDIO ─────────────────────────────────────
    // Stores: { content: GeneratedContentPayload[] }
    // SuperStudioRenderer expects: { content: [...] } or [pages]
    case ActivityType.SUPER_STUDIO: {
      return {
        data: raw as unknown as SingleWorksheetData,
        activityType: type,
        pageCount: Math.max(((raw.content as unknown[]) || []).length, 1),
      };
    }

    // ─── KELIME_CUMLE ─────────────────────────────────────
    // Stores: { content: KelimeCumleGeneratedContent, config }
    // KelimeCumleRenderer expects: { activityType, ...data }
    case ActivityType.KELIME_CUMLE: {
      const innerContent = raw.content as Record<string, unknown> | undefined;
      return {
        data: {
          ...raw,
          activityType: innerContent?.activityType || 'bosluk_doldurma',
        } as unknown as SingleWorksheetData,
        activityType: type,
        pageCount: 1,
      };
    }

    // ─── CURRICULUM ───────────────────────────────────────
    // Stores: { curriculum }
    // Falls through to UnifiedContentRenderer / LegacyRenderer
    case ActivityType.CURRICULUM: {
      return {
        data: raw as unknown as SingleWorksheetData,
        activityType: type,
        pageCount: 1,
      };
    }

    // ─── STORY_COMPREHENSION ──────────────────────────────
    // Stores: { storyData, config, layout }
    // SheetRenderer checks for .layout → ReadingStudioContentRenderer
    case ActivityType.STORY_COMPREHENSION: {
      return {
        data: raw as unknown as SingleWorksheetData,
        activityType: type,
        pageCount: 1,
      };
    }

    // ─── SARI_KITAP_STUDIO ────────────────────────────────
    // Generic content pass-through
    case ActivityType.SARI_KITAP_STUDIO: {
      return {
        data: raw as unknown as SingleWorksheetData,
        activityType: type,
        pageCount: 1,
      };
    }

    // ─── FascicleActivityPicker generated content ──────────
    // Stores: { data: any[], title, generatedAt }
    // The data[0] is the actual renderable content
    default: {
      // Check if this is a FascicleActivityPicker wrapper
      if (raw.data && Array.isArray(raw.data) && raw.title) {
        const firstItem = raw.data[0];
        if (firstItem) {
          return {
            data: firstItem as SingleWorksheetData,
            activityType: type,
            pageCount: 1,
          };
        }
      }

      // Generic pass-through
      return {
        data: raw as unknown as SingleWorksheetData,
        activityType: type,
        pageCount: 1,
      };
    }
  }
}
