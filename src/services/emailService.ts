import { db } from './firebaseClient';
import * as firestore from 'firebase/firestore';
import { logInfo, logError } from '../utils/logger';

const { collection, addDoc } = firestore;

export interface SentEmail {
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  type: 'approval' | 'notification' | 'general';
}

export const emailService = {
  /**
   * Simulates sending an email and saves the record to Firestore sent_emails collection
   */
  sendApprovalEmail: async (recipientEmail: string, recipientName: string): Promise<boolean> => {
    try {
      const subject = '🎉 bdmind Hesabınız Onaylandı!';
      const body = `Merhaba Sayın ${recipientName},

bdmind platformuna yapmış olduğunuz kayıt başvurusu yöneticimiz tarafından incelenmiş ve onaylanmıştır!

Artık hesabınıza giriş yaparak disleksi ve özel öğrenme güçlüğü olan öğrencileriniz için yapay zeka destekli, kişiselleştirilmiş eğitim materyalleri üretmeye başlayabilirsiniz.

Giriş Yapmak İçin: https://bdmind.bursadisleksi.com
Sorularınız ve Geri Bildirimleriniz İçin: morimasi@gmail.com

Başarılı çalışmalar dileriz,
bdmind Ekibi`;

      logInfo(`Sending automatic approval email to ${recipientEmail}...`);

      // Save email log to Firestore
      const emailRecord: SentEmail = {
        to: recipientEmail,
        subject,
        body,
        sentAt: new Date().toISOString(),
        type: 'approval',
      };

      await addDoc(collection(db, 'sent_emails'), emailRecord);

      logInfo(`Approval email successfully sent and recorded for: ${recipientEmail}`);
      return true;
    } catch (error) {
      logError('Error sending/recording approval email:', error as Record<string, unknown>);
      return false;
    }
  }
};
