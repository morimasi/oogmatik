import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RateLimiter } from '../services/rateLimiter';
import { RateLimitError } from '../utils/AppError';

/**
 * RateLimiter Tests - Token Bucket Algorithm
 */
describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
  });

  describe('Token Bucket Algorithm', () => {
    it('should allow requests within limit', async () => {
      const result = await limiter.checkLimit('user123', 'free', 'apiGeneration', 1);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(19); // 20 - 1
    });

    it('should deny requests when tokens exhausted', async () => {
      const userId = 'user_exhausted';

      // Exhaust all tokens
      for (let i = 0; i < 20; i++) {
        await limiter.checkLimit(userId, 'free', 'apiGeneration', 1);
      }

      // Next request should be denied
      const result = await limiter.checkLimit(userId, 'free', 'apiGeneration', 1);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should enforce limit and throw RateLimitError', async () => {
      const userId = 'user_limit_test';

      // Exhaust all tokens
      for (let i = 0; i < 20; i++) {
        await limiter.enforceLimit(userId, 'free', 'apiGeneration', 1);
      }

      // Next should throw
      expect(async () => {
        await limiter.enforceLimit(userId, 'free', 'apiGeneration', 1);
      }).rejects.toThrow(RateLimitError);
    });
  });

  describe('User Tiers', () => {
    it('free tier should have lower limits', async () => {
      const freeResult = await limiter.getStatus('free_user', 'free', 'apiGeneration');
      expect(freeResult.total).toBe(20);
    });

    it('pro tier should have higher limits', async () => {
      const proResult = await limiter.getStatus('pro_user', 'pro', 'apiGeneration');
      expect(proResult.total).toBe(200);
    });

    it('admin tier should have highest limits', async () => {
      const adminResult = await limiter.getStatus('admin_user', 'admin', 'apiGeneration');
      expect(adminResult.total).toBe(10000);
    });
  });

  describe('Token Refill', () => {
    it('should refill tokens after window', async () => {
      const userId = 'refill_user';

      // Use 1 token
      await limiter.checkLimit(userId, 'free', 'apiGeneration', 1);
      let status = limiter.getStatus(userId, 'free', 'apiGeneration');
      expect(status.remaining).toBe(19);

      // Within window, tokens don't refill
      await limiter.checkLimit(userId, 'free', 'apiGeneration', 10);
      status = limiter.getStatus(userId, 'free', 'apiGeneration');
      expect(status.remaining).toBe(9);
    });

    it('should return reset time', async () => {
      const userId = 'reset_user';
      const status = limiter.getStatus(userId, 'free', 'apiGeneration');

      expect(status.resetsAt).toBeInstanceOf(Date);
      expect(status.resetsAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Different Operations', () => {
    it('should track different operation limits separately', async () => {
      const userId = 'multi_op_user';

      // Use apiGeneration limit
      for (let i = 0; i < 20; i++) {
        await limiter.checkLimit(userId, 'free', 'apiGeneration', 1);
      }

      // apiQuery should still have full tokens
      const queryStatus = await limiter.checkLimit(userId, 'free', 'apiQuery', 1);
      expect(queryStatus.allowed).toBe(true);
      expect(queryStatus.remaining).toBeGreaterThanOrEqual(99);
    });
  });

  describe('Reset Function', () => {
    it('should reset tokens for specific operation', async () => {
      const userId = 'reset_test_user';

      // Exhaust tokens
      for (let i = 0; i < 20; i++) {
        await limiter.checkLimit(userId, 'free', 'apiGeneration', 1);
      }

      // Reset
      limiter.reset(userId, 'apiGeneration');

      // Should have tokens again
      const status = limiter.getStatus(userId, 'free', 'apiGeneration');
      expect(status.remaining).toBe(20);
    });

    it('should reset all operations for user', async () => {
      const userId = 'full_reset_user';

      // Exhaust all operations
      for (let i = 0; i < 20; i++) {
        await limiter.checkLimit(userId, 'free', 'apiGeneration', 1);
      }

      // Reset all
      limiter.reset(userId);

      // All should have tokens again
      const genStatus = limiter.getStatus(userId, 'free', 'apiGeneration');
      const queryStatus = limiter.getStatus(userId, 'free', 'apiQuery');

      expect(genStatus.remaining).toBe(20);
      expect(queryStatus.remaining).toBe(100);
    });
  });

  describe('Cost Parameter', () => {
    it('should consume multiple tokens for high cost', async () => {
      const userId = 'cost_user';

      const result = await limiter.checkLimit(userId, 'free', 'apiGeneration', 5);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(15); // 20 - 5
    });
  });
});
