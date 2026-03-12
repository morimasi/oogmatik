import { StyleSettings } from './core';

export type LayoutSectionId =
    | 'header'
    | 'tracker'
    | 'story_block'
    | 'vocabulary'
    | 'pedagogical_note'
    | 'questions_5n1k'
    | 'questions_test'
    | 'questions_inference'
    | 'creative'
    | 'notes'
    | 'logic_problem'
    | 'syllable_train'
    | '5n1k'
    | 'questions'
    | 'activity_component'
    | 'text'
    | 'image'
    | 'grid'
    | 'table'
    | 'cloze_test'
    | 'match_columns'
    | 'categorical_sorting'
    | 'logic_card'
    | 'footer_validation'
    | 'visual_clue_card'
    | 'neuro_marker'
    | 'svg_shape';

export interface LayoutItem {
    id: LayoutSectionId;
    label?: string;
    instanceId: string;
    isVisible: boolean;
    pageIndex?: number;
    style: any;
    specificData: Record<string, any>;
    groupId?: string;
}

export interface ReadingStudioConfig {
    gradeLevel: string;
    studentId?: string;
    studentName: string;
    studentProfile?: {
        diagnosis?: string[];
        interests?: string[];
        strengths?: string[];
        weaknesses?: string[];
    };
    characterName?: string;
    characterTraits?: string;
    topic: string;
    genre: string;
    tone: string;
    length: 'short' | 'medium' | 'long' | 'epic';
    layoutDensity: 'compact' | 'comfortable' | 'spacious';
    textComplexity: 'simple' | 'moderate' | 'advanced';
    fontSettings: {
        family: string;
        size: number;
        lineHeight: number;
        letterSpacing: number;
        wordSpacing: number;
    };
    includeImage: boolean;
    imageSize: number;
    imageOpacity: number;
    imagePosition: 'left' | 'right' | 'background';
    imageGeneration: {
        enabled: boolean;
        style: string;
        complexity: 'simple' | 'detailed';
        colorPalette?: string;
    };
    include5N1K: boolean;
    countMultipleChoice: number;
    countTrueFalse: number;
    countFillBlanks: number;
    countLogic: number;
    countInference: number;
    focusVocabulary: boolean;
    includeCreativeTask: boolean;
    phonemeFocus?: string;
    syllableFocus?: boolean;
    logicDifficulty?: 'Easy' | 'Medium' | 'Hard';
    includeWordHunt: boolean;
    includeSpellingCheck: boolean;
    showReadingTracker: boolean;
    showSelfAssessment: boolean;
    showTeacherNotes: boolean;
    showDateSection: boolean;
}
