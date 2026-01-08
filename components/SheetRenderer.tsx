
import React from 'react';
import { ActivityType, SingleWorksheetData } from '../types';
import * as Memory from './sheets/MemoryAttentionSheets';
import * as Dyslexia from './sheets/DyslexiaSupportSheets';
import * as WordGames from './sheets/WordGameSheets';
import * as Visual from './sheets/VisualPerceptionSheets';
import * as Dyscalculia from './sheets/DyscalculiaSheets';
import * as NewActivities from './sheets/NewActivitySheets';

// New Isolated Components - Math & Logic
import { MathPuzzleSheet } from './sheets/math/MathPuzzleSheet';
import { NumberPatternSheet } from './sheets/math/NumberPatternSheet';
import { RealLifeMathProblemsSheet } from './sheets/math/RealLifeMathProblemsSheet';
import { LogicGridPuzzleSheet } from './sheets/math/LogicGridPuzzleSheet';
import { FutoshikiSheet } from './sheets/math/FutoshikiSheet';
import { NumberPyramidSheet } from './sheets/math/NumberPyramidSheet';
import { OddOneOutSheet } from './sheets/math/OddOneOutSheet';
import { AlgorithmSheet } from './sheets/logic/AlgorithmSheet';

// New Isolated Components - Verbal & Dyslexia
import { StoryComprehensionSheet } from './sheets/verbal/StoryComprehensionSheet';
import { SyllableMasterLabSheet } from './sheets/verbal/SyllableMasterLabSheet';
import { ReadingSudokuSheet } from './sheets/verbal/ReadingSudokuSheet';
import { ReadingStroopSheet } from './sheets/verbal/ReadingStroopSheet';
import { SynonymAntonymMatchSheet } from './sheets/verbal/SynonymAntonymMatchSheet';
import { SyllableWordBuilderSheet } from './sheets/verbal/SyllableWordBuilderSheet';
import { LetterVisualMatchingSheet } from './sheets/verbal/LetterVisualMatchingSheet';
import { FamilyLogicSheet } from './sheets/verbal/FamilyLogicSheet';

// Visual Category
import { MapDetectiveSheet } from './sheets/visual/MapDetectiveSheet'; 
import { FindTheDifferenceSheet } from './sheets/visual/FindTheDifferenceSheet';
import { VisualOddOneOutSheet } from './sheets/visual/VisualOddOneOutSheet';
import { GridDrawingSheet } from './sheets/visual/GridDrawingSheet';
import { SymmetryDrawingSheet } from './sheets/visual/SymmetryDrawingSheet';

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
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            <div className="flex flex-col gap-8">
                {(data.sections || []).map((section: any, idx: number) => (
                    <EditableElement key={idx} className="bg-white rounded-[2.5rem] border-2 border-zinc-100 shadow-sm w-full p-6 group hover:border-indigo-200 transition-all">
                        {section.title && <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4 border-b border-indigo-50 pb-2"><EditableText value={section.title} tag="span" /></h4>}
                        {section.type === 'text' && <div className="prose max-w-none text-zinc-800 leading-relaxed font-dyslexic text-lg text-justify"><EditableText value={section.content} tag="div" /></div>}
                        {section.type === 'list' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(section.items || []).map((item: string, i: number) => (
                                    <div key={i} className="flex gap-4 items-start p-4 bg-zinc-50 rounded-2xl border border-zinc-100"><div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</div><div className="flex-1 font-medium text-zinc-800"><EditableText value={item} tag="span" /></div></div>
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
    
    if (activityType === ActivityType.AI_WORKSHEET_CONVERTER || activityType === ActivityType.OCR_CONTENT || data.sections) {
        return <RichContentRenderer data={data} />;
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
        case ActivityType.STORY_COMPREHENSION: return <StoryComprehensionSheet data={data} />;
        case ActivityType.SYLLABLE_MASTER_LAB: return <SyllableMasterLabSheet data={data} />;
        case ActivityType.READING_SUDOKU: return <ReadingSudokuSheet data={data} />;
        case ActivityType.READING_STROOP: return <ReadingStroopSheet data={data} />;
        case ActivityType.SYNONYM_ANTONYM_MATCH: return <SynonymAntonymMatchSheet data={data} />;
        case ActivityType.SYLLABLE_WORD_BUILDER: return <SyllableWordBuilderSheet data={data} />;
        case ActivityType.LETTER_VISUAL_MATCHING: return <LetterVisualMatchingSheet data={data} />;
        case ActivityType.MAP_INSTRUCTION: return <MapDetectiveSheet data={data} />; 
        case ActivityType.HIDDEN_PASSWORD_GRID: return <WordGames.HiddenPasswordGridSheet data={data} />;
        case ActivityType.NUMBER_LOGIC_RIDDLES: return <NumberLogicRiddleSheet data={data} />;
        case ActivityType.FAMILY_RELATIONS: return <NewActivities.FamilyRelationsSheet data={data} />;
        case ActivityType.FAMILY_LOGIC_TEST: return <FamilyLogicSheet data={data} />;
        case ActivityType.NUMBER_SEARCH: return <Memory.NumberSearchSheet data={data} />;
        case ActivityType.CLOCK_READING: return <Dyscalculia.ClockReadingSheet data={data} />;
        case ActivityType.MONEY_COUNTING: return <Dyscalculia.MoneyCountingSheet data={data} />;
        case ActivityType.MATH_MEMORY_CARDS: return <Dyscalculia.MathMemoryCardsSheet data={data} />;
        case ActivityType.FIND_THE_DIFFERENCE: return <FindTheDifferenceSheet data={data} />;
        case ActivityType.VISUAL_ODD_ONE_OUT: return <VisualOddOneOutSheet data={data} />;
        case ActivityType.GRID_DRAWING: return <GridDrawingSheet data={data} />;
        case ActivityType.SYMMETRY_DRAWING: return <SymmetryDrawingSheet data={data} />;
        default: return <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-3xl"><h3 className="font-bold text-zinc-500 uppercase">Modül: {activityType}</h3></div>;
    }
});
