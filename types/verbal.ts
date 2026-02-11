
import { BaseActivityData, ActivityType, Student } from './core';

export * from './core';

export interface StoryQuestion {
    type: 'multiple-choice' | 'true-false' | 'open-ended' | 'who' | 'where' | 'when' | 'what' | 'why' | 'how';
    question: string;
    options?: string[];
    answer: string;
    isTrue?: boolean;
    hint?: string;
}

export interface StoryData extends BaseActivityData {
    story: string;
    genre?: string;
    mainIdea: string;
    characters: string[];
    setting: string;
    vocabulary: { word: string; definition: string }[];
    creativeTask: string;
    questions: StoryQuestion[];
    fiveW1H?: { type: 'who' | 'where' | 'when' | 'what' | 'why' | 'how'; question: string; answer: string }[];
}

export interface StoryAnalysisData extends BaseActivityData {
    story: string;
    storyMap: Record<string, string>;
}

export interface StoryCreationPromptData extends BaseActivityData {
    prompt: string;
    keywords: string[];
    structureHints: Record<string, string>;
}

export interface WordsInStoryData extends BaseActivityData {
    story: string;
    vocabWork: { word: string; contextQuestion: string; type: 'meaning' | 'usage' }[];
}

export interface StorySequencingData extends BaseActivityData {
    prompt: string;
    panels: { id: string; description: string; order: number; imagePrompt: string }[];
    transitionWords: string[];
}

export interface InteractiveStoryData extends StoryData {
    fiveW1H: { type: 'who' | 'where' | 'when' | 'what' | 'why' | 'how'; question: string; answer: string }[];
    trueFalse: StoryQuestion[];
    fillBlanks: { sentence: string; answer: string }[];
    logicQuestions: { question: string; answer: string; hint: string }[];
    inferenceQuestions: { question: string; answer: string }[];
    multipleChoice: StoryQuestion[];
}

export interface ReadingStroopData extends BaseActivityData {
    grid: { text: string; color: string }[];
    settings: { cols: number; fontSize: number; wordType: string };
    evaluationBox: boolean;
}

export interface ReadingFlowData extends BaseActivityData {
    text: { paragraphs: { sentences: { syllables: { text: string }[] }[] }[] };
}

export interface PhonologicalAwarenessData extends BaseActivityData {
    exercises: { question: string; word: string }[];
}

export interface SyllableTrainData extends BaseActivityData {
    trains: { syllables: string[] }[];
}

export interface BackwardSpellingData extends BaseActivityData {
    items: { original: string; reversed: string }[];
}

export interface HandwritingPracticeData extends BaseActivityData {
    lines: { text: string; type: 'trace' | 'copy' | 'empty'; imagePrompt?: string }[];
    guideType: string;
    settings?: any;
}

export interface SyllableWordBuilderData extends BaseActivityData {
    words: {
        id: number;
        targetWord: string;
        syllables: string[];
        imagePrompt: string;
        imageBase64?: string;
    }[];
    syllableBank: string[];
}

export interface SyllableMasterLabItem {
    word: string;
    syllables: string[];
    missingIndex?: number;
    scrambledIndices?: number[];
    syllableCount: number;
}

export interface SyllableMasterLabData extends BaseActivityData {
    mode: 'split' | 'combine' | 'complete' | 'rainbow' | 'scrambled';
    items: SyllableMasterLabItem[];
}

export interface LetterVisualMatchingData extends BaseActivityData {
    pairs: {
        letter: string;
        imagePrompt: string;
        imageBase64?: string;
        word: string;
    }[];
    settings: {
        fontFamily: string;
        letterCase: 'upper' | 'lower';
        showTracing: boolean;
        gridCols: number;
    };
}

export interface SynonymAntonymMatchData extends BaseActivityData {
    mode: 'synonym' | 'antonym' | 'mixed';
    pairs: {
        source: string;
        target: string;
        type: 'synonym' | 'antonym';
        imagePrompt?: string;
    }[];
    sentences: {
        text: string;
        word: string;
        target: string;
        type: 'synonym' | 'antonym';
    }[];
}

export interface ReadingSudokuData extends BaseActivityData {
    grid: (string | null)[][];
    solution: string[][];
    symbols: { value: string; imagePrompt?: string; label?: string }[];
    settings: {
        size: number;
        variant: 'letters' | 'words' | 'visuals' | 'numbers';
        fontFamily: string;
    };
}

export interface FamilyRelationPair {
    definition: string;
    label: string;
    side: 'mom' | 'dad' | 'both' | 'none';
}

export interface FamilyRelationsData extends BaseActivityData {
    pairs: FamilyRelationPair[];
    momRelatives: string[];
    dadRelatives: string[];
    difficulty: string;
}

export interface FamilyLogicStatement {
    text: string;
    isTrue: boolean;
}

export interface FamilyLogicTestData extends BaseActivityData {
    statements: FamilyLogicStatement[];
    difficulty: string;
}

export interface MorphologyMatrixData extends BaseActivityData {
    items: {
        root: string;
        suffixes: string[];
        hint?: string;
    }[];
    difficulty: string;
}

export interface ReadingPyramidData extends BaseActivityData {
    pyramids: {
        levels: string[];
        title: string;
    }[];
    difficulty: string;
}

export interface WordMemoryItem {
    text: string;
    imagePrompt?: string;
}

export interface WordMemoryData extends BaseActivityData {
    memorizeTitle: string;
    testTitle: string;
    wordsToMemorize: WordMemoryItem[];
    testWords: WordMemoryItem[];
}

export interface VisualMemoryItem {
    description: string;
    imagePrompt: string;
    imageBase64?: string;
}

export interface VisualMemoryData extends BaseActivityData {
    memorizeTitle: string;
    testTitle: string;
    itemsToMemorize: VisualMemoryItem[];
    testItems: VisualMemoryItem[];
}

export interface NumberSearchData extends BaseActivityData {
    numbers: number[];
    range: { start: number; end: number };
}

export interface FindDuplicateData extends BaseActivityData {
    rows: string[][];
}

export interface LetterGridTestData extends BaseActivityData {
    grid: string[][];
    targetLetters: string[];
}

export interface FindLetterPairData extends BaseActivityData {
    grids: { grid: string[][]; targetPair: string }[];
    settings: { gridSize: number; itemCount: number; difficulty: string };
}

export interface TargetSearchData extends BaseActivityData {
    grid: string[][];
    target: string;
    distractor: string;
}

export interface ColorWheelMemoryItem {
    name: string;
    color: string;
    imagePrompt: string;
}

export interface ColorWheelMemoryData extends BaseActivityData {
    memorizeTitle: string;
    testTitle: string;
    items: ColorWheelMemoryItem[];
}

export interface ImageComprehensionData extends BaseActivityData {
    memorizeTitle: string;
    testTitle: string;
    sceneDescription: string;
    questions: string[];
}

export interface CharacterMemoryItem {
    description: string;
    imagePrompt: string;
    imageBase64?: string;
}

export interface CharacterMemoryData extends BaseActivityData {
    memorizeTitle: string;
    testTitle: string;
    charactersToMemorize: CharacterMemoryItem[];
    testCharacters: CharacterMemoryItem[];
}

export interface StroopTestData extends BaseActivityData {
    items: { text: string; color: string }[];
}

export interface ChaoticNumberSearchItem {
    value: number;
    x: number;
    y: number;
    size: number;
    rotation: number;
    color: string;
}

export interface ChaoticNumberSearchData extends BaseActivityData {
    numbers: ChaoticNumberSearchItem[];
    range: { start: number; end: number };
    prompt?: string;
}

export interface AttentionDevelopmentPuzzle {
    riddle: string;
    boxes: { label?: string; numbers: number[] }[];
    options: string[];
    answer: string;
}

export interface AttentionDevelopmentData extends BaseActivityData {
    puzzles: AttentionDevelopmentPuzzle[];
}

export interface AttentionFocusPuzzle {
    riddle: string;
    boxes: { title?: string; items: string[] }[];
    options: string[];
    answer: string;
}

export interface AttentionFocusData extends BaseActivityData {
    puzzles: AttentionFocusPuzzle[];
}

export interface MissingPartsData extends BaseActivityData {
    storyWithBlanks: string[];
    wordBank: string[];
    answers: string[];
}

export interface CodeReadingData extends BaseActivityData {
    keyMap: { symbol: string; value: string; color: string }[];
    codesToSolve: { sequence: string[] }[];
}

export interface AttentionToQuestionData extends BaseActivityData {
    subType: 'letter-cancellation' | 'other';
    grid?: string[][];
    targetChars?: string[];
}

export interface LetterDiscriminationData extends BaseActivityData {
    targetLetters: string[];
    rows: { letters: string[] }[];
}

export interface RapidNamingData extends BaseActivityData {
    type: 'object' | 'color' | 'number' | 'letter';
    grid: { items: { type: string; value: string; label?: string }[] }[];
}

export interface MirrorLettersData extends BaseActivityData {
    targetPair: string;
    rows: { items: { letter: string; rotation: number; isMirrored: boolean }[] }[];
}

export interface VisualTrackingLineData extends BaseActivityData {
    paths: { id: number; d: string; color: string; strokeWidth: number; startLabel?: string }[];
    width: number;
    height: number;
}

export interface AnagramsData extends BaseActivityData {
    anagrams: { scrambled: string; original: string }[];
}

export interface WordSearchData extends BaseActivityData {
    grid: string[][];
    words: string[];
}

export interface CrosswordData extends BaseActivityData {
    grid: (string | null)[][];
    clues: { id: number; text: string; direction: 'across' | 'down' }[];
}

export interface HiddenPasswordGridData extends BaseActivityData {
    settings?: {
        gridSize: number;
        itemCount: number;
        cellStyle: string;
        letterCase: string;
    };
    grids: {
        targetLetter: string;
        hiddenWord: string;
        grid: string[][];
    }[];
}
