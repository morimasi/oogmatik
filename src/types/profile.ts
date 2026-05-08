import { ActivityType, SavedWorksheet, User, AppTheme, UiSettings } from '../types';

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
  assessments: any[]; // TODO: Type properly
  worksheets: SavedWorksheet[];
  curriculums: any[]; // TODO: Type properly
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
  performanceTrends: any[] | null; // TODO: Type properly
  refreshData: () => Promise<void>;
}