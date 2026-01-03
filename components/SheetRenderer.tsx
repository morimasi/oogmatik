
import React from 'react';
import { ActivityType, SingleWorksheetData } from '../types';
import * as MathLogic from './sheets/MathLogicSheets';
import * as Memory from './sheets/MemoryAttentionSheets';
import * as Reading from './sheets/ReadingComprehensionSheets';
import * as Dyslexia from './sheets/DyslexiaSupportSheets';
import * as WordGames from './sheets/WordGameSheets';
import * as Visual from './sheets/VisualPerceptionSheets';
import * as Dyscalculia from './sheets/DyscalculiaSheets';
import * as NewActivities from './sheets/NewActivitySheets';
import { AlgorithmSheet } from './sheets/AlgorithmSheets';
import { MapDetectiveSheet } from './sheets/MapDetectiveSheet'; 
import { NumberLogicRiddleSheet } from './sheets/NumberLogicRiddleSheet';
import { ReadingStudioContentRenderer } from './ReadingStudio/ReadingStudioContentRenderer';
import { ImageDisplay, PedagogicalHeader } from './sheets/common';
import { EditableText, EditableElement } from './Editable';

interface SheetRendererProps {
    activityType: ActivityType;
    data: SingleWorksheetData;
}

const RichContentRenderer = ({ data }: { data: any }) => {
    return (
        <div className="space-y-10 w-full animate-in fade-in duration-700">
            <PedagogicalHeader 
                title={data.title} 
                instruction={data.instruction} 
                note={data.pedagogicalNote} 
                data={data}
            />
            
            <div className="flex flex-col gap-8">
                {(data.sections || []).map((section: any, idx: number) => {
                    const isGrid = section.type === 'grid';
                    const isMatching = section.type === 'matching';
                    const isText = section.type === 'text';

                    return (
                        <EditableElement key={idx} className={`bg-white rounded-[2.5rem] border-2 border-zinc-100 shadow-sm w-full relative overflow-hidden group hover:border-indigo-200 transition-all ${isText ? 'p-8' : 'p-6'}`}>
                            {section.title && (
                                <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-indigo-50 pb-2">
                                    <i className={`fa-solid ${isGrid ? 'fa-table-cells' : isMatching ? 'fa-arrows-left-right' : 'fa-align-left'}`}></i>
                                    <EditableText value={section.title} tag="span" />
                                </h4>
                            )}
                            
                            {section.type === 'text' && (
                                <div className="prose max-w-none text-zinc-800 leading-relaxed font-dyslexic text-lg text-justify">
                                    <EditableText value={section.content} tag="div" />
                                </div>
                            )}
                            
                            {section.type === 'image' && (
                                <div className="w-full h-72 bg-zinc-50 rounded-3xl overflow-hidden my-4 border border-zinc-100">
                                    <ImageDisplay prompt={section.content} description={section.title} className="w-full h-full" />
                                </div>
                            )}
                            
                            {section.type === 'list' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(section.items || []).map((item: string, i: number) => (
                                        <div key={i} className="flex gap-4 items-start p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                            <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</div>
                                            <div className="flex-1 font-medium text-zinc-800"><EditableText value={item} tag="span" /></div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {section.type === 'grid' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        {section.columnLabels && (
                                            <thead>
                                                <tr>
                                                    {section.columnLabels.map((label: string, i: number) => (
                                                        <th key={i} className="p-3 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest border border-zinc-800">
                                                            {label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                        )}
                                        <tbody>
                                            {(section.gridData || section.items?.map((it:any)=>[it]) || []).map((row: string[], rIdx: number) => (
                                                <tr key={rIdx}>
                                                    {row.map((cell, cIdx) => (
                                                        <td key={cIdx} className="p-4 border border-zinc-200 text-center font-bold text-sm text-zinc-700 bg-white hover:bg-indigo-50/30 transition-colors">
                                                            <EditableText value={cell} tag="span" />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {isMatching && (
                                <div className="flex justify-between gap-12 py-4">
                                    <div className="flex-1 space-y-3">
                                        {(section.items || []).slice(0, Math.ceil(section.items.length/2)).map((item: string, i: number) => (
                                            <div key={i} className="p-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl flex items-center justify-between group/row">
                                                <span className="text-sm font-bold text-zinc-700"><EditableText value={item} tag="span" /></span>
                                                <div className="w-3 h-3 rounded-full bg-zinc-300 group-hover/row:bg-indigo-400 transition-colors"></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        {(section.items || []).slice(Math.ceil(section.items.length/2)).map((item: string, i: number) => (
                                            <div key={i} className="p-3 bg-zinc-50 border-2 border-zinc-100 rounded-xl flex items-center gap-3 group/row">
                                                <div className="w-3 h-3 rounded-full bg-zinc-300 group-hover/row:bg-indigo-400 transition-colors"></div>
                                                <span className="text-sm font-bold text-zinc-700"><EditableText value={item} tag="span" /></span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </EditableElement>
                    );
                })}
            </div>
            
            <div className="pt-10 border-t border-zinc-100 flex justify-between items-center opacity-40">
                <p className="text-[8px] font-black uppercase tracking-[0.4em]">Bursa Disleksi AI • Tasarım Klonlama Modülü v2.0</p>
                <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
        </div>
    );
};

export const SheetRenderer = React.memo(({ activityType, data }: SheetRendererProps) => {
    if (!data) return null;
    
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
        case ActivityType.READING_STROOP: return <Reading.ReadingStroopSheet data={data} />;
        case ActivityType.MAP_INSTRUCTION: return <MapDetectiveSheet data={data} />; 
        case ActivityType.HIDDEN_PASSWORD_GRID: return <WordGames.HiddenPasswordGridSheet data={data} />;
        case ActivityType.NUMBER_LOGIC_RIDDLES: return <NumberLogicRiddleSheet data={data} />;
        case ActivityType.REAL_LIFE_MATH_PROBLEMS: return <MathLogic.RealLifeMathProblemsSheet data={data} />;
        case ActivityType.MATH_PUZZLE: return <MathLogic.MathPuzzleSheet data={data} />;
        case ActivityType.NUMBER_PATTERN: return <MathLogic.NumberPatternSheet data={data} />;
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
        case ActivityType.PHONOLOGICAL_AWARENESS: return <Dyslexia.PhonologicalAwarenessSheet data={data} />;
        case ActivityType.RAPID_NAMING: return <Dyslexia.RapidNamingSheet data={data} />;
        case ActivityType.LETTER_DISCRIMINATION: return <Dyslexia.LetterDiscriminationSheet data={data} />;
        case ActivityType.MIRROR_LETTERS: return <Dyslexia.MirrorLettersSheet data={data} />;
        case ActivityType.SYLLABLE_TRAIN: return <Dyslexia.SyllableTrainSheet data={data} />;
        case ActivityType.VISUAL_TRACKING_LINES: return <Dyslexia.VisualTrackingLinesSheet data={data} />;
        case ActivityType.BACKWARD_SPELLING: return <Dyslexia.BackwardSpellingSheet data={data} />;
        case ActivityType.CODE_READING: return <Dyslexia.CodeReadingSheet data={data} />;
        case ActivityType.ATTENTION_TO_QUESTION: return <Dyslexia.AttentionToQuestionSheet data={data} />;
        case ActivityType.ATTENTION_DEVELOPMENT: return <Dyslexia.AttentionDevelopmentSheet data={data} />;
        case ActivityType.ATTENTION_FOCUS: return <Dyslexia.AttentionFocusSheet data={data} />;
        case ActivityType.HANDWRITING_PRACTICE: return <Dyslexia.HandwritingPracticeSheet data={data} />;
        case ActivityType.ANAGRAM: return <WordGames.AnagramSheet data={data} />;
        case ActivityType.WORD_SEARCH: return <WordGames.WordSearchSheet data={data} />;
        case ActivityType.CROSSWORD: return <WordGames.CrosswordSheet data={data} />;
        case ActivityType.FIND_THE_DIFFERENCE: return <Visual.FindTheDifferenceSheet data={data} />;
        case ActivityType.VISUAL_ODD_ONE_OUT: return <Visual.VisualOddOneOutSheet data={data} />;
        case ActivityType.SHAPE_MATCHING: return <Visual.ShapeMatchingSheet data={data} />;
        case ActivityType.GRID_DRAWING: return <Visual.GridDrawingSheet data={data} />;
        case ActivityType.SYMMETRY_DRAWING: return <Visual.SymmetryDrawingSheet data={data} />;
        case ActivityType.FIND_IDENTICAL_WORD: return <Visual.FindIdenticalWordSheet data={data} />;
        case ActivityType.FIND_DIFFERENT_STRING: return <Visual.FindDifferentStringSheet data={data} />;
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
