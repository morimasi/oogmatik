
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

// Added missing SheetRendererProps interface
interface SheetRendererProps {
    activityType: ActivityType;
    data: any;
}

export const SheetRenderer = React.memo(({ activityType, data }: SheetRendererProps) => {
    if (!data) return null;
    
    switch (activityType) {
        case ActivityType.PSEUDOWORD_READING: return <Dyslexia.PseudowordReadingSheet data={data} />;
        case ActivityType.BASIC_OPERATIONS: return <MathLogic.BasicOperationsSheet data={data} />;
        case ActivityType.MATH_PUZZLE: return <MathLogic.MathPuzzleSheet data={data} />;
        case ActivityType.NUMBER_PATTERN: return <MathLogic.NumberPatternSheet data={data} />;
        case ActivityType.KENDOKU: return <MathLogic.KendokuSheet data={data} />;
        case ActivityType.NUMBER_PYRAMID: return <MathLogic.NumberPyramidSheet data={data} />;
        case ActivityType.REAL_LIFE_MATH_PROBLEMS: return <MathLogic.RealLifeMathProblemsSheet data={data} />;
        case ActivityType.CLOCK_READING: return <Dyscalculia.ClockReadingSheet data={data} />;
        case ActivityType.MONEY_COUNTING: return <Dyscalculia.MoneyCountingSheet data={data} />;
        case ActivityType.MATH_MEMORY_CARDS: return <Dyscalculia.MathMemoryCardsSheet data={data} />;
        case ActivityType.STORY_COMPREHENSION: 
            if (data.layout) return <ReadingStudioContentRenderer layout={data.layout} storyData={data.storyData} />;
            return <Reading.StoryComprehensionSheet data={data} />;
        case ActivityType.STORY_ANALYSIS: return <Reading.StoryAnalysisSheet data={data} />;
        case ActivityType.STORY_CREATION_PROMPT: return <Reading.StoryCreationPromptSheet data={data} />;
        case ActivityType.MISSING_PARTS: return <Reading.MissingPartsSheet data={data} />;
        case ActivityType.ALGORITHM_GENERATOR: return <AlgorithmSheet data={data} />;
        case ActivityType.MAP_INSTRUCTION: return <MapDetectiveSheet data={data} />; 
        case ActivityType.HIDDEN_PASSWORD_GRID: return <WordGames.HiddenPasswordGridSheet data={data} />;
        case ActivityType.NUMBER_LOGIC_RIDDLES: return <NumberLogicRiddleSheet data={data} />;
        case ActivityType.FIND_THE_DIFFERENCE: return <Visual.FindTheDifferenceSheet data={data} />;
        case ActivityType.VISUAL_ODD_ONE_OUT: return <Visual.VisualOddOneOutSheet data={data} />;
        case ActivityType.GRID_DRAWING: return <Visual.GridDrawingSheet data={data} />;
        case ActivityType.SYMMETRY_DRAWING: return <Visual.SymmetryDrawingSheet data={data} />;
        case ActivityType.WORD_SEARCH: return <WordGames.WordSearchSheet data={data} />;
        case ActivityType.ANAGRAM: return <WordGames.AnagramSheet data={data} />;
        case ActivityType.CROSSWORD: return <WordGames.CrosswordSheet data={data} />;
        case ActivityType.WORD_MEMORY: return <Memory.WordMemorySheet data={data} />;
        case ActivityType.VISUAL_MEMORY: return <Memory.VisualMemorySheet data={data} />;
        case ActivityType.STROOP_TEST: return <Memory.StroopTestSheet data={data} />;
        case ActivityType.BURDON_TEST: return <Memory.BurdonTestSheet data={data} />;
        case ActivityType.NUMBER_SEARCH: return <Memory.NumberSearchSheet data={data} />;
        case ActivityType.LOGIC_GRID_PUZZLE: return <MathLogic.LogicGridPuzzleSheet data={data} />;
        case ActivityType.AI_WORKSHEET_CONVERTER: 
            return (
                <div className="p-8">
                    <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
                    {data.sections?.map((section: any, i: number) => (
                        <div key={i} className="mb-6">
                            {section.title && <h4 className="font-bold text-lg mb-2">{section.title}</h4>}
                            {section.type === 'text' && <p className="leading-relaxed">{section.content}</p>}
                            {section.type === 'list' && (
                                <ul className="list-disc list-inside space-y-1">
                                    {section.items?.map((item: string, j: number) => <li key={j}>{item}</li>)}
                                </ul>
                            )}
                            {section.type === 'image' && <ImageDisplay prompt={section.content} className="w-full h-48" />}
                        </div>
                    ))}
                </div>
            );
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
