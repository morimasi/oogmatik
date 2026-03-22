import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JWTService } from '../src/services/jwtService';

describe('JWTService Security', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    it('should throw error in production if JWT_SECRET is missing', () => {
        process.env.NODE_ENV = 'production';
        delete process.env.JWT_SECRET;

        expect(() => {
            // @ts-ignore - access private static property for testing
            JWTService.SECRET_KEY;
        }).toThrow('JWT_SECRET environment variable is missing in production!');
    });

    it('should use dev-secret-key in development if JWT_SECRET is missing', () => {
        process.env.NODE_ENV = 'development';
        delete process.env.JWT_SECRET;

        // @ts-ignore
        const secret = JWTService.SECRET_KEY;
        expect(secret).toBe('dev-secret-key-do-not-use-in-production');
    });

    it('should use JWT_SECRET from process.env if present', () => {
        process.env.JWT_SECRET = 'my-super-secret';

        // @ts-ignore
        const secret = JWTService.SECRET_KEY;
        expect(secret).toBe('my-super-secret');
    });

    it('should generate and verify tokens correctly', () => {
        process.env.JWT_SECRET = 'test-secret';
        const payload = {
            userId: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            role: 'teacher' as const
        };

        const token = JWTService.generateToken(payload);
        expect(token).toBeDefined();

        const decoded = JWTService.verifyToken(token);
        expect(decoded.userId).toBe(payload.userId);
        expect(decoded.role).toBe(payload.role);
    });
});
