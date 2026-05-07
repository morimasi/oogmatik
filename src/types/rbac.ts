import { UserRole } from './user';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'manage' | 'approve' | 'export';
export type PermissionModule = 
  | 'activity-studio' 
  | 'reading-studio' 
  | 'math-studio' 
  | 'infographic-studio' 
  | 'screening' 
  | 'admin' 
  | 'curriculum' 
  | 'students' 
  | 'reports'
  | 'sinav-studyosu'
  | 'ocr';

export interface ModulePermission {
  module: PermissionModule;
  enabled: boolean;
  actions: PermissionAction[];
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
  };
}

export const DEFAULT_RBAC_SETTINGS: RBACSettings = {
  roles: [
    {
      role: 'superadmin',
      modules: [
        { module: 'admin', enabled: true, actions: ['manage'] },
        { module: 'activity-studio', enabled: true, actions: ['manage'] },
        { module: 'reading-studio', enabled: true, actions: ['manage'] },
        { module: 'math-studio', enabled: true, actions: ['manage'] },
        { module: 'infographic-studio', enabled: true, actions: ['manage'] },
        { module: 'screening', enabled: true, actions: ['manage'] },
        { module: 'curriculum', enabled: true, actions: ['manage'] },
        { module: 'students', enabled: true, actions: ['manage'] },
        { module: 'reports', enabled: true, actions: ['manage'] },
        { module: 'sinav-studyosu', enabled: true, actions: ['manage'] },
        { module: 'ocr', enabled: true, actions: ['manage'] },
      ]
    },
    {
      role: 'admin',
      modules: [
        { module: 'admin', enabled: true, actions: ['view', 'manage'] },
        { module: 'activity-studio', enabled: true, actions: ['view', 'create', 'edit'] },
        { module: 'students', enabled: true, actions: ['view', 'manage'] },
      ]
    },
    {
      role: 'teacher',
      modules: [
        { module: 'activity-studio', enabled: true, actions: ['view', 'create'] },
        { module: 'reading-studio', enabled: true, actions: ['view', 'create'] },
        { module: 'math-studio', enabled: true, actions: ['view', 'create'] },
        { module: 'infographic-studio', enabled: true, actions: ['view', 'create'] },
        { module: 'screening', enabled: true, actions: ['view', 'create'] },
        { module: 'curriculum', enabled: true, actions: ['view', 'create'] },
        { module: 'students', enabled: true, actions: ['view', 'manage'] },
        { module: 'ocr', enabled: true, actions: ['view', 'create'] },
      ]
    },
    {
      role: 'user',
      modules: [
        { module: 'activity-studio', enabled: true, actions: ['view', 'create'] },
      ]
    }
  ],
  globalSettings: {
    maintenanceMode: false,
    aiGenerationEnabled: true,
    registrationEnabled: true
  }
};
