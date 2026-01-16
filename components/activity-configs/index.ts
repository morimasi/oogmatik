
import { ActivityType } from '../../types';
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
import { VerbalSkillConfig } from './VerbalSkillConfig';
import { FamilyLogicConfig } from './FamilyLogicConfig';
import { DrawingSkillConfig } from './DrawingSkillConfig';

// Bu harita, hangi ActivityType için hangi ayar bileşeninin render edileceğini belirler.
export const ActivityConfigRegistry: Record<string, any> = {
    [ActivityType.FIND_LETTER_PAIR]: FindLetterPairConfig,
    [ActivityType.READING_SUDOKU]: ReadingSudokuConfig,
    [ActivityType.SYLLABLE_MASTER_LAB]: SyllableMasterLabConfig,
    [ActivityType.MATH_PUZZLE]: MathPuzzleConfig,
    [ActivityType.READING_STROOP]: ReadingStroopConfig,
    [ActivityType.MAP_INSTRUCTION]: MapInstructionConfig,
    [ActivityType.CLOCK_READING]: ClockReadingConfig,
    [ActivityType.ALGORITHM_GENERATOR]: AlgorithmConfig,
    [ActivityType.VISUAL_ODD_ONE_OUT]: VisualPerceptionConfig,
    [ActivityType.FIND_THE_DIFFERENCE]: VisualPerceptionConfig,
    [ActivityType.HIDDEN_PASSWORD_GRID]: HiddenPasswordConfig,
    [ActivityType.NUMBER_LOGIC_RIDDLES]: MathLogicRiddleConfig,
    [ActivityType.NUMBER_PATTERN]: MathLogicRiddleConfig,
    [ActivityType.MONEY_COUNTING]: FinancialMathConfig,
    [ActivityType.STORY_COMPREHENSION]: StoryStudioConfig,
    [ActivityType.SYLLABLE_WORD_BUILDER]: VerbalSkillConfig,
    [ActivityType.SYNONYM_ANTONYM_MATCH]: VerbalSkillConfig,
    [ActivityType.LETTER_VISUAL_MATCHING]: VerbalSkillConfig,
    [ActivityType.FAMILY_RELATIONS]: FamilyLogicConfig,
    [ActivityType.FAMILY_LOGIC_TEST]: FamilyLogicConfig,
    [ActivityType.GRID_DRAWING]: DrawingSkillConfig,
    [ActivityType.SYMMETRY_DRAWING]: DrawingSkillConfig,
};
