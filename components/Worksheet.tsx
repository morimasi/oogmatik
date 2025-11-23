
import React, { CSSProperties } from 'react';
import { ActivityType, SingleWorksheetData, StyleSettings } from '../types';

import * as WordGameSheets from './sheets/WordGameSheets';
import * as ReadingSheets from './sheets/ReadingComprehensionSheets';
import * as MemorySheets from './sheets/MemoryAttentionSheets';
import * as MathLogicSheets from './sheets/MathLogicSheets';
import * as VisualSheets from './sheets/VisualPerceptionSheets';
import * as DyslexiaSheets from './sheets/DyslexiaSupportSheets';
import * as DyscalculiaSheets from './sheets/DyscalculiaSheets';

interface WorksheetProps {
  activityType: ActivityType | null;
  data: SingleWorksheetData[] | null;
  settings: StyleSettings;
}

const renderSheet = (type: ActivityType | null, data: any) => {
    try {
        switch (type) {
            // --- Dyscalculia Support ---
            case ActivityType.NUMBER_SENSE: return <DyscalculiaSheets.NumberSenseSheet data={data} />;
            case ActivityType.ARITHMETIC_FLUENCY:
            case ActivityType.VISUAL_ARITHMETIC:
            case ActivityType.NUMBER_GROUPING:
                return <DyscalculiaSheets.VisualArithmeticSheet data={data} />;
            case ActivityType.SPATIAL_REASONING:
            case ActivityType.SPATIAL_AWARENESS_DISCOVERY:
            case ActivityType.POSITIONAL_CONCEPTS:
            case ActivityType.DIRECTIONAL_CONCEPTS:
                return <DyscalculiaSheets.SpatialGridSheet data={data} />;
            case ActivityType.MATH_LANGUAGE:
            case ActivityType.TIME_MEASUREMENT_GEOMETRY:
            case ActivityType.FRACTIONS_DECIMALS:
                return <DyscalculiaSheets.ConceptMatchSheet data={data} />;
            case ActivityType.ESTIMATION_SKILLS:
                return <DyscalculiaSheets.EstimationSheet data={data} />;
            case ActivityType.VISUAL_NUMBER_REPRESENTATION:
                return <DyscalculiaSheets.NumberSenseSheet data={data} />; // Reuse logic
            case ActivityType.PROBLEM_SOLVING_STRATEGIES:
            case ActivityType.APPLIED_MATH_STORY:
                return MathLogicSheets.RealLifeMathProblemsSheet ? <MathLogicSheets.RealLifeMathProblemsSheet data={data} /> : <div>Component Not Found</div>;
            case ActivityType.VISUAL_DISCRIMINATION_MATH:
                return <VisualSheets.VisualOddOneOutSheet data={data} />;

            // --- Dyslexia Support ---
            case ActivityType.READING_FLOW: return <DyslexiaSheets.ReadingFlowSheet data={data} />;
            case ActivityType.LETTER_DISCRIMINATION: return <DyslexiaSheets.LetterDiscriminationSheet data={data} />;
            case ActivityType.RAPID_NAMING: return <DyslexiaSheets.RapidNamingSheet data={data} />;
            case ActivityType.PHONOLOGICAL_AWARENESS: return <DyslexiaSheets.PhonologicalAwarenessSheet data={data} />;
            case ActivityType.MIRROR_LETTERS: return <DyslexiaSheets.MirrorLettersSheet data={data} />;
            case ActivityType.SYLLABLE_TRAIN: return <DyslexiaSheets.SyllableTrainSheet data={data} />;
            case ActivityType.VISUAL_TRACKING_LINES: return <DyslexiaSheets.VisualTrackingLinesSheet data={data} />;
            case ActivityType.BACKWARD_SPELLING: return <DyslexiaSheets.BackwardSpellingSheet data={data} />;

            // --- Word Games ---
            case ActivityType.WORD_SEARCH: return <WordGameSheets.WordSearchSheet data={data} />;
            case ActivityType.THEMATIC_WORD_SEARCH_COLOR: return <WordGameSheets.WordSearchSheet data={data} />;
            case ActivityType.WORD_SEARCH_WITH_PASSWORD: return <WordGameSheets.WordSearchWithPasswordSheet data={data} />;
            case ActivityType.SYNONYM_WORD_SEARCH: return <WordGameSheets.SynonymWordSearchSheet data={data} />;
            case ActivityType.LETTER_GRID_WORD_FIND: return <WordGameSheets.LetterGridWordFindSheet data={data} />;
            case ActivityType.SYLLABLE_WORD_SEARCH: return <WordGameSheets.SyllableWordSearchSheet data={data} />;
            case ActivityType.ANAGRAM: return <WordGameSheets.AnagramSheet data={data} />;
            case ActivityType.IMAGE_ANAGRAM_SORT: return <WordGameSheets.ImageAnagramSortSheet data={data} />;
            case ActivityType.ANAGRAM_IMAGE_MATCH: return <WordGameSheets.AnagramImageMatchSheet data={data} />;
            case ActivityType.POSITIONAL_ANAGRAM: return <WordGameSheets.PositionalAnagramSheet data={data} />;
            case ActivityType.CROSSWORD: return <WordGameSheets.CrosswordSheet data={data} />;
            case ActivityType.SPIRAL_PUZZLE: return <WordGameSheets.SpiralPuzzleSheet data={data} />;
            case ActivityType.PUNCTUATION_SPIRAL_PUZZLE: return <WordGameSheets.SpiralPuzzleSheet data={data} />;
            case ActivityType.WORD_LADDER: return <WordGameSheets.WordLadderSheet data={data} />;
            case ActivityType.SPELLING_CHECK: return <WordGameSheets.SpellingCheckSheet data={data} />;
            case ActivityType.REVERSE_WORD: return <WordGameSheets.ReverseWordSheet data={data} />;
            case ActivityType.LETTER_BRIDGE: return <WordGameSheets.LetterBridgeSheet data={data} />;
            case ActivityType.WORD_FORMATION: return <WordGameSheets.WordFormationSheet data={data} />;
            case ActivityType.JUMBLED_WORD_STORY: return <WordGameSheets.JumbledWordStorySheet data={data} />;
            case ActivityType.HOMONYM_SENTENCE_WRITING: return <WordGameSheets.HomonymSentenceSheet data={data} />;
            case ActivityType.MISSING_PARTS: return <WordGameSheets.MissingPartsSheet data={data} />;
            case ActivityType.SYLLABLE_COMPLETION: return <WordGameSheets.SyllableCompletionSheet data={data} />;
            case ActivityType.WORD_GROUPING: return <WordGameSheets.WordGroupingSheet data={data} />;
            case ActivityType.WORD_WEB: return <WordGameSheets.WordWebSheet data={data} />;
            case ActivityType.WORD_WEB_WITH_PASSWORD: return <WordGameSheets.WordWebWithPasswordSheet data={data} />;
            case ActivityType.WORD_PLACEMENT_PUZZLE: return <WordGameSheets.WordPlacementPuzzleSheet data={data} />;
            case ActivityType.WORD_GRID_PUZZLE: return <WordGameSheets.WordGridPuzzleSheet data={data} />;
            case ActivityType.MINI_WORD_GRID: return <WordGameSheets.MiniWordGridSheet data={data} />;
            case ActivityType.PASSWORD_FINDER: return <WordGameSheets.PasswordFinderSheet data={data} />;
            case ActivityType.HOMONYM_IMAGE_MATCH: return <WordGameSheets.HomonymImageMatchSheet data={data} />;
            case ActivityType.ANTONYM_FLOWER_PUZZLE: return <WordGameSheets.AntonymFlowerPuzzleSheet data={data} />;
            case ActivityType.SYNONYM_ANTONYM_GRID: return <WordGameSheets.SynonymAntonymGridSheet data={data} />;
            case ActivityType.ANTONYM_RESFEBE: return <WordGameSheets.ResfebeSheet data={data} />;
            case ActivityType.RESFEBE: return <WordGameSheets.ResfebeSheet data={data} />;
            case ActivityType.SYNONYM_SEARCH_STORY: return <WordGameSheets.SynonymSearchAndStorySheet data={data} />;
            case ActivityType.SYNONYM_MATCHING_PATTERN: return <WordGameSheets.SynonymMatchingPatternSheet data={data} />;

            // --- Reading ---
            case ActivityType.STORY_COMPREHENSION: return <ReadingSheets.StoryComprehensionSheet data={data} />;
            case ActivityType.STORY_ANALYSIS: return <ReadingSheets.StoryAnalysisSheet data={data} />;
            case ActivityType.STORY_SEQUENCING: return <ReadingSheets.StorySequencingSheet data={data} />;
            case ActivityType.WORDS_IN_STORY: return <ReadingSheets.WordsInStorySheet data={data} />;
            case ActivityType.STORY_CREATION_PROMPT: return <ReadingSheets.StoryCreationPromptSheet data={data} />;
            case ActivityType.PROVERB_FILL_IN_THE_BLANK: return <ReadingSheets.ProverbFillSheet data={data} />;
            case ActivityType.PROVERB_SAYING_SORT: return <ReadingSheets.ProverbSayingSortSheet data={data} />;
            case ActivityType.PROVERB_WORD_CHAIN: return <ReadingSheets.ProverbWordChainSheet data={data} />;
            case ActivityType.PROVERB_SEARCH: return <ReadingSheets.ProverbSearchSheet data={data} />;

            // --- Memory & Attention ---
            case ActivityType.WORD_MEMORY: return <MemorySheets.WordMemorySheet data={data} />;
            case ActivityType.VISUAL_MEMORY: return <MemorySheets.VisualMemorySheet data={data} />;
            case ActivityType.NUMBER_SEARCH: return <MemorySheets.NumberSearchSheet data={data} />;
            case ActivityType.FIND_THE_DUPLICATE_IN_ROW: return <MemorySheets.FindDuplicateSheet data={data} />;
            case ActivityType.LETTER_GRID_TEST: return <MemorySheets.LetterGridTestSheet data={data} />;
            case ActivityType.BURDON_TEST: return <MemorySheets.BurdonTestSheet data={data} />;
            case ActivityType.FIND_LETTER_PAIR: return <MemorySheets.FindLetterPairSheet data={data} />;
            case ActivityType.TARGET_SEARCH: return <MemorySheets.TargetSearchSheet data={data} />;
            case ActivityType.COLOR_WHEEL_MEMORY: return <MemorySheets.ColorWheelSheet data={data} />;
            case ActivityType.IMAGE_COMPREHENSION: return <MemorySheets.ImageComprehensionSheet data={data} />;
            case ActivityType.CHARACTER_MEMORY: return <MemorySheets.CharacterMemorySheet data={data} />;
            case ActivityType.STROOP_TEST: return <MemorySheets.StroopTestSheet data={data} />;
            case ActivityType.CHAOTIC_NUMBER_SEARCH: return <MemorySheets.ChaoticNumberSearchSheet data={data} />;

            // --- Math & Logic ---
            case ActivityType.BASIC_OPERATIONS: return <MathLogicSheets.BasicOperationsSheet data={data} />;
            case ActivityType.REAL_LIFE_MATH_PROBLEMS: return <MathLogicSheets.RealLifeMathProblemsSheet data={data} />;
            case ActivityType.MATH_PUZZLE: return <MathLogicSheets.MathPuzzleSheet data={data} />;
            case ActivityType.NUMBER_PATTERN: return <MathLogicSheets.NumberPatternSheet data={data} />;
            case ActivityType.FUTOSHIKI: return <MathLogicSheets.FutoshikiSheet data={data} />;
            case ActivityType.NUMBER_PYRAMID: return <MathLogicSheets.NumberPyramidSheet data={data} />;
            case ActivityType.NUMBER_CAPSULE: return <MathLogicSheets.NumberCapsuleSheet data={data} />;
            case ActivityType.ODD_EVEN_SUDOKU: return <MathLogicSheets.OddEvenSudokuSheet data={data} />;
            case ActivityType.ROMAN_NUMERAL_STAR_HUNT: return <MathLogicSheets.RomanNumeralStarHuntSheet data={data} />;
            case ActivityType.ROUNDING_CONNECT: return <MathLogicSheets.RoundingConnectSheet data={data} />;
            case ActivityType.ARITHMETIC_CONNECT: return <MathLogicSheets.RoundingConnectSheet data={data} />;
            case ActivityType.ROMAN_NUMERAL_MULTIPLICATION: return <MathLogicSheets.RomanNumeralMultiplicationSheet data={data} />;
            case ActivityType.KENDOKU: return <MathLogicSheets.KendokuSheet data={data} />;
            case ActivityType.OPERATION_SQUARE_FILL_IN: return <MathLogicSheets.OperationSquareSheet data={data} />;
            case ActivityType.MULTIPLICATION_WHEEL: return <MathLogicSheets.MultiplicationWheelSheet data={data} />;
            case ActivityType.TARGET_NUMBER: return <MathLogicSheets.TargetNumberSheet data={data} />;
            case ActivityType.SHAPE_SUDOKU: return <MathLogicSheets.ShapeSudokuSheet data={data} />;
            case ActivityType.VISUAL_NUMBER_PATTERN: return <MathLogicSheets.VisualNumberPatternSheet data={data} />;
            case ActivityType.LOGIC_GRID_PUZZLE: return <MathLogicSheets.LogicGridPuzzleSheet data={data} />;
            case ActivityType.ODD_ONE_OUT: return <MathLogicSheets.OddOneOutSheet data={data} />;
            case ActivityType.THEMATIC_ODD_ONE_OUT: return <MathLogicSheets.ThematicOddOneOutSheet data={data} />;
            case ActivityType.THEMATIC_ODD_ONE_OUT_SENTENCE: return <MathLogicSheets.ThematicOddOneOutSentenceSheet data={data} />;
            case ActivityType.COLUMN_ODD_ONE_OUT_SENTENCE: return <MathLogicSheets.ColumnOddOneOutSentenceSheet data={data} />;
            case ActivityType.PUNCTUATION_MAZE: return <MathLogicSheets.PunctuationMazeSheet data={data} />;
            case ActivityType.PUNCTUATION_PHONE_NUMBER: return <MathLogicSheets.PunctuationPhoneNumberSheet data={data} />;
            case ActivityType.SHAPE_NUMBER_PATTERN: return <MathLogicSheets.ShapeNumberPatternSheet data={data} />;
            case ActivityType.SHAPE_COUNTING: return <MathLogicSheets.ShapeCountingSheet data={data} />;
            case ActivityType.ROMAN_NUMERAL_CONNECT: return <VisualSheets.AbcConnectSheet data={data} />;

            // --- Visual Perception ---
            case ActivityType.FIND_THE_DIFFERENCE: return <VisualSheets.FindTheDifferenceSheet data={data} />;
            case ActivityType.SHAPE_MATCHING: return <VisualSheets.ShapeMatchingSheet data={data} />;
            case ActivityType.FIND_IDENTICAL_WORD: return <VisualSheets.FindIdenticalWordSheet data={data} />;
            case ActivityType.GRID_DRAWING: return <VisualSheets.GridDrawingSheet data={data} />;
            case ActivityType.SYMBOL_CIPHER: return <VisualSheets.SymbolCipherSheet data={data} />;
            case ActivityType.BLOCK_PAINTING: return <VisualSheets.BlockPaintingSheet data={data} />;
            case ActivityType.VISUAL_ODD_ONE_OUT: return <VisualSheets.VisualOddOneOutSheet data={data} />;
            case ActivityType.SYMMETRY_DRAWING: return <VisualSheets.SymmetryDrawingSheet data={data} />;
            case ActivityType.FIND_DIFFERENT_STRING: return <VisualSheets.FindDifferentStringSheet data={data} />;
            case ActivityType.DOT_PAINTING: return <VisualSheets.DotPaintingSheet data={data} />;
            case ActivityType.ABC_CONNECT: return <VisualSheets.AbcConnectSheet data={data} />;
            case ActivityType.COORDINATE_CIPHER: return <VisualSheets.CoordinateCipherSheet data={data} />;
            case ActivityType.WORD_CONNECT: return <VisualSheets.WordConnectSheet data={data} />;
            case ActivityType.PROFESSION_CONNECT: return <VisualSheets.ProfessionConnectSheet data={data} />;
            case ActivityType.MATCHSTICK_SYMMETRY: return <VisualSheets.MatchstickSymmetrySheet data={data} />;
            case ActivityType.VISUAL_ODD_ONE_OUT_THEMED: return <VisualSheets.VisualOddOneOutThemedSheet data={data} />;
            case ActivityType.PUNCTUATION_COLORING: return <VisualSheets.PunctuationColoringSheet data={data} />;
            case ActivityType.SYNONYM_ANTONYM_COLORING: return <VisualSheets.SynonymAntonymColoringSheet data={data} />;
            case ActivityType.STAR_HUNT: return <VisualSheets.StarHuntSheet data={data} />;
            case ActivityType.WORD_COMPARISON: return <VisualSheets.WordComparisonSheet data={data} />;
            case ActivityType.ROMAN_ARABIC_MATCH_CONNECT: return <VisualSheets.AbcConnectSheet data={data} />;
            case ActivityType.WEIGHT_CONNECT: return <VisualSheets.AbcConnectSheet data={data} />;
            case ActivityType.LENGTH_CONNECT: return <VisualSheets.AbcConnectSheet data={data} />;

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
    } as CSSProperties;

    const containerStyle: CSSProperties = {
        display: 'grid',
        gridTemplateColumns: `repeat(${settings.columns}, 1fr)`,
        gap: `${settings.gap}px`,
    };

    return (
        <div className="flex flex-col gap-8 items-center w-full max-w-[210mm] mx-auto">
            {data.map((sheetData, index) => (
                <div 
                    key={index} 
                    className="worksheet-page bg-white shadow-lg print:shadow-none print:break-after-page w-full relative text-black aspect-[210/297] md:aspect-auto md:min-h-[297mm] overflow-hidden"
                    style={pageStyle}
                >
                    <div style={containerStyle}>
                        {renderSheet(activityType, sheetData)}
                    </div>

                    <div className="absolute bottom-4 right-6 text-[10px] text-zinc-400 font-bold uppercase tracking-widest print:block hidden opacity-50">
                        Bursa Disleksi AI
                    </div>
                </div>
            ))}
        </div>
    );
};

// Prevent re-renders unless data or settings strictly change
export default React.memo(Worksheet, (prevProps, nextProps) => {
    return prevProps.activityType === nextProps.activityType && 
           prevProps.data === nextProps.data && 
           JSON.stringify(prevProps.settings) === JSON.stringify(nextProps.settings);
});
