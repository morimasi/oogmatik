import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  writeBatch,
  increment,
  db
} from './firebaseClient';
import { 
  ActivityCompletion, 
  StudentProgressSnapshot, 
  SkillScore 
} from '../types/progress';
import { AppError } from '../utils/AppError';
import { logError } from '../utils/errorHandler';

/**
 * Öğrenci İlerleme Servisi (Faz 4.1)
 * Elif Yıldız: Pedagojik gelişim takibi
 * Selin Arslan: AI tabanlı analiz entegrasyonu
 */
export const progressService = {
  /**
   * Bir aktivite tamamlandığında veriyi kaydeder
   */
  logActivityCompletion: async (completion: ActivityCompletion): Promise<void> => {
    try {
      const studentId = completion.studentId;
      const completionId = completion.id || doc(collection(db, 'temp')).id;
      
      // 1. Aktiviteyi geçmişe ekle
      const historyRef = doc(db, 'students', studentId, 'progress_history', completionId);
      await setDoc(historyRef, {
        ...completion,
        timestamp: completion.timestamp || new Date().toISOString()
      });

      // 2. Snapshot'ı tetikle veya güncelle (burada asenkron olarak basitleştirdik)
      await progressService.updateProgressSnapshot(studentId, completion);
    } catch (error) {
      logError(new AppError('İlerleme kaydedilemedi', 'PROGRESS_SAVE_ERROR'), { context: 'logActivityCompletion', error });
      throw error;
    }
  },

  /**
   * Öğrencinin ilerleme özetini (snapshot) günceller
   */
  updateProgressSnapshot: async (studentId: string, latestCompletion: ActivityCompletion): Promise<void> => {
    try {
      const snapshotRef = doc(db, 'students', studentId, 'progress_summary', 'current');
      const snapshotDoc = await getDoc(snapshotRef);
      
      let snapshot: StudentProgressSnapshot;

      if (snapshotDoc.exists()) {
        const currentData = snapshotDoc.data() as StudentProgressSnapshot;
        
        // Mevcut veriyi güncelle
        snapshot = {
          ...currentData,
          overallScore: Math.round((currentData.overallScore * currentData.activitiesCompleted + latestCompletion.score) / (currentData.activitiesCompleted + 1)),
          totalTimeSpent: currentData.totalTimeSpent + (latestCompletion.duration / 3600),
          activitiesCompleted: currentData.activitiesCompleted + 1,
          lastUpdated: new Date().toISOString(),
          // Basit bir şekilde son 5 aktiviteyi tutalım
          recentActivities: [latestCompletion, ...currentData.recentActivities.slice(0, 4)]
        };
        
        // Beceri bazlı dağılımı güncelle (basitleştirilmiş)
        const activityCategory = latestCompletion.activityType; // Veya bir map kullanılabilir
        const skillIndex = snapshot.skillDistribution.findIndex(s => s.category === activityCategory);
        
        if (skillIndex > -1) {
          const s = snapshot.skillDistribution[skillIndex];
          s.score = Math.round((s.score * s.totalActivities + latestCompletion.score) / (s.totalActivities + 1));
          s.totalActivities += 1;
          s.lastTested = latestCompletion.timestamp;
          s.trend = latestCompletion.score >= s.score ? 'up' : 'down';
        } else {
          snapshot.skillDistribution.push({
            category: activityCategory,
            score: latestCompletion.score,
            totalActivities: 1,
            lastTested: latestCompletion.timestamp,
            trend: 'stable'
          });
        }
      } else {
        // İlk kez snapshot oluştur
        snapshot = {
          studentId,
          overallScore: latestCompletion.score,
          totalTimeSpent: latestCompletion.duration / 3600,
          activitiesCompleted: 1,
          skillDistribution: [{
            category: latestCompletion.activityType,
            score: latestCompletion.score,
            totalActivities: 1,
            lastTested: latestCompletion.timestamp,
            trend: 'stable'
          }],
          weeklyActivity: [], // Periyodik bir job ile doldurulabilir
          recentActivities: [latestCompletion],
          achievements: [],
          lastUpdated: new Date().toISOString()
        };
      }

      await setDoc(snapshotRef, snapshot);
    } catch (error) {
      logError(new AppError('Snapshot güncellenemedi', 'SNAPSHOT_UPDATE_ERROR'), { context: 'updateProgressSnapshot', error });
    }
  },

  /**
   * Dashboard için hazır veriyi döner
   */
  getStudentProgress: async (studentId: string): Promise<StudentProgressSnapshot | null> => {
    try {
      const snapshotRef = doc(db, 'students', studentId, 'progress_summary', 'current');
      const snapshotDoc = await getDoc(snapshotRef);
      
      if (snapshotDoc.exists()) {
        return snapshotDoc.data() as StudentProgressSnapshot;
      }
      
      return null;
    } catch (error) {
      logError(new AppError('İlerleme verisi alınamadı', 'PROGRESS_FETCH_ERROR'), { context: 'getStudentProgress', error });
      return null;
    }
  }
};
