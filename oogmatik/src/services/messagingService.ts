
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { FeedbackItem, Message, User, FeedbackStatus } from '../types';

const { collection, addDoc, query, where, getDocs, orderBy, updateDoc, doc, deleteDoc, writeBatch } = firestore;

const mapDbFeedback = (data: any, id: string): FeedbackItem => ({
    id: id,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    activityType: data.activityType,
    activityTitle: data.activityTitle,
    rating: data.rating,
    category: data.category || 'general',
    message: data.message,
    timestamp: data.timestamp,
    status: data.status || 'new',
    adminReply: data.adminReply
});

export const mapDbMessage = (data: any, id?: string): Message => ({
    id: id || data.id || 'temp-id',
    senderId: data.senderId,
    receiverId: data.receiverId,
    senderName: data.senderName,
    content: data.content,
    timestamp: data.timestamp,
    isRead: data.isRead,
    relatedFeedbackId: data.relatedFeedbackId
});

export const messagingService = {
    submitFeedback: async (data: Omit<FeedbackItem, 'id' | 'timestamp' | 'status'>): Promise<void> => {
        const payload = {
            ...data,
            timestamp: new Date().toISOString(),
            status: 'new'
        };
        await addDoc(collection(db, "feedbacks"), payload);
    },

    getAllFeedbacks: async (page: number, pageSize: number): Promise<{ feedbacks: FeedbackItem[], count: number | null }> => {
        const q = query(collection(db, "feedbacks"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const feedbacks: FeedbackItem[] = [];
        querySnapshot.forEach((doc) => {
            feedbacks.push(mapDbFeedback(doc.data(), doc.id));
        });
        return { feedbacks, count: feedbacks.length };
    },

    // --- ADMIN FEEDBACK ACTIONS ---

    updateFeedbackStatus: async (feedbackId: string, status: FeedbackStatus): Promise<void> => {
        const feedbackRef = doc(db, "feedbacks", feedbackId);
        await updateDoc(feedbackRef, { status });
    },

    deleteFeedback: async (feedbackId: string): Promise<void> => {
        await deleteDoc(doc(db, "feedbacks", feedbackId));
    },

    replyToFeedback: async (feedbackId: string, replyMessage: string, adminUser: User): Promise<void> => {
        const feedbackRef = doc(db, "feedbacks", feedbackId);
        await updateDoc(feedbackRef, { status: 'replied', adminReply: replyMessage });
        
        // Also send as a direct message if user exists
        // This allows the user to see the reply in their inbox
    },

    // --- MESSAGING ---

    sendMessage: async (msgData: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Promise<Message> => {
        const payload = {
            ...msgData,
            timestamp: new Date().toISOString(),
            isRead: false
        };

        const docRef = await addDoc(collection(db, "messages"), payload);
        return mapDbMessage(payload, docRef.id);
    },

    getMessagesForUser: async (userId: string): Promise<Message[]> => {
        // Workaround for missing 'or' operator in older SDKs or type defs
        const sentQuery = query(
            collection(db, "messages"), 
            where("senderId", "==", userId)
        );
        const receivedQuery = query(
            collection(db, "messages"), 
            where("receiverId", "==", userId)
        );

        const [sentSnap, receivedSnap] = await Promise.all([getDocs(sentQuery), getDocs(receivedQuery)]);
        
        const messagesMap = new Map<string, Message>();
        
        const processDoc = (doc: any) => {
            const data = doc.data();
            const msg = mapDbMessage(data, doc.id);
            messagesMap.set(msg.id, msg);
        };

        sentSnap.forEach(processDoc);
        receivedSnap.forEach(processDoc);

        return Array.from(messagesMap.values()).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    },

    getUnreadCount: async (userId: string): Promise<number> => {
        const q = query(
            collection(db, "messages"), 
            where("receiverId", "==", userId), 
            where("isRead", "==", false)
        );
        const snapshot = await getDocs(q);
        return snapshot.size;
    },

    markAsRead: async (messageId: string) => {
        await updateDoc(doc(db, "messages", messageId), { isRead: true });
    },

    deleteMessage: async (messageId: string) => {
        await deleteDoc(doc(db, "messages", messageId));
    },

    clearConversation: async (userId: string, contactId: string) => {
        const q1 = query(
            collection(db, "messages"),
            where("senderId", "==", userId),
            where("receiverId", "==", contactId)
        );
        const q2 = query(
            collection(db, "messages"),
            where("senderId", "==", contactId),
            where("receiverId", "==", userId)
        );

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        
        const batch = writeBatch(db);
        let count = 0;

        snap1.forEach((doc) => { batch.delete(doc.ref); count++; });
        snap2.forEach((doc) => { batch.delete(doc.ref); count++; });

        if (count > 0) {
            await batch.commit();
        }
    }
};
