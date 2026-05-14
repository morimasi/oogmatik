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
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
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

  uploadFile: async (
    file: File,
    userId: string,
    conversationId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<Omit<IAttachment, "id">> => {
    fileSharingService.validateFile(file);

    const scanResult = await fileSharingService.simulateVirusScan(file);
    if (scanResult === "infected") {
      throw new InternalServerError("Dosyada zararlı yazılım tespit edildi.", "VIRUS_DETECTED");
    }

    // Yol: /uploads/{userId}/{conversationId}/{timestamp}_{fileName}
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `uploads/${userId}/${conversationId}/${timestamp}_${safeName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
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
          reject(new InternalServerError("Dosya yüklenirken hata oluştu: " + error.message, "STORAGE_UPLOAD_ERR"));
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

            let type: IAttachment["type"] = "other";
            if (file.type.startsWith("image/")) type = "image";
            else if (file.type.startsWith("video/")) type = "video";
            else if (file.type.startsWith("audio/")) type = "audio";
            else if (
              file.type.includes("pdf") ||
              file.type.includes("document") ||
              file.type.includes("spreadsheet") ||
              file.type.includes("presentation")
            )
              type = "document";

            resolve({
              url: downloadUrl,
              name: file.name,
              size: file.size,
              type,
              mimeType: file.type,
              virusScanStatus: "clean",
            });
          } catch (error) {
            reject(new InternalServerError("İndirme bağlantısı alınamadı.", "STORAGE_URL_ERR"));
          }
        }
      );
    });
  },

  deleteFile: async (attachment: IAttachment): Promise<void> => {
    try {
      const storageRef = ref(storage, attachment.url);
      await deleteObject(storageRef);
    } catch {
      // Dosya zaten silinmiş olabilir, sessiz geç
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
