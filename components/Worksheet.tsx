
import React, { CSSProperties } from 'react';
import { ActivityType, SingleWorksheetData, AnagramsData } from '../types';
import { StyleSettings } from '../App';

import * as WordGameSheets from './sheets/WordGameSheets';
import * as ReadingSheets from './sheets/ReadingComprehensionSheets';
import * as MemorySheets from './sheets/MemoryAttentionSheets';
import * as MathLogicSheets from './sheets/MathLogicSheets';
import * as VisualSheets from './sheets/VisualPerceptionSheets';
import * as DyslexiaSheets from './sheets/DyslexiaSupportSheets';

import {
    WordSearchData, WordSearchWithPasswordData, ProverbSearchData, LetterGridWordFindData, ThematicWordSearchColorData, SynonymWordSearchData, SynonymSearchAndStoryData, StoryData, StroopTestData, NumberPatternData, SpellingCheckData, LetterGridTestData, NumberSearchData, WordMemoryData, StoryCreationPromptData, FindTheDifferenceData, WordComparisonData, WordsInStoryData, OddOneOutData, ShapeMatchingData, SymbolCipherData, ProverbFillData, LetterBridgeData, FindDuplicateData, FindLetterPairData, WordLadderData, FindIdenticalWordData, WordFormationData, ReverseWordData, WordGroupingData, VisualMemoryData, StoryAnalysisData, CoordinateCipherData, TargetSearchData, ShapeNumberPatternData, GridDrawingData, ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, StorySequencingData, ChaoticNumberSearchData, BlockPaintingData, MiniWordGridData, VisualOddOneOutData, ShapeCountingData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, PasswordFinderData, SyllableCompletionData, WordConnectData, SpiralPuzzleData, CrosswordData, JumbledWordStoryData, HomonymSentenceData, WordGridPuzzleData, ProverbSayingSortData, HomonymImageMatchData, AntonymFlowerPuzzleData, ProverbWordChainData, ThematicOddOneOutData, SynonymAntonymGridData, PunctuationColoringData, TargetNumberData, OperationSquareMultDivData, FutoshikiData, ShapeSudokuData, WeightConnectData, PunctuationMazeData, AntonymResfebeData, ThematicOddOneOutSentenceData, ProverbSentenceFinderData, ColumnOddOneOutSentenceData, SynonymAntonymColoringData, PunctuationPhoneNumberData, PunctuationSpiralPuzzleData, ThematicJumbledWordStoryData, SynonymMatchingPatternData, NumberPyramidData, NumberCapsuleData, OddEvenSudokuData, RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData, RomanNumeralMultiplicationData, ArithmeticConnectData, RomanArabicMatchConnectData, Sudoku6x6ShadedData, KendokuData, DivisionPyramidData, MultiplicationPyramidData, OperationSquareSubtractionData, OperationSquareFillInData, MultiplicationWheelData, ResfebeData, FutoshikiLengthData, MatchstickSymmetryData, WordWebData, StarHuntData, LengthConnectData, VisualNumberPatternData, MissingPartsData, ProfessionConnectData, VisualOddOneOutThemedData, LogicGridPuzzleData, ImageAnagramSortData, AnagramImageMatchData, SyllableWordSearchData, WordWebWithPasswordData, WordPlacementPuzzleData, PositionalAnagramData, MathPuzzleData,
    ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData
} from '../types';


interface WorksheetProps {
  activityType: ActivityType | null;
  data: SingleWorksheetData[] | null;
  settings: StyleSettings;
}

const Worksheet: React.FC<WorksheetProps> = ({ activityType, data, settings }) => {
    if (!data || !activityType) return null;

    const worksheetStyles: CSSProperties = {
        '--worksheet-border-color': settings.borderColor,
        '--worksheet-border-width': `${settings.borderWidth}px`,
        '--worksheet-margin': `${settings.margin}px`,
        '--worksheet-gap': `${settings.gap}px`, // Inject dynamic gap for all flex/grid items in content
    } as React.CSSProperties;

    // Content column styles: splits text/questions into columns like a newspaper
    const contentWrapperStyles: CSSProperties = {
        columnCount: settings.columns > 1 ? settings.columns : 'auto',
        columnGap: '2rem', // Standard gap between columns
        width: '100%',
    };

    // REMOVED overflow-hidden for print mode to allow content to flow to next pages
    const pageClasses = `page worksheet-page bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-lg relative print:shadow-none print:m-0 print:border-none overflow-hidden print:overflow-visible`;

    const renderContent = (singleData: SingleWorksheetData, index: number) => {
        switch (activityType) {
            // Word Games
            case ActivityType.WORD_SEARCH: 
            case ActivityType.PROVERB_SEARCH:
            case ActivityType.WORD_SEARCH_WITH_PASSWORD:
            case ActivityType.LETTER_GRID_WORD_FIND:
            case ActivityType.THEMATIC_WORD_SEARCH_COLOR:
                 return <WordGameSheets.WordSearchSheet data={singleData as WordSearchData | WordSearchWithPasswordData | ProverbSearchData | LetterGridWordFindData | ThematicWordSearchColorData} />;
            case ActivityType.SYNONYM_WORD_SEARCH: return <WordGameSheets.SynonymWordSearchSheet data={singleData as SynonymWordSearchData} />;
            case ActivityType.SYNONYM_SEARCH_STORY: return <WordGameSheets.SynonymSearchAndStorySheet data={singleData as SynonymSearchAndStoryData} />;
            case ActivityType.ANAGRAM: return <WordGameSheets.AnagramSheet data={singleData as AnagramsData} />;
            case ActivityType.SPELLING_CHECK: return <WordGameSheets.SpellingCheckSheet data={singleData as SpellingCheckData} />;
            case ActivityType.LETTER_BRIDGE: return <WordGameSheets.LetterBridgeSheet data={singleData as LetterBridgeData} />;
            case ActivityType.WORD_LADDER: return <WordGameSheets.WordLadderSheet data={singleData as WordLadderData} />;
            case ActivityType.WORD_FORMATION: return <WordGameSheets.WordFormationSheet data={singleData as WordFormationData} />;
            case ActivityType.REVERSE_WORD: return <WordGameSheets.ReverseWordSheet data={singleData as ReverseWordData} />;
            case ActivityType.WORD_GROUPING: return <WordGameSheets.WordGroupingSheet data={singleData as WordGroupingData} />;
            case ActivityType.MINI_WORD_GRID: return <WordGameSheets.MiniWordGridSheet data={singleData as MiniWordGridData} />;
            case ActivityType.PASSWORD_FINDER: return <WordGameSheets.PasswordFinderSheet data={singleData as PasswordFinderData} />;
            case ActivityType.SYLLABLE_COMPLETION: return <WordGameSheets.SyllableCompletionSheet data={singleData as SyllableCompletionData} />;
            case ActivityType.SPIRAL_PUZZLE:
            case ActivityType.PUNCTUATION_SPIRAL_PUZZLE:
                 return <WordGameSheets.SpiralPuzzleSheet data={singleData as SpiralPuzzleData | PunctuationSpiralPuzzleData} />;
            case ActivityType.CROSSWORD: return <WordGameSheets.CrosswordSheet data={singleData as CrosswordData} />;
            case ActivityType.JUMBLED_WORD_STORY:
            case ActivityType.THEMATIC_JUMBLED_WORD_STORY:
                 return <WordGameSheets.JumbledWordStorySheet data={singleData as JumbledWordStoryData | ThematicJumbledWordStoryData} />;
            case ActivityType.HOMONYM_SENTENCE_WRITING: return <WordGameSheets.HomonymSentenceSheet data={singleData as HomonymSentenceData} />;
            case ActivityType.WORD_GRID_PUZZLE: return <WordGameSheets.WordGridPuzzleSheet data={singleData as WordGridPuzzleData} />;
            case ActivityType.HOMONYM_IMAGE_MATCH: return <WordGameSheets.HomonymImageMatchSheet data={singleData as HomonymImageMatchData} />;
            case ActivityType.ANTONYM_FLOWER_PUZZLE: return <WordGameSheets.AntonymFlowerPuzzleSheet data={singleData as AntonymFlowerPuzzleData} />;
            case ActivityType.SYNONYM_ANTONYM_GRID: return <WordGameSheets.SynonymAntonymGridSheet data={singleData as SynonymAntonymGridData} />;
            case ActivityType.ANTONYM_RESFEBE: return <WordGameSheets.AntonymResfebeSheet data={singleData as AntonymResfebeData} />;
            case ActivityType.SYNONYM_MATCHING_PATTERN: return <WordGameSheets.SynonymMatchingPatternSheet data={singleData as SynonymMatchingPatternData} />;
            case ActivityType.MISSING_PARTS: return <WordGameSheets.MissingPartsSheet data={singleData as MissingPartsData} />;
            case ActivityType.WORD_WEB: return <WordGameSheets.WordWebSheet data={singleData as WordWebData} />;
            case ActivityType.SYLLABLE_WORD_SEARCH: return <WordGameSheets.SyllableWordSearchSheet data={singleData as SyllableWordSearchData} />;
            case ActivityType.WORD_WEB_WITH_PASSWORD: return <WordGameSheets.WordWebWithPasswordSheet data={singleData as WordWebWithPasswordData} />;
            case ActivityType.WORD_PLACEMENT_PUZZLE: return <WordGameSheets.WordPlacementPuzzleSheet data={singleData as WordPlacementPuzzleData} />;
            case ActivityType.POSITIONAL_ANAGRAM: return <WordGameSheets.PositionalAnagramSheet data={singleData as PositionalAnagramData} />;
            case ActivityType.IMAGE_ANAGRAM_SORT: return <WordGameSheets.ImageAnagramSortSheet data={singleData as ImageAnagramSortData} />;
            case ActivityType.ANAGRAM_IMAGE_MATCH: return <WordGameSheets.AnagramImageMatchSheet data={singleData as AnagramImageMatchData} />;
            
            // Reading Comprehension
            case ActivityType.STORY_COMPREHENSION: return <ReadingSheets.StoryComprehensionSheet data={singleData as StoryData} />;
            case ActivityType.WORDS_IN_STORY: return <ReadingSheets.WordsInStorySheet data={singleData as WordsInStoryData} />;
            case ActivityType.STORY_CREATION_PROMPT: return <ReadingSheets.StoryCreationPromptSheet data={singleData as StoryCreationPromptData} />;
            case ActivityType.STORY_ANALYSIS: return <ReadingSheets.StoryAnalysisSheet data={singleData as StoryAnalysisData} />;
            case ActivityType.STORY_SEQUENCING: return <ReadingSheets.StorySequencingSheet data={singleData as StorySequencingData} />;
            case ActivityType.PROVERB_FILL_IN_THE_BLANK: return <ReadingSheets.ProverbFillSheet data={singleData as ProverbFillData} />;
            case ActivityType.PROVERB_SAYING_SORT: return <ReadingSheets.ProverbSayingSortSheet data={singleData as ProverbSayingSortData} />;
            case ActivityType.PROVERB_WORD_CHAIN:
            case ActivityType.PROVERB_SENTENCE_FINDER:
                 return <ReadingSheets.ProverbWordChainSheet data={singleData as ProverbWordChainData | ProverbSentenceFinderData} />;

            // Memory & Attention
            case ActivityType.WORD_MEMORY: return <MemorySheets.WordMemorySheet data={singleData as WordMemoryData} />;
            case ActivityType.VISUAL_MEMORY: return <MemorySheets.VisualMemorySheet data={singleData as VisualMemoryData} />;
            case ActivityType.NUMBER_SEARCH: return <MemorySheets.NumberSearchSheet data={singleData as NumberSearchData} />;
            case ActivityType.FIND_THE_DUPLICATE_IN_ROW: return <MemorySheets.FindDuplicateSheet data={singleData as FindDuplicateData} />;
            case ActivityType.LETTER_GRID_TEST: return <MemorySheets.LetterGridTestSheet data={singleData as LetterGridTestData} />;
            case ActivityType.BURDON_TEST: return <MemorySheets.BurdonTestSheet data={singleData as LetterGridTestData} />;
            case ActivityType.FIND_LETTER_PAIR: return <MemorySheets.FindLetterPairSheet data={singleData as FindLetterPairData} />;
            case ActivityType.TARGET_SEARCH: return <MemorySheets.TargetSearchSheet data={singleData as TargetSearchData} />;
            case ActivityType.COLOR_WHEEL_MEMORY: return <MemorySheets.ColorWheelSheet data={singleData as ColorWheelMemoryData} />;
            case ActivityType.IMAGE_COMPREHENSION: return <MemorySheets.ImageComprehensionSheet data={singleData as ImageComprehensionData} />;
            case ActivityType.CHARACTER_MEMORY: return <MemorySheets.CharacterMemorySheet data={singleData as CharacterMemoryData} />;
            case ActivityType.STROOP_TEST: return <MemorySheets.StroopTestSheet data={singleData as StroopTestData} />;
            case ActivityType.CHAOTIC_NUMBER_SEARCH: return <MemorySheets.ChaoticNumberSearchSheet data={singleData as ChaoticNumberSearchData} />;

            // Math & Logic
            case ActivityType.MATH_PUZZLE: return <MathLogicSheets.MathPuzzleSheet data={singleData as MathPuzzleData} />;
            case ActivityType.NUMBER_PATTERN: return <MathLogicSheets.NumberPatternSheet data={singleData as NumberPatternData} />;
            case ActivityType.ODD_ONE_OUT: return <MathLogicSheets.OddOneOutSheet data={singleData as OddOneOutData} />;
            case ActivityType.THEMATIC_ODD_ONE_OUT: return <MathLogicSheets.ThematicOddOneOutSheet data={singleData as ThematicOddOneOutData} />;
            case ActivityType.THEMATIC_ODD_ONE_OUT_SENTENCE: return <MathLogicSheets.ThematicOddOneOutSentenceSheet data={singleData as ThematicOddOneOutSentenceData} />;
            case ActivityType.COLUMN_ODD_ONE_OUT_SENTENCE: return <MathLogicSheets.ColumnOddOneOutSentenceSheet data={singleData as ColumnOddOneOutSentenceData} />;
            case ActivityType.PUNCTUATION_MAZE: return <MathLogicSheets.PunctuationMazeSheet data={singleData as PunctuationMazeData} />;
            case ActivityType.PUNCTUATION_PHONE_NUMBER: return <MathLogicSheets.PunctuationPhoneNumberSheet data={singleData as PunctuationPhoneNumberData} />;
            case ActivityType.SHAPE_NUMBER_PATTERN: return <MathLogicSheets.ShapeNumberPatternSheet data={singleData as ShapeNumberPatternData} />;
            case ActivityType.SHAPE_COUNTING: return <MathLogicSheets.ShapeCountingSheet data={singleData as ShapeCountingData} />;
            case ActivityType.FUTOSHIKI:
            case ActivityType.FUTOSHIKI_LENGTH:
                return <MathLogicSheets.FutoshikiSheet data={singleData as FutoshikiData | FutoshikiLengthData} />;
            case ActivityType.NUMBER_PYRAMID:
            case ActivityType.DIVISION_PYRAMID:
            case ActivityType.MULTIPLICATION_PYRAMID:
                return <MathLogicSheets.NumberPyramidSheet data={singleData as NumberPyramidData | DivisionPyramidData | MultiplicationPyramidData} />;
            case ActivityType.NUMBER_CAPSULE: return <MathLogicSheets.NumberCapsuleSheet data={singleData as NumberCapsuleData} />;
            case ActivityType.ODD_EVEN_SUDOKU:
            case ActivityType.SUDOKU_6X6_SHADED:
                 return <MathLogicSheets.OddEvenSudokuSheet data={singleData as OddEvenSudokuData | Sudoku6x6ShadedData} />;
            case ActivityType.ROMAN_NUMERAL_STAR_HUNT: return <MathLogicSheets.RomanNumeralStarHuntSheet data={singleData as RomanNumeralStarHuntData} />;
            case ActivityType.ROUNDING_CONNECT:
            case ActivityType.ARITHMETIC_CONNECT:
                 return <MathLogicSheets.RoundingConnectSheet data={singleData as RoundingConnectData | ArithmeticConnectData} />;
            case ActivityType.ROMAN_NUMERAL_MULTIPLICATION: return <MathLogicSheets.RomanNumeralMultiplicationSheet data={singleData as RomanNumeralMultiplicationData} />;
            case ActivityType.KENDOKU: return <MathLogicSheets.KendokuSheet data={singleData as KendokuData} />;
            case ActivityType.OPERATION_SQUARE_SUBTRACTION:
            case ActivityType.OPERATION_SQUARE_FILL_IN:
            case ActivityType.OPERATION_SQUARE_MULT_DIV:
                return <MathLogicSheets.OperationSquareSheet data={singleData as OperationSquareSubtractionData | OperationSquareFillInData | OperationSquareMultDivData} />;
            case ActivityType.TARGET_NUMBER: return <MathLogicSheets.TargetNumberSheet data={singleData as TargetNumberData} />;
            case ActivityType.SHAPE_SUDOKU: return <MathLogicSheets.ShapeSudokuSheet data={singleData as ShapeSudokuData} />;
            case ActivityType.VISUAL_NUMBER_PATTERN: return <MathLogicSheets.VisualNumberPatternSheet data={singleData as VisualNumberPatternData} />;
            case ActivityType.LOGIC_GRID_PUZZLE: return <MathLogicSheets.LogicGridPuzzleSheet data={singleData as LogicGridPuzzleData} />;
            case ActivityType.RESFEBE: return <WordGameSheets.ResfebeSheet data={singleData as ResfebeData} />;
            case ActivityType.MULTIPLICATION_WHEEL: return <MathLogicSheets.MultiplicationWheelSheet data={singleData as MultiplicationWheelData} />;


            // Visual Perception
            case ActivityType.FIND_THE_DIFFERENCE: return <VisualSheets.FindTheDifferenceSheet data={singleData as FindTheDifferenceData} />;
            case ActivityType.WORD_COMPARISON: return <VisualSheets.WordComparisonSheet data={singleData as WordComparisonData} />;
            case ActivityType.SHAPE_MATCHING: return <VisualSheets.ShapeMatchingSheet data={singleData as ShapeMatchingData} />;
            case ActivityType.FIND_IDENTICAL_WORD: return <VisualSheets.FindIdenticalWordSheet data={singleData as FindIdenticalWordData} />;
            case ActivityType.GRID_DRAWING: return <VisualSheets.GridDrawingSheet data={singleData as GridDrawingData} />;
            case ActivityType.SYMBOL_CIPHER: return <VisualSheets.SymbolCipherSheet data={singleData as SymbolCipherData} />;
            case ActivityType.BLOCK_PAINTING: return <VisualSheets.BlockPaintingSheet data={singleData as BlockPaintingData} />;
            case ActivityType.VISUAL_ODD_ONE_OUT: return <VisualSheets.VisualOddOneOutSheet data={singleData as VisualOddOneOutData} />;
            case ActivityType.SYMMETRY_DRAWING: return <VisualSheets.SymmetryDrawingSheet data={singleData as SymmetryDrawingData} />;
            case ActivityType.FIND_DIFFERENT_STRING: return <VisualSheets.FindDifferentStringSheet data={singleData as FindDifferentStringData} />;
            case ActivityType.DOT_PAINTING: return <VisualSheets.DotPaintingSheet data={singleData as DotPaintingData} />;
            case ActivityType.ABC_CONNECT:
            case ActivityType.ROMAN_NUMERAL_CONNECT:
            case ActivityType.ROMAN_ARABIC_MATCH_CONNECT:
            case ActivityType.WEIGHT_CONNECT:
            case ActivityType.LENGTH_CONNECT:
                 return <VisualSheets.AbcConnectSheet data={singleData as AbcConnectData | RomanNumeralConnectData | RomanArabicMatchConnectData | WeightConnectData | LengthConnectData} />;
            case ActivityType.WORD_CONNECT: return <VisualSheets.WordConnectSheet data={singleData as WordConnectData} />;
            case ActivityType.COORDINATE_CIPHER: return <VisualSheets.CoordinateCipherSheet data={singleData as CoordinateCipherData} />;
            case ActivityType.PROFESSION_CONNECT: return <VisualSheets.ProfessionConnectSheet data={singleData as ProfessionConnectData} />;
            case ActivityType.MATCHSTICK_SYMMETRY: return <VisualSheets.MatchstickSymmetrySheet data={singleData as MatchstickSymmetryData} />;
            case ActivityType.VISUAL_ODD_ONE_OUT_THEMED: return <VisualSheets.VisualOddOneOutThemedSheet data={singleData as VisualOddOneOutThemedData} />;
            case ActivityType.PUNCTUATION_COLORING: return <VisualSheets.PunctuationColoringSheet data={singleData as PunctuationColoringData} />;
            case ActivityType.SYNONYM_ANTONYM_COLORING: return <VisualSheets.SynonymAntonymColoringSheet data={singleData as SynonymAntonymColoringData} />;
            case ActivityType.STAR_HUNT: return <VisualSheets.StarHuntSheet data={singleData as StarHuntData} />;

            // DYSLEXIA SUPPORT
            case ActivityType.READING_FLOW: return <DyslexiaSheets.ReadingFlowSheet data={singleData as ReadingFlowData} />;
            case ActivityType.LETTER_DISCRIMINATION: return <DyslexiaSheets.LetterDiscriminationSheet data={singleData as LetterDiscriminationData} />;
            case ActivityType.RAPID_NAMING: return <DyslexiaSheets.RapidNamingSheet data={singleData as RapidNamingData} />;
            case ActivityType.PHONOLOGICAL_AWARENESS: return <DyslexiaSheets.PhonologicalAwarenessSheet data={singleData as PhonologicalAwarenessData} />;
            case ActivityType.MIRROR_LETTERS: return <DyslexiaSheets.MirrorLettersSheet data={singleData as MirrorLettersData} />;
            case ActivityType.SYLLABLE_TRAIN: return <DyslexiaSheets.SyllableTrainSheet data={singleData as SyllableTrainData} />;
            case ActivityType.VISUAL_TRACKING_LINES: return <DyslexiaSheets.VisualTrackingLinesSheet data={singleData as VisualTrackingLineData} />;
            case ActivityType.BACKWARD_SPELLING: return <DyslexiaSheets.BackwardSpellingSheet data={singleData as BackwardSpellingData} />;

            default:
                return <div className="p-4 bg-red-100 text-red-700">Bu etkinlik türü için bir bileşen bulunamadı: {activityType}</div>;
        }
    };

    const scale = settings.fontSize / 16; 
    const inverseScale = 16 / settings.fontSize;

    const containerStyles: CSSProperties = {
        display: 'block',
        width: '100%',
    };

    return (
        <div className="worksheet-container print:p-0" style={worksheetStyles}>
            {!settings.showPedagogicalNote && (
                <style>{`.pedagogical-note { display: none !important; }`}</style>
            )}
            <div className="page-grid print:block print:w-full" style={containerStyles}>
            {data.map((singleData, index) => (
                <div key={index} className={`${pageClasses}`} style={{padding: `var(--worksheet-margin)`}}>
                     
                     {/* BACKGROUND WATERMARK */}
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.04] print:opacity-[0.08] select-none overflow-hidden">
                        <div className="transform -rotate-45 flex flex-col items-center justify-center">
                             <i className="fa-solid fa-brain text-9xl mb-4 text-zinc-900 dark:text-zinc-100"></i>
                             <div className="text-zinc-900 dark:text-zinc-100 text-6xl md:text-8xl font-black whitespace-nowrap tracking-widest uppercase border-y-8 border-zinc-900 dark:border-zinc-100 py-4">
                                BURSA DİSLEKSİ
                             </div>
                        </div>
                     </div>

                     <div className="zoom-wrapper relative z-10 print:h-auto print:w-full print:transform-none" style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        width: `${100 * inverseScale}%`,
                        height: `${100 * inverseScale}%`,
                    }}>
                        {/* Wrapper for internal content, height auto for print to flow */}
                        <div style={contentWrapperStyles} className="h-full print:h-auto">
                            {renderContent(singleData, index)}
                        </div>
                    </div>
                    
                    {/* PROFESSIONAL PRINT FOOTER */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 px-8 pb-6 flex justify-between items-end text-xs text-zinc-400 print:flex hidden pointer-events-none z-20">
                        {/* Left: Branding */}
                        <div className="flex items-center gap-3 opacity-70">
                            <div className="w-10 h-10 border-2 border-zinc-300 rounded-lg flex items-center justify-center bg-white">
                                <i className="fa-solid fa-brain text-zinc-400 text-lg"></i>
                            </div>
                            <div className="flex flex-col justify-center h-10">
                                <span className="font-bold text-zinc-600 uppercase tracking-wider text-[10px] leading-tight">Bursa Disleksi Ai</span>
                                <span className="text-[9px] leading-tight">Özel Eğitim Materyali</span>
                                <span className="text-[8px] text-zinc-300 mt-0.5">bursadisleksi.com</span>
                            </div>
                        </div>

                        {/* Right: Pagination & Date */}
                        <div className="flex flex-col items-end opacity-70 h-10 justify-center">
                             <span className="font-mono font-bold text-xl leading-none text-zinc-500">{index + 1} <span className="text-sm font-normal text-zinc-300">/ {data.length}</span></span>
                             <span className="text-[8px] uppercase tracking-widest mt-1">{new Date().toLocaleDateString('tr-TR')}</span>
                        </div>
                        
                        {/* Bottom Decorative Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-400/30 via-purple-400/30 to-pink-400/30 print:from-zinc-300 print:to-zinc-300"></div>
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
};

export default Worksheet;
