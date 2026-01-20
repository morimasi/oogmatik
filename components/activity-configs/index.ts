
import { ActivityType } from '../../types';
import { MathMemoryCardsConfig } from './MathMemoryCardsConfig';
import { FindLetterPairConfig } from './FindLetterPairConfig';
import { ReadingSudokuConfig } from './ReadingSudokuConfig';
import { SyllableMasterLabConfig } from './SyllableMasterLabConfig';
import { MathPuzzleConfig } from './MathPuzzleConfig';
import { ReadingStroopConfig } from './ReadingStroopConfig';
import { MapInstructionConfig } from './MapInstructionConfig';
import { ClockReadingConfig } from './ClockReadingConfig';
import { AlgorithmConfig } from './AlgorithmConfig';
import { VisualPerceptionConfig } from './VisualPerceptionConfig';
import { HiddenPasswordConfig } from './HiddenPasswordConfig';
import { MathLogicRiddleConfig } from './MathLogicRiddleConfig';
import { FinancialMathConfig } from './FinancialMathConfig';
import { StoryStudioConfig } from './StoryStudioConfig';
import { FamilyLogicConfig } from './FamilyLogicConfig';
import { DrawingSkillConfig } from './DrawingSkillConfig';
import { VerbalSkillConfig } from './VerbalSkillConfig';
import { FamilyRelationsConfig } from './FamilyRelationsConfig';
import { WordSearchConfig } from './WordSearchConfig';
import { FindDifferenceConfig } from './FindDifferenceConfig';
import { ShapeCountingConfig } from './ShapeCountingConfig';
import { MorphologyConfig } from './MorphologyConfig';
import { ReadingPyramidConfig } from './ReadingPyramidConfig';
import { NumberPathLogicConfig } from './NumberPathLogicConfig';
import { DirectionalTrackingConfig } from './DirectionalTrackingConfig';

export const ActivityConfigRegistry: Record<string, any> = {
    [ActivityType.MATH_MEMORY_CARDS]: MathMemoryCardsConfig,
    [ActivityType.FIND_LETTER_PAIR]: FindLetterPairConfig,
    [ActivityType.READING_SUDOKU]: ReadingSudokuConfig,
    [ActivityType.SYLLABLE_MASTER_LAB]: SyllableMasterLabConfig,
    [ActivityType.MATH_PUZZLE]: MathPuzzleConfig,
    [ActivityType.READING_STROOP]: ReadingStroopConfig,
    [ActivityType.MAP_INSTRUCTION]: MapInstructionConfig,
    [ActivityType.CLOCK_READING]: ClockReadingConfig,
    [ActivityType.ALGORITHM_GENERATOR]: AlgorithmConfig,
    [ActivityType.VISUAL_ODD_ONE_OUT]: VisualPerceptionConfig,
    [ActivityType.HIDDEN_PASSWORD_GRID]: HiddenPasswordConfig,
    [ActivityType.NUMBER_LOGIC_RIDDLES]: MathLogicRiddleConfig,
    [ActivityType.MONEY_COUNTING]: FinancialMathConfig,
    [ActivityType.STORY_COMPREHENSION]: StoryStudioConfig,
    [ActivityType.FAMILY_LOGIC_TEST]: FamilyLogicConfig,
    [ActivityType.GRID_DRAWING]: DrawingSkillConfig,
    [ActivityType.SYNONYM_ANTONYM_MATCH]: VerbalSkillConfig,
    [ActivityType.FAMILY_RELATIONS]: FamilyRelationsConfig,
    [ActivityType.WORD_SEARCH]: WordSearchConfig,
    [ActivityType.FIND_THE_DIFFERENCE]: FindDifferenceConfig,
    [ActivityType.SHAPE_COUNTING]: ShapeCountingConfig,
    [ActivityType.MORPHOLOGY_MATRIX]: MorphologyConfig,
    [ActivityType.READING_PYRAMID]: ReadingPyramidConfig,
    [ActivityType.NUMBER_PATH_LOGIC]: NumberPathLogicConfig,
    [ActivityType.DIRECTIONAL_TRACKING]: DirectionalTrackingConfig,
};
