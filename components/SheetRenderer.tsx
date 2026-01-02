
import React from 'react';
import { ActivityType, SingleWorksheetData } from '../types';

// --- Import All Sheet Group Components ---
import * as Dyslexia from './sheets/DyslexiaSupportSheets';
import * as MathLogic from './sheets/MathLogicSheets';
import * as Memory from './sheets/MemoryAttentionSheets';
import * as Reading from './sheets/ReadingComprehensionSheets';
import * as Visual from './sheets/VisualPerceptionSheets';
import * as WordGames from './sheets/WordGameSheets';
import * as NewActivities from './sheets/NewActivitySheets';
import * as Dyscalculia from './sheets/DyscalculiaSheets';
import * as Algorithm from './sheets/AlgorithmSheets';

// Fix: NumberLogicRiddleSheet is in its own file
import { NumberLogicRiddleSheet } from './sheets/NumberLogicRiddleSheet';
// Fix: MapDetectiveSheet is in its own file and more appropriate for Harita Dedektifi
import { MapDetectiveSheet } from './sheets/MapDetectiveSheet';

interface SheetRendererProps {
    activityType: ActivityType;
    data: SingleWorksheetData;
}

export const SheetRenderer = React.memo(({ activityType, data }: SheetRendererProps) => {
    if (!data) return null;
    
    switch (activityType) {
        // --- DYSLEXIA SUPPORT ---
        case ActivityType.MORPHOLOGICAL_ANALYSIS: return <Dyslexia.MorphologicalAnalysisSheet data={data} />;
        case ActivityType.PSEUDOWORD_READING: return <Dyslexia.PseudowordReadingSheet data={data} />;
        case ActivityType.READING_FLOW: return <Dyslexia.ReadingFlowSheet data={data} />;
        case ActivityType.RAPID_NAMING: return <Dyslexia.RapidNamingSheet data={data} />;
        case ActivityType.PHONOLOGICAL_AWARENESS: return <Dyslexia.PhonologicalAwarenessSheet data={data} />;
        case ActivityType.LETTER_DISCRIMINATION: return <Dyslexia.LetterDiscriminationSheet data={data} />;
        case ActivityType.MIRROR_LETTERS: return <Dyslexia.MirrorLettersSheet data={data} />;
        case ActivityType.SYLLABLE_TRAIN: return <Dyslexia.SyllableTrainSheet data={data} />;
        case ActivityType.BACKWARD_SPELLING: return <Dyslexia.BackwardSpellingSheet data={data} />;
        case ActivityType.CODE_READING: return <Dyslexia.CodeReadingSheet data={data} />;
        case ActivityType.ATTENTION_TO_QUESTION: return <Dyslexia.AttentionToQuestionSheet data={data} />;
        case ActivityType.HANDWRITING_PRACTICE: return <Dyslexia.HandwritingPracticeSheet data={data} />;

        // --- MATH & LOGIC ---
        // Fix: Use imported NumberLogicRiddleSheet directly
        case ActivityType.NUMBER_LOGIC_RIDDLES: return <NumberLogicRiddleSheet data={data} />;
        case ActivityType.BASIC_OPERATIONS: return <MathLogic.BasicOperationsSheet data={data} />;
        case ActivityType.REAL_LIFE_MATH_PROBLEMS: return <MathLogic.RealLifeMathProblemsSheet data={data} />;
        case ActivityType.MATH_PUZZLE: return <MathLogic.MathPuzzleSheet data={data} />;
        case ActivityType.NUMBER_PATTERN: return <MathLogic.NumberPatternSheet data={data} />;
        case ActivityType.LOGIC_GRID_PUZZLE: return <MathLogic.LogicGridPuzzleSheet data={data} />;
        case ActivityType.FUTOSHIKI: return <MathLogic.FutoshikiSheet data={data} />;
        case ActivityType.KENDOKU: return <MathLogic.KendokuSheet data={data} />;
        case ActivityType.NUMBER_PYRAMID: return <MathLogic.NumberPyramidSheet data={data} />;
        case ActivityType.ODD_ONE_OUT: return <MathLogic.OddOneOutSheet data={data} />;
        
        // --- MEMORY & ATTENTION ---
        case ActivityType.WORD_MEMORY: return <Memory.WordMemorySheet data={data} />;
        case ActivityType.VISUAL_MEMORY: return <Memory.VisualMemorySheet data={data} />;
        case ActivityType.CHARACTER_MEMORY: return <Memory.CharacterMemorySheet data={data} />;
        case ActivityType.COLOR_WHEEL_MEMORY: return <Memory.ColorWheelSheet data={data} />;
        case ActivityType.IMAGE_COMPRE_HENSION:
        // Fix: Removed ActivityType.IMAGE_COMPRE_HENSION which does not exist on ActivityType enum
        case ActivityType.IMAGE_COMPREHENSION: return <Memory.ImageComprehensionSheet data={data} />;
        case ActivityType.BURDON_TEST: return <Memory.BurdonTestSheet data={data} />;
        case ActivityType.STROOP_TEST: return <Memory.StroopTestSheet data={data} />;
        case ActivityType.NUMBER_SEARCH: return <Memory.NumberSearchSheet data={data} />;
        case ActivityType.CHAOTIC_NUMBER_SEARCH: return <Memory.ChaoticNumberSearchSheet data={data} />;
        case ActivityType.FIND_THE_DUPLICATE: return <Memory.FindDuplicateSheet data={data} />;
        case ActivityType.LETTER_GRID_TEST: return <Memory.LetterGridTestSheet data={data} />;
        case ActivityType.FIND_LETTER_PAIR: return <Memory.FindLetterPairSheet data={data} />;
        case ActivityType.TARGET_SEARCH: return <Memory.TargetSearchSheet data={data} />;
        case ActivityType.ATTENTION_DEVELOPMENT: return <Memory.AttentionDevelopmentSheet data={data} />;
        case ActivityType.ATTENTION_FOCUS: return <Memory.AttentionFocusSheet data={data} />;

        // --- VISUAL PERCEPTION ---
        case ActivityType.VISUAL_ODD_ONE_OUT: return <Visual.VisualOddOneOutSheet data={data} />;
        case ActivityType.FIND_THE_DIFFERENCE: return <Visual.FindTheDifferenceSheet data={data} />;
        case ActivityType.GRID_DRAWING: return <Visual.GridDrawingSheet data={data} />;
        case ActivityType.SYMMETRY_DRAWING: return <Visual.SymmetryDrawingSheet data={data} />;
        case ActivityType.SHAPE_MATCHING: return <Visual.ShapeMatchingSheet data={data} />;
        case ActivityType.FIND_IDENTICAL_WORD: return <Visual.FindIdenticalWordSheet data={data} />;
        case ActivityType.FIND_DIFFERENT_STRING: return <Visual.FindDifferentStringSheet data={data} />;

        // --- WORD GAMES ---
        case ActivityType.HIDDEN_PASSWORD_GRID: return <WordGames.HiddenPasswordGridSheet data={data} />;
        case ActivityType.ANAGRAM: return <WordGames.AnagramSheet data={data} />;
        case ActivityType.WORD_SEARCH: return <WordGames.WordSearchSheet data={data} />;
        case ActivityType.CROSSWORD: return <WordGames.CrosswordSheet data={data} />;

        // --- READING COMPREHENSION ---
        case ActivityType.STORY_COMPREHENSION: return <Reading.StoryComprehensionSheet data={data} />;
        case ActivityType.STORY_ANALYSIS: return <Reading.StoryAnalysisSheet data={data} />;
        case ActivityType.STORY_CREATION_PROMPT: return <Reading.StoryCreationPromptSheet data={data} />;
        case ActivityType.MISSING_PARTS: return <Reading.MissingPartsSheet data={data} />;

        // --- DYSCALCULIA ---
        case ActivityType.NUMBER_SENSE: return <Dyscalculia.NumberSenseSheet data={data} />;
        case ActivityType.VISUAL_ARITHMETIC: return <Dyscalculia.VisualArithmeticSheet data={data} />;
        case ActivityType.CLOCK_READING: return <Dyscalculia.ClockReadingSheet data={data} />;
        case ActivityType.MONEY_COUNTING: return <Dyscalculia.MoneyCountingSheet data={data} />;
        case ActivityType.MATH_MEMORY_CARDS: return <Dyscalculia.MathMemoryCardsSheet data={data} />;
        case ActivityType.SPATIAL_GRID: return <Dyscalculia.SpatialGridSheet data={data} />;
        case ActivityType.CONCEPT_MATCH: return <Dyscalculia.ConceptMatchSheet data={data} />;
        case ActivityType.ESTIMATION_SKILLS: return <Dyscalculia.EstimationSheet data={data} />;

        // --- NEW & SPECIAL ---
        // Fix: Use imported MapDetectiveSheet for Map Instruction
        case ActivityType.MAP_INSTRUCTION: return <MapDetectiveSheet data={data} />;
        case ActivityType.FAMILY_RELATIONS: return <NewActivities.FamilyRelationsSheet data={data} />;
        case ActivityType.LOGIC_DEDUCTION: return <NewActivities.LogicDeductionSheet data={data} />;
        case ActivityType.NUMBER_BOX_LOGIC: return <NewActivities.NumberBoxLogicSheet data={data} />;
        case ActivityType.ALGORITHM_GENERATOR: return <Algorithm.AlgorithmSheet data={data} />;

        default:
            return (
                <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-2xl">
                    <p className="text-zinc-400 font-bold">Bu aktivite tipi ({activityType}) için renderer tanımlanmamış.</p>
                </div>
            );
    }
});
