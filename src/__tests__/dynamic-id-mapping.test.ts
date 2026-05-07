import { describe, test, expect } from 'vitest';
import { mapDynamicIdToActivityType, registerDynamicMapping } from '../utils/dynamicIdMappings';
import { ActivityType } from '../types/activity';

describe('DynamicIdMappings — Extended 40+ Mappings', () => {
  // Original 3 tests (preserved)
  test('maps Msc0QEAM8Ax1bcIWJ33v to MAP_INSTRUCTION', () => {
    expect(mapDynamicIdToActivityType('Msc0QEAM8Ax1bcIWJ33v')).toBe(ActivityType.MAP_INSTRUCTION)
  })

  test('maps ücgwen_1769002912962 to SHAPE_COUNTING', () => {
    expect(mapDynamicIdToActivityType('ücgwen_1769002912962')).toBe(ActivityType.SHAPE_COUNTING)
  })

  test('unknown id returns undefined', () => {
    expect(mapDynamicIdToActivityType('UNKNOWN_ID')).toBeUndefined()
  })

  // New extended tests (5 additional cases = 8 total)
  test('maps all core activity types (sample check)', () => {
    // Original mappings
    expect(mapDynamicIdToActivityType('PZW4TWcMW7eB89z1M2EB')).toBe(ActivityType.ES_ANLAMLI_KELIMELER)
    expect(mapDynamicIdToActivityType('L0L6Y9PrZNzsiJ2Ott7g')).toBe(ActivityType.MATH_PUZZLE)
    expect(mapDynamicIdToActivityType('vY3R8kM9z1P2Q3R4S5T6')).toBe(ActivityType.NUMBER_LOGIC_RIDDLES)
    expect(mapDynamicIdToActivityType('k3R8kM9z1P2Q3R4S5T6a')).toBe(ActivityType.BRAIN_TEASERS)
    expect(mapDynamicIdToActivityType('MfH9I6jyuvHJWTadIb91')).toBe(ActivityType.NUMBER_SENSE)
    
    // Extended mappings (spot check)
    expect(mapDynamicIdToActivityType('activity_hece_parkuru')).toBe(ActivityType.HECE_PARKURU)
    expect(mapDynamicIdToActivityType('activity_word_search')).toBe(ActivityType.WORD_SEARCH)
    expect(mapDynamicIdToActivityType('activity_math_studio')).toBe(ActivityType.MATH_STUDIO)
    expect(mapDynamicIdToActivityType('activity_story_comprehension')).toBe(ActivityType.STORY_COMPREHENSION)
  })

  test('returns undefined for empty/null-like strings', () => {
    expect(mapDynamicIdToActivityType('')).toBeUndefined()
    expect(mapDynamicIdToActivityType('  ')).toBeUndefined()
  })

  test('supports dynamic registration via registerDynamicMapping', () => {
    const testId = 'test_dynamic_id_12345'
    const testType = ActivityType.WORD_SEARCH // Use existing type
    
    registerDynamicMapping(testId, testType)
    expect(mapDynamicIdToActivityType(testId)).toBe(testType)
  })

  test('handles edge cases gracefully', () => {
    // Non-existent IDs should return undefined
    expect(mapDynamicIdToActivityType('non-existent-id-xyz')).toBeUndefined()
    expect(mapDynamicIdToActivityType('undefined')).toBeUndefined()
    expect(mapDynamicIdToActivityType('null')).toBeUndefined()
  })

  test('registerDynamicMapping throws on empty firebaseId', () => {
    expect(() => registerDynamicMapping('', ActivityType.WORD_SEARCH)).toThrow('firebaseId cannot be empty')
    expect(() => registerDynamicMapping('  ', ActivityType.WORD_SEARCH)).toThrow('firebaseId cannot be empty')
  })
})
