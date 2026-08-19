import React, { lazy } from 'react';

const HarfBaglamaSheet = lazy(() => import('../modules/activities/harf-baglama/ui/WorksheetUI').then(m => ({ default: m.HarfBaglamaSheet })));
const LetterConnectSheet = lazy(() => import('../modules/activities/letter-connect/ui/WorksheetUI').then(m => ({ default: m.LetterConnectSheet })));

// AUTONOM_LAZY_IMPORTS_START
// AUTONOM_LAZY_IMPORTS_END

import {
  ActivityType,
  SingleWorksheetData,
  StudentProfile,
  StyleSettings,
} from '../types';

import { ReadingStudioContentRenderer } from './ReadingStudio/ReadingStudioContentRenderer';
import { VisualInterpretationSheet } from './sheets/visual/VisualInterpretationSheet';
import { BrainTeasersSheet } from './sheets/logic/BrainTeasersSheet';
import { KavramHaritasiSheet } from './sheets/verbal/KavramHaritasiSheet';
import { EsAnlamliKelimelerSheet } from './sheets/verbal/EsAnlamliKelimelerSheet';
import { GizemliSayilarSheet } from './sheets/math/GizemliSayilarSheet';
import { LetterMazeTestSheet } from './sheets/visual/LetterMazeTestSheet';
import { InfographicRenderer } from './sheet-renderers/InfographicRenderer';
import { ExamRenderer } from './sheet-renderers/ExamRenderer';
import { KelimeCumleRenderer } from './sheet-renderers/KelimeCumleRenderer';
import { OcrRenderer } from './sheet-renderers/OcrRenderer';
import { MathStudioRenderer } from './sheet-renderers/MathStudioRenderer';
import { SuperStudioRenderer } from './sheet-renderers/SuperStudioRenderer';
import { SariKitapRenderer } from './sheet-renderers/SariKitapRenderer';
import { ShortAnswerSheet } from './sheets/verbal/ShortAnswerSheet';
import { BasicOperationsSheet } from './sheets/math/BasicOperationsSheet';
import { StoryComprehensionSheet } from './sheets/verbal/StoryComprehensionSheet';
import { StoryAnalysisSheet } from './sheets/verbal/StoryAnalysisSheet';
import { StorySequencingSheet } from './sheets/verbal/StorySequencingSheet';
import { SentenceFiveWOneHSheet } from './sheets/verbal/SentenceFiveWOneHSheet';
import { FiveWOneHSheet } from './sheets/verbal/FiveWOneHSheet';
import { ColorfulSyllableReadingSheet } from './sheets/verbal/ColorfulSyllableReadingSheet';
import { FamilyTreeMatrixSheet } from './sheets/verbal/FamilyTreeMatrixSheet';
import { LogicErrorHunterSheet } from './sheets/verbal/LogicErrorHunterSheet';
import {
  AnagramSheet,
  WordSearchSheet,
  HiddenPasswordGridSheet,
  CrosswordSheet,
} from './sheets/verbal/WordGameSheets';
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
} from './sheets/verbal/ReadingSheets';
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
} from './sheets/verbal/ReadingSupportSheets';
import {
  WordMemorySheet,
  VisualMemorySheet,
  CharacterMemorySheet,
  ColorWheelSheet,
  ImageComprehensionSheet,
} from './sheets/attention/MemorySheets';
import { StroopTestSheet } from './sheets/attention/StroopTestSheet';
import {
  BurdonTestSheet,
  NumberSearchSheet,
  AttentionDevelopmentSheet,
  ChaoticNumberSearchSheet,
  AttentionFocusSheet,
  FindDuplicateSheet,
  LetterGridTestSheet,
  TargetSearchSheet,
} from './sheets/attention/AttentionSheets';
import { DirectionalCodeReadingSheet } from './sheets/visual/DirectionalCodeReadingSheet';
import { MapDetectiveSheet } from './sheets/visual/MapDetectiveSheet';
import { FindTheDifferenceSheet } from './sheets/visual/FindTheDifferenceSheet';
import { VisualOddOneOutSheet } from './sheets/visual/VisualOddOneOutSheet';
import { PatternCompletionSheet } from './sheets/visual/PatternCompletionSheet';
import { GridDrawingSheet } from './sheets/visual/GridDrawingSheet';
import { SymmetryDrawingSheet } from './sheets/visual/SymmetryDrawingSheet';
import { ShapeCountingSheet } from './sheets/visual/ShapeCountingSheet';
import { DirectionalTrackingSheet } from './sheets/visual/DirectionalTrackingSheet';
import { AlgorithmSheet } from './sheets/logic/AlgorithmSheet';
import { MathWordProblemsSheet } from './sheets/math/MathWordProblemsSheet';
import { NumberPyramidSheet } from './sheets/math/NumberPyramidSheet';
import { NumberPatternSheet } from './sheets/math/NumberPatternSheet';
import { RealLifeMathProblemsSheet } from './sheets/math/RealLifeMathProblemsSheet';
import { LogicGridPuzzleSheet } from './sheets/math/LogicGridPuzzleSheet';
import { FutoshikiSheet } from './sheets/math/FutoshikiSheet';
import { MathPuzzleSheet } from './sheets/math/MathPuzzleSheet';
import { OddOneOutSheet } from './sheets/math/OddOneOutSheet';
import { NumberPathLogicSheet } from './sheets/math/NumberPathLogicSheet';
import { VisualArithmeticSheet } from './sheets/math/VisualArithmeticSheet';
import { ClockReadingSheet } from './sheets/math/ClockReadingSheet';
import { NumberSenseSheet } from './sheets/math/NumberSenseSheet';
import { MoneyCountingSheet } from './sheets/math/MoneyCountingSheet';
import { MathMemoryCardsSheet } from './sheets/math/MathMemoryCardsSheet';
import { SpatialGridSheet } from './sheets/math/SpatialGridSheet';
import { ConceptMatchSheet } from './sheets/math/ConceptMatchSheet';
import { EstimationSheet } from './sheets/math/EstimationSheet';
import { AbcConnectSheet } from './sheets/math/AbcConnectSheet';
import { OddEvenSudokuSheet } from './sheets/math/OddEvenSudokuSheet';
import { MagicPyramidSheet } from './sheets/math/MagicPyramidSheet';
import { CapsuleGameSheet } from './sheets/math/CapsuleGameSheet';
import { ApartmentLogicSheet } from './sheets/math/ApartmentLogicSheet';
import { FinancialMarketSheet } from './sheets/math/FinancialMarketSheet';
import { BoxMathSheet } from './sheets/math/BoxMathSheet';

import { UnifiedContentRenderer } from './SheetRenderer/UnifiedContentRenderer';
import { renderLegacySheet } from './SheetRenderer/LegacyRenderer';

interface SheetRendererProps {
  activityType: ActivityType | null;
  data: SingleWorksheetData;
  studentProfile?: StudentProfile | null;
  settings?: StyleSettings;
  hideWrapper?: boolean;
}

export const SheetRenderer = React.memo(
  ({ activityType, data, studentProfile, settings, hideWrapper = false }: SheetRendererProps) => {
    if (!data) return null;

    const unwrappedData = Array.isArray(data) ? data[0] : data;

    if (Array.isArray(data) && !unwrappedData) return null;

    const activeData = (unwrappedData as any)?.data || unwrappedData;

    if (!activeData || typeof activeData !== 'object' || Array.isArray(activeData)) {
      if (Array.isArray(activeData) && activeData.length > 0) {
        return (
          <SheetRenderer
            activityType={activityType}
            data={activeData[0]}
            studentProfile={studentProfile}
            settings={settings}
            hideWrapper={hideWrapper}
          />
        );
      }
      return null;
    }

    const unwrapExam = (val: unknown): unknown => {
      if (!val) return val;
      if (Array.isArray(val)) {
        const first = (val as unknown[])[0];
        if (first && typeof first === 'object' && !Array.isArray(first) && ('sorular' in first || 'baslik' in first)) return first;
        return val;
      }
      return val;
    };

    let resolvedData = unwrapExam(activeData);

    // Evrensel Akıllı Data Normalizer & Unwrapper:
    // WorksheetBuilder veya farklı jeneratör sarmallarından items, questions, exercises, pairs vb. verileri kök seviyeye çıkarır.
    if (resolvedData && typeof resolvedData === 'object') {
      const rd = resolvedData as Record<string, any>;
      const rawContent = rd.content || rd.data || rd.items;

      // 1. WorksheetBuilder blok yapısını çözme
      if (Array.isArray(rd.content)) {
        const contentArr = rd.content;
        const headerBlock = contentArr.find((b: any) => Boolean(b) && typeof b === 'object' && (b.type === 'premium_header' || b.type === 'header'));
        const mainBlock = contentArr.find((b: any) => Boolean(b) && typeof b === 'object' && b.type !== 'premium_header' && b.type !== 'success_indicator' && (b.content || b.items || b.questions || b.data));

        if (mainBlock) {
          const innerContent = mainBlock.content || mainBlock.data || mainBlock;
          const extractedArray =
            (typeof innerContent === 'object' && (innerContent.items || innerContent.questions || innerContent.exercises || innerContent.pairs || innerContent.words || innerContent.puzzles || innerContent.rows || innerContent.cards || innerContent.pyramids || innerContent.clocks || innerContent.steps || innerContent.grid || innerContent.cells || innerContent.paths || innerContent.rungs || innerContent.sequences || innerContent.levels || innerContent.numbers || innerContent.problems || innerContent.riddles || innerContent.wordProblems || innerContent.pyramidLayers || innerContent.blocks || innerContent.layoutArchitecture?.blocks)) ||
            (Array.isArray(innerContent) ? innerContent : null);

          resolvedData = {
            ...rd,
            ...(typeof innerContent === 'object' ? innerContent : {}),
            items: extractedArray || rd.items || (Array.isArray(innerContent) ? innerContent : []),
            title: headerBlock?.content?.title || rd.title || mainBlock?.title || '',
            instruction: headerBlock?.content?.instruction || rd.instruction || mainBlock?.instruction || ''
          };
        }
      }

      // 2. Doğrudan sarmalanmış nesneler için fallback normalizasyonu
      const currentRd = resolvedData as Record<string, any>;
      if (!currentRd.items && !currentRd.questions && !currentRd.exercises && !currentRd.pairs && !currentRd.words && !currentRd.puzzles && !currentRd.rows && !currentRd.pyramids) {
        if (Array.isArray(currentRd.content)) {
          currentRd.items = currentRd.content;
        } else if (currentRd.content && typeof currentRd.content === 'object') {
          Object.assign(currentRd, currentRd.content);
        }
      }
    }


    const isLandscape = settings?.orientation === 'landscape';
    const pageClass = `worksheet-page print-page shadow-2xl mb-8 ${isLandscape ? 'landscape' : ''}`;

    const withWrapper = (content: React.ReactNode) => {
      if (hideWrapper) return content;
      return <div className={pageClass}>{content}</div>;
    };

    // --- Special module renders ---

    if (activityType === ActivityType.STORY_COMPREHENSION && resolvedData && typeof resolvedData === 'object' && !Array.isArray(resolvedData) && (resolvedData as Record<string, unknown>).layout) {
      return withWrapper(
        <ReadingStudioContentRenderer layout={(resolvedData as Record<string, unknown>).layout as never} storyData={(resolvedData as Record<string, unknown>).storyData as never} />
      );
    }

    if (activityType === ActivityType.PREMIUM_STUDIO && resolvedData && typeof resolvedData === 'object' && !Array.isArray(resolvedData) && (resolvedData as Record<string, unknown>).layout) {
      return withWrapper(
        <ReadingStudioContentRenderer layout={(resolvedData as Record<string, unknown>).layout as never} storyData={(resolvedData as Record<string, unknown>).storyData as never} />
      );
    }

    if (activityType === ActivityType.MATH_STUDIO && resolvedData) {
      return withWrapper(<MathStudioRenderer data={resolvedData as unknown as any} settings={settings} />);
    }

    if (activityType === ActivityType.SUPER_STUDIO && resolvedData) {
      return withWrapper(<SuperStudioRenderer data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.SARI_KITAP_STUDIO && resolvedData) {
      return withWrapper(<SariKitapRenderer data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.SINAV || activityType === ActivityType.MAT_SINAV) {
      const sinav = resolvedData as unknown as any;
      if (sinav && (sinav.sorular || sinav.baslik)) {
        return withWrapper(
          <ExamRenderer
            examType={activityType === ActivityType.MAT_SINAV ? "matematik" : "turkce"}
            data={sinav}
            settings={settings}
          />
        );
      }
    }

    if (activityType === ActivityType.KELIME_CUMLE && resolvedData) {
      return withWrapper(<KelimeCumleRenderer data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.MATH_BASIC_OPERATIONS && resolvedData) {
      return withWrapper(<BasicOperationsSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.MATH_WORD_PROBLEMS && resolvedData) {
      return withWrapper(<MathWordProblemsSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.NUMBER_PYRAMID && resolvedData) {
      return withWrapper(<NumberPyramidSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.NUMBER_PATTERN && resolvedData) {
      return withWrapper(<NumberPatternSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.REAL_LIFE_MATH_PROBLEMS && resolvedData) {
      return withWrapper(<RealLifeMathProblemsSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.LOGIC_GRID_PUZZLE && resolvedData) {
      return withWrapper(<LogicGridPuzzleSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.FUTOSHIKI && resolvedData) {
      return withWrapper(<FutoshikiSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.MATH_PUZZLE && resolvedData) {
      return withWrapper(<MathPuzzleSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.ODD_ONE_OUT && resolvedData) {
      return withWrapper(<OddOneOutSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.NUMBER_PATH_LOGIC && resolvedData) {
      return withWrapper(<NumberPathLogicSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.VISUAL_ARITHMETIC && resolvedData) {
      return withWrapper(<VisualArithmeticSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.CLOCK_READING && resolvedData) {
      return withWrapper(<ClockReadingSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.NUMBER_SENSE && resolvedData) {
      return withWrapper(<NumberSenseSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.MONEY_COUNTING && resolvedData) {
      return withWrapper(<MoneyCountingSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.MATH_MEMORY_CARDS && resolvedData) {
      return withWrapper(<MathMemoryCardsSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.SPATIAL_GRID && resolvedData) {
      return withWrapper(<SpatialGridSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.CONCEPT_MATCH && resolvedData) {
      return withWrapper(<ConceptMatchSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.ESTIMATION && resolvedData) {
      return withWrapper(<EstimationSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.ABC_CONNECT && resolvedData) {
      return withWrapper(<AbcConnectSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.ODD_EVEN_SUDOKU && resolvedData) {
      return withWrapper(<OddEvenSudokuSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.MAGIC_PYRAMID && resolvedData) {
      return withWrapper(<MagicPyramidSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.CAPSULE_GAME && resolvedData) {
      return withWrapper(<CapsuleGameSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.APARTMENT_LOGIC_PUZZLE && resolvedData) {
      return withWrapper(<ApartmentLogicSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.FINANCIAL_MARKET_CALCULATOR && resolvedData) {
      return withWrapper(<FinancialMarketSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.BOX_MATH && resolvedData) {
      return withWrapper(<BoxMathSheet data={resolvedData as unknown as any} />);
    }

    // ── OKUMA & DİL BECERİLERİ ETKİNLİKLERİ ──
    if (activityType === ActivityType.STORY_ANALYSIS && resolvedData) {
      return withWrapper(<StoryAnalysisSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.STORY_SEQUENCING && resolvedData) {
      return withWrapper(<StorySequencingSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.SENTENCE_5W1H && resolvedData) {
      return withWrapper(<SentenceFiveWOneHSheet data={resolvedData as unknown as any} />);
    }

    if ((activityType === ActivityType.ANAGRAM || activityType === ActivityType.ANAGRAM_PUZZLE) && resolvedData) {
      return withWrapper(<AnagramSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.WORD_SEARCH && resolvedData) {
      return withWrapper(<WordSearchSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.HIDDEN_PASSWORD_GRID && resolvedData) {
      return withWrapper(<HiddenPasswordGridSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.CROSSWORD && resolvedData) {
      return withWrapper(<CrosswordSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.FIVE_W_ONE_H && resolvedData) {
      return withWrapper(<FiveWOneHSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.COLORFUL_SYLLABLE_READING && resolvedData) {
      return withWrapper(<ColorfulSyllableReadingSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.FAMILY_TREE_MATRIX && resolvedData) {
      return withWrapper(<FamilyTreeMatrixSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.LOGIC_ERROR_HUNTER && resolvedData) {
      return withWrapper(<LogicErrorHunterSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.SYLLABLE_MASTER_LAB && resolvedData) {
      return withWrapper(<SyllableMasterLabSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.READING_SUDOKU && resolvedData) {
      return withWrapper(<ReadingSudokuSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.READING_STROOP && resolvedData) {
      return withWrapper(<ReadingStroopSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.SYNONYM_ANTONYM_MATCH && resolvedData) {
      return withWrapper(<SynonymAntonymMatchSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.SYLLABLE_WORD_BUILDER && resolvedData) {
      return withWrapper(<SyllableWordBuilderSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.LETTER_VISUAL_MATCHING && resolvedData) {
      return withWrapper(<LetterVisualMatchingSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.FAMILY_LOGIC_TEST && resolvedData) {
      return withWrapper(<FamilyLogicSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.FAMILY_RELATIONS && resolvedData) {
      return withWrapper(<FamilyRelationsSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.FIND_LETTER_PAIR && resolvedData) {
      return withWrapper(<FindLetterPairSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.MORPHOLOGY_MATRIX && resolvedData) {
      return withWrapper(<MorphologyMatrixSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.READING_PYRAMID && resolvedData) {
      return withWrapper(<ReadingPyramidSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.PHONOLOGICAL_AWARENESS && resolvedData) {
      return withWrapper(<PhonologicalAwarenessSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.RAPID_NAMING && resolvedData) {
      return withWrapper(<RapidNamingSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.LETTER_DISCRIMINATION && resolvedData) {
      return withWrapper(<LetterDiscriminationSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.MIRROR_LETTERS && resolvedData) {
      return withWrapper(<MirrorLettersSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.SYLLABLE_TRAIN && resolvedData) {
      return withWrapper(<SyllableTrainSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.VISUAL_TRACKING_LINES && resolvedData) {
      return withWrapper(<VisualTrackingLinesSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.BACKWARD_SPELLING && resolvedData) {
      return withWrapper(<BackwardSpellingSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.CODE_READING && resolvedData) {
      return withWrapper(<CodeReadingSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.ATTENTION_TO_QUESTION && resolvedData) {
      return withWrapper(<AttentionToQuestionSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.HANDWRITING_PRACTICE && resolvedData) {
      return withWrapper(<HandwritingPracticeSheet data={resolvedData as unknown as any} />);
    }

    // ── GÖRSEL & MEKANSAL BİLGİ ETKİNLİKLERİ ──
    if (activityType === ActivityType.DIRECTIONAL_CODE_READING && resolvedData) {
      return withWrapper(<DirectionalCodeReadingSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.MAP_INSTRUCTION && resolvedData) {
      return withWrapper(<MapDetectiveSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.FIND_THE_DIFFERENCE && resolvedData) {
      return withWrapper(<FindTheDifferenceSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.VISUAL_ODD_ONE_OUT && resolvedData) {
      return withWrapper(<VisualOddOneOutSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.PATTERN_COMPLETION && resolvedData) {
      return withWrapper(<PatternCompletionSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.GRID_DRAWING && resolvedData) {
      return withWrapper(<GridDrawingSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.SYMMETRY_DRAWING && resolvedData) {
      return withWrapper(<SymmetryDrawingSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.SHAPE_COUNTING && resolvedData) {
      return withWrapper(<ShapeCountingSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.DIRECTIONAL_TRACKING && resolvedData) {
      return withWrapper(<DirectionalTrackingSheet data={resolvedData as unknown as any} />);
    }

    // ── DİKKAT & HAFIZA ETKİNLİKLERİ ──
    if (activityType === ActivityType.WORD_MEMORY && resolvedData) {
      return withWrapper(<WordMemorySheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.VISUAL_MEMORY && resolvedData) {
      return withWrapper(<VisualMemorySheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.CHARACTER_MEMORY && resolvedData) {
      return withWrapper(<CharacterMemorySheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.COLOR_WHEEL_MEMORY && resolvedData) {
      return withWrapper(<ColorWheelSheet data={resolvedData as unknown as any} />);
    }

    if ((activityType === ActivityType.IMAGE_COMPREHRENSION || (activityType as any) === 'IMAGE_COMPREHENSION') && resolvedData) {
      return withWrapper(<ImageComprehensionSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.STROOP_TEST && resolvedData) {
      return withWrapper(<StroopTestSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.BURDON_TEST && resolvedData) {
      return withWrapper(<BurdonTestSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.LETTER_GRID_TEST && resolvedData) {
      return withWrapper(<LetterGridTestSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.NUMBER_SEARCH && resolvedData) {
      return withWrapper(<NumberSearchSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.CHAOTIC_NUMBER_SEARCH && resolvedData) {
      return withWrapper(<ChaoticNumberSearchSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.ATTENTION_DEVELOPMENT && resolvedData) {
      return withWrapper(<AttentionDevelopmentSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.ATTENTION_FOCUS && resolvedData) {
      return withWrapper(<AttentionFocusSheet data={resolvedData as unknown as any} />);
    }

    if ((activityType as any) === 'FIND_DUPLICATE' && resolvedData) {
      return withWrapper(<FindDuplicateSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.TARGET_SEARCH && resolvedData) {
      return withWrapper(<TargetSearchSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.ALGORITHM_GENERATOR && resolvedData) {
      return withWrapper(<AlgorithmSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.VISUAL_INTERPRETATION) {
      return withWrapper(
        <VisualInterpretationSheet data={resolvedData as unknown as any} settings={settings || {} as unknown as any} />
      );
    }

    if (activityType === ActivityType.BRAIN_TEASERS) {
      return withWrapper(
        <BrainTeasersSheet data={resolvedData as unknown as any} settings={settings || {} as unknown as any} />
      );
    }

    if (activityType === ActivityType.KAVRAM_HARITASI) {
      const kd = resolvedData as Record<string, unknown>;
      const content = kd.content as Record<string, unknown> | undefined;
      return withWrapper(
        <KavramHaritasiSheet
          data={{
            ...kd,
            nodes: content?.nodes || kd.nodes || [],
            edges: content?.edges || kd.edges || [],
            examples: content?.wordBank || kd.examples || [],
          } as Record<string, unknown>}
        />
      );
    }

    if (activityType === ActivityType.ES_ANLAMLI_KELIMELER) {
      return withWrapper(<EsAnlamliKelimelerSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.LETTER_MAZE_TEST) {
      return withWrapper(<LetterMazeTestSheet data={resolvedData as unknown as any} settings={settings} />);
    }

    if (activityType === ActivityType.NUMBER_LOGIC_RIDDLES) {
      return withWrapper(<GizemliSayilarSheet data={resolvedData as unknown as any} settings={settings} />);
    }

    if (activityType === ActivityType.INFOGRAPHIC_SHORT_ANSWER) {
      return withWrapper(<ShortAnswerSheet data={((resolvedData as Record<string, unknown>).content || resolvedData) as unknown as any} />);
    }

    if (
      (activityType === ActivityType.INFOGRAPHIC_STUDIO ||
        activityType === ActivityType.INFOGRAPHIC_CONCEPT_MAP ||
        activityType === ActivityType.INFOGRAPHIC_5W1H_BOARD) &&
      resolvedData
    ) {
      return withWrapper(<InfographicRenderer data={resolvedData as unknown as any} settings={settings} />);
    }

    if (activityType === ActivityType.OCR_CONTENT) {
      return withWrapper(
        <OcrRenderer
          data={
            {
              content: (data as Record<string, unknown>)?.content as string | undefined,
              grafikVeri: (data as Record<string, unknown>)?.grafikVeri as Record<string, unknown> | undefined,
              title: (data as Record<string, unknown>)?.title as string | undefined,
              targetSkills: (data as Record<string, unknown>)?.targetSkills as string[] | undefined,
              columns: (data as Record<string, unknown>)?.columns as number | undefined,
              estimatedFontSize: (data as Record<string, unknown>)?.estimatedFontSize as number | undefined,
            } as {
              content?: string;
              grafikVeri?: Record<string, unknown>;
              title?: string;
              targetSkills?: string[];
              columns?: number;
              estimatedFontSize?: number;
            }
          }
        />
      );
    }

    // --- Empty data check ---
    const isDataEmpty = !data || typeof data !== 'object' || Object.keys(data).length === 0;

    if (isDataEmpty) {
      return withWrapper(
        <div className="p-10 text-center text-gray-500 bg-white rounded-3xl shadow-sm min-h-[600px] flex flex-col items-center justify-center font-['Lexend']">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <i className="fa-solid fa-wand-magic-sparkles text-4xl text-indigo-300"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">İçerik Bulunamadı</h3>
          <p className="max-w-xs text-sm text-gray-400 leading-relaxed italic">
            Yapay zeka içeriği hazırlarken bir sorun oluşmuş olabilir veya henüz içerik üretilmedi.
          </p>
          <div className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
            Farklı Bir Seçenek Deneyin
          </div>
        </div>
      );
    }

    // --- Direct return legacy cases (bypass wrapper) ---
    if (activityType === ActivityType.LETTER_CONNECT) {
      return <LetterConnectSheet data={activeData} />;
    }

    if (activityType === ActivityType.HARF_BAGLAMA) {
      return <HarfBaglamaSheet data={activeData} />;
    }

    // --- Legacy switch via LegacyRenderer ---
    const renderNonStandardBlock = (block: any) => (
      <SheetRenderer
        activityType={activityType}
        data={{
          ...activeData,
          blocks: undefined,
          puzzles: [block],
          items: [block],
          problems: [block],
          steps: [block],
          operations: [block],
        }}
        hideWrapper={true}
      />
    );

    // Modern layout: blocks with layoutArchitecture
    const isModernLayout = activeData?.layoutArchitecture || (Array.isArray(activeData?.blocks) && activeData.blocks.some((b: any) => b?.type));

    if (!hideWrapper && isModernLayout) {
      return (
        <UnifiedContentRenderer
          data={activeData}
          activityType={activityType}
          studentProfile={studentProfile}
          settings={settings}
          renderNonStandardBlock={renderNonStandardBlock}
        />
      );
    }

    if (!data || typeof data !== 'object') return null;

    // Legacy activity type switch
    const legacySheet = renderLegacySheet(activityType, activeData, settings);
    if (legacySheet !== null) {
      return withWrapper(legacySheet);
    }

    // Default fallback
    return withWrapper(
      <UnifiedContentRenderer
        data={activeData}
        activityType={activityType}
        studentProfile={studentProfile}
        settings={settings}
        renderNonStandardBlock={renderNonStandardBlock}
      />
    );
  }
);
