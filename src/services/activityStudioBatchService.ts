import type { ContentBlock } from '@/types/activityStudio';

const BATCH_SIZE = 3;
const BATCH_DELAY_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Block dizisini BATCH_SIZE'lı gruplara böl */
function splitIntoBatches<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

export interface BatchEnhanceResult {
  enhancedBlocks: ContentBlock[];
  /** TÜM batch'lerden toplanan pedagogicalNote'lar birleştirilir (sadece ilkini değil) */
  aggregatedPedagogicalNote: string;
  batchCount: number;
}

type BlockEnhancer = (block: ContentBlock) => Promise<{ enhanced: ContentBlock; pedagogicalNote: string }>;

/**
 * 5+ blok için batch enhancement.
 * - BATCH_SIZE=3'lü gruplara böler
 * - Her batch arası 500ms bekler (rate limit güvenliği)
 * - Tüm batch'lerden pedagogicalNote'ları aggregate eder (sadece ilkini almaz)
 */
export async function enhanceMultipleBlocks(
  blocks: ContentBlock[],
  enhancerFn: BlockEnhancer
): Promise<BatchEnhanceResult> {
  const batches = splitIntoBatches(blocks, BATCH_SIZE);
  const allEnhanced: ContentBlock[] = [];
  const allNotes: string[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    const results = await Promise.all(batch.map((block) => enhancerFn(block)));

    for (const result of results) {
      allEnhanced.push(result.enhanced);
      if (result.pedagogicalNote.trim()) {
        allNotes.push(result.pedagogicalNote.trim());
      }
    }

    // Son batch değilse bekle
    if (i < batches.length - 1) {
      await delay(BATCH_DELAY_MS);
    }
  }

  // Pedagojik notları birleştir — tümü dahil (Elif direktifi: sadece ilki değil)
  const aggregatedPedagogicalNote = allNotes
    .filter((note, idx, arr) => arr.indexOf(note) === idx) // duplicate temizle
    .join(' • ');

  return {
    enhancedBlocks: allEnhanced,
    aggregatedPedagogicalNote,
    batchCount: batches.length,
  };
}

/**
 * Tek bir block için basit (non-batch) enhancer wrapper.
 * count <= 4 durumunda enhanceMultipleBlocks yerine kullan.
 */
export async function enhanceSingleBlock(
  block: ContentBlock,
  enhancerFn: BlockEnhancer
): Promise<{ enhanced: ContentBlock; pedagogicalNote: string }> {
  return enhancerFn(block);
}
