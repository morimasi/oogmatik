
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { FeedbackItem, FeedbackStatus } from '../types';

const { collection, addDoc, query, getDocs, orderBy, updateDoc, doc, deleteDoc, where, limit: firestoreLimit } = firestore;

export type FeedbackPriority = 'low' | 'medium' | 'high' | 'urgent';

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
    adminReply: data.adminReply,
    priority: data.priority || 'medium',
    attachments: data.attachments || []
});

export const feedbackService = {
    submitFeedback: async (data: Omit<FeedbackItem, 'id' | 'timestamp' | 'status'>): Promise<void> => {
        const payload = {
            ...data,
            timestamp: new Date().toISOString(),
            status: 'new'
        };
        await addDoc(collection(db, "feedbacks"), payload);
    },

    getAllFeedbacks: async (_page: number, _pageSize: number): Promise<{ feedbacks: FeedbackItem[], count: number | null }> => {
        const q = query(collection(db, "feedbacks"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const feedbacks: FeedbackItem[] = [];
        querySnapshot.forEach((doc) => {
            feedbacks.push(mapDbFeedback(doc.data(), doc.id));
        });
        return { feedbacks, count: feedbacks.length };
    },

    getFeedbacksByUser: async (userId: string): Promise<FeedbackItem[]> => {
        if (!userId) return [];
        const q = query(
            collection(db, "feedbacks"),
            where("userId", "==", userId),
            orderBy("timestamp", "desc"),
            firestoreLimit(50)
        );
        const querySnapshot = await getDocs(q);
        const feedbacks: FeedbackItem[] = [];
        querySnapshot.forEach((doc) => {
            feedbacks.push(mapDbFeedback(doc.data(), doc.id));
        });
        return feedbacks;
    },

    updateFeedbackStatus: async (feedbackId: string, status: FeedbackStatus): Promise<void> => {
        const feedbackRef = doc(db, "feedbacks", feedbackId);
        await updateDoc(feedbackRef, { status });
    },

    submitReply: async (feedbackId: string, reply: string, resolve: boolean = false): Promise<void> => {
        const feedbackRef = doc(db, "feedbacks", feedbackId);
        await updateDoc(feedbackRef, { 
            adminReply: reply,
            status: resolve ? 'resolved' : 'replied'
        });
    },

    deleteFeedback: async (feedbackId: string): Promise<void> => {
        await deleteDoc(doc(db, "feedbacks", feedbackId));
    }
};
