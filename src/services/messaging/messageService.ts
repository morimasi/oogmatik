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
    } catch (error) {
      throw new DatabaseError("Mesaj gönderilemedi.", error instanceof Error ? error : undefined);
    }
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
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUB_COLLECTION),
      where("threadId", "==", null), // Ana mesajları getirir
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => d.data() as IMessage);
      // Mesajları tersine çevir ki en altta en yeni mesaj görünsün
      callback(msgs.reverse());
    }, (error) => {
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
      where("threadId", "==", threadId),
      orderBy("createdAt", "asc") // Yanıtlar kronolojik gelsin
    );

    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => d.data() as IMessage);
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
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("participantIds", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(d => d.data() as IConversation);
      callback(convs);
    }, (error) => {
      onError(toAppError(error, "Konuşmalar yüklenemedi", "MSG_CONV_SYNC_ERR"));
    });
  }
};
