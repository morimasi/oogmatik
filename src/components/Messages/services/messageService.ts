import { db } from '../../../services/firebaseClient';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  Timestamp,
  limit,
  startAfter,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import type { Message, MessageFile, MessageEditHistoryEntry } from '../../../types';
import { useMessagesStore } from '../store/useMessagesStore';
import { useToastStore } from '../../../store/useToastStore';
import { uploadFileToStorage, deleteFileFromStorage } from './fileUploadService';

const MESSAGES_COLLECTION = 'messages';
const SOFT_DELETE_DAYS = 30;
const PAGE_SIZE = 60;

/** Basit retry utility — ağ kesintilerinde 3 deneme yapar */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 800): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < retries - 1) await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}

export const messageService = {
  /** Tüm mesajları gerçek zamanlı dinle */
  listenToMessages(userId: string, callback: (messages: Message[]) => void): () => void {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('participants', 'array-contains', userId),
      orderBy('timestamp', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((d) => msgs.push(this.mapDoc(d.data(), d.id)));
      callback(msgs);
    });
  },

  /** Belirli bir konuşmayı gerçek zamanlı dinle */
  listenToContactMessages(
    userId: string,
    contactId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('participants', 'array-contains', userId),
      where('conversationId', '==', this.getConversationId(userId, contactId)),
      orderBy('timestamp', 'asc'),
      limit(PAGE_SIZE)
    );
    return onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((d) => msgs.push(this.mapDoc(d.data(), d.id)));
      callback(msgs);
    });
  },

  /** Eski mesajları yükle (pagination) */
  async loadOlderMessages(
    userId: string,
    contactId: string,
    lastDoc: QueryDocumentSnapshot<DocumentData>
  ): Promise<Message[]> {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('participants', 'array-contains', userId),
        where('conversationId', '==', this.getConversationId(userId, contactId)),
        orderBy('timestamp', 'asc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => this.mapDoc(d.data(), d.id));
    } catch {
      return [];
    }
  },

  /** Mesaj gönder — retry mekanizması ile */
  async sendMessage(
    senderId: string,
    receiverId: string,
    senderName: string,
    content: string,
    options?: {
      replyToMessageId?: string;
      quote?: { messageId: string; senderId: string; senderName: string; content: string; timestamp: string };
      files?: MessageFile[];
    }
  ): Promise<string | null> {
    try {
      const conversationId = this.getConversationId(senderId, receiverId);
      const msgData = {
        senderId,
        receiverId,
        senderName,
        content,
        participants: [senderId, receiverId],
        conversationId,
        timestamp: Timestamp.now().toDate().toISOString(),
        isRead: false,
        replyToMessageId: options?.replyToMessageId ?? null,
        quote: options?.quote ?? null,
        files: options?.files ?? [],
        isEdited: false,
        editedAt: null,
        editHistory: [],
        isDeleted: false,
        deletedAt: null,
        originalContent: null,
      };
      const docRef = await withRetry(() => addDoc(collection(db, MESSAGES_COLLECTION), msgData));
      return docRef.id;
    } catch {
      useToastStore.getState().error('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
      return null;
    }
  },

  /** Dosya(lar) ile mesaj gönder */
  async sendMessageWithFiles(
    senderId: string,
    receiverId: string,
    senderName: string,
    content: string,
    files: File[],
    options?: {
      replyToMessageId?: string;
      quote?: { messageId: string; senderId: string; senderName: string; content: string; timestamp: string };
    },
    onFileProgress?: (uploadId: string, progress: number) => void
  ): Promise<boolean> {
    const store = useMessagesStore.getState();
    const toast = useToastStore.getState();

    try {
      store.setSending(true);
      const uploadedFiles: MessageFile[] = [];

      for (const file of files) {
        const result = await uploadFileToStorage(file, senderId, onFileProgress);
        if (!result) {
          toast.error(`${file.name} yüklenemedi.`);
          // Kalan dosyalar için devam et
          continue;
        }
        uploadedFiles.push({
          id: result.id,
          name: result.name,
          type: result.type,
          url: result.url,
          size: result.size,
          thumbnailUrl: result.thumbnailUrl,
          mimeCategory: result.mimeCategory,
        });
      }

      const msgId = await this.sendMessage(senderId, receiverId, senderName, content, {
        ...options,
        files: uploadedFiles,
      });

      store.clearFileUploads();
      store.setSending(false);
      return !!msgId;
    } catch {
      store.setSending(false);
      toast.error('Dosya gönderimi başarısız. Bağlantınızı kontrol edin.');
      return false;
    }
  },

  /** Mesajı düzenle — düzenleme geçmişini koru */
  async editMessage(messageId: string, newContent: string): Promise<boolean> {
    try {
      const ref = doc(db, MESSAGES_COLLECTION, messageId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return false;

      const data = snap.data();
      const prevHistory: MessageEditHistoryEntry[] = (data.editHistory ?? []) as MessageEditHistoryEntry[];
      const newEntry: MessageEditHistoryEntry = {
        content: data.content as string,
        editedAt: new Date().toISOString(),
      };

      await withRetry(() =>
        updateDoc(ref, {
          content: newContent,
          isEdited: true,
          editedAt: Timestamp.now().toDate().toISOString(),
          editHistory: [...prevHistory, newEntry].slice(-10), // Son 10 düzenleme
        })
      );
      return true;
    } catch {
      useToastStore.getState().error('Mesaj düzenlenemedi.');
      return false;
    }
  },

  /** Soft / hard delete */
  async deleteMessage(messageId: string, softDelete = true): Promise<boolean> {
    try {
      if (softDelete) {
        const ref = doc(db, MESSAGES_COLLECTION, messageId);
        const snap = await getDoc(ref);
        const originalContent = snap.exists() ? (snap.data().content as string) : '';
        await withRetry(() =>
          updateDoc(ref, {
            isDeleted: true,
            deletedAt: Timestamp.now().toDate().toISOString(),
            content: '[Bu mesaj silindi]',
            originalContent,
          })
        );
      } else {
        await withRetry(() => deleteDoc(doc(db, MESSAGES_COLLECTION, messageId)));
      }
      return true;
    } catch {
      useToastStore.getState().error('Mesaj silinemedi.');
      return false;
    }
  },

  /** 30 gün içinde geri yükleme */
  async restoreMessage(messageId: string): Promise<boolean> {
    try {
      const ref = doc(db, MESSAGES_COLLECTION, messageId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return false;

      const data = snap.data();
      const deletedAt = data.deletedAt ? new Date(data.deletedAt as string) : null;
      const daysSinceDelete = deletedAt
        ? Math.floor((Date.now() - deletedAt.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      if (daysSinceDelete > SOFT_DELETE_DAYS) {
        useToastStore.getState().error('Geri yükleme süresi doldu (30 gün).');
        return false;
      }

      await withRetry(() =>
        updateDoc(ref, {
          isDeleted: false,
          deletedAt: null,
          content: (data.originalContent as string) || '[İçerik bulunamadı]',
          originalContent: null,
        })
      );
      useToastStore.getState().success('Mesaj geri yüklendi.');
      return true;
    } catch {
      useToastStore.getState().error('Geri yükleme başarısız.');
      return false;
    }
  },

  /** Konuşmayı temizle (soft delete) */
  async clearConversation(userId: string, contactId: string): Promise<boolean> {
    try {
      const conversationId = this.getConversationId(userId, contactId);
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId)
      );
      const snapshot = await getDocs(q);
      const now = Timestamp.now().toDate().toISOString();

      const updates = snapshot.docs.map((d) =>
        updateDoc(doc(db, MESSAGES_COLLECTION, d.id), {
          isDeleted: true,
          deletedAt: now,
          content: '[Bu mesaj silindi]',
          originalContent: (d.data().content as string) || '',
        })
      );
      await Promise.all(updates);
      useToastStore.getState().success('Konuşma temizlendi.');
      return true;
    } catch {
      useToastStore.getState().error('Konuşma temizlenemedi.');
      return false;
    }
  },

  /** Toplu okundu işaretle */
  async markAsRead(messageIds: string[]): Promise<void> {
    try {
      const updates = messageIds.map((id) =>
        updateDoc(doc(db, MESSAGES_COLLECTION, id), { isRead: true })
      );
      await Promise.all(updates);
    } catch {
      // silent fail
    }
  },

  /** Okunmamış mesaj sayısı */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('receiverId', '==', userId),
        where('isRead', '==', false),
        where('isDeleted', '==', false)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch {
      return 0;
    }
  },

  /** Yüklü dosyayı sil */
  deleteUploadedFile: deleteFileFromStorage,

  getConversationId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  },

  mapDoc(data: Record<string, unknown>, id: string): Message {
    return {
      id,
      senderId: data.senderId as string,
      receiverId: data.receiverId as string,
      senderName: data.senderName as string,
      content: data.content as string,
      timestamp: data.timestamp as string,
      isRead: data.isRead as boolean,
      replyToMessageId: data.replyToMessageId as string | undefined,
      quote: data.quote
        ? (data.quote as {
            messageId: string;
            senderId: string;
            senderName: string;
            content: string;
            timestamp: string;
          })
        : undefined,
      files: data.files ? (data.files as MessageFile[]) : undefined,
      isEdited: data.isEdited as boolean | undefined,
      editedAt: data.editedAt as string | undefined,
      editHistory: data.editHistory as MessageEditHistoryEntry[] | undefined,
      isDeleted: data.isDeleted as boolean | undefined,
      deletedAt: data.deletedAt as string | undefined,
      originalContent: data.originalContent as string | undefined,
    };
  },
};
