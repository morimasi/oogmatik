import { db } from './firebaseClient.js';
import * as firestore from 'firebase/firestore';
import { RecycleBinItem } from '../types/admin.js';
import { AppError } from '../utils/AppError.js';
import { logError, logInfo } from '../utils/logger.js';

const { collection, doc, getDocs, setDoc, deleteDoc, getDoc, query, orderBy, onSnapshot } = firestore;

const RECYCLE_COLLECTION = 'recycle_bin';

// Local cache for offline resilience
let localRecycleBinStore: RecycleBinItem[] = [];

// Active listener unsubscribe function
let activeUnsubscribe: (() => void) | null = null;

export const recycleBinService = {
  /**
   * Gerçek zamanlı Firestore listener başlatır.
   * UI bileşeni mount olduğunda çağrılır, unmount'ta dönen unsubscribe fonksiyonu çağrılır.
   */
  subscribeToRecycleBin: (onUpdate: (items: RecycleBinItem[]) => void): (() => void) => {
    // Önceki listener'ı temizle
    if (activeUnsubscribe) {
      activeUnsubscribe();
      activeUnsubscribe = null;
    }

    try {
      const q = query(collection(db, RECYCLE_COLLECTION), orderBy('deletedAt', 'desc'));
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as RecycleBinItem));
          localRecycleBinStore = items;
          onUpdate(items);
        },
        (error) => {
          logError(error instanceof Error ? error : String(error), { source: 'subscribeToRecycleBin' });
          // Fallback: local store'dan ver
          onUpdate(localRecycleBinStore);
        }
      );

      activeUnsubscribe = unsubscribe;
      return unsubscribe;
    } catch (error) {
      logError(error instanceof Error ? error : String(error), { source: 'subscribeToRecycleBin.init' });
      // Fallback
      onUpdate(localRecycleBinStore);
      return () => {};
    }
  },

  /**
   * Bir öğretmeni tüm verileri ve ilişkili öğrencileri ile birlikte güvenle yedekleyip arşivler / soft-delete yapar.
   */
  archiveTeacher: async (teacherId: string, deletedBy = 'Admin System'): Promise<RecycleBinItem> => {
    try {
      const userRef = doc(db, 'users', teacherId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new AppError('Öğretmen kullanıcısı bulunamadı.', 'NOT_FOUND', 404);
      }

      const userData = userSnap.data();

      // İlişkili öğrencileri çek
      const studentsSnap = await getDocs(query(collection(db, 'students'), firestore.where('teacherId', '==', teacherId)));
      const studentsData = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // İlişkili değerlendirmeleri çek
      const assessmentsSnap = await getDocs(query(collection(db, 'saved_assessments'), firestore.where('userId', '==', teacherId)));
      const assessmentsData = assessmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // İlişkili çalışma kâğıtlarını çek
      const worksheetsSnap = await getDocs(query(collection(db, 'worksheets'), firestore.where('userId', '==', teacherId)));
      const worksheetsData = worksheetsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const backupId = `rec_teacher_${teacherId}_${Date.now()}`;
      const backupItem: RecycleBinItem = {
        id: backupId,
        originalId: teacherId,
        entityType: 'teacher',
        name: userData.name || 'İsimsiz Öğretmen',
        email: userData.email || '',
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        role: userData.role || 'teacher',
        deletedAt: new Date().toISOString(),
        deletedBy,
        status: 'archived',
        originalData: {
          user: { ...userData, id: teacherId },
          students: studentsData,
          assessments: assessmentsData,
          worksheets: worksheetsData,
        }
      };

      // Firestore'a yedek kaydet
      await setDoc(doc(db, RECYCLE_COLLECTION, backupId), backupItem);

      // Kullanıcının statüsünü 'archived' yap (soft-delete)
      await firestore.updateDoc(userRef, { status: 'archived', updatedAt: new Date().toISOString() });

      logInfo(`Öğretmen arşivlendi: ${userData.name} (${teacherId})`);
      return backupItem;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError(error instanceof Error ? error : String(error), { source: 'archiveTeacher', teacherId });
      throw new AppError('Öğretmen arşivlenirken hata oluştu.', 'INTERNAL_ERROR', 500);
    }
  },

  /**
   * Bir öğrenciyi tüm gelişim, değerlendirme ve BEP verileriyle birlikte yedekleyip arşivler.
   */
  archiveStudent: async (studentId: string, deletedBy = 'Admin System'): Promise<RecycleBinItem> => {
    try {
      const studentRef = doc(db, 'students', studentId);
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) {
        throw new AppError('Öğrenci bulunamadı.', 'NOT_FOUND', 404);
      }

      const studentData = studentSnap.data();

      // Değerlendirmelerini çek
      const assessmentsSnap = await getDocs(query(collection(db, 'saved_assessments'), firestore.where('studentId', '==', studentId)));
      const assessmentsData = assessmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // BEP hedeflerini çek
      const bepSnap = await getDocs(query(collection(db, 'bep_goals'), firestore.where('studentId', '==', studentId)));
      const bepData = bepSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const backupId = `rec_student_${studentId}_${Date.now()}`;
      const backupItem: RecycleBinItem = {
        id: backupId,
        originalId: studentId,
        entityType: 'student',
        name: studentData.name || 'İsimsiz Öğrenci',
        grade: studentData.grade || '',
        age: studentData.age || 0,
        diagnosis: studentData.diagnosis || [],
        deletedAt: new Date().toISOString(),
        deletedBy,
        status: 'archived',
        originalData: {
          student: { ...studentData, id: studentId },
          assessments: assessmentsData,
          bepGoals: bepData,
        }
      };

      await setDoc(doc(db, RECYCLE_COLLECTION, backupId), backupItem);

      // Öğrenci statüsünü 'archived' yap (soft-delete)
      await firestore.updateDoc(studentRef, { status: 'archived', updatedAt: new Date().toISOString() });

      logInfo(`Öğrenci arşivlendi: ${studentData.name} (${studentId})`);
      return backupItem;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError(error instanceof Error ? error : String(error), { source: 'archiveStudent', studentId });
      throw new AppError('Öğrenci arşivlenirken hata oluştu.', 'INTERNAL_ERROR', 500);
    }
  },

  /**
   * Geri dönüşüm kutusundaki tüm arşivlenmiş kayıtları getirir.
   */
  getAllRecycleBinItems: async (): Promise<RecycleBinItem[]> => {
    try {
      const snapshot = await getDocs(query(collection(db, RECYCLE_COLLECTION), orderBy('deletedAt', 'desc')));
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as RecycleBinItem));
      localRecycleBinStore = items;
      return items;
    } catch (error) {
      logError(error instanceof Error ? error : String(error), { source: 'getAllRecycleBinItems' });
      return localRecycleBinStore;
    }
  },

  /**
   * Silinen / Arşivlenen bir öğretmeni veya öğrenciyi tüm ilişkili verileriyle GERİ YÜKLER.
   * setDoc (merge) kullanır — belge silinmiş olsa bile yeniden oluşturur.
   */
  restoreItem: async (backupId: string): Promise<boolean> => {
    try {
      const backupRef = doc(db, RECYCLE_COLLECTION, backupId);
      const backupSnap = await getDoc(backupRef);
      let backupItem: RecycleBinItem | null = null;

      if (backupSnap.exists()) {
        backupItem = backupSnap.data() as RecycleBinItem;
      } else {
        backupItem = localRecycleBinStore.find(i => i.id === backupId) ?? null;
      }

      if (!backupItem) {
        throw new AppError('Yedek kaydı bulunamadı.', 'NOT_FOUND', 404);
      }

      if (backupItem.entityType === 'teacher') {
        // Öğretmen verilerini geri yükle
        const originalUser = backupItem.originalData?.user;
        if (originalUser) {
          const userId = backupItem.originalId;
          // setDoc (merge) ile belgeyi yeniden oluştur veya güncelle
          await setDoc(doc(db, 'users', userId), {
            ...originalUser,
            status: 'active',
            updatedAt: new Date().toISOString(),
            restoredAt: new Date().toISOString(),
          }, { merge: true });
        }

        // İlgili öğrencileri de aktif yap
        if (backupItem.originalData?.students) {
          for (const s of backupItem.originalData.students) {
            await setDoc(doc(db, 'students', s.id), {
              ...s,
              status: 'active',
              updatedAt: new Date().toISOString(),
            }, { merge: true }).catch(() => {});
          }
        }

        logInfo(`Öğretmen geri yüklendi: ${backupItem.name} (${backupItem.originalId})`);
      } else if (backupItem.entityType === 'student') {
        // Öğrenci verilerini geri yükle
        const originalStudent = backupItem.originalData?.student;
        if (originalStudent) {
          const studentId = backupItem.originalId;
          await setDoc(doc(db, 'students', studentId), {
            ...originalStudent,
            status: 'active',
            updatedAt: new Date().toISOString(),
            restoredAt: new Date().toISOString(),
          }, { merge: true });
        }

        // BEP hedeflerini geri yükle
        if (backupItem.originalData?.bepGoals) {
          for (const bep of backupItem.originalData.bepGoals) {
            await setDoc(doc(db, 'bep_goals', bep.id), bep, { merge: true }).catch(() => {});
          }
        }

        logInfo(`Öğrenci geri yüklendi: ${backupItem.name} (${backupItem.originalId})`);
      }

      // Recycle bin kaydını sil (geri yükleme tamamlandı)
      await deleteDoc(backupRef).catch(() => {});
      localRecycleBinStore = localRecycleBinStore.filter(i => i.id !== backupId);

      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logError(error instanceof Error ? error : String(error), { source: 'restoreItem', backupId });
      throw new AppError('Kayıt geri yüklenirken hata oluştu.', 'INTERNAL_ERROR', 500);
    }
  },

  /**
   * Bir yedek kaydını kalıcı olarak sistemden siler.
   */
  permanentlyDeleteItem: async (backupId: string): Promise<boolean> => {
    try {
      const backupRef = doc(db, RECYCLE_COLLECTION, backupId);
      const backupSnap = await getDoc(backupRef);
      let backupItem: RecycleBinItem | null = null;

      if (backupSnap.exists()) {
        backupItem = backupSnap.data() as RecycleBinItem;
      } else {
        backupItem = localRecycleBinStore.find(i => i.id === backupId) ?? null;
      }

      if (backupItem) {
        // Orijinal kaydı da kalıcı olarak sil
        if (backupItem.entityType === 'teacher') {
          await deleteDoc(doc(db, 'users', backupItem.originalId)).catch(() => {});
          // İlişkili öğrencileri de sil
          if (backupItem.originalData?.students) {
            for (const s of backupItem.originalData.students) {
              await deleteDoc(doc(db, 'students', s.id)).catch(() => {});
            }
          }
        } else if (backupItem.entityType === 'student') {
          await deleteDoc(doc(db, 'students', backupItem.originalId)).catch(() => {});
        }
      }

      // Yedek kaydını sil
      await deleteDoc(backupRef).catch(() => {});
      localRecycleBinStore = localRecycleBinStore.filter(i => i.id !== backupId);

      logInfo(`Kalıcı silme: ${backupItem?.name ?? backupId}`);
      return true;
    } catch (error) {
      logError(error instanceof Error ? error : String(error), { source: 'permanentlyDeleteItem', backupId });
      throw new AppError('Kalıcı silme esnasında hata oluştu.', 'INTERNAL_ERROR', 500);
    }
  },

  /**
   * Listener'ı temizle
   */
  unsubscribe: () => {
    if (activeUnsubscribe) {
      activeUnsubscribe();
      activeUnsubscribe = null;
    }
  }
};
