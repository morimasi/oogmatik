import React, { useState, useEffect } from 'react';
import { Activity, ActivityType, WorksheetData, SavedWorksheet } from '../types';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import * as generators from '../services/generators';
import * as offlineGenerators from '../services/offlineGenerators';

interface SidebarProps {
  selectedActivity: ActivityType | null;
  onSelectActivity: (id: ActivityType | null) => void;
  setWorksheetData: (data: WorksheetData) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
  savedWorksheets: SavedWorksheet[];
  onShowSavedList: () => void;
  isSidebarOpen: boolean;
  closeSidebar: () => void;
}

const offlineGeneratorMap: { [key in ActivityType]?: (options: offlineGenerators.OfflineGeneratorOptions) => Promise<WorksheetData> } = {
    [ActivityType.WORD_SEARCH]: offlineGenerators.generateOfflineWordSearch,
    [ActivityType.ANAGRAM]: offlineGenerators.generateOfflineAnagrams,
    [ActivityType.MATH_PUZZLE]: offlineGenerators.generateOfflineMathPuzzles,
    [ActivityType.FIND_THE_DIFFERENCE]: offlineGenerators.generateOfflineFindTheDifference,
    [ActivityType.PROVERB_FILL_IN_THE_BLANK]: offlineGenerators.generateOfflineProverbFill,
    [ActivityType.SPELLING_CHECK]: offlineGenerators.generateOfflineSpellingCheck,
    [ActivityType.ODD_ONE_OUT]: offlineGenerators.generateOfflineOddOneOut,
    [ActivityType.WORD_COMPARISON]: offlineGenerators.generateOfflineWordComparison,
    [ActivityType.WORDS_IN_STORY]: offlineGenerators.generateOfflineWordsInStory,
    [ActivityType.PROVERB_SEARCH]: offlineGenerators.generateOfflineProverbSearch,
    [ActivityType.REVERSE_WORD]: offlineGenerators.generateOfflineReverseWord,
    [ActivityType.FIND_THE_DUPLICATE_IN_ROW]: offlineGenerators.generateOfflineFindDuplicateInRow,
    [ActivityType.WORD_GROUPING]: offlineGenerators.generateOfflineWordGrouping,
    [ActivityType.WORD_LADDER]: offlineGenerators.generateOfflineWordLadder,
    [ActivityType.WORD_FORMATION]: offlineGenerators.generateOfflineWordFormation,
    [ActivityType.FIND_IDENTICAL_WORD]: offlineGenerators.generateOfflineFindIdenticalWord,
    [ActivityType.LETTER_BRIDGE]: offlineGenerators.generateOfflineLetterBridge,
    [ActivityType.FIND_LETTER_PAIR]: offlineGenerators.generateOfflineFindLetterPair,
    [ActivityType.MINI_WORD_GRID]: offlineGenerators.generateOfflineMiniWordGrid,
    [ActivityType.STROOP_TEST]: offlineGenerators.generateOfflineStroopTest,
    [ActivityType.NUMBER_PATTERN]: offlineGenerators.generateOfflineNumberPattern,
    [ActivityType.NUMBER_SEARCH]: offlineGenerators.generateOfflineNumberSearch,
    [ActivityType.SYMBOL_CIPHER]: offlineGenerators.generateOfflineSymbolCipher,
    [ActivityType.TARGET_NUMBER]: offlineGenerators.generateOfflineTargetNumber,
    [ActivityType.NUMBER_PYRAMID]: offlineGenerators.generateOfflineNumberPyramid,
    [ActivityType.FIND_DIFFERENT_STRING]: offlineGenerators.generateOfflineFindDifferentString,
    [ActivityType.STORY_COMPREHENSION]: offlineGenerators.generateOfflineStoryComprehension,
    [ActivityType.LETTER_GRID_TEST]: offlineGenerators.generateOfflineLetterGridTest,
    [ActivityType.WORD_MEMORY]: offlineGenerators.generateOfflineWordMemory,
    [ActivityType.STORY_CREATION_PROMPT]: offlineGenerators.generateOfflineStoryCreationPrompt,
    [ActivityType.SHAPE_MATCHING]: offlineGenerators.generateOfflineShapeMatching,
    [ActivityType.VISUAL_MEMORY]: offlineGenerators.generateOfflineVisualMemory,
    [ActivityType.STORY_ANALYSIS]: offlineGenerators.generateOfflineStoryAnalysis,
    [ActivityType.COORDINATE_CIPHER]: offlineGenerators.generateOfflineCoordinateCipher,
    [ActivityType.TARGET_SEARCH]: offlineGenerators.generateOfflineTargetSearch,
    [ActivityType.SYMMETRY_DRAWING]: offlineGenerators.generateOfflineSymmetryDrawing,
    [ActivityType.ABC_CONNECT]: offlineGenerators.generateOfflineAbcConnect,
    [ActivityType.MULTIPLICATION_PYRAMID]: offlineGenerators.generateOfflineMultiplicationPyramid,
    [ActivityType.BURDON_TEST]: offlineGenerators.generateOfflineBurdonTest,
    [ActivityType.PASSWORD_FINDER]: offlineGenerators.generateOfflinePasswordFinder,
    [ActivityType.JUMBLED_WORD_STORY]: offlineGenerators.generateOfflineJumbledWordStory,
    [ActivityType.WORD_GRID_PUZZLE]: offlineGenerators.generateOfflineWordGridPuzzle,
    [ActivityType.THEMATIC_ODD_ONE_OUT]: offlineGenerators.generateOfflineThematicOddOneOut,
    // Placeholder fallbacks for complex types to prevent crashes in offline mode
    [ActivityType.GRID_DRAWING]: offlineGenerators.generateOfflineGridDrawing,
    [ActivityType.STORY_SEQUENCING]: offlineGenerators.generateOfflineStorySequencing,
    [ActivityType.SYLLABLE_COMPLETION]: offlineGenerators.generateOfflineSyllableCompletion,
    [ActivityType.SYNONYM_WORD_SEARCH]: offlineGenerators.generateOfflineSynonymWordSearch,
    [ActivityType.WORD_CONNECT]: offlineGenerators.generateOfflineWordConnect,
    [ActivityType.SPIRAL_PUZZLE]: offlineGenerators.generateOfflineSpiralPuzzle,
    [ActivityType.CROSSWORD]: offlineGenerators.generateOfflineCrossword,
    [ActivityType.MISSING_PARTS]: offlineGenerators.generateOfflineMissingParts,
    [ActivityType.DIVISION_PYRAMID]: offlineGenerators.generateOfflineDivisionPyramid,
    [ActivityType.MULTIPLICATION_WHEEL]: offlineGenerators.generateOfflineMultiplicationWheel,
    [ActivityType.SHAPE_SUDOKU]: offlineGenerators.generateOfflineShapeSudoku,
};

const Sidebar: React.FC<SidebarProps> = ({ 
    selectedActivity, 
    onSelectActivity, 
    setWorksheetData, 
    setIsLoading, 
    setError, 
    isLoading, 
    savedWorksheets, 
    onShowSavedList,
    isSidebarOpen,
    closeSidebar
}) => {
  const [openCategory, setOpenCategory] = useState<string | null>(ACTIVITY_CATEGORIES[0]?.id || null);
  
  // Global Settings
  const [generationMode, setGenerationMode] = useState<'ai' | 'offline'>('ai');
  const [difficultyLevel, setDifficultyLevel] = useState<string>('Seviye 2: 2. Sınıf');
  const [worksheetCount, setWorksheetCount] = useState<number>(1);

  // Activity-Specific Settings
  const [topic, setTopic] = useState<string>('Hayvanlar');
  const [itemCount, setItemCount] = useState<number>(8);
  const [gridSize, setGridSize] = useState<number>(12);
  const [targetLetters, setTargetLetters] = useState<string>('a, b, d, g');
  const [targetPair, setTargetPair] = useState<string>('tr');
  const [difficulty, setDifficulty] = useState<'Kolay'|'Orta'|'Zor'>('Orta');
  const [targetChar, setTargetChar] = useState<string>('7');
  const [distractorChar, setDistractorChar] = useState<string>('Z');
  
  const currentActivity = ACTIVITIES.find(act => act.id === selectedActivity);

  useEffect(() => {
    // Reset data when activity is deselected
    if (!selectedActivity) {
      setWorksheetData(null);
      setError(null);
    }
  }, [selectedActivity, setWorksheetData, setError]);
  
  const handleSelectActivity = (id: ActivityType | null) => {
    onSelectActivity(id);
    if (window.innerWidth < 768) { // Only close on mobile
        closeSidebar();
    }
  }

  const handleToggleCategory = (categoryId: string) => {
    setOpenCategory(prevOpenCategory => (prevOpenCategory === categoryId ? null : categoryId));
  };

  const handleGenerate = async () => {
    if (!selectedActivity) return;
    setIsLoading(true);
    setError(null);
    setWorksheetData(null);

    if (generationMode === 'offline') {
        try {
            const offlineGenerator = selectedActivity ? offlineGeneratorMap[selectedActivity] : undefined;
            if (offlineGenerator) {
                const options: offlineGenerators.OfflineGeneratorOptions = { 
                    topic, 
                    itemCount, 
                    gridSize, 
                    worksheetCount, 
                    difficulty, 
                    targetPair,
                    targetLetters,
                    targetChar,
                    distractorChar
                };
                const data = await offlineGenerator(options);
                setWorksheetData(data);
            } else {
                 setError('Bu etkinlik için Hızlı Mod (Çevrimdışı) henüz mevcut değil. Lütfen Yapay Zeka Modu\'nu kullanın.');
            }
        } catch(e: any) {
            setError(e.message || 'Çevrimdışı içerik oluşturulurken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
        return;
    }
    
    // AI Mode
    try {
      let data: WorksheetData = null;
      switch (selectedActivity) {
        case ActivityType.WORD_SEARCH: data = await generators.generateWordSearchFromAI(topic, gridSize, itemCount, difficultyLevel, worksheetCount); break;
        case ActivityType.ANAGRAM: data = await generators.generateAnagramsFromAI(topic, itemCount, difficultyLevel, worksheetCount); break;
        case ActivityType.MATH_PUZZLE: data = await generators.generateMathPuzzlesFromAI(topic, itemCount, difficultyLevel, worksheetCount); break;
        case ActivityType.STORY_COMPREHENSION: data = await generators.generateStoryFromAI(topic, difficultyLevel, worksheetCount); break;
        case ActivityType.STROOP_TEST: data = await generators.generateStroopTestFromAI(itemCount * 2, difficultyLevel, worksheetCount); break;
        case ActivityType.NUMBER_PATTERN: data = await generators.generateNumberPatternsFromAI(itemCount, difficulty, difficultyLevel, worksheetCount); break;
        case ActivityType.SPELLING_CHECK: data = await generators.generateSpellingChecksFromAI(topic, Math.floor(itemCount / 2), difficultyLevel, worksheetCount); break;
        case ActivityType.LETTER_GRID_TEST: data = await generators.generateLetterGridFromAI(gridSize, targetLetters, difficultyLevel, worksheetCount); break;
        case ActivityType.BURDON_TEST: data = await generators.generateBurdonTestFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.NUMBER_SEARCH: data = await generators.generateNumberSearchFromAI(1, 50, difficultyLevel, worksheetCount); break;
        case ActivityType.WORD_MEMORY: data = await generators.generateWordMemoryFromAI(topic, 10, 20, difficultyLevel, worksheetCount); break;
        case ActivityType.STORY_CREATION_PROMPT: data = await generators.generateStoryCreationPromptFromAI(topic, 5, difficultyLevel, worksheetCount); break;
        case ActivityType.FIND_THE_DIFFERENCE: data = await generators.generateFindTheDifferenceFromAI(topic, itemCount, difficultyLevel, worksheetCount); break;
        case ActivityType.WORD_COMPARISON: data = await generators.generateWordComparisonFromAI(topic, difficultyLevel, worksheetCount); break;
        case ActivityType.WORDS_IN_STORY: data = await generators.generateWordsInStoryFromAI(topic, difficultyLevel, worksheetCount); break;
        case ActivityType.ODD_ONE_OUT: data = await generators.generateOddOneOutFromAI(topic, Math.floor(itemCount / 2), difficultyLevel, worksheetCount); break;
        case ActivityType.SHAPE_MATCHING: data = await generators.generateShapeMatchingFromAI(itemCount, difficultyLevel, worksheetCount); break;
        case ActivityType.SYMBOL_CIPHER: data = await generators.generateSymbolCipherFromAI(Math.floor(itemCount / 2), difficultyLevel, worksheetCount); break;
        case ActivityType.PROVERB_FILL_IN_THE_BLANK: data = await generators.generateProverbFillFromAI(itemCount, difficultyLevel, worksheetCount); break;
        case ActivityType.LETTER_BRIDGE: data = await generators.generateLetterBridgeFromAI(itemCount, difficultyLevel, worksheetCount); break;
        case ActivityType.FIND_THE_DUPLICATE_IN_ROW: data = await generators.generateFindDuplicateFromAI(10, 15, difficultyLevel, worksheetCount); break;
        case ActivityType.WORD_LADDER: data = await generators.generateWordLadderFromAI(Math.floor(itemCount / 2), difficultyLevel, worksheetCount); break;
        case ActivityType.FIND_IDENTICAL_WORD: data = await generators.generateFindIdenticalWordFromAI(itemCount * 2, difficultyLevel, worksheetCount); break;
        case ActivityType.WORD_FORMATION: data = await generators.generateWordFormationFromAI(Math.floor(itemCount / 2), difficultyLevel, worksheetCount); break;
        case ActivityType.REVERSE_WORD: data = await generators.generateReverseWordFromAI(topic, itemCount, difficultyLevel, worksheetCount); break;
        case ActivityType.FIND_LETTER_PAIR: data = await generators.generateFindLetterPairFromAI(gridSize, targetPair, difficultyLevel, worksheetCount); break;
        case ActivityType.WORD_GROUPING: data = await generators.generateWordGroupingFromAI(topic, 15, 3, difficultyLevel, worksheetCount); break;
        case ActivityType.VISUAL_MEMORY: data = await generators.generateVisualMemoryFromAI(topic, 8, 16, difficultyLevel, worksheetCount); break;
        case ActivityType.STORY_ANALYSIS: data = await generators.generateStoryAnalysisFromAI(topic, difficultyLevel, worksheetCount); break;
        case ActivityType.COORDINATE_CIPHER: data = await generators.generateCoordinateCipherFromAI(topic, 10, 5, difficultyLevel, worksheetCount); break;
        case ActivityType.PROVERB_SEARCH: data = await generators.generateProverbSearchFromAI(gridSize, difficultyLevel, worksheetCount); break;
        case ActivityType.TARGET_SEARCH: data = await generators.generateTargetSearchFromAI(gridSize, targetChar, distractorChar, difficultyLevel, worksheetCount); break;
        case ActivityType.SHAPE_NUMBER_PATTERN: data = await generators.generateShapeNumberPatternFromAI(2, difficultyLevel, worksheetCount); break;
        case ActivityType.GRID_DRAWING: data = await generators.generateGridDrawingFromAI(10, 2, difficultyLevel, worksheetCount); break;
        case ActivityType.COLOR_WHEEL_MEMORY: data = await generators.generateColorWheelMemoryFromAI(8, difficultyLevel, worksheetCount); break;
        case ActivityType.IMAGE_COMPREHENSION: data = await generators.generateImageComprehensionFromAI(topic, 4, difficultyLevel, worksheetCount); break;
        case ActivityType.CHARACTER_MEMORY: data = await generators.generateCharacterMemoryFromAI(topic, 4, 8, difficultyLevel, worksheetCount); break;
        case ActivityType.STORY_SEQUENCING: data = await generators.generateStorySequencingFromAI(topic, difficultyLevel, worksheetCount); break;
        case ActivityType.CHAOTIC_NUMBER_SEARCH: data = await generators.generateChaoticNumberSearchFromAI(1, 50, difficultyLevel, worksheetCount); break;
        case ActivityType.BLOCK_PAINTING: data = await generators.generateBlockPaintingFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.MINI_WORD_GRID: data = await generators.generateMiniWordGridFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.VISUAL_ODD_ONE_OUT: data = await generators.generateVisualOddOneOutFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.SHAPE_COUNTING: data = await generators.generateShapeCountingFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.SYMMETRY_DRAWING: data = await generators.generateSymmetryDrawingFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.FIND_DIFFERENT_STRING: data = await generators.generateFindDifferentStringFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.DOT_PAINTING: data = await generators.generateDotPaintingFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.ABC_CONNECT: data = await generators.generateAbcConnectFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.PASSWORD_FINDER: data = await generators.generatePasswordFinderFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.SYLLABLE_COMPLETION: data = await generators.generateSyllableCompletionFromAI(topic, difficultyLevel, worksheetCount); break;
        case ActivityType.SYNONYM_WORD_SEARCH: data = await generators.generateSynonymWordSearchFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.WORD_CONNECT: data = await generators.generateWordConnectFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.SPIRAL_PUZZLE: data = await generators.generateSpiralPuzzleFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.CROSSWORD: data = await generators.generateCrosswordFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.JUMBLED_WORD_STORY: data = await generators.generateJumbledWordStoryFromAI(topic, difficultyLevel, worksheetCount); break;
        case ActivityType.HOMONYM_SENTENCE_WRITING: data = await generators.generateHomonymSentenceFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.WORD_GRID_PUZZLE: data = await generators.generateWordGridPuzzleFromAI(topic, difficultyLevel, worksheetCount); break;
        case ActivityType.PROVERB_SAYING_SORT: data = await generators.generateProverbSayingSortFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.HOMONYM_IMAGE_MATCH: data = await generators.generateHomonymImageMatchFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.ANTONYM_FLOWER_PUZZLE: data = await generators.generateAntonymFlowerPuzzleFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.PROVERB_WORD_CHAIN: data = await generators.generateProverbWordChainFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.THEMATIC_ODD_ONE_OUT: data = await generators.generateThematicOddOneOutFromAI(topic, difficultyLevel, worksheetCount); break;
        case ActivityType.SYNONYM_ANTONYM_GRID: data = await generators.generateSynonymAntonymGridFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.PUNCTUATION_COLORING: data = await generators.generatePunctuationColoringFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.PUNCTUATION_MAZE: data = await generators.generatePunctuationMazeFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.ANTONYM_RESFEBE: data = await generators.generateAntonymResfebeFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.THEMATIC_WORD_SEARCH_COLOR: data = await generators.generateThematicWordSearchColorFromAI(topic, difficultyLevel, worksheetCount); break;
        case ActivityType.THEMATIC_ODD_ONE_OUT_SENTENCE: data = await generators.generateThematicOddOneOutSentenceFromAI(topic, difficultyLevel, worksheetCount); break;
        case ActivityType.PROVERB_SENTENCE_FINDER: data = await generators.generateProverbSentenceFinderFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.SYNONYM_SEARCH_STORY: data = await generators.generateSynonymSearchAndStoryFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.COLUMN_ODD_ONE_OUT_SENTENCE: data = await generators.generateColumnOddOneOutSentenceFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.SYNONYM_ANTONYM_COLORING: data = await generators.generateSynonymAntonymColoringFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.PUNCTUATION_PHONE_NUMBER: data = await generators.generatePunctuationPhoneNumberFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.PUNCTUATION_SPIRAL_PUZZLE: data = await generators.generatePunctuationSpiralPuzzleFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.THEMATIC_JUMBLED_WORD_STORY: data = await generators.generateThematicJumbledWordStoryFromAI(topic, difficultyLevel, worksheetCount); break;
        case ActivityType.SYNONYM_MATCHING_PATTERN: data = await generators.generateSynonymMatchingPatternFromAI(topic, difficultyLevel, worksheetCount); break;
        case ActivityType.FUTOSHIKI: data = await generators.generateFutoshikiFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.NUMBER_PYRAMID: data = await generators.generateNumberPyramidFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.NUMBER_CAPSULE: data = await generators.generateNumberCapsuleFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.ODD_EVEN_SUDOKU: data = await generators.generateOddEvenSudokuFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.ROMAN_NUMERAL_CONNECT: data = await generators.generateRomanNumeralConnectFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.ROMAN_NUMERAL_STAR_HUNT: data = await generators.generateRomanNumeralStarHuntFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.ROUNDING_CONNECT: data = await generators.generateRoundingConnectFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.ROMAN_NUMERAL_MULTIPLICATION: data = await generators.generateRomanNumeralMultiplicationFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.ARITHMETIC_CONNECT: data = await generators.generateArithmeticConnectFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.ROMAN_ARABIC_MATCH_CONNECT: data = await generators.generateRomanArabicMatchConnectFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.SUDOKU_6X6_SHADED: data = await generators.generateSudoku6x6ShadedFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.KENDOKU: data = await generators.generateKendokuFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.DIVISION_PYRAMID: data = await generators.generateDivisionPyramidFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.MULTIPLICATION_PYRAMID: data = await generators.generateMultiplicationPyramidFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.OPERATION_SQUARE_SUBTRACTION: data = await generators.generateOperationSquareSubtractionFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.OPERATION_SQUARE_FILL_IN: data = await generators.generateOperationSquareFillInDataFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.MULTIPLICATION_WHEEL: data = await generators.generateMultiplicationWheelFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.TARGET_NUMBER: data = await generators.generateTargetNumberFromAI('numbers', difficultyLevel, worksheetCount); break;
        case ActivityType.OPERATION_SQUARE_MULT_DIV: data = await generators.generateOperationSquareMultDivFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.SHAPE_SUDOKU: data = await generators.generateShapeSudokuFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.WEIGHT_CONNECT: data = await generators.generateWeightConnectFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.RESFEBE: data = await generators.generateResfebeFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.FUTOSHIKI_LENGTH: data = await generators.generateFutoshikiLengthFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.MATCHSTICK_SYMMETRY: data = await generators.generateMatchstickSymmetryFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.WORD_WEB: data = await generators.generateWordWebFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.STAR_HUNT: data = await generators.generateStarHuntFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.LENGTH_CONNECT: data = await generators.generateLengthConnectFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.VISUAL_NUMBER_PATTERN: data = await generators.generateVisualNumberPatternFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.MISSING_PARTS: data = await generators.generateMissingPartsFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.PROFESSION_CONNECT: data = await generators.generateProfessionConnectFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.VISUAL_ODD_ONE_OUT_THEMED: data = await generators.generateVisualOddOneOutThemedFromAI(topic, difficultyLevel, worksheetCount); break;
        case ActivityType.LOGIC_GRID_PUZZLE: data = await generators.generateLogicGridPuzzleFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.IMAGE_ANAGRAM_SORT: data = await generators.generateImageAnagramSortFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.ANAGRAM_IMAGE_MATCH: data = await generators.generateAnagramImageMatchFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.SYLLABLE_WORD_SEARCH: data = await generators.generateSyllableWordSearchFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.WORD_SEARCH_WITH_PASSWORD: data = await generators.generateWordSearchWithPasswordFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.WORD_WEB_WITH_PASSWORD: data = await generators.generateWordWebWithPasswordFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.LETTER_GRID_WORD_FIND: data = await generators.generateLetterGridWordFindFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.WORD_PLACEMENT_PUZZLE: data = await generators.generateWordPlacementPuzzleFromAI(difficultyLevel, worksheetCount); break;
        case ActivityType.POSITIONAL_ANAGRAM: data = await generators.generatePositionalAnagramFromAI(difficultyLevel, worksheetCount); break;

        default:
          setError('Yapay zeka üretici henüz bu etkinlik için mevcut değil.');
          break;
      }
      setWorksheetData(data);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSettings = () => {
    if (!currentActivity) return null;

    // Activity-specific settings visibility
    const showTopic = ![
        ActivityType.STROOP_TEST, ActivityType.LETTER_GRID_TEST, ActivityType.NUMBER_PATTERN, ActivityType.SHAPE_MATCHING, 
        ActivityType.SYMBOL_CIPHER, ActivityType.PROVERB_FILL_IN_THE_BLANK, ActivityType.LETTER_BRIDGE, 
        ActivityType.FIND_IDENTICAL_WORD, ActivityType.WORD_FORMATION, ActivityType.FIND_LETTER_PAIR, 
        ActivityType.TARGET_SEARCH, ActivityType.PROVERB_SEARCH
    ].includes(currentActivity.id);
    const showItemCount = [
        ActivityType.WORD_SEARCH, ActivityType.ANAGRAM, ActivityType.MATH_PUZZLE, ActivityType.STROOP_TEST, 
        ActivityType.NUMBER_PATTERN, ActivityType.SPELLING_CHECK, ActivityType.FIND_THE_DIFFERENCE, 
        ActivityType.ODD_ONE_OUT, ActivityType.SHAPE_MATCHING, ActivityType.SYMBOL_CIPHER, 
        ActivityType.PROVERB_FILL_IN_THE_BLANK, ActivityType.LETTER_BRIDGE, ActivityType.WORD_LADDER, 
        ActivityType.FIND_IDENTICAL_WORD, ActivityType.WORD_FORMATION, ActivityType.REVERSE_WORD,
        ActivityType.FIND_THE_DUPLICATE_IN_ROW, ActivityType.FIND_DIFFERENT_STRING
    ].includes(currentActivity.id);
    const showGridSize = [
        ActivityType.WORD_SEARCH, ActivityType.LETTER_GRID_TEST, ActivityType.FIND_LETTER_PAIR, 
        ActivityType.PROVERB_SEARCH, ActivityType.TARGET_SEARCH
    ].includes(currentActivity.id);
    const showTargetLetters = currentActivity.id === ActivityType.LETTER_GRID_TEST;
    const showTargetPair = currentActivity.id === ActivityType.FIND_LETTER_PAIR;
    const showDifficulty = currentActivity.id === ActivityType.NUMBER_PATTERN;
    const showTargetChars = currentActivity.id === ActivityType.TARGET_SEARCH;

    let itemCountLabel = "Öğe Sayısı";
    if ([ActivityType.WORD_SEARCH, ActivityType.ANAGRAM, ActivityType.REVERSE_WORD, ActivityType.SPELLING_CHECK].includes(currentActivity.id)) itemCountLabel = "Kelime Sayısı";
    if ([ActivityType.MATH_PUZZLE, ActivityType.WORD_LADDER].includes(currentActivity.id)) itemCountLabel = "Bulmaca Sayısı";
    if (currentActivity.id === ActivityType.STROOP_TEST) itemCountLabel = "Renk/Kelime Sayısı";
    if (currentActivity.id === ActivityType.NUMBER_PATTERN) itemCountLabel = "Örüntü Sayısı";
    if ([ActivityType.FIND_THE_DIFFERENCE, ActivityType.SHAPE_MATCHING, ActivityType.FIND_THE_DUPLICATE_IN_ROW, ActivityType.FIND_DIFFERENT_STRING].includes(currentActivity.id)) itemCountLabel = "Satır Sayısı";
    if ([ActivityType.ODD_ONE_OUT, ActivityType.FIND_IDENTICAL_WORD].includes(currentActivity.id)) itemCountLabel = "Grup Sayısı";
    if (currentActivity.id === ActivityType.SYMBOL_CIPHER) itemCountLabel = "Şifreli Kelime Sayısı";
    if (currentActivity.id === ActivityType.PROVERB_FILL_IN_THE_BLANK) itemCountLabel = "Atasözü Sayısı";
    if (currentActivity.id === ActivityType.LETTER_BRIDGE) itemCountLabel = "Kelime Çifti Sayısı";
    if (currentActivity.id === ActivityType.WORD_FORMATION) itemCountLabel = "Harf Seti Sayısı";
    
    const hasSpecificSettings = showTopic || showItemCount || showGridSize || showTargetLetters || showTargetPair || showDifficulty || showTargetChars;

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
             <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Üretim Modu</label>
                <div className="flex rounded-md shadow-sm">
                    <button 
                        onClick={() => setGenerationMode('ai')}
                        className={`relative inline-flex items-center justify-center w-1/2 px-4 py-2 text-sm font-medium rounded-l-md border transition-colors focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${generationMode === 'ai' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-600'}`}
                    >
                       ☁️ Yapay Zeka Modu
                    </button>
                    <button 
                        onClick={() => setGenerationMode('offline')}
                        className={`relative inline-flex items-center justify-center w-1/2 px-4 py-2 text-sm font-medium rounded-r-md border transition-colors focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${generationMode === 'offline' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-600'}`}
                    >
                       ⚡ Hızlı Mod (Çevrimdışı)
                    </button>
                </div>
                 {generationMode === 'offline' && !offlineGeneratorMap[currentActivity.id] && (
                     <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Bu etkinlik için Hızlı Mod henüz mevcut değil. Yapay Zeka Modu kullanılacak.</p>
                 )}
            </div>

            <div className="mb-4">
                <label htmlFor="difficultyLevel" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Zorluk Seviyesi</label>
                <select id="difficultyLevel" value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)} className="mt-1 block w-full bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option>Seviye 1: Okul Öncesi / 1. Sınıf</option>
                    <option>Seviye 2: 2. Sınıf</option>
                    <option>Seviye 3: 3. Sınıf</option>
                    <option>Seviye 4: 4. Sınıf</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Çalışma Sayfası Sayısı</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                    {[1, 2, 3].map(count => (
                        <button 
                            key={count} 
                            onClick={() => setWorksheetCount(count)} 
                            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-800 ${worksheetCount === count ? 'bg-indigo-600 text-white shadow' : 'bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500'}`}
                        >
                            {count}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        
        {hasSpecificSettings ? (
             <div className="p-4">
                {showTopic && <div className="mb-4">
                <label htmlFor="topic" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Konu</label>
                <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}
                    className="mt-1 block w-full bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Örn: Meyveler, Uzay"
                />
                </div>}

                {showGridSize && (
                <div className="mb-4">
                    <label htmlFor="gridSize" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Tablo Boyutu: {gridSize}x{gridSize}</label>
                    <input type="range" id="gridSize" min="8" max="20" value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} className="w-full h-2 bg-zinc-200 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer" />
                </div>
                )}
                
                {showItemCount && (
                    <div className="mb-4">
                    <label htmlFor="itemCount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">{itemCountLabel}: {itemCount}</label>
                    <input type="range" id="itemCount" min="4" max="16" step="2" value={itemCount} onChange={(e) => setItemCount(Number(e.target.value))} className="w-full h-2 bg-zinc-200 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer" />
                    </div>
                )}

                {showTargetLetters && (
                    <div className="mb-4">
                        <label htmlFor="targetLetters" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Hedef Harfler (virgülle ayırın)</label>
                        <input type="text" id="targetLetters" value={targetLetters} onChange={(e) => setTargetLetters(e.target.value)} className="mt-1 block w-full bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="a, b, c" />
                    </div>
                )}

                {showTargetPair && (
                    <div className="mb-4">
                        <label htmlFor="targetPair" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Hedef İkili</label>
                        <input type="text" id="targetPair" value={targetPair} maxLength={2} onChange={(e) => setTargetPair(e.target.value)} className="mt-1 block w-full bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="tr" />
                    </div>
                )}
                
                {showTargetChars && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="targetChar" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Hedef Karakter</label>
                            <input type="text" id="targetChar" value={targetChar} maxLength={1} onChange={(e) => setTargetChar(e.target.value)} className="mt-1 block w-full bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="distractorChar" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Çeldirici</label>
                            <input type="text" id="distractorChar" value={distractorChar} maxLength={1} onChange={(e) => setDistractorChar(e.target.value)} className="mt-1 block w-full bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                        </div>
                    </div>
                )}

                {showDifficulty && (
                    <div className="mb-4">
                        <label htmlFor="difficulty" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Zorluk</label>
                        <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as 'Kolay'|'Orta'|'Zor')} className="mt-1 block w-full bg-zinc-50 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" >
                            <option>Kolay</option>
                            <option>Orta</option>
                            <option>Zor</option>
                        </select>
                    </div>
                )}
            </div>
        ) : (
            <div className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Bu etkinlik için konu, boyut gibi özel ayarlar bulunmamaktadır.
            </div>
        )}
      </div>
    );
  };

  const ActivityButton: React.FC<{ activity: Activity }> = ({ activity }) => (
    <button
        onClick={() => handleSelectActivity(activity.id)}
        className="w-full text-left p-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-zinc-700/80 transition-colors flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
        <i className={`${activity.icon} w-6 text-center text-indigo-500 dark:text-indigo-400 mr-3`}></i>
        <span className="flex-1 text-sm">{activity.title}</span>
    </button>
  );

  return (
    <aside className={`w-80 sm:w-96 bg-white dark:bg-zinc-800 shadow-lg flex-col print:hidden overflow-y-auto border-r border-zinc-200 dark:border-zinc-700/50 transition-transform duration-300 ease-in-out md:static md:translate-x-0 fixed inset-y-0 left-0 z-30 flex ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {currentActivity ? (
        // Settings View
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                <button onClick={() => handleSelectActivity(null)} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm mb-4 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                    <i className="fa-solid fa-arrow-left mr-2"></i>Tüm Etkinlikler
                </button>
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-500 dark:bg-indigo-600 text-white rounded-lg flex items-center justify-center mr-4 shrink-0">
                        <i className={`${currentActivity.icon} fa-lg`}></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{currentActivity.title}</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs">{currentActivity.description}</p>
                    </div>
                </div>
            </div>

            {renderSettings()}

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 mt-auto">
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:bg-zinc-400 dark:disabled:bg-zinc-600 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-800"
                    >
                    {isLoading ? (
                        <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Oluşturuluyor...
                        </>
                    ) : (
                        <><i className="fa-solid fa-play mr-2"></i>Etkinlik Oluştur</>
                    )}
                </button>
            </div>
        </div>
      ) : (
        // Category List View
        <div className="p-4">
             <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                 <button 
                    onClick={() => { onShowSavedList(); closeSidebar(); }}
                    className="w-full flex items-center justify-center p-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-800"
                >
                    <i className="fa-solid fa-folder-open mr-3"></i>
                    <span>Tüm Kayıtları Görüntüle ({savedWorksheets.length})</span>
                </button>
            </div>
             <h2 className="text-xl font-bold mb-4 px-2">Etkinlik Kategorileri</h2>
             <div className="space-y-2">
                {ACTIVITY_CATEGORIES.map(category => (
                    <div key={category.id}>
                        <button 
                            onClick={() => handleToggleCategory(category.id)}
                            className="w-full flex justify-between items-center p-3 bg-zinc-100 dark:bg-zinc-700/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-800"
                        >
                            <div className="flex items-center">
                                <i className={`${category.icon} mr-3 text-lg`}></i>
                                <span className="font-semibold">{category.title}</span>
                            </div>
                            <i className={`fa-solid fa-chevron-down transition-transform ${openCategory === category.id ? 'rotate-180' : ''}`}></i>
                        </button>
                        {openCategory === category.id && (
                            <div className="py-2 pl-4">
                                {category.activities.map(activityId => {
                                    const activity = ACTIVITIES.find(a => a.id === activityId);
                                    return activity ? <ActivityButton key={activity.id + activity.title} activity={activity} /> : null;
                                })}
                            </div>
                        )}
                    </div>
                ))}
             </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;