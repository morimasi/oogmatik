/**
 * OOGMATIK - JWT Token Verification
 * Secure API authentication with JSON Web Tokens
 */

import jwt from 'jsonwebtoken';

export interface TokenPayload {
    userId: string;
    email: string;
    name: string;
    role: 'admin' | 'teacher' | 'parent' | 'student';
    iat: number;
    exp: number;
}

/**
 * JWT Service for token generation and verification
 */
export class JWTService {
    private static readonly SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    private static readonly EXPIRATION_TIME = '24h'; // 24 hours
    private static readonly REFRESH_EXPIRATION = '7d'; // 7 days

    /**
     * Generate JWT token
     */
    static generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
        try {
            return jwt.sign(payload, this.SECRET_KEY, {
                expiresIn: this.EXPIRATION_TIME,
                algorithm: 'HS256',
            });
        } catch (error) {
            console.error('[JWT] Error generating token:', error);
            throw new Error('Token generation failed');
        }
    }

    /**
     * Generate refresh token
     */
    static generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
        try {
            return jwt.sign(payload, this.SECRET_KEY, {
                expiresIn: this.REFRESH_EXPIRATION,
                algorithm: 'HS256',
            });
        } catch (error) {
            console.error('[JWT] Error generating refresh token:', error);
            throw new Error('Refresh token generation failed');
        }
    }

    /**
     * Verify and decode token
     */
    static verifyToken(token: string): TokenPayload {
        try {
            const decoded = jwt.verify(token, this.SECRET_KEY, {
                algorithms: ['HS256'],
            }) as TokenPayload;

            return decoded;
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token has expired');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            }
            throw new Error('Token verification failed');
        }
    }

    /**
     * Decode token without verification (for debugging)
     */
    static decodeToken(token: string): TokenPayload | null {
        try {
            return jwt.decode(token) as TokenPayload;
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if token is expired
     */
    static isTokenExpired(token: string): boolean {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded) return true;
            return decoded.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    }

    /**
     * Refresh token
     */
    static refreshToken(refreshToken: string): { token: string; refreshToken: string } {
        try {
            const decoded = this.verifyToken(refreshToken);
            const payload = {
                userId: decoded.userId,
                email: decoded.email,
                name: decoded.name,
                role: decoded.role,
            };

            return {
                token: this.generateToken(payload),
                refreshToken: this.generateRefreshToken(payload),
            };
        } catch (error) {
            console.error('[JWT] Error refreshing token:', error);
            throw new Error('Token refresh failed');
        }
    }
}

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string): string | null => {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }
    
    return parts[1];
};

/**
 * API Middleware: Verify JWT token
 */
export const jwtMiddleware = (req: any, res: any, next: any) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                error: {
                    message: 'Missing authentication token',
                    code: 'AUTH_MISSING',
                },
            });
        }

        const payload = JWTService.verifyToken(token);

        // Attach user info to request
        req.user = {
            userId: payload.userId,
            email: payload.email,
            name: payload.name,
            role: payload.role,
        };

        next();
    } catch (error: any) {
        return res.status(401).json({
            error: {
                message: error.message || 'Token verification failed',
                code: 'AUTH_INVALID',
            },
        });
    }
};

/**
 * Optional middleware: Verify token but don't fail if missing
 */
export const optionalJWTMiddleware = (req: any, res: any, next: any) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (token) {
            const payload = JWTService.verifyToken(token);
            req.user = {
                userId: payload.userId,
                email: payload.email,
                name: payload.name,
                role: payload.role,
            };
        }
    } catch (error) {
        // Ignore errors in optional middleware
        console.warn('[JWT] Optional token verification failed:', error);
    }

    next();
};

/**
 * Login endpoint - generates tokens
 */
export const loginHandler = async (req: any, res: any) => {
    try {
        const { email, password } = req.body;

        // TODO: Verify email and password against database
        // This is a placeholder for demonstration

        if (!email || !password) {
            return res.status(400).json({
                error: {
                    message: 'Email and password required',
                    code: 'VALIDATION_ERROR',
                },
            });
        }

        // Mock user (in production, fetch from database)
        const user = {
            userId: 'user123',
            email: email,
            name: 'John Doe',
            role: 'teacher' as const,
        };

        const token = JWTService.generateToken(user);
        const refreshToken = JWTService.generateRefreshToken(user);

        return res.status(200).json({
            success: true,
            data: {
                token,
                refreshToken,
                user,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        return res.status(500).json({
            error: {
                message: error.message || 'Login failed',
                code: 'LOGIN_ERROR',
            },
        });
    }
};

/**
 * Refresh token endpoint
 */
export const refreshTokenHandler = async (req: any, res: any) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                error: {
                    message: 'Refresh token required',
                    code: 'VALIDATION_ERROR',
                },
            });
        }

        const { token: newToken, refreshToken: newRefreshToken } =
            JWTService.refreshToken(refreshToken);

        return res.status(200).json({
            success: true,
            data: {
                token: newToken,
                refreshToken: newRefreshToken,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        return res.status(401).json({
            error: {
                message: error.message || 'Token refresh failed',
                code: 'REFRESH_ERROR',
            },
        });
    }
};

/**
 * Logout endpoint
 */
export const logoutHandler = async (req: any, res: any) => {
    // In production, add token to blacklist or remove from whitelist
    return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date().toISOString(),
    });
};

/**
 * Token validation endpoint (for testing)
 */
export const validateTokenHandler = async (req: any, res: any) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }

        const payload = JWTService.verifyToken(token);

        return res.status(200).json({
            success: true,
            data: {
                valid: true,
                payload,
                expiresAt: new Date(payload.exp * 1000),
            },
        });
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: error.message || 'Invalid token',
        });
    }
};

/**
 * Export for use in other modules
 */
export default {
    JWTService,
    extractTokenFromHeader,
    jwtMiddleware,
    optionalJWTMiddleware,
    loginHandler,
    refreshTokenHandler,
    logoutHandler,
    validateTokenHandler,
};
