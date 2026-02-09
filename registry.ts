
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
    switch(activityId) {
        case ActivityType.FIND_LETTER_PAIR:
            return { ...base, itemCount: 1, gridSize: 10 };
        case ActivityType.SYLLABLE_MASTER_LAB:
            return { ...base, itemCount: 24, variant: 'split' };
        case ActivityType.NUMBER_LOGIC_RIDDLES:
            return { ...base, itemCount: 6, gridSize: 3 };
        default:
            return base;
    }
};
