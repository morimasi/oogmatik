/**
 * @file src/services/generators/infographic/infographicRegistry.ts
 * @description ActivityType → InfographicGeneratorPair merkezi kayıt defteri.
 *
 * Bora Demir standardı: any yasak, tüm tipler explicit.
 * Selin Arslan: getSchema() ile customizationSchema erişimi.
 */

import { ActivityType } from '../../../types/activity';
import { InfographicGeneratorPair, CustomizationSchema } from '../../../types/infographic';

import {
  INFOGRAPHIC_CONCEPT_MAP,
  INFOGRAPHIC_COMPARE,
  INFOGRAPHIC_VISUAL_LOGIC,
  INFOGRAPHIC_VENN_DIAGRAM,
  INFOGRAPHIC_MIND_MAP,
  INFOGRAPHIC_FLOWCHART,
  INFOGRAPHIC_MATRIX_ANALYSIS,
  INFOGRAPHIC_CAUSE_EFFECT,
  INFOGRAPHIC_FISHBONE,
  INFOGRAPHIC_CLUSTER_MAP,
} from './infographicAdapter';

import { INFOGRAPHIC_ADAPTERS_REMAINING_84 } from './infographicFactory';

// ── Kat 1: Görsel & Mekansal (infographicAdapter.ts'ten) ────────────────────
const KAT1_PAIRS: Record<string, InfographicGeneratorPair> = {
  INFOGRAPHIC_CONCEPT_MAP,
  INFOGRAPHIC_COMPARE,
  INFOGRAPHIC_VISUAL_LOGIC,
  INFOGRAPHIC_VENN_DIAGRAM,
  INFOGRAPHIC_MIND_MAP,
  INFOGRAPHIC_FLOWCHART,
  INFOGRAPHIC_MATRIX_ANALYSIS,
  INFOGRAPHIC_CAUSE_EFFECT,
  INFOGRAPHIC_FISHBONE,
  INFOGRAPHIC_CLUSTER_MAP,
};

// ── Tam kayıt (Kat 1 + kalan 84) ────────────────────────────────────────────
const FULL_REGISTRY: Record<string, InfographicGeneratorPair> = {
  ...KAT1_PAIRS,
  ...INFOGRAPHIC_ADAPTERS_REMAINING_84,
};

/**
 * ActivityType'a karşılık gelen InfographicGeneratorPair'ı döndürür.
 * Bulunamazsa undefined döner — çağıran taraf null-check yapmalı.
 */
export function getInfographicGeneratorPair(
  activityType: ActivityType
): InfographicGeneratorPair | undefined {
  return FULL_REGISTRY[activityType as string];
}

/**
 * ActivityType'a karşılık gelen customizationSchema'yı döndürür.
 * Bulunamazsa boş schema döner (sıfır parametre).
 */
export function getActivityCustomizationSchema(
  activityType: ActivityType
): CustomizationSchema {
  const pair = getInfographicGeneratorPair(activityType);
  return pair?.customizationSchema ?? { parameters: [] };
}

/**
 * Tüm kayıtlı ActivityType'ların listesini döndürür.
 */
export function getAllRegisteredActivityTypes(): ActivityType[] {
  return Object.keys(FULL_REGISTRY) as ActivityType[];
}
