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
  batchCount: number;
  aggregatedPedagogicalNote: string;
}

type BlockEnhancer = (block: ContentBlock) => Promise<{ enhanced: ContentBlock; pedagogicalNote?: string }>;

/**
 * 5+ blok için batch enhancement.
 * - BATCH_SIZE=3'lü gruplara böler
 * - Her batch arası 500ms bekler (rate limit güvenliği)
 */
export async function enhanceMultipleBlocks(
  blocks: ContentBlock[],
  enhancerFn: BlockEnhancer
): Promise<BatchEnhanceResult> {
  if (blocks.length === 0) {
    return {
      enhancedBlocks: [],
      batchCount: 0,
      aggregatedPedagogicalNote: '',
    };
  }

  const batches = splitIntoBatches(blocks, BATCH_SIZE);
  const allEnhanced: ContentBlock[] = [];
  const uniqueNotes = new Set<string>();

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const results = await Promise.all(batch.map((block) => enhancerFn(block)));

    for (const result of results) {
      allEnhanced.push(result.enhanced);
      if (result.pedagogicalNote && result.pedagogicalNote.trim().length > 0) {
        uniqueNotes.add(result.pedagogicalNote.trim());
      }
    }

    if (i < batches.length - 1) {
      await delay(BATCH_DELAY_MS);
    }
  }

  return {
    enhancedBlocks: allEnhanced,
    batchCount: batches.length,
    aggregatedPedagogicalNote: Array.from(uniqueNotes).join(' | '),
  };
}

/**
 * Tek bir block için basit (non-batch) enhancer wrapper.
 * count <= 4 durumunda enhanceMultipleBlocks yerine kullan.
 */
export async function enhanceSingleBlock(
  block: ContentBlock,
  enhancerFn: BlockEnhancer
): Promise<{ enhanced: ContentBlock; pedagogicalNote?: string }> {
  return enhancerFn(block);
}
