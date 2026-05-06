import { describe, it, expect } from 'vitest';
import { generateOfflineGizemliSayilar } from '../src/services/offlineGenerators/gizemliSayilar';

describe('Gizemli Sayilar Offline Generator', () => {
  it('should generate requested number of worksheets', async () => {
    const results = await generateOfflineGizemliSayilar({
      worksheetCount: 2,
      difficulty: 'Orta',
    });
    expect(results).toHaveLength(2);
    expect(results[0].title).toBe('Gizemli Sayılar: İpuçlarını Takip Et!');
  });

  it('should generate multiple riddles per page', async () => {
    const results = await generateOfflineGizemliSayilar({
      worksheetCount: 1,
      difficulty: 'Orta',
      itemsPerPage: 6,
      clueCount: 3,
      numberRange: [10, 100],
    });
    const page = results[0];
    expect(page.riddles).toBeDefined();
    expect(page.riddles.length).toBe(6);
    
    const riddle = page.riddles[0];
    expect(typeof riddle.mysteryNumber).toBe('number');
    expect(riddle.mysteryNumber).toBeGreaterThanOrEqual(10);
    expect(riddle.mysteryNumber).toBeLessThanOrEqual(100);
    expect(riddle.clues.length).toBeLessThanOrEqual(3); // Might be less if we ask for 3 but some aren't available, but usually 3
    expect(riddle.clues[0].text).toBeDefined();
  });
});