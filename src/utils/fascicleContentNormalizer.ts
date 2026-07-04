import { ActivityType, SingleWorksheetData } from '../types';

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

/**
 * Get the actual number of A4 pages an item will render.
 * Some renderers (SuperStudio, KelimeCumle) render multiple pages internally.
 */
export function getFasciclePageCount(item: { type: string; content: unknown; pageCount: number }): number {
  const content = item.content as Record<string, unknown> || {};

  switch (item.type) {
    case ActivityType.SUPER_STUDIO: {
      // SUPER_STUDIO stores { content: GeneratedContentPayload[] }
      const pages = (content.content as unknown[]) || [];
      return Math.max(pages.length, 1);
    }
    case ActivityType.KELIME_CUMLE: {
      // KELIME_CUMLE stores { content: KelimeCumleGeneratedContent, config }
      const innerContent = content.content as Record<string, unknown> | undefined;
      if (innerContent?.pages) {
        return Math.max((innerContent.pages as unknown[]).length, 1);
      }
      return item.pageCount || 1;
    }
    case ActivityType.SINAV:
    case ActivityType.MAT_SINAV: {
      // Exams: ~4 questions per page
      const sinav = content as Record<string, unknown>;
      const sorular = (sinav.sorular as unknown[]) || [];
      if (sorular.length === 0) return item.pageCount || 1;
      return Math.ceil(sorular.length / 4);
    }
    default:
      return item.pageCount || 1;
  }
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
