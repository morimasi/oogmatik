
import React, { CSSProperties } from 'react';
import { ActivityType, SingleWorksheetData, StyleSettings } from '../types';

import * as WordGameSheets from './sheets/WordGameSheets';
import * as ReadingSheets from './sheets/ReadingComprehensionSheets';
import * as MemorySheets from './sheets/MemoryAttentionSheets';
import * as MathLogicSheets from './sheets/MathLogicSheets';
import * as VisualSheets from './sheets/VisualPerceptionSheets';
import * as DyslexiaSheets from './sheets/DyslexiaSupportSheets';
import * as DyscalculiaSheets from './sheets/DyscalculiaSheets';
import * as NewActivitySheets from './sheets/NewActivitySheets'; // Added

interface WorksheetProps {
  activityType: ActivityType | null;
  data: SingleWorksheetData[] | null;
  settings: StyleSettings;
}

const renderSheet = (type: ActivityType | null, data: any, settings: StyleSettings) => {
    try {
        const props = { data, settings };

        switch (type) {
            // --- New Activities ---
            case ActivityType.FAMILY_RELATIONS: return <NewActivitySheets.FamilyRelationsSheet {...props} />;
            case ActivityType.LOGIC_DEDUCTION: return <NewActivitySheets.LogicDeductionSheet {...props} />;
            case ActivityType.NUMBER_BOX_LOGIC: return <NewActivitySheets.NumberBoxLogicSheet {...props} />;
            case ActivityType.MAP_INSTRUCTION: return <NewActivitySheets.MapInstructionSheet {...props} />;

            // --- Dyscalculia Support ---
            case ActivityType.NUMBER_SENSE: return <DyscalculiaSheets.NumberSenseSheet {...props} />;
            // ... (rest of the existing cases remain unchanged)
            case ActivityType.ARITHMETIC_FLUENCY:
            case ActivityType.VISUAL_ARITHMETIC:
            case ActivityType.NUMBER_GROUPING:
                return <DyscalculiaSheets.VisualArithmeticSheet {...props} />;
            case ActivityType.SPATIAL_REASONING:
            case ActivityType.SPATIAL_AWARENESS_DISCOVERY:
            case ActivityType.POSITIONAL_CONCEPTS:
            case ActivityType.DIRECTIONAL_CONCEPTS:
                return <DyscalculiaSheets.SpatialGridSheet {...props} />;
            case ActivityType.MATH_LANGUAGE:
            case ActivityType.TIME_MEASUREMENT_GEOMETRY:
            case ActivityType.FRACTIONS_DECIMALS:
                return <DyscalculiaSheets.ConceptMatchSheet {...props} />;
            case ActivityType.ESTIMATION_SKILLS:
                return <DyscalculiaSheets.EstimationSheet {...props} />;
            case ActivityType.VISUAL_NUMBER_REPRESENTATION:
                return <DyscalculiaSheets.NumberSenseSheet {...props} />; 
            case ActivityType.PROBLEM_SOLVING_STRATEGIES:
            case ActivityType.APPLIED_MATH_STORY:
                return MathLogicSheets.RealLifeMathProblemsSheet ? <MathLogicSheets.RealLifeMathProblemsSheet {...props} /> : <div>Component Not Found</div>;
            case ActivityType.VISUAL_DISCRIMINATION_MATH:
                return <VisualSheets.VisualOddOneOutSheet {...props} />;

            // --- Dyslexia Support ---
            case ActivityType.READING_FLOW: return <DyslexiaSheets.ReadingFlowSheet {...props} />;
            case ActivityType.LETTER_DISCRIMINATION: return <DyslexiaSheets.LetterDiscriminationSheet {...props} />;
            case ActivityType.RAPID_NAMING: return <DyslexiaSheets.RapidNamingSheet {...props} />;
            case ActivityType.PHONOLOGICAL_AWARENESS: return <DyslexiaSheets.PhonologicalAwarenessSheet {...props} />;
            case ActivityType.MIRROR_LETTERS: return <DyslexiaSheets.MirrorLettersSheet {...props} />;
            case ActivityType.SYLLABLE_TRAIN: return <DyslexiaSheets.SyllableTrainSheet {...props} />;
            case ActivityType.VISUAL_TRACKING_LINES: return <DyslexiaSheets.VisualTrackingLinesSheet {...props} />;
            case ActivityType.BACKWARD_SPELLING: return <DyslexiaSheets.BackwardSpellingSheet {...props} />;

            // --- Word Games ---
            case ActivityType.WORD_SEARCH: return <WordGameSheets.WordSearchSheet {...props} />;
            case ActivityType.THEMATIC_WORD_SEARCH_COLOR: return <WordGameSheets.WordSearchSheet {...props} />;
            case ActivityType.WORD_SEARCH_WITH_PASSWORD: return <WordGameSheets.WordSearchWithPasswordSheet {...props} />;
            case ActivityType.SYNONYM_WORD_SEARCH: return <WordGameSheets.SynonymWordSearchSheet {...props} />;
            case ActivityType.LETTER_GRID_WORD_FIND: return <WordGameSheets.LetterGridWordFindSheet {...props} />;
            case ActivityType.SYLLABLE_WORD_SEARCH: return <WordGameSheets.SyllableWordSearchSheet {...props} />;
            case ActivityType.ANAGRAM: return <WordGameSheets.AnagramSheet {...props} />;
            case ActivityType.IMAGE_ANAGRAM_SORT: return <WordGameSheets.ImageAnagramSortSheet {...props} />;
            case ActivityType.ANAGRAM_IMAGE_MATCH: return <WordGameSheets.AnagramImageMatchSheet {...props} />;
            case ActivityType.POSITIONAL_ANAGRAM: return <WordGameSheets.PositionalAnagramSheet {...props} />;
            case ActivityType.CROSSWORD: return <WordGameSheets.CrosswordSheet {...props} />;
            case ActivityType.SPIRAL_PUZZLE: return <WordGameSheets.SpiralPuzzleSheet {...props} />;
            case ActivityType.PUNCTUATION_SPIRAL_PUZZLE: return <WordGameSheets.SpiralPuzzleSheet {...props} />;
            case ActivityType.WORD_LADDER: return <WordGameSheets.WordLadderSheet {...props} />;
            case ActivityType.SPELLING_CHECK: return <WordGameSheets.SpellingCheckSheet {...props} />;
            case ActivityType.REVERSE_WORD: return <WordGameSheets.ReverseWordSheet {...props} />;
            case ActivityType.LETTER_BRIDGE: return <WordGameSheets.LetterBridgeSheet {...props} />;
            case ActivityType.WORD_FORMATION: return <WordGameSheets.WordFormationSheet {...props} />;
            case ActivityType.JUMBLED_WORD_STORY: return <WordGameSheets.JumbledWordStorySheet {...props} />;
            case ActivityType.HOMONYM_SENTENCE_WRITING: return <WordGameSheets.HomonymSentenceSheet {...props} />;
            case ActivityType.MISSING_PARTS: return <WordGameSheets.MissingPartsSheet {...props} />;
            case ActivityType.SYLLABLE_COMPLETION: return <WordGameSheets.SyllableCompletionSheet {...props} />;
            case ActivityType.WORD_GROUPING: return <WordGameSheets.WordGroupingSheet {...props} />;
            case ActivityType.WORD_WEB: return <WordGameSheets.WordWebSheet {...props} />;
            case ActivityType.WORD_WEB_WITH_PASSWORD: return <WordGameSheets.WordWebWithPasswordSheet {...props} />;
            case ActivityType.WORD_PLACEMENT_PUZZLE: return <WordGameSheets.WordPlacementPuzzleSheet {...props} />;
            case ActivityType.WORD_GRID_PUZZLE: return <WordGameSheets.WordGridPuzzleSheet {...props} />;
            case ActivityType.MINI_WORD_GRID: return <WordGameSheets.MiniWordGridSheet {...props} />;
            case ActivityType.PASSWORD_FINDER: return <WordGameSheets.PasswordFinderSheet {...props} />;
            case ActivityType.HOMONYM_IMAGE_MATCH: return <WordGameSheets.HomonymImageMatchSheet {...props} />;
            case ActivityType.ANTONYM_FLOWER_PUZZLE: return <WordGameSheets.AntonymFlowerPuzzleSheet {...props} />;
            case ActivityType.SYNONYM_ANTONYM_GRID: return <WordGameSheets.SynonymAntonymGridSheet {...props} />;
            case ActivityType.ANTONYM_RESFEBE: return <WordGameSheets.ResfebeSheet {...props} />;
            case ActivityType.RESFEBE: return <WordGameSheets.ResfebeSheet {...props} />;
            case ActivityType.SYNONYM_SEARCH_STORY: return <WordGameSheets.SynonymSearchAndStorySheet {...props} />;
            case ActivityType.SYNONYM_MATCHING_PATTERN: return <WordGameSheets.SynonymMatchingPatternSheet {...props} />;

            // --- Reading ---
            case ActivityType.STORY_COMPREHENSION: return <ReadingSheets.StoryComprehensionSheet {...props} />;
            case ActivityType.STORY_ANALYSIS: return <ReadingSheets.StoryAnalysisSheet {...props} />;
            case ActivityType.STORY_SEQUENCING: return <ReadingSheets.StorySequencingSheet {...props} />;
            case ActivityType.WORDS_IN_STORY: return <ReadingSheets.WordsInStorySheet {...props} />;
            case ActivityType.STORY_CREATION_PROMPT: return <ReadingSheets.StoryCreationPromptSheet {...props} />;
            case ActivityType.PROVERB_FILL_IN_THE_BLANK: return <ReadingSheets.ProverbFillSheet {...props} />;
            case ActivityType.PROVERB_SAYING_SORT: return <ReadingSheets.ProverbSayingSortSheet {...props} />;
            case ActivityType.PROVERB_WORD_CHAIN: return <ReadingSheets.ProverbWordChainSheet {...props} />;
            case ActivityType.PROVERB_SEARCH: return <ReadingSheets.ProverbSearchSheet {...props} />;

            // --- Memory & Attention ---
            case ActivityType.WORD_MEMORY: return <MemorySheets.WordMemorySheet {...props} />;
            case ActivityType.VISUAL_MEMORY: return <MemorySheets.VisualMemorySheet {...props} />;
            case ActivityType.NUMBER_SEARCH: return <MemorySheets.NumberSearchSheet {...props} />;
            case ActivityType.FIND_THE_DUPLICATE_IN_ROW: return <MemorySheets.FindDuplicateSheet {...props} />;
            case ActivityType.LETTER_GRID_TEST: return <MemorySheets.LetterGridTestSheet {...props} />;
            case ActivityType.BURDON_TEST: return <MemorySheets.BurdonTestSheet {...props} />;
            case ActivityType.FIND_LETTER_PAIR: return <MemorySheets.FindLetterPairSheet {...props} />;
            case ActivityType.TARGET_SEARCH: return <MemorySheets.TargetSearchSheet {...props} />;
            case ActivityType.COLOR_WHEEL_MEMORY: return <MemorySheets.ColorWheelSheet {...props} />;
            case ActivityType.IMAGE_COMPREHENSION: return <MemorySheets.ImageComprehensionSheet {...props} />;
            case ActivityType.CHARACTER_MEMORY: return <MemorySheets.CharacterMemorySheet {...props} />;
            case ActivityType.STROOP_TEST: return <MemorySheets.StroopTestSheet {...props} />;
            case ActivityType.CHAOTIC_NUMBER_SEARCH: return <MemorySheets.ChaoticNumberSearchSheet {...props} />;

            // --- Math & Logic ---
            case ActivityType.BASIC_OPERATIONS: return <MathLogicSheets.BasicOperationsSheet {...props} />;
            case ActivityType.REAL_LIFE_MATH_PROBLEMS: return <MathLogicSheets.RealLifeMathProblemsSheet {...props} />;
            case ActivityType.MATH_PUZZLE: return <MathLogicSheets.MathPuzzleSheet {...props} />;
            case ActivityType.NUMBER_PATTERN: return <MathLogicSheets.NumberPatternSheet {...props} />;
            case ActivityType.FUTOSHIKI: return <MathLogicSheets.FutoshikiSheet {...props} />;
            case ActivityType.NUMBER_PYRAMID: return <MathLogicSheets.NumberPyramidSheet {...props} />;
            case ActivityType.NUMBER_CAPSULE: return <MathLogicSheets.NumberCapsuleSheet {...props} />;
            case ActivityType.ODD_EVEN_SUDOKU: return <MathLogicSheets.OddEvenSudokuSheet {...props} />;
            case ActivityType.ROMAN_NUMERAL_STAR_HUNT: return <MathLogicSheets.RomanNumeralStarHuntSheet {...props} />;
            case ActivityType.ROUNDING_CONNECT: return <MathLogicSheets.RoundingConnectSheet {...props} />;
            case ActivityType.ARITHMETIC_CONNECT: return <MathLogicSheets.RoundingConnectSheet {...props} />;
            case ActivityType.ROMAN_NUMERAL_MULTIPLICATION: return <MathLogicSheets.RomanNumeralMultiplicationSheet {...props} />;
            case ActivityType.KENDOKU: return <MathLogicSheets.KendokuSheet {...props} />;
            case ActivityType.OPERATION_SQUARE_FILL_IN: return <MathLogicSheets.OperationSquareSheet {...props} />;
            case ActivityType.MULTIPLICATION_WHEEL: return <MathLogicSheets.MultiplicationWheelSheet {...props} />;
            case ActivityType.TARGET_NUMBER: return <MathLogicSheets.TargetNumberSheet {...props} />;
            case ActivityType.SHAPE_SUDOKU: return <MathLogicSheets.ShapeSudokuSheet {...props} />;
            case ActivityType.VISUAL_NUMBER_PATTERN: return <MathLogicSheets.VisualNumberPatternSheet {...props} />;
            case ActivityType.LOGIC_GRID_PUZZLE: return <MathLogicSheets.LogicGridPuzzleSheet {...props} />;
            case ActivityType.ODD_ONE_OUT: return <MathLogicSheets.OddOneOutSheet {...props} />;
            case ActivityType.THEMATIC_ODD_ONE_OUT: return <MathLogicSheets.ThematicOddOneOutSheet {...props} />;
            case ActivityType.THEMATIC_ODD_ONE_OUT_SENTENCE: return <MathLogicSheets.ThematicOddOneOutSentenceSheet {...props} />;
            case ActivityType.COLUMN_ODD_ONE_OUT_SENTENCE: return <MathLogicSheets.ColumnOddOneOutSentenceSheet {...props} />;
            case ActivityType.PUNCTUATION_MAZE: return <MathLogicSheets.PunctuationMazeSheet {...props} />;
            case ActivityType.PUNCTUATION_PHONE_NUMBER: return <MathLogicSheets.PunctuationPhoneNumberSheet {...props} />;
            case ActivityType.SHAPE_NUMBER_PATTERN: return <MathLogicSheets.ShapeNumberPatternSheet {...props} />;
            case ActivityType.SHAPE_COUNTING: return <MathLogicSheets.ShapeCountingSheet {...props} />;
            case ActivityType.ROMAN_NUMERAL_CONNECT: return <VisualSheets.AbcConnectSheet {...props} />;

            // --- Visual Perception ---
            case ActivityType.FIND_THE_DIFFERENCE: return <VisualSheets.FindTheDifferenceSheet {...props} />;
            case ActivityType.SHAPE_MATCHING: return <VisualSheets.ShapeMatchingSheet {...props} />;
            case ActivityType.FIND_IDENTICAL_WORD: return <VisualSheets.FindIdenticalWordSheet {...props} />;
            case ActivityType.GRID_DRAWING: return <VisualSheets.GridDrawingSheet {...props} />;
            case ActivityType.SYMBOL_CIPHER: return <VisualSheets.SymbolCipherSheet {...props} />;
            case ActivityType.BLOCK_PAINTING: return <VisualSheets.BlockPaintingSheet {...props} />;
            case ActivityType.VISUAL_ODD_ONE_OUT: return <VisualSheets.VisualOddOneOutSheet {...props} />;
            case ActivityType.SYMMETRY_DRAWING: return <VisualSheets.SymmetryDrawingSheet {...props} />;
            case ActivityType.FIND_DIFFERENT_STRING: return <VisualSheets.FindDifferentStringSheet {...props} />;
            case ActivityType.DOT_PAINTING: return <VisualSheets.DotPaintingSheet {...props} />;
            case ActivityType.ABC_CONNECT: return <VisualSheets.AbcConnectSheet {...props} />;
            case ActivityType.COORDINATE_CIPHER: return <VisualSheets.CoordinateCipherSheet {...props} />;
            case ActivityType.WORD_CONNECT: return <VisualSheets.WordConnectSheet {...props} />;
            case ActivityType.PROFESSION_CONNECT: return <VisualSheets.ProfessionConnectSheet {...props} />;
            case ActivityType.MATCHSTICK_SYMMETRY: return <VisualSheets.MatchstickSymmetrySheet {...props} />;
            case ActivityType.VISUAL_ODD_ONE_OUT_THEMED: return <VisualSheets.VisualOddOneOutThemedSheet {...props} />;
            case ActivityType.PUNCTUATION_COLORING: return <VisualSheets.PunctuationColoringSheet {...props} />;
            case ActivityType.SYNONYM_ANTONYM_COLORING: return <VisualSheets.SynonymAntonymColoringSheet {...props} />;
            case ActivityType.STAR_HUNT: return <VisualSheets.StarHuntSheet {...props} />;
            case ActivityType.WORD_COMPARISON: return <VisualSheets.WordComparisonSheet {...props} />;
            case ActivityType.ROMAN_ARABIC_MATCH_CONNECT: return <VisualSheets.AbcConnectSheet {...props} />;
            case ActivityType.WEIGHT_CONNECT: return <VisualSheets.AbcConnectSheet {...props} />;
            case ActivityType.LENGTH_CONNECT: return <VisualSheets.AbcConnectSheet {...props} />;

            default: 
                return (
                    <div className="p-10 text-center">
                        <h2 className="text-xl font-bold mb-2">{data.title}</h2>
                        <p>{data.instruction}</p>
                        <p className="text-zinc-400 mt-4 text-sm">Bu etkinlik türü için görünüm şablonu hazırlanıyor.</p>
                    </div>
                );
        }
    } catch (error) {
        console.error(`Error rendering sheet for ${type}:`, error);
        return (
            <div className="p-10 text-center text-red-500 border-2 border-red-200 rounded-lg bg-red-50">
                <h3 className="font-bold">Bir Hata Oluştu</h3>
                <p>Etkinlik görüntülenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.</p>
            </div>
        );
    }
};

const Worksheet: React.FC<WorksheetProps> = ({ activityType, data, settings }) => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    const pageStyle: CSSProperties = {
        padding: `${settings.margin}px`,
        border: `${settings.borderWidth}px solid ${settings.borderColor}`,
        fontSize: `${settings.fontSize}px`,
        '--worksheet-gap': `${settings.gap}px`,
        '--worksheet-border-width': `${settings.borderWidth}px`,
        '--worksheet-border-color': settings.borderColor,
        '--dynamic-cols': settings.columns,
    } as CSSProperties;

    return (
        <div className="flex flex-col gap-8 items-center w-full max-w-[210mm] mx-auto">
            {data.map((sheetData, index) => (
                <div 
                    key={index} 
                    className="worksheet-page bg-white shadow-lg print:shadow-none print:break-after-page w-full relative text-black aspect-[210/297] md:aspect-auto md:min-h-[297mm] overflow-hidden"
                    style={pageStyle}
                >
                    {renderSheet(activityType, sheetData, settings)}

                    <div className="absolute bottom-4 right-6 text-[10px] text-zinc-400 font-bold uppercase tracking-widest print:block hidden opacity-50">
                        Bursa Disleksi AI
                    </div>
                </div>
            ))}
        </div>
    );
};

export default React.memo(Worksheet, (prevProps, nextProps) => {
    return prevProps.activityType === nextProps.activityType && 
           prevProps.data === nextProps.data && 
           JSON.stringify(prevProps.settings) === JSON.stringify(nextProps.settings);
});
