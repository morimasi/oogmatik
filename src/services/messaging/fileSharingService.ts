import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebaseClient";
import { ValidationError, InternalServerError } from "../../utils/AppError";
import { VirusScanStatus, IAttachment } from "../../types/messaging";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml",
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg",
  "video/mp4", "video/webm", "video/ogg",
  "text/plain", "text/csv",
];
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const UPLOAD_TIMEOUT_MS = 20000;

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Dosya okunamadı"));
    reader.readAsDataURL(file);
  });
}

function getAttachmentType(file: File): IAttachment["type"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (
    file.type.includes("pdf") ||
    file.type.includes("document") ||
    file.type.includes("spreadsheet") ||
    file.type.includes("presentation")
  ) return "document";
  return "other";
}

export const fileSharingService = {
  validateFile: (file: File): void => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError(`Dosya boyutu ${MAX_FILE_SIZE_MB}MB'dan büyük olamaz.`);
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new ValidationError(
        "Desteklenmeyen dosya formatı. (PDF, DOCX, XLSX, PPTX, PNG, JPG, WebP, GIF, MP3, WAV, MP4, WebM, TXT, CSV)"
      );
    }
  },

  simulateVirusScan: async (_file: File): Promise<VirusScanStatus> => {
    void _file;
    return new Promise((resolve) => {
      setTimeout(() => resolve(Math.random() > 0.05 ? "clean" : "infected"), 800);
    });
  },

  /**
   * Dosyayı Firebase Storage'a yükler. 20sn timeout'ta başarısız olursa
   * otomatik olarak Base64 data URL fallback'ine geçer.
   * Base64 de başarısız olursa (çok büyük dosya) blob URL ile çalışır
   * ancak sayfa yenilemede kaybolacağını belirtir.
   */
  uploadFile: async (
    file: File,
    userId: string,
    conversationId: string,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<Omit<IAttachment, "id"> & { _fallback?: boolean; _base64?: string }> => {
    fileSharingService.validateFile(file);

    const scanResult = await fileSharingService.simulateVirusScan(file);
    if (scanResult === "infected") {
      throw new InternalServerError("Dosyada zararlı yazılım tespit edildi.");
    }

    const type = getAttachmentType(file);

    // 1. Önce Firebase Storage dene (20sn timeout)
    try {
      const result = await fileSharingService._uploadToFirebase(file, userId, conversationId, onProgress);
      return result;
    } catch (fbError) {
      const fbMessage = fbError instanceof Error ? fbError.message : "Storage bağlantı hatası";

      // 2. Firebase başarısız → Base64 data URL dene (Firestore döküman limiti 1MB, base64 ~%33 ek yük)
      if (file.size <= 10 * 1024 * 1024) { // max 10MB (base64 ~13MB, Firestore'a sığmayabilir ama Storage çalışıyorsa sorun yok)
        try {
          const base64 = await fileToBase64(file);
          return {
            url: base64,
            name: file.name,
            size: file.size,
            type,
            mimeType: file.type,
            virusScanStatus: "clean",
            _fallback: true,
            _base64: base64,
          };
        } catch {
          // Base64 de başarısız → blob URL'e düş
        }
      }

      // 3. En kötü ihtimal: blob URL (sayfa yenilemede kaybolur)
      const blobUrl = URL.createObjectURL(file);
      return {
        url: blobUrl,
        name: file.name,
        size: file.size,
        type,
        mimeType: file.type,
        virusScanStatus: "clean",
        _fallback: true,
      };
    }
  },

  async _uploadToFirebase(
    file: File,
    userId: string,
    conversationId: string,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<Omit<IAttachment, "id">> {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `uploads/${userId}/${conversationId}/${timestamp}_${safeName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        uploadTask.cancel();
        reject(new Error("Firebase Storage bağlantı zaman aşımı (CORS veya ağ hatası olabilir)"));
      }, UPLOAD_TIMEOUT_MS);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          if (onProgress) {
            onProgress({
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
            });
          }
        },
        (error) => {
          clearTimeout(timeout);
          reject(new Error("Firebase Storage hatası: " + error.message));
        },
        async () => {
          clearTimeout(timeout);
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

            // Storage URL'sinin gerçekten erişilebilir olduğunu doğrula
            const resp = await fetch(downloadUrl, { method: "HEAD", mode: "no-cors" }).catch(() => null);
            if (!resp) {
              reject(new Error("Storage URL doğrulaması başarısız — muhtemelen CORS engeli"));
              return;
            }

            const type = getAttachmentType(file);
            resolve({
              url: downloadUrl,
              name: file.name,
              size: file.size,
              type,
              mimeType: file.type,
              virusScanStatus: "clean",
            });
          } catch {
            reject(new Error("İndirme bağlantısı alınamadı."));
          }
        }
      );
    });
  },

  /**
   * Base64 data URL'i yeniden File nesnesine çevirir (download için)
   */
  dataUrlToBlob(dataUrl: string): Blob | null {
    try {
      const parts = dataUrl.split(",");
      if (parts.length < 2) return null;
      const mime = parts[0].match(/:(.*?);/)?.[1] || "application/octet-stream";
      const raw = atob(parts[1]);
      const arr = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
      return new Blob([arr], { type: mime });
    } catch {
      return null;
    }
  },

  deleteFile: async (attachment: IAttachment): Promise<void> => {
    try {
      if (attachment.url.startsWith("blob:") || attachment.url.startsWith("data:")) return;
      const storageRef = ref(storage, attachment.url);
      await deleteObject(storageRef);
    } catch {
      // sessiz
    }
  },

  generateSecureTokenUrl: async (attachmentUrl: string, userId: string): Promise<string> => {
    const token = btoa(`${userId}-${Date.now()}`);
    return `${attachmentUrl}?token=${token}`;
  },

  getFileCategory: (mimeType: string): string => {
    if (mimeType.startsWith("image/")) return "Görsel";
    if (mimeType.startsWith("video/")) return "Video";
    if (mimeType.startsWith("audio/")) return "Ses";
    if (mimeType.includes("pdf")) return "PDF";
    if (mimeType.includes("document")) return "Belge";
    if (mimeType.includes("spreadsheet")) return "Tablo";
    if (mimeType.includes("presentation")) return "Sunum";
    if (mimeType.includes("text") || mimeType.includes("csv")) return "Metin";
    return "Diğer";
  },

  formatFileSize: (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },
};
