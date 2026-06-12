import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    onSnapshot, 
    serverTimestamp,
    Timestamp,
    updateDoc,
    doc,
    getDocs
} from 'firebase/firestore';
import { db } from './firebaseClient';
import { Message, Attachment } from '../types/messaging';
import { logError, logInfo } from '../utils/logger';

export const messagingService = {
    /**
     * Mesaj Dinleyicisi (Real-time)
     * Sadece son 50 mesajı çeker.
     */
    listenToMessages: (studentId: string, callback: (messages: Message[]) => void) => {
        try {
            const q = query(
                collection(db, `messages`),
                where('studentId', '==', studentId),
                orderBy('dbTimestamp', 'desc'),
                limit(50)
            );

            return onSnapshot(q, (snapshot) => {
                const messages: Message[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    messages.push({
                        id: doc.id,
                        ...data,
                        createdAt: data.dbTimestamp?.toDate?.().toISOString() || new Date().toISOString()
                    } as Message);
                });
                // UI için tarihe göre (eskiden yeniye) sırala
                callback(messages.reverse());
            }, (error) => {
                logError("Messaging listener error:", { error });
            });
        } catch (error) {
            logError("listenToMessages failed:", { error });
            return () => {};
        }
    },

    /**
     * Mesaj Gönder (Metin ve/veya Eklenti)
     */
    sendMessage: async (params: {
        studentId: string;
        senderId: string;
        senderName: string;
        senderRole: 'teacher' | 'parent';
        text?: string;
        attachment?: Attachment;
    }) => {
        try {
            const messageData = {
                ...params,
                dbTimestamp: serverTimestamp(),
                isRead: false,
                readBy: [params.senderId]
            };

            const docRef = await addDoc(collection(db, 'messages'), messageData);
            logInfo("Mesaj gönderildi:", { messageId: docRef.id });
            return docRef.id;
        } catch (error) {
            logError("sendMessage failed:", { error });
            throw error;
        }
    },

    /**
     * Mesajı Okundu Olarak İşaretle
     */
    markAsRead: async (messageId: string, userId: string) => {
        try {
            const docRef = doc(db, 'messages', messageId);
            await updateDoc(docRef, {
                isRead: true,
                readBy: serverTimestamp() // Basit bir dizi yönetimi veya son okuyan bilgisi
            });
        } catch (error) {
            logError("markAsRead failed:", { error });
        }
    }
};
