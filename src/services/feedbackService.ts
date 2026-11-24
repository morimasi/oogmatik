import { db } from './firebaseClient';
import * as firestore from 'firebase/firestore';
import { FeedbackItem, FeedbackStatus, FeedbackCategory, FeedbackPriority } from '../types';

const {
  collection,
  addDoc,
  query,
  getDocs,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
  where,
  writeBatch,
  limit: firestoreLimit,
} = firestore;

export type { FeedbackPriority };

const mapDbFeedback = (data: Record<string, unknown>, id: string): FeedbackItem => ({
  id,
  userId: typeof data.userId === 'string' ? data.userId : undefined,
  userName: typeof data.userName === 'string' ? data.userName : 'Misafir',
  userEmail: typeof data.userEmail === 'string' ? data.userEmail : undefined,
  activityType: typeof data.activityType === 'string' ? data.activityType : 'Genel',
  activityTitle: typeof data.activityTitle === 'string' ? data.activityTitle : 'Genel Bildirim',
  rating: typeof data.rating === 'number' ? data.rating : 0,
  category: (typeof data.category === 'string' ? data.category : 'general') as FeedbackCategory,
  message: typeof data.message === 'string' ? data.message : '',
  timestamp: typeof data.timestamp === 'string' ? data.timestamp : new Date().toISOString(),
  status: (typeof data.status === 'string' ? data.status : 'new') as FeedbackStatus,
  adminReply: typeof data.adminReply === 'string' ? data.adminReply : undefined,
  priority: (typeof data.priority === 'string' ? data.priority : 'medium') as FeedbackPriority,
  attachments: Array.isArray(data.attachments)
    ? data.attachments.filter((a): a is string => typeof a === 'string')
    : [],
});

export const feedbackService = {
  submitFeedback: async (data: Omit<FeedbackItem, 'id' | 'timestamp' | 'status'>): Promise<void> => {
    const payload = {
      ...data,
      priority: data.priority || (data.category === 'bug' ? 'high' : 'medium'),
      timestamp: new Date().toISOString(),
      status: 'new',
    };
    await addDoc(collection(db, 'feedbacks'), payload);
  },

  getAllFeedbacks: async (
    _page: number,
    _pageSize: number
  ): Promise<{ feedbacks: FeedbackItem[]; count: number | null }> => {
    const q = query(collection(db, 'feedbacks'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const feedbacks: FeedbackItem[] = [];
    querySnapshot.forEach((docSnap) => {
      feedbacks.push(mapDbFeedback(docSnap.data() as Record<string, unknown>, docSnap.id));
    });
    return { feedbacks, count: feedbacks.length };
  },

  getFeedbacksByUser: async (userId: string): Promise<FeedbackItem[]> => {
    if (!userId) return [];
    const q = query(
      collection(db, 'feedbacks'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      firestoreLimit(50)
    );
    const querySnapshot = await getDocs(q);
    const feedbacks: FeedbackItem[] = [];
    querySnapshot.forEach((docSnap) => {
      feedbacks.push(mapDbFeedback(docSnap.data() as Record<string, unknown>, docSnap.id));
    });
    return feedbacks;
  },

  updateFeedbackStatus: async (feedbackId: string, status: FeedbackStatus): Promise<void> => {
    const feedbackRef = doc(db, 'feedbacks', feedbackId);
    await updateDoc(feedbackRef, { status, updatedAt: new Date().toISOString() });
  },

  updateFeedbackPriority: async (feedbackId: string, priority: FeedbackPriority): Promise<void> => {
    const feedbackRef = doc(db, 'feedbacks', feedbackId);
    await updateDoc(feedbackRef, { priority, updatedAt: new Date().toISOString() });
  },

  submitReply: async (feedbackId: string, reply: string, resolve: boolean = false): Promise<void> => {
    const feedbackRef = doc(db, 'feedbacks', feedbackId);
    await updateDoc(feedbackRef, {
      adminReply: reply,
      status: resolve ? 'resolved' : 'replied',
      repliedAt: new Date().toISOString(),
    });
  },

  deleteFeedback: async (feedbackId: string): Promise<void> => {
    await deleteDoc(doc(db, 'feedbacks', feedbackId));
  },

  bulkUpdateStatus: async (ids: string[], status: FeedbackStatus): Promise<void> => {
    if (ids.length === 0) return;
    const batch = writeBatch(db);
    const updatedAt = new Date().toISOString();
    ids.forEach((id) => {
      batch.update(doc(db, 'feedbacks', id), { status, updatedAt });
    });
    await batch.commit();
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    if (ids.length === 0) return;
    const batch = writeBatch(db);
    ids.forEach((id) => {
      batch.delete(doc(db, 'feedbacks', id));
    });
    await batch.commit();
  },
};
