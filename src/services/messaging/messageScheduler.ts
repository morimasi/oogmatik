import { collectionGroup, query, where, orderBy, limit, getDocs, Timestamp, doc, writeBatch } from "firebase/firestore";
import { db } from "../firebaseClient";
import { IMessage } from "../../types/messaging";
import { toAppError } from "../../utils/AppError";

const RETENTION_DAYS = 30;
const BATCH_SIZE = 50;

export const messageScheduler = {
  async cleanupExpiredMessages(): Promise<number> {
    try {
      const cutoffDate = Timestamp.fromDate(new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000));

      const q = query(
        collectionGroup(db, "messages"),
        where("isDeleted", "==", true),
        where("deletedAt", "<=", cutoffDate),
        orderBy("deletedAt", "desc"),
        limit(BATCH_SIZE)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return 0;

      const batch = writeBatch(db);
      let deletedCount = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data() as IMessage;
        const conversationId = data.conversationId;

        if (conversationId) {
          batch.delete(doc(db, "conversations", conversationId, "messages", docSnap.id));
          deletedCount++;
        }
      }

      await batch.commit();
      return deletedCount;
    } catch (error) {
      throw toAppError(error, "Eski mesajlar temizlenirken hata oluştu.", "MSG_CLEANUP_ERR");
    }
  },

  getRetentionDays(): number {
    return RETENTION_DAYS;
  },
};
