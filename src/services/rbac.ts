/**
 * BDMIND - Role-Based Access Control (RBAC) Compatibility Layer
 * Adapts modern rbacService for legacy consumers and test suites
 */
import { AppError } from '../utils/AppError.js';
import { logWarn } from '../utils/logger.js';
import { rbacService } from './rbacService.js';
import { UserRole } from '../types/user.js';

export type { UserRole };

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

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    superadmin: [
        'create:worksheet',
        'read:worksheet',
        'update:worksheet',
        'delete:worksheet',
        'share:worksheet',
        'manage:users',
        'manage:content',
        'view:analytics',
        'export:data',
    ],
    admin: [
        'create:worksheet',
        'read:worksheet',
        'update:worksheet',
        'delete:worksheet',
        'share:worksheet',
        'manage:users',
        'manage:content',
        'view:analytics',
        'export:data',
    ],
    editor: [
        'create:worksheet',
        'read:worksheet',
        'update:worksheet',
        'manage:content',
        'view:analytics',
    ],
    teacher: [
        'create:worksheet',
        'read:worksheet',
        'update:worksheet',
        'delete:worksheet',
        'share:worksheet',
        'view:analytics',
        'export:data',
    ],
    parent: [
        'read:worksheet',
        'share:worksheet',
        'view:analytics',
    ],
    student: [
        'read:worksheet',
    ],
    guest: [
        'read:worksheet',
    ],
    user: [
        'read:worksheet',
    ],
};

export const hasRole = (role: UserRole, requiredRole: UserRole | UserRole[]): boolean => {
    return rbacService.hasRole(role, requiredRole);
};

export const hasPermission = (
    userRole: UserRole,
    requiredPermission: Permission | Permission[]
): boolean => {
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    if (typeof requiredPermission === 'string') {
        return userPermissions.includes(requiredPermission);
    }

    return requiredPermission.some(perm => userPermissions.includes(perm));
};

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

export const enforcePermission = (
    userRole: UserRole,
    requiredPermission: Permission | Permission[],
    context?: string
): void => {
    if (!hasPermission(userRole, requiredPermission)) {
        const permStr = Array.isArray(requiredPermission)
            ? requiredPermission.join(', ')
            : requiredPermission;

        throw new AppError(
            `Yetki yetersiz. Gerekli: ${permStr}${context ? ` (${context})` : ''}`,
            'PERMISSION_DENIED',
            403
        );
    }
};

export const getPermissions = (role: UserRole): Permission[] => {
    return [...(ROLE_PERMISSIONS[role] || [])];
};

export const getAllRoles = (): UserRole[] => {
    return ['admin', 'teacher', 'parent', 'student'];
};

export const hasHigherPrivilege = (role1: UserRole, role2: UserRole): boolean => {
    const hierarchy: Record<UserRole, number> = {
        superadmin: 5,
        admin: 4,
        editor: 3.5,
        teacher: 3,
        parent: 2,
        user: 1.5,
        student: 1,
        guest: 0,
    };

    return (hierarchy[role1] || 0) > (hierarchy[role2] || 0);
};

export { rbacService };
