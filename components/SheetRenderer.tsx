
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
import { EditableText, EditableElement } from './Editable';

interface SheetRendererProps {
    activityType: ActivityType;
    data: SingleWorksheetData;
}

/**
 * recursiveSafeText: Gelen veriyi her derinlikte kontrol eder ve [Object Object] hatasını engeller.
 */
const recursiveSafeText = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
        if (val.text) return recursiveSafeText(val.text);
        if (val.value) return recursiveSafeText(val.value);
        if (val.content) return recursiveSafeText(val.content);
        // Fallback: Eğer hala nesne ise ve anlamlı bir key yoksa stringleştir
        return JSON.stringify(val);
    }
    return String(val);
};

const BlockRenderer: React.FC<{ block: WorksheetBlock }> = ({ block }) => {
    const content: any = block.content;
    if (!content) return null;
    
    // Blok tipi bazlı stil enjeksiyonu
    const blockStyle = {
        textAlign: block.style?.textAlign as any || 'left',
        fontWeight: block.style?.fontWeight as any || 'normal',
        fontSize: block.style?.fontSize ? `${block.style.fontSize}px` : undefined
    };

    switch (block.type) {
        case 'header':
            return (
                <div className="mb-8 border-b-4 border-zinc-900 pb-4 text-center">
                    <h2 className="text-4xl font-black uppercase leading-none tracking-tighter" style={blockStyle}>
                        <EditableText value={recursiveSafeText(content.text || content)} tag="span" />
                    </h2>
                </div>
            );
        
        case 'text':
            return (
                <div className="text-xl leading-relaxed mb-6 font-dyslexic text-zinc-800" style={blockStyle}>
                    <EditableText value={recursiveSafeText(content.text || content)} tag="div" />
                </div>
            );
        
        case 'grid':
            return (
                <div className="flex justify-center mb-10">
                    <div 
                        className="grid gap-2 border-[4px] border-zinc-900 p-3 bg-white rounded-3xl shadow-lg"
                        style={{ gridTemplateColumns: `repeat(${content.cols || 4}, 1fr)` }}
                    >
                        {(content.cells || []).map((cell: any, i: number) => (
                            <div key={i} className="w-14 h-14 border-2 border-zinc-100 bg-zinc-50 rounded-xl flex items-center justify-center font-black text-2xl text-zinc-900 shadow-inner">
                                <EditableText value={recursiveSafeText(cell)} tag="span" />
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'table':
            return (
                <div className="overflow-hidden border-[3px] border-zinc-900 rounded-3xl mb-10 bg-white shadow-md">
                    <table className="w-full border-collapse">
                        {content.headers && (
                            <thead className="bg-zinc-900 text-white">
                                <tr>
                                    {content.headers.map((h: string, i: number) => (
                                        <th key={i} className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-white/10 last:border-0">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                        )}
                        <tbody>
                            {(content.data || []).map((row: any[], i: number) => (
                                <tr key={i} className="border-b border-zinc-100 last:border-0">
                                    {row.map((cell, j) => (
                                        <td key={j} className="p-4 text-center font-bold text-lg text-zinc-800 border-r border-zinc-100 last:border-0">
                                            <EditableText value={recursiveSafeText(cell)} tag="span" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );

        case 'dual_column':
            return (
                <div className="grid grid-cols-2 gap-16 mb-10 px-6">
                    <div className="space-y-4">
                        {(content.left || []).map((item: any, i: number) => (
                            <div key={i} className="p-4 border-2 border-zinc-900 rounded-2xl bg-zinc-50 font-bold text-lg relative">
                                <EditableText value={recursiveSafeText(item)} tag="span" />
                                <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-zinc-300 bg-white"></div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {(content.right || []).map((item: any, i: number) => (
                            <div key={i} className="p-4 border-2 border-zinc-200 border-dashed rounded-2xl bg-white font-medium text-lg relative text-zinc-400">
                                <EditableText value={recursiveSafeText(item)} tag="span" />
                                <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-zinc-300 bg-white"></div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'svg_shape':
            return (
                <div className="flex justify-center mb-10">
                    <div className="w-48 h-48 p-4 bg-white rounded-[3rem] border-[3px] border-zinc-900 shadow-sm flex items-center justify-center overflow-hidden">
                        <svg viewBox={content.viewBox || "0 0 100 100"} className="w-full h-full text-zinc-900">
                            {(content.paths || []).map((p: string, i: number) => (
                                <path key={i} d={p} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            ))}
                        </svg>
                    </div>
                </div>
            );

        case 'image':
            return (
                <div className="mb-10 flex justify-center">
                    <ImageDisplay prompt={content.prompt} className="w-full h-64 rounded-[3rem] border-8 border-white shadow-xl" />
                </div>
            );
        
        default:
            return (
                <div className="p-6 border-2 border-dashed border-zinc-100 rounded-3xl text-zinc-300 font-bold italic text-center mb-6">
                    <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                    Bileşen Render Edilemedi ({block.type})
                </div>
            );
    }
};

const UnifiedContentRenderer = ({ data }: { data: SingleWorksheetData }) => {
    // OCR veya Zengin içerik blokları
    const blocks = data.layoutArchitecture?.blocks || data.blocks;

    if (blocks && blocks.length > 0) {
        return (
            <div className="w-full h-full flex flex-col animate-in fade-in zoom-in-95 duration-1000">
                <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
                <div className="flex-1 flex flex-col mt-6">
                    {blocks.map((block: WorksheetBlock, idx: number) => (
                        <BlockRenderer key={idx} block={block} />
                    ))}
                </div>
                <div className="mt-auto pt-8 border-t border-zinc-100 flex justify-between items-center opacity-30 px-4">
                     <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.4em]">Bursa Disleksi AI • Nöro-Mimari Klonlayıcı</p>
                     <div className="flex gap-3"><i className="fa-solid fa-microchip"></i><i className="fa-solid fa-dna"></i></div>
                </div>
            </div>
        );
    }
    
    // Standart/Eski render mantığı (Fallback)
    return (
        <div className="w-full h-full flex flex-col animate-in fade-in duration-700">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            <div className="flex flex-col gap-8 mt-6">
                {(data.sections || []).map((section: any, idx: number) => (
                    <EditableElement key={idx} className="bg-white rounded-[3rem] border-[3px] border-zinc-900 shadow-sm w-full p-8 group hover:border-indigo-600 transition-all">
                        {section.title && <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 border-b border-indigo-50 pb-2"><i className="fa-solid fa-star-of-life mr-2"></i> <EditableText value={recursiveSafeText(section.title)} tag="span" /></h4>}
                        {section.type === 'text' && <div className="prose max-w-none text-zinc-800 leading-relaxed font-dyslexic text-xl text-justify"><EditableText value={recursiveSafeText(section.content)} tag="div" /></div>}
                        {section.type === 'list' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(section.items || []).map((item: any, i: number) => (
                                    <div key={i} className="flex gap-4 items-start p-4 bg-zinc-50 rounded-2xl border border-zinc-100 transition-all">
                                        <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-md">{i+1}</div>
                                        <div className="flex-1 font-bold text-zinc-800 text-lg leading-snug"><EditableText value={recursiveSafeText(item)} tag="span" /></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </EditableElement>
                ))}
            </div>
        </div>
    );
};

export const SheetRenderer = React.memo(({ activityType, data }: SheetRendererProps) => {
    if (!data) return null;
    
    // Mimari Klonlayıcı veya Birleştirilmiş Bloklar
    if (activityType === ActivityType.OCR_CONTENT || data.layoutArchitecture || data.blocks) {
        return <UnifiedContentRenderer data={data} />;
    }

    if (activityType === ActivityType.STORY_COMPREHENSION && data.layout) {
        return <ReadingStudioContentRenderer layout={data.layout} storyData={data.storyData} />;
    }

    // ... (Case Switch bloğu aynı kalıyor)
    switch (activityType) {
        case ActivityType.ALGORITHM_GENERATOR: return <AlgorithmSheet data={data as unknown as AlgorithmData} />;
        case ActivityType.MATH_PUZZLE: return <MathPuzzleSheet data={data as unknown as MathPuzzleData} />;
        case ActivityType.NUMBER_PATTERN: return <NumberPatternSheet data={data as unknown as NumberPatternData} />;
        case ActivityType.REAL_LIFE_MATH_PROBLEMS: return <RealLifeMathProblemsSheet data={data as unknown as RealLifeProblemData} />;
        case ActivityType.LOGIC_GRID_PUZZLE: return <LogicGridPuzzleSheet data={data as unknown as LogicGridPuzzleData} />;
        case ActivityType.FUTOSHIKI:
        case ActivityType.KENDOKU:
        case ActivityType.SHAPE_SUDOKU:
        case ActivityType.ODD_EVEN_SUDOKU: return <FutoshikiSheet data={data as unknown as FutoshikiData} />;
        case ActivityType.NUMBER_PYRAMID: return <NumberPyramidSheet data={data as unknown as NumberPyramidData} />;
        case ActivityType.ODD_ONE_OUT:
        case ActivityType.THEMATIC_ODD_ONE_OUT: return <OddOneOutSheet data={data as unknown as OddOneOutData} />;
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
        default: return <div className="p-12 text-center border-4 border-dashed border-zinc-100 rounded-[3rem]"><h3 className="font-black text-zinc-300 uppercase tracking-widest text-2xl">Modül: {activityType}</h3><p className="text-zinc-400 mt-2 font-bold">Bu aktivite tipi için özel bir sayfa yapısı tanımlanmamış.</p></div>;
    }
});
