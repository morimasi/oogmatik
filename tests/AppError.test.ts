import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  AppError,
  ValidationError,
  RateLimitError,
  TimeoutError,
  AuthenticationError,
  NetworkError,
  InternalServerError,
  toAppError,
} from '@/utils/AppError';

/**
 * AppError Class Tests
 */
describe('AppError', () => {
  describe('AppError Base Class', () => {
    it('should create an AppError with all properties', () => {
      const error = new AppError(
        'Test message',
        'TEST_ERROR',
        400,
        { detail: 'test' },
        false
      );

      expect(error.userMessage).toBe('Test message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.httpStatus).toBe(400);
      expect(error.isRetryable).toBe(false);
      expect(error.name).toBe('AppError');
    });

    it('should have default httpStatus of 500', () => {
      const error = new AppError('Test', 'TEST');
      expect(error.httpStatus).toBe(500);
    });

    it('should serialize to JSON correctly', () => {
      const error = new AppError('User message', 'CODE', 400, { debug: 'info' }, true);
      const json = error.toJSON();

      expect(json.code).toBe('CODE');
      expect(json.userMessage).toBe('User message');
      expect(json.httpStatus).toBe(400);
      expect(json.isRetryable).toBe(true);
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with correct defaults', () => {
      const error = new ValidationError('Invalid input', { field: 'email' });

      expect(error.userMessage).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.httpStatus).toBe(400);
      expect(error.isRetryable).toBe(false);
      expect(error.name).toBe('ValidationError');
    });

    it('should use default message if none provided', () => {
      const error = new ValidationError('');
      expect(error.userMessage).toBe('Giriş verileri geçersiz.');
    });
  });

  describe('AuthenticationError', () => {
    it('should create AuthenticationError with correct defaults', () => {
      const error = new AuthenticationError();

      expect(error.code).toBe('AUTH_ERROR');
      expect(error.httpStatus).toBe(401);
      expect(error.isRetryable).toBe(false);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Token expired');
      expect(error.userMessage).toBe('Token expired');
    });
  });

  describe('RateLimitError', () => {
    it('should create RateLimitError with retry info', () => {
      const error = new RateLimitError(30);

      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.httpStatus).toBe(429);
      expect(error.isRetryable).toBe(true);
      expect(error.details?.retryAfter).toBe(30);
      expect(error.name).toBe('RateLimitError');
    });

    it('should have default retryAfter of 60', () => {
      const error = new RateLimitError();
      expect(error.details?.retryAfter).toBe(60);
    });
  });

  describe('TimeoutError', () => {
    it('should create TimeoutError with operation details', () => {
      const error = new TimeoutError('Database Query', 5000);

      expect(error.code).toBe('TIMEOUT');
      expect(error.httpStatus).toBe(504);
      expect(error.isRetryable).toBe(true);
      expect(error.details?.operation).toBe('Database Query');
      expect(error.details?.timeoutMs).toBe(5000);
      expect(error.name).toBe('TimeoutError');
    });

    it('should have default operation and timeoutMs', () => {
      const error = new TimeoutError();
      expect(error.details?.operation).toBe('İşlem');
      expect(error.details?.timeoutMs).toBe(5000);
    });
  });

  describe('NetworkError', () => {
    it('should create NetworkError with default message', () => {
      const error = new NetworkError();

      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.httpStatus).toBe(503);
      expect(error.isRetryable).toBe(true);
      expect(error.name).toBe('NetworkError');
    });

    it('should accept custom message', () => {
      const error = new NetworkError('DNS resolution failed');
      expect(error.userMessage).toBe('DNS resolution failed');
    });
  });

  describe('toAppError function', () => {
    it('should convert Error to AppError', () => {
      const error = new Error('Generic error');
      const appError = toAppError(error);

      expect(appError).toBeInstanceOf(AppError);
      expect(appError.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should return AppError if already an AppError', () => {
      const appError = new ValidationError('Invalid');
      const converted = toAppError(appError);

      expect(converted).toBe(appError);
      expect(converted).toBeInstanceOf(ValidationError);
    });

    it('should handle null/undefined gracefully', () => {
      const error1 = toAppError(null);
      const error2 = toAppError(undefined);

      expect(error1).toBeInstanceOf(InternalServerError);
      expect(error2).toBeInstanceOf(InternalServerError);
    });

    it('should detect Firebase auth errors', () => {
      const firebaseError = {
        code: 'auth/invalid-credential',
        message: 'Credentials mismatch'
      };
      const appError = toAppError(firebaseError);

      expect(appError).toBeInstanceOf(AuthenticationError);
    });

    it('should detect network errors', () => {
      const networkError = new Error('Failed to fetch');
      const appError = toAppError(networkError);

      expect(appError).toBeInstanceOf(NetworkError);
    });
  });
});
