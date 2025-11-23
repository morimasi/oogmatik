
export enum ActivityType {
  WORD_SEARCH = 'WORD_SEARCH',
  ANAGRAM = 'ANAGRAM',
  CROSSWORD = 'CROSSWORD',
  SPELLING_CHECK = 'SPELLING_CHECK',
  
  BASIC_OPERATIONS = 'BASIC_OPERATIONS',
  REAL_LIFE_MATH_PROBLEMS = 'REAL_LIFE_MATH_PROBLEMS',
  MATH_PUZZLE = 'MATH_PUZZLE',
  NUMBER_PATTERN = 'NUMBER_PATTERN',
  NUMBER_PYRAMID = 'NUMBER_PYRAMID',
  SHAPE_SUDOKU = 'SHAPE_SUDOKU',
  FUTOSHIKI = 'FUTOSHIKI',
  LOGIC_GRID_PUZZLE = 'LOGIC_GRID_PUZZLE',

  FIND_THE_DIFFERENCE = 'FIND_THE_DIFFERENCE',
  BURDON_TEST = 'BURDON_TEST',
  VISUAL_MEMORY = 'VISUAL_MEMORY',
  STROOP_TEST = 'STROOP_TEST',
  
  GRID_DRAWING = 'GRID_DRAWING',
  SYMMETRY_DRAWING = 'SYMMETRY_DRAWING',
  SHAPE_MATCHING = 'SHAPE_MATCHING',
  ABC_CONNECT = 'ABC_CONNECT',
  BLOCK_PAINTING = 'BLOCK_PAINTING',
  VISUAL_ODD_ONE_OUT = 'VISUAL_ODD_ONE_OUT',
  SHAPE_COUNTING = 'SHAPE_COUNTING',

  STORY_COMPREHENSION = 'STORY_COMPREHENSION',
  STORY_CREATION_PROMPT = 'STORY_CREATION_PROMPT',
  STORY_SEQUENCING = 'STORY_SEQUENCING',
  STORY_ANALYSIS = 'STORY_ANALYSIS',

  READING_FLOW = 'READING_FLOW',
  LETTER_DISCRIMINATION = 'LETTER_DISCRIMINATION',
  RAPID_NAMING = 'RAPID_NAMING',
  MIRROR_LETTERS = 'MIRROR_LETTERS',
  PHONOLOGICAL_AWARENESS = 'PHONOLOGICAL_AWARENESS',
  SYLLABLE_TRAIN = 'SYLLABLE_TRAIN',
  VISUAL_TRACKING_LINES = 'VISUAL_TRACKING_LINES'
}

export type AppTheme = 'light' | 'dark' | 'contrast' | 'pastel' | 'sepia' | 'purple' | 'orange' | 'maroon';

export interface StyleSettings {
  fontSize: number;
  borderColor: string;
  borderWidth: number;
  margin: number;
  columns: number;
  gap: number;
  showPedagogicalNote: boolean;
}

export type View = 'generator' | 'savedList' | 'profile' | 'admin' | 'messages' | 'shared' | 'assessment';

export interface GeneratorOptions {
    mode: 'ai' | 'fast';
    difficulty: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
    worksheetCount: number;
    timestamp?: number;
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
}

export interface FeedbackItem {
    id: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    activityType: string | null;
    activityTitle?: string;
    rating: number;
    message: string;
    timestamp: string;
    status: 'new' | 'read' | 'archived' | 'replied';
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

export type TestCategory = 'reading' | 'math' | 'attention' | 'visual' | 'cognitive';

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
    scores: {
        reading: number;
        writing: number;
        math: number;
        attention: number;
        cognitive: number;
    };
    chartData?: { label: string; value: number; fullMark: number }[];
    analysis: {
        strengths: string[];
        weaknesses: string[];
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
}

export interface BaseActivityData {
    title: string;
    instruction?: string;
    pedagogicalNote?: string;
    imagePrompt?: string;
    imageBase64?: string;
}

// --- DYSLEXIA SUPPORT TYPES ---
export interface ReadingFlowData extends BaseActivityData {
    prompt: string;
    text: {
        paragraphs: {
            sentences: {
                syllables: { text: string; color: string }[];
            }[];
        }[];
    };
}

export interface LetterDiscriminationData extends BaseActivityData {
    prompt: string;
    targetLetters: string[];
    rows: {
        letters: string[];
        targetCount: number;
    }[];
}

export interface RapidNamingData extends BaseActivityData {
    prompt: string;
    grid: {
        items: { type: 'color' | 'icon' | 'number' | 'letter'; value: string; label: string }[];
    };
    type: 'color' | 'object' | 'number' | 'letter';
}

export interface PhonologicalAwarenessData extends BaseActivityData {
    prompt: string;
    exercises: {
        type: 'syllable-counting' | 'rhyming';
        question: string;
        word: string;
        imagePrompt?: string;
        imageBase64?: string;
        options: number[] | string[];
        answer: number | string;
    }[];
}

export interface MirrorLettersData extends BaseActivityData {
    targetPair: string;
    rows: {
        items: { letter: string; isMirrored: boolean; rotation: number }[];
    }[];
}

export interface SyllableTrainData extends BaseActivityData {
    trains: {
        word: string;
        syllables: string[];
        imagePrompt?: string;
        imageBase64?: string;
    }[];
}

export interface VisualTrackingLineData extends BaseActivityData {
    paths: {
        id: number;
        color: string;
        d: string;
        startLabel: string;
        endLabel: string;
        startImage?: string;
        endImage?: string;
    }[];
    width: number;
    height: number;
}

// --- WORD GAMES ---
export interface WordSearchData extends BaseActivityData { grid: string[][]; words: string[]; hiddenMessage?: string; followUpQuestion?: string; writingPrompt?: string; }
export interface AnagramItem { word: string; scrambled: string; imageBase64?: string; }
export interface AnagramsData extends BaseActivityData { prompt: string; anagrams: AnagramItem[]; sentencePrompt: string; }
export interface CrosswordClue { id: number; direction: 'across' | 'down'; text: string; start: { row: number; col: number }; word: string; imageBase64?: string; }
export interface CrosswordData extends BaseActivityData { prompt: string; theme: string; grid: (string | null)[][]; clues: CrosswordClue[]; passwordCells: { row: number; col: number; }[]; passwordLength: number; passwordPrompt: string; }
export interface SpellingCheckItem { correct: string; options: string[]; imagePrompt?: string; imageBase64?: string; }
export interface SpellingCheckData extends BaseActivityData { checks: SpellingCheckItem[]; }

// --- MATH & LOGIC ---
export interface BasicOperationsData extends BaseActivityData {
    operations: {
        num1: number;
        num2: number;
        num3?: number; 
        operator: '+' | '-' | 'x' | '÷';
        answer: number;
        remainder?: number; 
    }[];
    isVertical: boolean;
}
export interface RealLifeProblemData extends BaseActivityData {
    problems: {
        text: string;
        imagePrompt?: string;
        imageBase64?: string;
        solution?: string;
        operationHint?: string; 
    }[];
}
export interface MathPuzzleObject { name: string; imagePrompt?: string; imageBase64?: string; }
export interface MathPuzzleItem { problem: string; question: string; answer: string; objects?: MathPuzzleObject[]; }
export interface MathPuzzleData extends BaseActivityData { puzzles: MathPuzzleItem[]; }
export interface NumberPatternData extends BaseActivityData { patterns: { sequence: string; answer: string; }[]; }
export interface NumberPyramidData extends BaseActivityData { prompt: string; pyramids: { title: string; rows: (number | null)[][]; }[]; }
export interface ShapeSudokuData extends BaseActivityData { prompt: string; puzzles: { grid: (string | null)[][]; shapesToUse: { shape: string; label: string; }[]; }[]; }
export interface FutoshikiData extends BaseActivityData { prompt: string; puzzles: { size: number; numbers: (number | null)[][]; units?: (string | null)[][]; constraints: { row1: number; col1: number; row2: number; col2: number; symbol: '>' | '<'; }[]; }[]; }
export interface LogicGridPuzzleData extends BaseActivityData { prompt: string; clues: string[]; people: string[]; categories: { title: string; items: { name: string; imageDescription: string; imagePrompt?: string; imageBase64?: string; }[]; }[]; }

// --- ATTENTION & MEMORY ---
export interface FindTheDifferenceData extends BaseActivityData {
  rows: {
    items: string[];
    correctIndex: number;
    visualDistractionLevel: 'low' | 'medium' | 'high'; 
  }[];
}
export interface LetterGridTestData extends BaseActivityData { grid: string[][]; targetLetters: string[]; }
export interface VisualMemoryItem { description: string; imagePrompt?: string; imageBase64?: string; }
export interface VisualMemoryData extends BaseActivityData { memorizeTitle: string; testTitle: string; itemsToMemorize: VisualMemoryItem[]; testItems: VisualMemoryItem[]; }
export interface StroopTestData extends BaseActivityData { items: { text: string; color: string; }[]; }

// --- VISUAL PERCEPTION ---
export interface GridDrawingData extends BaseActivityData {
    gridDim: number;
    drawings: {
        lines: [number, number][][]; 
        complexityLevel: string; 
    }[];
}
export interface SymmetryDrawingData extends BaseActivityData {
    gridDim: number;
    dots: { x: number; y: number; color?: string }[];
    lines?: { x1: number; y1: number; x2: number; y2: number }[];
    axis: 'vertical' | 'horizontal';
    isMirrorImage: boolean; 
}
export type ShapeType = 'circle' | 'square' | 'triangle' | 'hexagon' | 'star' | 'diamond' | 'pentagon' | 'octagon' | 'cube' | 'sphere' | 'pyramid' | 'cone' | 'heart' | 'cloud' | 'moon';
export interface ShapeMatchingData extends BaseActivityData {
    leftColumn: { id: number | string; shapes: ShapeType[]; color?: string }[];
    rightColumn: { id: string; shapes: ShapeType[]; color?: string }[];
    complexity: number; 
}
export interface AbcConnectData extends BaseActivityData {
    puzzles: {
        id: number;
        gridDim: number;
        points: {
            label: string;
            x: number;
            y: number;
            color?: string;
        }[];
        paths?: { x: number; y: number }[][]; 
    }[];
}
export interface BlockPaintingData extends BaseActivityData {
    grid: { rows: number; cols: number };
    targetPattern: number[][]; 
    shapes: {
        id: number;
        color: string; 
        pattern: number[][]; 
        count: number; 
    }[];
}
export interface VisualOddOneOutData extends BaseActivityData {
    rows: {
        items: {
            segments: boolean[]; 
            rotation?: number;
        }[];
        correctIndex: number;
        reason: string; 
    }[];
}
export interface ShapeCountingData extends BaseActivityData {
    figures: {
        svgPaths: { d: string; fill: string; stroke?: string }[];
        targetShape: string | 'triangle';
        correctCount: number;
    }[];
}

// --- READING ---
export interface MultipleChoiceStoryQuestion { type: 'multiple-choice'; question: string; options: string[]; answerIndex: number; }
export interface OpenEndedStoryQuestion { type: 'open-ended'; question: string; }
export type StoryQuestion = MultipleChoiceStoryQuestion | OpenEndedStoryQuestion;
export interface StoryData extends BaseActivityData { story: string; imageBase64?: string; mainIdea: string; characters: string[]; setting: string; questions: StoryQuestion[]; }
export interface StoryCreationPromptData extends BaseActivityData { prompt: string; keywords: string[]; imageBase64?: string; }
export interface StorySequencingData extends BaseActivityData { prompt: string; panels: { id: string; description: string; imageBase64?: string; }[]; }
export interface StoryAnalysisData extends BaseActivityData { story: string; imageBase64?: string; analysisQuestions: { type: 'tema' | 'karakter' | 'sebep-sonuç' | 'çıkarım'; question: string; }[]; }


export type SingleWorksheetData = 
  | WordSearchData
  | AnagramsData
  | CrosswordData
  | SpellingCheckData
  | BasicOperationsData
  | RealLifeProblemData
  | MathPuzzleData
  | NumberPatternData
  | NumberPyramidData
  | ShapeSudokuData
  | FutoshikiData
  | LogicGridPuzzleData
  | FindTheDifferenceData
  | LetterGridTestData
  | VisualMemoryData
  | StroopTestData
  | GridDrawingData
  | SymmetryDrawingData
  | ShapeMatchingData
  | AbcConnectData
  | BlockPaintingData
  | VisualOddOneOutData
  | ShapeCountingData
  | StoryData
  | StoryCreationPromptData
  | StorySequencingData
  | StoryAnalysisData
  | ReadingFlowData
  | LetterDiscriminationData
  | RapidNamingData
  | MirrorLettersData
  | PhonologicalAwarenessData
  | SyllableTrainData
  | VisualTrackingLineData;

export type WorksheetData = SingleWorksheetData[] | null;

export interface SavedWorksheet {
  id: string;
  userId: string;
  name: string;
  activityType: ActivityType;
  worksheetData: SingleWorksheetData[];
  createdAt: string;
  icon: string;
  category: {
    id: string;
    title: string;
  };
  sharedBy?: string;
  sharedByName?: string;
  sharedWith?: string;
}

export interface HistoryItem {
  id: string;
  userId: string;
  activityType: ActivityType;
  data: SingleWorksheetData[];
  timestamp: string;
  title: string;
  category: {
      id: string;
      title: string;
  };
}
