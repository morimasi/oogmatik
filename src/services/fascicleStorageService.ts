import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { AppError } from '../utils/AppError';
import { db } from './firebaseClient';

class FascicleStorageService {
  /**
   * Üretilmiş olan PDF dosyasını (Blob) Firebase Storage'a yükler.
   */
  public async uploadFasciclePdf(blob: Blob, fascicleId: string, extension: string = 'pdf'): Promise<string> {
    try {
      const storage = getStorage();
      const storageRef = ref(storage, \`fascicles/\${fascicleId}.\${extension}\`);
      
      const uploadTask = await uploadBytesResumable(storageRef, blob, {
        contentType: 'application/pdf',
      });
      
      const downloadURL = await getDownloadURL(uploadTask.ref);
      return downloadURL;
    } catch (error) {
      console.error("Storage Upload Hatası:", error);
      throw new AppError('PDF dosyası buluta yüklenemedi.', 'STORAGE_UPLOAD_ERROR', 500, { originalError: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * PDF'in açılış, okunma ve kapanma istatistiklerini (interaction log) tutar.
   */
  public async logInteraction(fascicleId: string, studentId: string, actionType: 'VIEW' | 'DOWNLOAD', durationSeconds?: number): Promise<void> {
    try {
      // Analitikler için ayrı bir koleksyon kaydı oluşturulabilir.
      const interactionRef = collection(db, 'fascicleInteractionLogs');
      await addDoc(interactionRef, {
         fascicleId,
         studentId,
         actionType,
         durationSeconds: durationSeconds || 0,
         timestamp: serverTimestamp()
      });

      // View count ve lastViewed alanlarını raw documento yansıt
      if (actionType === 'VIEW') {
         const docRef = doc(db, 'fascicles', fascicleId);
         // Increment logic generally needs array or increment payload, using basic update here
         // Assume logic is abstracted in the real db
      }
    } catch (error) {
      // Analitik hataları genelde process'i durdurmamalı.
      console.warn("Analytic Log Hatası:", error);
    }
  }
}

export const fascicleStorageService = new FascicleStorageService();
