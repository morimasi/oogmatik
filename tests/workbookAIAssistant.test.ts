/**
 * Workbook AI Assistant — Unit Tests
 *
 * @author Selin Arslan (AI Muhendisi)
 * @created 2026-04-02
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  contentValidator,
  type ValidationResult,
} from '../src/services/workbookAIAssistant/validators/contentValidator';
import {
  compressItemsForPrompt,
  buildWorkbookContext,
} from '../src/services/workbookAIAssistant/prompts/workbookPrompts';
import { AssistantCache } from '../src/services/workbookAIAssistant/cache/assistantCache';
import type { CollectionItem, WorkbookSettings } from '../src/types';
import { ActivityType } from '../src/types';

// ============================================================
// MOCK DATA
// ============================================================

const mockItem = (overrides: Partial<CollectionItem> = {}): CollectionItem =>
  ({
    id: 'test-item-1',
    activityType: ActivityType.FIVE_W_ONE_H,
    title: 'Test Aktivite',
    data: [],
    settings: {} as any,
    ...overrides,
  }) as any;

const mockSettings = (overrides: Partial<WorkbookSettings> = {}): WorkbookSettings =>
  ({
    title: 'Test Kitapcik',
    studentName: 'Test Ogrenci',
    ...overrides,
  }) as any;

// ============================================================
// CONTENT VALIDATOR TESTS
// ============================================================

describe('ContentValidator', () => {
  describe('validateSchema', () => {
    it('should pass when all required fields exist', () => {
      const data = { suggestions: [], analysisNote: 'Test' };
      const result = contentValidator.validateSchema(data, ['suggestions', 'analysisNote']);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when required fields are missing', () => {
      const data = { suggestions: [] };
      const result = contentValidator.validateSchema(data, ['suggestions', 'analysisNote']);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Eksik alan: analysisNote');
    });

    it('should fail for non-object data', () => {
      const result = contentValidator.validateSchema('not an object', ['field']);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('obje bekleniyor');
    });
  });

  describe('validateActivityTypes', () => {
    it('should pass for valid ActivityType values', () => {
      const suggestions = [
        {
          activityType: 'FIVE_W_ONE_H',
          reason: 'Test',
          recommendedDifficulty: 'Orta' as const,
          targetSkills: ['skill1'],
        },
      ];
      const result = contentValidator.validateActivityTypes(suggestions);

      expect(result.isValid).toBe(true);
    });

    it('should fail for invalid ActivityType values', () => {
      const suggestions = [
        {
          activityType: 'INVALID_TYPE',
          reason: 'Test',
          recommendedDifficulty: 'Orta' as const,
          targetSkills: ['skill1'],
        },
      ];
      const result = contentValidator.validateActivityTypes(suggestions);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Gecersiz aktivite turu');
    });
  });

  describe('validatePedagogicalSafety', () => {
    it('should pass for safe content', () => {
      const content = { note: 'Bu aktivite ogrenmeyi destekler' };
      const result = contentValidator.validatePedagogicalSafety(content);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn for negative language', () => {
      const content = { note: 'Ogrenci bunu yapamaz' };
      const result = contentValidator.validatePedagogicalSafety(content);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Olumsuz dil');
    });

    it('should reject inappropriate content', () => {
      const content = { note: 'Siddet iceren ornek' };
      const result = contentValidator.validatePedagogicalSafety(content);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Uygunsuz icerik');
    });

    it('should reject multiple inappropriate patterns', () => {
      const content = { note: 'Korku ve olum temali icerik' };
      const result = contentValidator.validatePedagogicalSafety(content);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateContextConsistency', () => {
    it('should warn when too many hard activities exist', () => {
      const suggestion = {
        activityType: 'FIVE_W_ONE_H',
        reason: 'Test',
        recommendedDifficulty: 'Zor' as const,
        targetSkills: ['skill1'],
      };
      const context = buildWorkbookContext([], mockSettings(), undefined);
      context.difficultyDistribution = { easy: 10, medium: 50, hard: 40 };

      const result = contentValidator.validateContextConsistency(suggestion, context);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('cok fazla zor aktivite');
    });
  });
});

// ============================================================
// PROMPT BUILDER TESTS
// ============================================================

describe('Prompt Builders', () => {
  describe('compressItemsForPrompt', () => {
    it('should compress items to pipe-separated format', () => {
      const items = [
        mockItem({ activityType: ActivityType.FIVE_W_ONE_H, title: 'Test 1' }),
        mockItem({ activityType: ActivityType.MATH_PUZZLE, title: 'Test 2' }),
      ];

      const result = compressItemsForPrompt(items);

      expect(result).toContain('1|FIVE_W_ONE_H|');
      expect(result).toContain('2|MATH_PUZZLE|');
      expect(result.split('\n')).toHaveLength(2);
    });

    it('should mark dividers with DIV', () => {
      const items = [mockItem({ itemType: 'divider', title: 'Bolum 1' })];

      const result = compressItemsForPrompt(items);

      expect(result).toContain('|DIV|');
    });

    it('should truncate long titles', () => {
      const items = [mockItem({ title: 'Bu cok uzun bir baslik ve kisaltilmali' })];

      const result = compressItemsForPrompt(items);
      const titlePart = result.split('|')[2];

      expect(titlePart.length).toBeLessThanOrEqual(25);
    });
  });

  describe('buildWorkbookContext', () => {
    it('should calculate activity distribution', () => {
      const items = [
        mockItem({ activityType: ActivityType.FIVE_W_ONE_H }),
        mockItem({ activityType: ActivityType.FIVE_W_ONE_H }),
        mockItem({ activityType: ActivityType.MATH_PUZZLE }),
      ];

      const context = buildWorkbookContext(items, mockSettings());

      expect(context.activityDistribution).toContainEqual({
        type: ActivityType.FIVE_W_ONE_H,
        count: 2,
      });
      expect(context.activityDistribution).toContainEqual({
        type: ActivityType.MATH_PUZZLE,
        count: 1,
      });
    });

    it('should calculate difficulty distribution', () => {
      const items = [
        mockItem({ difficulty: 'Kolay' } as any),
        mockItem({ difficulty: 'Orta' } as any),
        mockItem({ difficulty: 'Zor' } as any),
      ];

      const context = buildWorkbookContext(items, mockSettings());

      expect(context.difficultyDistribution.easy).toBeCloseTo(33, 0);
      expect(context.difficultyDistribution.medium).toBeCloseTo(33, 0);
      expect(context.difficultyDistribution.hard).toBeCloseTo(33, 0);
    });

    it('should exclude dividers from calculations', () => {
      const items = [
        mockItem({ itemType: 'divider' }),
        mockItem({ activityType: ActivityType.FIVE_W_ONE_H }),
      ];

      const context = buildWorkbookContext(items, mockSettings());

      expect(context.activityDistribution).toHaveLength(1);
      expect(context.currentPageCount).toBe(2); // includes divider in page count
    });
  });
});

// ============================================================
// CACHE TESTS
// ============================================================

describe('AssistantCache', () => {
  let cache: AssistantCache;

  beforeEach(() => {
    cache = new AssistantCache();
  });

  describe('get/set', () => {
    it('should return null for non-existent key', async () => {
      const result = await cache.get('unknown prompt', {});
      expect(result).toBeNull();
    });

    it('should return cached data after set', async () => {
      const testData = { test: 'value' };
      await cache.set('test prompt', { schema: true }, testData);

      const result = await cache.get('test prompt', { schema: true });
      expect(result).toEqual(testData);
    });

    it('should return same result for same prompt/schema', async () => {
      const testData = { suggestions: [] };
      await cache.set('prompt', { type: 'test' }, testData);

      const result1 = await cache.get('prompt', { type: 'test' });
      const result2 = await cache.get('prompt', { type: 'test' });

      expect(result1).toEqual(result2);
    });

    it('should return different results for different prompts', async () => {
      await cache.set('prompt1', {}, { data: 1 });
      await cache.set('prompt2', {}, { data: 2 });

      const result1 = await cache.get('prompt1', {});
      const result2 = await cache.get('prompt2', {});

      expect(result1).toEqual({ data: 1 });
      expect(result2).toEqual({ data: 2 });
    });
  });

  describe('has', () => {
    it('should return false for non-existent key', async () => {
      const result = await cache.has('unknown', {});
      expect(result).toBe(false);
    });

    it('should return true for existing key', async () => {
      await cache.set('existing', {}, { data: true });
      const result = await cache.has('existing', {});
      expect(result).toBe(true);
    });
  });

  describe('invalidate', () => {
    it('should remove specific cache entry', async () => {
      await cache.set('to-remove', {}, { data: true });
      cache.invalidate('to-remove', {});

      const result = await cache.get('to-remove', {});
      expect(result).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should remove all cache entries', async () => {
      await cache.set('entry1', {}, { data: 1 });
      await cache.set('entry2', {}, { data: 2 });

      cache.clearAll();

      const stats = cache.getStats();
      expect(stats.memoryEntries).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return correct entry count', async () => {
      await cache.set('entry1', {}, {});
      await cache.set('entry2', {}, {});
      await cache.set('entry3', {}, {});

      const stats = cache.getStats();
      expect(stats.memoryEntries).toBe(3);
    });

    it('should track oldest entry', async () => {
      const before = Date.now();
      await cache.set('entry', {}, {});
      const after = Date.now();

      const stats = cache.getStats();
      expect(stats.oldestEntry).toBeGreaterThanOrEqual(before);
      expect(stats.oldestEntry).toBeLessThanOrEqual(after);
    });
  });
});

// ============================================================
// INTEGRATION TESTS (Mock AI)
// ============================================================

describe('WorkbookAIAssistant Integration', () => {
  // Mock generateWithSchema for integration tests
  vi.mock('../src/services/geminiClient', () => ({
    generateWithSchema: vi.fn().mockResolvedValue({
      suggestions: [
        {
          activityType: 'FIVE_W_ONE_H',
          reason: 'Mock reason',
          recommendedDifficulty: 'Orta',
          targetSkills: ['Mock skill'],
        },
      ],
      analysisNote: 'Mock analysis',
    }),
  }));

  it('should validate AI responses before returning', async () => {
    // This test verifies the validation pipeline works
    const mockResponse = {
      suggestions: [
        {
          activityType: 'FIVE_W_ONE_H',
          reason: 'Valid reason',
          recommendedDifficulty: 'Orta',
          targetSkills: ['Okudugunu anlama'],
        },
      ],
      analysisNote: 'Valid analysis note',
    };

    const validation = contentValidator.validateFull(
      mockResponse,
      buildWorkbookContext([], mockSettings()),
      {
        expectedFields: ['suggestions', 'analysisNote'],
        validateActivityTypes: true,
        checkPedagogicalSafety: true,
      }
    );

    expect(validation.isValid).toBe(true);
  });

  it('should reject AI responses with hallucinated activity types', async () => {
    const mockResponse = {
      suggestions: [
        {
          activityType: 'FAKE_ACTIVITY_TYPE_123',
          reason: 'Invalid reason',
          recommendedDifficulty: 'Orta',
          targetSkills: ['skill'],
        },
      ],
      analysisNote: 'Analysis',
    };

    const validation = contentValidator.validateFull(
      mockResponse,
      buildWorkbookContext([], mockSettings()),
      {
        validateActivityTypes: true,
      }
    );

    expect(validation.isValid).toBe(false);
    expect(validation.errors[0]).toContain('Gecersiz aktivite turu');
  });
});
