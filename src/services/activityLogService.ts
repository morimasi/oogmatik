import { db } from './firebaseClient';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { TeacherActivityType } from '../types/teacher';
import { logError } from '../utils/logger';

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
    } catch (e) {
      logError('Aktivite logu kaydedilemedi', { error: e instanceof Error ? e.message : String(e) });
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
    } catch (e) {
      logError('Aktivite logları okunamadı', { error: e instanceof Error ? e.message : String(e) });
      return { activities: [], typeCounts: {} };
    }
  },
};
