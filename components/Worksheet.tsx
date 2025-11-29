
import React from 'react';
import { ActivityType, WorksheetData, SingleWorksheetData, StyleSettings } from '../types';
import * as MathLogicSheets from './sheets/MathLogicSheets';
import * as MemoryAttentionSheets from './sheets/MemoryAttentionSheets';
import * as VisualPerceptionSheets from './sheets/VisualPerceptionSheets';
import * as WordGameSheets from './sheets/WordGameSheets';
import * as ReadingComprehensionSheets from './sheets/ReadingComprehensionSheets';
import * as DyslexiaSheets from './sheets/DyslexiaSupportSheets';
import * as DyscalculiaSheets from './sheets/DyscalculiaSheets';
import * as NewActivitySheets from './sheets/NewActivitySheets';
import { getBorderCSS } from './VisualAssets';

interface WorksheetProps {
    activityType: ActivityType | null;
    data: WorksheetData;
    settings: StyleSettings;
}

const Worksheet: React.FC<WorksheetProps> = ({ activityType, data, settings }) => {
    if (!data || !activityType || data.length === 0) return null;

    const isMultiItem = data.length > 1;
    const outerCols = isMultiItem ? settings.columns : 1;
    const innerCols = isMultiItem ? 1 : settings.columns;
    const isLandscape = settings.orientation === 'landscape';

    const containerStyle = {
        '--worksheet-font-size': `${settings.fontSize}px`,
        '--worksheet-border-color': settings.borderColor, // Usually black/gray for print
        '--worksheet-border-width': `${settings.borderWidth}px`,
        '--worksheet-margin': `${settings.margin}px`,
        '--worksheet-gap': `${settings.gap}px`,
        '--dynamic-cols': innerCols,
        '--show-pedagogical-note': settings.showPedagogicalNote ? 'flex' : 'none',
        '--show-mascot': settings.showMascot ? 'block' : 'none',
        // Dynamic Print Variables for index.html to pick up if used via inline styles
        '--print-width': isLandscape ? '297mm' : '210mm',
        '--print-height': isLandscape ? '210mm' : '297mm'
    } as React.CSSProperties;

    // Style for scaling the content inside the page (Screen only)
    const scalerStyle: React.CSSProperties = {
        transform: `scale(${settings.scale})`,
        transformOrigin: 'top center',
        width: `${100 / settings.scale}%`, 
        marginBottom: `${(1 - settings.scale) * 100}%`
    };

    const outerGridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${outerCols}, 1fr)`,
        gap: `${settings.gap}px`,
        width: '100%'
    };

    const borderStyle = getBorderCSS(settings.themeBorder || 'simple');

    return (
        <div className="w-full flex flex-col items-center bg-transparent" style={containerStyle}>
            {/* Inject dynamic print styles for page size and flow control */}
            <style>{`
                @media print {
                    @page { 
                        size: ${settings.orientation}; 
                        margin: 10mm; /* Small print margin for printer safety */
                    }
                    body, html {
                        height: auto !important;
                        overflow: visible !important;
                        background: white !important;
                    }
                    /* Reset scaling for print to ensure natural flow */
                    .worksheet-scaler {
                        transform: none !important;
                        width: 100% !important;
                        margin-bottom: 0 !important;
                    }
                    /* Allow the container to expand infinitely */
                    .worksheet-page {
                        height: auto !important;
                        min-height: 0 !important;
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        overflow: visible !important;
                        display: block !important;
                    }
                    /* Ensure grid items don't break awkwardly */
                    .break-inside-avoid {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                    
                    /* Convert Grid to Block for multi-page flow */
                    .outer-grid {
                        display: block !important;
                    }
                    
                    /* Force new page for each item in the list (except last) */
                    .worksheet-item {
                        page-break-after: always !important;
                        break-after: page !important;
                        margin-bottom: 0 !important;
                        padding-bottom: 0 !important;
                        border-bottom: none !important;
                    }
                    .worksheet-item:last-child {
                        page-break-after: auto !important;
                        break-after: auto !important;
                    }

                    /* Hide UI elements */
                    .no-print { display: none !important; }
                }
            `}</style>

            <div 
                className="worksheet-page bg-white text-black shadow-2xl print:shadow-none transition-all duration-300 relative"
                style={{ 
                    width: isLandscape ? '297mm' : '210mm',
                    minHeight: isLandscape ? '210mm' : '297mm',
                    height: 'auto',
                    padding: `var(--worksheet-margin)`,
                    fontSize: `var(--worksheet-font-size)`,
                    ...borderStyle
                }}
            >
                <div className="flex flex-col h-full relative z-10">
                    {/* Scaler Wrapper */}
                    <div className="flex-1 w-full worksheet-scaler" style={scalerStyle}>
                        
                        <div className="outer-grid" style={outerGridStyle}>
                            {data.map((sheetData, index) => (
                                <div key={index} className="worksheet-item break-inside-avoid border-b-2 border-transparent pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                                    <RenderSheet activityType={activityType} data={sheetData} />
                                </div>
                            ))}
                        </div>

                    </div>
                    
                    <div className="mt-8 pt-4 border-t-2 border-zinc-200 w-full flex justify-between items-center text-[10px] opacity-50 break-before-avoid text-black print:mt-4">
                        <span className="font-bold uppercase tracking-widest">Bursa Disleksi AI</span>
                        <span>{new Date().toLocaleDateString('tr-TR')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RenderSheet = ({ activityType, data }: { activityType: ActivityType, data: SingleWorksheetData }) => {
    const props = { data: data as any };

    switch (activityType) {
        // --- Dyslexia Support ---
        case ActivityType.READING_FLOW: return <DyslexiaSheets.ReadingFlowSheet {...props} />;
        case ActivityType.LETTER_DISCRIMINATION: return <DyslexiaSheets.LetterDiscriminationSheet {...props} />;
        case ActivityType.RAPID_NAMING: return <DyslexiaSheets.RapidNamingSheet {...props} />;
        case ActivityType.PHONOLOGICAL_AWARENESS: return <DyslexiaSheets.PhonologicalAwarenessSheet {...props} />;
        case ActivityType.MIRROR_LETTERS: return <DyslexiaSheets.MirrorLettersSheet {...props} />;
        case ActivityType.SYLLABLE_TRAIN: return <DyslexiaSheets.SyllableTrainSheet {...props} />;
        case ActivityType.VISUAL_TRACKING_LINES: return <DyslexiaSheets.VisualTrackingLinesSheet {...props} />;
        case ActivityType.BACKWARD_SPELLING: return <DyslexiaSheets.BackwardSpellingSheet {...props} />;
        case ActivityType.CODE_READING: return <DyslexiaSheets.CodeReadingSheet {...props} />;
        case ActivityType.ATTENTION_TO_QUESTION: return <DyslexiaSheets.AttentionToQuestionSheet {...props} />;
        case ActivityType.ATTENTION_DEVELOPMENT: return <DyslexiaSheets.AttentionDevelopmentSheet {...props} />;
        case ActivityType.ATTENTION_FOCUS: return <DyslexiaSheets.AttentionFocusSheet {...props} />;
        case ActivityType.MIND_GAMES: return <NewActivitySheets.MindGamesSheet {...props} />;
        case ActivityType.MIND_GAMES_56: return <NewActivitySheets.MindGames56Sheet {...props} />;

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
        case ActivityType.ROMAN_NUMERAL_CONNECT: return <VisualPerceptionSheets.RomanNumeralConnectSheet {...props} />;
        case ActivityType.ROUNDING_CONNECT: return <MathLogicSheets.RoundingConnectSheet {...props} />;
        case ActivityType.ARITHMETIC_CONNECT: return <MathLogicSheets.RoundingConnectSheet {...props} />; // Reusing RoundingConnectSheet logic
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

        // --- Visual Perception ---
        case ActivityType.FIND_THE_DIFFERENCE: return <VisualPerceptionSheets.FindTheDifferenceSheet {...props} />;
        case ActivityType.WORD_COMPARISON: return <VisualPerceptionSheets.WordComparisonSheet {...props} />;
        case ActivityType.SHAPE_MATCHING: return <VisualPerceptionSheets.ShapeMatchingSheet {...props} />;
        case ActivityType.FIND_IDENTICAL_WORD: return <VisualPerceptionSheets.FindIdenticalWordSheet {...props} />;
        case ActivityType.GRID_DRAWING: return <VisualPerceptionSheets.GridDrawingSheet {...props} />;
        case ActivityType.SYMBOL_CIPHER: return <VisualPerceptionSheets.SymbolCipherSheet {...props} />;
        case ActivityType.BLOCK_PAINTING: return <VisualPerceptionSheets.BlockPaintingSheet {...props} />;
        case ActivityType.VISUAL_ODD_ONE_OUT: return <VisualPerceptionSheets.VisualOddOneOutSheet {...props} />;
        case ActivityType.SYMMETRY_DRAWING: return <VisualPerceptionSheets.SymmetryDrawingSheet {...props} />;
        case ActivityType.FIND_DIFFERENT_STRING: return <VisualPerceptionSheets.FindDifferentStringSheet {...props} />;
        case ActivityType.DOT_PAINTING: return <VisualPerceptionSheets.DotPaintingSheet {...props} />;
        case ActivityType.ABC_CONNECT: return <VisualPerceptionSheets.AbcConnectSheet {...props} />;
        case ActivityType.COORDINATE_CIPHER: return <VisualPerceptionSheets.CoordinateCipherSheet {...props} />;
        case ActivityType.WORD_CONNECT: return <VisualPerceptionSheets.WordConnectSheet {...props} />;
        case ActivityType.PROFESSION_CONNECT: return <VisualPerceptionSheets.ProfessionConnectSheet {...props} />;
        case ActivityType.MATCHSTICK_SYMMETRY: return <VisualPerceptionSheets.MatchstickSymmetrySheet {...props} />;
        case ActivityType.VISUAL_ODD_ONE_OUT_THEMED: return <VisualPerceptionSheets.VisualOddOneOutThemedSheet {...props} />;
        case ActivityType.STAR_HUNT: return <VisualPerceptionSheets.StarHuntSheet {...props} />;
        case ActivityType.ROMAN_ARABIC_MATCH_CONNECT: return <VisualPerceptionSheets.AbcConnectSheet {...props} />;
        case ActivityType.WEIGHT_CONNECT: return <VisualPerceptionSheets.AbcConnectSheet {...props} />;
        case ActivityType.LENGTH_CONNECT: return <VisualPerceptionSheets.AbcConnectSheet {...props} />;
        case ActivityType.PUNCTUATION_COLORING: return <VisualPerceptionSheets.PunctuationColoringSheet {...props} />;
        case ActivityType.SYNONYM_ANTONYM_COLORING: return <VisualPerceptionSheets.SynonymAntonymColoringSheet {...props} />;

        // --- Reading Comprehension ---
        case ActivityType.STORY_COMPREHENSION: return <ReadingComprehensionSheets.StoryComprehensionSheet {...props} />;
        case ActivityType.STORY_CREATION_PROMPT: return <ReadingComprehensionSheets.StoryCreationPromptSheet {...props} />;
        case ActivityType.WORDS_IN_STORY: return <ReadingComprehensionSheets.WordsInStorySheet {...props} />;
        case ActivityType.STORY_ANALYSIS: return <ReadingComprehensionSheets.StoryAnalysisSheet {...props} />;
        case ActivityType.PROVERB_FILL_IN_THE_BLANK: return <ReadingComprehensionSheets.ProverbFillSheet {...props} />;
        case ActivityType.STORY_SEQUENCING: return <ReadingComprehensionSheets.StorySequencingSheet {...props} />;
        case ActivityType.PROVERB_SAYING_SORT: return <ReadingComprehensionSheets.ProverbSayingSortSheet {...props} />;
        case ActivityType.PROVERB_WORD_CHAIN: return <ReadingComprehensionSheets.ProverbWordChainSheet {...props} />;
        case ActivityType.PROVERB_SEARCH: return <ReadingComprehensionSheets.ProverbSearchSheet {...props} />;

        // --- Word Games ---
        case ActivityType.WORD_SEARCH: return <WordGameSheets.WordSearchSheet {...props} />;
        case ActivityType.ANAGRAM: return <WordGameSheets.AnagramSheet {...props} />;
        case ActivityType.SPELLING_CHECK: return <WordGameSheets.SpellingCheckSheet {...props} />;
        case ActivityType.LETTER_BRIDGE: return <WordGameSheets.LetterBridgeSheet {...props} />;
        case ActivityType.WORD_LADDER: return <WordGameSheets.WordLadderSheet {...props} />;
        case ActivityType.WORD_FORMATION: return <WordGameSheets.WordFormationSheet {...props} />;
        case ActivityType.REVERSE_WORD: return <WordGameSheets.ReverseWordSheet {...props} />;
        case ActivityType.WORD_GROUPING: return <WordGameSheets.WordGroupingSheet {...props} />;
        case ActivityType.MINI_WORD_GRID: return <WordGameSheets.MiniWordGridSheet {...props} />;
        case ActivityType.PASSWORD_FINDER: return <WordGameSheets.PasswordFinderSheet {...props} />;
        case ActivityType.SYLLABLE_COMPLETION: return <WordGameSheets.SyllableCompletionSheet {...props} />;
        case ActivityType.SPIRAL_PUZZLE: return <WordGameSheets.SpiralPuzzleSheet {...props} />;
        case ActivityType.PUNCTUATION_SPIRAL_PUZZLE: return <WordGameSheets.SpiralPuzzleSheet {...props} />;
        case ActivityType.CROSSWORD: return <WordGameSheets.CrosswordSheet {...props} />;
        case ActivityType.JUMBLED_WORD_STORY: return <WordGameSheets.JumbledWordStorySheet {...props} />;
        case ActivityType.RESFEBE: return <WordGameSheets.ResfebeSheet {...props} />;
        case ActivityType.ANTONYM_RESFEBE: return <WordGameSheets.AntonymResfebeSheet {...props} />;
        case ActivityType.ANTONYM_FLOWER_PUZZLE: return <WordGameSheets.AntonymFlowerPuzzleSheet {...props} />;
        case ActivityType.WORD_GRID_PUZZLE: return <WordGameSheets.WordGridPuzzleSheet {...props} />;
        case ActivityType.HOMONYM_SENTENCE_WRITING: return <WordGameSheets.HomonymSentenceSheet {...props} />;
        case ActivityType.HOMONYM_IMAGE_MATCH: return <WordGameSheets.HomonymImageMatchSheet {...props} />;
        case ActivityType.SYNONYM_ANTONYM_GRID: return <WordGameSheets.SynonymAntonymGridSheet {...props} />;
        case ActivityType.SYNONYM_MATCHING_PATTERN: return <WordGameSheets.SynonymMatchingPatternSheet {...props} />;
        case ActivityType.MISSING_PARTS: return <WordGameSheets.MissingPartsSheet {...props} />;
        case ActivityType.WORD_WEB: return <WordGameSheets.WordWebSheet {...props} />;
        case ActivityType.SYLLABLE_WORD_SEARCH: return <WordGameSheets.SyllableWordSearchSheet {...props} />;
        case ActivityType.WORD_WEB_WITH_PASSWORD: return <WordGameSheets.WordWebWithPasswordSheet {...props} />;
        case ActivityType.WORD_PLACEMENT_PUZZLE: return <WordGameSheets.WordPlacementPuzzleSheet {...props} />;
        case ActivityType.POSITIONAL_ANAGRAM: return <WordGameSheets.PositionalAnagramSheet {...props} />;
        case ActivityType.IMAGE_ANAGRAM_SORT: return <WordGameSheets.ImageAnagramSortSheet {...props} />;
        case ActivityType.ANAGRAM_IMAGE_MATCH: return <WordGameSheets.AnagramImageMatchSheet {...props} />;
        case ActivityType.WORD_SEARCH_WITH_PASSWORD: return <WordGameSheets.WordSearchWithPasswordSheet {...props} />;
        case ActivityType.LETTER_GRID_WORD_FIND: return <WordGameSheets.LetterGridWordFindSheet {...props} />;
        case ActivityType.THEMATIC_WORD_SEARCH_COLOR: return <WordGameSheets.WordSearchSheet {...props} />;
        case ActivityType.SYNONYM_WORD_SEARCH: return <WordGameSheets.SynonymWordSearchSheet {...props} />;
        case ActivityType.SYNONYM_SEARCH_STORY: return <WordGameSheets.SynonymSearchAndStorySheet {...props} />;

        // --- Memory & Attention ---
        case ActivityType.WORD_MEMORY: return <MemoryAttentionSheets.WordMemorySheet {...props} />;
        case ActivityType.VISUAL_MEMORY: return <MemoryAttentionSheets.VisualMemorySheet {...props} />;
        case ActivityType.NUMBER_SEARCH: return <MemoryAttentionSheets.NumberSearchSheet {...props} />;
        case ActivityType.FIND_THE_DUPLICATE_IN_ROW: return <MemoryAttentionSheets.FindDuplicateSheet {...props} />;
        case ActivityType.LETTER_GRID_TEST: return <MemoryAttentionSheets.LetterGridTestSheet {...props} />;
        case ActivityType.BURDON_TEST: return <MemoryAttentionSheets.BurdonTestSheet {...props} />;
        case ActivityType.FIND_LETTER_PAIR: return <MemoryAttentionSheets.FindLetterPairSheet {...props} />;
        case ActivityType.TARGET_SEARCH: return <MemoryAttentionSheets.TargetSearchSheet {...props} />;
        case ActivityType.COLOR_WHEEL_MEMORY: return <MemoryAttentionSheets.ColorWheelSheet {...props} />;
        case ActivityType.IMAGE_COMPREHENSION: return <MemoryAttentionSheets.ImageComprehensionSheet {...props} />;
        case ActivityType.CHARACTER_MEMORY: return <MemoryAttentionSheets.CharacterMemorySheet {...props} />;
        case ActivityType.STROOP_TEST: return <MemoryAttentionSheets.StroopTestSheet {...props} />;
        case ActivityType.CHAOTIC_NUMBER_SEARCH: return <MemoryAttentionSheets.ChaoticNumberSearchSheet {...props} />;

        // --- New Activities ---
        case ActivityType.FAMILY_RELATIONS: return <NewActivitySheets.FamilyRelationsSheet {...props} />;
        case ActivityType.LOGIC_DEDUCTION: return <NewActivitySheets.LogicDeductionSheet {...props} />;
        case ActivityType.NUMBER_BOX_LOGIC: return <NewActivitySheets.NumberBoxLogicSheet {...props} />;
        case ActivityType.MAP_INSTRUCTION: return <NewActivitySheets.MapInstructionSheet {...props} />;

        // --- Dyscalculia ---
        case ActivityType.NUMBER_SENSE: return <DyscalculiaSheets.NumberSenseSheet {...props} />;
        case ActivityType.ARITHMETIC_FLUENCY: return <DyscalculiaSheets.VisualArithmeticSheet {...props} />;
        case ActivityType.VISUAL_ARITHMETIC: return <DyscalculiaSheets.VisualArithmeticSheet {...props} />;
        case ActivityType.NUMBER_GROUPING: return <DyscalculiaSheets.VisualArithmeticSheet {...props} />;
        case ActivityType.SPATIAL_REASONING: return <DyscalculiaSheets.SpatialGridSheet {...props} />;
        case ActivityType.SPATIAL_AWARENESS_DISCOVERY: return <DyscalculiaSheets.SpatialGridSheet {...props} />;
        case ActivityType.POSITIONAL_CONCEPTS: return <DyscalculiaSheets.SpatialGridSheet {...props} />;
        case ActivityType.DIRECTIONAL_CONCEPTS: return <DyscalculiaSheets.SpatialGridSheet {...props} />;
        case ActivityType.MATH_LANGUAGE: return <DyscalculiaSheets.ConceptMatchSheet {...props} />;
        case ActivityType.TIME_MEASUREMENT_GEOMETRY: return <DyscalculiaSheets.ConceptMatchSheet {...props} />;
        case ActivityType.FRACTIONS_DECIMALS: return <DyscalculiaSheets.ConceptMatchSheet {...props} />;
        case ActivityType.ESTIMATION_SKILLS: return <DyscalculiaSheets.EstimationSheet {...props} />;
        case ActivityType.VISUAL_NUMBER_REPRESENTATION: return <DyscalculiaSheets.NumberSenseSheet {...props} />;
        case ActivityType.APPLIED_MATH_STORY: return <MathLogicSheets.RealLifeMathProblemsSheet {...props} />;
        case ActivityType.PROBLEM_SOLVING_STRATEGIES: return <MathLogicSheets.RealLifeMathProblemsSheet {...props} />;
        case ActivityType.VISUAL_DISCRIMINATION_MATH: return <VisualPerceptionSheets.VisualOddOneOutSheet {...props} />;

        default:
            return <div>Bu etkinlik türü henüz desteklenmiyor veya geliştirme aşamasında: {activityType}</div>;
    }
};

export default Worksheet;
