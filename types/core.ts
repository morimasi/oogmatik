
export enum ActivityType {
  WORD_SEARCH = 'WORD_SEARCH',
  ANAGRAM = 'ANAGRAM',
  FIND_THE_DIFFERENCE = 'FIND_THE_DIFFERENCE',
  MATH_PUZZLE = 'MATH_PUZZLE',
  STORY_COMPREHENSION = 'STORY_COMPREHENSION',
  STROOP_TEST = 'STROOP_TEST',
  NUMBER_PATTERN = 'NUMBER_PATTERN',
  SPELLING_CHECK = 'SPELLING_CHECK',
  LETTER_GRID_TEST = 'LETTER_GRID_TEST',
  NUMBER_SEARCH = 'NUMBER_SEARCH',
  WORD_MEMORY = 'WORD_MEMORY',
  STORY_CREATION_PROMPT = 'STORY_CREATION_PROMPT',
  WORD_COMPARISON = 'WORD_COMPARISON',
  WORDS_IN_STORY = 'WORDS_IN_STORY',
  ODD_ONE_OUT = 'ODD_ONE_OUT',
  SHAPE_MATCHING = 'SHAPE_MATCHING',
  SYMBOL_CIPHER = 'SYMBOL_CIPHER',
  PROVERB_FILL_IN_THE_BLANK = 'PROVERB_FILL_IN_THE_BLANK',
  LETTER_BRIDGE = 'LETTER_BRIDGE',
  FIND_THE_DUPLICATE_IN_ROW = 'FIND_THE_DUPLICATE_IN_ROW',
  WORD_LADDER = 'WORD_LADDER',
  FIND_IDENTICAL_WORD = 'FIND_IDENTICAL_WORD',
  WORD_FORMATION = 'WORD_FORMATION',
  REVERSE_WORD = 'REVERSE_WORD',
  FIND_LETTER_PAIR = 'FIND_LETTER_PAIR',
  WORD_GROUPING = 'WORD_GROUPING',
  VISUAL_MEMORY = 'VISUAL_MEMORY',
  STORY_ANALYSIS = 'STORY_ANALYSIS',
  COORDINATE_CIPHER = 'COORDINATE_CIPHER',
  PROVERB_SEARCH = 'PROVERB_SEARCH',
  TARGET_SEARCH = 'TARGET_SEARCH',
  SHAPE_NUMBER_PATTERN = 'SHAPE_NUMBER_PATTERN',
  GRID_DRAWING = 'GRID_DRAWING',
  COLOR_WHEEL_MEMORY = 'COLOR_WHEEL_MEMORY',
  IMAGE_COMPREHENSION = 'IMAGE_COMPREHENSION',
  CHARACTER_MEMORY = 'CHARACTER_MEMORY',
  STORY_SEQUENCING = 'STORY_SEQUENCING',
  CHAOTIC_NUMBER_SEARCH = 'CHAOTIC_NUMBER_SEARCH',
  BLOCK_PAINTING = 'BLOCK_PAINTING',
  MINI_WORD_GRID = 'MINI_WORD_GRID',
  VISUAL_ODD_ONE_OUT = 'VISUAL_ODD_ONE_OUT',
  SHAPE_COUNTING = 'SHAPE_COUNTING',
  SYMMETRY_DRAWING = 'SYMMETRY_DRAWING',
  BURDON_TEST = 'BURDON_TEST',
  FIND_DIFFERENT_STRING = 'FIND_DIFFERENT_STRING',
  DOT_PAINTING = 'DOT_PAINTING',
  ABC_CONNECT = 'ABC_CONNECT',
  PASSWORD_FINDER = 'PASSWORD_FINDER',
  SYLLABLE_COMPLETION = 'SYLLABLE_COMPLETION',
  SYNONYM_WORD_SEARCH = 'SYNONYM_WORD_SEARCH',
  WORD_CONNECT = 'WORD_CONNECT',
  SPIRAL_PUZZLE = 'SPIRAL_PUZZLE',
  CROSSWORD = 'CROSSWORD',
  JUMBLED_WORD_STORY = 'JUMBLED_WORD_STORY',
  HOMONYM_SENTENCE_WRITING = 'HOMONYM_SENTENCE_WRITING',
  WORD_GRID_PUZZLE = 'WORD_GRID_PUZZLE',
  PROVERB_SAYING_SORT = 'PROVERB_SAYING_SORT',
  HOMONYM_IMAGE_MATCH = 'HOMONYM_IMAGE_MATCH',
  ANTONYM_FLOWER_PUZZLE = 'ANTONYM_FLOWER_PUZZLE',
  PROVERB_WORD_CHAIN = 'PROVERB_WORD_CHAIN',
  THEMATIC_ODD_ONE_OUT = 'THEMATIC_ODD_ONE_OUT',
  SYNONYM_ANTONYM_GRID = 'SYNONYM_ANTONYM_GRID',
  PUNCTUATION_COLORING = 'PUNCTUATION_COLORING',
  PUNCTUATION_MAZE = 'PUNCTUATION_MAZE',
  ANTONYM_RESFEBE = 'ANTONYM_RESFEBE',
  THEMATIC_WORD_SEARCH_COLOR = 'THEMATIC_WORD_SEARCH_COLOR',
  THEMATIC_ODD_ONE_OUT_SENTENCE = 'THEMATIC_ODD_ONE_OUT_SENTENCE',
  SYNONYM_SEARCH_STORY = 'SYNONYM_SEARCH_STORY',
  COLUMN_ODD_ONE_OUT_SENTENCE = 'COLUMN_ODD_ONE_OUT_SENTENCE',
  SYNONYM_ANTONYM_COLORING = 'SYNONYM_ANTONYM_COLORING',
  PUNCTUATION_PHONE_NUMBER = 'PUNCTUATION_PHONE_NUMBER',
  PUNCTUATION_SPIRAL_PUZZLE = 'PUNCTUATION_SPIRAL_PUZZLE',
  SYNONYM_MATCHING_PATTERN = 'SYNONYM_MATCHING_PATTERN',
  FUTOSHIKI = 'FUTOSHIKI',
  NUMBER_PYRAMID = 'NUMBER_PYRAMID',
  NUMBER_CAPSULE = 'NUMBER_CAPSULE',
  ODD_EVEN_SUDOKU = 'ODD_EVEN_SUDOKU',
  ROMAN_NUMERAL_CONNECT = 'ROMAN_NUMERAL_CONNECT',
  ROMAN_NUMERAL_STAR_HUNT = 'ROMAN_NUMERAL_STAR_HUNT',
  ROUNDING_CONNECT = 'ROUNDING_CONNECT',
  ROMAN_NUMERAL_MULTIPLICATION = 'ROMAN_NUMERAL_MULTIPLICATION',
  ARITHMETIC_CONNECT = 'ARITHMETIC_CONNECT',
  ROMAN_ARABIC_MATCH_CONNECT = 'ROMAN_ARABIC_MATCH_CONNECT',
  KENDOKU = 'KENDOKU',
  OPERATION_SQUARE_FILL_IN = 'OPERATION_SQUARE_FILL_IN',
  MULTIPLICATION_WHEEL = 'MULTIPLICATION_WHEEL',
  TARGET_NUMBER = 'TARGET_NUMBER',
  SHAPE_SUDOKU = 'SHAPE_SUDOKU',
  WEIGHT_CONNECT = 'WEIGHT_CONNECT',
  RESFEBE = 'RESFEBE',
  MATCHSTICK_SYMMETRY = 'MATCHSTICK_SYMMETRY',
  WORD_WEB = 'WORD_WEB',
  STAR_HUNT = 'STAR_HUNT',
  LENGTH_CONNECT = 'LENGTH_CONNECT',
  VISUAL_NUMBER_PATTERN = 'VISUAL_NUMBER_PATTERN',
  MISSING_PARTS = 'MISSING_PARTS',
  PROFESSION_CONNECT = 'PROFESSION_CONNECT',
  VISUAL_ODD_ONE_OUT_THEMED = 'VISUAL_ODD_ONE_OUT_THEMED',
  LOGIC_GRID_PUZZLE = 'LOGIC_GRID_PUZZLE',
  IMAGE_ANAGRAM_SORT = 'IMAGE_ANAGRAM_SORT',
  ANAGRAM_IMAGE_MATCH = 'ANAGRAM_IMAGE_MATCH',
  SYLLABLE_WORD_SEARCH = 'SYLLABLE_WORD_SEARCH',
  WORD_SEARCH_WITH_PASSWORD = 'WORD_SEARCH_WITH_PASSWORD',
  WORD_WEB_WITH_PASSWORD = 'WORD_WEB_WITH_PASSWORD',
  LETTER_GRID_WORD_FIND = 'LETTER_GRID_WORD_FIND',
  WORD_PLACEMENT_PUZZLE = 'WORD_PLACEMENT_PUZZLE',
  POSITIONAL_ANAGRAM = 'POSITIONAL_ANAGRAM',
  READING_FLOW = 'READING_FLOW',
  LETTER_DISCRIMINATION = 'LETTER_DISCRIMINATION',
  RAPID_NAMING = 'RAPID_NAMING',
  PHONOLOGICAL_AWARENESS = 'PHONOLOGICAL_AWARENESS',
  MIRROR_LETTERS = 'MIRROR_LETTERS',
  SYLLABLE_TRAIN = 'SYLLABLE_TRAIN',
  VISUAL_TRACKING_LINES = 'VISUAL_TRACKING_LINES',
  BACKWARD_SPELLING = 'BACKWARD_SPELLING',
  BASIC_OPERATIONS = 'BASIC_OPERATIONS',
  REAL_LIFE_MATH_PROBLEMS = 'REAL_LIFE_MATH_PROBLEMS',
  PROVERB_SENTENCE_FINDER = 'PROVERB_SENTENCE_FINDER',
  FAMILY_RELATIONS = 'FAMILY_RELATIONS',
  LOGIC_DEDUCTION = 'LOGIC_DEDUCTION',
  NUMBER_BOX_LOGIC = 'NUMBER_BOX_LOGIC',
  MAP_INSTRUCTION = 'MAP_INSTRUCTION',
  CODE_READING = 'CODE_READING',
  ATTENTION_TO_QUESTION = 'ATTENTION_TO_QUESTION',
  ATTENTION_DEVELOPMENT = 'ATTENTION_DEVELOPMENT',
  ATTENTION_FOCUS = 'ATTENTION_FOCUS',
  
  MIND_GAMES = 'MIND_GAMES',
  MIND_GAMES_56 = 'MIND_GAMES_56',

  // --- REPORT ---
  ASSESSMENT_REPORT = 'ASSESSMENT_REPORT',

  // --- WORKBOOK ---
  WORKBOOK = 'WORKBOOK',

  // --- DYSCALCULIA ACTIVITIES ---
  NUMBER_SENSE = 'NUMBER_SENSE',
  ARITHMETIC_FLUENCY = 'ARITHMETIC_FLUENCY',
  NUMBER_GROUPING = 'NUMBER_GROUPING',
  PROBLEM_SOLVING_STRATEGIES = 'PROBLEM_SOLVING_STRATEGIES',
  MATH_LANGUAGE = 'MATH_LANGUAGE',
  TIME_MEASUREMENT_GEOMETRY = 'TIME_MEASUREMENT_GEOMETRY',
  SPATIAL_REASONING = 'SPATIAL_REASONING',
  ESTIMATION_SKILLS = 'ESTIMATION_SKILLS',
  FRACTIONS_DECIMALS = 'FRACTIONS_DECIMALS',
  VISUAL_NUMBER_REPRESENTATION = 'VISUAL_NUMBER_REPRESENTATION',
  VISUAL_ARITHMETIC = 'VISUAL_ARITHMETIC',
  APPLIED_MATH_STORY = 'APPLIED_MATH_STORY',
  SPATIAL_AWARENESS_DISCOVERY = 'SPATIAL_AWARENESS_DISCOVERY',
  POSITIONAL_CONCEPTS = 'POSITIONAL_CONCEPTS',
  DIRECTIONAL_CONCEPTS = 'DIRECTIONAL_CONCEPTS',
  VISUAL_DISCRIMINATION_MATH = 'VISUAL_DISCRIMINATION_MATH'
}

export type AppTheme = 'light' | 'dark' | 'anthracite' | 'anthracite-gold' | 'anthracite-cyber' | 'anthracite-bumblebee' | 'anthracite-stone' | 'anthracite-honey' | 'anthracite-onyx' | 'space' | 'nature' | 'ocean';

export interface UiSettings {
    fontFamily: 'Lexend' | 'OpenDyslexic' | 'Inter' | 'Lora' | 'Comic Neue';
    fontSizeScale: number; 
    letterSpacing: 'normal' | 'wide';
    lineHeight: number; 
    saturation: number; 
}

export interface StudentProfile {
    name: string;
    school?: string;
    grade?: string;
    date?: string;
    notes?: string;
}

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
  
  // Advanced Typography & Layout
  fontFamily?: 'OpenDyslexic' | 'Lexend' | 'Inter' | 'Comic Neue' | 'Lora';
  lineHeight?: number; // 1.0 to 2.5
  letterSpacing?: number; // 0 to 5px
  visualStyle?: 'minimal' | 'boxed' | 'card' | 'zebra'; // Visual theme for items

  // Visibility Settings
  showStudentInfo: boolean; // Name/Date strip
  showTitle: boolean;
  showInstruction: boolean;
  showImage: boolean;
  showPedagogicalNote: boolean;
  showMascot: boolean;
  showFooter: boolean; // Branding footer
  
  // Typography Settings
  contentAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  
  // Smart Features
  smartPagination: boolean; // Automatically split long content
}

export type View = 'generator' | 'savedList' | 'profile' | 'admin' | 'messages' | 'shared' | 'assessment' | 'favorites' | 'workbook';

export interface GeneratorOptions {
    mode: 'ai' | 'fast' | 'manual';
    difficulty: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
    worksheetCount: number;
    itemCount: number;
    
    // Detailed Configs
    gridSize?: number; // 3 to 20
    operationType?: 'add' | 'sub' | 'mult' | 'div' | 'mixed' | 'addsub' | 'multdiv';
    selectedOperations?: string[]; // Multiple selection
    numberRange?: string; // "1-10", "1-20", "1-100", "100-1000"
    allowCarry?: boolean; // Eldeli toplama
    allowBorrow?: boolean; // Onluk bozma
    allowRemainder?: boolean; // Kalanlı bölme
    useThirdNumber?: boolean; // 3 sayı toplama
    num1Digits?: number; // Basamak sayısı
    num2Digits?: number;
    
    wordLength?: { min: number, max: number };
    case?: 'upper' | 'lower'; // Harf büyüklüğü
    directions?: 'simple' | 'diagonal' | 'all'; // Word search directions
    
    topic?: string;
    customInput?: string | string[];
    [key: string]: any;
}

export interface Activity {
  id: ActivityType;
  title: string;
  description: string;
  icon: string;
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

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    createdAt: string;
    lastLogin: string;
    worksheetCount: number;
    status: UserStatus;
    subscriptionPlan: SubscriptionPlan;
    favorites?: ActivityType[];
    lastActiveActivity?: {
        id: string;
        title: string;
        date: string;
    };
}

export type FeedbackCategory = 'general' | 'bug' | 'feature' | 'content';
export type FeedbackStatus = 'new' | 'read' | 'in-progress' | 'resolved' | 'archived';

export interface FeedbackItem {
    id: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    activityType: string | null;
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

// Updated Test Categories for Multiple Intelligences
export type TestCategory = 
    | 'linguistic'        // Sözel-Dilsel
    | 'logical'           // Mantıksal-Matematiksel
    | 'spatial'           // Görsel-Uzamsal
    | 'musical'           // Müziksel-Ritmik
    | 'kinesthetic'       // Bedensel-Kinestetik
    | 'naturalistic'      // Doğacı
    | 'interpersonal'     // Sosyal (Kişilerarası)
    | 'intrapersonal'     // İçsel (Öze dönük)
    | 'attention';        // Dikkat (Genel)

export interface TestResult {
    id: TestCategory;
    name: string;
    score: number;
    total: number;
    accuracy: number;
    duration: number;
    timestamp: number;
}

export interface AssessmentProfile {
    studentName: string;
    gender: 'Kız' | 'Erkek';
    age: number;
    grade: string;
    observations: string[];
    testResults: Record<string, TestResult>; 
}

export interface AssessmentReport {
    overallSummary: string;
    scores: Record<string, number>; // Generic key access for dynamic scores
    chartData?: { label: string; value: number; fullMark: number }[];
    analysis: {
        strengths: string[];
        weaknesses: string[];
        errorAnalysis?: string[]; 
    };
    roadmap: {
        activityId: string;
        reason: string;
        frequency: string;
    }[];
}

export interface SavedAssessment {
    id: string;
    userId: string;
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

export interface SavedWorksheet {
    id: string;
    userId: string;
    name: string;
    activityType: ActivityType;
    worksheetData: any; 
    createdAt: string;
    icon: string;
    category: { id: string; title: string };
    sharedBy?: string;
    sharedByName?: string;
    sharedWith?: string;
    styleSettings?: StyleSettings;
    studentProfile?: StudentProfile;
    // Workbook specific fields
    workbookItems?: CollectionItem[];
    workbookSettings?: WorkbookSettings;
    watermarkOpacity?: number; // Added
}

export interface BaseActivityData {
    title: string;
    instruction?: string;
    pedagogicalNote?: string;
    prompt?: string;
    imagePrompt?: string;
    imageBase64?: string;
}

export type ShapeType = 'circle' | 'square' | 'triangle' | 'hexagon' | 'star' | 'diamond' | 'pentagon' | 'octagon' | 'cube' | 'sphere' | 'pyramid' | 'cone' | 'heart' | 'cloud' | 'moon';

// --- NEW TYPES FOR WORKBOOK ---
export interface CollectionItem {
    id: string;
    activityType: ActivityType;
    data: any; 
    settings: StyleSettings;
    title: string;
}

export interface WorkbookSettings {
    title: string;
    studentName: string;
    schoolName: string;
    year: string;
    teacherNote: string;
    
    // Updated Professional Settings
    theme: 'modern' | 'classic' | 'fun' | 'minimal' | 'academic' | 'artistic' | 'space' | 'nature' | 'geometric';
    accentColor: string; 
    logoUrl?: string; 
    coverStyle: 'centered' | 'left' | 'split';
    
    // Visibility
    showTOC: boolean; 
    showPageNumbers: boolean;
    showWatermark: boolean;
    watermarkOpacity: number; 
    showBackCover: boolean; // New
}

// --- OVERLAY ITEMS (EDITOR) ---
export interface OverlayItem {
    id: string;
    type: 'text' | 'image' | 'sticker';
    content: string; // Text content or Image URL/Base64
    x: number;
    y: number;
    pageIndex: number;
    style?: React.CSSProperties; // Color, Size, etc.
}

export type SingleWorksheetData = BaseActivityData & Record<string, any>;
export type WorksheetData = SingleWorksheetData[];

export interface HistoryItem {
    id: string;
    userId: string;
    activityType: ActivityType;
    data: WorksheetData;
    timestamp: string;
    title: string;
    category: { id: string; title: string };
}
