import { describe, it, expect, vi } from 'vitest';
import { enhanceMultipleBlocks, enhanceSingleBlock } from '@/services/activityStudioBatchService';
import type { ContentBlock } from '@/types/activityStudio';

function makeBlock(id: string, order: number): ContentBlock {
  return {
    id,
    type: 'activity',
    order,
    content: `İçerik ${id}`,
    pedagogicalNote: '',
  };
}

describe('activityStudioBatchService', () => {
  describe('enhanceMultipleBlocks', () => {
    it('3\'lü gruplara böler ve tüm blokları işler', async () => {
      vi.useFakeTimers();

      const blocks = Array.from({ length: 7 }, (_, i) => makeBlock(`b${i}`, i));
      const enhancerFn = vi.fn(async (block: ContentBlock) => ({
        enhanced: { ...block, content: `Geliştirilmiş ${block.id}` },
        pedagogicalNote: `Not ${block.id}`,
      }));

      const promise = enhanceMultipleBlocks(blocks, enhancerFn);
      // batch delay'leri atla
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.enhancedBlocks).toHaveLength(7);
      expect(result.batchCount).toBe(3); // ceil(7/3)=3
      expect(enhancerFn).toHaveBeenCalledTimes(7);

      vi.useRealTimers();
    });

    it('tüm batch pedagogicalNote\'larını aggregate eder (sadece ilkini değil)', async () => {
      vi.useFakeTimers();

      const blocks = [makeBlock('x1', 0), makeBlock('x2', 1), makeBlock('x3', 2), makeBlock('x4', 3)];
      const notes = ['Not A', 'Not B', 'Not C', 'Not D'];
      let callIdx = 0;

      const enhancerFn = vi.fn(async (block: ContentBlock) => ({
        enhanced: block,
        pedagogicalNote: notes[callIdx++] ?? '',
      }));

      const promise = enhanceMultipleBlocks(blocks, enhancerFn);
      await vi.runAllTimersAsync();
      const result = await promise;

      // Tüm unique notlar dahil edilmeli
      expect(result.aggregatedPedagogicalNote).toContain('Not A');
      expect(result.aggregatedPedagogicalNote).toContain('Not B');
      expect(result.aggregatedPedagogicalNote).toContain('Not C');
      expect(result.aggregatedPedagogicalNote).toContain('Not D');

      vi.useRealTimers();
    });

    it('duplicate notları bir kez dahil eder', async () => {
      vi.useFakeTimers();

      const blocks = [makeBlock('d1', 0), makeBlock('d2', 1)];
      const enhancerFn = vi.fn(async (block: ContentBlock) => ({
        enhanced: block,
        pedagogicalNote: 'Aynı Not', // her ikisi aynı
      }));

      const promise = enhanceMultipleBlocks(blocks, enhancerFn);
      await vi.runAllTimersAsync();
      const result = await promise;

      const count = (result.aggregatedPedagogicalNote.match(/Aynı Not/g) ?? []).length;
      expect(count).toBe(1);

      vi.useRealTimers();
    });

    it('boş array ile çalışır', async () => {
      const result = await enhanceMultipleBlocks([], vi.fn());
      expect(result.enhancedBlocks).toHaveLength(0);
      expect(result.aggregatedPedagogicalNote).toBe('');
      expect(result.batchCount).toBe(0);
    });
  });

  describe('enhanceSingleBlock', () => {
    it('enhancerFn\'i doğrudan çağırır', async () => {
      const block = makeBlock('s1', 0);
      const enhancerFn = vi.fn(async (b: ContentBlock) => ({
        enhanced: { ...b, content: 'Tek block geliştirildi' },
        pedagogicalNote: 'Tek not',
      }));

      const result = await enhanceSingleBlock(block, enhancerFn);
      expect(result.enhanced.content).toBe('Tek block geliştirildi');
      expect(result.pedagogicalNote).toBe('Tek not');
      expect(enhancerFn).toHaveBeenCalledOnce();
    });
  });
});
