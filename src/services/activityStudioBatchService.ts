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
}

type BlockEnhancer = (block: ContentBlock) => Promise<{ enhanced: ContentBlock }>;

/**
 * 5+ blok için batch enhancement.
 * - BATCH_SIZE=3'lü gruplara böler
 * - Her batch arası 500ms bekler (rate limit güvenliği)
 */
export async function enhanceMultipleBlocks(
  blocks: ContentBlock[],
  enhancerFn: BlockEnhancer
): Promise<BatchEnhanceResult> {
  const batches = splitIntoBatches(blocks, BATCH_SIZE);
  const allEnhanced: ContentBlock[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    const results = await Promise.all(batch.map((block) => enhancerFn(block)));

    for (const result of results) {
      allEnhanced.push(result.enhanced);
    }

    // Son batch değilse bekle
    if (i < batches.length - 1) {
      await delay(BATCH_DELAY_MS);
    }
  }

  return {
    enhancedBlocks: allEnhanced,
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
): Promise<{ enhanced: ContentBlock }> {
  return enhancerFn(block);
}
