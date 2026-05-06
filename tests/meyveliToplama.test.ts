import { describe, it, expect } from 'vitest';
import { generateOfflineMeyveliToplama } from '../src/services/offlineGenerators/meyveliToplama';

describe('Meyveli Toplama Offline Generator', () => {
  it('should generate requested number of worksheets', async () => {
    const results = await generateOfflineMeyveliToplama({
      worksheetCount: 2,
      difficulty: 'Orta',
    });
    expect(results).toHaveLength(2);
    expect(results[0].title).toBe('Meyveli Matematik Bulmacası');
  });

  it('should generate multiple grids per page', async () => {
    const results = await generateOfflineMeyveliToplama({
      worksheetCount: 1,
      difficulty: 'Başlangıç',
      itemsPerPage: 4,
      gridSize: 3,
    });
    const page = results[0];
    expect(page.grid).toBeDefined();
    expect(page.grid.length).toBe(4);
    
    const puzzle = page.grid[0];
    expect(puzzle.fruits.length).toBe(3);
    expect(puzzle.gridIndices.length).toBe(3); // 3x3 grid
    expect(puzzle.rowSum.length).toBe(3);
    expect(puzzle.colSum.length).toBe(3);
    expect(puzzle.fruitValues.length).toBe(3);
  });
});