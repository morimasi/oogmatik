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
import { FutoshikiConfig } from './FutoshikiConfig';
import { AbcConnectConfig } from './AbcConnectConfig';
import { ArchCloneConfig } from './ArchCloneConfig';
import { FiveWOneHConfig } from './FiveWOneHConfig';
import { ColorfulSyllableReadingConfig } from './ColorfulSyllableReadingConfig';
import { FamilyTreeMatrixConfig } from './FamilyTreeMatrixConfig';
import { ApartmentLogicConfig } from './ApartmentLogicConfig';
import { FinancialMarketConfig } from './FinancialMarketConfig';
import { DirectionalCodeReadingConfig } from './DirectionalCodeReadingConfig';
import { LogicErrorHunterConfig } from './LogicErrorHunterConfig';
import { PatternCompletionConfig } from './PatternCompletionConfig';
import { VisualInterpretationConfig } from './VisualInterpretationConfig';
import { BrainTeasersConfig } from './BrainTeasersConfig';
import { BoxMathConfig } from './BoxMathConfig';

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
  [ActivityType.FUTOSHIKI]: FutoshikiConfig,
  [ActivityType.ABC_CONNECT]: AbcConnectConfig,
  [ActivityType.AI_WORKSHEET_CONVERTER]: ArchCloneConfig,
  [ActivityType.FIVE_W_ONE_H]: FiveWOneHConfig,
  [ActivityType.COLORFUL_SYLLABLE_READING]: ColorfulSyllableReadingConfig,
  [ActivityType.FAMILY_TREE_MATRIX]: FamilyTreeMatrixConfig,
  [ActivityType.APARTMENT_LOGIC_PUZZLE]: ApartmentLogicConfig,
  [ActivityType.FINANCIAL_MARKET_CALCULATOR]: FinancialMarketConfig,
  [ActivityType.DIRECTIONAL_CODE_READING]: DirectionalCodeReadingConfig,
  [ActivityType.LOGIC_ERROR_HUNTER]: LogicErrorHunterConfig,
  [ActivityType.PATTERN_COMPLETION]: PatternCompletionConfig,
  [ActivityType.VISUAL_INTERPRETATION]: VisualInterpretationConfig,
  [ActivityType.BRAIN_TEASERS]: BrainTeasersConfig,
  [ActivityType.BOX_MATH]: BoxMathConfig,
};
