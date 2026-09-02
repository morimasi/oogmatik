import { ActivityType } from '../../types/activity';
import { GeneratorOptions } from '../../types/core';
import * as aiGenerators from './index';
import * as offlineGenerators from '../offlineGenerators/index';
import { generateMatProblemFromAI } from './mathProblemGenerator';
import { generateMatProblemSeti } from '../matProblemService';
import type { MatProblemSeti } from '../../types/matProblem';


import * as sariKitapGenerators from './sariKitap/index';
import { generateSemanticLinkerAI, generateSemanticLinkerOffline } from '../../modules/activities/semantic-linker/generators';
import { generateLETTER_CONNECTFromAI } from '../../modules/activities/letter-connect/generators';
import { generateOfflineLETTER_CONNECT } from '../../modules/activities/letter-connect/offlineGenerators';
import { generateHARF_BAGLAMAFromAI } from '../../modules/activities/harf-baglama/generators';
import { generateOfflineHARF_BAGLAMA } from '../../modules/activities/harf-baglama/offlineGenerators';

// AUTONOM_IMPORTS_START
// AUTONOM_IMPORTS_END



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

export const getGeneratorMapping = async (type: ActivityType): Promise<GeneratorMapping | null> => {
  // 1. Önce statik registry'e bak
  const staticMapping = ACTIVITY_GENERATOR_REGISTRY[type];
  if (staticMapping) return staticMapping;

  // 2. Dinamik / Akıllı Fallback mapping
  if (type) {
    return {
      ai: withAI(type),
      offline: withOffline(type),
    };
  }

  return null;
};

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
  [ActivityType.SENTENCE_5W1H]: {
    ai: aiGenerators.generateSentenceFiveWOneHFromAI,
    offline: offlineGenerators.generateOfflineSentenceFiveWOneH,
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
    ai: offlineGenerators.generateOfflineReadingPyramid,
    offline: offlineGenerators.generateOfflineReadingPyramid,
  },
  [ActivityType.READING_FLOW]: {
    ai: offlineGenerators.generateOfflineReadingFlow,
    offline: offlineGenerators.generateOfflineReadingFlow,
  },
  [ActivityType.PHONOLOGICAL_AWARENESS]: {
    ai: offlineGenerators.generateOfflinePhonologicalAwareness,
    offline: offlineGenerators.generateOfflinePhonologicalAwareness,
  },
  [ActivityType.RAPID_NAMING]: {
    ai: offlineGenerators.generateOfflineRapidNaming,
    offline: offlineGenerators.generateOfflineRapidNaming,
  },
  [ActivityType.LETTER_DISCRIMINATION]: {
    ai: offlineGenerators.generateOfflineLetterDiscrimination,
    offline: offlineGenerators.generateOfflineLetterDiscrimination,
  },
  [ActivityType.LETTER_MAZE_TEST]: {
    ai: offlineGenerators.generateOfflineLetterMazeTest,
    offline: offlineGenerators.generateOfflineLetterMazeTest,
  },
  [ActivityType.MIRROR_LETTERS]: {
    ai: offlineGenerators.generateOfflineMirrorLetters,
    offline: offlineGenerators.generateOfflineMirrorLetters,
  },
  [ActivityType.SYLLABLE_TRAIN]: {
    ai: offlineGenerators.generateOfflineSyllableTrain,
    offline: offlineGenerators.generateOfflineSyllableTrain,
  },
  [ActivityType.BACKWARD_SPELLING]: {
    ai: offlineGenerators.generateOfflineBackwardSpelling,
    offline: offlineGenerators.generateOfflineBackwardSpelling,
  },
  [ActivityType.CODE_READING]: {
    ai: offlineGenerators.generateOfflineCodeReading,
    offline: offlineGenerators.generateOfflineCodeReading,
  },
  [ActivityType.HANDWRITING_PRACTICE]: {
    ai: offlineGenerators.generateOfflineHandwritingPractice,
    offline: offlineGenerators.generateOfflineHandwritingPractice,
  },
  [ActivityType.MORPHOLOGY_MATRIX]: {
    ai: offlineGenerators.generateOfflineMorphologyMatrix,
    offline: offlineGenerators.generateOfflineMorphologyMatrix,
  },
  [ActivityType.MISSING_PARTS]: {
    ai: aiGenerators.generateAdvancedMissingPartsFromAI,
    offline: offlineGenerators.generateOfflineMissingParts,
  },
  [ActivityType.READING_COMPREHENSION]: {
    ai: withAI(ActivityType.READING_COMPREHENSION),
    offline: withOffline(ActivityType.READING_COMPREHENSION),
  },

  // 2. MATEMATİK & MANTIK
  [ActivityType.NUMBER_PATTERN]: {
    ai: aiGenerators.generateNumberPatternFromAI,
    offline: offlineGenerators.generateOfflinePremiumNumberPattern,
  },
  [ActivityType.MATH_BASIC_OPERATIONS]: {
    ai: aiGenerators.generateBasicOperationsFromAI,
    offline: offlineGenerators.generateOfflineBasicOperations,
  },
  [ActivityType.MATH_WORD_PROBLEMS]: {
    ai: aiGenerators.generateMathWordProblemsFromAI,
    offline: offlineGenerators.generateOfflineMathWordProblems,
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
    offline: offlineGenerators.generateOfflineGizemliSayilar,
  },
  [ActivityType.MATH_PUZZLE]: {
    ai: aiGenerators.generateMathPuzzleFromAI,
    offline: offlineGenerators.generateOfflinePremiumMathPuzzle,
  },
  [ActivityType.CLOCK_READING]: {
    ai: aiGenerators.generateClockReadingFromAI,
    offline: offlineGenerators.generateOfflineClockReading,
  },
  [ActivityType.MONEY_COUNTING]: {
    ai: aiGenerators.generateMoneyCountingFromAI,
    offline: offlineGenerators.generateOfflineMoneyCounting,
  },
  [ActivityType.MATH_MEMORY_CARDS]: {
    ai: aiGenerators.generateMathMemoryCardsFromAI,
    offline: offlineGenerators.generateOfflineMathMemoryCards,
  },
  [ActivityType.NUMBER_PATH_LOGIC]: {
    ai: aiGenerators.generateNumberPathLogicFromAI,
    offline: offlineGenerators.generateOfflineNumberPathLogic,
  },
  [ActivityType.VISUAL_ARITHMETIC]: {
    ai: aiGenerators.generateVisualArithmeticFromAI,
    offline: offlineGenerators.generateOfflineVisualArithmetic,
  },
  [ActivityType.NUMBER_SENSE]: {
    ai: aiGenerators.generateNumberSenseFromAI,
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
    ai: (options) => aiGenerators.generateSmartFallbackAI(ActivityType.AI_WORKSHEET_CONVERTER, options),
    offline: (options) => offlineGenerators.generateOfflineFallback(ActivityType.AI_WORKSHEET_CONVERTER, options),
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
  [ActivityType.KAVRAM_HARITASI]: {
    ai: aiGenerators.generateKavramHaritasiFromAI,
    offline: offlineGenerators.generateOfflineKavramHaritasi,
  },
  [ActivityType.ES_ANLAMLI_KELIMELER]: {
    ai: aiGenerators.generateEsAnlamliKelimelerFromAI,
    offline: offlineGenerators.generateOfflineEsAnlamliKelimeler,
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
    ai: offlineGenerators.generateOfflineGridDrawing,
    offline: offlineGenerators.generateOfflineGridDrawing,
  },
  [ActivityType.SEMANTIC_LINKER]: {
    ai: (opt: any) => generateSemanticLinkerAI(opt.prompt, opt.count),
    offline: (opt: any) => Promise.resolve(generateSemanticLinkerOffline(opt.count)),
  },

  [ActivityType.SYMMETRY_DRAWING]: {
    ai: offlineGenerators.generateOfflineSymmetryDrawing,
    offline: offlineGenerators.generateOfflineSymmetryDrawing,
  },
  [ActivityType.WORD_SEARCH]: {
    ai: aiGenerators.generateWordSearchFromAI,
    offline: offlineGenerators.generateOfflineWordSearch,
  },
  [ActivityType.SHAPE_COUNTING]: {
    ai: aiGenerators.generateShapeCountingFromAI,
    offline: offlineGenerators.generateOfflineShapeCounting,
  },
  [ActivityType.DIRECTIONAL_TRACKING]: {
    ai: offlineGenerators.generateOfflineDirectionalTracking,
    offline: offlineGenerators.generateOfflineDirectionalTracking,
  },
  [ActivityType.VISUAL_TRACKING_LINES]: {
    ai: offlineGenerators.generateOfflineVisualTrackingLines,
    offline: offlineGenerators.generateOfflineVisualTrackingLines,
  },
  [ActivityType.ATTENTION_TO_QUESTION]: {
    ai: offlineGenerators.generateOfflineAttentionToQuestion,
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
  [ActivityType.BRAIN_TEASERS]: {
    ai: aiGenerators.generateBrainTeasersFromAI,
    offline: offlineGenerators.generateOfflineBrainTeasers,
  },

  // 4. HİKAYE & SÖZEL MANTIK
  [ActivityType.STORY_COMPREHENSION]: {
    ai: aiGenerators.generateStoryComprehensionFromAI,
    offline: offlineGenerators.generateOfflineStoryComprehension,
  },
  [ActivityType.STORY_ANALYSIS]: {
    ai: aiGenerators.generateStoryAnalysisFromAI,
    offline: async (opts) => {
      const results = await offlineGenerators.generateOfflineStoryAnalysis(opts);
      return results[0];
    },
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
  [ActivityType.BOX_MATH]: {
    ai: aiGenerators.generateBoxMathFromAI,
    offline: offlineGenerators.generateOfflineBoxMath,
  },
  [ActivityType.QUEUE_ORDERING]: {
    ai: aiGenerators.generateQueueOrderingFromAI,
    offline: offlineGenerators.generateOfflineQueueOrdering,
  },
  [ActivityType.INFOGRAPHIC_SHORT_ANSWER]: {
    ai: aiGenerators.generateShortAnswerFromAI,
    offline: offlineGenerators.generateOfflineShortAnswer,
  },
  [ActivityType.INFOGRAPHIC_CONCEPT_MAP]: {
    ai: withAI(ActivityType.INFOGRAPHIC_CONCEPT_MAP),
    offline: withOffline(ActivityType.INFOGRAPHIC_CONCEPT_MAP),
  },
  [ActivityType.INFOGRAPHIC_5W1H_BOARD]: {
    ai: withAI(ActivityType.INFOGRAPHIC_5W1H_BOARD),
    offline: withOffline(ActivityType.INFOGRAPHIC_5W1H_BOARD),
  },
  [ActivityType.SINAV]: {
    ai: aiGenerators.generateSinavFromAI,
    offline: offlineGenerators.generateOfflineSinav,
  },
  [ActivityType.MAT_SINAV]: {
    ai: aiGenerators.generateMatSinavFromAI,
    offline: offlineGenerators.generateOfflineMatSinav,
  },
  [ActivityType.MAT_PROBLEM]: {
    ai: aiGenerators.generateMatProblemFromAI,
    offline: generateMatProblemSeti as unknown as (options: GeneratorOptions) => Promise<MatProblemSeti>,
  },
  [ActivityType.REAL_LIFE_MATH_PROBLEMS]: {
    ai: aiGenerators.generateRealLifeMathProblemsFromAI,
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
    ai: aiGenerators.generateEstimationFromAI,
    offline: offlineGenerators.generateOfflinePremiumEstimation,
  },
  [ActivityType.SPATIAL_GRID]: {
    ai: aiGenerators.generateSpatialGridFromAI,
    offline: offlineGenerators.generateOfflinePremiumSpatialGrid,
  },
  [ActivityType.DOT_PAINTING]: {
    ai: withAI(ActivityType.DOT_PAINTING),
    offline: offlineGenerators.generateOfflinePremiumDotPainting,
  },
  [ActivityType.SHAPE_SUDOKU]: {
    ai: aiGenerators.generateShapeSudokuFromAI,
    offline: offlineGenerators.generateOfflinePremiumShapeSudoku,
  },


  [ActivityType.HARF_BAGLAMA]: {
    ai: generateHARF_BAGLAMAFromAI,
    offline: generateOfflineHARF_BAGLAMA,
  },
  [ActivityType.LETTER_CONNECT]: {
    ai: generateLETTER_CONNECTFromAI,
    offline: generateOfflineLETTER_CONNECT,
  },

  // 6. DİĞER & EKSİKSİZ YAPILANDIRILMIŞ AKTİVİTELER
  [ActivityType.WORKBOOK]: { ai: withAI(ActivityType.WORKBOOK), offline: withOffline(ActivityType.WORKBOOK) },
  [ActivityType.SHORT_ANSWER]: { ai: aiGenerators.generateShortAnswerFromAI, offline: withOffline(ActivityType.SHORT_ANSWER) },
  [ActivityType.PREMIUM_STUDIO]: { ai: withAI(ActivityType.PREMIUM_STUDIO), offline: withOffline(ActivityType.PREMIUM_STUDIO) },
  [ActivityType.SUPER_STUDIO]: { ai: withAI(ActivityType.SUPER_STUDIO), offline: withOffline(ActivityType.SUPER_STUDIO) },
  [ActivityType.ACTIVITY_STUDIO]: { ai: withAI(ActivityType.ACTIVITY_STUDIO), offline: withOffline(ActivityType.ACTIVITY_STUDIO) },
  [ActivityType.KELIME_CUMLE]: { ai: withAI(ActivityType.KELIME_CUMLE), offline: withOffline(ActivityType.KELIME_CUMLE) },
  [ActivityType.CURRICULUM]: { ai: withAI(ActivityType.CURRICULUM), offline: withOffline(ActivityType.CURRICULUM) },
  [ActivityType.FASCICLE]: { ai: withAI(ActivityType.FASCICLE), offline: withOffline(ActivityType.FASCICLE) },
  [ActivityType.MATH_GEOMETRY]: { ai: withAI(ActivityType.MATH_GEOMETRY), offline: withOffline(ActivityType.MATH_GEOMETRY) },
  [ActivityType.GRAMMAR_EXERCISE]: { ai: withAI(ActivityType.GRAMMAR_EXERCISE), offline: withOffline(ActivityType.GRAMMAR_EXERCISE) },
  [ActivityType.VOCABULARY_BUILDING]: { ai: withAI(ActivityType.VOCABULARY_BUILDING), offline: withOffline(ActivityType.VOCABULARY_BUILDING) },
  [ActivityType.LOGIC_PUZZLE]: { ai: withAI(ActivityType.LOGIC_PUZZLE), offline: withOffline(ActivityType.LOGIC_PUZZLE) },
  [ActivityType.PATTERN_RECOGNITION]: { ai: withAI(ActivityType.PATTERN_RECOGNITION), offline: withOffline(ActivityType.PATTERN_RECOGNITION) },
  [ActivityType.VISUAL_PERCEPTION]: { ai: withAI(ActivityType.VISUAL_PERCEPTION), offline: withOffline(ActivityType.VISUAL_PERCEPTION) },
  [ActivityType.DYSLEXIA_SYLLABLE_BREAK]: { ai: withAI(ActivityType.DYSLEXIA_SYLLABLE_BREAK), offline: withOffline(ActivityType.DYSLEXIA_SYLLABLE_BREAK) },
  [ActivityType.DYSLEXIA_WORD_RECOGNITION]: { ai: withAI(ActivityType.DYSLEXIA_WORD_RECOGNITION), offline: withOffline(ActivityType.DYSLEXIA_WORD_RECOGNITION) },
  [ActivityType.DYSLEXIA_SUPPORT]: { ai: withAI(ActivityType.DYSLEXIA_SUPPORT), offline: withOffline(ActivityType.DYSLEXIA_SUPPORT) },
  [ActivityType.ANAGRAM_PUZZLE]: { ai: withAI(ActivityType.ANAGRAM_PUZZLE), offline: withOffline(ActivityType.ANAGRAM_PUZZLE) },
  [ActivityType.DYSCALCULIA_NUMBER_SENSE]: { ai: withAI(ActivityType.DYSCALCULIA_NUMBER_SENSE), offline: withOffline(ActivityType.DYSCALCULIA_NUMBER_SENSE) },
  [ActivityType.DYSCALCULIA_MAGNITUDE_COMPARISON]: { ai: withAI(ActivityType.DYSCALCULIA_MAGNITUDE_COMPARISON), offline: withOffline(ActivityType.DYSCALCULIA_MAGNITUDE_COMPARISON) },
  [ActivityType.MEMORY_GAME]: { ai: withAI(ActivityType.MEMORY_GAME), offline: withOffline(ActivityType.MEMORY_GAME) },
  [ActivityType.QUICK_RECALL]: { ai: withAI(ActivityType.QUICK_RECALL), offline: withOffline(ActivityType.QUICK_RECALL) },
  [ActivityType.MATH_ALGEBRA]: { ai: withAI(ActivityType.MATH_ALGEBRA), offline: withOffline(ActivityType.MATH_ALGEBRA) },
  [ActivityType.TEXT_ANALYSIS]: { ai: withAI(ActivityType.TEXT_ANALYSIS), offline: withOffline(ActivityType.TEXT_ANALYSIS) },
  [ActivityType.SCIENCE_EXPERIMENT]: { ai: withAI(ActivityType.SCIENCE_EXPERIMENT), offline: withOffline(ActivityType.SCIENCE_EXPERIMENT) },
  [ActivityType.LOGIC_REASONING]: { ai: withAI(ActivityType.LOGIC_REASONING), offline: withOffline(ActivityType.LOGIC_REASONING) },
  [ActivityType.SPELLING_PRACTICE]: { ai: withAI(ActivityType.SPELLING_PRACTICE), offline: withOffline(ActivityType.SPELLING_PRACTICE) },
  [ActivityType.WRITING_PROMPT]: { ai: withAI(ActivityType.WRITING_PROMPT), offline: withOffline(ActivityType.WRITING_PROMPT) },
  [ActivityType.DIAGNOSTIC_TEST]: { ai: withAI(ActivityType.DIAGNOSTIC_TEST), offline: withOffline(ActivityType.DIAGNOSTIC_TEST) },
  [ActivityType.SKILL_ASSESSMENT]: { ai: withAI(ActivityType.SKILL_ASSESSMENT), offline: withOffline(ActivityType.SKILL_ASSESSMENT) },
  [ActivityType.PROGRESS_MONITORING]: { ai: withAI(ActivityType.PROGRESS_MONITORING), offline: withOffline(ActivityType.PROGRESS_MONITORING) },
  [ActivityType.SELF_ASSESSMENT]: { ai: withAI(ActivityType.SELF_ASSESSMENT), offline: withOffline(ActivityType.SELF_ASSESSMENT) },
  [ActivityType.CREATIVE_WRITING]: { ai: withAI(ActivityType.CREATIVE_WRITING), offline: withOffline(ActivityType.CREATIVE_WRITING) },
  [ActivityType.STORY_STARTER]: { ai: withAI(ActivityType.STORY_STARTER), offline: withOffline(ActivityType.STORY_STARTER) },
  [ActivityType.DRAWING_EXERCISE]: { ai: withAI(ActivityType.DRAWING_EXERCISE), offline: withOffline(ActivityType.DRAWING_EXERCISE) },
  [ActivityType.COLLAGE_ACTIVITY]: { ai: withAI(ActivityType.COLLAGE_ACTIVITY), offline: withOffline(ActivityType.COLLAGE_ACTIVITY) },
  [ActivityType.REFLECTION_PROMPT]: { ai: withAI(ActivityType.REFLECTION_PROMPT), offline: withOffline(ActivityType.REFLECTION_PROMPT) },
  [ActivityType.OBSERVATION_TASK]: { ai: withAI(ActivityType.OBSERVATION_TASK), offline: withOffline(ActivityType.OBSERVATION_TASK) },
  [ActivityType.HISTORY_TIMELINE]: { ai: withAI(ActivityType.HISTORY_TIMELINE), offline: withOffline(ActivityType.HISTORY_TIMELINE) },
  [ActivityType.MAP_READING]: { ai: withAI(ActivityType.MAP_READING), offline: withOffline(ActivityType.MAP_READING) },
  [ActivityType.GOAL_SETTING]: { ai: withAI(ActivityType.GOAL_SETTING), offline: withOffline(ActivityType.GOAL_SETTING) },
  [ActivityType.SARI_KITAP_STUDIO]: { ai: withAI(ActivityType.SARI_KITAP_STUDIO), offline: offlineGenerators.generateOfflineSariKitapStudio },

  // AUTONOM_REGISTRY_START
  // AUTONOM_REGISTRY_END
};

