
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

// Fix: Implemented RichContentRenderer to render section-based content produced by multimodal AI analysis
const RichContentRenderer = ({ data }: { data: any }) => {
    return (
        <div className="space-y-8 w-full">
            <PedagogicalHeader 
                title={data.title} 
                instruction={data.instruction} 
                note={data.pedagogicalNote} 
                data={data}
            />
            
            <div className="space-y-6">
                {(data.sections || []).map((section: any, idx: number) => (
                    <EditableElement key={idx} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm w-full">
                        {section.title && (
                            <h4 className="text-sm font-black text-indigo-600 uppercase mb-3 border-b border-indigo-100 pb-1">
                                <EditableText value={section.title} tag="span" />
                            </h4>
                        )}
                        
                        {section.type === 'text' && (
                            <div className="prose max-w-none text-zinc-800 leading-relaxed font-dyslexic">
                                <EditableText value={section.content} tag="div" />
                            </div>
                        )}
                        
                        {section.type === 'image' && (
                            <div className="w-full h-64 bg-zinc-50 rounded-xl overflow-hidden my-4">
                                <ImageDisplay prompt={section.content} description={section.title} className="w-full h-full" />
                            </div>
                        )}
                        
                        {section.type === 'list' && (
                            <ul className="space-y-3">
                                {(section.items || []).map((item: string, i: number) => (
                                    <li key={i} className="flex gap-3 items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
                                        <div className="flex-1"><EditableText value={item} tag="span" /></div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {section.type === 'grid' && (
                            <div className="grid grid-cols-2 gap-4">
                                {(section.items || []).map((item: string, i: number) => (
                                    <div key={i} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 font-bold text-center flex items-center justify-center min-h-[60px]">
                                        <EditableText value={item} tag="span" />
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
    
    // Fix: Now correctly using RichContentRenderer
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
        case ActivityType.MAP_INSTRUCTION: return <MapDetectiveSheet data={data} />; 
        case ActivityType.HIDDEN_PASSWORD_GRID: return <WordGames.HiddenPasswordGridSheet data={data} />;
        case ActivityType.NUMBER_LOGIC_RIDDLES: return <NumberLogicRiddleSheet data={data} />;
        case ActivityType.BASIC_OPERATIONS: return <MathLogic.BasicOperationsSheet data={data} />;
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
        /* Fix: Added missing cases and correct type mappings */
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
