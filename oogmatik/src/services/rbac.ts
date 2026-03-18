/**
 * OOGMATIK - Role-Based Access Control (RBAC)
 * User roles and permission management
 */

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student';
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
 * Role definitions with permissions
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    admin: [
        // Full access
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
    teacher: [
        // Can manage own content
        'create:worksheet',
        'read:worksheet',
        'update:worksheet',
        'delete:worksheet',
        'share:worksheet',
        'view:analytics',
        'export:data',
    ],
    parent: [
        // Can view and share worksheets with children
        'read:worksheet',
        'share:worksheet',
        'view:analytics',
    ],
    student: [
        // Can only view worksheets
        'read:worksheet',
    ],
};

/**
 * User role with metadata
 */
export interface UserRoleInfo {
    userId: string;
    role: UserRole;
    school?: string;
    department?: string;
    permissions: Permission[];
}

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
 * Check if user has specific permission
 */
export const hasPermission = (
    userRole: UserRole,
    requiredPermission: Permission | Permission[]
): boolean => {
    const userPermissions = ROLE_PERMISSIONS[userRole];

    if (typeof requiredPermission === 'string') {
        return userPermissions.includes(requiredPermission);
    }

    // Check if user has any of the required permissions
    return requiredPermission.some(perm => userPermissions.includes(perm));
};

/**
 * Get user role (from Firestore or session)
 */
export const getUserRole = async (userId: string): Promise<UserRoleInfo | null> => {
    try {
        // TODO: Fetch from Firestore
        // const userDoc = await getDoc(doc(db, 'users', userId));
        // if (!userDoc.exists()) return null;
        // const data = userDoc.data();
        // return {
        //     userId,
        //     role: data.role as UserRole,
        //     school: data.school,
        //     department: data.department,
        //     permissions: ROLE_PERMISSIONS[data.role],
        // };

        // Placeholder
        return {
            userId,
            role: 'student',
            permissions: ROLE_PERMISSIONS['student'],
        };
    } catch (error) {
        console.error('Error fetching user role:', error);
        return null;
    }
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
        console.warn(`Unknown action/resource combination: ${key}`);
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
        admin: 4,
        teacher: 3,
        parent: 2,
        student: 1,
    };

    return hierarchy[role1] > hierarchy[role2];
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
};
