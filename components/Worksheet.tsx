
import React from 'react';
import { ActivityType, SingleWorksheetData, StyleSettings } from '../types';
import * as VisualSheets from './sheets/VisualPerceptionSheets';
import * as WordSheets from './sheets/WordGameSheets';
import * as MathSheets from './sheets/MathLogicSheets';
import * as MemorySheets from './sheets/MemoryAttentionSheets';
import * as ReadingSheets from './sheets/ReadingComprehensionSheets';
import * as DyslexiaSheets from './sheets/DyslexiaSupportSheets';
import * as DyscalculiaSheets from './sheets/DyscalculiaSheets';
import * as NewActivitySheets from './sheets/NewActivitySheets';

interface WorksheetProps {
    activityType: ActivityType | null;
    data: SingleWorksheetData[] | null;
    settings: StyleSettings;
}

const Worksheet: React.FC<WorksheetProps> = ({ activityType, data, settings }) => {
    if (!data || !activityType) return null;

    const renderSheet = (item: SingleWorksheetData, index: number) => {
        const props = { data: item as any, settings };
        const key = index;

        switch (activityType) {
            // Visual Perception
            case ActivityType.FIND_THE_DIFFERENCE: return <VisualSheets.FindTheDifferenceSheet {...props} key={key} />;
            case ActivityType.SHAPE_MATCHING: return <VisualSheets.ShapeMatchingSheet {...props} key={key} />;
            case ActivityType.WORD_COMPARISON: return <VisualSheets.WordComparisonSheet {...props} key={key} />;
            case ActivityType.FIND_IDENTICAL_WORD: return <VisualSheets.FindIdenticalWordSheet {...props} key={key} />;
            case ActivityType.GRID_DRAWING: return <VisualSheets.GridDrawingSheet {...props} key={key} />;
            case ActivityType.SYMBOL_CIPHER: return <VisualSheets.SymbolCipherSheet {...props} key={key} />;
            case ActivityType.BLOCK_PAINTING: return <VisualSheets.BlockPaintingSheet {...props} key={key} />;
            case ActivityType.VISUAL_ODD_ONE_OUT: return <VisualSheets.VisualOddOneOutSheet {...props} key={key} />;
            case ActivityType.SYMMETRY_DRAWING: return <VisualSheets.SymmetryDrawingSheet {...props} key={key} />;
            case ActivityType.FIND_DIFFERENT_STRING: return <VisualSheets.FindDifferentStringSheet {...props} key={key} />;
            case ActivityType.DOT_PAINTING: return <VisualSheets.DotPaintingSheet {...props} key={key} />;
            case ActivityType.ABC_CONNECT: return <VisualSheets.AbcConnectSheet {...props} key={key} />;
            case ActivityType.COORDINATE_CIPHER: return <VisualSheets.CoordinateCipherSheet {...props} key={key} />;
            case ActivityType.WORD_CONNECT: return <VisualSheets.WordConnectSheet {...props} key={key} />;
            case ActivityType.PROFESSION_CONNECT: return <VisualSheets.ProfessionConnectSheet {...props} key={key} />;
            case ActivityType.MATCHSTICK_SYMMETRY: return <VisualSheets.MatchstickSymmetrySheet {...props} key={key} />;
            case ActivityType.VISUAL_ODD_ONE_OUT_THEMED: return <VisualSheets.VisualOddOneOutThemedSheet {...props} key={key} />;
            case ActivityType.PUNCTUATION_COLORING: return <VisualSheets.PunctuationColoringSheet {...props} key={key} />;
            case ActivityType.SYNONYM_ANTONYM_COLORING: return <VisualSheets.SynonymAntonymColoringSheet {...props} key={key} />;
            case ActivityType.STAR_HUNT: return <VisualSheets.StarHuntSheet {...props} key={key} />;
            case ActivityType.SHAPE_COUNTING: return <VisualSheets.ShapeCountingSheet {...props} key={key} />;

            // Word Games
            case ActivityType.WORD_SEARCH: return <WordSheets.WordSearchSheet {...props} key={key} />;
            case ActivityType.ANAGRAM: return <WordSheets.AnagramSheet {...props} key={key} />;
            case ActivityType.SPELLING_CHECK: return <WordSheets.SpellingCheckSheet {...props} key={key} />;
            case ActivityType.LETTER_BRIDGE: return <WordSheets.LetterBridgeSheet {...props} key={key} />;
            case ActivityType.WORD_LADDER: return <WordSheets.WordLadderSheet {...props} key={key} />;
            case ActivityType.WORD_FORMATION: return <WordSheets.WordFormationSheet {...props} key={key} />;
            case ActivityType.REVERSE_WORD: return <WordSheets.ReverseWordSheet {...props} key={key} />;
            case ActivityType.WORD_GROUPING: return <WordSheets.WordGroupingSheet {...props} key={key} />;
            case ActivityType.MINI_WORD_GRID: return <WordSheets.MiniWordGridSheet {...props} key={key} />;
            case ActivityType.PASSWORD_FINDER: return <WordSheets.PasswordFinderSheet {...props} key={key} />;
            case ActivityType.SYLLABLE_COMPLETION: return <WordSheets.SyllableCompletionSheet {...props} key={key} />;
            case ActivityType.SYNONYM_WORD_SEARCH: return <WordSheets.SynonymWordSearchSheet {...props} key={key} />;
            case ActivityType.SPIRAL_PUZZLE: return <WordSheets.SpiralPuzzleSheet {...props} key={key} />;
            case ActivityType.CROSSWORD: return <WordSheets.CrosswordSheet {...props} key={key} />;
            case ActivityType.JUMBLED_WORD_STORY: return <WordSheets.JumbledWordStorySheet {...props} key={key} />;
            case ActivityType.HOMONYM_SENTENCE_WRITING: return <WordSheets.HomonymSentenceSheet {...props} key={key} />;
            case ActivityType.WORD_GRID_PUZZLE: return <WordSheets.WordGridPuzzleSheet {...props} key={key} />;
            case ActivityType.HOMONYM_IMAGE_MATCH: return <WordSheets.HomonymImageMatchSheet {...props} key={key} />;
            case ActivityType.ANTONYM_FLOWER_PUZZLE: return <WordSheets.AntonymFlowerPuzzleSheet {...props} key={key} />;
            case ActivityType.SYNONYM_ANTONYM_GRID: return <WordSheets.SynonymAntonymGridSheet {...props} key={key} />;
            case ActivityType.ANTONYM_RESFEBE: return <WordSheets.AntonymResfebeSheet {...props} key={key} />;
            case ActivityType.THEMATIC_WORD_SEARCH_COLOR: return <WordSheets.WordSearchSheet {...props} key={key} />;
            case ActivityType.SYNONYM_SEARCH_STORY: return <WordSheets.SynonymSearchAndStorySheet {...props} key={key} />;
            case ActivityType.PUNCTUATION_SPIRAL_PUZZLE: return <WordSheets.SpiralPuzzleSheet {...props} key={key} />;
            case ActivityType.SYNONYM_MATCHING_PATTERN: return <WordSheets.SynonymMatchingPatternSheet {...props} key={key} />;
            case ActivityType.MISSING_PARTS: return <WordSheets.MissingPartsSheet {...props} key={key} />;
            case ActivityType.WORD_WEB: return <WordSheets.WordWebSheet {...props} key={key} />;
            case ActivityType.SYLLABLE_WORD_SEARCH: return <WordSheets.SyllableWordSearchSheet {...props} key={key} />;
            case ActivityType.WORD_SEARCH_WITH_PASSWORD: return <WordSheets.WordSearchWithPasswordSheet {...props} key={key} />;
            case ActivityType.WORD_WEB_WITH_PASSWORD: return <WordSheets.WordWebWithPasswordSheet {...props} key={key} />;
            case ActivityType.LETTER_GRID_WORD_FIND: return <WordSheets.LetterGridWordFindSheet {...props} key={key} />;
            case ActivityType.WORD_PLACEMENT_PUZZLE: return <WordSheets.WordPlacementPuzzleSheet {...props} key={key} />;
            case ActivityType.POSITIONAL_ANAGRAM: return <WordSheets.PositionalAnagramSheet {...props} key={key} />;
            case ActivityType.IMAGE_ANAGRAM_SORT: return <WordSheets.ImageAnagramSortSheet {...props} key={key} />;
            case ActivityType.ANAGRAM_IMAGE_MATCH: return <WordSheets.AnagramImageMatchSheet {...props} key={key} />;
            case ActivityType.RESFEBE: return <WordSheets.ResfebeSheet {...props} key={key} />;

            // Math & Logic
            case ActivityType.MATH_PUZZLE: return <MathSheets.MathPuzzleSheet {...props} key={key} />;
            case ActivityType.NUMBER_PATTERN: return <MathSheets.NumberPatternSheet {...props} key={key} />;
            case ActivityType.ODD_ONE_OUT: return <MathSheets.OddOneOutSheet {...props} key={key} />;
            case ActivityType.FUTOSHIKI: return <MathSheets.FutoshikiSheet {...props} key={key} />;
            case ActivityType.NUMBER_PYRAMID: return <MathSheets.NumberPyramidSheet {...props} key={key} />;
            case ActivityType.NUMBER_CAPSULE: return <MathSheets.NumberCapsuleSheet {...props} key={key} />;
            case ActivityType.ODD_EVEN_SUDOKU: return <MathSheets.OddEvenSudokuSheet {...props} key={key} />;
            case ActivityType.ROMAN_NUMERAL_STAR_HUNT: return <MathSheets.RomanNumeralStarHuntSheet {...props} key={key} />;
            case ActivityType.ROUNDING_CONNECT: return <MathSheets.RoundingConnectSheet {...props} key={key} />;
            case ActivityType.ARITHMETIC_CONNECT: return <MathSheets.RoundingConnectSheet {...props} key={key} />; // Same component
            case ActivityType.ROMAN_NUMERAL_MULTIPLICATION: return <MathSheets.RomanNumeralMultiplicationSheet {...props} key={key} />;
            case ActivityType.KENDOKU: return <MathSheets.KendokuSheet {...props} key={key} />;
            case ActivityType.OPERATION_SQUARE_FILL_IN: return <MathSheets.OperationSquareSheet {...props} key={key} />;
            case ActivityType.MULTIPLICATION_WHEEL: return <MathSheets.MultiplicationWheelSheet {...props} key={key} />;
            case ActivityType.TARGET_NUMBER: return <MathSheets.TargetNumberSheet {...props} key={key} />;
            case ActivityType.SHAPE_SUDOKU: return <MathSheets.ShapeSudokuSheet {...props} key={key} />;
            case ActivityType.VISUAL_NUMBER_PATTERN: return <MathSheets.VisualNumberPatternSheet {...props} key={key} />;
            case ActivityType.LOGIC_GRID_PUZZLE: return <MathSheets.LogicGridPuzzleSheet {...props} key={key} />;
            case ActivityType.ROMAN_NUMERAL_CONNECT: return <VisualSheets.RomanNumeralConnectSheet {...props} key={key} />;
            case ActivityType.ROMAN_ARABIC_MATCH_CONNECT: return <VisualSheets.AbcConnectSheet {...props} key={key} />;
            case ActivityType.WEIGHT_CONNECT: return <VisualSheets.AbcConnectSheet {...props} key={key} />;
            case ActivityType.LENGTH_CONNECT: return <VisualSheets.AbcConnectSheet {...props} key={key} />;
            case ActivityType.SHAPE_NUMBER_PATTERN: return <MathSheets.ShapeNumberPatternSheet {...props} key={key} />;
            case ActivityType.THEMATIC_ODD_ONE_OUT: return <MathSheets.ThematicOddOneOutSheet {...props} key={key} />;
            case ActivityType.THEMATIC_ODD_ONE_OUT_SENTENCE: return <MathSheets.ThematicOddOneOutSentenceSheet {...props} key={key} />;
            case ActivityType.COLUMN_ODD_ONE_OUT_SENTENCE: return <MathSheets.ColumnOddOneOutSentenceSheet {...props} key={key} />;
            case ActivityType.PUNCTUATION_MAZE: return <MathSheets.PunctuationMazeSheet {...props} key={key} />;
            case ActivityType.PUNCTUATION_PHONE_NUMBER: return <MathSheets.PunctuationPhoneNumberSheet {...props} key={key} />;
            case ActivityType.BASIC_OPERATIONS: return <MathSheets.BasicOperationsSheet {...props} key={key} />;
            case ActivityType.REAL_LIFE_MATH_PROBLEMS: return <MathSheets.RealLifeMathProblemsSheet {...props} key={key} />;

            // Memory & Attention
            case ActivityType.WORD_MEMORY: return <MemorySheets.WordMemorySheet {...props} key={key} />;
            case ActivityType.VISUAL_MEMORY: return <MemorySheets.VisualMemorySheet {...props} key={key} />;
            case ActivityType.NUMBER_SEARCH: return <MemorySheets.NumberSearchSheet {...props} key={key} />;
            case ActivityType.FIND_THE_DUPLICATE_IN_ROW: return <MemorySheets.FindDuplicateSheet {...props} key={key} />;
            case ActivityType.LETTER_GRID_TEST: return <MemorySheets.LetterGridTestSheet {...props} key={key} />;
            case ActivityType.FIND_LETTER_PAIR: return <MemorySheets.FindLetterPairSheet {...props} key={key} />;
            case ActivityType.TARGET_SEARCH: return <MemorySheets.TargetSearchSheet {...props} key={key} />;
            case ActivityType.COLOR_WHEEL_MEMORY: return <MemorySheets.ColorWheelSheet {...props} key={key} />;
            case ActivityType.IMAGE_COMPREHENSION: return <MemorySheets.ImageComprehensionSheet {...props} key={key} />;
            case ActivityType.CHARACTER_MEMORY: return <MemorySheets.CharacterMemorySheet {...props} key={key} />;
            case ActivityType.STROOP_TEST: return <MemorySheets.StroopTestSheet {...props} key={key} />;
            case ActivityType.CHAOTIC_NUMBER_SEARCH: return <MemorySheets.ChaoticNumberSearchSheet {...props} key={key} />;
            case ActivityType.BURDON_TEST: return <MemorySheets.BurdonTestSheet {...props} key={key} />;

            // Reading Comprehension
            case ActivityType.STORY_COMPREHENSION: return <ReadingSheets.StoryComprehensionSheet {...props} key={key} />;
            case ActivityType.STORY_CREATION_PROMPT: return <ReadingSheets.StoryCreationPromptSheet {...props} key={key} />;
            case ActivityType.WORDS_IN_STORY: return <ReadingSheets.WordsInStorySheet {...props} key={key} />;
            case ActivityType.STORY_ANALYSIS: return <ReadingSheets.StoryAnalysisSheet {...props} key={key} />;
            case ActivityType.STORY_SEQUENCING: return <ReadingSheets.StorySequencingSheet {...props} key={key} />;
            case ActivityType.PROVERB_FILL_IN_THE_BLANK: return <ReadingSheets.ProverbFillSheet {...props} key={key} />;
            case ActivityType.PROVERB_SAYING_SORT: return <ReadingSheets.ProverbSayingSortSheet {...props} key={key} />;
            case ActivityType.PROVERB_WORD_CHAIN: return <ReadingSheets.ProverbWordChainSheet {...props} key={key} />;
            case ActivityType.PROVERB_SENTENCE_FINDER: return <ReadingSheets.ProverbWordChainSheet {...props} key={key} />;
            case ActivityType.PROVERB_SEARCH: return <ReadingSheets.ProverbSearchSheet {...props} key={key} />;

            // Dyscalculia Support
            case ActivityType.NUMBER_SENSE: return <DyscalculiaSheets.NumberSenseSheet {...props} key={key} />;
            case ActivityType.ARITHMETIC_FLUENCY: return <DyscalculiaSheets.VisualArithmeticSheet {...props} key={key} />;
            case ActivityType.NUMBER_GROUPING: return <DyscalculiaSheets.VisualArithmeticSheet {...props} key={key} />;
            case ActivityType.PROBLEM_SOLVING_STRATEGIES: return <MathSheets.RealLifeMathProblemsSheet {...props} key={key} />;
            case ActivityType.MATH_LANGUAGE: return <DyscalculiaSheets.ConceptMatchSheet {...props} key={key} />;
            case ActivityType.TIME_MEASUREMENT_GEOMETRY: return <DyscalculiaSheets.ConceptMatchSheet {...props} key={key} />;
            case ActivityType.SPATIAL_REASONING: return <DyscalculiaSheets.SpatialGridSheet {...props} key={key} />;
            case ActivityType.ESTIMATION_SKILLS: return <DyscalculiaSheets.EstimationSheet {...props} key={key} />;
            case ActivityType.FRACTIONS_DECIMALS: return <DyscalculiaSheets.ConceptMatchSheet {...props} key={key} />;
            case ActivityType.VISUAL_NUMBER_REPRESENTATION: return <DyscalculiaSheets.NumberSenseSheet {...props} key={key} />;
            case ActivityType.VISUAL_ARITHMETIC: return <DyscalculiaSheets.VisualArithmeticSheet {...props} key={key} />;
            case ActivityType.APPLIED_MATH_STORY: return <MathSheets.RealLifeMathProblemsSheet {...props} key={key} />;
            case ActivityType.SPATIAL_AWARENESS_DISCOVERY: return <DyscalculiaSheets.SpatialGridSheet {...props} key={key} />;
            case ActivityType.POSITIONAL_CONCEPTS: return <DyscalculiaSheets.SpatialGridSheet {...props} key={key} />;
            case ActivityType.DIRECTIONAL_CONCEPTS: return <DyscalculiaSheets.SpatialGridSheet {...props} key={key} />;
            case ActivityType.VISUAL_DISCRIMINATION_MATH: return <VisualSheets.VisualOddOneOutSheet {...props} key={key} />;

            // New Activities
            case ActivityType.FAMILY_RELATIONS: return <NewActivitySheets.FamilyRelationsSheet {...props} key={key} />;
            case ActivityType.LOGIC_DEDUCTION: return <NewActivitySheets.LogicDeductionSheet {...props} key={key} />;
            case ActivityType.NUMBER_BOX_LOGIC: return <NewActivitySheets.NumberBoxLogicSheet {...props} key={key} />;
            case ActivityType.MAP_INSTRUCTION: return <NewActivitySheets.MapInstructionSheet {...props} key={key} />;
            case ActivityType.MIND_GAMES: return <NewActivitySheets.MindGamesSheet {...props} key={key} />;
            case ActivityType.MIND_GAMES_56: return <NewActivitySheets.MindGames56Sheet {...props} key={key} />; 

            // Dyslexia Support
            case ActivityType.READING_FLOW: return <DyslexiaSheets.ReadingFlowSheet {...props} key={key} />;
            case ActivityType.LETTER_DISCRIMINATION: return <DyslexiaSheets.LetterDiscriminationSheet {...props} key={key} />;
            case ActivityType.RAPID_NAMING: return <DyslexiaSheets.RapidNamingSheet {...props} key={key} />;
            case ActivityType.PHONOLOGICAL_AWARENESS: return <DyslexiaSheets.PhonologicalAwarenessSheet {...props} key={key} />;
            case ActivityType.MIRROR_LETTERS: return <DyslexiaSheets.MirrorLettersSheet {...props} key={key} />;
            case ActivityType.SYLLABLE_TRAIN: return <DyslexiaSheets.SyllableTrainSheet {...props} key={key} />;
            case ActivityType.VISUAL_TRACKING_LINES: return <DyslexiaSheets.VisualTrackingLinesSheet {...props} key={key} />;
            case ActivityType.BACKWARD_SPELLING: return <DyslexiaSheets.BackwardSpellingSheet {...props} key={key} />;
            case ActivityType.CODE_READING: return <DyslexiaSheets.CodeReadingSheet {...props} key={key} />;
            case ActivityType.ATTENTION_TO_QUESTION: return <DyslexiaSheets.AttentionToQuestionSheet {...props} key={key} />;
            case ActivityType.ATTENTION_DEVELOPMENT: return <DyslexiaSheets.AttentionDevelopmentSheet {...props} key={key} />;
            case ActivityType.ATTENTION_FOCUS: return <DyslexiaSheets.AttentionFocusSheet {...props} key={key} />;
            case ActivityType.IMAGE_INTERPRETATION_TF: return <DyslexiaSheets.ImageInterpretationTFSheet {...props} key={key} />;
            case ActivityType.HEART_OF_SKY: return <DyslexiaSheets.HeartOfSkySheet {...props} key={key} />;

            default:
                return (
                    <div key={key} className="p-8 text-center border-2 border-dashed border-zinc-300 rounded-lg">
                        <p className="text-zinc-500">Bu etkinlik türü için henüz görünüm bileşeni hazırlanmadı: <strong>{activityType}</strong></p>
                        <pre className="text-left bg-gray-100 p-2 mt-4 text-xs overflow-auto">{JSON.stringify(item, null, 2)}</pre>
                    </div>
                );
        }
    };

    return (
        <div className={`worksheet-container grid gap-8 ${settings.columns > 1 ? 'grid-cols-1 md:grid-cols-' + settings.columns : 'grid-cols-1'}`} style={{ gap: `${settings.gap}px`, margin: `${settings.margin}px`, '--worksheet-font-size': `${settings.fontSize}px`, '--worksheet-border-color': settings.borderColor, '--worksheet-border-width': `${settings.borderWidth}px` } as React.CSSProperties}>
            {data.map((item, index) => (
                <div key={index} className="worksheet-page break-after-page print:break-after-page bg-white dark:bg-zinc-800/20 p-4 rounded-xl print:p-0 print:bg-transparent print:shadow-none">
                    {renderSheet(item, index)}
                    
                    {/* Common footer for print */}
                    <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center text-xs text-zinc-400 print:flex hidden">
                        <span>Bursa Disleksi Derneği</span>
                        <span>{new Date().toLocaleDateString('tr-TR')}</span>
                        <span>Sayfa {index + 1} / {data.length}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Worksheet;
