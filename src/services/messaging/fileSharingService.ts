import { ValidationError, InternalServerError } from "../../utils/AppError";
import { VirusScanStatus, IAttachment } from "../../types/messaging";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/webp",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "video/mp4",
  "video/webm",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const fileSharingService = {
  validateFile: (file: File): void => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError(`Dosya boyutu ${MAX_FILE_SIZE_MB}MB'dan büyük olamaz.`);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new ValidationError("Desteklenmeyen dosya formatı. (Desteklenenler: PDF, DOCX, XLSX, PPTX, PNG, JPG, WebP, MP3, WAV, MP4, WebM, TXT, CSV)");
    }
  },

  simulateVirusScan: async (_file: File): Promise<VirusScanStatus> => {
    void _file;
    return new Promise((resolve) => {
      setTimeout(() => {
        const isSafe = Math.random() > 0.05;
        resolve(isSafe ? "clean" : "infected");
      }, 1500);
    });
  },

  uploadFile: async (file: File): Promise<Omit<IAttachment, "id">> => {
    fileSharingService.validateFile(file);

    const scanResult = await fileSharingService.simulateVirusScan(file);

    if (scanResult === "infected") {
      throw new InternalServerError("Dosyada zararlı yazılım tespit edildi. Yükleme engellendi.", "VIRUS_DETECTED");
    }

    const fakeUrl = URL.createObjectURL(file);

    let type: IAttachment["type"] = "other";
    if (file.type.startsWith("image/")) type = "image";
    else if (file.type.startsWith("video/")) type = "video";
    else if (file.type.startsWith("audio/")) type = "audio";
    else if (file.type.includes("pdf") || file.type.includes("document") || file.type.includes("spreadsheet") || file.type.includes("presentation")) type = "document";

    return {
      url: fakeUrl,
      name: file.name,
      size: file.size,
      type,
      mimeType: file.type,
      virusScanStatus: "clean"
    };
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
