import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  document: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  archive: ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed'],
};

export const ALLOWED_MIME_TYPES = Object.values(ALLOWED_FILE_TYPES).flat();
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_FILES_PER_MESSAGE = 10;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext) return { valid: false, error: 'Dosya türü desteklenmiyor.' };

    const extensionMap: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      mp4: 'video/mp4',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
      txt: 'text/plain',
      csv: 'text/csv',
    };

    if (!extensionMap[ext]) {
      return { valid: false, error: `".${ext}" dosya türü desteklenmiyor.` };
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    const mb = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    return { valid: false, error: `Dosya boyutu ${mb}MB üzerinde olamaz.` };
  }

  return { valid: true };
}

export function getFileCategory(mimeType: string): 'image' | 'document' | 'audio' | 'video' | 'archive' | 'unknown' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('spreadsheet') || mimeType.includes('presentation') || mimeType === 'text/plain' || mimeType === 'text/csv') return 'document';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return 'archive';
  return 'unknown';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function isPreviewable(mimeType: string): boolean {
  return (
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType.startsWith('video/') ||
    mimeType.startsWith('audio/') ||
    mimeType === 'text/plain'
  );
}
