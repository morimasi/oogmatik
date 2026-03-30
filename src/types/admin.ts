import { ActivityType } from './activity';
import { UserRole, UserStatus } from './user';

export interface DynamicActivity {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  isActive: boolean;
  isPremium: boolean;
  promptId?: string;
  updatedAt: string;
  order: number;
  themeColor: string;
  secondaryColor?: string;
  targetSkills?: string[];
  curriculumNode?: string; // Müfredat ağacındaki yeri (örn: phonology.awareness.syllables)
  learningObjectives?: string[]; // Pedagojik hedefler
  // Üretim Motoru Ayarları
  engineConfig: {
    mode: 'ai_only' | 'hybrid' | 'logic_only';
    baseBlueprint?: string; // Creative Studio'dan gelen mimari DNA
    parameters: {
      allowDifficulty: boolean;
      allowDistraction: boolean;
      allowFontSize: boolean;
    };
  };
}

export interface AdminStatCard {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: string;
  color: string;
  chartData?: number[];
}

export interface PromptVersion {
  version: number;
  updatedAt: string;
  template: string;
  systemInstruction: string;
  changeLog: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  systemInstruction: string;
  template: string;
  variables: string[];
  tags: string[];
  updatedAt: string;
  version: number;
  history: PromptVersion[];
  modelConfig: {
    temperature: number;
    modelName: string;
    thinkingBudget: number;
  };
}

export interface PromptSnippet {
  id: string;
  label: string;
  value: string;
}

export interface ContentSnapshot {
  data: unknown;
  updatedAt: string;
  note?: string;
}

export interface StaticContentItem {
  id: string;
  title: string;
  type: 'list' | 'json';
  data: unknown;
  updatedAt: string;
  history?: ContentSnapshot[]; // Versiyon geçmişi
}

export interface UserFilter {
  search: string;
  role: 'all' | UserRole;
  status: 'all' | UserStatus;
  sortBy: 'newest' | 'oldest' | 'name' | 'activity';
}

export interface ActivityDraft {
  id: string;
  title: string;
  description: string;
  baseType: string;
  createdBy: string;
  createdAt: string;
  customInstructions: string;
  // OCR Activity Generation fields
  productionMode?: 'architecture_clone' | 'prompt_generation' | 'exact_clone';
  status?: 'draft' | 'pending_review' | 'approved' | 'rejected';
  version?: string;
  metadata?: {
    subject?: string;
    gradeLevel?: number;
    ageGroup?: string;
    difficulty?: string;
    estimatedDuration?: number;
    targetSkills?: string[];
    learningObjectives?: string[];
    pedagogicalNote?: string;
    curriculumCode?: string;
  };
  templateId?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  /** Klonlama/versiyonlama: üst etkinlik ID'si */
  parentId?: string;
  updatedAt?: string;
}

export type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'APPROVE' | 'REJECT' | 'OTHER'
  | 'user.created' | 'user.updated' | 'user.deleted' | 'user.login' | 'user.logout' | 'user.role_changed'
  | 'worksheet.created' | 'worksheet.updated' | 'worksheet.deleted' | 'worksheet.exported'
  | 'permission.granted' | 'permission.revoked'
  | 'system.settings_changed' | 'system.backup' | 'cloud.sync' | 'batch.export' | (string & {});

export interface UserRoleDefinition {
  id: string;
  name: string;
  permissions: PermissionKey[];
}
export type PermissionKey = string;
export const PERMISSION_LABELS: Record<string, string> = {};
export interface SystemHealthReport {
  status: 'healthy' | 'degraded' | 'down';
  services: ServiceHealth[];
  lastChecked: string;
  cpuUsagePercent?: number;
  memUsagePercent?: number;
  diskUsagePercent?: number;
}
export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  latency?: number;
  message?: string;
}
export type ServiceStatus = 'up' | 'down' | 'degraded' | 'operational';
export type UserRoleType = 'admin' | 'teacher' | 'student' | 'editor' | 'superadmin' | 'parent' | 'guest';
export interface ManagedUser {
  id: string;
  email: string;
  role: UserRoleType;
  status: 'active' | 'suspended' | 'pending';
  name: string;
  lastLogin?: string;
  createdAt?: string;
  worksheetCount?: number;
  exportCount?: number;
}
export interface WorksheetAnalyticEntry {
  id: string;
  date: string;
  count: number;
  type?: string;
  templateId?: string;
  templateName?: string;
  useCount?: number;
  exportCount?: number;
  avgSessionMinutes?: number;
  popularityRank?: number;
}
export interface ExportAnalyticEntry {
  id: string;
  date: string;
  count: number;
  format: string;
}
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalWorksheets: number;
  exportsToday: number;
  exportsThisWeek?: number;
  activeSessionsCount?: number;
  avgResponseMs?: number;
  errorRatePercent?: number;
}
export interface AdminStatTrend {
  label: string;
  value: number;
  trend: number;
  isPositive: boolean;
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  userId: string;
  details: string;
  createdAt: string;
  targetId?: string;
  targetType?: string;
  targetLabel?: string;
  ipAddress?: string;
  severity: 'info' | 'warning' | 'error';
}
