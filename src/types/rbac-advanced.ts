/**
 * BDMIND — Gelişmiş Yetkilendirme (RBAC) Sistemi
 * 
 * Modül bazlı detaylı yetki yönetimi.
 * Etkinlik kategorileri ve bireysel etkinlikler üzerinde granüler kontrol.
 * Tamamı Türkçe, eğitim odaklı yetkilendirme matrisi.
 */

import { UserRole } from '../types/user';
import { ActivityType } from '../types/activity';
import { ACTIVITY_CATEGORIES } from '../constants';

// ─── Yetki Eylemleri ─────────────────────────────────────────────

export type PermissionAction = 
  | 'view'       // Görebilir
  | 'create'     // Oluşturabilir
  | 'edit'       // Düzenleyebilir
  | 'delete'     // Silebilir
  | 'manage'     // Tam yetki (Yönetici)
  | 'approve'    // Onaylayabilir
  | 'export'     // Dışa aktarabilir/Yazdırabilir
  | 'assign';    // Öğrenciye atayabilir

export type PermissionModule =
  | 'activity-studio'
  | 'reading-studio'
  | 'math-studio'
  | 'sinav-studyosu'
  | 'mat-sinav-studyosu'
  | 'super-turkce'
  | 'screening'
  | 'curriculum'
  | 'evaluation'
  | 'super-studio'
  | 'infographic-studio'
  | 'sari-kitap'
  | 'kelime-cumle'
  | 'students'
  | 'workbook'
  | 'messaging'
  | 'analytics'
  | 'planning'
  | 'reports'
  | 'settings'
  | 'bep'
  | 'favorites'
  | 'archive'
  | 'shared-materials'
  | 'activity-history'
  | 'admin'
  | 'profile-management'
  | 'appearance-settings'
  | 'platform-market'
  | 'premium-support'
  | 'about-us'
  | 'developer-tools';

export const MODULE_LABELS: Record<PermissionModule, string> = {
  'activity-studio': 'Etkinlik Havuzu',
  'reading-studio': 'Okuma Stüdyosu',
  'math-studio': 'Matematik Stüdyosu',
  'sinav-studyosu': 'Sınav Stüdyosu',
  'mat-sinav-studyosu': 'Matematik Sınav Stüdyosu',
  'super-turkce': 'Süper Türkçe Stüdyosu',
  'screening': 'Tarama & Analiz',
  'curriculum': 'Plan & Müfredat',
  'evaluation': 'Değerlendirme',
  'super-studio': 'Ultra Etkinlik Stüdyosu',
  'infographic-studio': 'İnfografik Stüdyosu',
  'sari-kitap': 'Hızlı Okuma Stüdyosu',
  'kelime-cumle': 'Kelime-Cümle Stüdyosu',
  'students': 'Öğrenciler',
  'workbook': 'Çalışma Kitapçığı',
  'messaging': 'Mesajlar',
  'favorites': 'Favori Etkinliklerim',
  'archive': 'Dijital Arşiv',
  'shared-materials': 'Paylaşılan Materyaller',
  'activity-history': 'İşlem Geçmişi',
  'admin': 'Yönetim Paneli',
  'profile-management': 'Profil Ayarları',
  'appearance-settings': 'Görünüm Ayarları',
  'platform-market': 'Platform Pazarı',
  'premium-support': 'Premium Yardım',
  'about-us': 'Hakkımızda',
  'developer-tools': 'Geliştirici / API',
  'analytics': 'Analitik ve Takip',
  'planning': 'Akademik Planlama',
  'reports': 'Raporlar ve Çıktılar',
  'settings': 'Sistem Ayarları',
  'bep': 'BEP Yönetimi'
};

// ─── Modül Kategorileri (RBAC IDE gruplama) ────────────────────────

export const MODULE_CATEGORIES: { id: string; label: string; modules: PermissionModule[] }[] = [
  {
    id: 'central-studios',
    label: 'Merkezi & Alan Stüdyoları',
    modules: ['activity-studio', 'reading-studio', 'math-studio', 'sinav-studyosu', 'mat-sinav-studyosu', 'super-turkce']
  },
  {
    id: 'assessment-studios',
    label: 'Değerlendirme & Plan Stüdyoları',
    modules: ['screening', 'curriculum', 'evaluation']
  },
  {
    id: 'creative-studios',
    label: 'Yaratıcı Atölye Stüdyoları',
    modules: ['super-studio', 'infographic-studio', 'sari-kitap', 'kelime-cumle']
  },
  {
    id: 'tools-portals',
    label: 'Araçlar ve Portallar',
    modules: ['students', 'workbook', 'messaging', 'favorites', 'archive', 'shared-materials', 'activity-history', 'analytics', 'planning', 'reports', 'settings', 'bep']
  },
  {
    id: 'admin-platform',
    label: 'Yönetim ve Platform Özellikleri',
    modules: ['admin', 'profile-management', 'appearance-settings', 'platform-market', 'premium-support', 'about-us', 'developer-tools']
  }
];

export const ALL_MODULES: PermissionModule[] = MODULE_CATEGORIES.flatMap(c => c.modules);

// ─── Kategori Yetkileri ──────────────────────────────────────────

export interface CategoryPermission {
  categoryId: string;
  categoryTitle: string;
  enabled: boolean;
  allowedRoles: UserRole[];
  activityOverrides?: ActivityPermission[];
}

export interface ActivityPermission {
  activityType: ActivityType;
  enabled: boolean;
  allowedRoles: UserRole[];
}

// ─── Modül Yetkileri ────────────────────────────────────────────

export interface ModulePermission {
  module: PermissionModule;
  enabled: boolean;
  actions: PermissionAction[];
  categoryPermissions?: CategoryPermission[];
  customSettings?: {
    aiGenerationEnabled?: boolean;
    allowExport?: boolean;
    requireApproval?: boolean;
  };
}

// ─── Rol Yetkileri ─────────────────────────────────────────────

export interface RolePermissions {
  role: UserRole;
  modules: ModulePermission[];
  globalSettings?: {
    canAccessAdmin?: boolean;
    canManageUsers?: boolean;
    canViewAnalytics?: boolean;
    canExportData?: boolean;
    maxDailyGenerations?: number;
  };
}

// ─── RBAC Ayarları ────────────────────────────────────────────────

export interface RBACSettings {
  roles: RolePermissions[];
  globalSettings: {
    maintenanceMode: boolean;
    aiGenerationEnabled: boolean;
    registrationEnabled: boolean;
    enforceCategoryPermissions: boolean;
    enforceActivityPermissions: boolean;
    auditLoggingEnabled: boolean;
  };
}

// ─── Varsayılan RBAC Konfigürasyonu ───────────────────────────────────

export const buildDefaultRBAC = (): RBACSettings => {
  const centralStudios: PermissionModule[] = [
    'activity-studio', 'reading-studio', 'math-studio',
    'sinav-studyosu', 'mat-sinav-studyosu', 'super-turkce'
  ];

  const assessmentStudios: PermissionModule[] = [
    'screening', 'curriculum', 'evaluation'
  ];

  const creativeStudios: PermissionModule[] = [
    'super-studio', 'infographic-studio', 'sari-kitap', 'kelime-cumle'
  ];

  const toolsPortals: PermissionModule[] = [
    'students', 'workbook', 'messaging',
    'favorites', 'archive', 'shared-materials', 'activity-history'
  ];

  const adminPlatform: PermissionModule[] = [
    'admin', 'profile-management', 'appearance-settings',
    'platform-market', 'premium-support', 'about-us', 'developer-tools'
  ];

  const allTeacherModules: PermissionModule[] = [
    ...centralStudios, ...assessmentStudios, ...creativeStudios, ...toolsPortals
  ];

  const fullActions: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'assign'];
  const adminActions: PermissionAction[] = ['view', 'create', 'edit', 'manage', 'export', 'assign'];
  const teacherActions: PermissionAction[] = ['view', 'create', 'edit', 'export', 'assign'];
  const adminOnlyActions: PermissionAction[] = ['view', 'create', 'edit', 'delete', 'manage'];

  const buildModulePerm = (mod: PermissionModule, actions: PermissionAction[], includeCategories = false): ModulePermission => ({
    module: mod,
    enabled: true,
    actions,
    categoryPermissions: includeCategories && mod === 'activity-studio'
      ? ACTIVITY_CATEGORIES.map(cat => ({
          categoryId: cat.id,
          categoryTitle: cat.title,
          enabled: true,
          allowedRoles: ['superadmin', 'admin', 'teacher'] as UserRole[]
        }))
      : undefined
  });

  return {
    roles: [
      {
        role: 'superadmin',
        modules: [
          ...allTeacherModules.map(m => buildModulePerm(m, fullActions, true)),
          ...adminPlatform.map(m => buildModulePerm(m, adminOnlyActions))
        ],
        globalSettings: {
          canAccessAdmin: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canExportData: true,
          maxDailyGenerations: -1
        }
      },
      {
        role: 'admin',
        modules: [
          ...allTeacherModules.map(m => buildModulePerm(m, adminActions, true)),
          ...adminPlatform.map(m => buildModulePerm(m, ['view', 'edit'] as PermissionAction[]))
        ],
        globalSettings: {
          canAccessAdmin: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canExportData: true,
          maxDailyGenerations: 1000
        }
      },
      {
        role: 'teacher',
        modules: allTeacherModules.map(m => buildModulePerm(m, teacherActions, true)),
        globalSettings: {
          canAccessAdmin: false,
          canManageUsers: false,
          canViewAnalytics: true,
          canExportData: true,
          maxDailyGenerations: 200
        }
      }
    ],
    globalSettings: {
      maintenanceMode: false,
      aiGenerationEnabled: true,
      registrationEnabled: true,
      enforceCategoryPermissions: true,
      enforceActivityPermissions: true,
      auditLoggingEnabled: true
    }
  };
};

export const defaultRBACSettings = buildDefaultRBAC();
