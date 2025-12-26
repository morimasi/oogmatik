
import React from 'react';
import { ActivityType, SingleWorksheetData } from '../types';
import { ImageDisplay } from './sheets/common';

// Import all sheet categories
import * as MathLogic from './sheets/MathLogicSheets';
import * as Reading from './sheets/ReadingComprehensionSheets';
import * as Visual from './sheets/VisualPerceptionSheets';
import * as Memory from './sheets/MemoryAttentionSheets';
import * as Dyslexia from './sheets/DyslexiaSupportSheets';
import * as NewActivities from './sheets/NewActivitySheets';
import * as WordGames from './sheets/WordGameSheets';
import * as Dyscalculia from './sheets/DyscalculiaSheets';
import { AlgorithmSheet } from './sheets/AlgorithmSheets';
import { NumberLogicRiddleSheet } from './sheets/NumberLogicRiddleSheet';
import { ReadingStudioContentRenderer } from './ReadingStudio/ReadingStudioContentRenderer';

interface SheetRendererProps {
    activityType: ActivityType;
    data: SingleWorksheetData;
}

// --- GENERIC RICH CONTENT RENDERER (For AI Converter & Custom Prompts) ---
const RichContentRenderer: React.FC<{ data: any }> = ({ data }) => {
    if (!data.sections) return <div className="p-8 text-center text-zinc-400 italic">İçerik yapısı çözümlenemedi.</div>;

    return (
        <div className="space-y-10 w-full text-black">
            {data.sections.map((section: any, sIdx: number) => (
                <div key={sIdx} className="break-inside-avoid">
                    {section.title && (
                        <h3 className="text-lg font-black border-b-2 border-zinc-800 pb-1 mb-4 uppercase tracking-tight">
                            {section.title}
                        </h3>
                    )}
                    <div className="space-y-6">
                        {(section.content || []).map((item: any, iIdx: number) => (
                            <div key={iIdx} className="w-full">
                                {item.type === 'text' && (
                                    <p className="text-base leading-relaxed text-justify whitespace-pre-wrap">{item.text}</p>
                                )}
                                {item.type === 'image' && item.imagePrompt && (
                                    <div className="w-full h-48 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 overflow-hidden my-4">
                                        <ImageDisplay prompt={item.imagePrompt} description={item.label || "Görsel"} className="w-full h-full object-contain" />
                                    </div>
                                )}
                                {item.type === 'question' && (
                                    <div className="pl-4 border-l-4 border-indigo-500 py-1 text-left">
                                        <p className="font-bold text-lg mb-3">{item.text || item.question}</p>
                                        {item.options && (
                                            <div className="grid grid-cols-2 gap-3">
                                                {item.options.map((opt: string, oIdx: number) => (
                                                    <div key={oIdx} className="flex items-center gap-2">
                                                        <div className="w-5 h-5 border-2 border-zinc-400 rounded-full"></div>
                                                        <span className="text-sm font-medium">{opt}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {!item.options && <div className="h-16 border-b-2 border-zinc-200 border-dashed mt-2"></div>}
                                    </div>
                                )}
                                {item.type === 'table' && (
                                    <div className="overflow-x-auto my-4">
                                        <table className="w-full border-collapse border-2 border-zinc-800">
                                            {item.headers && (
                                                <thead>
                                                    <tr className="bg-zinc-100">
                                                        {item.headers.map((h: string, hIdx: number) => (
                                                            <th key={hIdx} className="border border-zinc-800 p-2 text-xs font-black uppercase">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                            )}
                                            <tbody>
                                                {(item.rows || []).map((row: any[], rIdx: number) => (
                                                    <tr key={rIdx}>
                                                        {row.map((cell: any, cIdx: number) => (
                                                            <td key={cIdx} className="border border-zinc-800 p-3 text-sm font-bold text-center">
                                                                {cell}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- SPECIALIZED STUDIO RENDERERS ---
const MathStudioRenderer: React.FC<{ data: any }> = ({ data }) => {
    const items = data.items || [];
    const config = data.config || {};
    const mode = data.mode || 'drill';

    if (mode === 'drill') {
        return (
            <div className="grid w-full gap-y-12 gap-x-6" style={{ gridTemplateColumns: `repeat(${config.cols || 4}, 1fr)` }}>
                {items.map((op: any, i: number) => (
                    <div key={i} className="flex justify-center items-start text-black">
                        <div className="flex flex-col items-end font-mono font-black leading-none" style={{ fontSize: `${config.fontSize || 24}px` }}>
                            <div className="mr-1">{op.num1}</div>
                            <div className="flex items-center gap-2 w-full justify-end relative">
                                <span className="absolute left-0 transform -translate-x-full pr-2">{op.symbol}</span>
                                <span className="mr-1">{op.num2}</span>
                            </div>
                            {op.num3 !== undefined && (
                                <div className="flex items-center gap-2 w-full justify-end relative">
                                     <span className="absolute left-0 transform -translate-x-full pr-2">{op.symbol2 || op.symbol}</span>
                                     <span className="mr-1">{op.num3}</span>
                                </div>
                            )}
                            <div className="w-full border-b-4 border-black mb-2"></div>
                            <div className="h-[1.5em] w-full border-2 border-dashed border-zinc-200 bg-zinc-50 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8 text-black text-left">
            {items.map((prob: any, i: number) => (
                <div key={i} className="w-full mb-8 border-b border-zinc-100 pb-6 break-inside-avoid">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 mt-1 shadow-md">{i+1}</div>
                        <p className="text-lg font-medium leading-relaxed font-dyslexic">{prob.text}</p>
                    </div>
                    {config.includeSolutionBox && (
                        <div className="mt-4 w-full h-32 border-2 border-zinc-200 border-dashed rounded-2xl bg-zinc-50/50 flex items-end p-4">
                            <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Çözüm Alanı</span>
                        </div>
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

    // 2. Check for AI Worksheet Converter / Rich Content
    if (activityType === ActivityType.AI_WORKSHEET_CONVERTER || activityType === ActivityType.OCR_CONTENT || data.sections) {
        return <RichContentRenderer data={data} />;
    }

    // 3. Check for Reading Studio
    if (activityType === ActivityType.STORY_COMPREHENSION && data.layout) {
        return <ReadingStudioContentRenderer layout={data.layout} storyData={data.storyData} />;
    }

    // 4. Algorithm Generator
    if (activityType === ActivityType.ALGORITHM_GENERATOR) {
        return <AlgorithmSheet data={data} />;
    }

    // 5. Standard Activities
    switch (activityType) {
        case ActivityType.NUMBER_LOGIC_RIDDLES: return <NumberLogicRiddleSheet data={data} />;
        case ActivityType.BASIC_OPERATIONS: return <MathLogic.BasicOperationsSheet data={data} />;
        case ActivityType.REAL_LIFE_MATH_PROBLEMS: return <MathLogic.RealLifeMathProblemsSheet data={data} />;
        case ActivityType.MATH_PUZZLE: return <MathLogic.MathPuzzleSheet data={data} />;
        case ActivityType.NUMBER_PATTERN: return <MathLogic.NumberPatternSheet data={data} />;
        case ActivityType.ODD_EVEN_SUDOKU: return <MathLogic.OddEvenSudokuSheet data={data} />;
        case ActivityType.KENDOKU: return <MathLogic.KendokuSheet data={data} />;
        case ActivityType.NUMBER_PYRAMID: return <MathLogic.NumberPyramidSheet data={data} />;
        case ActivityType.NUMBER_SEARCH: return <Memory.NumberSearchSheet data={data} />;
        case ActivityType.CLOCK_READING: return <Dyscalculia.ClockReadingSheet data={data} />;
        case ActivityType.MONEY_COUNTING: return <Dyscalculia.MoneyCountingSheet data={data} />;
        case ActivityType.MATH_MEMORY_CARDS: return <Dyscalculia.MathMemoryCardsSheet data={data} />;
        case ActivityType.STORY_COMPREHENSION: return <Reading.StoryComprehensionSheet data={data} />;
        case ActivityType.STORY_ANALYSIS: return <Reading.StoryAnalysisSheet data={data} />;
        case ActivityType.STORY_CREATION_PROMPT: return <Reading.StoryCreationPromptSheet data={data} />;
        case ActivityType.MISSING_PARTS: return <Reading.MissingPartsSheet data={data} />;
        case ActivityType.READING_FLOW: return <Dyslexia.ReadingFlowSheet data={data} />;
        case ActivityType.ANAGRAM: return <WordGames.AnagramSheet data={data} />;
        case ActivityType.WORD_SEARCH: return <WordGames.WordSearchSheet data={data} />;
        case ActivityType.CROSSWORD: return <WordGames.CrosswordSheet data={data} />;
        case ActivityType.FIND_THE_DIFFERENCE: return <Visual.FindTheDifferenceSheet data={data} />;
        case ActivityType.VISUAL_ODD_ONE_OUT: return <Visual.VisualOddOneOutSheet data={data} />;
        case ActivityType.SHAPE_MATCHING: return <Visual.ShapeMatchingSheet data={data} />;
        case ActivityType.GRID_DRAWING: return <Visual.GridDrawingSheet data={data} />;
        default:
            return (
                <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
                    <i className="fa-solid fa-file-circle-question text-4xl text-zinc-300 mb-4 block"></i>
                    <h3 className="font-bold text-zinc-500">Etkinlik içeriği yükleniyor veya bu tip desteklenmiyor.</h3>
                    <p className="text-xs text-zinc-400 mt-1">Tür: {activityType}</p>
                </div>
            );
    }
});
