
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
import { ReadingStudioContentRenderer } from './ReadingStudio/ReadingStudioContentRenderer';

interface SheetRendererProps {
    activityType: ActivityType;
    data: SingleWorksheetData;
}

// --- SPECIALIZED STUDIO RENDERERS ---

const MathStudioRenderer: React.FC<{ data: any }> = ({ data }) => {
    // If it's a wrapper object (like from archive), extract the actual items
    const items = data.items || [];
    const config = data.config || {};
    const pageConfig = data.pageConfig || {};
    const mode = data.mode || 'drill';

    if (mode === 'drill') {
        return (
            <div 
                className="grid w-full gap-y-8 gap-x-4" 
                style={{ 
                    gridTemplateColumns: `repeat(${config.cols || 4}, 1fr)`,
                }}
            >
                {items.map((op: any, i: number) => (
                    <div key={i} className="flex justify-center items-start text-black">
                        <div className="flex flex-col items-end font-mono font-bold leading-none" style={{ fontSize: `${config.fontSize || 20}px` }}>
                            <div>{op.num1}</div>
                            <div className="flex items-center gap-2 w-full justify-end relative">
                                <span className="absolute left-0 transform -translate-x-1/2">{op.symbol}</span>
                                <span>{op.num2}</span>
                            </div>
                            {op.num3 !== undefined && (
                                <div className="flex items-center gap-2 w-full justify-end relative">
                                     <span className="absolute left-0 transform -translate-x-1/2">{op.symbol2 || op.symbol}</span>
                                     <span>{op.num3}</span>
                                </div>
                            )}
                            <div className="w-full border-b-2 border-black mb-1"></div>
                            <div className="h-[1.2em]"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 text-black">
            {items.map((prob: any, i: number) => (
                <div key={i} className="w-full mb-6 border-b border-zinc-100 pb-4">
                    <div className="flex gap-3">
                        <span className="font-bold text-indigo-600">{i+1}.</span>
                        <p className="text-base font-medium leading-relaxed">{prob.text}</p>
                    </div>
                    {config.includeSolutionBox && (
                        <div className="mt-4 w-full h-24 border border-zinc-300 border-dashed rounded-lg bg-zinc-50/30"></div>
                    )}
                </div>
            ))}
        </div>
    );
};

export const SheetRenderer = React.memo(({ activityType, data }: SheetRendererProps) => {
    if (!data) return null;
    
    // 1. Check for Math Studio
    if (activityType === ActivityType.MATH_STUDIO || data.isMathStudio) {
        return <MathStudioRenderer data={data} />;
    }

    // 2. Check for Reading Studio (STORY_COMPREHENSION can be studio based)
    if (activityType === ActivityType.STORY_COMPREHENSION && data.layout) {
        return <ReadingStudioContentRenderer layout={data.layout} storyData={data.storyData} />;
    }

    // 3. Algorithm Generator
    if (activityType === ActivityType.ALGORITHM_GENERATOR) {
        return <AlgorithmSheet data={data} />;
    }

    // 4. Mapping for all standard activity types
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
