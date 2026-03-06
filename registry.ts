
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
export const getDefaultOptionsForActivity = (activityId: ActivityType | string): GeneratorOptions => {
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
        default:
            return base;
    }
};
