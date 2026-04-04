import { ActivityType, GeneratorOptions } from '../../types/core.js';
import * as aiGenerators from './index.js';
import * as offlineGenerators from '../offlineGenerators/index.js';
import { INFOGRAPHIC_ADAPTERS_FIRST_10 } from './infographic/infographicAdapter.js';
import { INFOGRAPHIC_ADAPTERS_REMAINING_84 } from './infographic/infographicFactory.js';

/**
 * Aktivite Jeneratör Haritası
 * Hangi ActivityType'ın hangi AI ve Offline fonksiyonuna karşılık geldiğini tanımlar.
 */
export interface GeneratorMapping {
  ai?: (options: GeneratorOptions) => Promise<any>;
  offline?: (options: GeneratorOptions) => Promise<any>;
}

const withAI = (type: ActivityType) => (options: GeneratorOptions) =>
  aiGenerators.generateSmartFallbackAI(type, options);
const withOffline = (type: ActivityType) => (options: GeneratorOptions) =>
  offlineGenerators.generateOfflineFallback(type, options);

export const ACTIVITY_GENERATOR_REGISTRY: Partial<Record<ActivityType, GeneratorMapping>> = {
  [ActivityType.HECE_PARKURU]: {
    ai: withAI(ActivityType.HECE_PARKURU),
    offline: offlineGenerators.generateHeceParkuru,
  },
  // 1. OKUMA & DİL BECERİLERİ
  [ActivityType.FIVE_W_ONE_H]: {
    ai: aiGenerators.generateFiveWOneHFromAI,
    offline: offlineGenerators.generateOfflineFiveWOneH,
  },
  [ActivityType.LOGIC_ERROR_HUNTER]: {
    ai: aiGenerators.generateLogicErrorHunterFromAI,
    offline: offlineGenerators.generateOfflineLogicErrorHunter,
  },
  [ActivityType.COLORFUL_SYLLABLE_READING]: {
    ai: aiGenerators.generateColorfulSyllableReadingFromAI,
    offline: offlineGenerators.generateOfflineColorfulSyllableReading,
  },
  [ActivityType.FIND_LETTER_PAIR]: {
    ai: withAI(ActivityType.FIND_LETTER_PAIR),
    offline: offlineGenerators.generateOfflineFindLetterPair,
  },
  [ActivityType.READING_SUDOKU]: {
    ai: aiGenerators.generateReadingSudokuFromAI,
    offline: offlineGenerators.generateOfflineReadingSudoku,
  },
  [ActivityType.SYLLABLE_MASTER_LAB]: {
    ai: aiGenerators.generateSyllableMasterLabFromAI,
    offline: offlineGenerators.generateOfflineSyllableMasterLab,
  },
  [ActivityType.READING_STROOP]: {
    ai: aiGenerators.generateReadingStroopFromAI,
    offline: offlineGenerators.generateOfflineReadingStroop,
  },
  [ActivityType.SYNONYM_ANTONYM_MATCH]: {
    ai: aiGenerators.generateSynonymAntonymMatchFromAI,
    offline: offlineGenerators.generateOfflineSynonymAntonymMatch,
  },
  [ActivityType.LETTER_VISUAL_MATCHING]: {
    ai: aiGenerators.generateLetterVisualMatchingFromAI,
    offline: offlineGenerators.generateOfflineLetterVisualMatching,
  },
  [ActivityType.SYLLABLE_WORD_BUILDER]: {
    ai: withAI(ActivityType.SYLLABLE_WORD_BUILDER),
    offline: offlineGenerators.generateOfflineSyllableWordBuilder,
  },
  [ActivityType.FAMILY_RELATIONS]: {
    ai: withAI(ActivityType.FAMILY_RELATIONS),
    offline: offlineGenerators.generateOfflineFamilyRelations,
  },
  [ActivityType.FAMILY_LOGIC_TEST]: {
    ai: withAI(ActivityType.FAMILY_LOGIC_TEST),
    offline: offlineGenerators.generateOfflineFamilyLogicTest,
  },
  [ActivityType.READING_PYRAMID]: {
    ai: withAI(ActivityType.READING_PYRAMID),
    offline: offlineGenerators.generateOfflineReadingPyramid,
  },
  [ActivityType.READING_FLOW]: {
    ai: withAI(ActivityType.READING_FLOW),
    offline: offlineGenerators.generateOfflineReadingFlow,
  },
  [ActivityType.PHONOLOGICAL_AWARENESS]: {
    ai: withAI(ActivityType.PHONOLOGICAL_AWARENESS),
    offline: offlineGenerators.generateOfflinePhonologicalAwareness,
  },
  [ActivityType.RAPID_NAMING]: {
    ai: withAI(ActivityType.RAPID_NAMING),
    offline: offlineGenerators.generateOfflineReadingFlow,
  },
  [ActivityType.LETTER_DISCRIMINATION]: {
    ai: withAI(ActivityType.LETTER_DISCRIMINATION),
    offline: offlineGenerators.generateOfflineLetterDiscrimination,
  },
  [ActivityType.MIRROR_LETTERS]: {
    ai: withAI(ActivityType.MIRROR_LETTERS),
    offline: offlineGenerators.generateOfflineMirrorLetters,
  },
  [ActivityType.SYLLABLE_TRAIN]: {
    ai: withAI(ActivityType.SYLLABLE_TRAIN),
    offline: offlineGenerators.generateOfflineSyllableTrain,
  },
  [ActivityType.BACKWARD_SPELLING]: {
    ai: withAI(ActivityType.BACKWARD_SPELLING),
    offline: offlineGenerators.generateOfflineBackwardSpelling,
  },
  [ActivityType.CODE_READING]: {
    ai: withAI(ActivityType.CODE_READING),
    offline: offlineGenerators.generateOfflineCodeReading,
  },
  [ActivityType.HANDWRITING_PRACTICE]: {
    ai: withAI(ActivityType.HANDWRITING_PRACTICE),
    offline: offlineGenerators.generateOfflineHandwritingPractice,
  },
  [ActivityType.MORPHOLOGY_MATRIX]: {
    ai: withAI(ActivityType.MORPHOLOGY_MATRIX),
    offline: offlineGenerators.generateOfflineMorphologyMatrix,
  },
  [ActivityType.MISSING_PARTS]: {
    ai: withAI(ActivityType.MISSING_PARTS),
    offline: offlineGenerators.generateOfflineMissingParts,
  },

  // 2. MATEMATİK & MANTIK
  [ActivityType.NUMBER_PATTERN]: {
    ai: aiGenerators.generateNumberPatternFromAI,
    offline: offlineGenerators.generateOfflinePremiumNumberPattern,
  },
  [ActivityType.ABC_CONNECT]: {
    ai: aiGenerators.generateAbcConnectFromAI,
    offline: offlineGenerators.generateOfflineAbcConnect,
  },
  [ActivityType.MAGIC_PYRAMID]: {
    ai: aiGenerators.generateMagicPyramidFromAI,
    offline: offlineGenerators.generateOfflineMagicPyramid,
  },
  [ActivityType.CAPSULE_GAME]: {
    ai: aiGenerators.generateNumberCapsuleFromAI,
    offline: offlineGenerators.generateOfflineCapsuleGame,
  },
  [ActivityType.ODD_EVEN_SUDOKU]: {
    ai: aiGenerators.generateOddEvenSudokuFromAI,
    offline: offlineGenerators.generateOfflineOddEvenSudoku,
  },
  [ActivityType.FUTOSHIKI]: {
    ai: aiGenerators.generateFutoshikiFromAI,
    offline: offlineGenerators.generateOfflineFutoshiki,
  },
  [ActivityType.KENDOKU]: {
    ai: aiGenerators.generateKendokuFromAI,
    offline: offlineGenerators.generateOfflinePremiumKendoku,
  },
  [ActivityType.NUMBER_PYRAMID]: {
    ai: aiGenerators.generateNumberPyramidFromAI,
    offline: offlineGenerators.generateOfflinePremiumNumberPyramid,
  },
  [ActivityType.APARTMENT_LOGIC_PUZZLE]: {
    ai: aiGenerators.generateApartmentLogicPuzzleFromAI,
    offline: offlineGenerators.generateOfflineApartmentLogicPuzzle,
  },
  [ActivityType.NUMBER_LOGIC_RIDDLES]: {
    ai: aiGenerators.generateNumberLogicRiddlesFromAI,
    offline: offlineGenerators.generateOfflineNumberLogicRiddles,
  },
  [ActivityType.MATH_PUZZLE]: {
    ai: withAI(ActivityType.MATH_PUZZLE),
    offline: offlineGenerators.generateOfflineMathPuzzle,
  },
  [ActivityType.CLOCK_READING]: {
    ai: withAI(ActivityType.CLOCK_READING),
    offline: offlineGenerators.generateOfflineClockReading,
  },
  [ActivityType.MONEY_COUNTING]: {
    ai: withAI(ActivityType.MONEY_COUNTING),
    offline: offlineGenerators.generateOfflineMoneyCounting,
  },
  [ActivityType.MATH_MEMORY_CARDS]: {
    ai: aiGenerators.generateMathMemoryCardsFromAI,
    offline: offlineGenerators.generateOfflineMathMemoryCards,
  },
  [ActivityType.NUMBER_PATH_LOGIC]: {
    ai: withAI(ActivityType.NUMBER_PATH_LOGIC),
    offline: offlineGenerators.generateOfflineNumberPathLogic,
  },
  [ActivityType.VISUAL_ARITHMETIC]: {
    ai: withAI(ActivityType.VISUAL_ARITHMETIC),
    offline: offlineGenerators.generateOfflineVisualArithmetic,
  },
  [ActivityType.NUMBER_SENSE]: {
    ai: withAI(ActivityType.NUMBER_SENSE),
    offline: offlineGenerators.generateOfflineNumberSense,
  },
  [ActivityType.FINANCIAL_MARKET_CALCULATOR]: {
    ai: aiGenerators.generateFinancialMarketCalculatorFromAI,
    offline: offlineGenerators.generateOfflineFinancialMarketCalculator,
  },
  [ActivityType.LOGIC_GRID_PUZZLE]: {
    ai: aiGenerators.generateLogicGridPuzzleFromAI,
    offline: offlineGenerators.generateOfflinePremiumLogicGridPuzzle,
  },
  [ActivityType.PUNCTUATION_MAZE]: {
    ai: aiGenerators.generatePunctuationMazeFromAI,
    offline: offlineGenerators.generateOfflinePremiumPunctuationMaze,
  },
  [ActivityType.MATH_STUDIO]: {
    ai: (options) => aiGenerators.generateMathProblemsAI(options as any),
    offline: offlineGenerators.generateOfflinePremiumMathStudio,
  },
  [ActivityType.ALGORITHM_GENERATOR]: {
    ai: aiGenerators.generateAlgorithmGeneratorFromAI,
    offline: offlineGenerators.generateOfflineAlgorithmGenerator,
  },
  [ActivityType.AI_WORKSHEET_CONVERTER]: {
    ai: aiGenerators.generateAiWorksheetConverterFromAI,
    offline: withOffline(ActivityType.AI_WORKSHEET_CONVERTER),
  },
  [ActivityType.HIDDEN_PASSWORD_GRID]: {
    ai: aiGenerators.generateHiddenPasswordGridFromAI,
    offline: offlineGenerators.generateOfflineHiddenPasswordGrid,
  },

  // 3. GÖRSEL ALGI & DİKKAT
  [ActivityType.PATTERN_COMPLETION]: {
    ai: aiGenerators.generatePatternCompletionFromAI,
    offline: offlineGenerators.generateOfflinePatternCompletion,
  },
  [ActivityType.DIRECTIONAL_CODE_READING]: {
    ai: aiGenerators.generateDirectionalCodeReadingFromAI,
    offline: offlineGenerators.generateOfflineDirectionalCodeReading,
  },
  [ActivityType.MAP_INSTRUCTION]: {
    ai: aiGenerators.generateMapInstructionFromAI,
    offline: offlineGenerators.generateOfflineMapInstruction,
  },
  [ActivityType.FIND_THE_DIFFERENCE]: {
    ai: aiGenerators.generateFindTheDifferenceFromAI,
    offline: offlineGenerators.generateOfflineFindTheDifference,
  },
  [ActivityType.VISUAL_ODD_ONE_OUT]: {
    ai: aiGenerators.generateVisualOddOneOutFromAI,
    offline: offlineGenerators.generateOfflineVisualOddOneOut,
  },
  [ActivityType.GRID_DRAWING]: {
    ai: withAI(ActivityType.GRID_DRAWING),
    offline: offlineGenerators.generateOfflineGridDrawing,
  },
  [ActivityType.SYMMETRY_DRAWING]: {
    ai: withAI(ActivityType.SYMMETRY_DRAWING),
    offline: offlineGenerators.generateOfflineSymmetryDrawing,
  },
  [ActivityType.WORD_SEARCH]: {
    ai: withAI(ActivityType.WORD_SEARCH),
    offline: offlineGenerators.generateOfflineWordSearch,
  },
  [ActivityType.SHAPE_COUNTING]: {
    ai: aiGenerators.generateShapeCountingFromAI,
    offline: offlineGenerators.generateOfflineShapeCounting,
  },
  [ActivityType.DIRECTIONAL_TRACKING]: {
    ai: withAI(ActivityType.DIRECTIONAL_TRACKING),
    offline: offlineGenerators.generateOfflineDirectionalTracking,
  },
  [ActivityType.VISUAL_TRACKING_LINES]: {
    ai: withAI(ActivityType.VISUAL_TRACKING_LINES),
    offline: offlineGenerators.generateOfflineVisualTrackingLines,
  },
  [ActivityType.ATTENTION_TO_QUESTION]: {
    ai: withAI(ActivityType.ATTENTION_TO_QUESTION),
    offline: offlineGenerators.generateOfflineAttentionToQuestion,
  },
  [ActivityType.WORD_MEMORY]: {
    ai: aiGenerators.generateWordMemoryFromAI,
    offline: offlineGenerators.generateOfflineWordMemory,
  },
  [ActivityType.VISUAL_MEMORY]: {
    ai: aiGenerators.generateVisualMemoryFromAI,
    offline: offlineGenerators.generateOfflineVisualMemory,
  },
  [ActivityType.CHARACTER_MEMORY]: {
    ai: aiGenerators.generateCharacterMemoryFromAI,
    offline: offlineGenerators.generateOfflineCharacterMemory,
  },
  [ActivityType.COLOR_WHEEL_MEMORY]: {
    ai: aiGenerators.generateColorWheelMemoryFromAI,
    offline: offlineGenerators.generateOfflineColorWheelMemory,
  },
  [ActivityType.IMAGE_COMPREHRENSION]: {
    ai: aiGenerators.generateImageComprehensionFromAI,
    offline: offlineGenerators.generateOfflineImageComprehension,
  },
  [ActivityType.STROOP_TEST]: {
    ai: aiGenerators.generateStroopTestFromAI,
    offline: offlineGenerators.generateOfflineStroopTest,
  },
  [ActivityType.BURDON_TEST]: {
    ai: aiGenerators.generateBurdonTestFromAI,
    offline: offlineGenerators.generateOfflineBurdonTest,
  },
  [ActivityType.NUMBER_SEARCH]: {
    ai: aiGenerators.generateNumberSearchFromAI,
    offline: offlineGenerators.generateOfflineNumberSearch,
  },
  [ActivityType.CHAOTIC_NUMBER_SEARCH]: {
    ai: aiGenerators.generateChaoticNumberSearchFromAI,
    offline: offlineGenerators.generateOfflineChaoticNumberSearch,
  },
  [ActivityType.FIND_IDENTICAL_WORD]: {
    ai: aiGenerators.generateFindTheDuplicateInRowFromAI,
    offline: offlineGenerators.generateOfflineFindTheDuplicateInRow,
  },
  [ActivityType.LETTER_GRID_TEST]: {
    ai: aiGenerators.generateLetterGridTestFromAI,
    offline: offlineGenerators.generateOfflineLetterGridTest,
  },
  [ActivityType.TARGET_SEARCH]: {
    ai: aiGenerators.generateTargetSearchFromAI,
    offline: offlineGenerators.generateOfflineTargetSearch,
  },
  [ActivityType.THEMATIC_ODD_ONE_OUT]: {
    ai: aiGenerators.generateThematicOddOneOutFromAI,
    offline: offlineGenerators.generateOfflinePremiumThematicOddOneOut,
  },
  [ActivityType.VISUAL_INTERPRETATION]: {
    ai: aiGenerators.generateVisualInterpretationFromAI,
    offline: offlineGenerators.generateOfflineVisualInterpretation,
  },

  // 4. HİKAYE & SÖZEL MANTIK
  [ActivityType.STORY_COMPREHENSION]: {
    ai: aiGenerators.generateStoryComprehensionFromAI,
    offline: offlineGenerators.generateOfflineStoryComprehension,
  },
  [ActivityType.STORY_ANALYSIS]: {
    ai: aiGenerators.generateStoryAnalysisFromAI,
    offline: offlineGenerators.generateOfflineStoryAnalysis,
  },
  [ActivityType.STORY_CREATION_PROMPT]: {
    ai: aiGenerators.generateStoryCreationPromptFromAI,
    offline: offlineGenerators.generateOfflineStoryCreationPrompt,
  },
  [ActivityType.WORDS_IN_STORY]: {
    ai: aiGenerators.generateWordsInStoryFromAI,
    offline: offlineGenerators.generateOfflineWordsInStory,
  },
  [ActivityType.STORY_SEQUENCING]: {
    ai: aiGenerators.generateStorySequencingFromAI,
    offline: offlineGenerators.generateOfflineStorySequencing,
  },
  [ActivityType.PROVERB_SAYING_SORT]: {
    ai: aiGenerators.generateProverbSayingSortFromAI,
    offline: offlineGenerators.generateOfflineProverbSayingSort,
  },
  [ActivityType.PROVERB_WORD_CHAIN]: {
    ai: aiGenerators.generateProverbWordChainFromAI,
    offline: offlineGenerators.generateOfflineProverbWordChain,
  },
  [ActivityType.PROVERB_FILL_IN_THE_BLANK]: {
    ai: aiGenerators.generateProverbFillInTheBlankFromAI,
    offline: offlineGenerators.generateOfflineProverbFillInTheBlank,
  },
  [ActivityType.PROVERB_SEARCH]: {
    ai: aiGenerators.generateProverbSearchFromAI,
    offline: offlineGenerators.generateOfflineProverbSearch,
  },
  [ActivityType.PROVERB_SENTENCE_FINDER]: {
    ai: aiGenerators.generateProverbSentenceFinderFromAI,
    offline: offlineGenerators.generateOfflineProverbSentenceFinder,
  },
  [ActivityType.FAMILY_TREE_MATRIX]: {
    ai: aiGenerators.generateFamilyTreeMatrixFromAI,
    offline: offlineGenerators.generateOfflineFamilyTreeMatrix,
  },

  // 5. BOŞ / TANIMSIZ AKTİVİTELER (Placeholder)
  // Bu aktivitelerin henüz spesifik bir generator fonksiyonu olmayabilir.
  [ActivityType.OCR_CONTENT]: {
    ai: withAI(ActivityType.OCR_CONTENT),
    offline: withOffline(ActivityType.OCR_CONTENT),
  },
  [ActivityType.ASSESSMENT_REPORT]: {
    ai: withAI(ActivityType.ASSESSMENT_REPORT),
    offline: withOffline(ActivityType.ASSESSMENT_REPORT),
  },
  [ActivityType.WORKBOOK]: {
    ai: withAI(ActivityType.WORKBOOK),
    offline: withOffline(ActivityType.WORKBOOK),
  },
  [ActivityType.REAL_LIFE_MATH_PROBLEMS]: {
    ai: withAI(ActivityType.REAL_LIFE_MATH_PROBLEMS),
    offline: offlineGenerators.generateOfflinePremiumRealLifeMath,
  },
  [ActivityType.ATTENTION_DEVELOPMENT]: {
    ai: withAI(ActivityType.ATTENTION_DEVELOPMENT),
    offline: offlineGenerators.generateOfflinePremiumAttentionDevelopment,
  },
  [ActivityType.ATTENTION_FOCUS]: {
    ai: withAI(ActivityType.ATTENTION_FOCUS),
    offline: offlineGenerators.generateOfflinePremiumAttentionFocus,
  },
  [ActivityType.ANAGRAM]: {
    ai: withAI(ActivityType.ANAGRAM),
    offline: offlineGenerators.generateOfflinePremiumAnagram,
  },
  [ActivityType.CROSSWORD]: {
    ai: withAI(ActivityType.CROSSWORD),
    offline: offlineGenerators.generateOfflinePremiumCrossword,
  },
  [ActivityType.ODD_ONE_OUT]: {
    ai: withAI(ActivityType.ODD_ONE_OUT),
    offline: offlineGenerators.generateOfflinePremiumOddOneOut,
  },
  [ActivityType.CONCEPT_MATCH]: {
    ai: withAI(ActivityType.CONCEPT_MATCH),
    offline: offlineGenerators.generateOfflinePremiumConceptMatch,
  },
  [ActivityType.ESTIMATION]: {
    ai: withAI(ActivityType.ESTIMATION),
    offline: offlineGenerators.generateOfflinePremiumEstimation,
  },
  [ActivityType.SPATIAL_GRID]: {
    ai: withAI(ActivityType.SPATIAL_GRID),
    offline: offlineGenerators.generateOfflinePremiumSpatialGrid,
  },
  [ActivityType.DOT_PAINTING]: {
    ai: withAI(ActivityType.DOT_PAINTING),
    offline: offlineGenerators.generateOfflinePremiumDotPainting,
  },
  [ActivityType.SHAPE_SUDOKU]: {
    ai: withAI(ActivityType.SHAPE_SUDOKU),
    offline: offlineGenerators.generateOfflinePremiumShapeSudoku,
  },

  // ── INFOGRAPHIC ADAPTERS (İlk 10 Aktivite) ────────────────────────────────
  ...Object.fromEntries(
    Object.entries(INFOGRAPHIC_ADAPTERS_FIRST_10).map(([key, pair]) => [
      key,
      {
        ai: (options: GeneratorOptions) =>
          pair.aiGenerator({
            topic: options.topic || 'Konu',
            ageGroup: options.ageGroup || '8-10',
            difficulty: options.difficulty || 'Orta',
            profile: options.profile || 'general',
            itemCount: options.count || 5,
            activityParams: options.customParams || {},
          }),
        offline: async (options: GeneratorOptions) =>
          pair.offlineGenerator({
            topic: options.topic || 'Konu',
            ageGroup: options.ageGroup || '8-10',
            difficulty: options.difficulty || 'Orta',
            profile: options.profile || 'general',
            itemCount: options.count || 5,
            activityParams: options.customParams || {},
          }),
      },
    ])
  ),

  // ── INFOGRAPHIC FACTORY (Kalan 84 Aktivite) ───────────────────────────────
  ...Object.fromEntries(
    Object.entries(INFOGRAPHIC_ADAPTERS_REMAINING_84).map(([key, pair]) => [
      key,
      {
        ai: (options: GeneratorOptions) =>
          pair.aiGenerator({
            topic: options.topic || 'Konu',
            ageGroup: options.ageGroup || '8-10',
            difficulty: options.difficulty || 'Orta',
            profile: options.profile || 'general',
            itemCount: options.count || 5,
            activityParams: options.customParams || {},
          }),
        offline: async (options: GeneratorOptions) =>
          pair.offlineGenerator({
            topic: options.topic || 'Konu',
            ageGroup: options.ageGroup || '8-10',
            difficulty: options.difficulty || 'Orta',
            profile: options.profile || 'general',
            itemCount: options.count || 5,
            activityParams: options.customParams || {},
          }),
      },
    ])
  ),
};
