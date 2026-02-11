
import React from 'react';
import { 
    ActivityType, SingleWorksheetData, WorksheetBlock,
    AlgorithmData, MathPuzzleData, NumberPatternData, RealLifeProblemData, LogicGridPuzzleData, FutoshikiData, NumberPyramidData, OddOneOutData, NumberLogicRiddleData, NumberPathLogicData, VisualArithmeticData, ClockReadingData, NumberSenseData, MoneyCountingData, MathMemoryCardsData, SpatialGridData, ConceptMatchData, EstimationData, 
    WordMemoryData, VisualMemoryData, CharacterMemoryData, ColorWheelMemoryData, ImageComprehensionData, StroopTestData, LetterGridTestData, NumberSearchData, ChaoticNumberSearchData, AttentionDevelopmentData, AttentionFocusData, FindDuplicateData, FindLetterPairData, TargetSearchData,
    InteractiveStoryData, SyllableMasterLabData, ReadingSudokuData, ReadingStroopData, SynonymAntonymMatchData, SyllableWordBuilderData, LetterVisualMatchingData, FamilyRelationsData, FamilyLogicTestData, MorphologyMatrixData, ReadingPyramidData, ReadingFlowData, PhonologicalAwarenessData, RapidNamingData, LetterDiscriminationData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, CodeReadingData, AttentionToQuestionData, HandwritingPracticeData,
    MapInstructionData, FindTheDifferenceData, VisualOddOneOutData, GridDrawingData, SymmetryDrawingData, ShapeCountingData, DirectionalTrackingData, HiddenPasswordGridData, WordSearchData, AnagramsData, CrosswordData
} from '../types';

// Sheets
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
import { PedagogicalHeader, ImageDisplay, TenFrame } from './sheets/common';
import { EditableText, EditableElement } from './Editable';

interface SheetRendererProps {
    activityType: ActivityType;
    data: SingleWorksheetData;
}

const BlockRenderer: React.FC<{ block: WorksheetBlock }> = ({ block }) => {
    const style = block.style || {};
    
    switch (block.type) {
        case 'header':
            return <h2 className="text-3xl font-black uppercase border-b-8 border-zinc-900 mb-6 pb-2 leading-none"><EditableText value={block.content} /></h2>;
        case 'text':
            return <div className="text-xl leading-relaxed mb-8 text-justify font-dyslexic text-zinc-800"><EditableText value={block.content} /></div>;
        case 'question':
            return (
                <div className="p-6 bg-zinc-50 border-[3px] border-zinc-900 rounded-[2rem] mb-6 shadow-sm group hover:border-indigo-500 transition-all">
                    <div className="text-lg font-black mb-4 flex gap-4">
                        <span className="w-8 h-8 bg-zinc-900 text-white rounded-xl flex items-center justify-center text-sm shrink-0">?</span>
                        <EditableText value={block.content.text} />
                    </div>
                    <div className="h-12 border-b-2 border-dashed border-zinc-300 w-full opacity-50"></div>
                </div>
            );
        case 'math':
            return (
                <div className="flex flex-col items-center gap-4 mb-8 p-6 bg-white border-2 border-zinc-100 rounded-3xl shadow-inner">
                    <div className="flex items-center gap-8 text-4xl font-black font-mono">
                         <span>{block.content.num1}</span>
                         <span className="text-zinc-300">{block.content.operator}</span>
                         <span>{block.content.num2}</span>
                         <span className="text-zinc-300">=</span>
                         <div className="w-24 h-16 border-4 border-indigo-600 rounded-2xl bg-indigo-50/50"></div>
                    </div>
                    {block.content.showVisual && <TenFrame count={block.content.num1} />}
                </div>
            );
        case 'image':
            return <ImageDisplay prompt={block.content.prompt} className="w-full h-64 mb-8 shadow-xl border-4 border-white" />;
        default:
            return <div className="p-4 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 italic text-center mb-4">Blok içeriği ayrıştırılıyor...</div>;
    }
};

const UnifiedContentRenderer = ({ data }: { data: SingleWorksheetData }) => {
    if (data.blocks && data.blocks.length > 0) {
        return (
            <div className="w-full h-full flex flex-col animate-in fade-in duration-1000">
                <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
                <div className="flex-1 flex flex-col mt-4">
                    {data.blocks.map((block) => <BlockRenderer key={block.id} block={block} />)}
                </div>
            </div>
        );
    }
    
    return (
        <div className="w-full h-full flex flex-col animate-in fade-in duration-700">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            <div className="flex flex-col gap-6 mt-4">
                {(data.sections || []).map((section: any, idx: number) => (
                    <EditableElement key={idx} className="bg-white rounded-[3rem] border-[3px] border-zinc-900 shadow-sm w-full p-8 group hover:border-indigo-600 transition-all">
                        {section.title && <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 border-b border-indigo-50 pb-2 flex items-center gap-2"><i className="fa-solid fa-star"></i> <EditableText value={section.title} tag="span" /></h4>}
                        {section.type === 'text' && <div className="prose max-w-none text-zinc-800 leading-relaxed font-dyslexic text-xl text-justify"><EditableText value={section.content} tag="div" /></div>}
                        {section.type === 'list' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(section.items || []).map((item: string, i: number) => (
                                    <div key={i} className="flex gap-5 items-start p-5 bg-zinc-50 rounded-3xl border-2 border-zinc-100 group-hover:bg-white transition-all"><div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-lg">{i+1}</div><div className="flex-1 font-bold text-zinc-800 text-lg leading-snug"><EditableText value={item} tag="span" /></div></div>
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
    
    if (activityType === ActivityType.AI_WORKSHEET_CONVERTER || activityType === ActivityType.OCR_CONTENT || data.sections || data.blocks) {
        return <UnifiedContentRenderer data={data} />;
    }

    if (activityType === ActivityType.STORY_COMPREHENSION && data.layout) {
        return <ReadingStudioContentRenderer layout={data.layout} storyData={data.storyData} />;
    }

    /* Fix: Add type assertions for specific sheet data props to fix property missing errors. */
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
        case ActivityType.IMAGE_COMPREHENSION: return <ImageComprehensionSheet data={data as unknown as ImageComprehensionData} />;
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
        default: return <div className="p-12 text-center border-4 border-dashed border-zinc-100 rounded-[3rem]"><h3 className="font-black text-zinc-300 uppercase tracking-widest text-2xl">Modül: {activityType}</h3><p className="text-zinc-400 mt-2 font-bold">Görsel motor henüz bu tip için optimize edilmedi.</p></div>;
    }
});
