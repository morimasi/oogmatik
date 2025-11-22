
import React, { CSSProperties } from 'react';
import { ActivityType, SingleWorksheetData, AnagramsData } from '../types';
import { StyleSettings } from '../App';

import * as WordGameSheets from './sheets/WordGameSheets';
import * as ReadingSheets from './sheets/ReadingComprehensionSheets';
import * as MemorySheets from './sheets/MemoryAttentionSheets';
import * as MathLogicSheets from './sheets/MathLogicSheets';
import * as VisualSheets from './sheets/VisualPerceptionSheets';
import * as DyslexiaSheets from './sheets/DyslexiaSupportSheets';

import {
    WordSearchData, WordSearchWithPasswordData, ProverbSearchData, LetterGridWordFindData, ThematicWordSearchColorData, SynonymWordSearchData, SynonymSearchAndStoryData, StoryData, StroopTestData, NumberPatternData, SpellingCheckData, LetterGridTestData, NumberSearchData, WordMemoryData, StoryCreationPromptData, FindTheDifferenceData, WordComparisonData, WordsInStoryData, OddOneOutData, ShapeMatchingData, SymbolCipherData, ProverbFillData, LetterBridgeData, FindDuplicateData, FindLetterPairData, WordLadderData, WordFormationData, ReverseWordData, WordGroupingData, VisualMemoryData, StoryAnalysisData, CoordinateCipherData, TargetSearchData, ShapeNumberPatternData, GridDrawingData, ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, StorySequencingData, ChaoticNumberSearchData, BlockPaintingData, MiniWordGridData, VisualOddOneOutData, ShapeCountingData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, PasswordFinderData, SyllableCompletionData, WordConnectData, SpiralPuzzleData, CrosswordData, JumbledWordStoryData, HomonymSentenceData, WordGridPuzzleData, ProverbSayingSortData, HomonymImageMatchData, AntonymFlowerPuzzleData, ProverbWordChainData, ThematicOddOneOutData, SynonymAntonymGridData, PunctuationColoringData, TargetNumberData, OperationSquareMultDivData, FutoshikiData, ShapeSudokuData, WeightConnectData, PunctuationMazeData, AntonymResfebeData, ThematicOddOneOutSentenceData, ProverbSentenceFinderData, ColumnOddOneOutSentenceData, SynonymAntonymColoringData, PunctuationPhoneNumberData, PunctuationSpiralPuzzleData, ThematicJumbledWordStoryData, SynonymMatchingPatternData, NumberPyramidData, NumberCapsuleData, OddEvenSudokuData, RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData, RomanNumeralMultiplicationData, ArithmeticConnectData, RomanArabicMatchConnectData, Sudoku6x6ShadedData, KendokuData, DivisionPyramidData, MultiplicationPyramidData, OperationSquareSubtractionData, OperationSquareFillInData, MultiplicationWheelData, ResfebeData, FutoshikiLengthData, MatchstickSymmetryData, WordWebData, StarHuntData, LengthConnectData, VisualNumberPatternData, MissingPartsData, ProfessionConnectData, VisualOddOneOutThemedData, LogicGridPuzzleData, ImageAnagramSortData, AnagramImageMatchData, SyllableWordSearchData, WordWebWithPasswordData, WordPlacementPuzzleData, PositionalAnagramData, MathPuzzleData, FindIdenticalWordData,
    ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, BasicOperationsData, RealLifeProblemData
} from '../types';


interface WorksheetProps {
  activityType: ActivityType | null;
  data: SingleWorksheetData[] | null;
  settings: StyleSettings;
}

const Worksheet: React.FC<WorksheetProps> = ({ activityType, data, settings }) => {
    if (!data || !activityType) return null;

    const worksheetStyles: CSSProperties = {
        '--worksheet-border-color': settings.borderColor,
        '--worksheet-border-width': `${settings.borderWidth}px`,
        '--worksheet-margin': `${settings.margin}px`,
        '--worksheet-gap': `${settings.gap}px`,
    } as React.CSSProperties;

    const contentWrapperStyles: CSSProperties = {
        columnCount: settings.columns > 1 ? settings.columns : 'auto',
        columnGap: '2rem',
        width: '100%',
    };

    // Remove overflow-hidden to allow print flow
    const pageClasses = `page worksheet-page bg-white text-zinc-900 shadow-lg relative print:shadow-none print:m-0 print:border-none`;

    const renderContent = (singleData: SingleWorksheetData, index: number) => {
        switch (activityType) {
            // Word Games
            case ActivityType.WORD_SEARCH: 
            case ActivityType.PROVERB_SEARCH:
            case ActivityType.WORD_SEARCH_WITH_PASSWORD:
            case ActivityType.LETTER_GRID_WORD_FIND:
            case ActivityType.THEMATIC_WORD_SEARCH_COLOR:
                 return <WordGameSheets.WordSearchSheet data={singleData as WordSearchData | WordSearchWithPasswordData | ProverbSearchData | LetterGridWordFindData | ThematicWordSearchColorData} />;
            case ActivityType.SYNONYM_WORD_SEARCH: return <WordGameSheets.SynonymWordSearchSheet data={singleData as SynonymWordSearchData} />;
            case ActivityType.SYNONYM_SEARCH_STORY: return <WordGameSheets.SynonymSearchAndStorySheet data={singleData as SynonymSearchAndStoryData} />;
            case ActivityType.ANAGRAM: return <WordGameSheets.AnagramSheet data={singleData as AnagramsData} />;
            case ActivityType.SPELLING_CHECK: return <WordGameSheets.SpellingCheckSheet data={singleData as SpellingCheckData} />;
            case ActivityType.LETTER_BRIDGE: return <WordGameSheets.LetterBridgeSheet data={singleData as LetterBridgeData} />;
            case ActivityType.WORD_LADDER: return <WordGameSheets.WordLadderSheet data={singleData as WordLadderData} />;
            case ActivityType.WORD_FORMATION: return <WordGameSheets.WordFormationSheet data={singleData as WordFormationData} />;
            case ActivityType.REVERSE_WORD: return <WordGameSheets.ReverseWordSheet data={singleData as ReverseWordData} />;
            case ActivityType.WORD_GROUPING: return <WordGameSheets.WordGroupingSheet data={singleData as WordGroupingData} />;
            case ActivityType.MINI_WORD_GRID: return <WordGameSheets.MiniWordGridSheet data={singleData as MiniWordGridData} />;
            case ActivityType.PASSWORD_FINDER: return <WordGameSheets.PasswordFinderSheet data={singleData as PasswordFinderData} />;
            case ActivityType.SYLLABLE_COMPLETION: return <WordGameSheets.SyllableCompletionSheet data={singleData as SyllableCompletionData} />;
            case ActivityType.SPIRAL_PUZZLE:
            case ActivityType.PUNCTUATION_SPIRAL_PUZZLE:
                 return <WordGameSheets.SpiralPuzzleSheet data={singleData as SpiralPuzzleData | PunctuationSpiralPuzzleData} />;
            case ActivityType.CROSSWORD: return <WordGameSheets.CrosswordSheet data={singleData as CrosswordData} />;
            case ActivityType.JUMBLED_WORD_STORY:
            case ActivityType.THEMATIC_JUMBLED_WORD_STORY:
                 return <WordGameSheets.JumbledWordStorySheet data={singleData as JumbledWordStoryData | ThematicJumbledWordStoryData} />;
            case ActivityType.HOMONYM_SENTENCE_WRITING: return <WordGameSheets.HomonymSentenceSheet data={singleData as HomonymSentenceData} />;
            case ActivityType.WORD_GRID_PUZZLE: return <WordGameSheets.WordGridPuzzleSheet data={singleData as WordGridPuzzleData} />;
            case ActivityType.HOMONYM_IMAGE_MATCH: return <WordGameSheets.HomonymImageMatchSheet data={singleData as HomonymImageMatchData} />;
            case ActivityType.ANTONYM_FLOWER_PUZZLE: return <WordGameSheets.AntonymFlowerPuzzleSheet data={singleData as AntonymFlowerPuzzleData} />;
            case ActivityType.SYNONYM_ANTONYM_GRID: return <WordGameSheets.SynonymAntonymGridSheet data={singleData as SynonymAntonymGridData} />;
            case ActivityType.ANTONYM_RESFEBE: return <WordGameSheets.AntonymResfebeSheet data={singleData as AntonymResfebeData} />;
            case ActivityType.SYNONYM_MATCHING_PATTERN: return <WordGameSheets.SynonymMatchingPatternSheet data={singleData as SynonymMatchingPatternData} />;
            case ActivityType.MISSING_PARTS: return <WordGameSheets.MissingPartsSheet data={singleData as MissingPartsData} />;
            case ActivityType.WORD_WEB: return <WordGameSheets.WordWebSheet data={singleData as WordWebData} />;
            case ActivityType.SYLLABLE_WORD_SEARCH: return <WordGameSheets.SyllableWordSearchSheet data={singleData as SyllableWordSearchData} />;
            
            // Fallback for other activities not yet fully implemented in this switch
            // Ideally, cases for MathLogicSheets, ReadingSheets, etc. should be here.
            default: return null;
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
