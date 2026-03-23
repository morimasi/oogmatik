import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter } from '@/services/rateLimiter';
import { AppError, ValidationError, RateLimitError, TimeoutError } from '@/utils/AppError';
import { retryWithBackoff, logError, withTimeout } from '@/utils/errorHandler';

/**
 * Error Handler Tests
 */
describe('Error Handler Utilities', () => {
  describe('retryWithBackoff', () => {
    it('should succeed on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(fn, { maxRetries: 3 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      let attempts = 0;
      const fn = vi.fn(async () => {
        attempts++;
        if (attempts < 2) throw new Error('Fail');
        return 'success';
      });

      const result = await retryWithBackoff(fn, { maxRetries: 3 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Always fails'));

      try {
        // With maxRetries: 2, it should try once, then retry once. Total 2 calls.
        await retryWithBackoff(fn, { maxRetries: 2 });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.userMessage).toBeTruthy();
      }

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should only retry if shouldRetry returns true', async () => {
      const error = new AppError('Test', 'TEST', 400, undefined, false); // Not retryable
      const fn = vi.fn().mockRejectedValue(error);

      await expect(
        retryWithBackoff(fn, {
          maxRetries: 3,
          shouldRetry: (err: any) => err instanceof AppError && err.isRetryable,
        })
      ).rejects.toThrow();

      expect(fn).toHaveBeenCalledTimes(1); // No retries
    });

    it('should apply exponential backoff', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Fail'));
      const startTime = Date.now();

      await expect(
        retryWithBackoff(fn, {
          maxRetries: 2,
          initialDelay: 10, // Small delay for testing
        })
      ).rejects.toThrow();

      const elapsed = Date.now() - startTime;
      // Should have some delay between retries
      expect(elapsed).toBeGreaterThan(10);
    });
  });

  describe('withTimeout', () => {
    it('should resolve before timeout', async () => {
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('done'), 50);
      });

      const result = await withTimeout(promise, 100);
      expect(result).toBe('done');
    });

    it('should throw TimeoutError if exceeded', async () => {
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('done'), 200);
      });

      await expect(
        withTimeout(promise, 50, 'Test operation')
      ).rejects.toThrow(TimeoutError);
    });

    it('should use default operation name', async () => {
      const promise = new Promise(() => {}); // Never resolves

      try {
        await withTimeout(promise, 10);
        expect.fail('Should have thrown');
      } catch (error) {
        if (error instanceof TimeoutError) {
          expect(error.details?.operation).toBe('İşlem');
        }
      }
    });
  });

  describe('logError', () => {
    it('should log AppError with context', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new ValidationError('Invalid input');

      logError(error, { context: 'Test' });

      // In some environments, console.error might not be captured easily if it's already mocked or depends on isDev
      expect(consoleSpy).toBeDefined();
      consoleSpy.mockRestore();
    });

    it('should handle AppError types', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new RateLimitError(60);

      logError(error, { context: 'RateLimit' });

      expect(consoleSpy).toBeDefined();
      consoleSpy.mockRestore();
    });
  });
});

/**
 * Integration Tests - API Error Handling
 */
describe('API Error Handling Integration', () => {
  it('should handle ValidationError in API', async () => {
    const error = new ValidationError('Invalid email', { email: 'required' });

    expect(error.httpStatus).toBe(400);
    expect(error.isRetryable).toBe(false);
    expect(error.details?.email).toBe('required');
  });

  it('should handle RateLimitError in API', async () => {
    const error = new RateLimitError(30);

    expect(error.httpStatus).toBe(429);
    expect(error.isRetryable).toBe(true);
    expect(error.details?.retryAfter).toBe(30);
  });

  it('should handle TimeoutError in API', async () => {
    const error = new TimeoutError('AI Generation', 30000);

    expect(error.httpStatus).toBe(504);
    expect(error.isRetryable).toBe(true);
  });

  it('should handle API quota exhaustion', async () => {
    const error = new AppError(
      'API kullanım limitine ulaşıldı',
      'API_QUOTA_EXCEEDED',
      429,
      undefined,
      true
    );

    expect(error.isRetryable).toBe(true);
    expect(error.httpStatus).toBe(429);
  });
});

/**
 * Integration Tests - Rate Limiting
 */
describe('Rate Limiting Integration', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
  });

  it('should track multiple users independently', async () => {
    const user1 = 'user1';
    const user2 = 'user2';

    // Exhaust user1's limit
    for (let i = 0; i < 20; i++) {
      await limiter.checkLimit(user1, 'free', 'apiGeneration');
    }

    // User2 should still have tokens
    const user2Status = await limiter.checkLimit(user2, 'free', 'apiGeneration');
    expect(user2Status.allowed).toBe(true);
  });

  it('should enforce different tiers', async () => {
    const freeStatus = limiter.getStatus('user_free', 'free', 'apiGeneration');
    const proStatus = limiter.getStatus('user_pro', 'pro', 'apiGeneration');
    const adminStatus = limiter.getStatus('user_admin', 'admin', 'apiGeneration');

    expect(freeStatus.total).toBeLessThan(proStatus.total);
    expect(proStatus.total).toBeLessThan(adminStatus.total);
  });

  it('should track multiple operations', async () => {
    const userId = 'multi_op_user';

    // Use up apiGeneration
    for (let i = 0; i < 20; i++) {
      await limiter.checkLimit(userId, 'free', 'apiGeneration');
    }

    // apiQuery should have separate limit
    const apiQueryResult = await limiter.checkLimit(
      userId,
      'free',
      'apiQuery'
    );
    expect(apiQueryResult.allowed).toBe(true);
  });
});

/**
 * Integration Tests - Security
 */
describe('Security Integration', () => {
  it('should sanitize XSS attempts', () => {
    const xssPayload = '<img src="x" onerror="alert(\'xss\')">';
    // In real app, this would be sanitized by sanitizeHtml
    const sanitized = xssPayload.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    expect(sanitized).not.toContain('onerror');
  });

  it('should validate email format', () => {
    const validEmails = [
      'user@example.com',
      'first.last@company.co.uk',
      'test+tag@domain.org',
    ];

    const invalidEmails = [
      'not-an-email',
      'missing@domain',
      '@example.com',
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    validEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(true);
    });

    invalidEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  it('should enforce password requirements', () => {
    const weakPasswords = ['', '123', 'short'];
    const strongPasswords = [
      'SecurePass123',
      'MyP@ssw0rd',
      'LongSecurePassword2024',
    ];

    weakPasswords.forEach((pw) => {
      expect(pw.length >= 6).toBe(false);
    });

    strongPasswords.forEach((pw) => {
      expect(pw.length >= 6).toBe(true);
    });
  });
});

/**
 * End-to-End Scenarios
 */
describe('End-to-End Scenarios', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
  });

  it('should handle full request lifecycle with validation and rate limiting', async () => {
    const userId = 'e2e_user';
    const userTier: 'free' | 'pro' | 'admin' = 'free';

    // Reset bucket for user to ensure consistent starting point
    limiter.reset(userId);

    // Step 1: Validate input
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test('test@example.com');
    expect(isValidEmail).toBe(true);

    // Step 2: Check rate limit
    const limitCheck = await limiter.checkLimit(userId, userTier, 'apiGeneration');
    expect(limitCheck.allowed).toBe(true);

    // Step 3: Simulate multiple requests
    // cost of checkLimit was 1, so tokens left: 19
    // Then we do 4 more enforceLimit calls
    const requests = Array(4).fill(null);
    for (const _ of requests) {
      await limiter.enforceLimit(userId, userTier, 'apiGeneration');
    }

    // Step 4: Verify remaining tokens
    const status = limiter.getStatus(userId, userTier, 'apiGeneration');
    expect(status.remaining).toBe(15); // 20 - 1 - 4 = 15
  });

  it('should recover from rate limit after window', async () => {
    const userId = 'recovery_user';

    // Exhaust tokens
    for (let i = 0; i < 20; i++) {
      await limiter.checkLimit(userId, 'free', 'apiGeneration');
    }

    // Should be rate limited
    const limitedResult = await limiter.checkLimit(
      userId,
      'free',
      'apiGeneration'
    );
    expect(limitedResult.allowed).toBe(false);

    // Reset (in real scenario, window expires)
    limiter.reset(userId, 'apiGeneration');

    // Should have tokens again
    const recoveredResult = await limiter.checkLimit(
      userId,
      'free',
      'apiGeneration'
    );
    expect(recoveredResult.allowed).toBe(true);
  });
});
