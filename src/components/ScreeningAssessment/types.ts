import type { ScreeningResult, EvaluationCategory, ScreeningProfile } from '../../types/screening';

export type ScreeningView =
  | 'dashboard'
  | 'new-screening'
  | 'history'
  | 'analytics'
  | 'assessment'
  | 'cognitive-battery'
  | 'result-detail';

export type ScreeningFilterStatus = 'all' | 'completed' | 'pending' | 'archived';
export type ScreeningFilterRiskLevel = 'all' | 'high' | 'medium' | 'low';
export type ScreeningSortBy = 'newest' | 'oldest' | 'score_desc' | 'score_asc';

export type ScreeningType = 'cognitive' | 'developmental';

export interface ScreeningAnalytics {
  totalScreenings: number;
  riskDistribution: Record<string, number>;
  averageScores: Record<string, number>;
  trends: {
    monthly: Array<{ month: string; count: number; avgScore: number }>;
    riskLevels: Array<{ date: string; levels: Record<string, number> }>;
  };
  categoryAverages: Record<EvaluationCategory, number>;
}

export interface ScreeningState {
  activeView: ScreeningView;
  screeningData: ScreeningResult[];
  currentScreening: ScreeningResult | null;
  selectedStudents: string[];
  searchQuery: string;
  filterStatus: ScreeningFilterStatus;
  filterRiskLevel: ScreeningFilterRiskLevel;
  sortBy: ScreeningSortBy;
  selectedScreeningType: ScreeningType;
  selectedStudentName: string;
  selectedStudentId: string | null;
  selectedStudentAge: number;
  selectedStudentGrade: string;
  selectedStudentConcerns: string[];
  selectedStudentStrengths: string[];
  selectedStudentDiagnosis: string[];
  isAdvancedScreeningOpen: boolean;
  isSaving: boolean;
  isLoading: boolean;
}

export interface ScreeningActions {
  setActiveView: (view: ScreeningView) => void;
  setScreeningData: (data: ScreeningResult[]) => void;
  setCurrentScreening: (screening: ScreeningResult | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: ScreeningFilterStatus) => void;
  setFilterRiskLevel: (level: ScreeningFilterRiskLevel) => void;
  setSortBy: (sort: ScreeningSortBy) => void;
  setSelectedScreeningType: (type: ScreeningType) => void;
  setSelectedStudentName: (name: string) => void;
  setSelectedStudentId: (id: string | null) => void;
  setSelectedStudentAge: (age: number) => void;
  setSelectedStudentGrade: (grade: string) => void;
  setSelectedStudentConcerns: (concerns: string[]) => void;
  setSelectedStudentStrengths: (strengths: string[]) => void;
  setSelectedStudentDiagnosis: (diagnosis: string[]) => void;
  setSelectedStudents: (students: string[]) => void;
  setIsSaving: (saving: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setIsAdvancedScreeningOpen: (open: boolean) => void;
  archiveScreening: (id: string) => void;
  deleteScreening: (id: string) => void;
  resetScreening: () => void;
}

export type { ScreeningResult, EvaluationCategory, ScreeningProfile };
