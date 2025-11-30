
import { ActivityType, StyleSettings, StudentProfile } from './types/core';

import { 
    NumberPatternData, ShapeNumberPatternData, MathPuzzleData, FutoshikiData, NumberPyramidData, NumberCapsuleData, OddEvenSudokuData,
    RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData, ArithmeticConnectData, RomanNumeralMultiplicationData,
    KendokuData, OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, ShapeSudokuData, VisualNumberPatternData,
    LogicGridPuzzleData, ShapeCountingData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, BasicOperationsData,
    RealLifeProblemData, NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData, MindGamesData, MindGames56Data
} from './types/math';

import {
    StoryData, StoryAnalysisData, StoryCreationPromptData, WordsInStoryData, StorySequencingData, ProverbFillData, ProverbSayingSortData,
    ProverbWordChainData, ProverbSentenceFinderData, ProverbSearchData, WordSearchData, WordSearchWithPasswordData, LetterGridWordFindData,
    ThematicWordSearchColorData, SynonymWordSearchData, SynonymSearchAndStoryData, AnagramsData, SpellingCheckData, LetterBridgeData,
    WordLadderData, WordFormationData, ReverseWordData, WordGroupingData, MiniWordGridData, PasswordFinderData, SyllableCompletionData,
    SpiralPuzzleData, PunctuationSpiralPuzzleData, CrosswordData, JumbledWordStoryData, HomonymSentenceData, WordGridPuzzleData,
    HomonymImageMatchData, AntonymFlowerPuzzleData, SynonymAntonymGridData, AntonymResfebeData, SynonymMatchingPatternData, MissingPartsData,
    WordWebData, SyllableWordSearchData, WordWebWithPasswordData, WordPlacementPuzzleData, PositionalAnagramData, ImageAnagramSortData,
    AnagramImageMatchData, ResfebeData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData,
    SyllableTrainData, BackwardSpellingData, StoryQuestion, MultipleChoiceStoryQuestion, OpenEndedStoryQuestion, CrosswordClue, ResfebeClue
} from './types/verbal';

import {
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData,
    VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, CoordinateCipherData, WordConnectData,
    ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData,
    OddOneOutData, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData,
    WordMemoryData, VisualMemoryData, NumberSearchData, FindDuplicateData, LetterGridTestData, FindLetterPairData, TargetSearchData,
    ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, StroopTestData, ChaoticNumberSearchData, VisualTrackingLineData,
    CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, FamilyRelationsData, LogicDeductionData,
    NumberBoxLogicData, MapInstructionData, WordMemoryItem
} from './types/visual';

export * from './types/core';
export * from './types/math';
export * from './types/verbal';
export * from './types/visual';

export type SingleWorksheetData = 
    | NumberPatternData | ShapeNumberPatternData | MathPuzzleData | FutoshikiData | NumberPyramidData | NumberCapsuleData | OddEvenSudokuData 
    | RomanNumeralConnectData | RomanNumeralStarHuntData | RoundingConnectData | ArithmeticConnectData | RomanNumeralMultiplicationData 
    | KendokuData | OperationSquareFillInData | MultiplicationWheelData | TargetNumberData | ShapeSudokuData | VisualNumberPatternData 
    | LogicGridPuzzleData | OddOneOutData | ShapeCountingData | ThematicOddOneOutData | ThematicOddOneOutSentenceData | ColumnOddOneOutSentenceData 
    | PunctuationMazeData | PunctuationPhoneNumberData | BasicOperationsData | RealLifeProblemData | RomanArabicMatchConnectData | WeightConnectData 
    | LengthConnectData | FindTheDifferenceData | WordComparisonData | ShapeMatchingData | FindIdenticalWordData | GridDrawingData | SymbolCipherData 
    | BlockPaintingData | VisualOddOneOutData | SymmetryDrawingData | FindDifferentStringData | DotPaintingData | AbcConnectData | CoordinateCipherData 
    | WordConnectData | ProfessionConnectData | MatchstickSymmetryData | VisualOddOneOutThemedData | PunctuationColoringData | SynonymAntonymColoringData 
    | StarHuntData | StoryData | StoryAnalysisData | StoryCreationPromptData | WordsInStoryData | StorySequencingData | ProverbFillData | ProverbSayingSortData 
    | ProverbWordChainData | ProverbSentenceFinderData | ProverbSearchData | WordSearchData | WordSearchWithPasswordData | LetterGridWordFindData 
    | ThematicWordSearchColorData | SynonymWordSearchData | SynonymSearchAndStoryData | AnagramsData | SpellingCheckData | LetterBridgeData | WordLadderData 
    | WordFormationData | ReverseWordData | WordGroupingData | MiniWordGridData | PasswordFinderData | SyllableCompletionData | SpiralPuzzleData 
    | PunctuationSpiralPuzzleData | CrosswordData | JumbledWordStoryData | HomonymSentenceData | WordGridPuzzleData | HomonymImageMatchData 
    | AntonymFlowerPuzzleData | SynonymAntonymGridData | AntonymResfebeData | SynonymMatchingPatternData | MissingPartsData | WordWebData 
    | SyllableWordSearchData | WordWebWithPasswordData | WordPlacementPuzzleData | PositionalAnagramData | ImageAnagramSortData | AnagramImageMatchData 
    | ResfebeData | WordMemoryData | VisualMemoryData | NumberSearchData | FindDuplicateData | LetterGridTestData | FindLetterPairData | TargetSearchData 
    | ColorWheelMemoryData | ImageComprehensionData | CharacterMemoryData | StroopTestData | ChaoticNumberSearchData | ReadingFlowData | LetterDiscriminationData 
    | RapidNamingData | PhonologicalAwarenessData | MirrorLettersData | SyllableTrainData | VisualTrackingLineData | BackwardSpellingData | CodeReadingData 
    | AttentionToQuestionData | AttentionDevelopmentData | AttentionFocusData | NumberSenseData | VisualArithmeticData | SpatialGridData | ConceptMatchData 
    | EstimationData | FamilyRelationsData | LogicDeductionData | NumberBoxLogicData | MapInstructionData | MindGamesData | MindGames56Data;

export type WorksheetData = SingleWorksheetData[];

export interface SavedWorksheet {
    id: string;
    userId: string;
    name: string;
    activityType: ActivityType;
    worksheetData: WorksheetData;
    createdAt: string;
    icon: string;
    category: { id: string; title: string };
    sharedBy?: string;
    sharedByName?: string;
    sharedWith?: string;
    styleSettings?: StyleSettings;
    studentProfile?: StudentProfile;
}

export interface HistoryItem {
    id: string;
    userId: string;
    activityType: ActivityType;
    data: WorksheetData;
    timestamp: string;
    title: string;
    category: { id: string; title: string };
}
