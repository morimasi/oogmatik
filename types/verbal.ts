
import { BaseActivityData } from './core';

export * from './core';

export interface MultipleChoiceStoryQuestion { type: 'multiple-choice'; question: string; options: string[]; answerIndex: number; }
export interface OpenEndedStoryQuestion { type: 'open-ended'; question: string; spaceLines?: number; }
export interface TrueFalseQuestion { type: 'true-false'; statement: string; isTrue: boolean; }
export type StoryQuestion = MultipleChoiceStoryQuestion | OpenEndedStoryQuestion | TrueFalseQuestion;

export interface StoryData extends BaseActivityData { 
    story: string; 
    mainIdea: string; 
    characters: string[]; 
    setting: string; 
    questions: StoryQuestion[]; 
    fiveW1H?: {
        who: string;
        where: string;
        when: string;
        what: string;
        why: string;
        how: string;
    };
    readingDuration?: number; 
}

export interface StoryAnalysisData extends BaseActivityData { 
    story: string; 
    storyMap: {
        characters: string;
        setting: string;
        problem: string;
        solution: string;
        theme: string;
    };
    analysisQuestions?: any[]; 
}

export interface StoryCreationPromptData extends BaseActivityData { 
    prompt: string; 
    keywords: string[]; 
    structureHints: {
        who: string;
        where: string;
        when: string;
        problem: string;
    };
}

export interface WordsInStoryData extends BaseActivityData { 
    story: string; 
    vocabWork: { 
        word: string; 
        contextQuestion: string; 
        type: 'meaning' | 'synonym' | 'antonym';
    }[];
    questions?: any[]; 
}

export interface StorySequencingData extends BaseActivityData { 
    prompt: string; 
    panels: { id: string; description: string; imageBase64?: string; imagePrompt?: string; order: number; }[]; 
    transitionWords: string[];
}

export interface MissingPartsData extends BaseActivityData { 
    storyWithBlanks: string[]; 
    wordBank: string[]; 
    answers: string[];
    leftParts: {id: number, text: string}[];
    rightParts: {id: number, text: string}[];
    givenParts: {word: string, parts: string[]}[];
}

export interface ProverbFillData extends BaseActivityData { proverbs: { start: string; end: string; full: string; }[]; meaning: string; usagePrompt: string; }
export interface ProverbSayingSortData extends BaseActivityData { prompt: string; items: { text: string; type: 'atasözü'|'özdeyiş'; }[]; }
export interface ProverbWordChainData extends BaseActivityData { prompt: string; wordCloud: { word: string; color: string; }[]; solutions: string[]; }
export interface ProverbSentenceFinderData extends ProverbWordChainData {}
export interface ProverbSearchData extends BaseActivityData { grid: string[][]; proverb: string; meaning: string; }

// --- ENHANCED WORD GAME TYPES ---

export interface WordSearchData extends BaseActivityData { 
    grid: string[][]; 
    words: string[]; 
    hiddenMessage?: string; 
    followUpQuestion?: string; 
    writingPrompt?: string; 
    theme?: string; 
    prompt?: string; 
}

export interface AnagramsData extends BaseActivityData { 
    anagrams: { 
        word: string; 
        scrambled: string; 
        letters: string[]; // For tile rendering
        imagePrompt?: string; 
        hint?: string;
    }[]; 
    sentencePrompt: string; 
    prompt?: string; 
}

export interface SpellingCheckData extends BaseActivityData { 
    checks: { 
        correct: string; 
        options: string[]; 
        imagePrompt: string; 
    }[]; 
}

export interface LetterBridgeData extends BaseActivityData { 
    pairs: { 
        word1: string; 
        word2: string; 
        bridgeLetter: string;
        imagePrompt?: string;
    }[]; 
    followUpPrompt: string; 
}

export interface WordLadderData extends BaseActivityData { 
    theme: string; 
    ladders: { 
        startWord: string; 
        endWord: string; 
        steps: number; 
        intermediateWords?: string[]; // Optional hints
        imagePrompt?: string;
    }[]; 
}

export interface WordFormationData extends BaseActivityData { 
    sets: { 
        letters: string[]; 
        jokerCount: number; 
        targetCount: number;
    }[]; 
    mysteryWordChallenge?: { prompt: string; solution: string; }; 
}

export interface SyllableCompletionData extends BaseActivityData { 
    prompt: string; 
    theme: string; 
    puzzles: { 
        id: number;
        syllables: string[]; 
        imagePrompt?: string;
    }[]; 
    storyTemplate?: string; 
    storyPrompt: string; 
    // Legacy support
    wordParts?: any;
}

export interface WordGroupingData extends BaseActivityData { words: { text: string; imageBase64?: string; imagePrompt: string; category: string; }[]; categoryNames: string[]; }
export interface ReverseWordData extends BaseActivityData { words: string[]; funFact: string; }

// Other existing types...
export interface WordSearchWithPasswordData extends BaseActivityData { grid: string[][]; words: string[]; passwordCells: { row: number; col: number; }[]; prompt?: string; }
export interface LetterGridWordFindData extends BaseActivityData { grid: string[][]; words: string[]; writingPrompt: string; prompt?: string; }
export interface ThematicWordSearchColorData extends WordSearchData {}
export interface SynonymWordSearchData extends BaseActivityData { grid: string[][]; wordsToMatch: { word: string; synonym: string; }[]; prompt?: string; }
export interface SynonymSearchAndStoryData extends BaseActivityData { grid: string[][]; wordTable: { word: string; synonym: string; }[]; storyPrompt: string; prompt?: string; }
export interface MiniWordGridData extends BaseActivityData { prompt: string; puzzles: { grid: string[][]; start: { row: number; col: number; }; }[]; }
export interface PasswordFinderData extends BaseActivityData { prompt: string; words: { word: string; passwordLetter: string; isProperNoun: boolean; }[]; passwordLength: number; }
export interface SpiralPuzzleData extends BaseActivityData { theme: string; prompt: string; clues: string[]; grid: string[][]; wordStarts: { id: number; row: number; col: number; }[]; passwordPrompt: string; }
export interface PunctuationSpiralPuzzleData extends SpiralPuzzleData {}
export interface CrosswordClue { id: number; direction: 'across'|'down'; text: string; start: { row: number; col: number; }; word: string; imageBase64?: string; }
export interface CrosswordData extends BaseActivityData { theme: string; prompt: string; grid: (string|null)[][]; clues: CrosswordClue[]; passwordCells?: { row: number; col: number; }[]; passwordLength?: number; passwordPrompt?: string; }
export interface JumbledWordStoryData extends BaseActivityData { theme: string; prompt: string; puzzles: { jumbled: string[]; word: string; }[]; storyPrompt: string; }
export interface HomonymSentenceData extends BaseActivityData { prompt: string; items: { word: string; meaning1: string; meaning2: string; imageBase64_1?: string; imageBase64_2?: string; }[]; }
export interface WordGridPuzzleData extends BaseActivityData { theme: string; prompt: string; wordList: string[]; grid: (string|null)[][]; unusedWordPrompt: string; }
export interface HomonymImageMatchData extends BaseActivityData { prompt: string; leftImages: { id: number; word: string; imageBase64: string; }[]; rightImages: { id: number; word: string; imageBase64: string; }[]; wordScramble: { letters: string[]; word: string; }; }
export interface AntonymFlowerPuzzleData extends BaseActivityData { prompt: string; puzzles: { centerWord: string; antonym: string; petalLetters: string[]; }[]; passwordLength: number; }
export interface SynonymAntonymGridData extends BaseActivityData { prompt: string; antonyms: { word: string; }[]; synonyms: { word: string; }[]; grid: string[][]; }
export interface ResfebeClue { type: 'text'|'image'; value: string; imageBase64?: string; imagePrompt?: string; }
export interface AntonymResfebeData extends BaseActivityData { prompt: string; puzzles: { word: string; antonym: string; clues: ResfebeClue[]; imagePrompt?: string; }[]; antonymsPrompt: string; }
export interface SynonymMatchingPatternData extends BaseActivityData { theme: string; prompt: string; pairs: { word: string; synonym: string; }[]; }
export interface WordWebData extends BaseActivityData { prompt: string; wordsToFind: string[]; grid: string[][]; keyWordPrompt: string; }
export interface SyllableWordSearchData extends BaseActivityData { prompt: string; syllablesToCombine: string[]; wordsToCreate: { syllable1: string; syllable2: string; answer: string; }[]; wordsToFindInSearch: string[]; grid: string[][]; passwordPrompt: string; }
export interface WordWebWithPasswordData extends BaseActivityData { prompt: string; words: string[]; grid: string[][]; passwordColumnIndex: number; }
export interface WordPlacementPuzzleData extends BaseActivityData { prompt: string; grid: (string|null)[][]; wordGroups: { length: number; words: string[]; }[]; unusedWordPrompt: string; }
export interface PositionalAnagramData extends BaseActivityData { prompt: string; puzzles: { id: number; scrambled: string; answer: string; }[]; }
export interface ImageAnagramSortData extends BaseActivityData { prompt: string; cards: { imageDescription: string; imageBase64?: string; imagePrompt?: string; scrambledWord: string; correctWord: string; }[]; }
export interface AnagramImageMatchData extends BaseActivityData { prompt: string; wordBank: string[]; puzzles: { imageDescription: string; imageBase64?: string; imagePrompt?: string; partialAnswer: string; correctWord: string; }[]; }
export interface ResfebeData extends BaseActivityData { prompt: string; puzzles: { clues: ResfebeClue[]; answer: string; }[]; }

export interface ReadingFlowData extends BaseActivityData { text: { paragraphs: { sentences: { syllables: { text: string; color: string; }[]; }[]; }[]; }; }
export interface RapidNamingData extends BaseActivityData { grid: { items: { type: string; value: string; label: string; }[]; }; type: 'number'|'color'|'object'|'icon'; }
export interface PhonologicalAwarenessData extends BaseActivityData { exercises: { type: string; question: string; word: string; options?: any[]; answer?: any; }[]; }
export interface SyllableTrainData extends BaseActivityData { trains: { word: string; syllables: string[]; }[]; }
export interface BackwardSpellingData extends BaseActivityData { items: { reversed: string; correct: string; }[]; }
export interface FamilyRelationsData extends BaseActivityData { leftColumn: { text: string; id: number; }[]; rightColumn: { text: string; id: number; }[]; }
export interface LogicDeductionData extends BaseActivityData { scoringText?: string; questions: { riddle: string; options: string[]; answerIndex: number; correctLetter: string; }[]; }
