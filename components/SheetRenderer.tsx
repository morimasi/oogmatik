
import React from 'react';
import { ActivityType, SingleWorksheetData } from '../types';

// Import all sheet categories
import * as MathLogic from './sheets/MathLogicSheets';
import * as Reading from './sheets/ReadingComprehensionSheets';
import * as Visual from './sheets/VisualPerceptionSheets';
import * as Memory from './sheets/MemoryAttentionSheets';
import * as Dyslexia from './sheets/DyslexiaSupportSheets';
import * as NewActivities from './sheets/NewActivitySheets';
// Added WordGames import to fix property missing errors
import * as WordGames from './sheets/WordGameSheets';
import { AlgorithmSheet } from './sheets/AlgorithmSheets';

interface SheetRendererProps {
    activityType: ActivityType;
    data: SingleWorksheetData;
}

// --- SPECIALIZED STUDIO RENDERERS ---

const MathStudioRenderer: React.FC<{ data: any }> = ({ data }) => {
    const components = data.components || [];
    return (
        <div className="w-full flex flex-col gap-8">
            {components.filter((c: any) => c.isVisible).map((comp: any) => (
                <div key={comp.instanceId} style={{ minHeight: comp.style.h }}>
                    {comp.type === 'header' && (
                         <div className="flex flex-col border-b-2 border-black pb-2 text-black">
                            <h1 className="text-2xl font-black uppercase text-center">{comp.data.title}</h1>
                            <div className="flex justify-between mt-2 text-sm font-bold">
                                <span>Ad Soyad: ........................</span>
                                <span>Tarih: ........................</span>
                            </div>
                        </div>
                    )}
                    {comp.type === 'operation_grid' && (
                        <div className="grid grid-cols-4 gap-y-12 gap-x-4">
                            {comp.data.ops.map((op: any, i: number) => (
                                <div key={i} className="flex flex-col items-end text-2xl font-mono relative pr-4 border-b-2 border-black pb-1 text-black">
                                    <span className="text-[10px] absolute top-0 left-0 text-zinc-300">#{i+1}</span>
                                    <div className={op.unknownPos === 'n1' ? 'border-2 border-dashed border-zinc-200 w-12 h-8' : ''}>{op.n1}</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{op.op}</span>
                                        <div className={op.unknownPos === 'n2' ? 'border-2 border-dashed border-zinc-200 w-12 h-8' : ''}>{op.n2}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {comp.type === 'problem_set' && (
                        <div className="space-y-6 text-black">
                            <h3 className="font-black border-l-4 border-indigo-600 pl-2 uppercase text-sm">Problem Çözme</h3>
                            {comp.data.problems.map((p: any, i: number) => (
                                <div key={i} className="space-y-3">
                                    <p className="text-base font-medium leading-relaxed">{i+1}. {p.text}</p>
                                    <div className="h-24 w-full border-2 border-dashed border-zinc-200 rounded-xl relative">
                                        <span className="text-[10px] text-zinc-300 uppercase font-bold absolute top-2 left-2">Çözüm Alanı</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export const SheetRenderer = React.memo(({ activityType, data }: SheetRendererProps) => {
    if (!data) return null;
    
    // 1. Check for Studio / Custom Data first
    if (activityType === ActivityType.MATH_STUDIO || (data.config && data.components)) {
        return <MathStudioRenderer data={data} />;
    }

    // 2. Algorithm Generator
    if (activityType === ActivityType.ALGORITHM_GENERATOR) {
        return <AlgorithmSheet data={data} />;
    }

    // 3. Mapping for all standard activity types
    switch (activityType) {
        // MATH & LOGIC
        case ActivityType.BASIC_OPERATIONS: return <MathLogic.BasicOperationsSheet data={data} />;
        case ActivityType.REAL_LIFE_MATH_PROBLEMS: return <MathLogic.RealLifeMathProblemsSheet data={data} />;
        case ActivityType.MATH_PUZZLE: return <MathLogic.MathPuzzleSheet data={data} />;
        case ActivityType.NUMBER_PATTERN: return <MathLogic.NumberPatternSheet data={data} />;
        case ActivityType.ODD_EVEN_SUDOKU: return <MathLogic.OddEvenSudokuSheet data={data} />;
        case ActivityType.KENDOKU: return <MathLogic.KendokuSheet data={data} />;
        case ActivityType.NUMBER_PYRAMID: return <MathLogic.NumberPyramidSheet data={data} />;
        case ActivityType.NUMBER_SEARCH: return <Memory.NumberSearchSheet data={data} />;

        // VERBAL & READING
        case ActivityType.STORY_COMPREHENSION: return <Reading.StoryComprehensionSheet data={data} />;
        case ActivityType.STORY_ANALYSIS: return <Reading.StoryAnalysisSheet data={data} />;
        case ActivityType.MISSING_PARTS: return <Reading.MissingPartsSheet data={data} />;
        case ActivityType.READING_FLOW: return <Dyslexia.ReadingFlowSheet data={data} />;
        // Fix: Changed Visual to WordGames to point to correct components
        case ActivityType.ANAGRAM: return <WordGames.AnagramSheet data={data} />;
        case ActivityType.WORD_SEARCH: return <WordGames.WordSearchSheet data={data} />;
        case ActivityType.CROSSWORD: return <WordGames.CrosswordSheet data={data} />;

        // VISUAL & PERCEPTION
        case ActivityType.FIND_THE_DIFFERENCE: return <Visual.FindTheDifferenceSheet data={data} />;
        case ActivityType.VISUAL_ODD_ONE_OUT: return <Visual.VisualOddOneOutSheet data={data} />;
        case ActivityType.SHAPE_MATCHING: return <Visual.ShapeMatchingSheet data={data} />;
        case ActivityType.GRID_DRAWING: return <Visual.GridDrawingSheet data={data} />;
        case 'SYMBOL_CIPHER': return <Visual.SymbolCipherSheet data={data} />;
        
        // DYSLEXIA SPECIFIC
        case 'LETTER_DISCRIMINATION': return <Dyslexia.LetterDiscriminationSheet data={data} />;
        case 'MIRROR_LETTERS': return <Dyslexia.MirrorLettersSheet data={data} />;
        case 'VISUAL_TRACKING_LINES': return <Dyslexia.VisualTrackingLinesSheet data={data} />;
        case 'HANDWRITING_PRACTICE': return <Dyslexia.HandwritingPracticeSheet data={data} />;

        // NEW ACTIVITIES
        case 'FAMILY_RELATIONS': return <NewActivities.FamilyRelationsSheet data={data} />;
        case 'LOGIC_DEDUCTION': return <NewActivities.LogicDeductionSheet data={data} />;
        case 'MAP_INSTRUCTION': return <NewActivities.MapInstructionSheet data={data} />;
        case 'MIND_GAMES': return <NewActivities.MindGamesSheet data={data} />;

        default:
            return (
                <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
                    <i className="fa-solid fa-file-circle-question text-4xl text-zinc-300 mb-4 block"></i>
                    <h3 className="font-bold text-zinc-500">Bilinmeyen Etkinlik Türü</h3>
                    <p className="text-xs text-zinc-400 mt-1">Tür: {activityType}</p>
                </div>
            );
    }
});
