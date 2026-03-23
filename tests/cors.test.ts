/**
 * OOGMATIK - CORS Validation Test Suite
 *
 * @module tests/cors.test.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  isAllowedOrigin,
  setCorsHeaders,
  handleCorsPreflight,
  validateCorsAndMethod,
  addAllowedOrigin,
  getAllowedOrigins,
  removeAllowedOrigin
} from '@/utils/cors.js';
import { AppError } from '@/utils/AppError.js';

// Mock response helper
function createMockResponse(): VercelResponse {
  const headers: Record<string, string> = {};
  const res = {
    setHeader: vi.fn((key: string, value: string) => {
      headers[key] = value;
    }),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
    _headers: headers
  } as unknown as VercelResponse;

  return res;
}

// Mock request helper
function createMockRequest(
  method: string = 'POST',
  origin?: string
): VercelRequest {
  return {
    method,
    headers: origin ? { origin } : {},
    body: {}
  } as VercelRequest;
}

describe('CORS Validation System', () => {
  describe('isAllowedOrigin', () => {
    it('production domain kabul edilir', () => {
      expect(isAllowedOrigin('https://oogmatik.com')).toBe(true);
      expect(isAllowedOrigin('https://www.oogmatik.com')).toBe(true);
      expect(isAllowedOrigin('https://oogmatik.vercel.app')).toBe(true);
    });

    it('localhost development kabul edilir', () => {
      expect(isAllowedOrigin('http://localhost:5173')).toBe(true);
      expect(isAllowedOrigin('http://localhost:3000')).toBe(true);
      expect(isAllowedOrigin('http://127.0.0.1:5173')).toBe(true);
    });

    it('Vercel preview deployment pattern kabul edilir', () => {
      expect(isAllowedOrigin('https://oogmatik-abc123-def456.vercel.app')).toBe(true);
      expect(isAllowedOrigin('https://oogmatik-git-feature-user.vercel.app')).toBe(true);
    });

    it('Google IDX pattern kabul edilir', () => {
      expect(isAllowedOrigin('https://abc123-idx-xyz789.idx.dev')).toBe(true);
    });

    it('geçersiz origin reddedilir', () => {
      expect(isAllowedOrigin('https://malicious-site.com')).toBe(false);
      expect(isAllowedOrigin('http://evil.com')).toBe(false);
      expect(isAllowedOrigin('https://oogmatik.com.evil.com')).toBe(false);
    });

    it('origin header yoksa (same-origin) her ortamda izin verir', () => {
      const originalEnv = process.env.NODE_ENV;

      process.env.NODE_ENV = 'development';
      expect(isAllowedOrigin(undefined)).toBe(true);

      process.env.NODE_ENV = 'production';
      expect(isAllowedOrigin(undefined)).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('setCorsHeaders', () => {
    let res: VercelResponse;

    beforeEach(() => {
      res = createMockResponse();
    });

    it('geçerli origin için headers ayarlanır', () => {
      const req = createMockRequest('POST', 'https://oogmatik.com');

      setCorsHeaders(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://oogmatik.com');
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
      expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    });

    it('geçersiz origin için AppError fırlatır', () => {
      const req = createMockRequest('POST', 'https://evil.com');

      expect(() => setCorsHeaders(req, res)).toThrow(AppError);
    });

    it('custom methods ayarlanır', () => {
      const req = createMockRequest('POST', 'https://oogmatik.com');

      setCorsHeaders(req, res, { methods: ['GET', 'POST'] });

      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST');
    });

    it('custom headers ayarlanır', () => {
      const req = createMockRequest('POST', 'https://oogmatik.com');

      setCorsHeaders(req, res, { headers: ['Content-Type', 'X-Custom-Header'] });

      expect(res.setHeader).toHaveBeenCalledWith(
        'Access-Control-Allow-Headers',
        'Content-Type, X-Custom-Header'
      );
    });

    it('credentials devre dışı bırakılabilir', () => {
      const req = createMockRequest('POST', 'https://oogmatik.com');

      setCorsHeaders(req, res, { credentials: false });

      expect(res.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Credentials', expect.anything());
    });

    it('güvenlik headers her zaman ayarlanır', () => {
      const req = createMockRequest('POST', 'https://oogmatik.com');

      setCorsHeaders(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(res.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
    });
  });

  describe('handleCorsPreflight', () => {
    let res: VercelResponse;

    beforeEach(() => {
      res = createMockResponse();
    });

    it('OPTIONS request 200 döner', () => {
      const req = createMockRequest('OPTIONS', 'https://oogmatik.com');

      const handled = handleCorsPreflight(req, res);

      expect(handled).toBe(true);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalled();
    });

    it('POST request preflight olarak işlenmez', () => {
      const req = createMockRequest('POST', 'https://oogmatik.com');

      const handled = handleCorsPreflight(req, res);

      expect(handled).toBe(false);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('geçersiz origin için 403 döner', () => {
      const req = createMockRequest('OPTIONS', 'https://evil.com');

      const handled = handleCorsPreflight(req, res);

      expect(handled).toBe(true);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'CORS_ORIGIN_NOT_ALLOWED'
          })
        })
      );
    });
  });

  describe('validateCorsAndMethod', () => {
    let res: VercelResponse;

    beforeEach(() => {
      res = createMockResponse();
    });

    it('geçerli POST request için true döner', () => {
      const req = createMockRequest('POST', 'https://oogmatik.com');

      const valid = validateCorsAndMethod(req, res, ['POST']);

      expect(valid).toBe(true);
    });

    it('OPTIONS request için false döner (preflight handled)', () => {
      const req = createMockRequest('OPTIONS', 'https://oogmatik.com');

      const valid = validateCorsAndMethod(req, res, ['POST']);

      expect(valid).toBe(false);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('geçersiz method için false döner + 405 error', () => {
      const req = createMockRequest('PUT', 'https://oogmatik.com');

      const valid = validateCorsAndMethod(req, res, ['POST']);

      expect(valid).toBe(false);
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'METHOD_NOT_ALLOWED'
          })
        })
      );
    });

    it('geçersiz origin için false döner + 403 error', () => {
      const req = createMockRequest('POST', 'https://evil.com');

      const valid = validateCorsAndMethod(req, res, ['POST']);

      expect(valid).toBe(false);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'CORS_ORIGIN_NOT_ALLOWED'
          })
        })
      );
    });

    it('multiple methods desteklenir', () => {
      const reqPost = createMockRequest('POST', 'https://oogmatik.com');
      const reqGet = createMockRequest('GET', 'https://oogmatik.com');

      expect(validateCorsAndMethod(reqPost, res, ['GET', 'POST'])).toBe(true);
      expect(validateCorsAndMethod(reqGet, res, ['GET', 'POST'])).toBe(true);
    });
  });

  describe('Dynamic Origin Management', () => {
    it('yeni origin eklenebilir', () => {
      const newOrigin = 'https://new-domain.com';

      addAllowedOrigin(newOrigin);

      expect(isAllowedOrigin(newOrigin)).toBe(true);

      // Cleanup
      removeAllowedOrigin(newOrigin);
    });

    it('regex pattern eklenebilir', () => {
      const pattern = /^https:\/\/.*\.customer\.com$/;

      addAllowedOrigin(pattern);

      expect(isAllowedOrigin('https://subdomain.customer.com')).toBe(true);
      expect(isAllowedOrigin('https://another.customer.com')).toBe(true);
      expect(isAllowedOrigin('https://evil.com')).toBe(false);

      // Cleanup
      removeAllowedOrigin(pattern);
    });

    it('geçersiz origin eklenemez', () => {
      expect(() => addAllowedOrigin('not-a-url')).toThrow();
      expect(() => addAllowedOrigin(123 as any)).toThrow();
    });

    it('origin listesi alınabilir', () => {
      const origins = getAllowedOrigins();

      expect(Array.isArray(origins)).toBe(true);
      expect(origins.length).toBeGreaterThan(0);
    });

    it('origin kaldırılabilir', () => {
      const testOrigin = 'https://test-removal.com';

      addAllowedOrigin(testOrigin);
      expect(isAllowedOrigin(testOrigin)).toBe(true);

      removeAllowedOrigin(testOrigin);
      expect(isAllowedOrigin(testOrigin)).toBe(false);
    });

    it('duplicate origin eklenmez', () => {
      const origin = 'https://duplicate-test.com';
      const initialLength = getAllowedOrigins().length;

      addAllowedOrigin(origin);
      addAllowedOrigin(origin); // Duplicate

      expect(getAllowedOrigins().length).toBe(initialLength + 1);

      // Cleanup
      removeAllowedOrigin(origin);
    });
  });
});
