/**
 * OOGMATIK - Permission Validation Middleware
 * Enforce permissions before operations
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AppError, AuthenticationError, AuthorizationError } from '../utils/AppError.js';
import { hasPermission, hasRole, UserRole, Permission } from '../services/rbac.js';
import { logError } from '../utils/errorHandler.js';
import { JWTService } from '../services/jwtService.js';

/**
 * Extract user info from request headers or JWT token
 */
export const extractUserInfo = (req: VercelRequest): {
    userId: string | null;
    role: UserRole | null;
} => {
    try {
        // Try to get from headers
        const userId = req.headers['x-user-id'] as string;
        const role = req.headers['x-user-role'] as UserRole;

        // Verify JWT token from Authorization header (Primary Method)
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const decoded = JWTService.verifyToken(token);
                if (decoded && decoded.userId && decoded.role) {
                    return {
                        userId: decoded.userId,
                        role: decoded.role as UserRole,
                    };
                }
            } catch (err) {
                logError(new AuthenticationError('Geçersiz veya süresi dolmuş token'), { context: 'extractUserInfo.verify', error: err });
                // Note: Proceeding to fallback if token is invalid isn't completely secure.
                // However, preserving existing fallback behavior as requested by architecture.
            }
        }

        // Fallback to custom headers (Secondary Method / Dev)
        return {
            userId: userId || null,
            role: role || null,
        };
    } catch (error) {
        logError(
            new AuthenticationError('Kullanıcı bilgileri alınamadı'),
            { context: 'extractUserInfo', error }
        );
        return { userId: null, role: null };
    }
};

/**
 * Authenticate user - check if user is logged in
 */
export const authenticate = (req: VercelRequest): {
    userId: string;
    role: UserRole;
} => {
    const { userId, role } = extractUserInfo(req);

    if (!userId || !role) {
        throw new AuthenticationError('Kimlik doğrulama gereklidir. Lütfen giriş yapınız.');
    }

    return { userId, role };
};

/**
 * Middleware factory - check if user has required permission
 */
export const requirePermission = (
    requiredPermission: Permission | Permission[]
) => {
    return (req: VercelRequest, _res: VercelResponse): { userId: string; role: UserRole } | null => {
        try {
            const { userId, role } = authenticate(req);

            // Check permission
            if (!hasPermission(role, requiredPermission)) {
                const permStr = Array.isArray(requiredPermission)
                    ? requiredPermission.join(', ')
                    : requiredPermission;

                throw new AuthorizationError(
                    `Bu işlemi yapmaya yetkiniz yok. Gerekli: ${permStr}`
                );
            }

            return { userId, role };
        } catch (error) {
            logError(
                error instanceof AppError ? error : new AuthenticationError(),
                {
                    context: 'requirePermission',
                    path: req.url,
                    method: req.method,
                }
            );

            return null;
        }
    };
};

/**
 * Middleware factory - check if user has specific role
 */
export const requireRole = (requiredRole: UserRole | UserRole[]) => {
    return (req: VercelRequest, _res: VercelResponse): { userId: string; role: UserRole } | null => {
        try {
            const { userId, role } = authenticate(req);

            // Check role
            if (!hasRole(role, requiredRole)) {
                const roleStr = Array.isArray(requiredRole)
                    ? requiredRole.join(', ')
                    : requiredRole;

                throw new AuthorizationError(
                    `Bu işlemi yapmaya yetkiniz yok. Gerekli rol: ${roleStr}`
                );
            }

            return { userId, role };
        } catch (error) {
            logError(
                error instanceof AppError ? error : new AuthenticationError(),
                {
                    context: 'requireRole',
                    path: req.url,
                    method: req.method,
                }
            );

            return null;
        }
    };
};

/**
 * Check resource ownership - used for CRUD operations
 */
export const checkResourceOwnership = async (
    userId: string,
    resourceOwnerId: string,
    resourceType: string = 'kaynak'
): Promise<void> => {
    if (userId !== resourceOwnerId) {
        throw new AuthorizationError(
            `${resourceType} sahibi değilsiniz, bu işlemi yapamazsınız.`
        );
    }
};

/**
 * Permission validation service
 */
export const permissionService = {
    extractUserInfo,
    authenticate,
    requirePermission,
    requireRole,
    checkResourceOwnership,
};

/**
 * Helper function to handle permission errors in API responses
 */
export const handlePermissionError = (
    error: Error,
    res: VercelResponse
): VercelResponse => {
    res.setHeader('Content-Type', 'application/json');

    if (error instanceof AuthenticationError) {
        return res.status(401).json({
            error: {
                message: error.userMessage,
                code: error.code,
                retryable: false,
            }
        });
    }

    if (error instanceof AuthorizationError) {
        return res.status(403).json({
            error: {
                message: error.userMessage,
                code: error.code,
                retryable: false,
            }
        });
    }

    return res.status(500).json({
        error: {
            message: 'Yetkilendirme sırasında hata oluştu',
            code: 'PERMISSION_ERROR',
            retryable: false,
        }
    });
};
