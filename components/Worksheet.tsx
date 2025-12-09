
import React, { useMemo } from 'react';
import { ActivityType, WorksheetData, SingleWorksheetData, StyleSettings, StudentProfile, OverlayItem } from '../types';
import * as MathLogicSheets from './sheets/MathLogicSheets';
import * as MemoryAttentionSheets from './sheets/MemoryAttentionSheets';
import * as VisualPerceptionSheets from './sheets/VisualPerceptionSheets';
import * as WordGameSheets from './sheets/WordGameSheets';
import { 
    StoryComprehensionSheet, 
    StoryCreationPromptSheet, 
    WordsInStorySheet, 
    StoryAnalysisSheet, 
    ProverbFillSheet, 
    StorySequencingSheet, 
    ProverbSayingSortSheet, 
    ProverbWordChainSheet, 
    ProverbSearchSheet, 
    ProverbSentenceFinderSheet 
} from './sheets/ReadingComprehensionSheets';
import * as DyslexiaSheets from './sheets/DyslexiaSupportSheets';
import * as DyscalculiaSheets from './sheets/DyscalculiaSheets';
import * as NewActivitySheets from './sheets/NewActivitySheets';
import { getBorderCSS } from './VisualAssets';
import { EditableElement, EditableText, useEditable } from './Editable';

interface WorksheetProps {
    activityType: ActivityType | null;
    data: WorksheetData;
    settings: StyleSettings;
    studentProfile?: StudentProfile | null;
    overlayItems?: OverlayItem[];
    showQR?: boolean;
}

const RenderSheet = React.memo(({ activityType, data }: { activityType: ActivityType, data: SingleWorksheetData }) => {
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
        case ActivityType.ARITHMETIC_CONNECT: return <MathLogicSheets.ArithmeticConnectSheet {...props} />; 
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
        case ActivityType.WEIGHT_CONNECT: return <VisualPerceptionSheets.WeightConnectSheet {...props} />;
        case ActivityType.LENGTH_CONNECT: return <VisualPerceptionSheets.LengthConnectSheet {...props} />;
        case ActivityType.PUNCTUATION_COLORING: return <VisualPerceptionSheets.PunctuationColoringSheet {...props} />;
        case ActivityType.SYNONYM_ANTONYM_COLORING: return <VisualPerceptionSheets.SynonymAntonymColoringSheet {...props} />;

        // --- Reading Comprehension ---
        case ActivityType.STORY_COMPREHENSION: return <StoryComprehensionSheet {...props} />;
        case ActivityType.STORY_CREATION_PROMPT: return <StoryCreationPromptSheet {...props} />;
        case ActivityType.WORDS_IN_STORY: return <WordsInStorySheet {...props} />;
        case ActivityType.STORY_ANALYSIS: return <StoryAnalysisSheet {...props} />;
        case ActivityType.PROVERB_FILL_IN_THE_BLANK: return <ProverbFillSheet {...props} />;
        case ActivityType.STORY_SEQUENCING: return <StorySequencingSheet {...props} />;
        case ActivityType.PROVERB_SAYING_SORT: return <ProverbSayingSortSheet {...props} />;
        case ActivityType.PROVERB_WORD_CHAIN: return <ProverbWordChainSheet {...props} />;
        case ActivityType.PROVERB_SEARCH: return <ProverbSearchSheet {...props} />;
        case ActivityType.PROVERB_SENTENCE_FINDER: return <ProverbSentenceFinderSheet {...props} />;

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
        case ActivityType.PUNCTUATION_SPIRAL_PUZZLE: return <WordGameSheets.PunctuationSpiralPuzzleSheet {...props} />;
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
        case ActivityType.THEMATIC_WORD_SEARCH_COLOR: return <WordGameSheets.ThematicWordSearchColorSheet {...props} />;
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
}, (prevProps, nextProps) => {
    // Custom comparison for performance
    return prevProps.data === nextProps.data && prevProps.activityType === nextProps.activityType;
});

const WorkbookQR = React.memo(({ url }: { url: string }) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
    
    return (
        <div className="absolute top-4 right-4 z-20 flex flex-col items-center bg-white p-2 rounded-lg border-2 border-black shadow-md no-print-hide">
            <img src={qrUrl} alt="QR Code" className="w-16 h-16" crossOrigin="anonymous" />
            <span className="text-[8px] font-bold mt-1 text-black uppercase tracking-wider">Dijital Çözüm</span>
        </div>
    );
});

const Worksheet: React.FC<WorksheetProps> = ({ activityType, data, settings, studentProfile, overlayItems, showQR }) => {
    const { isEditMode } = useEditable();

    const variableStyle = useMemo(() => {
        // SCIENTIFIC LAYOUT ENGINE (Visual Params Only)
        // Note: Pagination/Splitting is now handled by paginationService in parent.
        // Here we just handle the visual scaling and CSS variables for the *current* page data.
        
        const userCols = Math.max(1, settings.columns || 1);
        const baseFontSize = settings.fontSize || 16;

        // Visual Density Control based on columns/scale
        // Since wrapper handles Scale, here we just respect columns relative to A4 width
        const effectiveCols = userCols;
        
        const densityFactor = Math.pow(userCols, 0.4); 
        const adjustedFontSize = Math.round(baseFontSize / densityFactor);
        
        const itemDirection = userCols > 2 ? 'column' : 'row';
        const itemGap = userCols > 2 ? '0.5rem' : '1rem';
        const itemPadding = userCols > 2 ? '0.5rem' : '1rem';
        const visualComplexity = userCols > 3 ? 'low' : 'high';
        
        const gridTemplateColumns = `repeat(${effectiveCols}, minmax(0, 1fr))`;

        return {
            '--worksheet-font-size': `${adjustedFontSize}px`,
            '--worksheet-border-color': settings.borderColor,
            '--worksheet-border-width': `${settings.borderWidth}px`,
            '--worksheet-margin': `${settings.margin}px`,
            '--worksheet-gap': `${Math.max(8, settings.gap)}px`, 
            '--worksheet-font-family': settings.fontFamily || 'OpenDyslexic',
            '--worksheet-line-height': settings.lineHeight || 1.4,
            '--worksheet-letter-spacing': `${settings.letterSpacing || 0}px`,
            '--content-align': settings.contentAlign || 'center',
            '--font-weight': settings.fontWeight || 'normal',
            '--font-style': settings.fontStyle || 'normal',
            '--grid-columns': gridTemplateColumns,
            '--item-direction': itemDirection,
            '--item-gap': itemGap,
            '--item-padding': itemPadding,
            '--visual-complexity': visualComplexity,
            '--display-pedagogical-note': settings.showPedagogicalNote ? 'flex' : 'none',
            '--display-mascot': settings.showMascot ? 'block' : 'none',
            '--display-student-info': settings.showStudentInfo ? 'flex' : 'none',
            '--display-footer': settings.showFooter ? 'flex' : 'none',
            '--display-title': settings.showTitle ? 'block' : 'none',
            '--display-instruction': settings.showInstruction ? 'block' : 'none',
            '--display-image': settings.showImage ? 'block' : 'none',
        } as React.CSSProperties;
    }, [settings]);

    const pageStyle = useMemo(() => {
        const isLandscape = settings.orientation === 'landscape';
        const pageWidth = isLandscape ? '297mm' : '210mm';
        const pageHeight = isLandscape ? '210mm' : '297mm';
        
        return {
            width: pageWidth,
            height: pageHeight,
            minHeight: pageHeight,
            padding: `0mm`, 
            position: 'relative' as const,
            backgroundColor: 'white',
            color: 'black',
            boxSizing: 'border-box' as const,
            overflow: 'hidden',
            margin: '0 auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1), 0 10px 15px rgba(0,0,0,0.05)',
            ...getBorderCSS(settings.themeBorder || 'simple', settings.borderColor, settings.borderWidth)
        };
    }, [settings.orientation, settings.themeBorder, settings.borderColor, settings.borderWidth]);

    if (!data || !activityType || data.length === 0) return null;

    const visualStyleClass = `style-${settings.visualStyle || 'card'}`;

    return (
        <div className={`flex flex-col gap-16 pb-16 items-center ${visualStyleClass}`} style={variableStyle}>
            <style>{`
                /* SCIENTIFIC LAYOUT ENGINE CSS */
                .dynamic-grid {
                    display: grid;
                    grid-template-columns: var(--grid-columns);
                    gap: var(--worksheet-gap);
                    width: 100%;
                    align-items: start;
                }
                
                .worksheet-content .editable-element,
                .worksheet-content .item-card {
                    flex-direction: var(--item-direction) !important;
                    gap: var(--item-gap) !important;
                    padding: var(--item-padding) !important;
                }

                .worksheet-content[data-complexity="low"] .item-card {
                    border: 1px solid #e5e7eb !important; 
                    box-shadow: none !important;
                }

                .style-zebra .dynamic-grid > *:nth-child(odd) {
                    background-color: rgba(0,0,0,0.03);
                }

                .worksheet-content {
                    font-family: var(--worksheet-font-family), sans-serif;
                    font-size: var(--worksheet-font-size);
                    font-weight: var(--font-weight);
                    font-style: var(--font-style);
                    line-height: var(--worksheet-line-height);
                    letter-spacing: var(--worksheet-letter-spacing);
                    text-align: var(--content-align);
                }
            `}</style>

            {data.map((sheetData, index) => (
                <div 
                    key={index} 
                    className="worksheet-page-wrapper"
                >
                    <div 
                        className="worksheet-item worksheet-page transition-all duration-300 ease-in-out"
                        style={pageStyle}
                    >
                        {showQR && <WorkbookQR url="https://www.bursadisleksi.com" />}

                        <div className="w-full h-full p-[10mm] relative flex flex-col">
                            
                            {isEditMode && (
                                <>
                                    <div className="absolute inset-0 edit-grid-overlay z-0 pointer-events-none"></div>
                                    <div className="absolute inset-[10mm] edit-safety-guide z-0 pointer-events-none"></div>
                                    <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded shadow-sm opacity-50 pointer-events-none edit-handle">
                                        Sayfa {index + 1}
                                    </div>
                                </>
                            )}

                            <div 
                                className="worksheet-scaler worksheet-content relative z-10 flex-1 flex flex-col justify-center"
                                style={{
                                    // Scale handled by parent canvas now
                                    width: '100%',
                                    height: 'auto'
                                }}
                                data-complexity={settings.columns > 3 ? 'low' : 'high'}
                            >
                                <div className="mb-4 pb-1 border-b border-black flex justify-between items-end shrink-0 w-full" style={{ display: 'var(--display-student-info)' }}>
                                    <div className="flex gap-8 text-sm text-black">
                                        <div className="flex gap-2 items-baseline">
                                            <span className="text-[10px] uppercase font-bold text-zinc-500">Ad Soyad:</span>
                                            <EditableText value={studentProfile?.name || ''} tag="span" className="min-w-[150px] border-b border-dotted border-zinc-400" />
                                        </div>
                                        <div className="flex gap-2 items-baseline">
                                            <span className="text-[10px] uppercase font-bold text-zinc-500">Sınıf:</span>
                                            <EditableText value={studentProfile?.grade || ''} tag="span" className="min-w-[50px] border-b border-dotted border-zinc-400" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-baseline text-sm text-black">
                                        <span className="text-[10px] uppercase font-bold text-zinc-500">Tarih:</span>
                                        <EditableText value={studentProfile?.date || ''} tag="span" className="min-w-[80px] border-b border-dotted border-zinc-400" />
                                    </div>
                                </div>

                                <EditableElement id="main-content" className="flex-1 w-full h-full flex flex-col">
                                    <div className="flex-1 flex flex-col">
                                        <RenderSheet activityType={activityType} data={sheetData} />
                                    </div>
                                </EditableElement>
                                
                                <div 
                                    className="mt-auto w-full pt-8 px-4 flex justify-between items-center text-[10px] text-zinc-400 pointer-events-none"
                                    style={{ display: 'var(--display-footer)' }}
                                >
                                    <span className="uppercase tracking-widest font-bold">Bursa Disleksi AI</span>
                                    <span className="font-mono">{index + 1} / {data.length}</span>
                                </div>
                            </div>
                            
                            {(overlayItems || []).filter(item => item.pageIndex === index).map(item => (
                                <EditableElement 
                                    key={item.id} 
                                    initialPos={{x: item.x, y: item.y}} 
                                    className="absolute z-50 cursor-move"
                                    style={{left: 0, top: 0}}
                                >
                                    {item.type === 'text' ? (
                                        <div className="bg-white/80 border border-dashed border-zinc-400 p-2 rounded min-w-[100px]">
                                            <EditableText value={item.content} tag="div" className="text-lg font-bold" />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24">
                                            <img src={item.content} className="w-full h-full object-contain drop-shadow-md" alt="Sticker" />
                                        </div>
                                    )}
                                </EditableElement>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default React.memo(Worksheet);
