import React, { useState, useEffect } from 'react';
import { Activity, ActivityType, WorksheetData } from '../types';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import * as geminiService from '../services/geminiService';

interface SidebarProps {
  selectedActivity: ActivityType | null;
  onSelectActivity: (id: ActivityType | null) => void;
  setWorksheetData: (data: WorksheetData) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedActivity, onSelectActivity, setWorksheetData, setIsLoading, setError, isLoading }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(ACTIVITY_CATEGORIES[0]?.id || null);
  
  // Settings State
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

  const handleToggleCategory = (categoryId: string) => {
    setOpenCategory(prevOpenCategory => (prevOpenCategory === categoryId ? null : categoryId));
  };

  const handleGenerate = async () => {
    if (!selectedActivity) return;
    setIsLoading(true);
    setError(null);
    setWorksheetData(null);

    try {
      let data: WorksheetData = null;
      switch (selectedActivity) {
        case ActivityType.WORD_SEARCH: data = await geminiService.generateWordSearchFromAI(topic, gridSize, itemCount); break;
        case ActivityType.ANAGRAM: data = await geminiService.generateAnagramsFromAI(topic, itemCount); break;
        case ActivityType.MATH_PUZZLE: data = await geminiService.generateMathPuzzlesFromAI(topic, itemCount); break;
        case ActivityType.STORY_COMPREHENSION: data = await geminiService.generateStoryFromAI(topic); break;
        case ActivityType.STROOP_TEST: data = await geminiService.generateStroopTestFromAI(itemCount * 2); break;
        case ActivityType.NUMBER_PATTERN: data = await geminiService.generateNumberPatternsFromAI(itemCount, difficulty); break;
        case ActivityType.SPELLING_CHECK: data = await geminiService.generateSpellingChecksFromAI(topic, Math.floor(itemCount / 2)); break;
        case ActivityType.LETTER_GRID_TEST: data = await geminiService.generateLetterGridFromAI(gridSize, targetLetters); break;
        case ActivityType.BURDON_TEST: data = await geminiService.generateBurdonTestFromAI(); break;
        case ActivityType.NUMBER_SEARCH: data = await geminiService.generateNumberSearchFromAI(1, 50); break;
        case ActivityType.WORD_MEMORY: data = await geminiService.generateWordMemoryFromAI(topic, 10, 20); break;
        case ActivityType.STORY_CREATION_PROMPT: data = await geminiService.generateStoryCreationPromptFromAI(topic, 5); break;
        case ActivityType.FIND_THE_DIFFERENCE: data = await geminiService.generateFindTheDifferenceFromAI(topic, itemCount); break;
        case ActivityType.WORD_COMPARISON: data = await geminiService.generateWordComparisonFromAI(topic); break;
        case ActivityType.WORDS_IN_STORY: data = await geminiService.generateWordsInStoryFromAI(topic); break;
        case ActivityType.ODD_ONE_OUT: data = await geminiService.generateOddOneOutFromAI(topic, Math.floor(itemCount / 2)); break;
        case ActivityType.SHAPE_MATCHING: data = await geminiService.generateShapeMatchingFromAI(itemCount); break;
        case ActivityType.SYMBOL_CIPHER: data = await geminiService.generateSymbolCipherFromAI(Math.floor(itemCount / 2)); break;
        case ActivityType.PROVERB_FILL_IN_THE_BLANK: data = await geminiService.generateProverbFillFromAI(itemCount); break;
        case ActivityType.LETTER_BRIDGE: data = await geminiService.generateLetterBridgeFromAI(itemCount); break;
        case ActivityType.FIND_THE_DUPLICATE_IN_ROW: data = await geminiService.generateFindDuplicateFromAI(10, 15); break;
        case ActivityType.WORD_LADDER: data = await geminiService.generateWordLadderFromAI(Math.floor(itemCount / 2)); break;
        case ActivityType.FIND_IDENTICAL_WORD: data = await geminiService.generateFindIdenticalWordFromAI(itemCount * 2); break;
        case ActivityType.WORD_FORMATION: data = await geminiService.generateWordFormationFromAI(Math.floor(itemCount / 2)); break;
        case ActivityType.REVERSE_WORD: data = await geminiService.generateReverseWordFromAI(topic, itemCount); break;
        case ActivityType.FIND_LETTER_PAIR: data = await geminiService.generateFindLetterPairFromAI(gridSize, targetPair); break;
        case ActivityType.WORD_GROUPING: data = await geminiService.generateWordGroupingFromAI(topic, 15, 3); break;
        case ActivityType.VISUAL_MEMORY: data = await geminiService.generateVisualMemoryFromAI(topic, 8, 16); break;
        case ActivityType.STORY_ANALYSIS: data = await geminiService.generateStoryAnalysisFromAI(topic); break;
        case ActivityType.COORDINATE_CIPHER: data = await geminiService.generateCoordinateCipherFromAI(topic, 10, 5); break;
        case ActivityType.PROVERB_SEARCH: data = await geminiService.generateProverbSearchFromAI(gridSize); break;
        case ActivityType.TARGET_SEARCH: data = await geminiService.generateTargetSearchFromAI(gridSize, targetChar, distractorChar); break;
        case ActivityType.SHAPE_NUMBER_PATTERN: data = await geminiService.generateShapeNumberPatternFromAI(2); break;
        case ActivityType.GRID_DRAWING: data = await geminiService.generateGridDrawingFromAI(10, 2); break;
        case ActivityType.COLOR_WHEEL_MEMORY: data = await geminiService.generateColorWheelMemoryFromAI(8); break;
        case ActivityType.IMAGE_COMPREHENSION: data = await geminiService.generateImageComprehensionFromAI(topic, 4); break;
        case ActivityType.CHARACTER_MEMORY: data = await geminiService.generateCharacterMemoryFromAI(topic, 4, 8); break;
        case ActivityType.STORY_SEQUENCING: data = await geminiService.generateStorySequencingFromAI(topic); break;
        case ActivityType.CHAOTIC_NUMBER_SEARCH: data = await geminiService.generateChaoticNumberSearchFromAI(1, 50); break;
        case ActivityType.BLOCK_PAINTING: data = await geminiService.generateBlockPaintingFromAI(); break;
        case ActivityType.MINI_WORD_GRID: data = await geminiService.generateMiniWordGridFromAI(); break;
        case ActivityType.VISUAL_ODD_ONE_OUT: data = await geminiService.generateVisualOddOneOutFromAI(); break;
        case ActivityType.SHAPE_COUNTING: data = await geminiService.generateShapeCountingFromAI(); break;
        case ActivityType.SYMMETRY_DRAWING: data = await geminiService.generateSymmetryDrawingFromAI(); break;
        case ActivityType.FIND_DIFFERENT_STRING: data = await geminiService.generateFindDifferentStringFromAI(); break;
        case ActivityType.DOT_PAINTING: data = await geminiService.generateDotPaintingFromAI(); break;
        case ActivityType.ABC_CONNECT: data = await geminiService.generateAbcConnectFromAI(); break;
        case ActivityType.PASSWORD_FINDER: data = await geminiService.generatePasswordFinderFromAI(); break;
        case ActivityType.SYLLABLE_COMPLETION: data = await geminiService.generateSyllableCompletionFromAI(topic); break;
        case ActivityType.SYNONYM_WORD_SEARCH: data = await geminiService.generateSynonymWordSearchFromAI(); break;
        case ActivityType.WORD_CONNECT: data = await geminiService.generateWordConnectFromAI(); break;
        case ActivityType.SPIRAL_PUZZLE: data = await geminiService.generateSpiralPuzzleFromAI(); break;
        case ActivityType.CROSSWORD: data = await geminiService.generateCrosswordFromAI(); break;
        case ActivityType.JUMBLED_WORD_STORY: data = await geminiService.generateJumbledWordStoryFromAI(topic); break;
        case ActivityType.HOMONYM_SENTENCE_WRITING: data = await geminiService.generateHomonymSentenceFromAI(); break;
        case ActivityType.WORD_GRID_PUZZLE: data = await geminiService.generateWordGridPuzzleFromAI(topic); break;
        case ActivityType.PROVERB_SAYING_SORT: data = await geminiService.generateProverbSayingSortFromAI(); break;
        case ActivityType.HOMONYM_IMAGE_MATCH: data = await geminiService.generateHomonymImageMatchFromAI(); break;
        case ActivityType.ANTONYM_FLOWER_PUZZLE: data = await geminiService.generateAntonymFlowerPuzzleFromAI(); break;
        case ActivityType.PROVERB_WORD_CHAIN: data = await geminiService.generateProverbWordChainFromAI(); break;
        case ActivityType.THEMATIC_ODD_ONE_OUT: data = await geminiService.generateThematicOddOneOutFromAI(topic); break;
        case ActivityType.SYNONYM_ANTONYM_GRID: data = await geminiService.generateSynonymAntonymGridFromAI(); break;
        case ActivityType.PUNCTUATION_COLORING: data = await geminiService.generatePunctuationColoringFromAI(); break;
        case ActivityType.PUNCTUATION_MAZE: data = await geminiService.generatePunctuationMazeFromAI(); break;
        case ActivityType.ANTONYM_RESFEBE: data = await geminiService.generateAntonymResfebeFromAI(); break;
        case ActivityType.THEMATIC_WORD_SEARCH_COLOR: data = await geminiService.generateThematicWordSearchColorFromAI(topic); break;
        case ActivityType.THEMATIC_ODD_ONE_OUT_SENTENCE: data = await geminiService.generateThematicOddOneOutSentenceFromAI(topic); break;
        case ActivityType.PROVERB_SENTENCE_FINDER: data = await geminiService.generateProverbSentenceFinderFromAI(); break;
        case ActivityType.SYNONYM_SEARCH_STORY: data = await geminiService.generateSynonymSearchAndStoryFromAI(); break;
        case ActivityType.COLUMN_ODD_ONE_OUT_SENTENCE: data = await geminiService.generateColumnOddOneOutSentenceFromAI(); break;
        case ActivityType.SYNONYM_ANTONYM_COLORING: data = await geminiService.generateSynonymAntonymColoringFromAI(); break;
        case ActivityType.PUNCTUATION_PHONE_NUMBER: data = await geminiService.generatePunctuationPhoneNumberFromAI(); break;
        case ActivityType.PUNCTUATION_SPIRAL_PUZZLE: data = await geminiService.generatePunctuationSpiralPuzzleFromAI(); break;
        case ActivityType.THEMATIC_JUMBLED_WORD_STORY: data = await geminiService.generateThematicJumbledWordStoryFromAI(topic); break;
        case ActivityType.SYNONYM_MATCHING_PATTERN: data = await geminiService.generateSynonymMatchingPatternFromAI(topic); break;
        case ActivityType.FUTOSHIKI: data = await geminiService.generateFutoshikiFromAI(); break;
        case ActivityType.NUMBER_PYRAMID: data = await geminiService.generateNumberPyramidFromAI(); break;
        case ActivityType.NUMBER_CAPSULE: data = await geminiService.generateNumberCapsuleFromAI(); break;
        case ActivityType.ODD_EVEN_SUDOKU: data = await geminiService.generateOddEvenSudokuFromAI(); break;
        case ActivityType.ROMAN_NUMERAL_CONNECT: data = await geminiService.generateRomanNumeralConnectFromAI(); break;
        case ActivityType.ROMAN_NUMERAL_STAR_HUNT: data = await geminiService.generateRomanNumeralStarHuntFromAI(); break;
        case ActivityType.ROUNDING_CONNECT: data = await geminiService.generateRoundingConnectFromAI(); break;
        case ActivityType.ROMAN_NUMERAL_MULTIPLICATION: data = await geminiService.generateRomanNumeralMultiplicationFromAI(); break;
        case ActivityType.ARITHMETIC_CONNECT: data = await geminiService.generateArithmeticConnectFromAI(); break;
        case ActivityType.ROMAN_ARABIC_MATCH_CONNECT: data = await geminiService.generateRomanArabicMatchConnectFromAI(); break;
        case ActivityType.SUDOKU_6X6_SHADED: data = await geminiService.generateSudoku6x6ShadedFromAI(); break;
        case ActivityType.KENDOKU: data = await geminiService.generateKendokuFromAI(); break;
        case ActivityType.DIVISION_PYRAMID: data = await geminiService.generateDivisionPyramidFromAI(); break;
        case ActivityType.MULTIPLICATION_PYRAMID: data = await geminiService.generateMultiplicationPyramidFromAI(); break;
        case ActivityType.OPERATION_SQUARE_SUBTRACTION: data = await geminiService.generateOperationSquareSubtractionFromAI(); break;
        case ActivityType.OPERATION_SQUARE_FILL_IN: data = await geminiService.generateOperationSquareFillInDataFromAI(); break;
        case ActivityType.MULTIPLICATION_WHEEL: data = await geminiService.generateMultiplicationWheelFromAI(); break;
        case ActivityType.TARGET_NUMBER: data = await geminiService.generateTargetNumberFromAI('numbers'); break;
        case ActivityType.OPERATION_SQUARE_MULT_DIV: data = await geminiService.generateOperationSquareMultDivFromAI(); break;
        case ActivityType.SHAPE_SUDOKU: data = await geminiService.generateShapeSudokuFromAI(); break;
        case ActivityType.WEIGHT_CONNECT: data = await geminiService.generateWeightConnectFromAI(); break;
        case ActivityType.RESFEBE: data = await geminiService.generateResfebeFromAI(); break;
        case ActivityType.FUTOSHIKI_LENGTH: data = await geminiService.generateFutoshikiLengthFromAI(); break;
        case ActivityType.MATCHSTICK_SYMMETRY: data = await geminiService.generateMatchstickSymmetryFromAI(); break;
        case ActivityType.WORD_WEB: data = await geminiService.generateWordWebFromAI(); break;
        case ActivityType.STAR_HUNT: data = await geminiService.generateStarHuntFromAI(); break;
        case ActivityType.LENGTH_CONNECT: data = await geminiService.generateLengthConnectFromAI(); break;
        case ActivityType.VISUAL_NUMBER_PATTERN: data = await geminiService.generateVisualNumberPatternFromAI(); break;
        case ActivityType.MISSING_PARTS: data = await geminiService.generateMissingPartsFromAI(); break;
        case ActivityType.PROFESSION_CONNECT: data = await geminiService.generateProfessionConnectFromAI(); break;
        case ActivityType.VISUAL_ODD_ONE_OUT_THEMED: data = await geminiService.generateVisualOddOneOutThemedFromAI(topic); break;
        case ActivityType.LOGIC_GRID_PUZZLE: data = await geminiService.generateLogicGridPuzzleFromAI(); break;
        case ActivityType.IMAGE_ANAGRAM_SORT: data = await geminiService.generateImageAnagramSortFromAI(); break;
        case ActivityType.ANAGRAM_IMAGE_MATCH: data = await geminiService.generateAnagramImageMatchFromAI(); break;
        case ActivityType.SYLLABLE_WORD_SEARCH: data = await geminiService.generateSyllableWordSearchFromAI(); break;
        case ActivityType.WORD_SEARCH_WITH_PASSWORD: data = await geminiService.generateWordSearchWithPasswordFromAI(); break;
        case ActivityType.WORD_WEB_WITH_PASSWORD: data = await geminiService.generateWordWebWithPasswordFromAI(); break;
        case ActivityType.LETTER_GRID_WORD_FIND: data = await geminiService.generateLetterGridWordFindFromAI(); break;
        case ActivityType.WORD_PLACEMENT_PUZZLE: data = await geminiService.generateWordPlacementPuzzleFromAI(); break;
        case ActivityType.POSITIONAL_ANAGRAM: data = await geminiService.generatePositionalAnagramFromAI(); break;

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
    
    const noSettings = [
      ActivityType.STORY_SEQUENCING, ActivityType.CHAOTIC_NUMBER_SEARCH, ActivityType.BLOCK_PAINTING, 
      ActivityType.MINI_WORD_GRID, ActivityType.VISUAL_ODD_ONE_OUT, ActivityType.SHAPE_COUNTING, 
      ActivityType.SYMMETRY_DRAWING, ActivityType.FIND_DIFFERENT_STRING, ActivityType.DOT_PAINTING,
      ActivityType.ABC_CONNECT, ActivityType.PASSWORD_FINDER, ActivityType.SYNONYM_WORD_SEARCH,
      ActivityType.WORD_CONNECT, ActivityType.SPIRAL_PUZZLE, ActivityType.CROSSWORD,
      ActivityType.HOMONYM_SENTENCE_WRITING, ActivityType.PROVERB_SAYING_SORT, ActivityType.HOMONYM_IMAGE_MATCH,
      ActivityType.ANTONYM_FLOWER_PUZZLE, ActivityType.PROVERB_WORD_CHAIN, ActivityType.SYNONYM_ANTONYM_GRID,
      ActivityType.PUNCTUATION_COLORING, ActivityType.OPERATION_SQUARE_MULT_DIV, ActivityType.FUTOSHIKI, 
      ActivityType.SHAPE_SUDOKU, ActivityType.WEIGHT_CONNECT, ActivityType.RESFEBE, ActivityType.FUTOSHIKI_LENGTH,
      ActivityType.MATCHSTICK_SYMMETRY, ActivityType.WORD_WEB, ActivityType.STAR_HUNT, ActivityType.LENGTH_CONNECT,
      ActivityType.VISUAL_NUMBER_PATTERN, ActivityType.MISSING_PARTS, ActivityType.PROFESSION_CONNECT,
      ActivityType.NUMBER_SEARCH, ActivityType.FIND_THE_DUPLICATE_IN_ROW, ActivityType.COLOR_WHEEL_MEMORY,
      ActivityType.SHAPE_NUMBER_PATTERN, ActivityType.GRID_DRAWING, ActivityType.BURDON_TEST,
      ActivityType.PUNCTUATION_MAZE, ActivityType.ANTONYM_RESFEBE, ActivityType.PROVERB_SENTENCE_FINDER,
      ActivityType.SYNONYM_SEARCH_STORY, ActivityType.COLUMN_ODD_ONE_OUT_SENTENCE, ActivityType.SYNONYM_ANTONYM_COLORING,
      ActivityType.PUNCTUATION_PHONE_NUMBER, ActivityType.PUNCTUATION_SPIRAL_PUZZLE,
      ActivityType.NUMBER_PYRAMID, ActivityType.NUMBER_CAPSULE, ActivityType.ODD_EVEN_SUDOKU,
      ActivityType.ROMAN_NUMERAL_CONNECT, ActivityType.ROMAN_NUMERAL_STAR_HUNT, ActivityType.ROUNDING_CONNECT,
      ActivityType.ROMAN_NUMERAL_MULTIPLICATION, ActivityType.ARITHMETIC_CONNECT, ActivityType.ROMAN_ARABIC_MATCH_CONNECT,
      ActivityType.SUDOKU_6X6_SHADED, ActivityType.KENDOKU, ActivityType.DIVISION_PYRAMID, ActivityType.MULTIPLICATION_PYRAMID,
      ActivityType.OPERATION_SQUARE_SUBTRACTION, ActivityType.OPERATION_SQUARE_FILL_IN, ActivityType.MULTIPLICATION_WHEEL,
      ActivityType.LOGIC_GRID_PUZZLE, ActivityType.IMAGE_ANAGRAM_SORT, ActivityType.ANAGRAM_IMAGE_MATCH,
      ActivityType.SYLLABLE_WORD_SEARCH, ActivityType.WORD_SEARCH_WITH_PASSWORD, ActivityType.WORD_WEB_WITH_PASSWORD,
      ActivityType.LETTER_GRID_WORD_FIND, ActivityType.WORD_PLACEMENT_PUZZLE, ActivityType.POSITIONAL_ANAGRAM
    ];

    if (noSettings.includes(currentActivity.id)) {
        return <p className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center">Bu etkinlik için özel ayar bulunmamaktadır.</p>
    }

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
        ActivityType.FIND_IDENTICAL_WORD, ActivityType.WORD_FORMATION, ActivityType.REVERSE_WORD
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
    if (currentActivity.id === ActivityType.WORD_SEARCH || currentActivity.id === ActivityType.ANAGRAM || currentActivity.id === ActivityType.REVERSE_WORD) itemCountLabel = "Kelime Sayısı";
    if (currentActivity.id === ActivityType.MATH_PUZZLE || currentActivity.id === ActivityType.WORD_LADDER) itemCountLabel = "Bulmaca Sayısı";
    if (currentActivity.id === ActivityType.STROOP_TEST) itemCountLabel = "Renk/Kelime Sayısı";
    if (currentActivity.id === ActivityType.NUMBER_PATTERN) itemCountLabel = "Örüntü Sayısı";
    if (currentActivity.id === ActivityType.SPELLING_CHECK) itemCountLabel = "Soru Sayısı";
    if (currentActivity.id === ActivityType.FIND_THE_DIFFERENCE || currentActivity.id === ActivityType.SHAPE_MATCHING) itemCountLabel = "Satır Sayısı";
    if (currentActivity.id === ActivityType.ODD_ONE_OUT || currentActivity.id === ActivityType.FIND_IDENTICAL_WORD) itemCountLabel = "Grup Sayısı";
    if (currentActivity.id === ActivityType.SYMBOL_CIPHER) itemCountLabel = "Şifreli Kelime Sayısı";
    if (currentActivity.id === ActivityType.PROVERB_FILL_IN_THE_BLANK) itemCountLabel = "Atasözü Sayısı";
    if (currentActivity.id === ActivityType.LETTER_BRIDGE) itemCountLabel = "Kelime Çifti Sayısı";
    if (currentActivity.id === ActivityType.WORD_FORMATION) itemCountLabel = "Harf Seti Sayısı";

    return (
      <div className="p-4">
        {showTopic && <div className="mb-4">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Konu</label>
          <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}
            className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="Örn: Meyveler, Uzay"
          />
        </div>}

        {showGridSize && (
          <div className="mb-4">
            <label htmlFor="gridSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tablo Boyutu: {gridSize}x{gridSize}</label>
            <input type="range" id="gridSize" min="8" max="20" value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" />
          </div>
        )}
        
        {showItemCount && (
            <div className="mb-4">
            <label htmlFor="itemCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{itemCountLabel}: {itemCount}</label>
            <input type="range" id="itemCount" min="4" max="16" step="2" value={itemCount} onChange={(e) => setItemCount(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer" />
            </div>
        )}

        {showTargetLetters && (
            <div className="mb-4">
                <label htmlFor="targetLetters" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hedef Harfler (virgülle ayırın)</label>
                <input type="text" id="targetLetters" value={targetLetters} onChange={(e) => setTargetLetters(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder="a, b, c" />
            </div>
        )}

        {showTargetPair && (
            <div className="mb-4">
                <label htmlFor="targetPair" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hedef İkili</label>
                <input type="text" id="targetPair" value={targetPair} maxLength={2} onChange={(e) => setTargetPair(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" placeholder="tr" />
            </div>
        )}
        
        {showTargetChars && (
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="targetChar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hedef Karakter</label>
                    <input type="text" id="targetChar" value={targetChar} maxLength={1} onChange={(e) => setTargetChar(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="distractorChar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Çeldirici</label>
                    <input type="text" id="distractorChar" value={distractorChar} maxLength={1} onChange={(e) => setDistractorChar(e.target.value)} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                </div>
            </div>
        )}

        {showDifficulty && (
            <div className="mb-4">
                 <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zorluk</label>
                 <select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as 'Kolay'|'Orta'|'Zor')} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" >
                    <option>Kolay</option>
                    <option>Orta</option>
                    <option>Zor</option>
                 </select>
            </div>
        )}
      </div>
    );
  };

  const ActivityButton: React.FC<{ activity: Activity }> = ({ activity }) => (
    <button
        onClick={() => onSelectActivity(activity.id)}
        className="w-full text-left p-3 rounded-lg hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors flex items-center"
    >
        <i className={`${activity.icon} w-6 text-center text-teal-500 dark:text-teal-400 mr-3`}></i>
        <span className="flex-1 text-sm">{activity.title}</span>
    </button>
  );

  return (
    <aside className="w-96 bg-white dark:bg-gray-800 shadow-lg flex flex-col print:hidden overflow-y-auto">
      {currentActivity ? (
        // Settings View
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => onSelectActivity(null)} className="text-teal-600 dark:text-teal-400 hover:underline text-sm mb-4">
                    <i className="fa-solid fa-arrow-left mr-2"></i>Tüm Etkinlikler
                </button>
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-teal-500 dark:bg-teal-600 text-white rounded-lg flex items-center justify-center mr-4 shrink-0">
                        <i className={`${currentActivity.icon} fa-lg`}></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{currentActivity.title}</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{currentActivity.description}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {renderSettings()}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
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
             <h2 className="text-xl font-bold mb-4 px-2">Etkinlik Kategorileri</h2>
             <div className="space-y-2">
                {ACTIVITY_CATEGORIES.map(category => (
                    <div key={category.id}>
                        <button 
                            onClick={() => handleToggleCategory(category.id)}
                            className="w-full flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
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