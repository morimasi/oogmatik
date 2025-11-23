
import React, { CSSProperties } from 'react';
import { ActivityType, SingleWorksheetData, AnagramsData, StyleSettings } from '../types';

import * as WordGameSheets from './sheets/WordGameSheets';
import * as ReadingSheets from './sheets/ReadingComprehensionSheets';
import * as MemorySheets from './sheets/MemoryAttentionSheets';
import * as MathLogicSheets from './sheets/MathLogicSheets';
import * as VisualSheets from './sheets/VisualPerceptionSheets';
import * as DyslexiaSheets from './sheets/DyslexiaSupportSheets';

import {
    WordSearchData, StoryData, StroopTestData, NumberPatternData, SpellingCheckData, LetterGridTestData, StoryCreationPromptData, FindTheDifferenceData, ShapeMatchingData, VisualMemoryData, StoryAnalysisData, GridDrawingData, StorySequencingData, BlockPaintingData, VisualOddOneOutData, ShapeCountingData, SymmetryDrawingData, AbcConnectData, CrosswordData, FutoshikiData, NumberPyramidData, ShapeSudokuData, LogicGridPuzzleData, MathPuzzleData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BasicOperationsData, RealLifeProblemData
} from '../types';


interface WorksheetProps {
  activityType: ActivityType | null;
  data: SingleWorksheetData[] | null;
  settings: StyleSettings;
}

const Worksheet: React.FC<WorksheetProps> = ({ activityType, data, settings }) => {
    // Veri bütünlüğü kontrolü
    if (!data || !Array.isArray(data) || data.length === 0 || !activityType) {
        return null;
    }

    const worksheetStyles: CSSProperties = {
        '--worksheet-border-color': settings.borderColor,
        '--worksheet-border-width': `${settings.borderWidth}px`,
        '--worksheet-margin': `${settings.margin}px`,
        '--worksheet-gap': `${settings.gap}px`,
        '--dynamic-cols': settings.columns,
    } as React.CSSProperties;

    const contentWrapperStyles: CSSProperties = {
        width: '100%',
    };

    const pageClasses = `page worksheet-page bg-white text-zinc-900 shadow-lg relative print:shadow-none print:m-0 print:border-none`;

    const renderContent = (singleData: SingleWorksheetData, index: number) => {
        try {
            if (!singleData) return <div className="p-4 text-red-500">Veri hatası: Boş sayfa verisi.</div>;

            switch (activityType) {
                // Word Games
                case ActivityType.WORD_SEARCH: return <WordGameSheets.WordSearchSheet data={singleData as WordSearchData} />;
                case ActivityType.ANAGRAM: return <WordGameSheets.AnagramSheet data={singleData as AnagramsData} />;
                case ActivityType.CROSSWORD: return <WordGameSheets.CrosswordSheet data={singleData as CrosswordData} />;
                case ActivityType.SPELLING_CHECK: return <WordGameSheets.SpellingCheckSheet data={singleData as SpellingCheckData} />;

                // Reading Comprehension
                case ActivityType.STORY_COMPREHENSION: return <ReadingSheets.StoryComprehensionSheet data={singleData as StoryData} />;
                case ActivityType.STORY_CREATION_PROMPT: return <ReadingSheets.StoryCreationPromptSheet data={singleData as StoryCreationPromptData} />;
                case ActivityType.STORY_ANALYSIS: return <ReadingSheets.StoryAnalysisSheet data={singleData as StoryAnalysisData} />;
                case ActivityType.STORY_SEQUENCING: return <ReadingSheets.StorySequencingSheet data={singleData as StorySequencingData} />;

                // Memory & Attention
                case ActivityType.VISUAL_MEMORY: return <MemorySheets.VisualMemorySheet data={singleData as VisualMemoryData} />;
                case ActivityType.BURDON_TEST: return <MemorySheets.BurdonTestSheet data={singleData as LetterGridTestData} />;
                case ActivityType.STROOP_TEST: return <MemorySheets.StroopTestSheet data={singleData as StroopTestData} />;

                // Math & Logic
                case ActivityType.BASIC_OPERATIONS: return <MathLogicSheets.BasicOperationsSheet data={singleData as BasicOperationsData} />;
                case ActivityType.REAL_LIFE_MATH_PROBLEMS: return <MathLogicSheets.RealLifeMathProblemsSheet data={singleData as RealLifeProblemData} />;
                case ActivityType.MATH_PUZZLE: return <MathLogicSheets.MathPuzzleSheet data={singleData as MathPuzzleData} />;
                case ActivityType.NUMBER_PATTERN: return <MathLogicSheets.NumberPatternSheet data={singleData as NumberPatternData} />;
                case ActivityType.SHAPE_COUNTING: return <MathLogicSheets.ShapeCountingSheet data={singleData as ShapeCountingData} />;
                case ActivityType.FUTOSHIKI: return <MathLogicSheets.FutoshikiSheet data={singleData as FutoshikiData} />;
                case ActivityType.NUMBER_PYRAMID: return <MathLogicSheets.NumberPyramidSheet data={singleData as NumberPyramidData} />;
                case ActivityType.SHAPE_SUDOKU: return <MathLogicSheets.ShapeSudokuSheet data={singleData as ShapeSudokuData} />;
                case ActivityType.LOGIC_GRID_PUZZLE: return <MathLogicSheets.LogicGridPuzzleSheet data={singleData as LogicGridPuzzleData} />;

                // Visual Perception
                case ActivityType.FIND_THE_DIFFERENCE: return <VisualSheets.FindTheDifferenceSheet data={singleData as FindTheDifferenceData} />;
                case ActivityType.SHAPE_MATCHING: return <VisualSheets.ShapeMatchingSheet data={singleData as ShapeMatchingData} />;
                case ActivityType.GRID_DRAWING: return <VisualSheets.GridDrawingSheet data={singleData as GridDrawingData} />;
                case ActivityType.BLOCK_PAINTING: return <VisualSheets.BlockPaintingSheet data={singleData as BlockPaintingData} />;
                case ActivityType.VISUAL_ODD_ONE_OUT: return <VisualSheets.VisualOddOneOutSheet data={singleData as VisualOddOneOutData} />;
                case ActivityType.SYMMETRY_DRAWING: return <VisualSheets.SymmetryDrawingSheet data={singleData as SymmetryDrawingData} />;
                case ActivityType.ABC_CONNECT: return <VisualSheets.AbcConnectSheet data={singleData as AbcConnectData} />;

                // Dyslexia Support
                case ActivityType.READING_FLOW: return <DyslexiaSheets.ReadingFlowSheet data={singleData as ReadingFlowData} />;
                case ActivityType.LETTER_DISCRIMINATION: return <DyslexiaSheets.LetterDiscriminationSheet data={singleData as LetterDiscriminationData} />;
                case ActivityType.RAPID_NAMING: return <DyslexiaSheets.RapidNamingSheet data={singleData as RapidNamingData} />;
                case ActivityType.PHONOLOGICAL_AWARENESS: return <DyslexiaSheets.PhonologicalAwarenessSheet data={singleData as PhonologicalAwarenessData} />;
                case ActivityType.MIRROR_LETTERS: return <DyslexiaSheets.MirrorLettersSheet data={singleData as MirrorLettersData} />;
                case ActivityType.SYLLABLE_TRAIN: return <DyslexiaSheets.SyllableTrainSheet data={singleData as SyllableTrainData} />;
                case ActivityType.VISUAL_TRACKING_LINES: return <DyslexiaSheets.VisualTrackingLinesSheet data={singleData as VisualTrackingLineData} />;

                default: return <div className="p-8 text-center text-gray-500">Bu etkinlik türü için şablon hazırlanıyor...</div>;
            }
        } catch (err) {
            console.error("Worksheet Render Error for item:", index, err);
            return <div className="p-4 border border-red-300 bg-red-50 text-red-600 rounded text-center text-sm">Etkinlik sayfası görüntülenirken bir sorun oluştu. Lütfen tekrar deneyin.</div>;
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full" style={worksheetStyles}>
             <div style={contentWrapperStyles}>
                {data.map((singleData, index) => (
                    <div key={index} className={pageClasses}>
                        {renderContent(singleData, index)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Worksheet;
