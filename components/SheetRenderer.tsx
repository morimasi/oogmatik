import React from 'react';
import { ActivityType, SingleWorksheetData } from '../types';
import * as MathLogic from './sheets/MathLogicSheets';
import * as Memory from './sheets/MemoryAttentionSheets';
import * as Reading from './sheets/ReadingComprehensionSheets';
import * as Dyslexia from './sheets/DyslexiaSupportSheets';
import * as WordGames from './sheets/WordGameSheets';
import * as Visual from './sheets/VisualPerceptionSheets';
import * as Dyscalculia from './sheets/DyscalculiaSheets';
import { AlgorithmSheet } from './sheets/AlgorithmSheets';
import { NumberLogicRiddleSheet } from './sheets/NumberLogicRiddleSheet';
import { ReadingStudioContentRenderer } from './ReadingStudio/ReadingStudioContentRenderer';
import { ImageDisplay, PedagogicalHeader } from './sheets/common';
import { EditableText } from './Editable';

interface SheetRendererProps {
    activityType: ActivityType;
    data: SingleWorksheetData;
}

const RichContentRenderer: React.FC<{ data: any }> = ({ data }) => {
    if (!data || !data.sections) return null;
    return (
        <div className="space-y-8">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            {data.sections.map((section: any, idx: number) => (
                <div key={idx} className="break-inside-avoid">
                    {section.title && <h4 className="font-bold text-lg mb-4 border-b-2 border-zinc-800 pb-1 uppercase">{section.title}</h4>}
                    <div className="space-y-4">
                        {section.content.map((item: any, i: number) => {
                            if (item.type === 'text') return <div key={i} className="text-sm leading-relaxed"><EditableText value={item.text} tag="p" /></div>;
                            if (item.type === 'image') return <div key={i} className="w-full h-48 my-4"><ImageDisplay prompt={item.imagePrompt} /></div>;
                            if (item.type === 'table') {
                                return (
                                    <div key={i} className="overflow-x-auto my-4">
                                        <table className="w-full border-collapse border border-zinc-300">
                                            {item.headers && (
                                                <thead className="bg-zinc-100">
                                                    <tr>{item.headers.map((h: string, j: number) => <th key={j} className="border border-zinc-300 p-2 text-xs uppercase">{h}</th>)}</tr>
                                                </thead>
                                            )}
                                            <tbody>
                                                {item.rows.map((row: string[], j: number) => (
                                                    <tr key={j}>{row.map((cell, k) => <td key={k} className="border border-zinc-300 p-2 text-sm">{cell}</td>)}</tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            }
                            if (item.type === 'question') {
                                return (
                                    <div key={i} className="my-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200 shadow-sm">
                                        <p className="font-bold mb-2">{item.text || item.label}</p>
                                        {item.options && (
                                            <div className="grid grid-cols-2 gap-3">
                                                {item.options.map((opt: string, j: number) => (
                                                    <div key={j} className="flex items-center gap-2 text-sm">
                                                        <div className="w-4 h-4 border-2 border-zinc-300 rounded-full"></div>
                                                        <span className="font-medium text-zinc-700">{opt}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-4 h-8 border-b-2 border-dashed border-zinc-200"></div>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

const MathStudioRenderer: React.FC<{ data: any }> = ({ data }) => {
    const { items, pageConfig, mode } = data;
    return (
        <div className="flex flex-col text-black">
            <div className="border-b-4 border-zinc-900 pb-2 mb-6 flex justify-between items-end">
                <h1 className="text-3xl font-black uppercase tracking-tight"><EditableText value={pageConfig.title} /></h1>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">MATH STUDIO PRO</div>
            </div>
            {mode === 'drill' ? (
                <div className="grid grid-cols-4 gap-y-12 gap-x-8">
                    {items.map((op: any, i: number) => (
                        <div key={i} className="flex flex-col items-end text-3xl font-mono font-black p-2 break-inside-avoid border-2 border-transparent hover:border-indigo-100 rounded-xl transition-colors">
                            <div className="mr-1">{op.num1}</div>
                            <div className="flex justify-between w-full relative">
                                <span className="absolute left-0 text-xl font-bold opacity-30">{op.symbol}</span>
                                <span className="mr-1">{op.num2}</span>
                            </div>
                            {op.num3 !== undefined && (
                                <div className="flex justify-between w-full relative">
                                    <span className="absolute left-0 text-xl font-bold opacity-30">{op.symbol2 || op.symbol}</span>
                                    <span className="mr-1">{op.num3}</span>
                                </div>
                            )}
                            <div className="w-full border-b-4 border-zinc-900 my-1"></div>
                            <div className="h-12 w-full border-2 border-dashed border-zinc-200 rounded bg-zinc-50/50"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    {items.map((p: any, i: number) => (
                        <div key={i} className="p-8 border-4 border-zinc-100 rounded-[2.5rem] bg-white shadow-sm break-inside-avoid group">
                            <div className="flex gap-4">
                                <span className="bg-zinc-900 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-lg">{i+1}</span>
                                <p className="text-xl font-bold leading-relaxed text-zinc-800 flex-1"><EditableText value={p.text} /></p>
                            </div>
                            <div className="mt-8 h-40 border-2 border-dashed border-zinc-200 rounded-3xl relative bg-zinc-50/30">
                                <span className="absolute top-4 right-6 text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">Çözüm Alanı</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const SheetRenderer = React.memo(({ activityType, data }: SheetRendererProps) => {
    if (!data) return null;
    
    if (activityType === ActivityType.MATH_STUDIO || data.isMathStudio) {
        return <MathStudioRenderer data={data} />;
    }

    if (activityType === ActivityType.AI_WORKSHEET_CONVERTER || activityType === ActivityType.OCR_CONTENT || data.sections) {
        return <RichContentRenderer data={data} />;
    }

    if (activityType === ActivityType.STORY_COMPREHENSION && data.layout) {
        return <ReadingStudioContentRenderer layout={data.layout} storyData={data.storyData} />;
    }

    if (activityType === ActivityType.ALGORITHM_GENERATOR) {
        return <AlgorithmSheet data={data} />;
    }

    switch (activityType) {
        case ActivityType.HIDDEN_PASSWORD_GRID: return <WordGames.HiddenPasswordGridSheet data={data} />;
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
                    <h3 className="font-bold text-zinc-500 uppercase tracking-tight">İçerik Hazırlanıyor</h3>
                    <p className="text-xs text-zinc-400 mt-2 font-medium">Modül: {activityType}</p>
                </div>
            );
    }
});
