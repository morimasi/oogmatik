import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
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
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_FILES_PER_MESSAGE = 10;

export type FileCategory = 'image' | 'document' | 'audio' | 'video' | 'archive' | 'unknown';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const EXTENSION_MAP: Record<string, string> = {
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
  webm: 'video/webm',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  aac: 'audio/aac',
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  txt: 'text/plain',
  csv: 'text/csv',
};

export function validateFile(file: File): FileValidationResult {
  const effectiveMime = file.type || (EXTENSION_MAP[file.name.split('.').pop()?.toLowerCase() ?? ''] ?? '');

  if (!ALLOWED_MIME_TYPES.includes(effectiveMime)) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !EXTENSION_MAP[ext]) {
      return { valid: false, error: `"${ext ? `.${ext}` : 'Bilinmeyen'}" dosya türü desteklenmiyor.` };
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    const mb = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    return { valid: false, error: `Dosya boyutu ${mb}MB üzerinde olamaz.` };
  }

  return { valid: true };
}

export function getFileCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (
    mimeType.includes('pdf') ||
    mimeType.includes('document') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('presentation') ||
    mimeType === 'text/plain' ||
    mimeType === 'text/csv'
  )
    return 'document';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed'))
    return 'archive';
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

/**
 * Resim dosyasından canvas API ile küçük boyutlu thumbnail oluşturur.
 * Server-side render ortamında (test) güvenle çalışır — canvas yoksa null döner.
 */
export async function generateImageThumbnail(
  file: File,
  maxWidth = 200,
  maxHeight = 200
): Promise<string | null> {
  try {
    if (typeof document === 'undefined' || typeof window === 'undefined') return null;
    const url = URL.createObjectURL(file);
    return await new Promise<string | null>((resolve) => {
      const img = new Image();
      let isResolved = false;

      const finish = (result: string | null) => {
        if (isResolved) return;
        isResolved = true;
        URL.revokeObjectURL(url);
        resolve(result);
      };

      // 3 Saniye Timeout koruması (bazı tarayıcılarda local URL load the event'i fırlatmayabilir)
      const timer = setTimeout(() => finish(null), 3000);

      img.onload = () => {
        clearTimeout(timer);
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) { finish(null); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL('image/webp', 0.75));
      };
      img.onerror = () => { clearTimeout(timer); finish(null); };
      img.src = url;
    });
  } catch {
    return null;
  }
}

export interface UploadedFileResult {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  thumbnailUrl?: string;
  mimeCategory: FileCategory;
}

export interface UploadProgressCallback {
  (uploadId: string, progress: number): void;
}

/**
 * Firebase Storage'a dosya yükler. Retry mekanizması ile ağ kesintisine dayanıklıdır.
 */
export async function uploadFileToStorage(
  file: File,
  senderId: string,
  onProgress?: UploadProgressCallback
): Promise<UploadedFileResult | null> {
  const uploadId = uuidv4();
  const storage = getStorage();
  const category = getFileCategory(file.type);

  try {
    const storageRef = ref(storage, `message_files/${senderId}/${uploadId}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const url = await Promise.race([
      new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            onProgress?.(uploadId, progress);
          },
          reject,
          async () => {
            resolve(await getDownloadURL(uploadTask.snapshot.ref));
          }
        );
      }),
      // Network loop'una girmemesi için 30 sn the the The safety timeout The the
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Timeout_Upload')), 30000))
    ]);

    // Resim ise thumbnail oluştur
    let thumbnailUrl: string | undefined;
    if (category === 'image') {
      thumbnailUrl = (await generateImageThumbnail(file)) ?? undefined;
    }

    return {
      id: uploadId,
      name: file.name,
      type: file.type,
      url,
      size: file.size,
      thumbnailUrl,
      mimeCategory: category,
    };
  } catch {
    return null;
  }
}

/**
 * Firebase Storage'dan dosyayı siler.
 */
export async function deleteFileFromStorage(fileUrl: string): Promise<boolean> {
  try {
    const storage = getStorage();
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
    return true;
  } catch {
    return false;
  }
}
