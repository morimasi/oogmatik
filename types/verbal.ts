
import { BaseActivityData } from './core';

export * from './core';

export interface StoryQuestion {
    type: 'multiple-choice' | 'true-false' | 'open-ended' | 'who' | 'where' | 'when' | 'what' | 'why' | 'how';
    question: string;
    options?: string[];
    answer: string;
    isTrue?: boolean;
}

export interface StoryData extends BaseActivityData {
    story: string;
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
