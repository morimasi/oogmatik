
export enum ActivityType {
    FIND_LETTER_PAIR = 'FIND_LETTER_PAIR',
    READING_SUDOKU = 'READING_SUDOKU',
    SYLLABLE_MASTER_LAB = 'SYLLABLE_MASTER_LAB',
    READING_STROOP = 'READING_STROOP',
    FAMILY_RELATIONS = 'FAMILY_RELATIONS',
    FAMILY_LOGIC_TEST = 'FAMILY_LOGIC_TEST',
    SYNONYM_ANTONYM_MATCH = 'SYNONYM_ANTONYM_MATCH',
    LETTER_VISUAL_MATCHING = 'LETTER_VISUAL_MATCHING',
    SYLLABLE_WORD_BUILDER = 'SYLLABLE_WORD_BUILDER',
    MAP_INSTRUCTION = 'MAP_INSTRUCTION',
    ALGORITHM_GENERATOR = 'ALGORITHM_GENERATOR',
    AI_WORKSHEET_CONVERTER = 'AI_WORKSHEET_CONVERTER',
    HIDDEN_PASSWORD_GRID = 'HIDDEN_PASSWORD_GRID',
    NUMBER_LOGIC_RIDDLES = 'NUMBER_LOGIC_RIDDLES',
    MATH_PUZZLE = 'MATH_PUZZLE',
    CLOCK_READING = 'CLOCK_READING',
    MONEY_COUNTING = 'MONEY_COUNTING',
    MATH_MEMORY_CARDS = 'MATH_MEMORY_CARDS',
    FIND_THE_DIFFERENCE = 'FIND_THE_DIFFERENCE',
    VISUAL_ODD_ONE_OUT = 'VISUAL_ODD_ONE_OUT',
    GRID_DRAWING = 'GRID_DRAWING',
    SYMMETRY_DRAWING = 'SYMMETRY_DRAWING',
    WORD_SEARCH = 'WORD_SEARCH',
    SHAPE_COUNTING = 'SHAPE_COUNTING',
    MORPHOLOGY_MATRIX = 'MORPHOLOGY_MATRIX',
    READING_PYRAMID = 'READING_PYRAMID',
    NUMBER_PATH_LOGIC = 'NUMBER_PATH_LOGIC',
    DIRECTIONAL_TRACKING = 'DIRECTIONAL_TRACKING',
    STORY_COMPREHENSION = 'STORY_COMPREHENSION',
    STORY_ANALYSIS = 'STORY_ANALYSIS',
    STORY_CREATION_PROMPT = 'STORY_CREATION_PROMPT',
    WORDS_IN_STORY = 'WORDS_IN_STORY',
    STORY_SEQUENCING = 'STORY_SEQUENCING',
    PROVERB_SAYING_SORT = 'PROVERB_SAYING_SORT',
    PROVERB_WORD_CHAIN = 'PROVERB_WORD_CHAIN',
    PROVERB_FILL_IN_THE_BLANK = 'PROVERB_FILL_IN_THE_BLANK',
    PROVERB_SEARCH = 'PROVERB_SEARCH',
    PROVERB_SENTENCE_FINDER = 'PROVERB_SENTENCE_FINDER',
    MISSING_PARTS = 'MISSING_PARTS',
    OCR_CONTENT = 'OCR_CONTENT',
    ASSESSMENT_REPORT = 'ASSESSMENT_REPORT',
    WORKBOOK = 'WORKBOOK',
    FUTOSHIKI = 'FUTOSHIKI',
    KENDOKU = 'KENDOKU',
    NUMBER_PYRAMID = 'NUMBER_PYRAMID',
    NUMBER_PATTERN = 'NUMBER_PATTERN',
    REAL_LIFE_MATH_PROBLEMS = 'REAL_LIFE_MATH_PROBLEMS',
    MATH_STUDIO = 'MATH_STUDIO',
    WORD_MEMORY = 'WORD_MEMORY',
    VISUAL_MEMORY = 'VISUAL_MEMORY',
    CHARACTER_MEMORY = 'CHARACTER_MEMORY',
    COLOR_WHEEL_MEMORY = 'COLOR_WHEEL_MEMORY',
    IMAGE_COMPREHRENSION = 'IMAGE_COMPREHRENSION',
    STROOP_TEST = 'STROOP_TEST',
    BURDON_TEST = 'BURDON_TEST',
    NUMBER_SEARCH = 'NUMBER_SEARCH',
    CHAOTIC_NUMBER_SEARCH = 'CHAOTIC_NUMBER_SEARCH',
    ATTENTION_DEVELOPMENT = 'ATTENTION_DEVELOPMENT',
    ATTENTION_FOCUS = 'ATTENTION_FOCUS',
    FIND_IDENTICAL_WORD = 'FIND_IDENTICAL_WORD',
    LETTER_GRID_TEST = 'LETTER_GRID_TEST',
    TARGET_SEARCH = 'TARGET_SEARCH',
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
    HANDWRITING_PRACTICE = 'HANDWRITING_PRACTICE',
    ANAGRAM = 'ANAGRAM',
    CROSSWORD = 'CROSSWORD',
    ODD_ONE_OUT = 'ODD_ONE_OUT',
    THEMATIC_ODD_ONE_OUT = 'THEMATIC_ODD_ONE_OUT',
    CONCEPT_MATCH = 'CONCEPT_MATCH',
    ESTIMATION = 'ESTIMATION',
    SPATIAL_GRID = 'SPATIAL_GRID',
    ODD_EVEN_SUDOKU = 'ODD_EVEN_SUDOKU',
    PUNCTUATION_MAZE = 'PUNCTUATION_MAZE',
    LOGIC_GRID_PUZZLE = 'LOGIC_GRID_PUZZLE',
    DOT_PAINTING = 'DOT_PAINTING',
    SHAPE_SUDOKU = 'SHAPE_SUDOKU',
    VISUAL_ARITHMETIC = 'VISUAL_ARITHMETIC',
    NUMBER_SENSE = 'NUMBER_SENSE'
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
    subscriptionPlan: 'free' | 'pro';
    favorites: ActivityType[];
    lastActiveActivity?: {
        id: string;
        title: string;
        date: string;
    };
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
    parentName?: string;
    contactPhone?: string;
    contactEmail?: string;
    notes?: string;
    notesHistory?: string;
    createdAt: string;
}

export interface BaseActivityData {
    title: string;
    instruction: string;
    pedagogicalNote?: string;
    imagePrompt?: string;
    imageBase64?: string;
    targetedErrors?: string[];
    layoutArchitecture?: {
        cols?: number;
        gap?: number;
        blocks: WorksheetBlock[];
    };
}

export type SingleWorksheetData = BaseActivityData & Record<string, any>;
export type WorksheetData = SingleWorksheetData[] | null;

export interface StyleSettings {
    fontSize: number;
    scale: number;
    borderColor: string;
    borderWidth: number;
    margin: number;
    columns: number;
    gap: number;
    orientation: 'portrait' | 'landscape';
    themeBorder: 'none' | 'simple' | 'math' | 'verbal' | 'stars' | 'geo';
    contentAlign: 'left' | 'center' | 'right' | 'justify';
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    visualStyle: 'card' | 'minimal';
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
    focusMode: boolean;
    rulerColor: string;
    rulerHeight: number;
    maskOpacity: number;
    title?: string;
}

export interface GeneratorOptions {
    mode: 'fast' | 'ai';
    difficulty: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
    worksheetCount: number;
    itemCount: number;
    topic?: string;
    gridSize?: number;
    patternType?: 'arithmetic' | 'geometric' | 'complex';
    targetShape?: ShapeType;
    variant?: string;
    studentContext?: Student;
    memorizeRatio?: number;
    targetLetters?: string;
    visualType?: 'geometric' | 'abstract' | 'character' | 'complex';
    fontFamily?: string;
    case?: 'upper' | 'lower';
    numberRange?: string;
    codeLength?: number;
    targetChar?: string;
    distractorChar?: string;
    gridRows?: number;
    gridCols?: number;
    syllableRange?: string;
    pyramidHeight?: number;
    selectedOperations?: string[];
    visualStyle?: string;
    showNumbers?: boolean;
    targetPair?: string;
    mapInstructionTypes?: string[];
    showCityNames?: boolean;
    markerStyle?: string;
    emphasizedRegion?: string;
    customInput?: string;
    operationType?: string;
    distractionLevel?: 'low' | 'medium' | 'high' | 'extreme';
    fontSizePreference?: 'small' | 'medium' | 'large';
    visualComplexity?: 'simple' | 'balanced' | 'complex';
    targetFrequency?: string;
    distractorStrategy?: string;
    findDiffType?: string;
    genre?: string;
    tone?: string;
    include5N1K?: boolean;
    focusVocabulary?: boolean;
    includeCreativeTask?: boolean;
    includeImage?: boolean;
    showSumTarget?: boolean;
    concept?: string;
}

export type ShapeType = 'circle' | 'square' | 'triangle' | 'hexagon' | 'star' | 'diamond' | 'pentagon' | 'octagon';
export type VisualMathType = 'ten-frame' | 'dice' | 'blocks' | 'objects' | 'number-bond' | 'mixed';

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

export interface StudentProfile {
    studentId?: string;
    name: string;
    school: string;
    grade: string;
    date: string;
    notes?: string;
}

export interface OverlayItem {
    id: string;
    type: 'sticker' | 'text' | 'drawing';
    content: string;
    x: number;
    y: number;
    scale?: number;
    rotation?: number;
}

export interface ActiveCurriculumSession {
    planId: string;
    day: number;
    activityId: string;
    activityTitle: string;
    studentName: string;
    studentId?: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    goal: string;
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
    workbookItems?: CollectionItem[];
    workbookSettings?: WorkbookSettings;
}

export type AppTheme = 'light' | 'dark' | 'anthracite' | 'space' | 'nature' | 'ocean' | 'anthracite-gold' | 'anthracite-cyber';

export interface HistoryItem {
    id: string;
    userId: string;
    activityType: ActivityType;
    data: SingleWorksheetData[];
    timestamp: string;
    title: string;
    category: { id: string; title: string };
}

export type View = 'generator' | 'savedList' | 'workbook' | 'favorites' | 'shared' | 'admin' | 'profile' | 'messages' | 'assessment' | 'screening';

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
    itemType?: 'activity' | 'divider';
    data: any;
    settings: StyleSettings;
    overrideStyle?: Partial<StyleSettings>;
    title: string;
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

export interface WorksheetBlock {
    type: 'header' | 'text' | 'grid' | 'table' | 'svg_shape' | 'dual_column' | 'image' | 'question' | 'logic_card' | 'footer_validation';
    content: any;
    style?: {
        textAlign?: string;
        fontWeight?: string;
        fontSize?: number;
        backgroundColor?: string;
        borderRadius?: number;
        color?: string;
    };
    weight?: number;
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
    status: 'completed' | 'skipped' | 'partial';
    timestamp: number;
}

export interface ClinicalObservation {
    anxietyLevel: 'low' | 'medium' | 'high';
    attentionSpan: 'focused' | 'distracted' | 'hyperactive';
    motorSkills: 'typical' | 'delayed' | 'precise';
    notes: string;
}

export interface AssessmentRoadmapItem {
    activityId: ActivityType | string;
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
    professionalData?: ProfessionalAssessmentReport;
}

export interface ActivityStats {
    activityId: ActivityType;
    title: string;
    generationCount: number;
    lastGenerated: string;
    avgCompletionTime?: number;
}

export type FeedbackCategory = 'general' | 'bug' | 'feature' | 'content';
export type FeedbackStatus = 'new' | 'read' | 'in-progress' | 'replied' | 'resolved';

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

export interface AssessmentProfile {
    studentName: string;
    age: number;
    grade: string;
    observations: string[];
    testResults?: Record<string, { name: string; accuracy: number }>;
    errorPatterns?: Record<string, number>;
}

export type TestCategory = 'linguistic' | 'logical' | 'spatial' | 'attention' | 'musical' | 'kinesthetic' | 'naturalistic' | 'interpersonal' | 'intrapersonal';

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
    mode: 'quick' | 'standard' | 'full';
}

export interface CurriculumDay {
    day: number;
    focus: string;
    activities: CurriculumActivity[];
    isCompleted: boolean;
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
    createdAt?: string;
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

export interface ReadingStudioConfig {
    gradeLevel: string;
    studentName: string;
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
    imagePosition: 'left' | 'right' | 'top' | 'background';
    imageGeneration: {
        enabled: boolean;
        style: string;
        complexity: 'simple' | 'detailed';
    };
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

export type LayoutSectionId = 'header' | 'tracker' | 'story_block' | 'vocabulary' | 'questions_5n1k' | 'questions_test' | 'questions_inference' | 'creative' | 'notes';

export interface LayoutItem {
    id: LayoutSectionId;
    label: string;
    instanceId: string;
    isVisible: boolean;
    style: {
        x: number;
        y: number;
        w: number;
        h: number;
        zIndex: number;
        rotation?: number;
        padding?: number;
        backgroundColor?: string;
        borderColor?: string;
        borderWidth?: number;
        borderStyle?: string;
        borderRadius?: number;
        opacity?: number;
        boxShadow?: string;
        textAlign?: string;
        color?: string;
        fontSize?: number;
        fontFamily?: string;
        lineHeight?: number;
        letterSpacing?: number;
        fontWeight?: string;
        imageSettings?: {
            enabled: boolean;
            position: 'left' | 'right' | 'background';
            widthPercent: number;
            opacity: number;
            objectFit: string;
            borderRadius: number;
            blendMode: string;
            filter: string;
        };
    };
    specificData?: any;
}

export type CognitiveErrorTag = 
    | 'visual_discrimination' 
    | 'attention_lapse' 
    | 'impulsivity_error' 
    | 'phonological_substitution' 
    | 'sequencing_error' 
    | 'visual_reversal' 
    | 'visual_inversion' 
    | 'working_memory_overflow'
    | 'logical_reasoning';
