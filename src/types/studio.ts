/**
 * Studio Modülleri — Ortak Tip Tanımları
 * ReadingStudio, CreativeStudio, UniversalStudio tarafından kullanılır.
 */

// ── LayoutSectionId ─────────────────────────────────────────────
export type LayoutSectionId =
    | 'header'
    | 'tracker'
    | 'story_block'
    | 'vocabulary'
    | 'pedagogical_note'
    | 'questions_5n1k'
    | 'questions_test'
    | '5n1k'
    | 'questions'
    | 'logic_problem'
    | 'syllable_train'
    | 'creative'
    | 'notes'
    | string; // Genişletilebilir

// ── LayoutItem Style ────────────────────────────────────────────
export interface LayoutItemStyle {
    x: number;
    y: number;
    w: number;
    h: number;
    zIndex: number;
    rotation: number;
    padding: number;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderStyle: string;
    borderRadius: number;
    opacity: number;
    boxShadow: string;
    textAlign: string;
    color: string;
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    [key: string]: unknown;
}

// ── LayoutItem ──────────────────────────────────────────────────
export interface LayoutItem {
    id: LayoutSectionId;
    label: string;
    instanceId: string;
    isVisible: boolean;
    pageIndex: number;
    specificData: Record<string, unknown>;
    style: LayoutItemStyle;
    defaultStyle?: Partial<LayoutItemStyle>;
    [key: string]: unknown;
}

// ── ReadingStudioConfig ─────────────────────────────────────────
export interface ReadingStudioConfig {
    gradeLevel: string;
    studentName: string;
    topic: string;
    genre: string;
    tone: string;
    length: 'short' | 'medium' | 'long' | string;
    layoutDensity: 'compact' | 'comfortable' | 'spacious' | string;
    textComplexity: 'simple' | 'moderate' | 'advanced' | string;
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
    imagePosition: 'left' | 'right' | 'center' | 'top' | string;
    imageGeneration: {
        enabled: boolean;
        style: string;
        complexity: string;
    };
    include5N1K: boolean;
    countMultipleChoice: number;
    countTrueFalse: number;
    countFillBlanks: number;
    countLogic: number;
    countInference: number;
    focusVocabulary: boolean;
    includeCreativeTask: boolean;
    includeWordHunt?: boolean;
    includeSpellingCheck?: boolean;
    showReadingTracker?: boolean;
    showSelfAssessment?: boolean;
    showTeacherNotes?: boolean;
    showDateSection?: boolean;
    [key: string]: unknown;
}
