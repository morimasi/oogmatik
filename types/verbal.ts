
import { BaseActivityData } from './core';

export * from './core';

export interface StoryQuestion {
    type: 'multiple-choice' | 'true-false' | 'open-ended' | 'who' | 'where' | 'when' | 'what' | 'why' | 'how';
    question: string;
    options?: string[];
    answer: string;
    isTrue?: boolean;
}

/* Fix: Adding missing StoryAnalysisData interface */
export interface StoryAnalysisData extends BaseActivityData {
    story: string;
    storyMap: Record<string, string>;
}

/* Fix: Adding missing StoryCreationPromptData interface */
export interface StoryCreationPromptData extends BaseActivityData {
    prompt: string;
    keywords: string[];
    structureHints: Record<string, string>;
}

/* Fix: Adding missing WordsInStoryData interface */
export interface WordsInStoryData extends BaseActivityData {
    story: string;
    vocabWork: { word: string; contextQuestion: string; type: 'meaning' | 'usage' }[];
}

/* Fix: Adding missing StorySequencingData interface */
export interface StorySequencingData extends BaseActivityData {
    prompt: string;
    panels: { id: string; description: string; order: number; imagePrompt: string }[];
    transitionWords: string[];
}

/* Fix: Adding missing ReadingFlowData interface */
export interface ReadingFlowData extends BaseActivityData {
    text: { paragraphs: { sentences: { syllables: { text: string }[] }[] }[] };
}

/* Fix: Adding missing PhonologicalAwarenessData interface */
export interface PhonologicalAwarenessData extends BaseActivityData {
    exercises: { question: string; word: string }[];
}

/* Fix: Adding missing SyllableTrainData interface */
export interface SyllableTrainData extends BaseActivityData {
    trains: { syllables: string[] }[];
}

/* Fix: Adding missing BackwardSpellingData interface */
export interface BackwardSpellingData extends BaseActivityData {
    items: { original: string }[];
}

/* Fix: Adding missing HandwritingPracticeData interface */
export interface HandwritingPracticeData extends BaseActivityData {
    lines: { type: 'trace' | 'copy'; text: string; imagePrompt?: string }[];
}

export interface FamilyLogicStatement {
    id: string;
    text: string;
    isTrue: boolean;
    complexity: 'simple' | 'indirect' | 'syllogism';
    hint?: string;
}

export interface FamilyLogicTestData extends BaseActivityData {
    statements: FamilyLogicStatement[];
    difficulty: string;
    focusSide: 'mom' | 'dad' | 'mixed';
    depth: 'basic' | 'extended' | 'expert';
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
    side: 'mom' | 'dad';
}

export interface FamilyRelationsData extends BaseActivityData {
    pairs: FamilyRelationPair[];
    momRelatives: string[];
    dadRelatives: string[];
    difficulty: string;
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
        imagePrompt: string;
    }[];
    sentences: {
        text: string;
        word: string;
        target: string;
        type: 'synonym' | 'antonym';
    }[];
}
