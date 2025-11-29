
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

    // WYSIWYG Fix: 
    // Always stack multiple worksheets vertically (outerCols = 1) to match print behavior.
    // Use the settings.columns slider to control the internal column layout (innerCols).
    const outerCols = 1;
    const innerCols = settings.columns;
    
    const isLandscape = settings.orientation === 'landscape';
    const pageWidth = isLandscape ? '297mm' : '210mm';
    const pageHeight = isLandscape ? '210mm' : '297mm';

    const containerStyle = {
        '--worksheet-font-size': `${settings.fontSize}px`,
        '--worksheet-border-color': settings.borderColor, // Usually black/gray for print
        '--worksheet-border-width': `${settings.borderWidth}px`,
        '--worksheet-margin': `${settings.margin}px`,
        '--worksheet-gap': `${settings.gap}px`,
        '--dynamic-cols': innerCols,
        
        // Visibility Flags (CSS Vars)
        '--show-pedagogical-note': settings.showPedagogicalNote ? 'flex' : 'none',
        '--show-mascot': settings.showMascot ? 'block' : 'none',
        '--show-student-info': settings.showStudentInfo ? 'flex' : 'none',
        '--show-footer': settings.showFooter ? 'flex' : 'none',
        
        // Typography Settings
        '--content-align': settings.contentAlign || 'center',
        '--font-weight': settings.fontWeight || 'normal',
        '--font-style': settings.fontStyle || 'normal',

        '--print-width': pageWidth,
        '--print-height': pageHeight
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
                /* Dynamic Grid System for Items */
                .dynamic-grid {
                    display: grid;
                    grid-template-columns: repeat(var(--dynamic-cols), 1fr);
                    gap: var(--worksheet-gap);
                    width: 100%;
                    align-items: start;
                }

                @media print {
                    @page { 
                        size: ${settings.orientation}; 
                        margin: 0mm; /* Control margins manually for precision */
                    }
                    body, html {
                        height: auto !important;
                        overflow: visible !important;
                        background: white !important;
                    }
                    
                    /* Ensure Dynamic Grid respects column settings in Print */
                    .dynamic-grid {
                        display: grid !important;
                        grid-template-columns: repeat(var(--dynamic-cols), 1fr) !important;
                        gap: var(--worksheet-gap) !important;
                    }

                    /* Reset scaling for print to ensure natural flow */
                    .worksheet-scaler {
                        transform: none !important;
                        width: 100% !important;
                        margin-bottom: 0 !important;
                    }
                    /* Allow the container to expand infinitely */
                    .worksheet-page {
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important; 
                        box-shadow: none !important;
                        overflow: visible !important;
                        display: block !important;
                        border: none !important;
                        background: white !important;
                    }
                    
                    /* Force new page for each item in the list (except last) */
                    .worksheet-item {
                        width: ${pageWidth} !important;
                        min-height: ${pageHeight} !important;
                        
                        /* 
                           Minimal Reasonable Margin Logic:
                           Ensures at least 10mm safety margin for printers, 
                           plus any extra user margin.
                        */
                        padding: max(10mm, var(--worksheet-margin)) !important;
                        
                        page-break-after: always !important;
                        break-after: page !important;
                        page-break-inside: avoid !important;
                        margin: 0 auto !important;
                        display: block !important;
                        box-sizing: border-box !important;
                        position: relative !important;
                        
                        /* Force B&W Content */
                        background-color: white !important;
                        color: black !important;
                        box-shadow: none !important;
                    }
                    .worksheet-item:last-child {
                        page-break-after: auto !important;
                        break-after: auto !important;
                    }
                    
                    /* Reset outer grid to block for simple stacking */
                    .outer-grid {
                        display: block !important;
                    }

                    /* Hide UI elements */
                    .no-print { display: none !important; }
                    
                    /* Aggressive Color Reset for Children */
                    .worksheet-item * {
                        background-color: transparent !important; /* Ensure background shapes are visible if needed, but remove bg colors */
                        color: black !important;
                        box-shadow: none !important;
                        text-shadow: none !important;
                        border-color: black !important;
                        
                        /* Apply Typography Settings to content elements */
                        text-align: var(--content-align);
                    }
                    
                    /* Specific overrides for pedagogical header to keep it readable */
                    .pedagogical-header {
                        text-align: center !important; 
                    }
                    
                    /* Force Flex/Grid Layouts to Stay Horizontal in Print */
                    .print\\:flex-row {
                        display: flex !important;
                        flex-direction: row !important;
                    }
                    .print\\:grid-cols-2 {
                        display: grid !important;
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }
                    .print\\:gap-8 {
                        gap: 2rem !important;
                    }
                }
            `}</style>

            <div 
                className="worksheet-page shadow-2xl print:shadow-none transition-all duration-300 relative"
                style={{ 
                    width: pageWidth,
                    minHeight: pageHeight,
                    height: 'auto',
                    padding: 0, 
                    fontSize: `var(--worksheet-font-size)`,
                }}
            >
                <div className="flex flex-col h-full relative z-10">
                    {/* Scaler Wrapper */}
                    <div className="flex-1 w-full worksheet-scaler" style={scalerStyle}>
                        
                        <div className="outer-grid" style={outerGridStyle}>
                            {data.map((sheetData, index) => (
                                <div 
                                    key={index} 
                                    className="worksheet-item relative bg-white text-black"
                                    style={{
                                        // For screen mode, apply styles here. Print mode overrides via CSS class.
                                        padding: `max(20px, var(--worksheet-margin))`,
                                        minHeight: pageHeight,
                                        marginBottom: '20px', // Visual gap between pages on screen
                                        fontWeight: settings.fontWeight,
                                        fontStyle: settings.fontStyle,
                                        textAlign: settings.contentAlign,
                                        ...borderStyle
                                    }}
                                >
                                    <RenderSheet activityType={activityType} data={sheetData} />
                                    
                                    <div 
                                        className="absolute bottom-4 left-0 w-full px-8 justify-between items-center text-[10px] opacity-50 text-black print:opacity-100"
                                        style={{ display: 'var(--show-footer, flex)' }}
                                    >
                                        <span className="font-bold uppercase tracking-widest">Bursa Disleksi AI</span>
                                        <span>{new Date().toLocaleDateString('tr-TR')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

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
