
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
    data: any;
    updatedAt: string;
    note?: string;
}

export interface StaticContentItem {
    id: string;
    title: string;
    type: 'list' | 'json';
    data: any;
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
}

// ─── New Admin Types for FAZA 5 ────────────────────────────────────────────

export type UserRoleType = 'admin' | 'teacher' | 'student' | 'parent' | 'guest';

export type PermissionKey =
  | 'users.view' | 'users.create' | 'users.edit' | 'users.delete'
  | 'worksheets.view' | 'worksheets.create' | 'worksheets.edit' | 'worksheets.delete' | 'worksheets.export'
  | 'analytics.view' | 'analytics.export'
  | 'admin.access' | 'admin.settings' | 'admin.audit'
  | 'cloud.upload' | 'cloud.sync' | 'batch.export';

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  'users.view': 'Kullanıcıları Görüntüle',
  'users.create': 'Kullanıcı Oluştur',
  'users.edit': 'Kullanıcı Düzenle',
  'users.delete': 'Kullanıcı Sil',
  'worksheets.view': 'Çalışmaları Görüntüle',
  'worksheets.create': 'Çalışma Oluştur',
  'worksheets.edit': 'Çalışma Düzenle',
  'worksheets.delete': 'Çalışma Sil',
  'worksheets.export': 'Çalışma Dışa Aktar',
  'analytics.view': 'Analitikleri Görüntüle',
  'analytics.export': 'Analitikleri Dışa Aktar',
  'admin.access': 'Admin Paneline Eriş',
  'admin.settings': 'Admin Ayarları',
  'admin.audit': 'Denetim Günlüğü',
  'cloud.upload': 'Buluta Yükle',
  'cloud.sync': 'Bulut Senkronizasyon',
  'batch.export': 'Toplu Dışa Aktar',
};

export interface UserRoleDefinition {
  id: string;
  name: UserRoleType;
  label: string;
  description: string;
  permissions: PermissionKey[];
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalWorksheets: number;
  exportsToday: number;
  exportsThisWeek: number;
  storageUsedMb: number;
  systemUptime: number;
  errorRatePercent: number;
  avgResponseMs: number;
  activeSessionsCount: number;
}

export interface AdminStatTrend {
  date: string;
  value: number;
}

export type AuditAction =
  | 'user.created' | 'user.updated' | 'user.deleted' | 'user.login' | 'user.logout' | 'user.role_changed'
  | 'worksheet.created' | 'worksheet.updated' | 'worksheet.deleted' | 'worksheet.exported'
  | 'permission.granted' | 'permission.revoked'
  | 'system.settings_changed' | 'system.backup'
  | 'cloud.sync' | 'batch.export';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actorId: string;
  actorName: string;
  actorRole: UserRoleType;
  targetId?: string;
  targetType?: 'user' | 'worksheet' | 'permission' | 'system';
  targetLabel?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
  worksheetCount: number;
  exportCount: number;
  avatarUrl?: string;
}

export interface WorksheetAnalyticEntry {
  templateId: string;
  templateName: string;
  useCount: number;
  exportCount: number;
  avgSessionMinutes: number;
  popularityRank: number;
}

export interface ExportAnalyticEntry {
  date: string;
  format: string;
  count: number;
}

export type ServiceStatus = 'operational' | 'degraded' | 'down';

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  latencyMs?: number;
  lastCheckedAt: string;
  message?: string;
}

export interface SystemHealthReport {
  overall: ServiceStatus;
  services: ServiceHealth[];
  cpuUsagePercent: number;
  memUsagePercent: number;
  diskUsagePercent: number;
  generatedAt: string;
}
