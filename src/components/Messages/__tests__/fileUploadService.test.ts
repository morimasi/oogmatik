import { describe, it, expect } from 'vitest';
import {
  validateFile,
  formatFileSize,
  getFileCategory,
  isPreviewable,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_PER_MESSAGE,
} from '../services/fileUploadService';

describe('fileUploadService', () => {
  describe('validateFile', () => {
    it('accepts valid image files', () => {
      expect(validateFile(new File([''], 'test.png', { type: 'image/png' })).valid).toBe(true);
      expect(validateFile(new File([''], 'test.jpg', { type: 'image/jpeg' })).valid).toBe(true);
      expect(validateFile(new File([''], 'test.gif', { type: 'image/gif' })).valid).toBe(true);
    });

    it('accepts valid document files', () => {
      expect(validateFile(new File([''], 'doc.pdf', { type: 'application/pdf' })).valid).toBe(true);
      expect(validateFile(new File([''], 'doc.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })).valid).toBe(true);
      expect(validateFile(new File([''], 'sheet.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })).valid).toBe(true);
    });

    it('accepts audio and video files', () => {
      expect(validateFile(new File([''], 'audio.mp3', { type: 'audio/mpeg' })).valid).toBe(true);
      expect(validateFile(new File([''], 'video.mp4', { type: 'video/mp4' })).valid).toBe(true);
    });

    it('rejects files exceeding MAX_FILE_SIZE', () => {
      const oversized = new File([''], 'large.pdf', { type: 'application/pdf' });
      Object.defineProperty(oversized, 'size', { value: MAX_FILE_SIZE + 1 });
      const result = validateFile(oversized);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('MB');
    });

    it('rejects unsupported MIME types', () => {
      const result = validateFile(new File([''], 'script.exe', { type: 'application/x-msdownload' }));
      expect(result.valid).toBe(false);
    });

    it('handles files without MIME type via extension fallback', () => {
      const file = new File([''], 'document.pdf', { type: '' });
      expect(validateFile(file).valid).toBe(true);
    });

    it('rejects unknown extensions', () => {
      const file = new File([''], 'unknown.xyz', { type: '' });
      expect(validateFile(file).valid).toBe(false);
    });

    it('validates max files per message constant', () => {
      expect(MAX_FILES_PER_MESSAGE).toBe(10);
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1048576)).toBe('1.0 MB');
      expect(formatFileSize(1073741824)).toBe('1.0 GB');
    });
  });

  describe('getFileCategory', () => {
    it('categorizes images', () => {
      expect(getFileCategory('image/png')).toBe('image');
      expect(getFileCategory('image/jpeg')).toBe('image');
    });

    it('categorizes documents', () => {
      expect(getFileCategory('application/pdf')).toBe('document');
      expect(getFileCategory('text/plain')).toBe('document');
    });

    it('categorizes audio and video', () => {
      expect(getFileCategory('audio/mpeg')).toBe('audio');
      expect(getFileCategory('video/mp4')).toBe('video');
    });

    it('returns unknown for unrecognized types', () => {
      expect(getFileCategory('application/octet-stream')).toBe('unknown');
    });
  });

  describe('isPreviewable', () => {
    it('returns true for images, pdf, video, audio, text', () => {
      expect(isPreviewable('image/png')).toBe(true);
      expect(isPreviewable('application/pdf')).toBe(true);
      expect(isPreviewable('video/mp4')).toBe(true);
      expect(isPreviewable('audio/mpeg')).toBe(true);
      expect(isPreviewable('text/plain')).toBe(true);
    });

    it('returns false for documents and archives', () => {
      expect(isPreviewable('application/zip')).toBe(false);
      expect(isPreviewable('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(false);
    });
  });
});
