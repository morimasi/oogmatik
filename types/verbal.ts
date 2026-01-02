
import { BaseActivityData } from './core';
import { WordSearchData, MissingPartsData } from './visual';

export * from './core';

export interface MorphologicalAnalysisData extends BaseActivityData {
    rootSets: {
        root: string;
        meaning: string;
        suffixes: { text: string; function: string; example: string }[];
        correctDerivations: { word: string; meaning: string }[];
        distractors: string[];
    }[];
    visualStyle: 'architect' | 'tree' | 'blocks';
}

// ... existing interfaces remain same ...
export interface StoryQuestion {
    type: 'multiple-choice' | 'open-ended' | 'true-false' | 'logic' | 'vocabulary' | 'inference' | 'bloom_analysis' | 'bloom_synthesis';
    question: string;
    options?: string[]; 
    answer?: string;
    isTrue?: boolean;
    difficultyLevel?: 'easy' | 'medium' | 'hard';
    sentence?: string; // For fill in blank
}

export interface VocabularyItem {
    word: string;
    definition: string;
}

export interface StoryData extends BaseActivityData {
    story: string;
    mainIdea: string;
    characters: string[];
    setting: string;
    vocabulary: VocabularyItem[];
    creativeTask: string;
    questions: StoryQuestion[];
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
        type: 'meaning' | 'usage';
    }[];
}

export interface StorySequencingData extends BaseActivityData {
    prompt: string;
    panels: {
        id: string;
        description: string;
        order: number;
        imagePrompt?: string;
    }[];
    transitionWords?: string[];
}

export interface InteractiveStoryData extends BaseActivityData { 
    story: string; 
    segments: { id: string; text: string; }[]; 
    genre: string;
    gradeLevel: string;
    wordCount: number;
    
    // Bloom Taxonomy & Intervention Components
    fiveW1H: { question: string; answer: string; type: string }[];
    multipleChoice: { question: string; options: string[]; answer: string }[];
    trueFalse: { question: string; answer: boolean }[];
    fillBlanks: { sentence: string; answer: string }[];
    logicQuestions: { question: string; answer: string; hint: string }[];
    inferenceQuestions: { question: string; answer: string }[]; 
    interventionQuestions: { question: string; type: 'word_hunt' | 'spelling' | 'visual_memory' }[];
    
    vocabulary: VocabularyItem[]; 
    creativeTask: string; 
    mainIdea: string;
    imagePrompt: string;
    answers?: any[];
}

export interface PseudowordReadingData extends BaseActivityData {
    words: string[];
    syllableType: string;
    visualMode: 'standard' | 'bionic' | 'rainbow';
    scoringTable: boolean;
    difficulty: string;
}

// Proverb Specific Aliases/Interfaces
export interface ProverbFillData extends MissingPartsData {}
export interface ProverbSayingSortData extends StoryData {}
export interface ProverbWordChainData extends StorySequencingData {}
export interface ProverbSentenceFinderData extends StorySequencingData {}
export interface ProverbSentenceFinderData extends StorySequencingData {}
export interface ProverbSearchData extends WordSearchData {}

export interface ReadingStudioConfig {
    gradeLevel: string;
    studentName: string;
    topic: string;
    genre: string;
    tone: string;
    
    // Text Content Settings
    length: 'short' | 'medium' | 'long' | 'epic';
    textComplexity: 'simple' | 'moderate' | 'advanced';
    
    // Typography & Accessibility (Visual Settings)
    fontSettings: {
        family: 'OpenDyslexic' | 'Lexend' | 'Comic Neue' | 'Times New Roman';
        size: number;
        lineHeight: number;
        letterSpacing: number;
        wordSpacing: number;
    };

    layoutDensity: 'comfortable' | 'compact';
    
    // Image Advanced Controls
    imageGeneration: {
        enabled: boolean;
        style: 'storybook' | 'realistic' | 'cartoon' | 'sketch' | 'watercolor' | '3d_render';
        complexity: 'simple' | 'detailed';
    };

    // Legacy Image Controls (to be deprecated or mapped)
    includeImage: boolean;
    imageSize: number; 
    imagePosition: 'top' | 'left' | 'right' | 'center' | 'background';
    imageOpacity: number;
    
    // Bloom Taxonomy Structure
    include5N1K: boolean;
    countMultipleChoice: number;
    countTrueFalse: number;
    countFillBlanks: number;
    countLogic: number;
    countInference: number;
    
    // Intervention Modules
    includeWordHunt: boolean;
    includeSpellingCheck: boolean;
    focusVocabulary: boolean;
    includeCreativeTask: boolean;
    
    // UI Modules
    showReadingTracker: boolean;
    showSelfAssessment: boolean;
    showTeacherNotes: boolean;
    showDateSection: boolean;
}

export type LayoutSectionId = 'header' | 'tracker' | 'story_block' | 'vocabulary' | 'questions_5n1k' | 'questions_test' | 'questions_inference' | 'creative' | 'self_eval' | 'notes';

// Updated for Absolute Positioning Canvas with Deep Customization
export interface LayoutItemStyle {
    // Positioning
    x: number;
    y: number;
    w: number;
    h: number;
    rotation?: number; 
    zIndex: number;
    
    // Visuals (Box Model)
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double'; // New
    borderRadius?: number;
    boxShadow?: string; 
    opacity?: number;
    
    // Padding
    padding: number;
    
    // Typography override (Deep customization)
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter'; // New
    color?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: number; // New
    letterSpacing?: number; // New

    // Advanced Image Settings
    imageSettings?: {
        enabled: boolean;
        position: 'top' | 'bottom' | 'left' | 'right' | 'background' | 'overlay';
        widthPercent: number; 
        opacity: number; 
        objectFit: 'cover' | 'contain';
        borderRadius: number;
        blendMode?: string; 
        filter?: string; 
    };
}

export interface LayoutItem {
    id: LayoutSectionId;
    label: string;
    icon: string;
    isVisible: boolean;
    style: LayoutItemStyle;
    // New: Specific data holding for manual overrides (Data Separation)
    specificData?: any; 
}

// New Logic/Verbal Interfaces
export interface FamilyRelationsData extends BaseActivityData {
    leftColumn: { text: string; id: number }[];
    rightColumn: { text: string; id: number }[];
}

export interface LogicDeductionData extends BaseActivityData {
    scoringText?: string;
    questions: {
        riddle: string;
        options: string[];
        answerIndex: number;
        correctLetter: string;
    }[];
}

// Added missing data interfaces for dyslexiaSupport.ts and ReadingFlowSheet
export interface ReadingFlowData extends BaseActivityData { text: { paragraphs: { sentences: { syllables: { text: string }[] }[] }[] }; }
export interface PhonologicalAwarenessData extends BaseActivityData { exercises: { question: string; word: string }[]; }
export interface SyllableTrainData extends BaseActivityData { trains: { syllables: string[] }[]; }
export interface BackwardSpellingData extends BaseActivityData { items: { reversed: string }[]; }
export interface HandwritingPracticeData extends BaseActivityData { guideType: 'standard' | 'simple'; lines: { text: string; type: 'trace' | 'copy' | 'empty'; imagePrompt?: string }[]; }
