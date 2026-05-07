/**
 * OOGMATIK — Authentication Gate Middleware
 * 
 * Mandatory authentication for all protected routes
 * Blocks unauthorized access and validates JWT tokens
 * 
 * Usage:
 * - API routes: Wrap handler with authGate()
 * - Frontend: useAuthGate() hook for page protection
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { JWTService } from '../services/jwtService.js';
import { AppError, AuthenticationError } from './AppError.js';
import { logError, logInfo } from './logger.js';
import { db } from '../services/firebaseClient.js';
import { doc, getDoc } from 'firebase/firestore';

/**
 * User info extracted from JWT or session
 */
export interface AuthenticatedUser {
  userId: string;
  role: string;
  email: string;
  name: string;
  status: 'active' | 'suspended' | 'inactive';
}

/**
 * Authentication Gate
 * Validates JWT token and extracts user info
 */
export async function authGate(
  req: VercelRequest
): Promise<AuthenticatedUser> {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError(
        'Kimlik doğrulama token\'ı bulunamadı'
      );
    }

    const token = authHeader.substring(7);

    // 2. Verify JWT token
    let decoded;
    try {
      decoded = JWTService.verifyToken(token);
    } catch (error) {
      throw new AuthenticationError(
        'Geçersiz veya süresi dolmuş token'
      );
    }

    if (!decoded.userId) {
      throw new AuthenticationError(
        'Token\'da kullanıcı bilgisi eksik'
      );
    }

    // 3. Fetch user from Firestore
    const userDocRef = doc(db, 'users', decoded.userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      throw new AuthenticationError(
        'Kullanıcı bulunamadı'
      );
    }

    const userData = userDocSnap.data();

    // 4. Check user status
    if (userData.status === 'suspended') {
      throw new AuthenticationError(
        'Hesabınız askıya alınmıştır. Lütfen yönetici ile iletişime geçin.'
      );
    }

    if (userData.status === 'inactive') {
      throw new AuthenticationError(
        'Hesabınız aktif değil. Lütfen giriş yapın.'
      );
    }

    // 5. Return authenticated user
    const user: AuthenticatedUser = {
      userId: decoded.userId,
      role: userData.role || 'user',
      email: userData.email || '',
      name: userData.name || 'Kullanıcı',
      status: userData.status || 'active',
    };

    logInfo('Authentication successful', {
      userId: user.userId,
      role: user.role,
      path: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    logError(new AuthenticationError('Authentication gate error'));

    throw new AuthenticationError(
      'Kimlik doğrulama başarısız oldu'
    );
  }
}

/**
 * Optional authentication (doesn't fail if no token)
 * Returns null if not authenticated
 */
export async function optionalAuthGate(
  req: VercelRequest
): Promise<AuthenticatedUser | null> {
  try {
    return await authGate(req);
  } catch {
    return null;
  }
}

/**
 * Require specific role(s)
 */
export function requireRole(...allowedRoles: string[]) {
  return async (req: VercelRequest): Promise<AuthenticatedUser> => {
    const user = await authGate(req);

    if (!allowedRoles.includes(user.role)) {
      throw new AppError(
        `Bu işlem için ${allowedRoles.join(' veya ')} rolü gereklidir`,
        'INSUFFICIENT_ROLE'
      );
    }

    return user;
  };
}

/**
 * Require admin role (shorthand)
 */
export const requireAdmin = () => requireRole('admin', 'superadmin');

/**
 * Require teacher or above (shorthand)
 */
export const requireTeacherOrAbove = () =>
  requireRole('teacher', 'admin', 'superadmin');
