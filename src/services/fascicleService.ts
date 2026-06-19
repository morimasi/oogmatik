import { FascicleDocument } from '../types/fascicle';
import { AppError } from '../utils/AppError';
import { logError } from '../utils/errorHandler';
import { db } from './firebaseClient'; /* Oogmatik projesindeki Firebase db referansı varsayılarak eklendi */
import { doc, setDoc, getDoc, collection, serverTimestamp } from 'firebase/firestore';

class FascicleService {
  private autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly AUTO_SAVE_DELAY_MS = 2000; // 2 saniye debounce

  /**
   * Arka planda debounce ile (2sn bekleyerek) taslak kaydı atar.
   */
  public autoSaveDraft(fascicleId: string, data: Partial<FascicleDocument>): Promise<void> {
    return new Promise((resolve, reject) => {
      // Önceki timer varsa temizle
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout);
      }

      this.autoSaveTimeout = setTimeout(async () => {
        try {
          // Firebase Cloud Firestore kaydı
          const fascicleRef = doc(collection(db, 'fascicles'), fascicleId);
          await setDoc(fascicleRef, {
            ...data,
            updatedAt: serverTimestamp(),
            isDraft: true
          }, { merge: true });
          
          resolve();
        } catch (error) {
          logError("AutoSave Hatası", { originalError: error instanceof Error ? error.message : String(error) });
          reject(new AppError('Fasikül taslağı otomatik kaydedilemedi.', 'AUTO_SAVE_ERROR', 500, { originalError: error instanceof Error ? error.message : String(error) }));
        }
      }, this.AUTO_SAVE_DELAY_MS);
    });
  }

  /**
   * Tamamlanmış (isDraft: false) fasikülü DB'ye kaydeder.
   */
  public async publishFascicle(fascicle: FascicleDocument, pdfUrl: string): Promise<void> {
    try {
      const fascicleRef = doc(collection(db, 'fascicles'), fascicle.id);
      await setDoc(fascicleRef, {
        ...fascicle,
        isDraft: false,
        pdfUrl,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      throw new AppError('Fasikül yayınlanırken hata oluştu.', 'PUBLISH_ERROR', 500, { originalError: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Öğrenciye atanan fasikülleri çeker. (Basit mock get)
   */
  public async getAssignedFascicles(studentId: string): Promise<FascicleDocument[]> {
    // Burada ileride firebase "where" sorgusu olacak
    return [];
  }
}

export const fascicleService = new FascicleService();
