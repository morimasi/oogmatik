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
} from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Message, MessageFile } from '../../../types';
import { useMessagesStore } from '../store/useMessagesStore';
import { useToastStore } from '../../../store/useToastStore';
import { v4 as uuidv4 } from 'uuid';

const MESSAGES_COLLECTION = 'messages';
const SOFT_DELETE_DAYS = 30;

export const messageService = {
  listenToMessages(userId: string, callback: (messages: Message[]) => void): () => void {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('participants', 'array-contains', userId),
      orderBy('timestamp', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        msgs.push(this.mapDoc(data, d.id));
      });
      callback(msgs);
    });
  },

  listenToContactMessages(
    userId: string,
    contactId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('participants', 'array-contains', userId),
      where('conversationId', '==', this.getConversationId(userId, contactId)),
      orderBy('timestamp', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        msgs.push(this.mapDoc(data, d.id));
      });
      callback(msgs);
    });
  },

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
        replyToMessageId: options?.replyToMessageId || null,
        quote: options?.quote || null,
        files: options?.files || [],
        isEdited: false,
        editedAt: null,
        isDeleted: false,
        deletedAt: null,
      };
      const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), msgData);
      return docRef.id;
    } catch (err) {
      useToastStore.getState().error('Mesaj gönderilemedi.');
      return null;
    }
  },

  async sendMessageWithFiles(
    senderId: string,
    receiverId: string,
    senderName: string,
    content: string,
    files: File[],
    options?: {
      replyToMessageId?: string;
      quote?: { messageId: string; senderId: string; senderName: string; content: string; timestamp: string };
    }
  ): Promise<boolean> {
    const store = useMessagesStore.getState();
    const toast = useToastStore.getState();

    try {
      store.setSending(true);
      const uploadedFiles: MessageFile[] = [];
      const storage = getStorage();

      for (const file of files) {
        const uploadId = uuidv4();
        store.addFileUpload({
          file,
          id: uploadId,
          progress: 0,
          status: 'uploading',
        });

        const storageRef = ref(storage, `message_files/${senderId}/${uploadId}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              store.updateFileUpload(uploadId, { progress, status: 'uploading' });
            },
            (error) => {
              store.updateFileUpload(uploadId, { status: 'error', error: error.message });
              reject(error);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedFiles.push({
                id: uploadId,
                name: file.name,
                type: file.type,
                url,
                size: file.size,
              });
              store.updateFileUpload(uploadId, { status: 'complete', downloadUrl: url });
              resolve();
            }
          );
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
      toast.error('Dosya yükleme başarısız.');
      return false;
    }
  },

  async editMessage(messageId: string, newContent: string): Promise<boolean> {
    try {
      const ref = doc(db, MESSAGES_COLLECTION, messageId);
      await updateDoc(ref, {
        content: newContent,
        isEdited: true,
        editedAt: Timestamp.now().toDate().toISOString(),
      });
      return true;
    } catch {
      useToastStore.getState().error('Mesaj düzenlenemedi.');
      return false;
    }
  },

  async deleteMessage(messageId: string, softDelete = true): Promise<boolean> {
    try {
      if (softDelete) {
        const ref = doc(db, MESSAGES_COLLECTION, messageId);
        await updateDoc(ref, {
          isDeleted: true,
          deletedAt: Timestamp.now().toDate().toISOString(),
          content: '[Bu mesaj silindi]',
        });
      } else {
        await deleteDoc(doc(db, MESSAGES_COLLECTION, messageId));
      }
      return true;
    } catch {
      useToastStore.getState().error('Mesaj silinemedi.');
      return false;
    }
  },

  async restoreMessage(messageId: string): Promise<boolean> {
    try {
      const ref = doc(db, MESSAGES_COLLECTION, messageId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return false;

      const data = snap.data();
      const deletedAt = data.deletedAt ? new Date(data.deletedAt) : null;
      const daysSinceDelete = deletedAt
        ? Math.floor((Date.now() - deletedAt.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      if (daysSinceDelete > SOFT_DELETE_DAYS) {
        useToastStore.getState().error('Geri yükleme süresi doldu (30 gün).');
        return false;
      }

      await updateDoc(ref, {
        isDeleted: false,
        deletedAt: null,
        content: data.originalContent || '[İçerik bulunamadı]',
      });
      useToastStore.getState().success('Mesaj geri yüklendi.');
      return true;
    } catch {
      useToastStore.getState().error('Geri yükleme başarısız.');
      return false;
    }
  },

  async clearConversation(
    userId: string,
    contactId: string
  ): Promise<boolean> {
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

  async deleteUploadedFile(fileUrl: string): Promise<boolean> {
    try {
      const storage = getStorage();
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
      return true;
    } catch {
      return false;
    }
  },

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
        ? (data.quote as { messageId: string; senderId: string; senderName: string; content: string; timestamp: string })
        : undefined,
      files: data.files ? (data.files as MessageFile[]) : undefined,
      isEdited: data.isEdited as boolean | undefined,
      editedAt: data.editedAt as string | undefined,
      isDeleted: data.isDeleted as boolean | undefined,
      deletedAt: data.deletedAt as string | undefined,
    };
  },
};
