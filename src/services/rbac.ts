import { AppError } from '../utils/AppError';
import { logInfo, logError, logWarn } from '../utils/logger.js';
import { db, doc, getDoc } from './firebaseClient.js';

/**
 * OOGMATIK - Role-Based Access Control (RBAC)
 * User roles and permission management - v2 Professional (Dinamik)
 */

export type UserRole = 'user' | 'admin' | 'teacher' | 'parent' | 'student' | 'editor' | 'superadmin' | 'guest';

export type Permission =
    | 'create:worksheet'
    | 'read:worksheet'
    | 'update:worksheet'
    | 'delete:worksheet'
    | 'share:worksheet'
    | 'manage:users'
    | 'manage:content'
    | 'view:analytics'
    | 'export:data';

/**
 * UI Modül Tanımları (Sidebardaki erişim anahtarları)
 */
export type ModuleAccessKey = 
    | 'math-studio' 
    | 'reading-studio' 
    | 'creative-studio' 
    | 'super-turkce'
    | 'sinav-studyosu'
    | 'mat-sinav-studyosu'
    | 'activity-studio'
    | 'infographic-studio'
    | 'sari-kitap-studio'
    | 'kelime-cumle-studio'
    | 'screening'
    | 'curriculum'
    | 'admin-dashboard' 
    | 'messages' 
    | 'student-dashboard' 
    | 'assessment'
    | 'ocr-scanner'
    | 'visual-perception'
    | 'reading-comprehension'
    | 'reading-verbal'
    | 'math-logic'
    | 'social-history'
    | 'spld-premium';

export interface DynamicRoleDefinition {
    permissions: Permission[];
    accessibleModules: ModuleAccessKey[];
    label: string;
}

/**
 * Role definitions with permissions (Statik Fallback Matrix)
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    superadmin: [
        'create:worksheet', 'read:worksheet', 'update:worksheet', 'delete:worksheet',
        'share:worksheet', 'manage:users', 'manage:content', 'view:analytics', 'export:data',
    ],
    admin: [
        'create:worksheet', 'read:worksheet', 'update:worksheet', 'delete:worksheet',
        'share:worksheet', 'manage:users', 'manage:content', 'view:analytics', 'export:data',
    ],
    editor: [
        'create:worksheet', 'read:worksheet', 'update:worksheet', 'delete:worksheet',
        'share:worksheet', 'manage:content',
    ],
    teacher: [
        'create:worksheet', 'read:worksheet', 'update:worksheet', 'delete:worksheet',
        'share:worksheet', 'view:analytics', 'export:data',
    ],
    parent: [
        'read:worksheet', 'share:worksheet', 'view:analytics',
    ],
    student: [
        'read:worksheet',
    ],
    user: [
        'read:worksheet',
    ],
    guest: [
        'read:worksheet',
    ],
};

/**
 * Default Module Access Matrix (Statik Fallback)
 */
export const DEFAULT_MODULE_ACCESS: Record<UserRole, ModuleAccessKey[]> = {
    superadmin: ['math-studio', 'reading-studio', 'creative-studio', 'super-turkce', 'sinav-studyosu', 'mat-sinav-studyosu', 'activity-studio', 'infographic-studio', 'sari-kitap-studio', 'kelime-cumle-studio', 'screening', 'curriculum', 'admin-dashboard', 'messages', 'assessment', 'ocr-scanner', 'visual-perception', 'reading-comprehension', 'reading-verbal', 'math-logic', 'social-history', 'spld-premium'],
    admin: ['math-studio', 'reading-studio', 'creative-studio', 'super-turkce', 'sinav-studyosu', 'mat-sinav-studyosu', 'activity-studio', 'infographic-studio', 'sari-kitap-studio', 'kelime-cumle-studio', 'screening', 'curriculum', 'admin-dashboard', 'messages', 'assessment', 'ocr-scanner', 'visual-perception', 'reading-comprehension', 'reading-verbal', 'math-logic', 'social-history', 'spld-premium'],
    editor: ['math-studio', 'reading-studio', 'creative-studio', 'super-turkce', 'activity-studio', 'infographic-studio', 'messages', 'ocr-scanner', 'visual-perception', 'reading-comprehension', 'reading-verbal', 'math-logic'],
    teacher: ['math-studio', 'reading-studio', 'creative-studio', 'super-turkce', 'sinav-studyosu', 'mat-sinav-studyosu', 'activity-studio', 'infographic-studio', 'sari-kitap-studio', 'kelime-cumle-studio', 'screening', 'curriculum', 'messages', 'assessment', 'ocr-scanner', 'visual-perception', 'reading-comprehension', 'reading-verbal', 'math-logic', 'social-history', 'spld-premium'],
    parent: ['messages', 'assessment', 'reading-comprehension'],
    student: ['student-dashboard', 'messages', 'visual-perception', 'math-logic'],
    user: ['messages'],
    guest: ['messages'],
};

/**
 * User role with dynamic metadata
 */
export interface UserRoleInfo {
    userId: string;
    role: UserRole;
    permissions: Permission[];
    accessibleModules: ModuleAccessKey[];
    isDynamic?: boolean;
}

/**
 * Firestore'dan rol tanımlarını çek (Dinamik RBAC Kalbi)
 */
export const fetchRoleDefinition = async (role: UserRole): Promise<DynamicRoleDefinition | null> => {
    try {
        const roleDoc = await getDoc(doc(db, 'config_rbac', role));
        if (roleDoc.exists()) {
            return roleDoc.data() as DynamicRoleDefinition;
        }
        return null;
    } catch (error) {
        logError(`Role definition fetch failed for ${role}`, { error });
        return null;
    }
};

/**
 * Get user role and permissions (v2 Professional)
 */
export const getUserRoleInfo = async (userId: string, role: UserRole): Promise<UserRoleInfo> => {
    try {
        const dynamicDef = await fetchRoleDefinition(role);
        
        if (dynamicDef) {
            return {
                userId,
                role,
                permissions: dynamicDef.permissions,
                accessibleModules: dynamicDef.accessibleModules,
                isDynamic: true
            };
        }

        // Fallback to static matrix if Firestore is not configured
        return {
            userId,
            role,
            permissions: ROLE_PERMISSIONS[role] || [],
            accessibleModules: DEFAULT_MODULE_ACCESS[role] || [],
            isDynamic: false
        };
    } catch (error: any) {
        logError('Error building user role info', { error });
        return {
            userId,
            role,
            permissions: ROLE_PERMISSIONS[role] || [],
            accessibleModules: DEFAULT_MODULE_ACCESS[role] || [],
            isDynamic: false
        };
    }
};

/**
 * Get user role info (Aliased for compatibility)
 */
export const getUserRole = getUserRoleInfo;

/**
 * Check if user has a specific role
 */
export const hasRole = (role: UserRole, requiredRole: UserRole | UserRole[]): boolean => {
    if (typeof requiredRole === 'string') {
        return role === requiredRole;
    }
    return requiredRole.includes(role);
};

/**
 * Check if user has specific permission (v2 Professional - Overrides destekli)
 */
export const hasPermission = (
    userRole: UserRole,
    requiredPermission: Permission | Permission[],
    overriddenPermissions?: Permission[]
): boolean => {
    const userPermissions = overriddenPermissions || ROLE_PERMISSIONS[userRole] || [];

    if (typeof requiredPermission === 'string') {
        return userPermissions.includes(requiredPermission);
    }

    // Check if user has any of the required permissions
    return requiredPermission.some(perm => userPermissions.includes(perm));
};

/**
 * Check if user can perform action on resource
 */
export const canPerformAction = (
    userRole: UserRole,
    action: 'create' | 'read' | 'update' | 'delete' | 'share',
    resourceType: 'worksheet' | 'user' | 'content'
): boolean => {
    const permissionMap: Record<string, Permission> = {
        'create:worksheet': 'create:worksheet',
        'read:worksheet': 'read:worksheet',
        'update:worksheet': 'update:worksheet',
        'delete:worksheet': 'delete:worksheet',
        'share:worksheet': 'share:worksheet',
        'manage:users': 'manage:users',
        'manage:content': 'manage:content',
    };

    const key = `${action}:${resourceType}`;
    const permission = permissionMap[key] as Permission;

    if (!permission) {
        logWarn(`Unknown action/resource combination: ${key}`, { key });
        return false;
    }

    return hasPermission(userRole, permission);
};

/**
 * Enforce permission - throw error if not allowed
 */
export const enforcePermission = (
    userRole: UserRole,
    requiredPermission: Permission | Permission[],
    context?: string
): void => {
    if (!hasPermission(userRole, requiredPermission)) {
        const permStr = Array.isArray(requiredPermission)
            ? requiredPermission.join(', ')
            : requiredPermission;

        throw new Error(
            `Yetki yetersiz. Gerekli: ${permStr}${context ? ` (${context})` : ''}`
        );
    }
};

/**
 * Get all permissions for a role
 */
export const getPermissions = (role: UserRole): Permission[] => {
    return [...ROLE_PERMISSIONS[role]];
};

/**
 * Get all roles
 */
export const getAllRoles = (): UserRole[] => {
    return ['admin', 'teacher', 'parent', 'student'];
};

/**
 * Check if role1 has higher privilege than role2
 */
export const hasHigherPrivilege = (role1: UserRole, role2: UserRole): boolean => {
    const hierarchy: Record<UserRole, number> = {
        superadmin: 5,
        admin: 4,
        editor: 3.5,
        teacher: 3,
        parent: 2,
        student: 1,
        user: 1,
        guest: 0,
    };

    return hierarchy[role1] > hierarchy[role2];
};

/**
 * Check if a module is accessible (Professional v2)
 */
export const isModuleAccessible = (
    userRole: UserRole,
    moduleKey: ModuleAccessKey,
    overriddenModules?: ModuleAccessKey[]
): boolean => {
    const accessibleModules = overriddenModules || DEFAULT_MODULE_ACCESS[userRole] || [];
    return accessibleModules.includes(moduleKey);
};

/**
 * RBAC Service
 */
export const rbacService = {
    hasRole,
    hasPermission,
    getUserRole,
    canPerformAction,
    enforcePermission,
    getPermissions,
    getAllRoles,
    hasHigherPrivilege,
    isModuleAccessible,
};
