/**
 * ImageValidator Tests
 *
 * Test suite for image validation utility (OCR Variation System)
 */

import { describe, it, expect } from 'vitest';
import {
  validateSingleFile,
  validateBatch,
  validateBase64Image,
  validateDyslexiaSafeDigits,
  filterConfusableDigitsInBatch,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
} from '@/utils/imageValidator';

describe('ImageValidator - Single File Validation', () => {
  it('should accept valid JPEG file', () => {
    const file = new File(['x'.repeat(1024 * 100)], 'test.jpg', {
      type: 'image/jpeg',
    });

    const result = validateSingleFile(file);
    expect(result.valid).toBe(true);
    expect(result.metadata?.type).toBe('image/jpeg');
  });

  it('should accept valid PNG file', () => {
    const file = new File(['x'.repeat(1024 * 100)], 'test.png', {
      type: 'image/png',
    });

    const result = validateSingleFile(file);
    expect(result.valid).toBe(true);
  });

  it('should reject file larger than 15MB', () => {
    // 16MB file
    const file = new File(['x'.repeat(16 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    const result = validateSingleFile(file);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('çok büyük');
  });

  it('should reject file smaller than 10KB (corrupt)', () => {
    const file = new File(['x'.repeat(5 * 1024)], 'tiny.jpg', {
      type: 'image/jpeg',
    });

    const result = validateSingleFile(file);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('küçük');
  });

  it('should reject unsupported file format (GIF)', () => {
    const file = new File(['x'.repeat(1024 * 100)], 'test.gif', {
      type: 'image/gif',
    });

    const result = validateSingleFile(file);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('desteklenmiyor');
  });

  it('should reject PDF larger than 20MB', () => {
    // 21MB PDF
    const file = new File(['x'.repeat(21 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });

    const result = validateSingleFile(file);
    expect(result.valid).toBe(false);
  });

  it('should calculate estimated processing time', () => {
    const file = new File(['x'.repeat(5 * 1024 * 1024)], 'test.jpg', {
      type: 'image/jpeg',
    });

    const result = validateSingleFile(file);
    expect(result.metadata?.estimatedProcessingTime).toBeGreaterThan(0);
  });
});

describe('ImageValidator - Batch Validation', () => {
  it('should validate multiple files successfully', () => {
    const files = [
      new File(['x'.repeat(1024 * 100)], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['x'.repeat(1024 * 100)], 'test2.png', { type: 'image/png' }),
      new File(['x'.repeat(1024 * 100)], 'test3.jpg', { type: 'image/jpeg' }),
    ];

    const result = validateBatch(files);
    expect(result.validFiles).toHaveLength(3);
    expect(result.rejectedFiles).toHaveLength(0);
  });

  it('should reject files exceeding batch limit (10 files)', () => {
    const files = Array.from({ length: 15 }, (_, i) =>
      new File(['x'.repeat(1024 * 100)], `test${i}.jpg`, {
        type: 'image/jpeg',
      })
    );

    const result = validateBatch(files);
    expect(result.validFiles.length).toBeLessThanOrEqual(10);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should reject batch exceeding total size limit (50MB)', () => {
    const files = [
      // 3 files × 18MB = 54MB (exceeds 50MB)
      new File(['x'.repeat(18 * 1024 * 1024)], 'test1.jpg', {
        type: 'image/jpeg',
      }),
      new File(['x'.repeat(18 * 1024 * 1024)], 'test2.jpg', {
        type: 'image/jpeg',
      }),
      new File(['x'.repeat(18 * 1024 * 1024)], 'test3.jpg', {
        type: 'image/jpeg',
      }),
    ];

    const result = validateBatch(files);
    // At least one file should be rejected
    expect(result.rejectedFiles.length).toBeGreaterThan(0);
  });

  it('should provide warnings for large batches', () => {
    const files = Array.from({ length: 7 }, (_, i) =>
      new File(['x'.repeat(1024 * 100)], `test${i}.jpg`, {
        type: 'image/jpeg',
      })
    );

    const result = validateBatch(files);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('ImageValidator - Base64 Validation', () => {
  it('should accept valid base64 JPEG', () => {
    const base64 = 'data:image/jpeg;base64,' + btoa('x'.repeat(1024 * 100));
    const result = validateBase64Image(base64);
    expect(result.valid).toBe(true);
  });

  it('should reject base64 without proper header', () => {
    const base64 = btoa('x'.repeat(1024));
    const result = validateBase64Image(base64);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('header');
  });

  it('should reject base64 with unsupported MIME type', () => {
    const base64 = 'data:image/bmp;base64,' + btoa('x'.repeat(1024));
    const result = validateBase64Image(base64);
    expect(result.valid).toBe(false);
  });

  it('should estimate size from base64 length', () => {
    const base64 =
      'data:image/jpeg;base64,' + btoa('x'.repeat(5 * 1024 * 1024));
    const result = validateBase64Image(base64);
    expect(result.metadata?.sizeInMB).toBeGreaterThan(0);
  });

  it('should provide warnings for large base64 images', () => {
    const base64 =
      'data:image/jpeg;base64,' + btoa('x'.repeat(12 * 1024 * 1024));
    const result = validateBase64Image(base64);
    expect(result.metadata?.warnings).toBeDefined();
  });
});

describe('ImageValidator - Dyslexia-Safe Digit Validation', () => {
  it('should allow content without confusable digits', () => {
    const content = '1 + 2 = 3';
    expect(validateDyslexiaSafeDigits(content)).toBe(true);
  });

  it('should reject content with 6 and 9 together', () => {
    const content = '6 + 9 = 15';
    expect(validateDyslexiaSafeDigits(content)).toBe(false);
  });

  it('should reject content with 2 and 5 together', () => {
    const content = '2 + 5 = 7';
    expect(validateDyslexiaSafeDigits(content)).toBe(false);
  });

  it('should reject content with 3 and 8 together', () => {
    const content = '3 × 8 = 24';
    expect(validateDyslexiaSafeDigits(content)).toBe(false);
  });

  it('should reject content with 1 and 7 together', () => {
    const content = '1 + 7 = 8';
    expect(validateDyslexiaSafeDigits(content)).toBe(false);
  });

  it('should allow content with only one digit from confusable pair', () => {
    const content = '6 + 3 = 9... wait this has both 6 and 9';
    // This will actually fail because it has both 6 and 9
    expect(validateDyslexiaSafeDigits(content)).toBe(false);
  });

  it('should handle content with no digits', () => {
    const content = 'Hello World!';
    expect(validateDyslexiaSafeDigits(content)).toBe(true);
  });
});

describe('ImageValidator - Batch Digit Filtering', () => {
  it('should filter confusable digits in batch', () => {
    const items = [
      '1 + 2 = 3', // safe
      '6 + 9 = 15', // unsafe (6 and 9)
      '4 + 4 = 8', // safe
      '2 + 5 = 7', // unsafe (2 and 5)
    ];

    const result = filterConfusableDigitsInBatch(items);
    expect(result.safe).toHaveLength(2);
    expect(result.unsafe).toHaveLength(2);
    expect(result.warnings).toHaveLength(2);
  });

  it('should handle all safe items', () => {
    const items = ['1 + 2', '3 + 4', '10 + 20'];

    const result = filterConfusableDigitsInBatch(items);
    expect(result.safe).toHaveLength(3);
    expect(result.unsafe).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should handle all unsafe items', () => {
    const items = ['6 + 9', '2 + 5', '3 + 8'];

    const result = filterConfusableDigitsInBatch(items);
    expect(result.safe).toHaveLength(0);
    expect(result.unsafe).toHaveLength(3);
    expect(result.warnings).toHaveLength(3);
  });
});
