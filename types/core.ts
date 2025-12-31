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
    FIND_DIFFERENT_STRING = 'FIND_DIFFERENT_STRING'
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

