import { describe, it, expect } from 'vitest';
import { paginationService, splitLargeBlock } from '../src/services/paginationService';
import { ActivityType } from '../src/types/activity';
import type { WorksheetBlock } from '../src/types';

describe('Çoklu Sayfa & Akıllı Izgara Sayfalama Motoru', () => {
  it('splits oversized grid blocks along complete row boundaries (preserving cols)', () => {
    const cols = 4;
    const totalCells = 120; // 30 rows -> weight = 45 + 30*44 = 1365 > maxWeight (1000)
    const gridBlock: WorksheetBlock = {
      type: 'grid',
      content: {
        cols,
        cells: Array.from({ length: totalCells }, (_, i) => `Hücre ${i + 1}`),
      },
    };

    const chunks = splitLargeBlock(gridBlock, 500);
    expect(chunks.length).toBeGreaterThan(1);

    chunks.forEach((chunk, idx) => {
      const c = chunk.content as { cells: unknown[]; cols: number; isContinuation?: boolean };
      expect(c.cells.length % cols).toBe(0);
      if (idx > 0) {
        expect(c.isContinuation).toBe(true);
      }
    });

    const totalMerged = chunks.reduce(
      (sum, ch) => sum + ((ch.content as { cells: unknown[] }).cells.length),
      0
    );
    expect(totalMerged).toBe(totalCells);
  });

  it('splits oversized table blocks into row chunks without dropping rows', () => {
    const rows = Array.from({ length: 40 }, (_, i) => [`Satır ${i + 1}`, `Değer ${i + 1}`]);
    const tableBlock: WorksheetBlock = {
      type: 'table',
      content: {
        headers: ['Ad', 'Değer'],
        rows,
      },
    };

    const chunks = splitLargeBlock(tableBlock, 450);
    expect(chunks.length).toBeGreaterThan(1);
    const totalRows = chunks.reduce(
      (sum, ch) => sum + ((ch.content as { rows: unknown[] }).rows.length),
      0
    );
    expect(totalRows).toBe(40);
  });

  it('splits match_columns blocks keeping left and right pairs aligned', () => {
    const leftColumn = Array.from({ length: 24 }, (_, i) => `Sol ${i + 1}`);
    const rightColumn = Array.from({ length: 24 }, (_, i) => `Sağ ${i + 1}`);
    const matchBlock: WorksheetBlock = {
      type: 'match_columns',
      content: { leftColumn, rightColumn },
    };

    const chunks = splitLargeBlock(matchBlock, 450);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((ch) => {
      const c = ch.content as { leftColumn: unknown[]; rightColumn: unknown[] };
      expect(c.leftColumn.length).toBe(c.rightColumn.length);
    });
  });

  it('paginates multi-block worksheets and assigns _currentPage and _totalPages', () => {
    const blocks: WorksheetBlock[] = Array.from({ length: 12 }, (_, i) => ({
      type: 'logic_card',
      content: { title: `Soru ${i + 1}`, prompt: 'Mantık sorusu içeriği' },
    }));

    const result = paginationService.process(
      [{ title: 'Test Çalışma Kağıdı', blocks } as any],
      ActivityType.MATH_PUZZLE
    ) as any[];

    expect(result.length).toBeGreaterThan(1);
    result.forEach((page, idx) => {
      expect(page._currentPage).toBe(idx + 1);
      expect(page._totalPages).toBe(result.length);
      expect(page.isContinuation).toBe(idx > 0);
    });
  });

  it('respects smartPagination = false setting and returns data untouched', () => {
    const input = [{ title: 'Tek Sayfa', blocks: [{ type: 'logic_card', content: {} }] }] as any;
    const output = paginationService.process(input, ActivityType.MATH_PUZZLE, {
      smartPagination: false,
    } as any);
    expect(output).toBe(input);
  });
});
