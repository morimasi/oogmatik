/**
 * OOGMATIK — Gelişmiş Yetkilendirme (RBAC) Sistemi
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
  | 'ocr'
  | 'screening'
  | 'admin'
  | 'curriculum'
  | 'students'
  | 'reports'
  | 'creative-studio'
  | 'super-studio'
  | 'sari-kitap'
  | 'infographic-studio'
  | 'messaging'
  | 'workbook'
  | 'analytics'
  | 'evaluation'
  | 'planning'
  | 'bep'
  | 'kelime-cumle'
  | 'super-turkce'
  | 'archive'
  | 'settings';

export const MODULE_LABELS: Record<PermissionModule, string> = {
  'activity-studio': 'Etkinlik Stüdyosu',
  'reading-studio': 'Okuma Stüdyosu',
  'math-studio': 'Matematik Stüdyosu',
  'sinav-studyosu': 'Türkçe Sınav Stüdyosu',
  'mat-sinav-studyosu': 'Matematik Sınav Stüdyosu',
  'ocr': 'OCR Metin İşleme',
  'screening': 'Tarama & Analiz',
  'admin': 'Yönetim Paneli',
  'curriculum': 'Müfredat & Plan',
  'students': 'Öğrenci Yönetimi',
  'reports': 'Gelişim Raporları',
  'creative-studio': 'Yaratıcı Yazarlık',
  'super-studio': 'Süper Stüdyo',
  'sari-kitap': 'Hızlı Okuma Stüdyosu',
  'infographic-studio': 'İnfografik Stüdyosu',
  'messaging': 'Mesajlaşma Paneli',
  'workbook': 'Çalışma Kitapçığı',
  'analytics': 'Akademik Analitik',
  'evaluation': 'Ölçme & Değerlendirme',
  'planning': 'Eğitim Planlaması',
  'bep': 'BEP Modülü',
  'kelime-cumle': 'Kelime-Cümle Stüdyosu',
  'super-turkce': 'Süper Türkçe Stüdyosu',
  'archive': 'Dijital Arşiv',
  'settings': 'Sistem Ayarları'
};

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
  const commonStudios: PermissionModule[] = [
    'activity-studio', 'reading-studio', 'math-studio', 'sinav-studyosu', 
    'mat-sinav-studyosu', 'creative-studio', 'super-studio', 'sari-kitap', 
    'infographic-studio', 'kelime-cumle', 'super-turkce', 'archive'
  ];

  const commonTools: PermissionModule[] = [
    'screening', 'curriculum', 'students', 'reports', 'messaging', 
    'workbook', 'analytics', 'evaluation', 'planning', 'bep', 'ocr'
  ];

  const allTeacherModules = [...commonStudios, ...commonTools];

  return {
    roles: [
      {
        role: 'superadmin',
        modules: [
          { module: 'admin', enabled: true, actions: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'assign'] },
          ...allTeacherModules.map(m => ({
            module: m as PermissionModule,
            enabled: true,
            actions: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'assign'] as PermissionAction[],
            categoryPermissions: m === 'activity-studio' ? ACTIVITY_CATEGORIES.map(cat => ({
              categoryId: cat.id,
              categoryTitle: cat.title,
              enabled: true,
              allowedRoles: ['superadmin', 'admin', 'teacher'] as UserRole[]
            })) : undefined
          })),
          { module: 'settings', enabled: true, actions: ['view', 'manage', 'edit'] }
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
          { module: 'admin', enabled: true, actions: ['view', 'manage'] },
          ...allTeacherModules.map(m => ({
            module: m as PermissionModule,
            enabled: true,
            actions: ['view', 'create', 'edit', 'manage', 'export', 'assign'] as PermissionAction[]
          })),
          { module: 'settings', enabled: true, actions: ['view', 'edit'] }
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
        modules: allTeacherModules.map(m => ({
          module: m as PermissionModule,
          enabled: true,
          actions: ['view', 'create', 'edit', 'export', 'assign'] as PermissionAction[],
          categoryPermissions: m === 'activity-studio' ? ACTIVITY_CATEGORIES.map(cat => ({
            categoryId: cat.id,
            categoryTitle: cat.title,
            enabled: true,
            allowedRoles: ['superadmin', 'admin', 'teacher'] as UserRole[]
          })) : undefined
        })),
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
