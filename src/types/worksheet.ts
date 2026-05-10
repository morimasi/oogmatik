import { GrafikVerisi, MatSoru } from './matSinav';

export type WidgetType = 'math_graphic' | 'reading_passage' | 'quiz_block' | 'text_block';

export interface BaseWidget {
  id: string;
  type: WidgetType;
  title?: string;
  width?: 'full' | 'half' | 'third';
}

export interface MathGraphicWidget extends BaseWidget {
  type: 'math_graphic';
  data: GrafikVerisi;
  question?: MatSoru; // Optional logic question attached to graphic
}

export interface ReadingPassageWidget extends BaseWidget {
  type: 'reading_passage';
  text: string;
  questions?: any[]; // For now
}

export interface QuizBlockWidget extends BaseWidget {
  type: 'quiz_block';
  questions: MatSoru[];
}

export type WorksheetWidget = MathGraphicWidget | ReadingPassageWidget | QuizBlockWidget;

export interface CompositeWorksheet {
  id: string;
  title: string;
  topic: string;
  targetSkills: string[];
  ageGroup: string;
  difficultyLevel: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  widgets: WorksheetWidget[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  pedagogicalNote?: string;
}