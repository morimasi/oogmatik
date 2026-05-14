import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  startAfter,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebaseClient";
import { IMessage, IConversation } from "../../types/messaging";
import { toAppError, DatabaseError, InternalServerError } from "../../utils/AppError";

const CONVERSATIONS_COLLECTION = "conversations";
const MESSAGES_SUB_COLLECTION = "messages";

export const messageService = {
  /**
   * Yeni bir konuşma başlatır (Birebir veya Grup)
   */
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

  /**
   * Mesaj gönderir
   */
  sendMessage: async (messageData: Omit<IMessage, "id" | "isDeleted" | "createdAt" | "updatedAt" | "readBy">): Promise<string> => {
    let retryCount = 0;
    const maxRetries = 2;

    const executeSend = async (): Promise<string> => {
      try {
        const msgRef = doc(collection(db, CONVERSATIONS_COLLECTION, messageData.conversationId, MESSAGES_SUB_COLLECTION));
        
        const newMessage: IMessage = {
          ...messageData,
          id: msgRef.id,
          isDeleted: false,
          readBy: {},
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        await setDoc(msgRef, newMessage);
        
        // Update Son mesaj referansını (Denormalization)
        const convRef = doc(db, CONVERSATIONS_COLLECTION, messageData.conversationId);
        await updateDoc(convRef, {
          updatedAt: Timestamp.now(),
          lastMessage: {
            id: msgRef.id,
            text: messageData.text || (messageData.attachments && messageData.attachments.length > 0 ? "📎 Dosya gönderildi" : ""),
            senderId: messageData.senderId,
            createdAt: newMessage.createdAt
          }
        });
        
        return msgRef.id;
      } catch (error: any) {
        if (retryCount < maxRetries) {
          retryCount++;
          console.warn(`Mesaj gönderimi yeniden deneniyor (${retryCount}/${maxRetries})...`);
          await new Promise(res => setTimeout(res, 1000 * retryCount));
          return executeSend();
        }
        console.error("Firestore sendMessage Hatası:", error);
        throw toAppError(error, "Mesaj gönderilemedi.", "MSG_SEND_ERR");
      }
    };

    return executeSend();
  },

  /**
   * Mesaj düzenler
   */
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

  /**
   * Mesajı soft-delete ile siler
   */
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

  subscribeToMessages: (
    conversationId: string, 
    limitCount: number, 
    callback: (messages: IMessage[]) => void, 
    onError: (err: unknown) => void
  ) => {
    // Karmaşık index hatasını önlemek için orderBy geçici olarak kaldırıldı ve client-side sort eklendi
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUB_COLLECTION),
      where("threadId", "==", null),
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      let msgs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as IMessage);
      
      // Client-side sort: En yeni en altta (asc)
      msgs.sort((a, b) => {
        const aTime = (a.createdAt as any)?.toMillis?.() || (a.createdAt as any)?.seconds * 1000 || 0;
        const bTime = (b.createdAt as any)?.toMillis?.() || (b.createdAt as any)?.seconds * 1000 || 0;
        return aTime - bTime;
      });
      
      callback(msgs);
    }, (error: any) => {
      console.error("Firestore Mesaj Hatası Detay:", error.code, error.message);
      onError(toAppError(error, "Mesajlar yüklenemedi", "MSG_SYNC_ERR"));
    });
  },

  /**
   * Thread mesajlarını dinler
   */
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
      let msgs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as IMessage);
      msgs.sort((a, b) => {
        const aTime = (a.createdAt as any)?.toMillis?.() || (a.createdAt as any)?.seconds * 1000 || 0;
        const bTime = (b.createdAt as any)?.toMillis?.() || (b.createdAt as any)?.seconds * 1000 || 0;
        return aTime - bTime;
      });
      callback(msgs);
    }, (error) => {
      onError(toAppError(error, "Yanıtlar yüklenemedi", "MSG_THREAD_SYNC_ERR"));
    });
  },

  /**
   * Kullanıcının dahil olduğu konuşmaları dinler
   */
  subscribeToConversations: (
    userId: string,
    callback: (conversations: IConversation[]) => void,
    onError: (err: unknown) => void
  ) => {
    // Karmaşık index (array-contains + orderBy) hatasını önlemek için orderBy kaldırıldı
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("participantIds", "array-contains", userId)
    );

    return onSnapshot(q, (snapshot) => {
      let convs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as IConversation);
      
      // Client-side sort: En yeni güncelleme en üstte
      convs.sort((a, b) => {
        const aTime = (a.updatedAt as any)?.toMillis?.() || (a.updatedAt as any)?.seconds * 1000 || 0;
        const bTime = (b.updatedAt as any)?.toMillis?.() || (b.updatedAt as any)?.seconds * 1000 || 0;
        return bTime - aTime;
      });
      
      callback(convs);
    }, (error: any) => {
      console.error("Firestore Sohbet Hatası Detay:", error.code, error.message);
      onError(toAppError(error, "Konuşmalar yüklenemedi", "MSG_CONV_SYNC_ERR"));
    });
  }
};
