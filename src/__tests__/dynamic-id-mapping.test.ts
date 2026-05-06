import { mapDynamicIdToActivityType } from '../utils/dynamicIdMappings'
import { ActivityType } from '../types/activity'

describe('Dynamic ID mappings', () => {
  test('maps Msc0QEAM8Ax1bcIWJ33v to MAP_INSTRUCTION', () => {
    expect(mapDynamicIdToActivityType('Msc0QEAM8Ax1bcIWJ33v')).toBe(ActivityType.MAP_INSTRUCTION)
  })

  test('maps ücgwen_1769002912962 to SHAPE_COUNTING', () => {
    expect(mapDynamicIdToActivityType('ücgwen_1769002912962')).toBe(ActivityType.SHAPE_COUNTING)
  })

  test('unknown id returns undefined', () => {
    expect(mapDynamicIdToActivityType('UNKNOWN_ID')).toBeUndefined()
  })
})
