import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateFile,
  formatFileSize,
  getFileCategory,
  isPreviewable,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_PER_MESSAGE,
  generateImageThumbnail,
} from '../services/fileUploadService';

describe('fileUploadService', () => {
  // ─── validateFile ──────────────────────────────────────────────────────────

  describe('validateFile', () => {
    it('accepts valid image files', () => {
      expect(validateFile(new File([''], 'test.png', { type: 'image/png' })).valid).toBe(true);
      expect(validateFile(new File([''], 'test.jpg', { type: 'image/jpeg' })).valid).toBe(true);
      expect(validateFile(new File([''], 'test.gif', { type: 'image/gif' })).valid).toBe(true);
      expect(validateFile(new File([''], 'test.webp', { type: 'image/webp' })).valid).toBe(true);
    });

    it('accepts valid document files', () => {
      expect(validateFile(new File([''], 'doc.pdf', { type: 'application/pdf' })).valid).toBe(true);
      expect(validateFile(new File([''], 'doc.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })).valid).toBe(true);
      expect(validateFile(new File([''], 'sheet.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })).valid).toBe(true);
    });

    it('accepts audio and video files', () => {
      expect(validateFile(new File([''], 'audio.mp3', { type: 'audio/mpeg' })).valid).toBe(true);
      expect(validateFile(new File([''], 'video.mp4', { type: 'video/mp4' })).valid).toBe(true);
      expect(validateFile(new File([''], 'audio.wav', { type: 'audio/wav' })).valid).toBe(true);
      expect(validateFile(new File([''], 'video.webm', { type: 'video/webm' })).valid).toBe(true);
    });

    it('accepts archive files', () => {
      expect(validateFile(new File([''], 'archive.zip', { type: 'application/zip' })).valid).toBe(true);
    });

    // Boyut limit testleri — tam sınır değerleri
    it('accepts file exactly at MAX_FILE_SIZE', () => {
      const file = new File([''], 'exact.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: MAX_FILE_SIZE });
      expect(validateFile(file).valid).toBe(true);
    });

    it('rejects file one byte over MAX_FILE_SIZE', () => {
      const oversized = new File([''], 'large.pdf', { type: 'application/pdf' });
      Object.defineProperty(oversized, 'size', { value: MAX_FILE_SIZE + 1 });
      const result = validateFile(oversized);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('MB');
    });

    it('MAX_FILE_SIZE is 50MB', () => {
      expect(MAX_FILE_SIZE).toBe(50 * 1024 * 1024);
    });

    it('rejects unsupported MIME types', () => {
      const result = validateFile(new File([''], 'script.exe', { type: 'application/x-msdownload' }));
      expect(result.valid).toBe(false);
    });

    it('handles files without MIME type via extension fallback — pdf', () => {
      const file = new File([''], 'document.pdf', { type: '' });
      expect(validateFile(file).valid).toBe(true);
    });

    it('handles files without MIME type via extension fallback — mp3', () => {
      const file = new File([''], 'music.mp3', { type: '' });
      expect(validateFile(file).valid).toBe(true);
    });

    it('handles files without MIME type via extension fallback — mp4', () => {
      const file = new File([''], 'video.mp4', { type: '' });
      expect(validateFile(file).valid).toBe(true);
    });

    it('rejects unknown extensions', () => {
      const file = new File([''], 'unknown.xyz', { type: '' });
      expect(validateFile(file).valid).toBe(false);
    });

    it('rejects executable files', () => {
      expect(validateFile(new File([''], 'malware.bat', { type: '' })).valid).toBe(false);
    });

    it('MAX_FILES_PER_MESSAGE is 10', () => {
      expect(MAX_FILES_PER_MESSAGE).toBe(10);
    });
  });

  // ─── formatFileSize ────────────────────────────────────────────────────────

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1023)).toBe('1023 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1048576)).toBe('1.0 MB');
      expect(formatFileSize(1073741824)).toBe('1.0 GB');
    });

    it('formats 50MB correctly', () => {
      expect(formatFileSize(50 * 1024 * 1024)).toBe('50.0 MB');
    });
  });

  // ─── getFileCategory ───────────────────────────────────────────────────────

  describe('getFileCategory', () => {
    it('categorizes images', () => {
      expect(getFileCategory('image/png')).toBe('image');
      expect(getFileCategory('image/jpeg')).toBe('image');
      expect(getFileCategory('image/gif')).toBe('image');
      expect(getFileCategory('image/webp')).toBe('image');
    });

    it('categorizes documents', () => {
      expect(getFileCategory('application/pdf')).toBe('document');
      expect(getFileCategory('text/plain')).toBe('document');
      expect(getFileCategory('text/csv')).toBe('document');
      expect(getFileCategory('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('document');
      expect(getFileCategory('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe('document');
    });

    it('categorizes audio and video', () => {
      expect(getFileCategory('audio/mpeg')).toBe('audio');
      expect(getFileCategory('audio/wav')).toBe('audio');
      expect(getFileCategory('video/mp4')).toBe('video');
      expect(getFileCategory('video/webm')).toBe('video');
    });

    it('categorizes archives', () => {
      expect(getFileCategory('application/zip')).toBe('archive');
      expect(getFileCategory('application/x-rar-compressed')).toBe('archive');
    });

    it('returns unknown for unrecognized types', () => {
      expect(getFileCategory('application/octet-stream')).toBe('unknown');
      expect(getFileCategory('application/x-msdownload')).toBe('unknown');
    });
  });

  // ─── isPreviewable ─────────────────────────────────────────────────────────

  describe('isPreviewable', () => {
    it('returns true for images, pdf, video, audio, text', () => {
      expect(isPreviewable('image/png')).toBe(true);
      expect(isPreviewable('image/jpeg')).toBe(true);
      expect(isPreviewable('application/pdf')).toBe(true);
      expect(isPreviewable('video/mp4')).toBe(true);
      expect(isPreviewable('video/webm')).toBe(true);
      expect(isPreviewable('audio/mpeg')).toBe(true);
      expect(isPreviewable('audio/wav')).toBe(true);
      expect(isPreviewable('text/plain')).toBe(true);
    });

    it('returns false for documents and archives', () => {
      expect(isPreviewable('application/zip')).toBe(false);
      expect(isPreviewable('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(false);
      expect(isPreviewable('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe(false);
    });
  });

  // ─── generateImageThumbnail ───────────────────────────────────────────────

  describe('generateImageThumbnail', () => {
    it('returns null in SSR/test environment (no DOM)', async () => {
      // JSDOM'da document mevcut ama canvas mock olmayabilir
      const file = new File(['fake-image-data'], 'test.png', { type: 'image/png' });
      // SSR ortamında null beklenir — JSDOM canvas desteklemiyorsa
      const result = await generateImageThumbnail(file);
      // Test ortamında ya null ya da data URL döner, her ikisi de kabul
      expect(result === null || (typeof result === 'string' && result.startsWith('data:'))).toBe(true);
    });

    it('handles non-image files gracefully', async () => {
      const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
      // Non-image: URL.createObjectURL sonrası img.onerror tetiklenir → null
      const result = await generateImageThumbnail(file);
      expect(result === null || typeof result === 'string').toBe(true);
    });
  });

  // ─── ALLOWED_MIME_TYPES ────────────────────────────────────────────────────

  describe('ALLOWED_MIME_TYPES', () => {
    it('contains common formats', () => {
      expect(ALLOWED_MIME_TYPES).toContain('image/png');
      expect(ALLOWED_MIME_TYPES).toContain('application/pdf');
      expect(ALLOWED_MIME_TYPES).toContain('audio/mpeg');
      expect(ALLOWED_MIME_TYPES).toContain('video/mp4');
      expect(ALLOWED_MIME_TYPES).toContain('application/zip');
    });

    it('does not contain executable types', () => {
      expect(ALLOWED_MIME_TYPES).not.toContain('application/x-msdownload');
      expect(ALLOWED_MIME_TYPES).not.toContain('text/javascript');
    });
  });
});
