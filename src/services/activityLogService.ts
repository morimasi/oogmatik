import { db } from './firebaseClient';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { TeacherActivityType } from '../types/teacher';

export const activityLogService = {
  logActivity: async (
    userId: string,
    type: TeacherActivityType,
    title: string,
    details: string,
    targetId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> => {
    try {
      await addDoc(collection(db, 'activity_logs'), {
        userId,
        type,
        title,
        details,
        targetId: targetId || '',
        metadata: metadata || {},
        createdAt: new Date().toISOString(),
      });
    } catch {
      // Silently fail — activity logging must never block the main flow
    }
  },

  getUserActivities: async (userId: string): Promise<{
    activities: any[];
    typeCounts: Record<string, number>;
  }> => {
    try {
      const snap = await getDocs(
        query(collection(db, 'activity_logs'), where('userId', '==', userId))
      );
      const activities = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const typeCounts: Record<string, number> = {};
      activities.forEach((a: any) => {
        typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
      });
      activities.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { activities, typeCounts };
    } catch {
      return { activities: [], typeCounts: {} };
    }
  },
};
