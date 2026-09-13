import { describe, it, expect } from 'vitest';
import { ACTIVITIES } from '../src/constants/activities';
import { ACTIVITY_CATEGORIES } from '../src/constants';
import { ActivityType } from '../src/types/activity';
import { generateOfflineAlgorithmGenerator } from '../src/services/offlineGenerators/algorithm';
import { generateOfflineStorySequencing } from '../src/services/offlineGenerators/readingComprehension';
import { generateOfflineLetterMazeTest } from '../src/services/offlineGenerators/letterMazeTest';
import { generateOfflineFallback } from '../src/services/offlineGenerators/fallback';

describe('Global Activities Category Wiring and Offline Generators Smoke Test', () => {
  it('every activity in ACTIVITIES is assigned to at least one category in ACTIVITY_CATEGORIES', () => {
    const allCategoryActivities = new Set<ActivityType>();
    for (const category of ACTIVITY_CATEGORIES) {
      for (const act of category.activities) {
        allCategoryActivities.add(act);
      }
    }

    const unmapped: string[] = [];
    for (const activity of ACTIVITIES) {
      if (!allCategoryActivities.has(activity.id)) {
        unmapped.push(activity.id);
      }
    }

    expect(unmapped).toEqual([]);
  });

  it('ALGORITHM_GENERATOR: offline generator returns valid AlgorithmData structure', async () => {
    const results = await generateOfflineAlgorithmGenerator({
      difficulty: 'Orta',
      itemCount: 1,
    } as any);

    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    const item = results[0];
    expect(item.title).toBeTruthy();
    expect(item.instruction).toBeTruthy();
    expect(Array.isArray(item.steps)).toBe(true);
    expect(item.steps.length).toBeGreaterThan(0);
  });

  it('STORY_SEQUENCING: offline generator returns valid StorySequencingData structure', async () => {
    const results = await generateOfflineStorySequencing({
      difficulty: 'orta',
      worksheetCount: 1,
    } as any);

    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    const item = results[0];
    expect(item.title).toBeTruthy();
    expect(item.instruction).toBeTruthy();
    expect(item.content).toBeDefined();
    expect(Array.isArray(item.content.panels)).toBe(true);
    expect(item.content.panels.length).toBeGreaterThan(0);
  });

  it('LETTER_MAZE_TEST: offline generator returns valid maze items', async () => {
    const results = await generateOfflineLetterMazeTest({
      difficulty: 'orta',
      itemCount: 1,
    } as any);

    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    const item = results[0];
    expect(item.title).toBeTruthy();
    expect(item.instruction).toBeTruthy();
    expect(Array.isArray(item.grid)).toBe(true);
  });

  it('generateOfflineFallback: produces structured pedagogical A4 blocks without error text', async () => {
    const sheet = await generateOfflineFallback(ActivityType.LOGIC_PUZZLE, {
      difficulty: 'Orta',
      topic: 'Mantıksal Akıl Yürütme',
    } as any);

    expect(sheet.id).toBeTruthy();
    expect(sheet.title).toContain('Etkinliği');
    expect(sheet.layoutArchitecture).toBeDefined();
    expect(sheet.layoutArchitecture?.blocks.length).toBeGreaterThanOrEqual(4);

    // Make sure no placeholder warning text is present
    const stringified = JSON.stringify(sheet);
    expect(stringified).not.toContain('henüz otomatik bir hızlı şablon bulunmamaktadır');
    expect(stringified).toContain('Öğretmen ve Veli Notu');
  });
});
