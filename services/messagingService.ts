import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { FeedbackItem, Message, User } from '../types';

const { collection, addDoc, query, where, getDocs, orderBy, updateDoc, doc } = firestore;

const mapDbFeedback = (data: any, id: string): FeedbackItem => ({
    id: id,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    activityType: data.activityType,
    activityTitle: data.activityTitle,
    rating: data.rating,
    message: data.message,
    timestamp: data.timestamp,
    status: data.status,
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

    replyToFeedback: async (feedbackId: string, replyMessage: string, adminUser: User): Promise<void> => {
        const feedbackRef = doc(db, "feedbacks", feedbackId);
        await updateDoc(feedbackRef, { status: 'replied', adminReply: replyMessage });
        
        // Fetch feedback to get user ID
        // In a real app we might just read the doc snapshot here or pass the userId
    },

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
    }
};