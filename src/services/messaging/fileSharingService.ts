import { AppError, ValidationError, InternalServerError } from "../../utils/AppError";
import { VirusScanStatus, IAttachment } from "../../types/messaging";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "image/png",
  "image/jpeg",
  "audio/mpeg",
  "video/mp4"
];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const fileSharingService = {
  /**
   * Dosya validasyonu: Boyut ve Mime Type kontrolü
   */
  validateFile: (file: File): void => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError(`Dosya boyutu ${MAX_FILE_SIZE_MB}MB'dan büyük olamaz.`);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new ValidationError("Desteklenmeyen dosya formatı. (Desteklenenler: PDF, DOCX, XLSX, PNG, JPG, MP3, MP4)");
    }
  },

  /**
   * Mock virüs taraması: Rastgele düşük bir ihtimalle virüslü (infected) döner
   */
  simulateVirusScan: async (file: File): Promise<VirusScanStatus> => {
    return new Promise((resolve) => {
      // Simüle edilen tarama süresi: 1.5 saniye
      setTimeout(() => {
        const isSafe = Math.random() > 0.05; // %95 ihtimalle güvenli
        resolve(isSafe ? "clean" : "infected");
      }, 1500);
    });
  },

  /**
   * Dosyayı yükler ve bir bağlantı url'si döndürür (Simülasyon/Firebase Storage)
   */
  uploadFile: async (file: File): Promise<Omit<IAttachment, "id">> => {
    fileSharingService.validateFile(file);

    const scanResult = await fileSharingService.simulateVirusScan(file);
    
    if (scanResult === "infected") {
      throw new InternalServerError("Dosyada zararlı yazılım tespit edildi. Yükleme engellendi.", "VIRUS_DETECTED");
    }

    // Gerçek uygulamada burada Firebase Storage / Vercel Blob entegrasyonu olur
    // Örnek mock url
    const fakeUrl = URL.createObjectURL(file);
    
    let type: IAttachment["type"] = "other";
    if (file.type.startsWith("image/")) type = "image";
    else if (file.type.startsWith("video/")) type = "video";
    else if (file.type.startsWith("audio/")) type = "audio";
    else if (file.type.includes("pdf") || file.type.includes("document")) type = "document";

    return {
      url: fakeUrl,
      name: file.name,
      size: file.size,
      type,
      mimeType: file.type,
      virusScanStatus: "clean"
    };
  },

  /**
   * Güvenli İndirme Linki Oluşturur (Mock Signed URL)
   */
  generateSecureTokenUrl: async (attachmentUrl: string, userId: string): Promise<string> => {
    // Backend Vercel Serverless kullanılarak token oluşturulmalıdır
    // Şimdilik mock bir jwt token ile dönüyoruz. (1 saat geçerli vb.)
    const token = btoa(`${userId}-${Date.now()}`);
    return `${attachmentUrl}?token=${token}`;
  }
};
