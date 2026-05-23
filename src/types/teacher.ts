import { User, UserRole, UserStatus } from './user';

export type TeacherActivityType = 'worksheet' | 'assessment' | 'plan' | 'report' | 'login' | 'export' | 'student_added';

export interface TeacherActivity {
  id: string;
  type: TeacherActivityType;
  title: string;
  details: string;
  createdAt: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export interface TeacherStudentSummary {
  id: string;
  name: string;
  grade: string;
  age: number;
  lastActivity: string;
  assessmentCount: number;
  avgScore: number;
  status: 'active' | 'inactive';
}

export interface TeacherAnalytics {
  totalWorksheets: number;
  totalAssessments: number;
  totalPlans: number;
  totalStudents: number;
  totalReports: number;
  avgStudentScore: number;
  activeStudents: number;
  lastActiveDate: string;
  dailyActivity: Array<{ date: string; count: number }>;
  activityByType: Record<TeacherActivityType, number>;
  monthlyTrend: Array<{ month: string; worksheets: number; assessments: number; plans: number }>;
}

export interface TeacherDetail {
  user: User;
  analytics: TeacherAnalytics;
  recentActivity: TeacherActivity[];
  students: TeacherStudentSummary[];
}

export interface TeacherListItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin: string;
  studentCount: number;
  worksheetCount: number;
  assessmentCount: number;
  planCount: number;
  reportCount: number;
  subscriptionPlan: 'free' | 'pro';
}
