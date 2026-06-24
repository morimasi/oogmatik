// @ts-nocheck
import React from 'react';
import { ActivityType, StyleSettings } from '../../types';

import { AlgorithmSheet } from '../sheets/logic/AlgorithmSheet';
import { MathPuzzleSheet } from '../sheets/math/MathPuzzleSheet';
import { NumberPatternSheet } from '../sheets/math/NumberPatternSheet';
import { RealLifeMathProblemsSheet } from '../sheets/math/RealLifeMathProblemsSheet';
import { LogicGridPuzzleSheet } from '../sheets/math/LogicGridPuzzleSheet';
import { FutoshikiSheet } from '../sheets/math/FutoshikiSheet';
import { NumberPyramidSheet } from '../sheets/math/NumberPyramidSheet';
import { OddOneOutSheet } from '../sheets/math/OddOneOutSheet';
import { NumberLogicRiddleSheet } from '../sheets/math/NumberLogicRiddleSheet';
import { NumberPathLogicSheet } from '../sheets/math/NumberPathLogicSheet';
import { VisualArithmeticSheet } from '../sheets/math/VisualArithmeticSheet';
import { ClockReadingSheet } from '../sheets/math/ClockReadingSheet';
import { NumberSenseSheet } from '../sheets/math/NumberSenseSheet';
import { MoneyCountingSheet } from '../sheets/math/MoneyCountingSheet';
import { MathMemoryCardsSheet } from '../sheets/math/MathMemoryCardsSheet';
import { SpatialGridSheet } from '../sheets/math/SpatialGridSheet';
import { ConceptMatchSheet } from '../sheets/math/ConceptMatchSheet';
import { EstimationSheet } from '../sheets/math/EstimationSheet';
import { AbcConnectSheet } from '../sheets/math/AbcConnectSheet';
import { OddEvenSudokuSheet } from '../sheets/math/OddEvenSudokuSheet';
import { MagicPyramidSheet } from '../sheets/math/MagicPyramidSheet';
import { CapsuleGameSheet } from '../sheets/math/CapsuleGameSheet';
import {
  WordMemorySheet,
  VisualMemorySheet,
  CharacterMemorySheet,
  ColorWheelSheet,
  ImageComprehensionSheet,
} from '../sheets/attention/MemorySheets';
import { StroopTestSheet } from '../sheets/attention/StroopTestSheet';
import {
  BurdonTestSheet,
  NumberSearchSheet,
  AttentionDevelopmentSheet,
  ChaoticNumberSearchSheet,
  AttentionFocusSheet,
  FindDuplicateSheet,
  LetterGridTestSheet,
  TargetSearchSheet,
} from '../sheets/attention/AttentionSheets';
import { StoryAnalysisSheet } from '../sheets/verbal/StoryAnalysisSheet';
import { StorySequencingSheet } from '../sheets/verbal/StorySequencingSheet';
import { AdvancedMissingPartsSheet } from '../sheets/verbal/AdvancedMissingPartsSheet';
import { ShortAnswerSheet } from '../sheets/verbal/ShortAnswerSheet';
import { ReadingFlowSheet } from '../sheets/verbal/ReadingFlowSheet';
import {
  PhonologicalAwarenessSheet,
  RapidNamingSheet,
  LetterDiscriminationSheet,
  MirrorLettersSheet,
  SyllableTrainSheet,
  VisualTrackingLinesSheet,
  BackwardSpellingSheet,
  CodeReadingSheet,
  AttentionToQuestionSheet,
  HandwritingPracticeSheet,
} from '../sheets/verbal/ReadingSupportSheets';
import { SentenceFiveWOneHSheet } from '../sheets/verbal/SentenceFiveWOneHSheet';
import {
  AnagramSheet,
  WordSearchSheet,
  HiddenPasswordGridSheet,
  CrosswordSheet,
} from '../sheets/verbal/WordGameSheets';
import {
  SyllableMasterLabSheet,
  ReadingSudokuSheet,
  ReadingStroopSheet,
  SynonymAntonymMatchSheet,
  SyllableWordBuilderSheet,
  LetterVisualMatchingSheet,
  FamilyLogicSheet,
  FamilyRelationsSheet,
  FindLetterPairSheet,
  MorphologyMatrixSheet,
  ReadingPyramidSheet,
} from '../sheets/verbal/ReadingSheets';
import { FiveWOneHSheet } from '../sheets/verbal/FiveWOneHSheet';
import { ColorfulSyllableReadingSheet } from '../sheets/verbal/ColorfulSyllableReadingSheet';
import { FamilyTreeMatrixSheet } from '../sheets/verbal/FamilyTreeMatrixSheet';
import { ApartmentLogicSheet } from '../sheets/math/ApartmentLogicSheet';
import { FinancialMarketSheet } from '../sheets/math/FinancialMarketSheet';
import { DirectionalCodeReadingSheet } from '../sheets/visual/DirectionalCodeReadingSheet';
import { MapDetectiveSheet } from '../sheets/visual/MapDetectiveSheet';
import { FindTheDifferenceSheet } from '../sheets/visual/FindTheDifferenceSheet';
import { VisualOddOneOutSheet } from '../sheets/visual/VisualOddOneOutSheet';
import { LogicErrorHunterSheet } from '../sheets/verbal/LogicErrorHunterSheet';
import { PatternCompletionSheet } from '../sheets/visual/PatternCompletionSheet';
import { GridDrawingSheet } from '../sheets/visual/GridDrawingSheet';
import { SymmetryDrawingSheet } from '../sheets/visual/SymmetryDrawingSheet';
import { ShapeCountingSheet } from '../sheets/visual/ShapeCountingSheet';
import { DirectionalTrackingSheet } from '../sheets/visual/DirectionalTrackingSheet';
import { VisualInterpretationSheet } from '../sheets/visual/VisualInterpretationSheet';
import { BoxMathSheet } from '../sheets/math/BoxMathSheet';
import { QueueOrderingSheet } from '../sheet-renderers/QueueOrderingSheet';

export function renderLegacySheet(
  activityType: ActivityType | null,
  activeData: any,
  settings?: StyleSettings,
): React.ReactNode {
  let renderedSheet = null;

  switch (activityType) {
    case ActivityType.ALGORITHM_GENERATOR:
      renderedSheet = (
        <AlgorithmSheet data={activeData as unknown as unknown as unknown as unknown as AlgorithmData} settings={settings} />
      );
      break;
    case ActivityType.MATH_STUDIO:
    case ActivityType.MATH_PUZZLE:
      renderedSheet = (
        <MathPuzzleSheet data={activeData as unknown as unknown as unknown as unknown as MathPuzzleData} settings={settings} />
      );
      break;
    case ActivityType.NUMBER_PATTERN:
      renderedSheet = (
        <NumberPatternSheet data={activeData as unknown as unknown as unknown as unknown as NumberPatternData} settings={settings} />
      );
      break;
    case ActivityType.REAL_LIFE_MATH_PROBLEMS:
      renderedSheet = (
        <RealLifeMathProblemsSheet
          data={activeData as unknown as unknown as unknown as unknown as RealLifeProblemData}
          settings={settings}
        />
      );
      break;
    case ActivityType.LOGIC_GRID_PUZZLE:
      renderedSheet = (
        <LogicGridPuzzleSheet data={activeData as unknown as unknown as unknown as unknown as LogicGridPuzzleData} settings={settings} />
      );
      break;
    case ActivityType.FUTOSHIKI:
      renderedSheet = (
        <FutoshikiSheet data={activeData as unknown as unknown as unknown as unknown as FutoshikiData} settings={settings} />
      );
      break;
    case ActivityType.NUMBER_PYRAMID:
      renderedSheet = (
        <NumberPyramidSheet data={activeData as unknown as unknown as unknown as unknown as NumberPyramidData} settings={settings} />
      );
      break;
    case ActivityType.ODD_ONE_OUT:
      renderedSheet = (
        <OddOneOutSheet data={activeData as unknown as unknown as unknown as unknown as OddOneOutData} settings={settings} />
      );
      break;
    case ActivityType.NUMBER_LOGIC_RIDDLES:
      renderedSheet = (
        <NumberLogicRiddleSheet
          data={activeData as unknown as unknown as unknown as unknown as NumberLogicRiddleData}
          settings={settings}
        />
      );
      break;
    case ActivityType.NUMBER_PATH_LOGIC:
      renderedSheet = (
        <NumberPathLogicSheet data={activeData as unknown as unknown as unknown as unknown as NumberPathLogicData} settings={settings} />
      );
      break;
    case ActivityType.VISUAL_ARITHMETIC:
      renderedSheet = (
        <VisualArithmeticSheet
          data={activeData as unknown as unknown as unknown as unknown as VisualArithmeticData}
          settings={settings}
        />
      );
      break;
    case ActivityType.CLOCK_READING:
      renderedSheet = (
        <ClockReadingSheet data={activeData as unknown as unknown as unknown as unknown as ClockReadingData} settings={settings} />
      );
      break;
    case ActivityType.NUMBER_SENSE:
      renderedSheet = (
        <NumberSenseSheet data={activeData as unknown as unknown as unknown as unknown as NumberSenseData} settings={settings} />
      );
      break;
    case ActivityType.MONEY_COUNTING:
      renderedSheet = (
        <MoneyCountingSheet data={activeData as unknown as unknown as unknown as unknown as MoneyCountingData} settings={settings} />
      );
      break;
    case ActivityType.MATH_MEMORY_CARDS:
      renderedSheet = (
        <MathMemoryCardsSheet data={activeData as unknown as unknown as unknown as unknown as MathMemoryCardsData} settings={settings} />
      );
      break;
    case ActivityType.SPATIAL_GRID:
      renderedSheet = (
        <SpatialGridSheet data={activeData as unknown as unknown as unknown as unknown as SpatialGridData} settings={settings} />
      );
      break;
    case ActivityType.CONCEPT_MATCH:
      renderedSheet = (
        <ConceptMatchSheet data={activeData as unknown as unknown as unknown as unknown as ConceptMatchData} settings={settings} />
      );
      break;
    case ActivityType.ESTIMATION:
      renderedSheet = (
        <EstimationSheet data={activeData as unknown as unknown as unknown as unknown as EstimationData} settings={settings} />
      );
      break;
    case ActivityType.ABC_CONNECT:
      renderedSheet = (
        <AbcConnectSheet data={activeData as unknown as unknown as unknown as unknown as AbcConnectData} settings={settings} />
      );
      break;
    case ActivityType.ODD_EVEN_SUDOKU:
      renderedSheet = (
        <OddEvenSudokuSheet data={activeData as unknown as unknown as unknown as unknown as OddEvenSudokuData} settings={settings} />
      );
      break;
    case ActivityType.MAGIC_PYRAMID:
      renderedSheet = (
        <MagicPyramidSheet data={activeData as unknown as unknown as unknown as unknown as MagicPyramidData} settings={settings} />
      );
      break;
    case ActivityType.CAPSULE_GAME:
      renderedSheet = (
        <CapsuleGameSheet data={activeData as unknown as unknown as unknown as unknown as NumberCapsuleData} settings={settings} />
      );
      break;
    case ActivityType.WORD_MEMORY:
      renderedSheet = (
        <WordMemorySheet data={activeData as unknown as unknown as unknown as unknown as WordMemoryData} settings={settings} />
      );
      break;
    case ActivityType.VISUAL_MEMORY:
      renderedSheet = (
        <VisualMemorySheet data={activeData as unknown as unknown as unknown as unknown as VisualMemoryData} settings={settings} />
      );
      break;
    case ActivityType.CHARACTER_MEMORY:
      renderedSheet = (
        <CharacterMemorySheet data={activeData as unknown as unknown as unknown as unknown as CharacterMemoryData} settings={settings} />
      );
      break;
    case ActivityType.COLOR_WHEEL_MEMORY:
      renderedSheet = (
        <ColorWheelSheet data={activeData as unknown as unknown as unknown as unknown as ColorWheelMemoryData} settings={settings} />
      );
      break;
    case ActivityType.IMAGE_COMPREHENSION:
      renderedSheet = (
        <ImageComprehensionSheet
          data={activeData as unknown as unknown as unknown as unknown as ImageComprehensionData}
          settings={settings}
        />
      );
      break;
    case ActivityType.STROOP_TEST:
      renderedSheet = (
        <StroopTestSheet data={activeData as unknown as unknown as unknown as unknown as StroopTestData} settings={settings} />
      );
      break;
    case ActivityType.BURDON_TEST:
      renderedSheet = <BurdonTestSheet data={activeData as unknown as any} settings={settings} />;
      break;
    case ActivityType.LETTER_GRID_TEST:
      renderedSheet = (
        <LetterGridTestSheet data={activeData as unknown as unknown as unknown as unknown as LetterGridTestData} settings={settings} />
      );
      break;
    case ActivityType.NUMBER_SEARCH:
      renderedSheet = (
        <NumberSearchSheet data={activeData as unknown as unknown as unknown as unknown as NumberSearchData} settings={settings} />
      );
      break;
    case ActivityType.CHAOTIC_NUMBER_SEARCH:
      renderedSheet = (
        <ChaoticNumberSearchSheet
          data={activeData as unknown as unknown as unknown as unknown as ChaoticNumberSearchData}
          settings={settings}
        />
      );
      break;
    case ActivityType.ATTENTION_DEVELOPMENT:
      renderedSheet = (
        <AttentionDevelopmentSheet
          data={activeData as unknown as unknown as unknown as unknown as AttentionDevelopmentData}
          settings={settings}
        />
      );
      break;
    case ActivityType.ATTENTION_FOCUS:
      renderedSheet = (
        <AttentionFocusSheet data={activeData as unknown as unknown as unknown as unknown as AttentionFocusData} settings={settings} />
      );
      break;
    case ActivityType.FIND_DUPLICATE:
      renderedSheet = (
        <FindDuplicateSheet data={activeData as unknown as unknown as unknown as unknown as FindDuplicateData} settings={settings} />
      );
      break;
    case ActivityType.FIND_LETTER_PAIR:
      renderedSheet = (
        <FindLetterPairSheet data={activeData as unknown as unknown as unknown as unknown as FindLetterPairData} settings={settings} />
      );
      break;
    case ActivityType.TARGET_SEARCH:
      renderedSheet = (
        <TargetSearchSheet data={activeData as unknown as unknown as unknown as unknown as TargetSearchData} settings={settings} />
      );
      break;
    case ActivityType.SYLLABLE_MASTER_LAB:
      renderedSheet = (
        <SyllableMasterLabSheet
          data={activeData as unknown as unknown as unknown as unknown as SyllableMasterLabData}
          settings={settings}
        />
      );
      break;
    case ActivityType.READING_SUDOKU:
      renderedSheet = (
        <ReadingSudokuSheet data={activeData as unknown as unknown as unknown as unknown as ReadingSudokuData} settings={settings} />
      );
      break;
    case ActivityType.READING_STROOP:
      renderedSheet = (
        <ReadingStroopSheet data={activeData as unknown as unknown as unknown as unknown as ReadingStroopData} settings={settings} />
      );
      break;
    case ActivityType.SYNONYM_ANTONYM_MATCH:
      renderedSheet = (
        <SynonymAntonymMatchSheet
          data={activeData as unknown as unknown as unknown as unknown as SynonymAntonymMatchData}
          settings={settings}
        />
      );
      break;
    case ActivityType.SYLLABLE_WORD_BUILDER:
      renderedSheet = (
        <SyllableWordBuilderSheet
          data={activeData as unknown as unknown as unknown as unknown as SyllableWordBuilderData}
          settings={settings}
        />
      );
      break;
    case ActivityType.LETTER_VISUAL_MATCHING:
      renderedSheet = (
        <LetterVisualMatchingSheet
          data={activeData as unknown as unknown as unknown as unknown as LetterVisualMatchingData}
          settings={settings}
        />
      );
      break;
    case ActivityType.FAMILY_RELATIONS:
      renderedSheet = (
        <FamilyRelationsSheet data={activeData as unknown as unknown as unknown as unknown as FamilyRelationsData} settings={settings} />
      );
      break;
    case ActivityType.FAMILY_LOGIC_TEST:
      renderedSheet = (
        <FamilyLogicSheet data={activeData as unknown as unknown as unknown as unknown as FamilyLogicTestData} settings={settings} />
      );
      break;
    case ActivityType.MORPHOLOGY_MATRIX:
      renderedSheet = (
        <MorphologyMatrixSheet
          data={activeData as unknown as unknown as unknown as unknown as MorphologyMatrixData}
          settings={settings}
        />
      );
      break;
    case ActivityType.READING_PYRAMID:
      renderedSheet = (
        <ReadingPyramidSheet data={activeData as unknown as unknown as unknown as unknown as ReadingPyramidData} settings={settings} />
      );
      break;
    case ActivityType.READING_FLOW:
      renderedSheet = (
        <ReadingFlowSheet data={activeData as unknown as unknown as unknown as unknown as ReadingFlowData} settings={settings} />
      );
      break;
    case ActivityType.PHONOLOGICAL_AWARENESS:
      renderedSheet = (
        <PhonologicalAwarenessSheet
          data={activeData as unknown as unknown as unknown as unknown as PhonologicalAwarenessData}
          settings={settings}
        />
      );
      break;
    case ActivityType.RAPID_NAMING:
      renderedSheet = (
        <RapidNamingSheet data={activeData as unknown as unknown as unknown as unknown as RapidNamingData} settings={settings} />
      );
      break;
    case ActivityType.LETTER_DISCRIMINATION:
      renderedSheet = (
        <LetterDiscriminationSheet
          data={activeData as unknown as unknown as unknown as unknown as LetterDiscriminationData}
          settings={settings}
        />
      );
      break;
    case ActivityType.MIRROR_LETTERS:
      renderedSheet = (
        <MirrorLettersSheet data={activeData as unknown as unknown as unknown as unknown as MirrorLettersData} settings={settings} />
      );
      break;
    case ActivityType.SYLLABLE_TRAIN:
      renderedSheet = (
        <SyllableTrainSheet data={activeData as unknown as unknown as unknown as unknown as SyllableTrainData} settings={settings} />
      );
      break;
    case ActivityType.VISUAL_TRACKING_LINES:
      renderedSheet = (
        <VisualTrackingLinesSheet data={activeData as unknown as unknown as unknown as unknown as VisualTrackingLineData} settings={settings} />
      );
      break;
    case ActivityType.BACKWARD_SPELLING:
      renderedSheet = (
        <BackwardSpellingSheet data={activeData as unknown as unknown as unknown as unknown as BackwardSpellingData} settings={settings} />
      );
      break;
    case ActivityType.CODE_READING:
      renderedSheet = (
        <CodeReadingSheet data={activeData as unknown as unknown as unknown as unknown as CodeReadingData} settings={settings} />
      );
      break;
    case ActivityType.ATTENTION_TO_QUESTION:
      renderedSheet = (
        <AttentionToQuestionSheet data={activeData as unknown as unknown as unknown as unknown as AttentionToQuestionData} settings={settings} />
      );
      break;
    case ActivityType.HANDWRITING_PRACTICE:
      renderedSheet = (
        <HandwritingPracticeSheet data={activeData as unknown as unknown as unknown as unknown as HandwritingPracticeData} settings={settings} />
      );
      break;
    case ActivityType.MAP_INSTRUCTION:
      renderedSheet = (
        <MapDetectiveSheet data={activeData as unknown as unknown as unknown as unknown as MapInstructionData} settings={settings} />
      );
      break;
    case ActivityType.FIVE_W_ONE_H:
      renderedSheet = <FiveWOneHSheet data={activeData as unknown as any} settings={settings} />;
      break;
    case ActivityType.SENTENCE_5W1H:
      renderedSheet = <SentenceFiveWOneHSheet data={activeData as unknown as any} />;
      break;
    case ActivityType.STORY_ANALYSIS:
      renderedSheet = <StoryAnalysisSheet data={activeData as unknown as unknown as unknown as unknown as StoryAnalysisData} />;
      break;
    case ActivityType.STORY_SEQUENCING:
      renderedSheet = <StorySequencingSheet data={activeData as unknown as unknown as unknown as unknown as StorySequencingData} />;
      break;
    case ActivityType.MISSING_PARTS:
      renderedSheet = <AdvancedMissingPartsSheet data={activeData as unknown as unknown as unknown as unknown as MissingPartsData} />;
      break;
    case ActivityType.INFOGRAPHIC_SHORT_ANSWER:
      renderedSheet = <ShortAnswerSheet data={activeData.content || activeData} settings={settings} />;
      break;
    case ActivityType.COLORFUL_SYLLABLE_READING:
      renderedSheet = <ColorfulSyllableReadingSheet data={activeData as unknown as any} settings={settings} />;
      break;
    case ActivityType.FAMILY_TREE_MATRIX:
      renderedSheet = <FamilyTreeMatrixSheet data={activeData as unknown as any} settings={settings} />;
      break;
    case ActivityType.APARTMENT_LOGIC_PUZZLE:
      renderedSheet = <ApartmentLogicSheet data={activeData as unknown as any} settings={settings} />;
      break;
    case ActivityType.FINANCIAL_MARKET_CALCULATOR:
      renderedSheet = <FinancialMarketSheet data={activeData as unknown as any} settings={settings} />;
      break;
    case ActivityType.DIRECTIONAL_CODE_READING:
      renderedSheet = <DirectionalCodeReadingSheet data={activeData as unknown as any} settings={settings} />;
      break;
    case ActivityType.LOGIC_ERROR_HUNTER:
      renderedSheet = <LogicErrorHunterSheet data={activeData as unknown as any} settings={settings} />;
      break;
    case ActivityType.PATTERN_COMPLETION:
      renderedSheet = <PatternCompletionSheet data={activeData as unknown as any} settings={settings} />;
      break;
    case ActivityType.FIND_THE_DIFFERENCE:
      renderedSheet = (
        <FindTheDifferenceSheet data={activeData as unknown as unknown as unknown as unknown as FindTheDifferenceData} settings={settings} />
      );
      break;
    case ActivityType.VISUAL_ODD_ONE_OUT:
      renderedSheet = (
        <VisualOddOneOutSheet data={activeData as unknown as unknown as unknown as unknown as VisualOddOneOutData} settings={settings} />
      );
      break;
    case ActivityType.GRID_DRAWING:
      renderedSheet = (
        <GridDrawingSheet data={activeData as unknown as unknown as unknown as unknown as GridDrawingData} settings={settings} />
      );
      break;
    case ActivityType.SYMMETRY_DRAWING:
      renderedSheet = (
        <SymmetryDrawingSheet data={activeData as unknown as unknown as unknown as unknown as SymmetryDrawingData} settings={settings} />
      );
      break;
    case ActivityType.SHAPE_COUNTING:
      renderedSheet = (
        <ShapeCountingSheet data={activeData as unknown as unknown as unknown as unknown as ShapeCountingData} settings={settings} />
      );
      break;
    case ActivityType.DIRECTIONAL_TRACKING:
      renderedSheet = (
        <DirectionalTrackingSheet data={activeData as unknown as unknown as unknown as unknown as DirectionalTrackingData} settings={settings} />
      );
      break;
    case ActivityType.HIDDEN_PASSWORD_GRID:
      renderedSheet = (
        <HiddenPasswordGridSheet data={activeData as unknown as unknown as unknown as unknown as HiddenPasswordGridData} settings={settings} />
      );
      break;
    case ActivityType.WORD_SEARCH:
      renderedSheet = (
        <WordSearchSheet data={activeData as unknown as unknown as unknown as unknown as WordSearchData} settings={settings} />
      );
      break;
    case ActivityType.INFOGRAPHIC_STUDIO:
    case ActivityType.ANAGRAM:
      renderedSheet = <AnagramSheet data={activeData as unknown as unknown as unknown as unknown as AnagramsData} settings={settings} />;
      break;
    case ActivityType.CROSSWORD:
      renderedSheet = (
        <CrosswordSheet data={activeData as unknown as unknown as unknown as unknown as CrosswordData} settings={settings} />
      );
      break;
    case ActivityType.BOX_MATH:
      renderedSheet = <BoxMathSheet data={activeData as unknown as any} settings={settings} />;
      break;
    case ActivityType.QUEUE_ORDERING:
      renderedSheet = <QueueOrderingSheet data={activeData as unknown as any} settings={settings} />;
      break;
    case ActivityType.VISUAL_INTERPRETATION:
      renderedSheet = <VisualInterpretationSheet data={activeData as unknown as any} settings={settings} />;
      break;

    // AUTONOM_CASES_START
    // AUTONOM_CASES_END

    default:
      return null;
  }

  return renderedSheet;
}
