import { describe, it, expect } from 'vitest';
import { generateOfflineLogicErrorHunter } from '@/services/offlineGenerators/logicErrorHunter';
import { generateOfflineFiveWOneH } from '@/services/offlineGenerators/fiveWOneH';
import { generateOfflineShortAnswer } from '@/services/offlineGenerators/shortAnswer';
import { generateOfflineMissingParts } from '@/services/offlineGenerators/missingParts';
import { ActivityType } from '@/types/activity';

describe('okuduğunu-anlama offline generator smoke tests', () => {
  it('logicErrorHunter: correct LogicErrorHunterData shape', async () => {
    const result = await generateOfflineLogicErrorHunter({
      difficulty: 'Orta',
      worksheetCount: 2,
      absurdityDegree: 'obvious' as never,
      errorCount: 2,
    });
    expect(result).toHaveLength(2);
    for (const item of result) {
      expect(item.content.story).toBeTruthy();
      expect(item.content.errors.length).toBeGreaterThan(0);
      expect(item.content.errors[0].id).toBeTruthy();
      expect(item.content.errors[0].faultyWordOrPhrase).toBeTruthy();
      expect(item.content.errors[0].correction).toBeTruthy();
    }
  });

  it('fiveWOneH: difficulty filter matches UI values', async () => {
    const result = await generateOfflineFiveWOneH({ difficulty: '1-2', worksheetCount: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].settings?.difficulty).toBe('çok kolay');
    const resultZor = await generateOfflineFiveWOneH({ difficulty: 'Zor', worksheetCount: 1 });
    expect(resultZor[0].settings?.difficulty).toBe('zor');
  });

  it('shortAnswer: uses injected activityType + itemCount', async () => {
    const result = await generateOfflineShortAnswer({
      activityType: ActivityType.INFOGRAPHIC_SHORT_ANSWER,
      itemCount: 3,
      topic: 'Bilim',
      mode: 'fast',
    } as never);
    expect(result).toHaveLength(1);
    expect(result[0].activityType).toBe(ActivityType.INFOGRAPHIC_SHORT_ANSWER);
    expect(result[0].content.questions).toHaveLength(3);
    expect(result[0].content.questions[0].text).toBeTruthy();
    expect(typeof result[0].content.questions[0].answer).toBe('string');
  });

  it('missingParts: correct MissingPartsData shape with paragraphs + wordBank', async () => {
    const result = await generateOfflineMissingParts({
      topic: 'Doğa',
      blankType: 'word',
      blankCount: 5,
      showWordBank: true,
      includeDistractors: true,
      distractorCount: 2,
      worksheetCount: 1,
    } as never);
    expect(result).toHaveLength(1);
    const item = result[0] as unknown as Record<string, unknown>;
    const content = item.content as Record<string, unknown>;
    expect(Array.isArray(content.paragraphs)).toBe(true);
    expect((content.paragraphs as string[]).length).toBeGreaterThan(0);
    const wordBank = content.wordBank as Record<string, unknown>;
    expect(Array.isArray(wordBank.words)).toBe(true);
    expect((wordBank.words as string[]).length).toBeGreaterThan(0);
  });
});