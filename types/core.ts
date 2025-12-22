
export const ActivityType = {
    // System Types
    ASSESSMENT_REPORT: 'ASSESSMENT_REPORT',
    WORKBOOK: 'WORKBOOK',
    OCR_CONTENT: 'OCR_CONTENT',
    CUSTOM_GENERATED: 'CUSTOM_GENERATED',
    MATH_STUDIO: 'MATH_STUDIO',
    ALGORITHM_GENERATOR: 'ALGORITHM_GENERATOR',
    AI_WORKSHEET_CONVERTER: 'AI_WORKSHEET_CONVERTER',

    // Math
    BASIC_OPERATIONS: 'BASIC_OPERATIONS',
    MATH_PUZZLE: 'MATH_PUZZLE',
    NUMBER_PATTERN: 'NUMBER_PATTERN',
    NUMBER_SEARCH: 'NUMBER_SEARCH',
    ODD_EVEN_SUDOKU: 'ODD_EVEN_SUDOKU',
    PUNCTUATION_MAZE: 'PUNCTUATION_MAZE',
    KENDOKU: 'KENDOKU',
    NUMBER_PYRAMID: 'NUMBER_PYRAMID',
    REAL_LIFE_MATH_PROBLEMS: 'REAL_LIFE_MATH_PROBLEMS',

    // Verbal
    STORY_COMPREHENSION: 'STORY_COMPREHENSION',
    STORY_ANALYSIS: 'STORY_ANALYSIS',
    STORY_CREATION_PROMPT: 'STORY_CREATION_PROMPT',
    MISSING_PARTS: 'MISSING_PARTS',
    READING_FLOW: 'READING_FLOW',
    WORD_SEARCH: 'WORD_SEARCH',
    WORD_SEARCH_WITH_PASSWORD: 'WORD_SEARCH_WITH_PASSWORD',
    LETTER_GRID_WORD_FIND: 'LETTER_GRID_WORD_FIND',
    CROSSWORD: 'CROSSWORD',
    ANAGRAM: 'ANAGRAM',

    // Visual
    FIND_THE_DIFFERENCE: 'FIND_THE_DIFFERENCE',
    VISUAL_ODD_ONE_OUT: 'VISUAL_ODD_ONE_OUT',
    SHAPE_MATCHING: 'SHAPE_MATCHING',
    GRID_DRAWING: 'GRID_DRAWING',
} as const;

export type ActivityType = typeof ActivityType[keyof typeof ActivityType] | string;

export interface Activity {
    id: ActivityType;
    title: string;
    description: string;
    icon: string;
    category?: string;
    isActive?: boolean;
    isPremium?: boolean;
    promptId?: string;
    defaultStyle?: Partial<StyleSettings>;
    isCustom?: boolean;
}

export interface ActivityCategory {
    id: string;
    title: string;
    description: string;
    icon: string;
    activities: ActivityType[];
    isCustom?: boolean;
}

export type WorksheetData = any[] | null;
export type SingleWorksheetData = any;

export interface StyleSettings {
    fontSize: number;
    scale: number;
    borderColor: string;
    borderWidth: number;
    margin: number;
    columns: number;
    gap: number;
    orientation: 'portrait' | 'landscape';
    themeBorder: string;
    contentAlign: 'left' | 'center' | 'right' | 'justify';
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    visualStyle: string;
    showPedagogicalNote: boolean;
    showMascot: boolean;
    showStudentInfo: boolean;
    showTitle: boolean;
    showInstruction: boolean;
    showImage: boolean;
    showFooter: boolean;
    smartPagination: boolean;
    fontFamily: string;
    lineHeight: number;
    letterSpacing: number;
}

export interface StudentProfile {
    studentId?: string; // Link to actual Student record
    name: string;
    school: string;
    grade: string;
    date: string;
    notes?: string;
}

/**
 * Enhanced Student Interface for Professional Tracking
 */
export interface Student {
    id: string;
    teacherId: string;
    name: string;
    age: number;
    grade: string;
    avatar: string;
    createdAt: string;
    
    // Pedagogical Profile
    diagnosis: string[];
    interests: string[];
    learningStyle?: 'Görsel' | 'İşitsel' | 'Kinestetik' | 'Karma';
    strengths: string[];
    weaknesses: string[];
    
    // Contact Info
    parentName: string;
    contactPhone: string;
    contactEmail: string;
    
    // Notes History (JSON stringified array of {date, note, author})
    notesHistory: string; 
    
    // Legacy support
    notes: string;
}

export interface OverlayItem {
    id: string;
    type: 'text' | 'sticker';
    x: number;
    y: number;
    content: string;
}

export interface GeneratorOptions {
    mode: 'fast' | 'ai' | 'manual';
    difficulty: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
    worksheetCount: number;
    itemCount: number;
    gridSize?: number;
    operationType?: string;
    selectedOperations?: string[];
    numberRange?: string;
    allowCarry?: boolean;
    allowBorrow?: boolean;
    allowRemainder?: boolean;
    wordLength?: { min: number; max: number };
    case?: 'upper' | 'lower';
    directions?: 'simple' | 'diagonal' | 'all';
    customInput?: string | string[];
    topic?: string;
    useSearch?: boolean;
    num1Digits?: number;
    num2Digits?: number;
    useThirdNumber?: boolean;
    patternType?: string;
    pyramidType?: string;
    contentType?: string;
    variant?: string;
    targetLetters?: string;
    targetPair?: string;
    targetChar?: string;
    distractorChar?: string;
    memorizeRatio?: number;
    concept?: string;
    storyTheme?: string;
    visualType?: string;
    visualStyle?: string;
    groupSize?: number;
    groupCount?: number;
    symbolType?: string;
    codeLength?: number;
    subType?: string;
    studentContext?: Student; // NEW: Personalization context
}

export interface SavedWorksheet {
    id: string;
    userId: string;
    studentId?: string;
    name: string;
    activityType: ActivityType;
    worksheetData: any[];
    createdAt: string;
    icon: string;
    category: { id: string; title: string };
    sharedBy?: string;
    sharedByName?: string;
    sharedWith?: string;
    styleSettings?: StyleSettings;
    studentProfile?: StudentProfile;
    workbookItems?: any[];
    workbookSettings?: any;
}

export type AppTheme = 'light' | 'dark' | 'anthracite' | 'space' | 'nature' | 'ocean' | 'anthracite-gold' | 'anthracite-cyber';

export interface HistoryItem {
    id: string;
    userId: string;
    activityType: ActivityType;
    data: any[];
    timestamp: string;
    title: string;
    category: { id: string; title: string };
}

export type View = 'generator' | 'savedList' | 'workbook' | 'profile' | 'admin' | 'messages' | 'shared' | 'favorites' | 'assessment';

export interface UiSettings {
    fontFamily: string;
    fontSizeScale: number;
    letterSpacing: 'normal' | 'wide';
    lineHeight: number;
    saturation: number;
}

export interface CollectionItem {
    id: string;
    activityType: ActivityType;
    data: any;
    settings: StyleSettings;
    title: string;
    itemType?: 'divider' | 'activity';
    overrideStyle?: Partial<StyleSettings>;
    dividerConfig?: {
        title: string;
        subtitle: string;
        icon: string;
    };
}

export interface WorkbookSettings {
    title: string;
    studentName: string;
    schoolName: string;
    year: string;
    teacherNote: string;
    theme: 'modern' | 'classic' | 'fun' | 'minimal' | 'academic' | 'artistic' | 'space' | 'nature' | 'geometric';
    accentColor: string;
    coverStyle: 'centered' | 'left' | 'split';
    showTOC: boolean;
    showPageNumbers: boolean;
    showWatermark: boolean;
    watermarkOpacity: number;
    showBackCover: boolean;
    logoUrl?: string;
}

export interface AssessmentReport {
    overallSummary: string;
    scores: {
        linguistic: number;
        logical: number;
        spatial: number;
        musical: number;
        kinesthetic: number;
        naturalistic: number;
        interpersonal: number;
        intrapersonal: number;
        attention: number;
    };
    chartData: { label: string; value: number; fullMark: number }[];
    analysis: {
        strengths: string[];
        weaknesses: string[];
        errorAnalysis: string[];
    };
    roadmap: {
        activityId: string;
        reason: string;
        frequency: string;
    }[];
    observations?: any;
}

export interface SavedAssessment {
    id: string;
    userId: string;
    studentId?: string;
    studentName: string;
    gender: 'Kız' | 'Erkek';
    age: number;
    grade: string;
    createdAt: string;
    report: AssessmentReport;
    sharedBy?: string;
    sharedByName?: string;
    sharedWith?: string;
}

export interface BaseActivityData {
    title: string;
    instruction: string;
    pedagogicalNote?: string;
    imagePrompt?: string;
    imageBase64?: string;
}

export type ShapeType = 'circle' | 'square' | 'triangle' | 'hexagon' | 'star' | 'diamond' | 'pentagon' | 'octagon' | 'cube' | 'sphere' | 'pyramid' | 'cone' | 'heart' | 'cloud' | 'moon';

export type VisualMathType = 'objects' | 'ten-frame' | 'number-bond' | 'dice' | 'blocks';

export type FeedbackCategory = 'general' | 'bug' | 'feature' | 'content';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar: string;
    createdAt: string;
    lastLogin: string;
    worksheetCount: number;
    status: UserStatus;
    subscriptionPlan: string;
    favorites: ActivityType[];
    lastActiveActivity?: {
        id: string;
        title: string;
        date: string;
    };
}

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface FeedbackItem {
    id: string;
    userId?: string;
    userName: string;
    userEmail?: string;
    activityType: string;
    activityTitle: string;
    rating: number;
    category: FeedbackCategory;
    message: string;
    timestamp: string;
    status: FeedbackStatus;
    adminReply?: string;
}

export type FeedbackStatus = 'new' | 'read' | 'in-progress' | 'resolved' | 'replied';

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    senderName: string;
    content: string;
    timestamp: string;
    isRead: boolean;
    relatedFeedbackId?: string;
}

export interface Curriculum {
    id: string;
    studentId?: string; // Link to actual Student record
    studentName: string;
    grade: string;
    startDate: string;
    durationDays: number;
    goals: string[];
    schedule: CurriculumDay[];
    note: string;
    interests: string[];
    weaknesses: string[];
    userId?: string;
    createdAt?: string;
    sharedBy?: string;
    sharedByName?: string;
    sharedWith?: string;
}

export interface CurriculumDay {
    day: number;
    focus: string;
    activities: CurriculumActivity[];
    isCompleted: boolean;
}

export interface CurriculumActivity {
    id: string;
    activityId: ActivityType;
    title: string;
    duration: number;
    goal: string;
    difficultyLevel: 'Easy' | 'Medium' | 'Hard';
    status: CurriculumActivityStatus;
}

export type CurriculumActivityStatus = 'pending' | 'completed' | 'skipped';

export interface AssessmentProfile {
    studentName: string;
    age: number;
    grade: string;
    observations: string[];
    testResults?: Record<string, { name: string; accuracy: number }>;
    errorPatterns?: Record<string, number>;
}

export interface ProfessionalAssessmentReport {
    id: string;
    studentId: string;
    studentName: string;
    examinerId: string;
    date: string;
    duration: number;
    subTests: SubTestResult[];
    observations: ClinicalObservation;
    overallRiskAnalysis: {
        dyslexiaRisk: 'low' | 'moderate' | 'high';
        dyscalculiaRisk: 'low' | 'moderate' | 'high';
        attentionDeficitRisk: 'low' | 'moderate' | 'high';
        summary: string;
    };
    recommendations: string[];
    roadmap: AssessmentRoadmapItem[];
}

export interface SubTestResult {
    testId: CognitiveDomain;
    name: string;
    score: number;
    rawScore: number;
    totalItems: number;
    avgReactionTime: number;
    accuracy: number;
    status: 'completed' | 'skipped' | 'incomplete';
    timestamp: number;
}

export type CognitiveDomain = 'visual_spatial_memory' | 'processing_speed' | 'selective_attention' | 'phonological_loop' | 'logical_reasoning';

export interface ClinicalObservation {
    anxietyLevel: 'low' | 'medium' | 'high';
    attentionSpan: 'focused' | 'distracted' | 'hyperactive';
    motorSkills: 'typical' | 'delayed' | 'difficult';
    notes: string;
}

export interface AssessmentRoadmapItem {
    activityId: ActivityType;
    title: string;
    reason: string;
    frequency: string;
    priority: 'low' | 'medium' | 'high';
}

export interface ActivityStats {
    activityId: ActivityType;
    title: string;
    generationCount: number;
    lastGenerated: string;
    avgCompletionTime: number;
}

export interface AdaptiveQuestion {
    id: string;
    text: string;
    options: string[];
    correct: string;
    difficulty: number;
    skill: TestCategory;
    subSkill?: string;
    errorTags: Record<string, string>;
}

export type TestCategory = 'linguistic' | 'spatial' | 'logical' | 'attention' | 'musical' | 'kinesthetic' | 'naturalistic' | 'interpersonal' | 'intrapersonal';

export interface AssessmentConfig {
    selectedSkills: TestCategory[];
    mode: 'quick' | 'standard' | 'full';
}

export interface OCRResult {
    rawText: string;
    detectedType: ActivityType;
    title: string;
    description: string;
    generatedTemplate: string;
    structuredData: {
        difficulty: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
        itemCount: number;
        topic: string;
        instructions: string;
        components: any[];
        layoutHint?: any;
    };
    baseType: ActivityType;
}

export interface AlgorithmData extends BaseActivityData {
    challenge: string;
    steps: AlgorithmStep[];
}

export interface AlgorithmStep {
    id: number;
    type: 'start' | 'process' | 'decision' | 'input' | 'output' | 'end';
    text: string;
    next?: number;
    yes?: number;
    no?: number;
}
