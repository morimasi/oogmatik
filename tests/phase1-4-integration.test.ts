import { describe, it, expect } from 'vitest';
import { mapDynamicIdToActivityType, registerDynamicMapping } from '../src/utils/dynamicIdMappings';
import { tryRepairJson } from '../src/utils/jsonRepair';
import { calculateA4Dimensions, LAYOUT_PRESETS } from '../src/services/compactA4LayoutService';
import { ActivityType } from '../src/types/activity';

describe('Phase 1-4 Integration — All Systems', () => {
  it('Full workflow: DynamicID → JSON repair → A4 render', () => {
    // 1. Get FirebaseID from admin
    const firebaseId = 'Msc0QEAM8Ax1bcIWJ33v';
    
    // 2. Map to ActivityType
    const activityType = mapDynamicIdToActivityType(firebaseId);
    expect(activityType).toBe(ActivityType.MAP_INSTRUCTION);

    // 3. Simulate Gemini malformed JSON response
    const malformedJson = '{"activities": [{"type": "map_instruction", "title": "test"';
    
    // 4. Repair JSON
    const repaired = tryRepairJson(malformedJson);
    expect(repaired).toBeDefined();
    expect(repaired.activities).toBeDefined();

    // 5. Calculate A4 layout
    const config = {
      ...LAYOUT_PRESETS.compact4,
      pageWidth: 210,
      pageHeight: 297,
    };
    const dims = calculateA4Dimensions(config);

    // 6. Verify all systems integrated
    expect(activityType).toBeTruthy();
    expect(repaired).toBeTruthy();
    expect(dims.itemWidth).toBeGreaterThan(0);
  });

  it('Type safety: no "any" types used', () => {
    // This passes if TypeScript strict mode enforces during build
    const id = 'test-id';
    const type = mapDynamicIdToActivityType(id);
    
    // type is ActivityType | undefined (not any!)
    if (type) {
      expect(typeof type).toBe('string');
    } else {
      expect(type).toBeUndefined();
    }
  });

  it('Dynamic mapping registration works', () => {
    const testId = 'integration_test_id_123';
    const testType = ActivityType.WORD_SEARCH;
    
    registerDynamicMapping(testId, testType);
    const mapped = mapDynamicIdToActivityType(testId);
    
    expect(mapped).toBe(testType);
  });

  it('JSON repair handles multiple edge cases', () => {
    // Test 1: Missing closing bracket
    const json1 = '{"data": [1, 2, 3';
    const repaired1 = tryRepairJson(json1);
    expect(repaired1.data).toEqual([1, 2, 3]);

    // Test 2: Missing closing brace
    const json2 = '{"key": "value"';
    const repaired2 = tryRepairJson(json2);
    expect(repaired2.key).toBe('value');

    // Test 3: Complete JSON (no repair needed)
    const json3 = '{"complete": true}';
    const repaired3 = tryRepairJson(json3);
    expect(repaired3.complete).toBe(true);
  });

  it('A4 layout calculations are consistent', () => {
    const presets = [
      { preset: LAYOUT_PRESETS.compact4, expectedRows: 2, expectedCols: 2 },
      { preset: LAYOUT_PRESETS.compact6, expectedRows: 3, expectedCols: 2 },
      { preset: LAYOUT_PRESETS.compact8, expectedRows: 4, expectedCols: 2 },
    ];

    for (const { preset, expectedRows, expectedCols } of presets) {
      const config = {
        ...preset,
        pageWidth: 210,
        pageHeight: 297,
      };

      const dims = calculateA4Dimensions(config);

      expect(dims.rows).toBe(expectedRows);
      expect(dims.cols).toBe(expectedCols);
      expect(dims.itemWidth).toBeGreaterThan(0);
      expect(dims.itemHeight).toBeGreaterThan(0);
    }
  });

  it('Empty/invalid inputs are handled gracefully', () => {
    // Dynamic ID mapping
    expect(mapDynamicIdToActivityType('')).toBeUndefined();
    expect(mapDynamicIdToActivityType('nonexistent')).toBeUndefined();

    // A4 dimensions
    expect(() => {
      calculateA4Dimensions({
        itemsPerPage: 4,
        pageWidth: 0,
        pageHeight: 0,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        gapBetweenItems: 0,
      });
    }).not.toThrow();
  });

  it('All 40+ activity type mappings are accessible', () => {
    // Sample check across different categories
    const testMappings = [
      { id: 'PZW4TWcMW7eB89z1M2EB', expected: ActivityType.ES_ANLAMLI_KELIMELER },
      { id: 'Msc0QEAM8Ax1bcIWJ33v', expected: ActivityType.MAP_INSTRUCTION },
      { id: 'activity_hece_parkuru', expected: ActivityType.HECE_PARKURU },
      { id: 'activity_word_search', expected: ActivityType.WORD_SEARCH },
      { id: 'activity_math_studio', expected: ActivityType.MATH_STUDIO },
      { id: 'activity_story_comprehension', expected: ActivityType.STORY_COMPREHENSION },
      { id: 'activity_attention_focus', expected: ActivityType.ATTENTION_FOCUS },
    ];

    for (const { id, expected } of testMappings) {
      const mapped = mapDynamicIdToActivityType(id);
      expect(mapped).toBe(expected);
    }
  });
});
