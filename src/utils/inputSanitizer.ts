/**
 * OOGMATIK - Comprehensive Input Sanitization Layer
 * Protects against XSS, SQLi, prompt injection, and other input-based attacks
 */

import { ValidationError } from './AppError.js';
import { sanitizeForPrompt } from './promptSecurity.js';

/**
 * Sanitization levels for different contexts
 */
export type SanitizationLevel = 'strict' | 'moderate' | 'permissive';

/**
 * Sanitization options
 */
export interface SanitizationOptions {
  level?: SanitizationLevel;
  maxLength?: number;
  allowedChars?: RegExp;
  removeWhitespace?: boolean;
  toLowercase?: boolean;
  trim?: boolean;
}

/**
 * Core sanitization rules for different data types
 */
export class InputSanitizer {
  /**
   * Sanitize string input
   * - Removes dangerous characters
   * - Prevents XSS and injection attacks
   */
  static sanitizeString(
    input: string,
    options: SanitizationOptions = {}
  ): string {
    const {
      level = 'moderate',
      maxLength = 10000,
      trim = true,
      removeWhitespace = false,
      toLowercase = false,
    } = options;

    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Trim whitespace
    if (trim) {
      sanitized = sanitized.trim();
    }

    // Remove multiple spaces
    sanitized = sanitized.replace(/\s+/g, ' ');

    // Check length
    if (sanitized.length > maxLength) {
      throw new ValidationError(`Input exceeds maximum length of ${maxLength} characters`);
    }

    // Apply sanitization based on level
    if (level === 'strict') {
      // Only allow alphanumeric, spaces, and basic punctuation
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_.,!?'\u00C0-\u017F]/g, '');
    } else if (level === 'moderate') {
      // Remove common XSS patterns
      sanitized = this.removeXSSPatterns(sanitized);
      // Remove SQL injection patterns
      sanitized = this.removeSQLPatterns(sanitized);
    }
    // permissive level: minimal sanitization

    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

    if (removeWhitespace) {
      sanitized = sanitized.replace(/\s/g, '');
    }

    if (toLowercase) {
      sanitized = sanitized.toLowerCase();
    }

    return sanitized;
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email: string): string {
    const sanitized = this.sanitizeString(email.toLowerCase().trim(), {
      level: 'strict',
      maxLength: 254,
    });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      throw new ValidationError('Invalid email format');
    }

    return sanitized;
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input: unknown): number {
    const num = Number(input);

    if (isNaN(num) || !isFinite(num)) {
      throw new ValidationError('Invalid numeric input');
    }

    return num;
  }

  /**
   * Sanitize integer input
   */
  static sanitizeInteger(input: unknown, min?: number, max?: number): number {
    const num = this.sanitizeNumber(input);

    if (!Number.isInteger(num)) {
      throw new ValidationError('Input must be an integer');
    }

    if (min !== undefined && num < min) {
      throw new ValidationError(`Value must be at least ${min}`);
    }

    if (max !== undefined && num > max) {
      throw new ValidationError(`Value must be at most ${max}`);
    }

    return num;
  }

  /**
   * Sanitize array of strings
   */
  static sanitizeStringArray(
    input: unknown,
    options: SanitizationOptions = {}
  ): string[] {
    if (!Array.isArray(input)) {
      throw new ValidationError('Input must be an array');
    }

    return input.map((item) => {
      if (typeof item !== 'string') {
        throw new ValidationError('All array items must be strings');
      }
      return this.sanitizeString(item, options);
    });
  }

  /**
   * Sanitize object by recursively sanitizing all string properties
   */
  static sanitizeObject<T extends Record<string, any>>(
    obj: unknown,
    schema?: Record<string, SanitizationOptions>
  ): T {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      throw new ValidationError('Input must be an object');
    }

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Skip if not a valid identifier
      if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
        continue;
      }

      const options = schema?.[key];

      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value, options);
      } else if (typeof value === 'number') {
        sanitized[key] = this.sanitizeNumber(value);
      } else if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
        sanitized[key] = this.sanitizeStringArray(value, options);
      } else if (value === null || value === undefined) {
        sanitized[key] = value;
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value, schema);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized as T;
  }

  /**
   * Sanitize input for AI prompt context
   */
  static sanitizeForPrompt(input: string, maxLength: number = 5000): string {
    // Use existing prompt security module
    return sanitizeForPrompt(input, maxLength);
  }

  /**
   * Remove common XSS attack patterns
   */
  private static removeXSSPatterns(input: string): string {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/on\w+\s*=\s*['"]/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '');
  }

  /**
   * Remove common SQL injection patterns
   */
  private static removeSQLPatterns(input: string): string {
    return input
      .replace(/['";\\]/g, '')
      .replace(/(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\balter\b)/gi, '');
  }
}

/**
 * Helper: Validate and sanitize in one call
 */
export function validateAndSanitize<T>(
  input: unknown,
  validator: (v: unknown) => v is T,
  sanitizer: (v: T) => T
): T {
  if (!validator(input)) {
    throw new ValidationError('Input validation failed');
  }
  return sanitizer(input);
}

/**
 * Batch sanitize multiple values
 */
export function sanitizeMultiple(
  values: Record<string, string>,
  defaultLevel: SanitizationLevel = 'moderate'
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(values)) {
    result[key] = InputSanitizer.sanitizeString(value, {
      level: defaultLevel,
    });
  }

  return result;
}
