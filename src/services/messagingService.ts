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
    getDocs,
    arrayUnion
} from 'firebase/firestore';
import { db } from './firebaseClient';
import { Message, Attachment } from '../types/messaging';
import { logError, logInfo } from '../utils/logger';

export const messagingService = {
    /**
     * Mesaj Dinleyicisi (Real-time)
     * Opsiyonel filtreler: studentId (öğrenci odaklı) veya participantIds (ikili sohbet)
     */
    listenToMessages: (params: { studentId?: string; participantIds?: string[] }, callback: (messages: Message[]) => void) => {
        try {
            let q;
            
            if (params.participantIds) {
                // İkili sohbet: Her iki katılımcının da içinde olduğu mesajlar
                q = query(
                    collection(db, `messages`),
                    where('participantIds', 'array-contains', params.participantIds[0]),
                    orderBy('dbTimestamp', 'desc'),
                    limit(50)
                );
            } else if (params.studentId) {
                q = query(
                    collection(db, `messages`),
                    where('studentId', '==', params.studentId),
                    orderBy('dbTimestamp', 'desc'),
                    limit(50)
                );
            } else {
                // Genel Duyurular / Sistem Kanalları
                q = query(
                    collection(db, `messages`),
                    where('isGlobal', '==', true),
                    orderBy('dbTimestamp', 'desc'),
                    limit(50)
                );
            }

            return onSnapshot(q, (snapshot) => {
                const messages: Message[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data({ serverTimestamps: 'estimate' });
                    
                    // İkili sohbet filtresi (Firestore array-contains kısıtlaması nedeniyle manuel çift yönlü kontrol)
                    if (params.participantIds) {
                        const messageParticipants = data.participantIds || [];
                        const isRelevant = params.participantIds.every(id => messageParticipants.includes(id));
                        if (!isRelevant) return;
                    }

                    messages.push({
                        id: doc.id,
                        ...data,
                        createdAt: data.dbTimestamp?.toDate?.().toISOString() || new Date().toISOString()
                    } as Message);
                });

                // Firestore bazen yerel yazmalarda pending serverTimestamp() içerenlere null muamelesi yapıp snapshot sonuna iter.
                // Bu yüzden snapshot sırasına güvenmek yerine "createdAt" e göre kronolojik artan (eskiden yeniye) sıralıyoruz.
                messages.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
                
                callback(messages);
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
        studentId?: string;
        participantIds?: string[];
        senderId: string;
        senderName: string;
        senderRole: 'teacher' | 'parent' | 'admin';
        text?: string;
        attachment?: Attachment;
        isGlobal?: boolean;
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
     * Mesaj Sil
     */
    deleteMessage: async (messageId: string) => {
        try {
            const { deleteDoc } = await import('firebase/firestore');
            await deleteDoc(doc(db, 'messages', messageId));
            logInfo("Mesaj silindi:", { messageId });
        } catch (error) {
            logError("deleteMessage failed:", { error });
            throw error;
        }
    },

    /**
     * Mesajı Okundu Olarak İşaretle (userId'yi readBy dizisine atomic ekler)
     */
    markAsRead: async (messageId: string, userId: string) => {
        try {
            const docRef = doc(db, 'messages', messageId);
            await updateDoc(docRef, {
                isRead: true,
                readBy: arrayUnion(userId)
            });
        } catch (error) {
            logError("markAsRead failed:", { error });
        }
    },

    /**
     * Okunmamış Mesaj Sayısı - Gerçek Zamanlı Listener
     * Kullanıcıya gelen ama readBy dizisinde userId'si olmayan mesajları sayar.
     */
    listenToUnreadCount: (userId: string, callback: (count: number) => void) => {
        try {
            // Kendisine ait olmayan tüm mesajlarda okunmamışları say
            const q = query(
                collection(db, 'messages'),
                where('readBy', 'not-in', [[userId]]),
                limit(100)
            );

            return onSnapshot(q, (snapshot) => {
                let count = 0;
                snapshot.forEach((docSnap) => {
                    const data = docSnap.data({ serverTimestamps: 'estimate' });
                    // Kendisi tarafından gönderilmemiş ve readBy'da userId yoksa okunmamış
                    if (data.senderId !== userId) {
                        const readBy: string[] = data.readBy || [];
                        if (!readBy.includes(userId)) count++;
                    }
                });
                callback(count);
            }, (error) => {
                logError('listenToUnreadCount error:', { error });
                callback(0);
            });
        } catch (error) {
            logError('listenToUnreadCount failed:', { error });
            return () => {};
        }
    },

    /**
     * Uygulama İçi Kullanıcıları Getir (Kişiler Listesi)
     */
    fetchInternalUsers: async (excludeUserId: string) => {
        try {
            const q = query(collection(db, 'users'), limit(100));
            const snapshot = await getDocs(q);
            const users: any[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (doc.id !== excludeUserId) {
                    users.push({
                        id: doc.id,
                        name: data.name || data.displayName || 'İsimsiz Kullanıcı',
                        role: data.role || 'teacher',
                        avatar: data.avatar || data.photoURL || '',
                        isOnline: data.isOnline || false
                    });
                }
            });
            return users;
        } catch (error) {
            logError("fetchInternalUsers failed:", { error });
            return [];
        }
    }
};
