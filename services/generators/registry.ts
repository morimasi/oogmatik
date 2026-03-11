import { ActivityType, GeneratorOptions } from '../../types/core';
import * as aiGenerators from './index';
import * as offlineGenerators from '../offlineGenerators/index';

/**
 * Aktivite Jeneratör Haritası
 * Hangi ActivityType'ın hangi AI ve Offline fonksiyonuna karşılık geldiğini tanımlar.
 */
export interface GeneratorMapping {
    ai?: (options: GeneratorOptions) => Promise<any>;
    offline?: (options: GeneratorOptions) => Promise<any>;
}

export const ACTIVITY_GENERATOR_REGISTRY: Partial<Record<ActivityType, GeneratorMapping>> = {
    // 1. OKUMA & DİL BECERİLERİ
    [ActivityType.FIVE_W_ONE_H]: {
        ai: aiGenerators.generateFiveWOneHFromAI,
        offline: offlineGenerators.generateOfflineFiveWOneH
    },
    [ActivityType.LOGIC_ERROR_HUNTER]: {
        ai: aiGenerators.generateLogicErrorHunterFromAI,
        offline: offlineGenerators.generateOfflineLogicErrorHunter
    },
    [ActivityType.COLORFUL_SYLLABLE_READING]: {
        ai: aiGenerators.generateColorfulSyllableReadingFromAI,
        offline: offlineGenerators.generateOfflineColorfulSyllableReading
    },
    [ActivityType.FIND_LETTER_PAIR]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineFindLetterPair
    },
    [ActivityType.READING_SUDOKU]: {
        ai: aiGenerators.generateReadingSudokuFromAI,
        offline: offlineGenerators.generateOfflineReadingSudoku
    },
    [ActivityType.SYLLABLE_MASTER_LAB]: {
        ai: aiGenerators.generateSyllableMasterLabFromAI,
        offline: offlineGenerators.generateOfflineSyllableMasterLab
    },
    [ActivityType.READING_STROOP]: {
        ai: aiGenerators.generateReadingStroopFromAI,
        offline: offlineGenerators.generateOfflineReadingStroop
    },
    [ActivityType.SYNONYM_ANTONYM_MATCH]: {
        ai: aiGenerators.generateSynonymAntonymMatchFromAI,
        offline: offlineGenerators.generateOfflineSynonymAntonymMatch
    },
    [ActivityType.LETTER_VISUAL_MATCHING]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineLetterVisualMatching
    },
    [ActivityType.SYLLABLE_WORD_BUILDER]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineSyllableWordBuilder
    },
    [ActivityType.FAMILY_RELATIONS]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineFamilyRelations
    },
    [ActivityType.FAMILY_LOGIC_TEST]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineFamilyLogicTest
    },
    [ActivityType.READING_PYRAMID]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineReadingPyramid
    },
    [ActivityType.READING_FLOW]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineReadingFlow
    },
    [ActivityType.PHONOLOGICAL_AWARENESS]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflinePhonologicalAwareness
    },
    [ActivityType.RAPID_NAMING]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineRapidNaming
    },
    [ActivityType.LETTER_DISCRIMINATION]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineLetterDiscrimination
    },
    [ActivityType.MIRROR_LETTERS]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineMirrorLetters
    },
    [ActivityType.SYLLABLE_TRAIN]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineSyllableTrain
    },
    [ActivityType.BACKWARD_SPELLING]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineBackwardSpelling
    },
    [ActivityType.CODE_READING]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineCodeReading
    },
    [ActivityType.HANDWRITING_PRACTICE]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineHandwritingPractice
    },
    [ActivityType.MORPHOLOGY_MATRIX]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineMorphologyMatrix
    },
    [ActivityType.MISSING_PARTS]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineMissingParts
    },

    // 2. MATEMATİK & MANTIK
    [ActivityType.NUMBER_PATTERN]: {
        ai: aiGenerators.generateNumberPatternFromAI,
        offline: undefined
    },
    [ActivityType.ABC_CONNECT]: {
        ai: aiGenerators.generateAbcConnectFromAI,
        offline: offlineGenerators.generateOfflineAbcConnect
    },
    [ActivityType.MAGIC_PYRAMID]: {
        ai: aiGenerators.generateMagicPyramidFromAI,
        offline: offlineGenerators.generateOfflineMagicPyramid
    },
    [ActivityType.CAPSULE_GAME]: {
        ai: aiGenerators.generateNumberCapsuleFromAI,
        offline: offlineGenerators.generateOfflineCapsuleGame
    },
    [ActivityType.ODD_EVEN_SUDOKU]: {
        ai: aiGenerators.generateOddEvenSudokuFromAI,
        offline: offlineGenerators.generateOfflineOddEvenSudoku
    },
    [ActivityType.FUTOSHIKI]: {
        ai: aiGenerators.generateFutoshikiFromAI,
        offline: offlineGenerators.generateOfflineFutoshiki
    },
    [ActivityType.KENDOKU]: {
        ai: aiGenerators.generateKendokuFromAI,
        offline: undefined
    },
    [ActivityType.NUMBER_PYRAMID]: {
        ai: aiGenerators.generateNumberPyramidFromAI,
        offline: undefined
    },
    [ActivityType.APARTMENT_LOGIC_PUZZLE]: {
        ai: aiGenerators.generateApartmentLogicPuzzleFromAI,
        offline: offlineGenerators.generateOfflineApartmentLogicPuzzle
    },
    [ActivityType.NUMBER_LOGIC_RIDDLES]: {
        ai: aiGenerators.generateNumberLogicRiddlesFromAI,
        offline: offlineGenerators.generateOfflineNumberLogicRiddles
    },
    [ActivityType.MATH_PUZZLE]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineMathPuzzle
    },
    [ActivityType.CLOCK_READING]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineClockReading
    },
    [ActivityType.MONEY_COUNTING]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineMoneyCounting
    },
    [ActivityType.MATH_MEMORY_CARDS]: {
        ai: aiGenerators.generateMathMemoryCardsFromAI,
        offline: offlineGenerators.generateOfflineMathMemoryCards
    },
    [ActivityType.NUMBER_PATH_LOGIC]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineNumberPathLogic
    },
    [ActivityType.VISUAL_ARITHMETIC]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineVisualArithmetic
    },
    [ActivityType.NUMBER_SENSE]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineNumberSense
    },
    [ActivityType.FINANCIAL_MARKET_CALCULATOR]: {
        ai: aiGenerators.generateFinancialMarketCalculatorFromAI,
        offline: offlineGenerators.generateOfflineFinancialMarketCalculator
    },
    [ActivityType.LOGIC_GRID_PUZZLE]: {
        ai: aiGenerators.generateLogicGridPuzzleFromAI,
        offline: undefined
    },
    [ActivityType.PUNCTUATION_MAZE]: {
        ai: aiGenerators.generatePunctuationMazeFromAI,
        offline: undefined
    },
    [ActivityType.MATH_STUDIO]: {
        ai: (options) => aiGenerators.generateMathProblemsAI(options as any),
        offline: undefined // generateMathDrillSet has different signature
    },
    [ActivityType.ALGORITHM_GENERATOR]: {
        ai: aiGenerators.generateAlgorithmGeneratorFromAI,
        offline: offlineGenerators.generateOfflineAlgorithmGenerator
    },
    [ActivityType.AI_WORKSHEET_CONVERTER]: {
        ai: aiGenerators.generateAiWorksheetConverterFromAI,
        offline: undefined
    },
    [ActivityType.HIDDEN_PASSWORD_GRID]: {
        ai: aiGenerators.generateHiddenPasswordGridFromAI,
        offline: offlineGenerators.generateOfflineHiddenPasswordGrid
    },

    // 3. GÖRSEL ALGI & DİKKAT
    [ActivityType.PATTERN_COMPLETION]: {
        ai: aiGenerators.generatePatternCompletionFromAI,
        offline: offlineGenerators.generateOfflinePatternCompletion
    },
    [ActivityType.DIRECTIONAL_CODE_READING]: {
        ai: aiGenerators.generateDirectionalCodeReadingFromAI,
        offline: offlineGenerators.generateOfflineDirectionalCodeReading
    },
    [ActivityType.MAP_INSTRUCTION]: {
        ai: aiGenerators.generateMapInstructionFromAI,
        offline: offlineGenerators.generateOfflineMapInstruction
    },
    [ActivityType.FIND_THE_DIFFERENCE]: {
        ai: aiGenerators.generateFindTheDifferenceFromAI,
        offline: offlineGenerators.generateOfflineFindTheDifference
    },
    [ActivityType.VISUAL_ODD_ONE_OUT]: {
        ai: aiGenerators.generateVisualOddOneOutFromAI,
        offline: offlineGenerators.generateOfflineVisualOddOneOut
    },
    [ActivityType.GRID_DRAWING]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineGridDrawing
    },
    [ActivityType.SYMMETRY_DRAWING]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineSymmetryDrawing
    },
    [ActivityType.WORD_SEARCH]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineWordSearch
    },
    [ActivityType.SHAPE_COUNTING]: {
        ai: aiGenerators.generateShapeCountingFromAI,
        offline: offlineGenerators.generateOfflineShapeCounting
    },
    [ActivityType.DIRECTIONAL_TRACKING]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineDirectionalTracking
    },
    [ActivityType.VISUAL_TRACKING_LINES]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineVisualTrackingLines
    },
    [ActivityType.ATTENTION_TO_QUESTION]: {
        ai: undefined,
        offline: offlineGenerators.generateOfflineAttentionToQuestion
    },
    [ActivityType.WORD_MEMORY]: {
        ai: aiGenerators.generateWordMemoryFromAI,
        offline: offlineGenerators.generateOfflineWordMemory
    },
    [ActivityType.VISUAL_MEMORY]: {
        ai: aiGenerators.generateVisualMemoryFromAI,
        offline: offlineGenerators.generateOfflineVisualMemory
    },
    [ActivityType.CHARACTER_MEMORY]: {
        ai: aiGenerators.generateCharacterMemoryFromAI,
        offline: offlineGenerators.generateOfflineCharacterMemory
    },
    [ActivityType.COLOR_WHEEL_MEMORY]: {
        ai: aiGenerators.generateColorWheelMemoryFromAI,
        offline: offlineGenerators.generateOfflineColorWheelMemory
    },
    [ActivityType.IMAGE_COMPREHRENSION]: {
        ai: aiGenerators.generateImageComprehensionFromAI,
        offline: offlineGenerators.generateOfflineImageComprehension
    },
    [ActivityType.STROOP_TEST]: {
        ai: aiGenerators.generateStroopTestFromAI,
        offline: offlineGenerators.generateOfflineStroopTest
    },
    [ActivityType.BURDON_TEST]: {
        ai: aiGenerators.generateBurdonTestFromAI,
        offline: offlineGenerators.generateOfflineBurdonTest
    },
    [ActivityType.NUMBER_SEARCH]: {
        ai: aiGenerators.generateNumberSearchFromAI,
        offline: offlineGenerators.generateOfflineNumberSearch
    },
    [ActivityType.CHAOTIC_NUMBER_SEARCH]: {
        ai: aiGenerators.generateChaoticNumberSearchFromAI,
        offline: offlineGenerators.generateOfflineChaoticNumberSearch
    },
    [ActivityType.FIND_IDENTICAL_WORD]: {
        ai: aiGenerators.generateFindTheDuplicateInRowFromAI,
        offline: offlineGenerators.generateOfflineFindTheDuplicateInRow
    },
    [ActivityType.LETTER_GRID_TEST]: {
        ai: aiGenerators.generateLetterGridTestFromAI,
        offline: offlineGenerators.generateOfflineLetterGridTest
    },
    [ActivityType.TARGET_SEARCH]: {
        ai: aiGenerators.generateTargetSearchFromAI,
        offline: offlineGenerators.generateOfflineTargetSearch
    },
    [ActivityType.THEMATIC_ODD_ONE_OUT]: {
        ai: aiGenerators.generateThematicOddOneOutFromAI,
        offline: undefined
    },
    [ActivityType.VISUAL_INTERPRETATION]: {
        ai: aiGenerators.generateVisualInterpretationFromAI,
        offline: offlineGenerators.generateOfflineVisualInterpretation
    },

    // 4. HİKAYE & SÖZEL MANTIK
    [ActivityType.STORY_COMPREHENSION]: {
        ai: aiGenerators.generateStoryComprehensionFromAI,
        offline: offlineGenerators.generateOfflineStoryComprehension
    },
    [ActivityType.STORY_ANALYSIS]: {
        ai: aiGenerators.generateStoryAnalysisFromAI,
        offline: offlineGenerators.generateOfflineStoryAnalysis
    },
    [ActivityType.STORY_CREATION_PROMPT]: {
        ai: aiGenerators.generateStoryCreationPromptFromAI,
        offline: offlineGenerators.generateOfflineStoryCreationPrompt
    },
    [ActivityType.WORDS_IN_STORY]: {
        ai: aiGenerators.generateWordsInStoryFromAI,
        offline: offlineGenerators.generateOfflineWordsInStory
    },
    [ActivityType.STORY_SEQUENCING]: {
        ai: aiGenerators.generateStorySequencingFromAI,
        offline: offlineGenerators.generateOfflineStorySequencing
    },
    [ActivityType.PROVERB_SAYING_SORT]: {
        ai: aiGenerators.generateProverbSayingSortFromAI,
        offline: offlineGenerators.generateOfflineProverbSayingSort
    },
    [ActivityType.PROVERB_WORD_CHAIN]: {
        ai: aiGenerators.generateProverbWordChainFromAI,
        offline: offlineGenerators.generateOfflineProverbWordChain
    },
    [ActivityType.PROVERB_FILL_IN_THE_BLANK]: {
        ai: aiGenerators.generateProverbFillInTheBlankFromAI,
        offline: offlineGenerators.generateOfflineProverbFillInTheBlank
    },
    [ActivityType.PROVERB_SEARCH]: {
        ai: aiGenerators.generateProverbSearchFromAI,
        offline: offlineGenerators.generateOfflineProverbSearch
    },
    [ActivityType.PROVERB_SENTENCE_FINDER]: {
        ai: aiGenerators.generateProverbSentenceFinderFromAI,
        offline: offlineGenerators.generateOfflineProverbSentenceFinder
    },
    [ActivityType.FAMILY_TREE_MATRIX]: {
        ai: aiGenerators.generateFamilyTreeMatrixFromAI,
        offline: offlineGenerators.generateOfflineFamilyTreeMatrix
    },

    // 5. BOŞ / TANIMSIZ AKTİVİTELER (Placeholder)
    // Bu aktivitelerin henüz spesifik bir generator fonksiyonu olmayabilir.
    [ActivityType.OCR_CONTENT]: { ai: undefined, offline: undefined },
    [ActivityType.ASSESSMENT_REPORT]: { ai: undefined, offline: undefined },
    [ActivityType.WORKBOOK]: { ai: undefined, offline: undefined },
    [ActivityType.REAL_LIFE_MATH_PROBLEMS]: { ai: undefined, offline: undefined },
    [ActivityType.ATTENTION_DEVELOPMENT]: { ai: undefined, offline: undefined },
    [ActivityType.ATTENTION_FOCUS]: { ai: undefined, offline: undefined },
    [ActivityType.ANAGRAM]: { ai: undefined, offline: undefined },
    [ActivityType.CROSSWORD]: { ai: undefined, offline: undefined },
    [ActivityType.ODD_ONE_OUT]: { ai: undefined, offline: undefined },
    [ActivityType.CONCEPT_MATCH]: { ai: undefined, offline: undefined },
    [ActivityType.ESTIMATION]: { ai: undefined, offline: undefined },
    [ActivityType.SPATIAL_GRID]: { ai: undefined, offline: undefined },
    [ActivityType.DOT_PAINTING]: { ai: undefined, offline: undefined },
    [ActivityType.SHAPE_SUDOKU]: { ai: undefined, offline: undefined },
};
