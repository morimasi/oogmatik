
import React from 'react';

export enum ActivityType {
    READING_STROOP = 'READING_STROOP',
    ALGORITHM_GENERATOR = 'ALGORITHM_GENERATOR',
    AI_WORKSHEET_CONVERTER = 'AI_WORKSHEET_CONVERTER',
    HIDDEN_PASSWORD_GRID = 'HIDDEN_PASSWORD_GRID',
    NUMBER_LOGIC_RIDDLES = 'NUMBER_LOGIC_RIDDLES',
    MATH_PUZZLE = 'MATH_PUZZLE',
    CLOCK_READING = 'CLOCK_READING',
    MONEY_COUNTING = 'MONEY_COUNTING',
    MATH_MEMORY_CARDS = 'MATH_MEMORY_CARDS',
    STORY_COMPREHENSION = 'STORY_COMPREHENSION',
    STORY_ANALYSIS = 'STORY_ANALYSIS',
    STORY_CREATION_PROMPT = 'STORY_CREATION_PROMPT',
    MISSING_PARTS = 'MISSING_PARTS',
    NUMBER_PATTERN = 'NUMBER_PATTERN',
    KENDOKU = 'KENDOKU',
    NUMBER_PYRAMID = 'NUMBER_PYRAMID',
    REAL_LIFE_MATH_PROBLEMS = 'REAL_LIFE_MATH_PROBLEMS',
    ASSESSMENT_REPORT = 'ASSESSMENT_REPORT',
    WORKBOOK = 'WORKBOOK',
    OCR_CONTENT = 'OCR_CONTENT',
    MATH_STUDIO = 'MATH_STUDIO',
    WORD_SEARCH = 'WORD_SEARCH',
    ANAGRAM = 'ANAGRAM',
    CROSSWORD = 'CROSSWORD',
    FIND_THE_DIFFERENCE = 'FIND_THE_DIFFERENCE',
    VISUAL_ODD_ONE_OUT = 'VISUAL_ODD_ONE_OUT',
    SHAPE_MATCHING = 'SHAPE_MATCHING',
    GRID_DRAWING = 'GRID_DRAWING',
    READING_FLOW = 'READING_FLOW',
    PHONOLOGICAL_AWARENESS = 'PHONOLOGICAL_AWARENESS',
    RAPID_NAMING = 'RAPID_NAMING',
    LETTER_DISCRIMINATION = 'LETTER_DISCRIMINATION',
    MIRROR_LETTERS = 'MIRROR_LETTERS',
    SYLLABLE_TRAIN = 'SYLLABLE_TRAIN',
    VISUAL_TRACKING_LINES = 'VISUAL_TRACKING_LINES',
    BACKWARD_SPELLING = 'BACKWARD_SPELLING',
    CODE_READING = 'CODE_READING',
    ATTENTION_TO_QUESTION = 'ATTENTION_TO_QUESTION',
    ATTENTION_DEVELOPMENT = 'ATTENTION_DEVELOPMENT',
    ATTENTION_FOCUS = 'ATTENTION_FOCUS',
    HANDWRITING_PRACTICE = 'HANDWRITING_PRACTICE',
    NUMBER_SEARCH = 'NUMBER_SEARCH',
    ODD_EVEN_SUDOKU = 'ODD_EVEN_SUDOKU',
    PUNCTUATION_MAZE = 'PUNCTUATION_MAZE',
    PUNCTUATION_PHONE_NUMBER = 'PUNCTUATION_PHONE_NUMBER',
    VISUAL_MEMORY = 'VISUAL_MEMORY',
    DOT_PAINTING = 'DOT_PAINTING',
    STROOP_TEST = 'STROOP_TEST',
    BURDON_TEST = 'BURDON_TEST',
    WORD_MEMORY = 'WORD_MEMORY',
    LOGIC_GRID_PUZZLE = 'LOGIC_GRID_PUZZLE',
    MAP_INSTRUCTION = 'MAP_INSTRUCTION',
    SYMMETRY_DRAWING = 'SYMMETRY_DRAWING',
    FIND_IDENTICAL_WORD = 'FIND_IDENTICAL_WORD',
    FIND_DIFFERENT_STRING = 'FIND_DIFFERENT_STRING',
    SYLLABLE_WORD_BUILDER = 'SYLLABLE_WORD_BUILDER',
    LETTER_VISUAL_MATCHING = 'LETTER_VISUAL_MATCHING',
    SYNONYM_ANTONYM_MATCH = 'SYNONYM_ANTONYM_MATCH',
    READING_SUDOKU = 'READING_SUDOKU',
    SYLLABLE_MASTER_LAB = 'SYLLABLE_MASTER_LAB',
    FAMILY_RELATIONS = 'FAMILY_RELATIONS',
    FAMILY_LOGIC_TEST = 'FAMILY_LOGIC_TEST',
    VISUAL_ARITHMETIC = 'VISUAL_ARITHMETIC',
    NUMBER_SENSE = 'NUMBER_SENSE',
    SPATIAL_GRID = 'SPATIAL_GRID',
    CONCEPT_MATCH = 'CONCEPT_MATCH',
    ESTIMATION = 'ESTIMATION',
    CHARACTER_MEMORY = 'CHARACTER_MEMORY',
    COLOR_WHEEL_MEMORY = 'COLOR_WHEEL_MEMORY',
    IMAGE_COMPREHRENSION = 'IMAGE_COMPREHRENSION',
    CHAOTIC_NUMBER_SEARCH = 'CHAOTIC_NUMBER_SEARCH',
    LETTER_GRID_TEST = 'LETTER_GRID_TEST',
    FIND_LETTER_PAIR = 'FIND_LETTER_PAIR',
    TARGET_SEARCH = 'TARGET_SEARCH',
    FUTOSHIKI = 'FUTOSHIKI',
    SHAPE_SUDOKU = 'SHAPE_SUDOKU',
    ODD_ONE_OUT = 'ODD_ONE_OUT',
    THEMATIC_ODD_ONE_OUT = 'THEMATIC_ODD_ONE_OUT',
    TARGET_NUMBER = 'TARGET_NUMBER',
    SHAPE_COUNTING = 'SHAPE_COUNTING',
    MORPHOLOGY_MATRIX = 'MORPHOLOGY_MATRIX',
    READING_PYRAMID = 'READING_PYRAMID',
    NUMBER_PATH_LOGIC = 'NUMBER_PATH_LOGIC',
    DIRECTIONAL_TRACKING = 'DIRECTIONAL_TRACKING'
}

export type CognitiveErrorTag = 
    | 'visual_reversal' 
    | 'visual_inversion' 
    | 'phonological_substitution' 
    | 'sequencing_error' 
    | 'figure_ground_confusion' 
    | 'attention_lapse' 
    | 'impulsivity_error' 
    | 'working_memory_overflow' 
    | 'visual_discrimination'
    | 'logical_reasoning'; 

export type View = 'generator' | 'admin' | 'profile' | 'messages' | 'ocr' | 'curriculum' | 'reading-studio' | 'math-studio' | 'students' | 'favorites' | 'savedList' | 'workbook' | 'shared' | 'assessment';

export type AppTheme = 'light' | 'dark' | 'anthracite' | 'space' | 'nature' | 'ocean' | 'anthracite-gold' | 'anthracite-cyber';

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
    contentAlign: string;
    fontWeight: string;
    fontStyle: string;
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
    wordSpacing: number;
    paragraphSpacing: number;
    title?: string;
    focusMode: boolean;
    rulerColor: string;
    rulerHeight: number;
    maskOpacity: number;
}

export interface ActiveCurriculumSession {
    planId: string;
    studentId?: string;
    studentName: string;
    day: number;
    activityId: string;
    activityTitle: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    goal: string;
}

export interface UiSettings {
    fontFamily: string;
    fontSizeScale: number;
    letterSpacing: 'normal' | 'wide';
    lineHeight: number;
    saturation: number;
}

export interface BaseActivityData {
    title: string;
    instruction: string;
    pedagogicalNote?: string;
    imagePrompt?: string;
    imageBase64?: string;
    cognitiveGoal?: string;
    targetedErrors?: CognitiveErrorTag[];
}

export type BlockType = 'text' | 'question' | 'grid' | 'image' | 'math' | 'matching' | 'custom' | 'header';

export interface WorksheetBlock {
    id: string;
    type: BlockType;
    content: any;
    weight: number; 
    style?: Partial<StyleSettings>;
    layout?: { x: number, y: number, w: number, h: number };
}

export interface SingleWorksheetData extends BaseActivityData {
    blocks?: WorksheetBlock[];
    sections?: any[];
    [key: string]: any;
}

export type WorksheetData = SingleWorksheetData[];

export interface Activity {
    id: ActivityType;
    title: string;
    description: string;
    icon: string;
    defaultStyle?: Partial<StyleSettings>;
    promptId?: string;
}

export interface ActivityCategory {
    id: string;
    title: string;
    description: string;
    icon: string;
    activities: ActivityType[];
}

export interface Student {
    id: string;
    teacherId: string;
    createdAt: string;
    name: string;
    age: number;
    grade: string;
    avatar: string;
    diagnosis: string[];
    interests: string[];
    strengths: string[];
    weaknesses: string[];
    learningStyle: 'Görsel' | 'İşitsel' | 'Kinestetik' | 'Karma';
    parentName: string;
    contactPhone: string;
    contactEmail: string;
    notesHistory?: string;
    notes: string;
}

export interface StudentProfile {
    studentId?: string;
    name: string;
    school: string;
    grade: string;
    date: string;
    notes?: string;
}

export interface GeneratorOptions {
    mode: 'fast' | 'ai';
    difficulty: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
    worksheetCount: number;
    itemCount: number;
    topic?: string;
    gridSize?: number;
    gridRows?: number;
    gridCols?: number;
    case?: 'upper' | 'lower';
    targetPair?: string;
    targetFrequency?: 'low' | 'medium' | 'high';
    distractorStrategy?: 'random' | 'similar' | 'mirror';
    variant?: string;
    patternType?: string;
    operationType?: string;
    numberRange?: string;
    codeLength?: number;
    targetLetters?: string;
    visualType?: string;
    distractionLevel?: 'low' | 'medium' | 'high' | 'extreme';
    findDiffType?: string;
    targetChar?: string;
    distractorChar?: string;
    memorizeRatio?: number;
    fontFamily?: string;
    pyramidHeight?: number;
    emphasizedRegion?: string;
    mapInstructionTypes?: string[];
    showCityNames?: boolean;
    markerStyle?: string;
    customInput?: string;
    selectedOperations?: string[];
    studentContext?: Student;
    visualStyle?: string;
    showNumbers?: boolean;
    showVisualAid?: boolean;
    showSumTarget?: boolean;
    include5N1K?: boolean;
    focusVocabulary?: boolean;
    includeCreativeTask?: boolean;
    syllableRange?: string;
    targetShape?: string;
    // Fix: Added missing properties used in config components
    genre?: string;
    tone?: string;
    showCoordinates?: boolean;
    concept?: string;
    showImage?: boolean;
}

export interface SavedWorksheet {
    id: string;
    userId: string;
    studentId?: string | null;
    name: string;
    activityType: ActivityType;
    worksheetData: SingleWorksheetData[];
    createdAt: string;
    icon: string;
    category: { id: string, title: string };
    sharedBy?: string;
    sharedByName?: string;
    sharedWith?: string;
    styleSettings?: StyleSettings;
    studentProfile?: StudentProfile;
    workbookItems?: CollectionItem[];
    workbookSettings?: WorkbookSettings;
    report?: AssessmentReport;
}

export interface HistoryItem {
    id: string;
    userId: string;
    activityType: ActivityType;
    data: SingleWorksheetData[];
    timestamp: string;
    title: string;
    category: { id: string; title: string };
}

export interface CollectionItem {
    id: string;
    activityType: ActivityType;
    data: any;
    settings: StyleSettings;
    title: string;
    itemType?: 'activity' | 'divider';
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
    showPageNumbersOnAll?: boolean;
    showWatermark: boolean;
    watermarkOpacity: number;
    showBackCover: boolean;
    logoUrl?: string;
}

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended';

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

export type FeedbackCategory = 'general' | 'bug' | 'feature' | 'content';
export type FeedbackStatus = 'new' | 'read' | 'in-progress' | 'resolved' | 'replied';

export interface FeedbackItem {
    id: string;
    userId?: string;
    userName: string;
    userEmail: string;
    activityType: string;
    activityTitle: string;
    rating: number;
    category: FeedbackCategory;
    message: string;
    timestamp: string;
    status: FeedbackStatus;
    adminReply?: string;
}

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

export interface ActivityStats {
    activityId: ActivityType;
    title: string;
    generationCount: number;
    lastGenerated: string;
    avgCompletionTime: number;
}

export interface OCRResult {
    rawText: string;
    detectedType: string;
    title: string;
    description: string;
    generatedTemplate: string;
    structuredData?: any;
    baseType: string;
}

export type ShapeType = 'circle' | 'square' | 'triangle' | 'hexagon' | 'star' | 'diamond' | 'pentagon' | 'octagon';
export type VisualMathType = 'objects' | 'ten-frame' | 'dice' | 'blocks' | 'number-bond' | 'mixed';

export interface OverlayItem {
    id: string;
    type: 'text' | 'image' | 'shape';
    content: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation?: number;
}

export interface AssessmentReport {
    overallSummary: string;
    scores: Record<string, number>;
    chartData: { label: string; value: number; fullMark: number }[];
    analysis: { strengths: string[]; weaknesses: string[]; errorAnalysis: string[] };
    roadmap: { activityId: string; reason: string; frequency: string }[];
    observations?: ClinicalObservation;
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

export interface AssessmentProfile {
    studentName: string;
    age: number;
    grade: string;
    observations: string[];
    testResults?: Record<string, any>;
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
    testId: string;
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
    motorSkills: 'typical' | 'delayed' | 'advanced';
    notes: string;
}

export interface AssessmentRoadmapItem {
    activityId: string;
    title: string;
    reason: string;
    frequency: string;
    priority: 'low' | 'medium' | 'high';
}

export type TestCategory = 'linguistic' | 'logical' | 'spatial' | 'musical' | 'kinesthetic' | 'naturalistic' | 'interpersonal' | 'intrapersonal' | 'attention';

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

export interface AssessmentConfig {
    selectedSkills: TestCategory[];
    mode: 'quick' | 'standard' | 'detailed';
}

export interface Curriculum {
    id: string;
    userId?: string;
    studentId?: string;
    studentName: string;
    grade: string;
    startDate: string;
    durationDays: number;
    goals: string[];
    schedule: CurriculumDay[];
    note: string;
    interests: string[];
    weaknesses: string[];
    createdAt?: string;
    sharedBy?: string;
    sharedByName?: string;
    sharedWith?: string;
}

export interface CurriculumDay {
    day: number;
    focus: string;
    isCompleted: boolean;
    activities: CurriculumActivity[];
}

export type CurriculumActivityStatus = 'pending' | 'completed' | 'skipped';

export interface CurriculumActivity {
    id: string;
    activityId: string;
    title: string;
    duration: number;
    goal: string;
    difficultyLevel: 'Easy' | 'Medium' | 'Hard';
    status: CurriculumActivityStatus;
}

export type LayoutSectionId = 'header' | 'tracker' | 'story_block' | 'vocabulary' | 'questions_5n1k' | 'questions_test' | 'questions_inference' | 'creative' | 'notes';

export interface LayoutItem {
    id: LayoutSectionId;
    label: string;
    icon: string;
    isVisible: boolean;
    style: {
        x: number; y: number; w: number; h: number; zIndex: number; rotation: number;
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
        letterSpacing: number;
        fontWeight?: string;
        imageSettings?: {
            enabled: boolean;
            position: 'left' | 'right' | 'background';
            widthPercent: number;
            opacity: number;
            objectFit: 'cover' | 'contain';
            borderRadius: number;
            blendMode: string;
            filter: string;
        }
    };
    specificData?: any;
}

export interface ReadingStudioConfig {
    gradeLevel: string;
    studentName: string;
    topic: string;
    genre: string;
    tone: string;
    length: 'short' | 'medium' | 'long' | 'epic';
    layoutDensity: 'comfortable' | 'compact' | 'sparse';
    textComplexity: 'simple' | 'moderate' | 'advanced';
    fontSettings: { family: string; size: number; lineHeight: number; letterSpacing: number; wordSpacing: number };
    includeImage: boolean;
    imageSize: number;
    imageOpacity: number;
    imagePosition: 'left' | 'right';
    imageGeneration: { enabled: boolean; style: string; complexity: 'simple' | 'detailed' };
    include5N1K: boolean;
    countMultipleChoice: number;
    countTrueFalse: number;
    countFillBlanks: number;
    countLogic: number;
    countInference: number;
    focusVocabulary: boolean;
    includeCreativeTask: boolean;
    includeWordHunt: boolean;
    includeSpellingCheck: boolean;
    showReadingTracker: boolean;
    showSelfAssessment: boolean;
    showTeacherNotes: boolean;
    showDateSection: boolean;
}

export interface AlgorithmStep {
    id: number;
    type: 'start' | 'process' | 'decision' | 'input' | 'output' | 'end';
    text: string;
}

export interface AlgorithmData extends BaseActivityData {
    challenge: string;
    steps: AlgorithmStep[];
}
