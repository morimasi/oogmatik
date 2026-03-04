
import React from 'react';
import { 
    ActivityType, SingleWorksheetData, WorksheetBlock,
    AlgorithmData, MathPuzzleData, NumberPatternData, RealLifeProblemData, LogicGridPuzzleData, FutoshikiData, NumberPyramidData, OddOneOutData, NumberLogicRiddleData, NumberPathLogicData, VisualArithmeticData, ClockReadingData, NumberSenseData, MoneyCountingData, MathMemoryCardsData, SpatialGridData, ConceptMatchData, EstimationData, 
    WordMemoryData, VisualMemoryData, CharacterMemoryData, ColorWheelMemoryData, ImageComprehensionData, StroopTestData, LetterGridTestData, NumberSearchData, ChaoticNumberSearchData, AttentionDevelopmentData, AttentionFocusData, FindDuplicateData, FindLetterPairData, TargetSearchData,
    InteractiveStoryData, SyllableMasterLabData, ReadingSudokuData, ReadingStroopData, SynonymAntonymMatchData, SyllableWordBuilderData, LetterVisualMatchingData, FamilyRelationsData, FamilyLogicTestData, MorphologyMatrixData, ReadingPyramidData, ReadingFlowData, PhonologicalAwarenessData, RapidNamingData, LetterDiscriminationData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, CodeReadingData, AttentionToQuestionData, HandwritingPracticeData,
    MapInstructionData, FindTheDifferenceData, VisualOddOneOutData, GridDrawingData, SymmetryDrawingData, ShapeCountingData, DirectionalTrackingData, HiddenPasswordGridData, WordSearchData, AnagramsData, CrosswordData
} from '../types';

import { MathPuzzleSheet } from './sheets/math/MathPuzzleSheet';
import { NumberPatternSheet } from './sheets/math/NumberPatternSheet';
import { RealLifeMathProblemsSheet } from './sheets/math/RealLifeMathProblemsSheet';
import { LogicGridPuzzleSheet } from './sheets/math/LogicGridPuzzleSheet';
import { FutoshikiSheet } from './sheets/math/FutoshikiSheet';
import { NumberPyramidSheet } from './sheets/math/NumberPyramidSheet';
import { OddOneOutSheet } from './sheets/math/OddOneOutSheet';
import { AlgorithmSheet } from './sheets/logic/AlgorithmSheet';
import { NumberLogicRiddleSheet } from './sheets/math/NumberLogicRiddleSheet';
import { NumberPathLogicSheet } from './sheets/math/NumberPathLogicSheet';
import { VisualArithmeticSheet } from './sheets/math/VisualArithmeticSheet';
import { ClockReadingSheet } from './sheets/math/ClockReadingSheet';
import { NumberSenseSheet } from './sheets/math/NumberSenseSheet';
import { MoneyCountingSheet } from './sheets/math/MoneyCountingSheet';
import { MathMemoryCardsSheet } from './sheets/math/MathMemoryCardsSheet';
import { SpatialGridSheet } from './sheets/math/SpatialGridSheet';
import { ConceptMatchSheet } from './sheets/math/ConceptMatchSheet';
import { EstimationSheet } from './sheets/math/EstimationSheet';
import { WordMemorySheet, VisualMemorySheet, CharacterMemorySheet, ColorWheelSheet, ImageComprehensionSheet } from './sheets/attention/MemorySheets';
import { StroopTestSheet } from './sheets/attention/StroopTestSheet';
import { BurdonTestSheet, NumberSearchSheet, AttentionDevelopmentSheet, ChaoticNumberSearchSheet, AttentionFocusSheet, FindDuplicateSheet, LetterGridTestSheet, TargetSearchSheet } from './sheets/attention/AttentionSheets';
import { StoryComprehensionSheet } from './sheets/verbal/StoryComprehensionSheet';
import { ReadingFlowSheet } from './sheets/verbal/ReadingFlowSheet';
import { PhonologicalAwarenessSheet, RapidNamingSheet, LetterDiscriminationSheet, MirrorLettersSheet, SyllableTrainSheet, VisualTrackingLinesSheet, BackwardSpellingSheet, CodeReadingSheet, AttentionToQuestionSheet, HandwritingPracticeSheet } from './sheets/verbal/ReadingSupportSheets';
import { AnagramSheet, WordSearchSheet, HiddenPasswordGridSheet, CrosswordSheet } from './sheets/verbal/WordGameSheets';
import { SyllableMasterLabSheet, ReadingSudokuSheet, ReadingStroopSheet, SynonymAntonymMatchSheet, SyllableWordBuilderSheet, LetterVisualMatchingSheet, FamilyLogicSheet, FamilyRelationsSheet, FindLetterPairSheet, MorphologyMatrixSheet, ReadingPyramidSheet } from './sheets/verbal/ReadingSheets'; 
import { MapDetectiveSheet } from './sheets/visual/MapDetectiveSheet'; 
import { FindTheDifferenceSheet } from './sheets/visual/FindTheDifferenceSheet';
import { VisualOddOneOutSheet } from './sheets/visual/VisualOddOneOutSheet';
import { GridDrawingSheet } from './sheets/visual/GridDrawingSheet';
import { SymmetryDrawingSheet } from './sheets/visual/SymmetryDrawingSheet';
import { ShapeCountingSheet } from './sheets/visual/ShapeCountingSheet';
import { DirectionalTrackingSheet } from './sheets/visual/DirectionalTrackingSheet';
import { ReadingStudioContentRenderer } from './ReadingStudio/ReadingStudioContentRenderer';
import { PedagogicalHeader, ImageDisplay } from './sheets/common';
import { EditableText } from './Editable';

const recursiveSafeText = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === 'string') return val;
    return String(val);
};

const BlockRenderer: React.FC<{ block: WorksheetBlock }> = ({ block }) => {
    const content: any = block.content;
    if (!content) return null;
    
    const blockStyle = {
        textAlign: block.style?.textAlign as any || 'left',
        fontWeight: block.style?.fontWeight as any || 'normal',
        fontSize: block.style?.fontSize ? `${block.style.fontSize}px` : undefined,
        backgroundColor: block.style?.backgroundColor || 'transparent',
        borderRadius: block.style?.borderRadius ? `${block.style.borderRadius}px` : undefined,
        color: block.style?.color || 'inherit'
    };

    switch (block.type) {
        case 'header':
            return <h2 className="text-3xl font-black uppercase text-center mb-6 border-b-4 border-black pb-2" style={blockStyle}><EditableText value={recursiveSafeText(content.text || content)} tag="span" /></h2>;
        
        case 'text':
            return <div className="text-lg leading-relaxed mb-6 font-dyslexic" style={blockStyle}><EditableText value={recursiveSafeText(content.text || content)} tag="div" /></div>;
        
        case 'grid':
            return (
                <div className="flex justify-center mb-8">
                    <div className="grid gap-2 border-4 border-black p-4 bg-zinc-50 rounded-2xl" style={{ gridTemplateColumns: `repeat(${content.cols || 4}, 1fr)` }}>
                        {(content.cells || []).map((cell: any, i: number) => (
                            <div key={i} className="w-12 h-12 border-2 border-zinc-300 bg-white rounded-lg flex items-center justify-center font-black text-xl"><EditableText value={recursiveSafeText(cell)} tag="span" /></div>
                        ))}
                    </div>
                </div>
            );

        case 'table':
            return (
                <div className="overflow-hidden border-4 border-black rounded-2xl mb-8 bg-white mx-auto max-w-full shadow-sm">
                    <table className="w-full border-collapse">
                        {content.headers && (
                            <thead className="bg-zinc-100">
                                <tr>{content.headers.map((h: string, i: number) => <th key={i} className="p-3 text-[10px] font-black uppercase border-r border-black last:border-0">{h}</th>)}</tr>
                            </thead>
                        )}
                        <tbody>
                            {(content.data || []).map((row: any[], i: number) => (
                                <tr key={i} className="border-t border-zinc-200">
                                    {row.map((cell, j) => <td key={j} className="p-3 text-center font-bold text-sm border-r border-zinc-100 last:border-0"><EditableText value={recursiveSafeText(cell)} tag="span" /></td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );

        case 'logic_card':
            return (
                <div className="p-6 border-[3px] border-zinc-900 rounded-[2.5rem] bg-white shadow-sm flex flex-col gap-4 mb-4 break-inside-avoid hover:border-indigo-500 transition-all">
                    <div className="bg-zinc-900 text-white p-4 rounded-2xl text-center text-sm font-bold italic mb-2">
                        <EditableText value={recursiveSafeText(content.text)} tag="p" />
                    </div>
                    {content.data && (
                        <div className="flex justify-center gap-4">
                            {content.data.map((box: string[], bIdx: number) => (
                                <div key={bIdx} className="border-2 border-zinc-800 p-2 rounded-xl bg-zinc-50 flex flex-wrap justify-center gap-2 min-w-[80px]">
                                    {box.map((num, nIdx) => <span key={nIdx} className="font-mono font-black text-lg">{num}</span>)}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-around pt-4 border-t-2 border-dashed border-zinc-100 mt-2">
                        {(content.options || []).map((opt: string, oIdx: number) => (
                            <div key={oIdx} className="flex flex-col items-center gap-1 group/opt">
                                <div className="w-10 h-10 rounded-xl border-2 border-zinc-200 flex items-center justify-center font-black text-sm group-hover/opt:bg-zinc-900 group-hover/opt:text-white transition-all cursor-pointer shadow-sm">{opt}</div>
                                <span className="text-[8px] font-black text-zinc-300 uppercase">{String.fromCharCode(65+oIdx)}</span>
                            </div>
                        ))}
                    </div>
                    {content.logic && (
                        <div className="absolute top-1 right-2 opacity-0 hover:opacity-10 rotate-180 text-[8px] font-black pointer-events-none transition-opacity">
                            LOGIC: {content.logic}
                        </div>
                    )}
                </div>
            );

        case 'footer_validation':
            return (
                <div className="mt-8 p-10 bg-zinc-900 text-white rounded-[4rem] border-4 border-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 break-inside-avoid">
                    <div className="flex-1">
                        <h4 className="text-2xl font-black tracking-tight mb-2 uppercase">KONTROL VE DOĞRULAMA</h4>
                        <p className="text-sm text-zinc-400 font-medium leading-relaxed italic"><EditableText value={recursiveSafeText(content.text)} tag="span" /></p>
                    </div>
                    <div className="flex items-center gap-8 bg-white/10 p-6 rounded-[2.5rem] border border-white/20">
                        <div className="text-center">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">HEDEF SONUÇ</span>
                            <div className="text-4xl font-black text-amber-400 font-mono">{content.targetValue}</div>
                        </div>
                        <div className="w-px h-12 bg-white/20"></div>
                        <div className="text-center">
                             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">SENİN SONUCUN</span>
                             <div className="w-20 h-10 border-b-4 border-dashed border-zinc-700"></div>
                        </div>
                    </div>
                </div>
            );

        case 'svg_shape':
            return (
                <div className="flex justify-center mb-8">
                    <div className="w-32 h-32 p-2 border-2 border-zinc-100 rounded-2xl bg-white shadow-sm">
                        <svg viewBox={content.viewBox || "0 0 100 100"} className="w-full h-full text-black">
                            {(content.paths || []).map((p: string, i: number) => <path key={i} d={p} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />)}
                        </svg>
                    </div>
                </div>
            );
        
        case 'image':
            return <div className="mb-8 flex justify-center"><ImageDisplay prompt={content.prompt} className="w-full h-64 rounded-[3rem] shadow-md border-4 border-white" /></div>;
        
        default: return null;
    }
};

const UnifiedContentRenderer = ({ data }: { data: SingleWorksheetData }) => {
    const architecture = data.layoutArchitecture;
    const blocks = architecture?.blocks || data.blocks || [];
    const cols = architecture?.cols || 1;

    return (
        <div className="w-full h-full flex flex-col animate-in fade-in duration-500 font-lexend">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            
            {cols > 1 ? (
                <div 
                    className="grid gap-6 mt-4 items-start" 
                    style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                >
                    {blocks.map((block: WorksheetBlock, idx: number) => (
                        <BlockRenderer key={idx} block={block} />
                    ))}
                </div>
            ) : (
                <div className="flex-1 mt-4">
                    {blocks.map((block: WorksheetBlock, idx: number) => (
                        <BlockRenderer key={idx} block={block} />
                    ))}
                </div>
            )}
            
            <div className="mt-auto pt-6 opacity-20 flex justify-between items-center text-[7px] font-black uppercase tracking-[0.5em] text-zinc-400">
                <span>Bursa Disleksi AI • Nöro-Mimari Motoru v6.0</span>
                <div className="flex gap-4">
                    <i className="fa-solid fa-microchip"></i>
                    <i className="fa-solid fa-brain"></i>
                    <i className="fa-solid fa-bezier-curve"></i>
                </div>
            </div>
        </div>
    );
};

interface SheetRendererProps {
    activityType: ActivityType | null;
    data: SingleWorksheetData;
}

export const SheetRenderer = React.memo(({ activityType, data }: SheetRendererProps) => {
    if (!data) return null;
    if (data.layoutArchitecture || data.blocks) return <UnifiedContentRenderer data={data} />;
    if (activityType === ActivityType.STORY_COMPREHENSION && data.layout) return <ReadingStudioContentRenderer layout={data.layout} storyData={data.storyData} />;

    switch (activityType) {
        case ActivityType.ALGORITHM_GENERATOR: return <AlgorithmSheet data={data as unknown as AlgorithmData} />;
        case ActivityType.MATH_PUZZLE: return <MathPuzzleSheet data={data as unknown as MathPuzzleData} />;
        case ActivityType.NUMBER_PATTERN: return <NumberPatternSheet data={data as unknown as NumberPatternData} />;
        case ActivityType.REAL_LIFE_MATH_PROBLEMS: return <RealLifeMathProblemsSheet data={data as unknown as RealLifeProblemData} />;
        case ActivityType.LOGIC_GRID_PUZZLE: return <LogicGridPuzzleSheet data={data as unknown as LogicGridPuzzleData} />;
        case ActivityType.FUTOSHIKI: return <FutoshikiSheet data={data as unknown as FutoshikiData} />;
        case ActivityType.NUMBER_PYRAMID: return <NumberPyramidSheet data={data as unknown as NumberPyramidData} />;
        case ActivityType.ODD_ONE_OUT: return <OddOneOutSheet data={data as unknown as OddOneOutData} />;
        case ActivityType.NUMBER_LOGIC_RIDDLES: return <NumberLogicRiddleSheet data={data as unknown as NumberLogicRiddleData} />;
        case ActivityType.NUMBER_PATH_LOGIC: return <NumberPathLogicSheet data={data as unknown as NumberPathLogicData} />;
        case ActivityType.VISUAL_ARITHMETIC: return <VisualArithmeticSheet data={data as unknown as VisualArithmeticData} />;
        case ActivityType.CLOCK_READING: return <ClockReadingSheet data={data as unknown as ClockReadingData} />;
        case ActivityType.NUMBER_SENSE: return <NumberSenseSheet data={data as unknown as NumberSenseData} />;
        case ActivityType.MONEY_COUNTING: return <MoneyCountingSheet data={data as unknown as MoneyCountingData} />;
        case ActivityType.MATH_MEMORY_CARDS: return <MathMemoryCardsSheet data={data as unknown as MathMemoryCardsData} />;
        case ActivityType.SPATIAL_GRID: return <SpatialGridSheet data={data as unknown as SpatialGridData} />;
        case ActivityType.CONCEPT_MATCH: return <ConceptMatchSheet data={data as unknown as ConceptMatchData} />;
        case ActivityType.ESTIMATION: return <EstimationSheet data={data as unknown as EstimationData} />;
        case ActivityType.WORD_MEMORY: return <WordMemorySheet data={data as unknown as WordMemoryData} />;
        case ActivityType.VISUAL_MEMORY: return <VisualMemorySheet data={data as unknown as VisualMemoryData} />;
        case ActivityType.CHARACTER_MEMORY: return <CharacterMemorySheet data={data as unknown as CharacterMemoryData} />;
        case ActivityType.COLOR_WHEEL_MEMORY: return <ColorWheelSheet data={data as unknown as ColorWheelMemoryData} />;
        case ActivityType.IMAGE_COMPREHRENSION: return <ImageComprehensionSheet data={data as unknown as ImageComprehensionData} />;
        case ActivityType.STROOP_TEST: return <StroopTestSheet data={data as unknown as StroopTestData} />;
        case ActivityType.BURDON_TEST: return <BurdonTestSheet data={data as unknown as LetterGridTestData} />;
        case ActivityType.NUMBER_SEARCH: return <NumberSearchSheet data={data as unknown as NumberSearchData} />;
        case ActivityType.CHAOTIC_NUMBER_SEARCH: return <ChaoticNumberSearchSheet data={data as unknown as ChaoticNumberSearchData} />;
        case ActivityType.ATTENTION_DEVELOPMENT: return <AttentionDevelopmentSheet data={data as unknown as AttentionDevelopmentData} />;
        case ActivityType.ATTENTION_FOCUS: return <AttentionFocusSheet data={data as unknown as AttentionFocusData} />;
        case ActivityType.FIND_IDENTICAL_WORD: return <FindDuplicateSheet data={data as unknown as FindDuplicateData} />; 
        case ActivityType.LETTER_GRID_TEST: return <LetterGridTestSheet data={data as unknown as LetterGridTestData} />;
        case ActivityType.FIND_LETTER_PAIR: return <FindLetterPairSheet data={data as unknown as FindLetterPairData} />;
        case ActivityType.TARGET_SEARCH: return <TargetSearchSheet data={data as unknown as TargetSearchData} />;
        case ActivityType.STORY_COMPREHENSION: return <StoryComprehensionSheet data={data as unknown as InteractiveStoryData} />;
        case ActivityType.SYLLABLE_MASTER_LAB: return <SyllableMasterLabSheet data={data as unknown as SyllableMasterLabData} />;
        case ActivityType.READING_SUDOKU: return <ReadingSudokuSheet data={data as unknown as ReadingSudokuData} />;
        case ActivityType.READING_STROOP: return <ReadingStroopSheet data={data as unknown as ReadingStroopData} />;
        case ActivityType.SYNONYM_ANTONYM_MATCH: return <SynonymAntonymMatchSheet data={data as unknown as SynonymAntonymMatchData} />;
        case ActivityType.SYLLABLE_WORD_BUILDER: return <SyllableWordBuilderSheet data={data as unknown as SyllableWordBuilderData} />;
        case ActivityType.LETTER_VISUAL_MATCHING: return <LetterVisualMatchingSheet data={data as unknown as LetterVisualMatchingData} />;
        case ActivityType.FAMILY_RELATIONS: return <FamilyRelationsSheet data={data as unknown as FamilyRelationsData} />;
        case ActivityType.FAMILY_LOGIC_TEST: return <FamilyLogicSheet data={data as unknown as FamilyLogicTestData} />;
        case ActivityType.MORPHOLOGY_MATRIX: return <MorphologyMatrixSheet data={data as unknown as MorphologyMatrixData} />;
        case ActivityType.READING_PYRAMID: return <ReadingPyramidSheet data={data as unknown as ReadingPyramidData} />;
        case ActivityType.READING_FLOW: return <ReadingFlowSheet data={data as unknown as ReadingFlowData} />;
        case ActivityType.PHONOLOGICAL_AWARENESS: return <PhonologicalAwarenessSheet data={data as unknown as PhonologicalAwarenessData} />;
        case ActivityType.RAPID_NAMING: return <RapidNamingSheet data={data as unknown as RapidNamingData} />;
        case ActivityType.LETTER_DISCRIMINATION: return <LetterDiscriminationSheet data={data as unknown as LetterDiscriminationData} />;
        case ActivityType.MIRROR_LETTERS: return <MirrorLettersSheet data={data as unknown as MirrorLettersData} />;
        case ActivityType.SYLLABLE_TRAIN: return <SyllableTrainSheet data={data as unknown as SyllableTrainData} />;
        case ActivityType.VISUAL_TRACKING_LINES: return <VisualTrackingLinesSheet data={data as unknown as VisualTrackingLineData} />;
        case ActivityType.BACKWARD_SPELLING: return <BackwardSpellingSheet data={data as unknown as BackwardSpellingData} />;
        case ActivityType.CODE_READING: return <CodeReadingSheet data={data as unknown as CodeReadingData} />;
        case ActivityType.ATTENTION_TO_QUESTION: return <AttentionToQuestionSheet data={data as unknown as AttentionToQuestionData} />;
        case ActivityType.HANDWRITING_PRACTICE: return <HandwritingPracticeSheet data={data as unknown as HandwritingPracticeData} />;
        case ActivityType.MAP_INSTRUCTION: return <MapDetectiveSheet data={data as unknown as MapInstructionData} />; 
        case ActivityType.FIND_THE_DIFFERENCE: return <FindTheDifferenceSheet data={data as unknown as FindTheDifferenceData} />;
        case ActivityType.VISUAL_ODD_ONE_OUT: return <VisualOddOneOutSheet data={data as unknown as VisualOddOneOutData} />;
        case ActivityType.GRID_DRAWING: return <GridDrawingSheet data={data as unknown as GridDrawingData} />;
        case ActivityType.SYMMETRY_DRAWING: return <SymmetryDrawingSheet data={data as unknown as SymmetryDrawingData} />;
        case ActivityType.SHAPE_COUNTING: return <ShapeCountingSheet data={data as unknown as ShapeCountingData} />;
        case ActivityType.DIRECTIONAL_TRACKING: return <DirectionalTrackingSheet data={data as unknown as DirectionalTrackingData} />;
        case ActivityType.HIDDEN_PASSWORD_GRID: return <HiddenPasswordGridSheet data={data as unknown as HiddenPasswordGridData} />;
        case ActivityType.WORD_SEARCH: return <WordSearchSheet data={data as unknown as WordSearchData} />;
        case ActivityType.ANAGRAM: return <AnagramSheet data={data as unknown as AnagramsData} />;
        case ActivityType.CROSSWORD: return <CrosswordSheet data={data as unknown as CrosswordData} />;
        default: return <UnifiedContentRenderer data={data} />;
    }
});
