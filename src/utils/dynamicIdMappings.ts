import { ActivityType } from '../types/activity';

// Centralized dynamic Firestore ID mappings to internal ActivityType values.
export const DYNAMIC_ID_MAPPINGS: Record<string, ActivityType> = {
  'PZW4TWcMW7eB89z1M2EB': ActivityType.ES_ANLAMLI_KELIMELER,
  'L0L6Y9PrZNzsiJ2Ott7g': ActivityType.MATH_PUZZLE,
  'vY3R8kM9z1P2Q3R4S5T6': ActivityType.NUMBER_LOGIC_RIDDLES,
  'k3R8kM9z1P2Q3R4S5T6a': ActivityType.BRAIN_TEASERS,
  'MfH9I6jyuvHJWTadIb91': ActivityType.NUMBER_SENSE,
  'ücgwen_1769002912962': ActivityType.SHAPE_COUNTING,
  'Msc0QEAM8Ax1bcIWJ33v': ActivityType.MAP_INSTRUCTION,
};

export function mapDynamicIdToActivityType(id: string): ActivityType | undefined {
  return DYNAMIC_ID_MAPPINGS[id];
}

export default mapDynamicIdToActivityType;
