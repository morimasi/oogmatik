
import React from 'react';
import { ActivityType, SingleWorksheetData, WorksheetBlock } from '../types';

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
    switch (block.type) {
        case 'header':
            return <h2 className="text-4xl font-black uppercase border-b-8 border-zinc-900 mb-8 pb-3 leading-none tracking-tighter"><EditableText value={block.content} /></h2>;
        case 'text':
            return <div className="text-2xl leading-relaxed mb-10 text-justify font-dyslexic text-zinc-800"><EditableText value={block.content} /></div>;
        case 'question':
            return (
                <div className="p-8 bg-zinc-50 border-[4px] border-zinc-900 rounded-[3rem] mb-8 shadow-sm group hover:border-indigo-500 transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-zinc-900 group-hover:bg-indigo-500 transition-colors"></div>
                    <p className="text-xl font-black mb-6 flex gap-5 items-start">
                        <span className="w-10 h-10 bg-zinc-900 text-white rounded-2xl flex items-center justify-center text-sm shrink-0 shadow-lg group-hover:bg-indigo-600 transition-colors">?</span>
                        <span className="pt-1"><EditableText value={block.content.text} /></span>
                    </p>
                    <div className="h-16 border-b-2 border-dashed border-zinc-300 w-full opacity-50"></div>
                </div>
            );
        case 'math':
            return (
                <div className="flex flex-col items-center gap-8 mb-12 p-10 bg-white border-[3px] border-zinc-100 rounded-[4rem] shadow-inner relative group">
                    <div className="flex items-center gap-10 text-5xl font-black font-mono">
                         <div className="flex flex-col items-center gap-2">
                            <span>{block.content.num1}</span>
                            {block.content.showVisual && <TenFrame count={block.content.num1} color="#6366f1" />}
                         </div>
                         <span className="text-zinc-300 group-hover:text-indigo-500 transition-colors">{block.content.operator}</span>
                         <div className="flex flex-col items-center gap-2">
                            <span>{block.content.num2}</span>
                            {block.content.showVisual && <TenFrame count={block.content.num2} color="#f43f5e" />}
                         </div>
                         <span className="text-zinc-300">=</span>
                         <div className="w-32 h-20 border-[6px] border-indigo-600 rounded-3xl bg-indigo-50/50 shadow-2xl animate-pulse"></div>
                    </div>
                </div>
            );
        case 'image':
            return <ImageDisplay prompt={block.content.prompt} className="w-full h-80 mb-10 shadow-2xl border-8 border-white rounded-[3.5rem]" />;
        default:
            return <div className="p-6 border-4 border-dashed border-zinc-100 rounded-[3rem] text-zinc-400 italic text-center mb-6">Blok verisi işleniyor...</div>;
    }
};

const UnifiedContentRenderer = ({ data }: { data: SingleWorksheetData }) => {
    if (data.blocks && data.blocks.length > 0) {
        return (
            <div className="w-full h-full flex flex-col animate-in fade-in zoom-in-95 duration-1000">
                <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
                <div className="flex-1 flex flex-col mt-6">
                    {data.blocks.map((block) => <BlockRenderer key={block.id} block={block} />)}
                </div>
            </div>
        );
    }
    
    return (
        <div className="w-full h-full flex flex-col animate-in fade-in duration-700">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            <div className="flex flex-col gap-8 mt-6">
                {(data.sections || []).map((section: any, idx: number) => (
                    <EditableElement key={idx} className="bg-white rounded-[4rem] border-[4px] border-zinc-900 shadow-sm w-full p-10 group hover:border-indigo-600 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-50 rounded-bl-full -mr-10 -mt-10 opacity-50"></div>
                        {section.title && <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-6 border-b border-indigo-50 pb-3 flex items-center gap-3"><i className="fa-solid fa-star animate-pulse"></i> <EditableText value={section.title} tag="span" /></h4>}
                        {section.type === 'text' && <div className="prose max-w-none text-zinc-800 leading-relaxed font-dyslexic text-2xl text-justify"><EditableText value={section.content} tag="div" /></div>}
                        {section.type === 'list' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {(section.items || []).map((item: string, i: number) => (
                                    <div key={i} className="flex gap-6 items-start p-6 bg-zinc-50 rounded-[2.5rem] border-2 border-zinc-100 group-hover:bg-white transition-all shadow-sm hover:shadow-md"><div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-lg">{i+1}</div><div className="flex-1 font-bold text-zinc-800 text-xl leading-snug tracking-tight"><EditableText value={item} tag="span" /></div></div>
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

    switch (activityType) {
        case ActivityType.ALGORITHM_GENERATOR: return <AlgorithmSheet data={data} />;
        case ActivityType.MATH_PUZZLE: return <MathPuzzleSheet data={data} />;
        case ActivityType.NUMBER_PATTERN: return <NumberPatternSheet data={data} />;
        case ActivityType.REAL_LIFE_MATH_PROBLEMS: return <RealLifeMathProblemsSheet data={data} />;
        case ActivityType.LOGIC_GRID_PUZZLE: return <LogicGridPuzzleSheet data={data} />;
        case ActivityType.FUTOSHIKI:
        case ActivityType.KENDOKU:
        case ActivityType.SHAPE_SUDOKU:
        case ActivityType.ODD_EVEN_SUDOKU: return <FutoshikiSheet data={data} />;
        case ActivityType.NUMBER_PYRAMID: return <NumberPyramidSheet data={data} />;
        case ActivityType.ODD_ONE_OUT:
        case ActivityType.THEMATIC_ODD_ONE_OUT: return <OddOneOutSheet data={data} />;
        case ActivityType.NUMBER_LOGIC_RIDDLES: return <NumberLogicRiddleSheet data={data} />;
        case ActivityType.NUMBER_PATH_LOGIC: return <NumberPathLogicSheet data={data} />;
        case ActivityType.VISUAL_ARITHMETIC: return <VisualArithmeticSheet data={data} />;
        case ActivityType.CLOCK_READING: return <ClockReadingSheet data={data} />;
        case ActivityType.NUMBER_SENSE: return <NumberSenseSheet data={data} />;
        case ActivityType.MONEY_COUNTING: return <MoneyCountingSheet data={data} />;
        case ActivityType.MATH_MEMORY_CARDS: return <MathMemoryCardsSheet data={data} />;
        case ActivityType.SPATIAL_GRID: return <SpatialGridSheet data={data} />;
        case ActivityType.CONCEPT_MATCH: return <ConceptMatchSheet data={data} />;
        case ActivityType.ESTIMATION: return <EstimationSheet data={data} />;
        case ActivityType.WORD_MEMORY: return <WordMemorySheet data={data} />;
        case ActivityType.VISUAL_MEMORY: return <VisualMemorySheet data={data} />;
        case ActivityType.CHARACTER_MEMORY: return <CharacterMemorySheet data={data} />;
        case ActivityType.COLOR_WHEEL_MEMORY: return <ColorWheelSheet data={data} />;
        case ActivityType.IMAGE_COMPREHENSION: return <ImageComprehensionSheet data={data} />;
        case ActivityType.STROOP_TEST: return <StroopTestSheet data={data} />;
        case ActivityType.BURDON_TEST: return <BurdonTestSheet data={data} />;
        case ActivityType.NUMBER_SEARCH: return <NumberSearchSheet data={data} />;
        case ActivityType.CHAOTIC_NUMBER_SEARCH: return <ChaoticNumberSearchSheet data={data} />;
        case ActivityType.ATTENTION_DEVELOPMENT: return <AttentionDevelopmentSheet data={data} />;
        case ActivityType.ATTENTION_FOCUS: return <AttentionFocusSheet data={data} />;
        case ActivityType.FIND_IDENTICAL_WORD: return <FindDuplicateSheet data={data} />; 
        case ActivityType.LETTER_GRID_TEST: return <LetterGridTestSheet data={data} />;
        case ActivityType.FIND_LETTER_PAIR: return <FindLetterPairSheet data={data} />;
        case ActivityType.TARGET_SEARCH: return <TargetSearchSheet data={data} />;
        case ActivityType.STORY_COMPREHENSION: return <StoryComprehensionSheet data={data} />;
        case ActivityType.SYLLABLE_MASTER_LAB: return <SyllableMasterLabSheet data={data} />;
        case ActivityType.READING_SUDOKU: return <ReadingSudokuSheet data={data} />;
        case ActivityType.READING_STROOP: return <ReadingStroopSheet data={data} />;
        case ActivityType.SYNONYM_ANTONYM_MATCH: return <SynonymAntonymMatchSheet data={data} />;
        case ActivityType.SYLLABLE_WORD_BUILDER: return <SyllableWordBuilderSheet data={data} />;
        case ActivityType.LETTER_VISUAL_MATCHING: return <LetterVisualMatchingSheet data={data} />;
        case ActivityType.FAMILY_RELATIONS: return <FamilyRelationsSheet data={data} />;
        case ActivityType.FAMILY_LOGIC_TEST: return <FamilyLogicSheet data={data} />;
        case ActivityType.MORPHOLOGY_MATRIX: return <MorphologyMatrixSheet data={data} />;
        case ActivityType.READING_PYRAMID: return <ReadingPyramidSheet data={data} />;
        case ActivityType.READING_FLOW: return <ReadingFlowSheet data={data} />;
        case ActivityType.PHONOLOGICAL_AWARENESS: return <PhonologicalAwarenessSheet data={data} />;
        case ActivityType.RAPID_NAMING: return <RapidNamingSheet data={data} />;
        case ActivityType.LETTER_DISCRIMINATION: return <LetterDiscriminationSheet data={data} />;
        case ActivityType.MIRROR_LETTERS: return <MirrorLettersSheet data={data} />;
        case ActivityType.SYLLABLE_TRAIN: return <SyllableTrainSheet data={data} />;
        case ActivityType.VISUAL_TRACKING_LINES: return <VisualTrackingLinesSheet data={data} />;
        case ActivityType.BACKWARD_SPELLING: return <BackwardSpellingSheet data={data} />;
        case ActivityType.CODE_READING: return <CodeReadingSheet data={data} />;
        case ActivityType.ATTENTION_TO_QUESTION: return <AttentionToQuestionSheet data={data} />;
        case ActivityType.HANDWRITING_PRACTICE: return <HandwritingPracticeSheet data={data} />;
        case ActivityType.MAP_INSTRUCTION: return <MapDetectiveSheet data={data} />; 
        case ActivityType.FIND_THE_DIFFERENCE: return <FindTheDifferenceSheet data={data} />;
        case ActivityType.VISUAL_ODD_ONE_OUT: return <VisualOddOneOutSheet data={data} />;
        case ActivityType.GRID_DRAWING: return <GridDrawingSheet data={data} />;
        case ActivityType.SYMMETRY_DRAWING: return <SymmetryDrawingSheet data={data} />;
        case ActivityType.SHAPE_COUNTING: return <ShapeCountingSheet data={data} />;
        case ActivityType.DIRECTIONAL_TRACKING: return <DirectionalTrackingSheet data={data} />;
        case ActivityType.HIDDEN_PASSWORD_GRID: return <HiddenPasswordGridSheet data={data} />;
        case ActivityType.WORD_SEARCH: return <WordSearchSheet data={data} />;
        case ActivityType.ANAGRAM: return <AnagramSheet data={data} />;
        case ActivityType.CROSSWORD: return <CrosswordSheet data={data} />;
        default: return <div className="p-12 text-center border-4 border-dashed border-zinc-100 rounded-[3rem]"><h3 className="font-black text-zinc-300 uppercase tracking-widest text-2xl">Modül: {activityType}</h3><p className="text-zinc-400 mt-2 font-bold">Görsel motor henüz bu tip için optimize edilmedi.</p></div>;
    }
});
