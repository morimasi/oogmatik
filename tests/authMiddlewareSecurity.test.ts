import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractUserInfo } from '../src/middleware/permissionValidator';
import { JWTService } from '../src/services/jwtService';

describe('Auth Middleware Security', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    it('should prioritize JWT over unverified headers', () => {
        process.env.JWT_SECRET = 'test-secret';
        const user = { userId: 'real-user', email: 'real@user.com', name: 'Real', role: 'teacher' as const };
        const token = JWTService.generateToken(user);

        const mockReq = {
            headers: {
                authorization: `Bearer ${token}`,
                'x-user-id': 'attacker',
                'x-user-role': 'admin'
            }
        } as any;

        const result = extractUserInfo(mockReq);
        expect(result.userId).toBe('real-user');
        expect(result.role).toBe('teacher');
    });

    it('should return null if invalid JWT provided (no fallback)', () => {
        process.env.JWT_SECRET = 'test-secret';
        const mockReq = {
            headers: {
                authorization: 'Bearer invalid-token',
                'x-user-id': 'dev-user',
                'x-user-role': 'teacher'
            }
        } as any;

        const result = extractUserInfo(mockReq);
        expect(result.userId).toBeNull();
        expect(result.role).toBeNull();
    });

    it('should disable fallback in production', () => {
        process.env.NODE_ENV = 'production';
        const mockReq = {
            headers: {
                'x-user-id': 'dev-user',
                'x-user-role': 'teacher'
            }
        } as any;

        const result = extractUserInfo(mockReq);
        expect(result.userId).toBeNull();
        expect(result.role).toBeNull();
    });

    it('should allow fallback in development', () => {
        process.env.NODE_ENV = 'development';
        const mockReq = {
            headers: {
                'x-user-id': 'dev-user',
                'x-user-role': 'teacher'
            }
        } as any;

        const result = extractUserInfo(mockReq);
        expect(result.userId).toBe('dev-user');
        expect(result.role).toBe('teacher');
    });
});
