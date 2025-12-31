
export enum ActivityType {
    ALGORITHM_GENERATOR = 'ALGORITHM_GENERATOR',
    AI_WORKSHEET_CONVERTER = 'AI_WORKSHEET_CONVERTER',
    HIDDEN_PASSWORD_GRID = 'HIDDEN_PASSWORD_GRID',
    NUMBER_LOGIC_RIDDLES = 'NUMBER_LOGIC_RIDDLES',
    BASIC_OPERATIONS = 'BASIC_OPERATIONS',
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
    // Added missing punctuation related activity types
    PUNCTUATION_MAZE = 'PUNCTUATION_MAZE',
    PUNCTUATION_PHONE_NUMBER = 'PUNCTUATION_PHONE_NUMBER',
    // Added missing members to fix AssessmentModule errors
    VISUAL_MEMORY = 'VISUAL_MEMORY',
    DOT_PAINTING = 'DOT_PAINTING',
    STROOP_TEST = 'STROOP_TEST',
    BURDON_TEST = 'BURDON_TEST',
    WORD_MEMORY = 'WORD_MEMORY',
    LOGIC_GRID_PUZZLE = 'LOGIC_GRID_PUZZLE'
}

export type View = 'generator' | 'admin' | 'profile' | 'messages' | 'ocr' | 'curriculum' | 'reading-studio' | 'math-studio' | 'students' | 'favorites' | 'savedList' | 'workbook' | 'shared' | 'assessment';

export type AppTheme = 'light' | 'dark' | 'anthracite' | 'space' | 'nature' | 'ocean' | 'anthracite-gold' | 'anthracite-cyber';

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
    lastActiveActivity?: { id: string; title: string; date: string };
}

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended';

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
    title?: string;
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
}

export type SingleWorksheetData = any;
export type WorksheetData = SingleWorksheetData[] | null;

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
    itemType?: 'divider' | 'activity';
    data: any;
    settings: StyleSettings;
    title: string;
    overrideStyle?: Partial<StyleSettings>;
    dividerConfig?: { title: string; subtitle: string; icon: string };
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

export interface StudentProfile {
    studentId?: string;
    name: string;
    school: string;
    grade: string;
    date: string;
    notes?: string;
}

export interface Activity {
    id: ActivityType;
    title: string;
    description: string;
    icon: string;
    category?: string;
    isCustom?: boolean;
    promptId?: string;
    defaultStyle?: Partial<StyleSettings>;
}

export interface ActivityCategory {
    id: string;
    title: string;
    description: string;
    icon: string;
    activities: ActivityType[];
}

export interface ActivityStats {
    activityId: ActivityType;
    title: string;
    generationCount: number;
    lastGenerated: string;
    avgCompletionTime: number;
}

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

export type FeedbackCategory = 'general' | 'bug' | 'feature' | 'content';
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

export interface Student {
    id: string;
    teacherId: string;
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
    notes?: string;
    createdAt: string;
}

export type CognitiveDomain = 'visual_spatial_memory' | 'processing_speed' | 'selective_attention' | 'phonological_loop' | 'logical_reasoning';

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

export interface AssessmentReport {
    overallSummary: string;
    scores: Record<string, number>;
    chartData: { label: string; value: number; fullMark: number }[];
    analysis: {
        strengths: string[];
        weaknesses: string[];
        errorAnalysis: string[];
    };
    roadmap: { activityId: string; reason: string; frequency: string }[];
    observations?: ClinicalObservation;
}

export interface SavedAssessment {
    id: string;
    userId: string;
    studentId?: string;
    studentName: string;
    age: number;
    gender: 'Kız' | 'Erkek';
    grade: string;
    report: AssessmentReport;
    createdAt: string;
    sharedBy?: string;
    sharedByName?: string;
    sharedWith?: string;
}

export interface CurriculumActivity {
    id: string;
    activityId: string;
    title: string;
    duration: number;
    goal: string;
    difficultyLevel: 'Easy' | 'Medium' | 'Hard';
    status: CurriculumActivityStatus;
}

export type CurriculumActivityStatus = 'pending' | 'completed' | 'skipped';

export interface CurriculumDay {
    day: number;
    focus: string;
    isCompleted: boolean;
    activities: CurriculumActivity[];
}

export interface Curriculum {
    id: string;
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
    userId?: string;
    createdAt?: string;
    sharedBy?: string;
    sharedByName?: string;
    sharedWith?: string;
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

export type TestCategory = 'linguistic' | 'logical' | 'spatial' | 'musical' | 'kinesthetic' | 'naturalistic' | 'interpersonal' | 'intrapersonal' | 'attention';

export interface AssessmentConfig {
    selectedSkills: TestCategory[];
    mode: 'quick' | 'standard' | 'deep';
}

export interface OCRResult {
    rawText: string;
    detectedType: string;
    title: string;
    description: string;
    generatedTemplate: string;
    structuredData: any;
    baseType: string;
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

export type ShapeType = 'circle' | 'square' | 'triangle' | 'hexagon' | 'star' | 'diamond' | 'pentagon' | 'octagon' | 'heart' | 'arrow' | 'moon' | 'semi-circle';

export type VisualMathType = 'objects' | 'ten-frame' | 'dice' | 'blocks' | 'number-line' | 'number-bond' | 'mixed' | 'number-line-advanced';

export interface OverlayItem {
    id: string;
    type: 'text' | 'sticker';
    content: string;
    x: number;
    y: number;
    scale?: number;
    rotation?: number;
}

export interface SavedWorksheet {
    id: string;
    userId: string;
    studentId?: string;
    name: string;
    activityType: ActivityType;
    worksheetData: SingleWorksheetData[];
    createdAt: string;
    icon: string;
    category: { id: string; title: string };
    sharedBy?: string;
    sharedByName?: string;
    sharedWith?: string;
    styleSettings?: StyleSettings;
    studentProfile?: StudentProfile;
    workbookItems?: any[];
    workbookSettings?: WorkbookSettings;
}

export interface AssessmentProfile {
    studentName: string;
    age: number;
    grade: string;
    observations: string[];
    testResults?: Record<string, { name: string; accuracy: number; avgReactionTime?: number }>;
    errorPatterns?: Record<string, number>;
}

export interface HiddenPasswordGridData extends BaseActivityData {
    settings: {
        gridSize: number;
        itemCount: number;
        cellStyle: 'square' | 'rounded' | 'minimal';
        letterCase: 'upper' | 'lower';
    };
    grids: {
        targetLetter: string;
        hiddenWord: string;
        grid: string[][];
    }[];
}

// Added missing GeneratorOptions interface
export interface GeneratorOptions {
    mode: 'fast' | 'ai';
    difficulty: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
    worksheetCount: number;
    itemCount: number;
    gridSize?: number;
    case?: 'upper' | 'lower';
    variant?: 'square' | 'rounded' | 'minimal';
    topic?: string;
    numberRange?: string;
    patternType?: 'arithmetic' | 'geometric' | 'complex';
    operationType?: 'add' | 'sub' | 'mult' | 'div' | 'mixed' | 'group';
    visualStyle?: 'objects' | 'ten-frame' | 'number-bond' | 'dice' | 'blocks' | 'mixed';
    selectedOperations?: string[];
    allowCarry?: boolean;
    allowBorrow?: boolean;
    allowRemainder?: boolean;
    allowNegative?: boolean;
    studentContext?: Student;
    targetLetters?: string;
    targetPair?: string;
    targetChar?: string;
    distractorChar?: string;
    symbolType?: string;
    codeLength?: number;
    subType?: 'letter-cancellation' | 'path-finding' | 'visual-logic';
    memorizeRatio?: number;
    groupSize?: number;
    groupCount?: number;
    visualType?: string;
    concept?: string;
    useSearch?: boolean;
    customInput?: string;
}
