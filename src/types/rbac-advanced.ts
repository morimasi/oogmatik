/**
 * OOGMATIK — Advanced RBAC (Role-Based Access Control) System
 * 
 * Premium module-level permission management
 * Granular control over all activity categories and individual activities
 * Ultra-customizable settings with visual matrix UI
 */

import { UserRole } from '../types/user';
import { ActivityType } from '../types/activity';
import { ACTIVITY_CATEGORIES } from '../constants';

// ─── Permission Types ─────────────────────────────────────────────

export type PermissionAction = 
  | 'view'       // Can see the module/activity
  | 'create'     // Can create new content
  | 'edit'       // Can edit existing content
  | 'delete'     // Can delete content
  | 'manage'     // Full control (admin)
  | 'approve'    // Can approve/reject content
  | 'export'     // Can export/print
  | 'assign';    // Can assign to students

export type PermissionModule = 
  | 'activity-studio'
  | 'reading-studio'
  | 'math-studio'
  | 'infographic-studio'
  | 'sinav-studyosu'
  | 'ocr'
  | 'screening'
  | 'admin'
  | 'curriculum'
  | 'students'
  | 'reports'
  | 'creative-studio'
  | 'super-studio'
  | 'sari-kitap';

// ─── Category Permission ──────────────────────────────────────────

export interface CategoryPermission {
  categoryId: string;
  categoryTitle: string;
  enabled: boolean;
  allowedRoles: UserRole[];
  activityOverrides?: ActivityPermission[];
  customSettings?: {
    requireApproval?: boolean;
    maxDailyUses?: number;
    timeRestrictions?: {
      startTime?: string;
      endTime?: string;
      allowedDays?: number[]; // 0-6 (Sun-Sat)
    };
    ageRestrictions?: {
      minAge?: number;
      maxAge?: number;
    };
  };
}

export interface ActivityPermission {
  activityType: ActivityType;
  enabled: boolean;
  allowedRoles: UserRole[];
  customSettings?: {
    difficulty?: 'Başlangıç' | 'Orta' | 'Zor' | 'Uzman';
    maxAttempts?: number;
    requiresTeacher?: boolean;
  };
}

// ─── Module Permission ────────────────────────────────────────────

export interface ModulePermission {
  module: PermissionModule;
  enabled: boolean;
  actions: PermissionAction[];
  categoryPermissions?: CategoryPermission[];
  customSettings?: {
    aiGenerationEnabled?: boolean;
    maxStudents?: number;
    allowExport?: boolean;
    requireApproval?: boolean;
  };
}

// ─── Role Permissions ─────────────────────────────────────────────

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

// ─── RBAC Settings ────────────────────────────────────────────────

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

// ─── Default RBAC Configuration ───────────────────────────────────

export const buildDefaultRBAC = (): RBACSettings => {
  const allActivityTypes = ACTIVITY_CATEGORIES.flatMap(cat => cat.activities);
  
  return {
    roles: [
      {
        role: 'superadmin',
        modules: [
          {
            module: 'admin',
            enabled: true,
            actions: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'assign'],
            customSettings: {
              aiGenerationEnabled: true,
              allowExport: true,
              requireApproval: false,
            },
          },
          {
            module: 'activity-studio',
            enabled: true,
            actions: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'assign'],
            categoryPermissions: ACTIVITY_CATEGORIES.map(cat => ({
              categoryId: cat.id,
              categoryTitle: cat.title,
              enabled: true,
              allowedRoles: ['superadmin', 'admin', 'teacher', 'user', 'student', 'parent'],
              activityOverrides: cat.activities.map(act => ({
                activityType: act,
                enabled: true,
                allowedRoles: ['superadmin', 'admin', 'teacher', 'user', 'student', 'parent'],
              })),
            })),
            customSettings: {
              aiGenerationEnabled: true,
              allowExport: true,
              requireApproval: false,
            },
          },
          {
            module: 'reading-studio',
            enabled: true,
            actions: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'assign'],
            customSettings: { aiGenerationEnabled: true, allowExport: true },
          },
          {
            module: 'math-studio',
            enabled: true,
            actions: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'assign'],
            customSettings: { aiGenerationEnabled: true, allowExport: true },
          },
          {
            module: 'infographic-studio',
            enabled: true,
            actions: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'assign'],
            categoryPermissions: [
              {
                categoryId: 'visual-spatial',
                categoryTitle: 'Görsel & Mekansal',
                enabled: true,
                allowedRoles: ['superadmin', 'admin', 'teacher', 'user', 'student', 'parent'],
              },
              {
                categoryId: 'reading-comprehension',
                categoryTitle: 'Okuduğunu Anlama',
                enabled: true,
                allowedRoles: ['superadmin', 'admin', 'teacher', 'user', 'student', 'parent'],
              },
              {
                categoryId: 'reading-verbal',
                categoryTitle: 'Okuma & Dil',
                enabled: true,
                allowedRoles: ['superadmin', 'admin', 'teacher', 'user', 'student', 'parent'],
              },
              {
                categoryId: 'math-logic',
                categoryTitle: 'Matematik & Mantık',
                enabled: true,
                allowedRoles: ['superadmin', 'admin', 'teacher', 'user', 'student', 'parent'],
              },
            ],
            customSettings: { aiGenerationEnabled: true, allowExport: true },
          },
          {
            module: 'screening',
            enabled: true,
            actions: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'assign'],
          },
          {
            module: 'curriculum',
            enabled: true,
            actions: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'assign'],
          },
          {
            module: 'students',
            enabled: true,
            actions: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'assign'],
          },
          {
            module: 'reports',
            enabled: true,
            actions: ['view', 'create', 'edit', 'delete', 'manage', 'export'],
          },
          {
            module: 'sinav-studyosu',
            enabled: true,
            actions: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'assign'],
          },
          {
            module: 'ocr',
            enabled: true,
            actions: ['view', 'create', 'edit', 'delete', 'manage', 'approve', 'export', 'assign'],
          },
        ],
        globalSettings: {
          canAccessAdmin: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canExportData: true,
          maxDailyGenerations: -1, // Unlimited
        },
      },
      {
        role: 'admin',
        modules: [
          {
            module: 'admin',
            enabled: true,
            actions: ['view', 'manage'],
          },
          {
            module: 'activity-studio',
            enabled: true,
            actions: ['view', 'create', 'edit', 'export', 'assign'],
            categoryPermissions: ACTIVITY_CATEGORIES.map(cat => ({
              categoryId: cat.id,
              categoryTitle: cat.title,
              enabled: true,
              allowedRoles: ['admin', 'teacher', 'user', 'student', 'parent'],
              activityOverrides: cat.activities.map(act => ({
                activityType: act,
                enabled: true,
                allowedRoles: ['admin', 'teacher', 'user', 'student', 'parent'],
              })),
            })),
            customSettings: {
              aiGenerationEnabled: true,
              allowExport: true,
              requireApproval: false,
            },
          },
          {
            module: 'students',
            enabled: true,
            actions: ['view', 'edit', 'manage'],
          },
          {
            module: 'reports',
            enabled: true,
            actions: ['view', 'export'],
          },
        ],
        globalSettings: {
          canAccessAdmin: true,
          canManageUsers: false,
          canViewAnalytics: true,
          canExportData: true,
          maxDailyGenerations: 100,
        },
      },
      {
        role: 'teacher',
        modules: [
          {
            module: 'activity-studio',
            enabled: true,
            actions: ['view', 'create', 'export', 'assign'],
            categoryPermissions: ACTIVITY_CATEGORIES.map(cat => ({
              categoryId: cat.id,
              categoryTitle: cat.title,
              enabled: true,
              allowedRoles: ['teacher', 'user', 'student'],
              activityOverrides: cat.activities.map(act => ({
                activityType: act,
                enabled: true,
                allowedRoles: ['teacher', 'user', 'student'],
              })),
            })),
            customSettings: {
              aiGenerationEnabled: true,
              allowExport: true,
              requireApproval: false,
            },
          },
          {
            module: 'reading-studio',
            enabled: true,
            actions: ['view', 'create', 'export', 'assign'],
          },
          {
            module: 'math-studio',
            enabled: true,
            actions: ['view', 'create', 'export', 'assign'],
          },
          {
            module: 'infographic-studio',
            enabled: true,
            actions: ['view', 'create', 'export', 'assign'],
            categoryPermissions: [
              {
                categoryId: 'visual-spatial',
                categoryTitle: 'Görsel & Mekansal',
                enabled: true,
                allowedRoles: ['teacher', 'user', 'student'],
              },
              {
                categoryId: 'reading-comprehension',
                categoryTitle: 'Okuduğunu Anlama',
                enabled: true,
                allowedRoles: ['teacher', 'user', 'student'],
              },
              {
                categoryId: 'reading-verbal',
                categoryTitle: 'Okuma & Dil',
                enabled: true,
                allowedRoles: ['teacher', 'user', 'student'],
              },
              {
                categoryId: 'math-logic',
                categoryTitle: 'Matematik & Mantık',
                enabled: true,
                allowedRoles: ['teacher', 'user', 'student'],
              },
            ],
          },
          {
            module: 'screening',
            enabled: true,
            actions: ['view', 'create'],
          },
          {
            module: 'curriculum',
            enabled: true,
            actions: ['view', 'create'],
          },
          {
            module: 'students',
            enabled: true,
            actions: ['view', 'manage'],
          },
          {
            module: 'ocr',
            enabled: true,
            actions: ['view', 'create'],
          },
        ],
        globalSettings: {
          canAccessAdmin: false,
          canManageUsers: false,
          canViewAnalytics: true,
          canExportData: true,
          maxDailyGenerations: 50,
        },
      },
      {
        role: 'user',
        modules: [
          {
            module: 'activity-studio',
            enabled: true,
            actions: ['view', 'create'],
            categoryPermissions: ACTIVITY_CATEGORIES.map(cat => ({
              categoryId: cat.id,
              categoryTitle: cat.title,
              enabled: true,
              allowedRoles: ['user', 'student'],
              activityOverrides: cat.activities.map(act => ({
                activityType: act,
                enabled: true,
                allowedRoles: ['user', 'student'],
              })),
            })),
            customSettings: {
              aiGenerationEnabled: true,
              allowExport: false,
              requireApproval: false,
            },
          },
        ],
        globalSettings: {
          canAccessAdmin: false,
          canManageUsers: false,
          canViewAnalytics: false,
          canExportData: false,
          maxDailyGenerations: 20,
        },
      },
      {
        role: 'student',
        modules: [
          {
            module: 'activity-studio',
            enabled: true,
            actions: ['view'],
            categoryPermissions: ACTIVITY_CATEGORIES.map(cat => ({
              categoryId: cat.id,
              categoryTitle: cat.title,
              enabled: true,
              allowedRoles: ['student'],
              activityOverrides: cat.activities.map(act => ({
                activityType: act,
                enabled: true,
                allowedRoles: ['student'],
              })),
            })),
          },
        ],
        globalSettings: {
          canAccessAdmin: false,
          canManageUsers: false,
          canViewAnalytics: false,
          canExportData: false,
          maxDailyGenerations: 10,
        },
      },
      {
        role: 'parent',
        modules: [
          {
            module: 'activity-studio',
            enabled: true,
            actions: ['view'],
            categoryPermissions: ACTIVITY_CATEGORIES.map(cat => ({
              categoryId: cat.id,
              categoryTitle: cat.title,
              enabled: true,
              allowedRoles: ['parent'],
              activityOverrides: cat.activities.map(act => ({
                activityType: act,
                enabled: true,
                allowedRoles: ['parent'],
              })),
            })),
          },
        ],
        globalSettings: {
          canAccessAdmin: false,
          canManageUsers: false,
          canViewAnalytics: false,
          canExportData: false,
          maxDailyGenerations: 5,
        },
      },
    ],
    globalSettings: {
      maintenanceMode: false,
      aiGenerationEnabled: true,
      registrationEnabled: true,
      enforceCategoryPermissions: true,
      enforceActivityPermissions: true,
      auditLoggingEnabled: true,
    },
  };
};

// ─── Permission Checker Service ───────────────────────────────────

export class RBACService {
  private settings: RBACSettings;

  constructor(settings: RBACSettings) {
    this.settings = settings;
  }

  /**
   * Check if user role has access to a module
   */
  hasModulePermission(role: UserRole, module: PermissionModule, action: PermissionAction): boolean {
    const rolePerms = this.settings.roles.find(r => r.role === role);
    if (!rolePerms) return false;

    const modulePerm = rolePerms.modules.find(m => m.module === module);
    if (!modulePerm || !modulePerm.enabled) return false;

    return modulePerm.actions.includes(action);
  }

  /**
   * Check if user role can access activity category
   */
  canAccessCategory(role: UserRole, categoryId: string): boolean {
    const rolePerms = this.settings.roles.find(r => r.role === role);
    if (!rolePerms) return false;

    // Check all modules for this category
    for (const module of rolePerms.modules) {
      if (module.categoryPermissions) {
        const catPerm = module.categoryPermissions.find(c => c.categoryId === categoryId);
        if (catPerm && catPerm.enabled && catPerm.allowedRoles.includes(role)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if user role can access specific activity
   */
  canAccessActivity(role: UserRole, activityType: ActivityType): boolean {
    const rolePerms = this.settings.roles.find(r => r.role === role);
    if (!rolePerms) return false;

    // Find activity in category permissions
    for (const module of rolePerms.modules) {
      if (module.categoryPermissions) {
        for (const catPerm of module.categoryPermissions) {
          if (catPerm.activityOverrides) {
            const actPerm = catPerm.activityOverrides.find(a => a.activityType === activityType);
            if (actPerm && actPerm.enabled && actPerm.allowedRoles.includes(role)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Get all accessible categories for a role
   */
  getAccessibleCategories(role: UserRole): CategoryPermission[] {
    const rolePerms = this.settings.roles.find(r => r.role === role);
    if (!rolePerms) return [];

    const categories: CategoryPermission[] = [];
    
    for (const module of rolePerms.modules) {
      if (module.categoryPermissions) {
        categories.push(...module.categoryPermissions.filter(
          cat => cat.enabled && cat.allowedRoles.includes(role)
        ));
      }
    }

    return categories;
  }

  /**
   * Get all accessible activities for a role
   */
  getAccessibleActivities(role: UserRole): ActivityPermission[] {
    const categories = this.getAccessibleCategories(role);
    const activities: ActivityPermission[] = [];

    for (const cat of categories) {
      if (cat.activityOverrides) {
        activities.push(...cat.activityOverrides.filter(
          act => act.enabled && act.allowedRoles.includes(role)
        ));
      }
    }

    return activities;
  }

  /**
   * Update settings (admin only)
   */
  updateSettings(newSettings: RBACSettings): void {
    this.settings = newSettings;
  }

  /**
   * Get current settings
   */
  getSettings(): RBACSettings {
    return this.settings;
  }
}

// Export singleton instance
export const defaultRBACSettings = buildDefaultRBAC();
export const rbacService = new RBACService(defaultRBACSettings);
