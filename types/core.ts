
export const ActivityType = {
    // System Types
    ASSESSMENT_REPORT: 'ASSESSMENT_REPORT',
    WORKBOOK: 'WORKBOOK',
    OCR_CONTENT: 'OCR_CONTENT',
    CUSTOM_GENERATED: 'CUSTOM_GENERATED',

    // Verbal & Reading
    STORY_COMPREHENSION: 'STORY_COMPREHENSION',
    STORY_CREATION_PROMPT: 'STORY_CREATION_PROMPT',
    WORDS_IN_STORY: 'WORDS_IN_STORY',
    STORY_ANALYSIS: 'STORY_ANALYSIS',
    STORY_SEQUENCING: 'STORY_SEQUENCING',
    MISSING_PARTS: 'MISSING_PARTS',
    READING_FLOW: 'READING_FLOW',
    PROVERB_SAYING_SORT: 'PROVERB_SAYING_SORT',
    PROVERB_WORD_CHAIN: 'PROVERB_WORD_CHAIN',
    PROVERB_SENTENCE_FINDER: 'PROVERB_SENTENCE_FINDER',
    PROVERB_FILL_IN_THE_BLANK: 'PROVERB_FILL_IN_THE_BLANK',
    PROVERB_SEARCH: 'PROVERB_SEARCH',
    HANDWRITING_PRACTICE: 'HANDWRITING_PRACTICE',
    
    // Word Games
    WORD_SEARCH: 'WORD_SEARCH',
    ANAGRAM: 'ANAGRAM',
    SPELLING_CHECK: 'SPELLING_CHECK',
    LETTER_BRIDGE: 'LETTER_BRIDGE',
    WORD_LADDER: 'WORD_LADDER',
    WORD_FORMATION: 'WORD_FORMATION',
    REVERSE_WORD: 'REVERSE_WORD',
    WORD_GROUPING: 'WORD_GROUPING',
    MINI_WORD_GRID: 'MINI_WORD_GRID',
    PASSWORD_FINDER: 'PASSWORD_FINDER',
    SYLLABLE_COMPLETION: 'SYLLABLE_COMPLETION',
    SYNONYM_WORD_SEARCH: 'SYNONYM_WORD_SEARCH',
    SPIRAL_PUZZLE: 'SPIRAL_PUZZLE',
    PUNCTUATION_SPIRAL_PUZZLE: 'PUNCTUATION_SPIRAL_PUZZLE',
    CROSSWORD: 'CROSSWORD',
    JUMBLED_WORD_STORY: 'JUMBLED_WORD_STORY',
    HOMONYM_SENTENCE_WRITING: 'HOMONYM_SENTENCE_WRITING',
    WORD_GRID_PUZZLE: 'WORD_GRID_PUZZLE',
    HOMONYM_IMAGE_MATCH: 'HOMONYM_IMAGE_MATCH',
    ANTONYM_FLOWER_PUZZLE: 'ANTONYM_FLOWER_PUZZLE',
    SYNONYM_ANTONYM_GRID: 'SYNONYM_ANTONYM_GRID',
    ANTONYM_RESFEBE: 'ANTONYM_RESFEBE',
    SYNONYM_MATCHING_PATTERN: 'SYNONYM_MATCHING_PATTERN',
    WORD_WEB: 'WORD_WEB',
    SYLLABLE_WORD_SEARCH: 'SYLLABLE_WORD_SEARCH',
    WORD_SEARCH_WITH_PASSWORD: 'WORD_SEARCH_WITH_PASSWORD',
    WORD_WEB_WITH_PASSWORD: 'WORD_WEB_WITH_PASSWORD',
    LETTER_GRID_WORD_FIND: 'LETTER_GRID_WORD_FIND',
    WORD_PLACEMENT_PUZZLE: 'WORD_PLACEMENT_PUZZLE',
    POSITIONAL_ANAGRAM: 'POSITIONAL_ANAGRAM',
    IMAGE_ANAGRAM_SORT: 'IMAGE_ANAGRAM_SORT',
    ANAGRAM_IMAGE_MATCH: 'ANAGRAM_IMAGE_MATCH',
    RESFEBE: 'RESFEBE',
    THEMATIC_WORD_SEARCH_COLOR: 'THEMATIC_WORD_SEARCH_COLOR',
    SYNONYM_SEARCH_STORY: 'SYNONYM_SEARCH_STORY',

    // Math & Logic
    BASIC_OPERATIONS: 'BASIC_OPERATIONS',
    MATH_PUZZLE: 'MATH_PUZZLE',
    NUMBER_PATTERN: 'NUMBER_PATTERN',
    SHAPE_NUMBER_PATTERN: 'SHAPE_NUMBER_PATTERN',
    REAL_LIFE_MATH_PROBLEMS: 'REAL_LIFE_MATH_PROBLEMS',
    FUTOSHIKI: 'FUTOSHIKI',
    NUMBER_PYRAMID: 'NUMBER_PYRAMID',
    NUMBER_CAPSULE: 'NUMBER_CAPSULE',
    ODD_EVEN_SUDOKU: 'ODD_EVEN_SUDOKU',
    ROMAN_NUMERAL_CONNECT: 'ROMAN_NUMERAL_CONNECT',
    ROMAN_NUMERAL_STAR_HUNT: 'ROMAN_NUMERAL_STAR_HUNT',
    ROUNDING_CONNECT: 'ROUNDING_CONNECT',
    ARITHMETIC_CONNECT: 'ARITHMETIC_CONNECT',
    ROMAN_NUMERAL_MULTIPLICATION: 'ROMAN_NUMERAL_MULTIPLICATION',
    ROMAN_ARABIC_MATCH_CONNECT: 'ROMAN_ARABIC_MATCH_CONNECT',
    KENDOKU: 'KENDOKU',
    OPERATION_SQUARE_FILL_IN: 'OPERATION_SQUARE_FILL_IN',
    MULTIPLICATION_WHEEL: 'MULTIPLICATION_WHEEL',
    TARGET_NUMBER: 'TARGET_NUMBER',
    SHAPE_SUDOKU: 'SHAPE_SUDOKU',
    VISUAL_NUMBER_PATTERN: 'VISUAL_NUMBER_PATTERN',
    LOGIC_GRID_PUZZLE: 'LOGIC_GRID_PUZZLE',
    SHAPE_COUNTING: 'SHAPE_COUNTING',
    WEIGHT_CONNECT: 'WEIGHT_CONNECT',
    LENGTH_CONNECT: 'LENGTH_CONNECT',
    FAMILY_RELATIONS: 'FAMILY_RELATIONS',
    LOGIC_DEDUCTION: 'LOGIC_DEDUCTION',
    NUMBER_BOX_LOGIC: 'NUMBER_BOX_LOGIC',
    MAP_INSTRUCTION: 'MAP_INSTRUCTION',
    MIND_GAMES: 'MIND_GAMES',
    MIND_GAMES_56: 'MIND_GAMES_56',
    ALGORITHM_GENERATOR: 'ALGORITHM_GENERATOR',
    AI_WORKSHEET_CONVERTER: 'AI_WORKSHEET_CONVERTER',
    
    // Attention & Memory
    WORD_MEMORY: 'WORD_MEMORY',
    VISUAL_MEMORY: 'VISUAL_MEMORY',
    NUMBER_SEARCH: 'NUMBER_SEARCH',
    FIND_THE_DUPLICATE_IN_ROW: 'FIND_THE_DUPLICATE_IN_ROW',
    LETTER_GRID_TEST: 'LETTER_GRID_TEST',
    FIND_LETTER_PAIR: 'FIND_LETTER_PAIR',
    TARGET_SEARCH: 'TARGET_SEARCH',
    COLOR_WHEEL_MEMORY: 'COLOR_WHEEL_MEMORY',
    IMAGE_COMPREHENSION: 'IMAGE_COMPREHENSION',
    CHARACTER_MEMORY: 'CHARACTER_MEMORY',
    BURDON_TEST: 'BURDON_TEST',
    STROOP_TEST: 'STROOP_TEST',
    CHAOTIC_NUMBER_SEARCH: 'CHAOTIC_NUMBER_SEARCH',
    ATTENTION_TO_QUESTION: 'ATTENTION_TO_QUESTION',
    ATTENTION_DEVELOPMENT: 'ATTENTION_DEVELOPMENT',
    ATTENTION_FOCUS: 'ATTENTION_FOCUS',
    THEMATIC_ODD_ONE_OUT: 'THEMATIC_ODD_ONE_OUT',
    THEMATIC_ODD_ONE_OUT_SENTENCE: 'THEMATIC_ODD_ONE_OUT_SENTENCE',
    COLUMN_ODD_ONE_OUT_SENTENCE: 'COLUMN_ODD_ONE_OUT_SENTENCE',
    ODD_ONE_OUT: 'ODD_ONE_OUT',

    // Visual Perception
    FIND_THE_DIFFERENCE: 'FIND_THE_DIFFERENCE',
    SHAPE_MATCHING: 'SHAPE_MATCHING',
    FIND_IDENTICAL_WORD: 'FIND_IDENTICAL_WORD',
    GRID_DRAWING: 'GRID_DRAWING',
    SYMBOL_CIPHER: 'SYMBOL_CIPHER',
    BLOCK_PAINTING: 'BLOCK_PAINTING',
    VISUAL_ODD_ONE_OUT: 'VISUAL_ODD_ONE_OUT',
    VISUAL_ODD_ONE_OUT_THEMED: 'VISUAL_ODD_ONE_OUT_THEMED',
    SYMMETRY_DRAWING: 'SYMMETRY_DRAWING',
    FIND_DIFFERENT_STRING: 'FIND_DIFFERENT_STRING',
    DOT_PAINTING: 'DOT_PAINTING',
    ABC_CONNECT: 'ABC_CONNECT',
    COORDINATE_CIPHER: 'COORDINATE_CIPHER',
    WORD_CONNECT: 'WORD_CONNECT',
    PROFESSION_CONNECT: 'PROFESSION_CONNECT',
    MATCHSTICK_SYMMETRY: 'MATCHSTICK_SYMMETRY',
    PUNCTUATION_COLORING: 'PUNCTUATION_COLORING',
    SYNONYM_ANTONYM_COLORING: 'SYNONYM_ANTONYM_COLORING',
    STAR_HUNT: 'STAR_HUNT',
    WORD_COMPARISON: 'WORD_COMPARISON',
    PUNCTUATION_MAZE: 'PUNCTUATION_MAZE',
    PUNCTUATION_PHONE_NUMBER: 'PUNCTUATION_PHONE_NUMBER',

    // Dyslexia & Dyscalculia Support
    LETTER_DISCRIMINATION: 'LETTER_DISCRIMINATION',
    RAPID_NAMING: 'RAPID_NAMING',
    PHONOLOGICAL_AWARENESS: 'PHONOLOGICAL_AWARENESS',
    MIRROR_LETTERS: 'MIRROR_LETTERS',
    SYLLABLE_TRAIN: 'SYLLABLE_TRAIN',
    VISUAL_TRACKING_LINES: 'VISUAL_TRACKING_LINES',
    BACKWARD_SPELLING: 'BACKWARD_SPELLING',
    CODE_READING: 'CODE_READING',
    NUMBER_SENSE: 'NUMBER_SENSE',
    ARITHMETIC_FLUENCY: 'ARITHMETIC_FLUENCY',
    NUMBER_GROUPING: 'NUMBER_GROUPING',
    PROBLEM_SOLVING_STRATEGIES: 'PROBLEM_SOLVING_STRATEGIES',
    MATH_LANGUAGE: 'MATH_LANGUAGE',
    TIME_MEASUREMENT_GEOMETRY: 'TIME_MEASUREMENT_GEOMETRY',
    SPATIAL_REASONING: 'SPATIAL_REASONING',
    ESTIMATION_SKILLS: 'ESTIMATION_SKILLS',
    FRACTIONS_DECIMALS: 'FRACTIONS_DECIMALS',
    VISUAL_NUMBER_REPRESENTATION: 'VISUAL_NUMBER_REPRESENTATION',
    VISUAL_ARITHMETIC: 'VISUAL_ARITHMETIC',
    APPLIED_MATH_STORY: 'APPLIED_MATH_STORY',
    SPATIAL_AWARENESS_DISCOVERY: 'SPATIAL_AWARENESS_DISCOVERY',
    POSITIONAL_CONCEPTS: 'POSITIONAL_CONCEPTS',
    DIRECTIONAL_CONCEPTS: 'DIRECTIONAL_CONCEPTS',
    VISUAL_DISCRIMINATION_MATH: 'VISUAL_DISCRIMINATION_MATH',
} as const;

export type ActivityType = typeof ActivityType[keyof typeof ActivityType] | string;

// --- READING STUDIO TYPES ---
export interface InteractiveStorySegment {
    id: string;
    text: string;
}

export interface StoryAnswer {
    type: 'who' | 'where' | 'when' | 'what' | 'why' | 'how';
    text: string; // The text to be found in the story
    question: string; // The question prompted to the user
}

export interface ReadingSettings {
    fontFamily: 'OpenDyslexic' | 'Lexend' | 'Arial' | 'Times';
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    wordSpacing: number;
    bionicMode: boolean;
    syllableMode: boolean;
    focusMode: boolean; // Ruler
    focusHeight: number; // Height of the focus ruler
    colorTheme: 'white' | 'sepia' | 'cream' | 'dark' | 'black';
    overlayColor: string; // 'none' or hex color with opacity
    overlayOpacity: number;
}

export interface Activity {
    id: ActivityType;
    title: string;
    description: string;
    icon: string;
    defaultStyle?: Partial<StyleSettings>;
    isCustom?: boolean; 
    promptTemplate?: string; 
    baseType?: ActivityType; 
    category?: string;
    promptId?: string; 
}

export interface ActivityCategory {
    id: string;
    title: string;
    description: string;
    icon: string;
    activities: ActivityType[];
    isCustom?: boolean;
}

export interface BaseActivityData {
    title: string;
    instruction: string;
    pedagogicalNote?: string;
    imagePrompt?: string;
    imageBase64?: string;
}

export type WorksheetData = any[]; 
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
    themeBorder: 'none' | 'simple' | 'math' | 'verbal' | 'stars' | 'geo';
    contentAlign: 'left' | 'center' | 'right';
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    visualStyle: 'card' | 'minimal' | 'zebra';
    fontFamily: string;
    lineHeight: number;
    letterSpacing: number;
    showPedagogicalNote: boolean;
    showMascot: boolean;
    showStudentInfo: boolean;
    showTitle: boolean;
    showInstruction: boolean;
    showImage: boolean;
    showFooter: boolean;
    smartPagination: boolean;
}

export interface StudentProfile {
    name: string;
    school: string;
    grade: string;
    date: string;
    notes?: string;
}

export interface OverlayItem {
    id: string;
    type: 'text' | 'sticker';
    content: string;
    x: number;
    y: number;
    pageIndex: number;
}

export interface GeneratorOptions {
    mode: 'fast' | 'ai' | 'manual';
    difficulty: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
    worksheetCount: number;
    itemCount?: number;
    gridSize?: number;
    operationType?: string;
    selectedOperations?: string[];
    numberRange?: string;
    allowCarry?: boolean;
    allowBorrow?: boolean;
    allowRemainder?: boolean;
    wordLength?: { min: number; max: number };
    case?: 'upper' | 'lower';
    directions?: string | number[];
    customInput?: string | string[];
    topic?: string;
    targetLetters?: string;
    targetPair?: string;
    targetChar?: string;
    distractorChar?: string;
    memorizeRatio?: number;
    pyramidType?: string;
    variant?: string;
    contentType?: string;
    subType?: string;
    visualStyle?: string;
    conceptType?: string;
    groupSize?: number;
    groupCount?: number;
    maxSum?: number;
    storyTheme?: string;
    symbolType?: string;
    codeLength?: number;
    useThirdNumber?: boolean;
    num1Digits?: number;
    num2Digits?: number;
    characterName?: string;
    storyLength?: string;
    theme?: string;
    patternType?: string;
    type?: string;
    visualType?: string;
    concept?: string;
    
    // For Custom Activities
    customPrompt?: string;

    // For Search Grounding
    useSearch?: boolean;

    // Reading Studio Specific
    storyGenre?: string; // Masal, Bilim Kurgu, etc.
}

export type AppTheme = 'light' | 'dark' | 'anthracite' | 'space' | 'nature' | 'ocean' | 'anthracite-gold' | 'anthracite-cyber';

export interface UiSettings {
    fontFamily: string;
    fontSizeScale: number;
    letterSpacing: string;
    lineHeight: number;
    saturation: number;
}

export interface HistoryItem {
    id: string;
    userId: string;
    activityType: ActivityType;
    data: any; // WorksheetData
    timestamp: string;
    title: string;
    category: { id: string; title: string };
}

export type View = 'generator' | 'savedList' | 'favorites' | 'shared' | 'assessment' | 'workbook' | 'admin' | 'profile' | 'messages' | 'ocr' | 'curriculum' | 'reading-studio';

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

export interface CollectionItem {
    id: string;
    activityType: ActivityType;
    data: any;
    settings: StyleSettings;
    title: string;
    itemType?: 'activity' | 'divider';
    dividerConfig?: {
        title: string;
        subtitle: string;
        icon: string;
    };
    overrideStyle?: Partial<StyleSettings>;
}

export type UserRole = 'admin' | 'user';
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

export interface ActivityStats {
    activityId: ActivityType;
    title: string;
    generationCount: number;
    lastGenerated: string;
    avgCompletionTime: number;
}

export type FeedbackCategory = 'general' | 'bug' | 'feature' | 'content';
export type FeedbackStatus = 'new' | 'read' | 'in-progress' | 'resolved' | 'replied';

export interface FeedbackItem {
    id: string;
    userId?: string;
    userName: string;
    userEmail?: string;
    activityType?: string;
    activityTitle?: string;
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

export type ShapeType = 'circle' | 'square' | 'triangle' | 'hexagon' | 'star' | 'diamond' | 'pentagon' | 'octagon' | 'cube' | 'sphere' | 'pyramid' | 'cone' | 'heart' | 'cloud' | 'moon';

export type VisualMathType = 'objects' | 'ten-frame' | 'number-bond' | 'dice' | 'blocks' | 'mixed' | 'number-line-advanced' | 'estimation-jar';

export interface AssessmentProfile {
    studentName: string;
    age: number;
    grade: string;
    observations: string[];
    testResults?: Record<string, any>;
    errorPatterns?: Record<string, number>;
}

export type TestCategory = 'linguistic' | 'logical' | 'spatial' | 'musical' | 'kinesthetic' | 'naturalistic' | 'interpersonal' | 'intrapersonal' | 'attention';

export interface AdaptiveQuestion {
    id: string;
    text: string;
    options: string[];
    correct: string;
    difficulty: number;
    skill: string; 
    subSkill?: string;
    errorTags?: Record<string, string>;
}

export interface AssessmentConfig {
    selectedSkills: TestCategory[];
    mode: 'quick' | 'standard' | 'full';
}

export type CognitiveDomain = 
    | 'visual_spatial_memory' 
    | 'processing_speed'      
    | 'selective_attention'   
    | 'phonological_loop'     
    | 'logical_reasoning';    

export interface SubTestResult {
    testId: CognitiveDomain;
    name: string;
    score: number; 
    rawScore: number; 
    totalItems: number;
    avgReactionTime: number; 
    accuracy: number; 
    status: 'completed' | 'skipped' | 'aborted';
    timestamp: number;
}

export interface ClinicalObservation {
    anxietyLevel: 'low' | 'medium' | 'high';
    attentionSpan: 'focused' | 'distracted' | 'hyperactive';
    motorSkills: 'typical' | 'clumsy' | 'tremor';
    notes: string;
}

export interface AssessmentRoadmapItem {
    activityId: string; 
    title: string;
    reason: string;
    frequency: string;
    priority: 'high' | 'medium' | 'low';
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
    roadmap: {
        activityId: string;
        reason: string;
        frequency: string;
    }[];
    professionalData?: any; 
    subTests?: any[];
    observations?: any;
    id?: string;
    studentId?: string;
    examinerId?: string;
    date?: string;
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
    studentName: string;
    gender: 'Kız' | 'Erkek';
    age: number;
    grade: string;
    report: AssessmentReport;
    createdAt: string;
    sharedBy?: string;
    sharedByName?: string;
    sharedWith?: string;
}

export interface SavedWorksheet {
    id: string;
    userId: string;
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
    workbookSettings?: WorkbookSettings;
    description?: string; 
}

// --- OCR TYPES ---
export interface OCRResult {
    rawText: string;
    detectedType: string;
    title: string;
    description: string;
    generatedTemplate: string; // The reverse engineered prompt logic
    structuredData: {
        difficulty: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
        itemCount: number;
        topic: string;
        instructions: string; // The logic
        components: string[]; // Visual components found
        layoutHint?: {
            containerType: 'grid' | 'list' | 'flex';
            gridCols: number;
            cardStyle: 'simple' | 'border' | 'shadow' | 'colorful';
        }; 
    }; 
    baseType: ActivityType; // Closest known activity type or 'CUSTOM_GENERATED'
}

// --- CURRICULUM TYPES ---
export type CurriculumActivityStatus = 'pending' | 'completed' | 'skipped';

export interface CurriculumActivity {
    id: string;
    activityId: ActivityType;
    title: string;
    duration: number; // minutes
    goal: string;
    status: CurriculumActivityStatus;
    difficultyLevel: 'Easy' | 'Medium' | 'Hard';
}

export interface CurriculumDay {
    day: number;
    focus: string;
    activities: CurriculumActivity[];
    isCompleted: boolean;
}

export interface Curriculum {
    id: string;
    userId?: string; 
    createdAt?: string; 
    sharedBy?: string;
    sharedByName?: string;
    sharedWith?: string;
    studentName: string;
    grade: string;
    startDate: string;
    durationDays: number;
    goals: string[];
    note: string;
    schedule: CurriculumDay[];
    progress?: number;
    interests?: string[];
    weaknesses?: string[];
}

export interface AlgorithmStep {
    id: number;
    type: 'process' | 'decision' | 'input' | 'output' | 'start' | 'end';
    text: string;
    next?: number;
    yes?: number;
    no?: number;
}

export interface AlgorithmData extends BaseActivityData {
    steps: AlgorithmStep[];
    challenge: string;
}
