export type ExamQuestionType = 'multiple-choice' | 'true-false' | 'fill-in-blanks' | 'open-ended';

export type BloomLevel = 'Bilgi' | 'Kavrama' | 'Uygulama' | 'Analiz' | 'Değerlendirme' | 'Sentez';

export interface BaseExamQuestion {
  id: string;
  type: ExamQuestionType;
  questionText: string;
  bloomLevel: BloomLevel;
  realLifeConnection: string;
  solutionKey: string;
}

export interface MultipleChoiceQuestion extends BaseExamQuestion {
  type: 'multiple-choice';
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
}

export interface TrueFalseQuestion extends BaseExamQuestion {
  type: 'true-false';
  isTrue: boolean;
}

export interface FillInBlanksQuestion extends BaseExamQuestion {
  type: 'fill-in-blanks';
  blankedText: string;
  correctWords: string[];
}

export interface OpenEndedQuestion extends BaseExamQuestion {
  type: 'open-ended';
  expectedKeywords: string[];
}

export type ExamQuestion =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillInBlanksQuestion
  | OpenEndedQuestion;

export interface ExamLayoutConfig {
  grid: {
    cols: number;
    gap: number;
    padding: number;
    borderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
  };
  visibility: {
    showTitle: boolean;
    showUnit: boolean;
    showStudentName: boolean;
    showObjective: boolean;
    showDate: boolean;
  };
}

export interface ExamActivityData {
  title: string;
  pedagogicalNote: string;
  questions: ExamQuestion[];
  layoutConfig?: ExamLayoutConfig;
}
