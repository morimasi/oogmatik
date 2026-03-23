import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateURL,
  validateLoginRequest,
  validateRegisterRequest,
  validateGenerateActivityRequest,
  validateFeedbackRequest,
  validateOCRScanRequest,
  sanitizeInput,
  sanitizeHtml,
  throwValidationError,
  validateOrThrow,
} from '@/utils/schemas';
import { ValidationError } from '@/utils/AppError';

/**
 * Input Validators Tests
 */
describe('Input Validators', () => {
  describe('Email Validation', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@nodomain.com',
        'spaces in@email.com',
        '',
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('SecurePass123');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject short passwords', () => {
      const result = validatePassword('short');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
    });

    it('should reject very long passwords', () => {
      const longPassword = 'a'.repeat(150);
      const result = validatePassword(longPassword);
      expect(result.valid).toBe(false);
    });
  });

  describe('Name Validation', () => {
    it('should validate names', () => {
      const validResults = [
        validateName('John Doe'),
        validateName('Ayşe Yılmaz'),
        validateName('José García'),
      ];

      validResults.forEach((result) => {
        expect(result.valid).toBe(true);
      });
    });

    it('should reject invalid names', () => {
      const invalidResults = [
        validateName(''),
        validateName('a'),
        validateName('a'.repeat(150)),
      ];

      invalidResults.forEach((result) => {
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('URL Validation', () => {
    it('should validate correct URLs', () => {
      const validURLs = [
        'https://example.com',
        'http://test.org',
        'https://sub.domain.co.uk/path',
      ];

      validURLs.forEach((url) => {
        expect(validateURL(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      expect(validateURL('not a url')).toBe(false);
      expect(validateURL('')).toBe(false);
    });
  });
});

/**
 * Request Validators Tests
 */
describe('Request Validators', () => {
  describe('Login Request', () => {
    it('should validate correct login request', () => {
      const result = validateLoginRequest({
        email: 'user@example.com',
        password: 'Password123',
      });

      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should reject missing email', () => {
      const result = validateLoginRequest({
        password: 'Password123',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should reject missing password', () => {
      const result = validateLoginRequest({
        email: 'user@example.com',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });

    it('should reject invalid email', () => {
      const result = validateLoginRequest({
        email: 'invalid-email',
        password: 'Password123',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });
  });

  describe('Register Request', () => {
    it('should validate correct register request', () => {
      const result = validateRegisterRequest({
        email: 'newuser@example.com',
        password: 'SecurePass123',
        name: 'John Doe',
      });

      expect(result.valid).toBe(true);
    });

    it('should require name field', () => {
      const result = validateRegisterRequest({
        email: 'user@example.com',
        password: 'Password123',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.name).toBeDefined();
    });

    it('should validate email format', () => {
      const result = validateRegisterRequest({
        email: 'invalid',
        password: 'Password123',
        name: 'John Doe',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });
  });

  describe('Generate Activity Request', () => {
    it('should validate correct generation request', () => {
      const result = validateGenerateActivityRequest({
        prompt: 'Create a reading exercise',
        activityType: 'reading-comprehension',
        studentAge: 10,
      });

      expect(result.valid).toBe(true);
    });

    it('should reject missing prompt', () => {
      const result = validateGenerateActivityRequest({
        activityType: 'reading-comprehension',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.prompt).toBeDefined();
    });

    it('should allow missing activityType (optional field)', () => {
      const result = validateGenerateActivityRequest({
        prompt: 'Create content',
      });

      expect(result.valid).toBe(true);
    });

    it('should reject invalid activityType format', () => {
      const result = validateGenerateActivityRequest({
        prompt: 'Create content',
        activityType: 123, // must be string if provided
      });

      expect(result.valid).toBe(false);
      expect(result.errors.activityType).toBeDefined();
    });

    it('should validate image format if provided', () => {
      const result = validateGenerateActivityRequest({
        prompt: 'Process image',
        activityType: 'visual-perception',
        image: {
          data: 'base64data',
          mimeType: 'invalid/format',
        },
      });

      expect(result.valid).toBe(false);
      expect(result.errors.imageMimeType).toBeDefined();
    });

    it('should allow valid image formats', () => {
      const validFormats = ['image/jpeg', 'image/png', 'image/webp'];

      validFormats.forEach((format) => {
        const result = validateGenerateActivityRequest({
          prompt: 'Create content',
          activityType: 'visual-perception',
          image: {
            data: 'base64data',
            mimeType: format,
          },
        });

        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Feedback Request', () => {
    it('should validate correct feedback', () => {
      const result = validateFeedbackRequest({
        activityType: 'reading',
        activityTitle: 'Test Activity',
        rating: 4,
        message: 'Good content',
        email: 'user@example.com',
        timestamp: new Date().toISOString(),
      });

      expect(result.valid).toBe(true);
    });

    it('should reject invalid rating', () => {
      const result = validateFeedbackRequest({
        activityType: 'reading',
        activityTitle: 'Test',
        rating: 10, // Out of range
        message: 'Test',
        timestamp: new Date().toISOString(),
      });

      expect(result.valid).toBe(false);
      expect(result.errors.rating).toBeDefined();
    });

    it('should reject missing message', () => {
      const result = validateFeedbackRequest({
        activityType: 'reading',
        activityTitle: 'Test',
        rating: 4,
        timestamp: new Date().toISOString(),
      });

      expect(result.valid).toBe(false);
      expect(result.errors.message).toBeDefined();
    });
  });

  describe('OCR Scan Request', () => {
    it('should validate correct OCR request', () => {
      const result = validateOCRScanRequest({
        image: {
          data: new Uint8Array(1000),
          mimeType: 'image/jpeg',
        },
      });

      expect(result.valid).toBe(true);
    });

    it('should reject missing image', () => {
      const result = validateOCRScanRequest({});

      expect(result.valid).toBe(false);
      expect(result.errors.image).toBeDefined();
    });

    it('should reject oversized image', () => {
      const result = validateOCRScanRequest({
        image: {
          data: new Uint8Array(15_000_000), // 15MB
          mimeType: 'image/jpeg',
        },
      });

      expect(result.valid).toBe(false);
      expect(result.errors.image).toBeDefined();
    });
  });
});

/**
 * Sanitization Tests
 */
describe('Input Sanitization', () => {
  describe('sanitizeInput', () => {
    it('should escape HTML entities', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;');
      expect(sanitized).toContain('&gt;');
    });

    it('should escape quotes', () => {
      const input = 'Test "quoted" text';
      const sanitized = sanitizeInput(input);

      expect(sanitized).toContain('&quot;');
    });

    it('should escape ampersand', () => {
      const input = 'Salt & Pepper';
      const sanitized = sanitizeInput(input);

      expect(sanitized).toContain('&amp;');
    });

    it('should escape single quotes', () => {
      const input = "It's a test";
      const sanitized = sanitizeInput(input);

      expect(sanitized).toContain('&#x27;');
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const html = 'Hello <script>alert("xss")</script> World';
      const sanitized = sanitizeHtml(html);

      expect(sanitized).not.toContain('<script>');
    });

    it('should remove event handlers', () => {
      const html = '<div onclick="alert()">Click me</div>';
      const sanitized = sanitizeHtml(html);

      expect(sanitized).not.toContain('onclick');
    });

    it('should remove javascript: URLs', () => {
      const html = '<a href="javascript:alert()">Click</a>';
      const sanitized = sanitizeHtml(html);

      expect(sanitized).not.toContain('javascript:');
    });

    it('should preserve safe HTML', () => {
      const html = '<p>Safe paragraph</p><b>Bold text</b>';
      const sanitized = sanitizeHtml(html);

      expect(sanitized).toContain('<p>');
      expect(sanitized).toContain('<b>');
    });
  });
});

/**
 * Error Throwing Tests
 */
describe('Error Handling', () => {
  describe('throwValidationError', () => {
    it('should throw ValidationError with details', () => {
      expect(() => {
        throwValidationError({ field: 'email', anotherField: 'value' });
      }).toThrow(ValidationError);
    });

    it('should include details in error', () => {
      try {
        throwValidationError({ field: 'test value' });
        expect.fail('Should have thrown');
      } catch (error) {
        if (error instanceof ValidationError) {
          expect(error.details?.field).toBe('test value');
        }
      }
    });
  });

  describe('validateOrThrow', () => {
    it('should throw if validation fails', () => {
      expect(() => {
        validateOrThrow({
          valid: false,
          errors: { field: 'error message' },
        });
      }).toThrow(ValidationError);
    });

    it('should not throw if validation succeeds', () => {
      expect(() => {
        validateOrThrow({
          valid: true,
          errors: {},
        });
      }).not.toThrow();
    });
  });
});
