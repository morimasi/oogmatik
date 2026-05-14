import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  Timestamp,
  onSnapshot,
  collectionGroup,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseClient";
import { IMessage, IConversation } from "../../types/messaging";
import { toAppError, DatabaseError, InternalServerError } from "../../utils/AppError";

const CONVERSATIONS_COLLECTION = "conversations";
const MESSAGES_SUB_COLLECTION = "messages";

function timestampToMs(ts: unknown): number {
  if (!ts) return 0;
  if (typeof (ts as Timestamp).toMillis === "function") {
    return (ts as Timestamp).toMillis();
  }
  if ((ts as Record<string, unknown>).seconds) {
    return ((ts as Record<string, number>).seconds) * 1000;
  }
  return 0;
}

function docToIMessage(doc: QueryDocumentSnapshot<DocumentData>): IMessage {
  return { ...doc.data(), id: doc.id } as IMessage;
}

function docToIConversation(doc: QueryDocumentSnapshot<DocumentData>): IConversation {
  return { ...doc.data(), id: doc.id } as IConversation;
}

export const messageService = {
  createConversation: async (conversationData: Omit<IConversation, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    try {
      const convRef = doc(collection(db, CONVERSATIONS_COLLECTION));
      const newConv: IConversation = {
        ...conversationData,
        id: convRef.id,
        participantIds: conversationData.participants.map(p => p.userId),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await setDoc(convRef, newConv);
      return convRef.id;
    } catch (error) {
      throw toAppError(error, "Sohbet oluşturulurken hata oluştu.", "MSG_CONV_CREATE_ERR");
    }
  },

  sendMessage: async (messageData: Omit<IMessage, "id" | "isDeleted" | "createdAt" | "updatedAt" | "readBy">): Promise<string> => {
    let retryCount = 0;
    const maxRetries = 2;

    const executeSend = async (): Promise<string> => {
      try {
        const msgRef = doc(collection(db, CONVERSATIONS_COLLECTION, messageData.conversationId, MESSAGES_SUB_COLLECTION));

        const newMessage: Record<string, unknown> = {
          ...messageData,
          id: msgRef.id,
          isDeleted: false,
          readBy: {},
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          text: messageData.text || "",
          threadId: messageData.threadId || null,
          quoteData: messageData.quoteData || null,
        };

        await setDoc(msgRef, newMessage);

        const convRef = doc(db, CONVERSATIONS_COLLECTION, messageData.conversationId);
        await updateDoc(convRef, {
          updatedAt: Timestamp.now(),
          lastMessage: {
            id: msgRef.id,
            text: messageData.text || (messageData.attachments && messageData.attachments.length > 0 ? "Dosya gönderildi" : ""),
            senderId: messageData.senderId,
            createdAt: newMessage.createdAt
          }
        });

        return msgRef.id;
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          await new Promise(res => setTimeout(res, 1000 * retryCount));
          return executeSend();
        }
        throw toAppError(error, "Mesaj gönderilemedi.", "MSG_SEND_ERR");
      }
    };

    return executeSend();
  },

  editMessage: async (conversationId: string, messageId: string, newText: string, previousText: string): Promise<void> => {
    try {
      if (!newText.trim()) throw new InternalServerError("Mesaj metni boş olamaz.");

      const msgRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUB_COLLECTION, messageId);
      const msgSnap = await getDoc(msgRef);

      if (!msgSnap.exists()) throw new DatabaseError("Düzenlenecek mesaj bulunamadı.");

      const existingHistory = msgSnap.data().editHistory || [];

      await updateDoc(msgRef, {
        text: newText,
        updatedAt: Timestamp.now(),
        editHistory: [...existingHistory, { previousText, editedAt: Timestamp.now() }]
      });
    } catch (error) {
      throw toAppError(error, "Mesaj düzenlenirken bir hata oluştu.", "MSG_EDIT_ERR");
    }
  },

  softDeleteMessage: async (conversationId: string, messageId: string): Promise<void> => {
    try {
      const msgRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUB_COLLECTION, messageId);
      await updateDoc(msgRef, {
        isDeleted: true,
        deletedAt: Timestamp.now(),
        text: "Bu mesaj silinmiştir."
      });
    } catch (error) {
      throw toAppError(error, "Mesaj silinirken hata oluştu.", "MSG_DELETE_ERR");
    }
  },

  restoreMessage: async (conversationId: string, messageId: string): Promise<void> => {
    try {
      const msgRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUB_COLLECTION, messageId);
      await updateDoc(msgRef, {
        isDeleted: false,
        deletedAt: null,
        text: "Bu mesaj geri yüklenmiştir."
      });
    } catch (error) {
      throw toAppError(error, "Mesaj geri yüklenirken hata oluştu.", "MSG_RESTORE_ERR");
    }
  },

  subscribeToMessages: (
    conversationId: string,
    limitCount: number,
    callback: (messages: IMessage[]) => void,
    onError: (err: unknown) => void
  ) => {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUB_COLLECTION),
      where("threadId", "==", null),
      firestoreLimit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(docToIMessage);
      msgs.sort((a, b) => timestampToMs(a.createdAt) - timestampToMs(b.createdAt));
      callback(msgs);
    }, (error) => {
      onError(toAppError(error, "Mesajlar yüklenemedi", "MSG_SYNC_ERR"));
    });
  },

  subscribeToThreadMessages: (
    conversationId: string,
    threadId: string,
    callback: (messages: IMessage[]) => void,
    onError: (err: unknown) => void
  ) => {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUB_COLLECTION),
      where("threadId", "==", threadId)
    );

    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(docToIMessage);
      msgs.sort((a, b) => timestampToMs(a.createdAt) - timestampToMs(b.createdAt));
      callback(msgs);
    }, (error) => {
      onError(toAppError(error, "Yanıtlar yüklenemedi", "MSG_THREAD_SYNC_ERR"));
    });
  },

  subscribeToConversations: (
    userId: string,
    callback: (conversations: IConversation[]) => void,
    onError: (err: unknown) => void
  ) => {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("participantIds", "array-contains", userId)
    );

    return onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(docToIConversation);
      convs.sort((a, b) => timestampToMs(b.updatedAt) - timestampToMs(a.updatedAt));
      callback(convs);
    }, (error) => {
      onError(toAppError(error, "Konuşmalar yüklenemedi", "MSG_CONV_SYNC_ERR"));
    });
  },

  getConversation: async (conversationId: string): Promise<IConversation> => {
    try {
      const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      const convSnap = await getDoc(convRef);
      if (!convSnap.exists()) throw new DatabaseError("Konuşma bulunamadı.");
      return { ...convSnap.data(), id: convSnap.id } as IConversation;
    } catch (error) {
      throw toAppError(error, "Konuşma detayları alınamadı.", "MSG_CONV_GET_ERR");
    }
  },

  subscribeToDeletedMessages: (
    callback: (messages: IMessage[]) => void,
    onError: (err: unknown) => void
  ) => {
    try {
      const q = query(
        collectionGroup(db, MESSAGES_SUB_COLLECTION),
        where("isDeleted", "==", true),
        orderBy("deletedAt", "desc"),
        firestoreLimit(100)
      );

      return onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(docToIMessage);
        callback(msgs);
      }, (error) => {
        onError(toAppError(error, "Arşiv yüklenemedi", "MSG_ARCHIVE_SYNC_ERR"));
      });
    } catch {
      onError(toAppError(new Error("Arşiv sorgusu için index gerekli. Firestore konsolunda collectionGroup(messages) için composite index oluşturun."), "Arşiv yüklenemedi. Index gerekli.", "MSG_ARCHIVE_INDEX_ERR"));
      return () => {};
    }
  },

  getDeletedMessages: async (): Promise<IMessage[]> => {
    try {
      const q = query(
        collectionGroup(db, MESSAGES_SUB_COLLECTION),
        where("isDeleted", "==", true),
        orderBy("deletedAt", "desc"),
        firestoreLimit(100)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docToIMessage);
    } catch {
      return [];
    }
  },
};
