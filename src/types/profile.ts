import { ActivityType, SavedWorksheet, User, AppTheme, UiSettings, SavedAssessment, Curriculum } from '../types';
import { PerformanceMetrics } from './student-advanced';

export interface ProfileViewProps {
  onBack: () => void;
  onSelectActivity: (id: ActivityType | null) => void;
  onLoadSaved: (ws: SavedWorksheet) => void;
  targetUser?: User;
  theme?: AppTheme;
  uiSettings?: UiSettings;
  onUpdateTheme?: (theme: AppTheme) => void;
  onUpdateUiSettings?: (settings: UiSettings) => void;
  onOpenSettingsModal?: () => void;
}

export interface ProfileData {
  user: User | null;
  isReadOnly: boolean;
  assessments: SavedAssessment[];
  worksheets: SavedWorksheet[];
  curriculums: Curriculum[];
  loading: boolean;
  stats: {
    totalStudents: number;
    totalMaterials: number;
    totalAssessments: number;
    totalPlans: number;
    avgScore: number;
    monthlyNewStudents: number;
    weeklyProduction: number;
    streak: number;
  };
  performanceTrends: PerformanceMetrics[] | null;
  refreshData: () => Promise<void>;
}