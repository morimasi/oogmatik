import { UserRole } from './user';
import { ActivityType } from './activity';

export type PermissionAction = 
  | 'view' 
  | 'create' 
  | 'edit' 
  | 'delete' 
  | 'manage' 
  | 'approve' 
  | 'export'
  | 'assign';

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

export interface ModulePermission {
  module: PermissionModule;
  enabled: boolean;
  actions: PermissionAction[];
  categoryPermissions?: CategoryPermission[];
}

export interface RolePermissions {
  role: UserRole;
  modules: ModulePermission[];
}

export interface RBACSettings {
  roles: RolePermissions[];
  globalSettings: {
    maintenanceMode: boolean;
    aiGenerationEnabled: boolean;
    registrationEnabled: boolean;
    enforceCategoryPermissions: boolean;
    enforceActivityPermissions: boolean;
  };
}
