import { ActivityType, GeneratorOptions, CognitiveErrorTag } from './types';
import { ActivityConfigRegistry } from './components/activity-configs';

// Her aktivitenin hedeflediği ana klinik alanlar
export const CLINICAL_PRIORITIES: Record<ActivityType | string, CognitiveErrorTag[]> = {
  [ActivityType.FIND_LETTER_PAIR]: ['visual_discrimination', 'attention_lapse'],
  [ActivityType.READING_STROOP]: ['impulsivity_error', 'attention_lapse'],
  [ActivityType.SYLLABLE_MASTER_LAB]: ['phonological_substitution', 'sequencing_error'],
  [ActivityType.MIRROR_LETTERS]: ['visual_reversal', 'visual_inversion'],
  // Fix: Removed 'as any' since 'logical_reasoning' is now added to CognitiveErrorTag
  [ActivityType.NUMBER_LOGIC_RIDDLES]: ['logical_reasoning', 'working_memory_overflow'],
  [ActivityType.ABC_CONNECT]: ['visual_spatial_memory', 'logical_reasoning'],
  [ActivityType.ODD_EVEN_SUDOKU]: ['logical_reasoning', 'selective_attention'],
  [ActivityType.FUTOSHIKI]: ['logical_reasoning', 'processing_speed'],
  [ActivityType.MAGIC_PYRAMID]: ['logical_reasoning', 'phonological_loop'],
  [ActivityType.CAPSULE_GAME]: ['logical_reasoning', 'working_memory_overflow'],
  [ActivityType.AI_WORKSHEET_CONVERTER]: ['logical_reasoning', 'selective_attention'],
  [ActivityType.VISUAL_INTERPRETATION]: ['visual_discrimination', 'logical_reasoning'],
  [ActivityType.BRAIN_TEASERS]: ['logical_reasoning', 'processing_speed'],
  [ActivityType.BOX_MATH]: ['logical_reasoning', 'working_memory_overflow'],
};

/**
 * Aktiviteye özel ayar bileşenini getirir.
 */
export const getActivityConfigComponent = (activityId: ActivityType | string) => {
  return ActivityConfigRegistry[activityId as string];
};

/**
 * Bir aktivite için varsayılan akıllı ayarları getirir.
 */
export const getDefaultOptionsForActivity = (
  activityId: ActivityType | string
): GeneratorOptions => {
  const base: GeneratorOptions = {
    mode: 'fast',
    difficulty: 'Orta',
    worksheetCount: 1,
    itemCount: 10,
  };

  // Aktiviteye özel default overrides
  switch (activityId) {
    case ActivityType.FIND_LETTER_PAIR:
      return { ...base, itemCount: 1, gridSize: 10 };
    case ActivityType.SYLLABLE_MASTER_LAB:
      return { ...base, itemCount: 24, variant: 'split' };
    case ActivityType.NUMBER_LOGIC_RIDDLES:
      return { ...base, itemCount: 6, gridSize: 3 };
    case ActivityType.ABC_CONNECT:
      return { ...base, itemCount: 1, gridSize: 5 };
    case ActivityType.ODD_EVEN_SUDOKU:
      return { ...base, itemCount: 1, gridSize: 4 };
    case ActivityType.FUTOSHIKI:
      return { ...base, itemCount: 1, gridSize: 4 };
    case ActivityType.MAGIC_PYRAMID:
      return { ...base, itemCount: 1, pyramidHeight: 5 };
    case ActivityType.CAPSULE_GAME:
      return { ...base, itemCount: 1, gridSize: 5 };
    case ActivityType.AI_WORKSHEET_CONVERTER:
      return { ...base, mode: 'ai', itemCount: 10, variant: 'cloze', topic: 'TR' };
    case ActivityType.FIVE_W_ONE_H:
      return {
        ...base,
        mode: 'ai',
        itemCount: 1,
        difficulty: 'Orta',
        textLength: 'kısa',
        topic: 'Genel Hikaye',
        questionStyle: 'test_and_open',
        syllableColoring: false,
      };
    case ActivityType.COLORFUL_SYLLABLE_READING:
      return {
        ...base,
        mode: 'ai',
        itemCount: 1,
        difficulty: 'Orta',
        textLength: 'kısa',
        wpmTarget: 60,
        highlightType: 'syllables',
        colorPalette: 'red_blue',
        topic: 'Uzay Macerası',
      };
    case ActivityType.FAMILY_TREE_MATRIX:
      return {
        ...base,
        mode: 'ai',
        itemCount: 1,
        difficulty: 'Orta',
        familySize: 'nuclear',
        clueComplexity: 'logical',
        emptyNodesCount: 2,
      };
    case ActivityType.APARTMENT_LOGIC_PUZZLE:
      return {
        ...base,
        mode: 'ai',
        itemCount: 1,
        difficulty: 'Orta',
        apartmentFloors: 2,
        apartmentRoomsPerFloor: 3,
        variableCount: 2,
        negativeClues: false,
      };
    case ActivityType.FINANCIAL_MARKET_CALCULATOR:
      return {
        ...base,
        mode: 'ai',
        itemCount: 4,
        difficulty: 'Orta',
        currency: 'TRY',
        useCents: false,
        budgetLimit: 100,
        cartSize: 2,
      };
    case ActivityType.DIRECTIONAL_CODE_READING:
      return {
        ...base,
        mode: 'ai',
        itemCount: 1,
        difficulty: 'Orta',
        gridSize: 6,
        obstacleDensity: 20,
        cipherType: 'arrows',
      };
    case ActivityType.LOGIC_ERROR_HUNTER:
      return {
        ...base,
        mode: 'ai',
        itemCount: 1,
        difficulty: 'Orta',
        absurdityDegree: 'obvious',
        errorCount: 3,
      };
    case ActivityType.PATTERN_COMPLETION:
      return {
        ...base,
        mode: 'ai',
        itemCount: 1,
        difficulty: 'Orta',
        gridSize: 3,
        patternType: 'geometric',
      };
    case ActivityType.VISUAL_INTERPRETATION:
      return {
        ...base,
        mode: 'ai',
        itemCount: 5,
        difficulty: 'Orta',
        topic: 'daily_life',
        visualStyle: 'illustration',
        questionStyle: 'mixed',
      };
    case ActivityType.BRAIN_TEASERS:
      return {
        ...base,
        mode: 'ai',
        itemCount: 3,
        difficulty: 'Orta',
        topic: 'mixed',
        hintLevel: 'low',
      };
    case ActivityType.BOX_MATH:
      return { ...base, itemCount: 12, variant: 'reverse' };
    case ActivityType.SENTENCE_5W1H:
      return {
        ...base,
        mode: 'ai',
        itemCount: 5,
        difficulty: 'Orta',
        ageGroup: '8-10',
        topic: 'Genel',
        profile: 'dyslexia',
      };
    case ActivityType.INFOGRAPHIC_SHORT_ANSWER:
      return {
        ...base,
        mode: 'ai',
        difficulty: 'Orta',
        topic: 'Genel Bilgi',
        params: {
          questionCount: '15',
          lineCount: 2,
          colorMode: 'Karma Renkli'
        }
      };
    case ActivityType.QUEUE_ORDERING:
      return {
        ...base,
        mode: 'ai',
        itemCount: 1,
        difficulty: 'Orta',
        locationType: 'school',
        theme: 'indigo',
        problemCount: 4,
        maxQueueSize: 10,
        showVisualClues: true,
        showPositionNumbers: true,
        iconStyle: 'emoji',
      };
    default:
      return base;
  }
};
