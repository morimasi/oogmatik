import { db } from './firebaseClient.js';
import * as firestore from 'firebase/firestore';
import { RecycleBinItem } from '../types/admin.js';
import { AppError } from '../utils/AppError.js';
import { logError } from '../utils/logger.js';

const { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, getDoc, query, orderBy, where } = firestore;

const RECYCLE_COLLECTION = 'recycle_bin';

// Mock in-memory store fallback if Firestore network/permission fails
let localRecycleBinStore: RecycleBinItem[] = [];

export const recycleBinService = {
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
      const studentsSnap = await getDocs(query(collection(db, 'students'), where('teacherId', '==', teacherId)));
      const studentsData = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // İlişkili değerlendirmeleri çek
      const assessmentsSnap = await getDocs(query(collection(db, 'saved_assessments'), where('userId', '==', teacherId)));
      const assessmentsData = assessmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

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
          user: userData,
          students: studentsData,
          assessments: assessmentsData
        }
      };

      // Firestore'a kaydet
      await setDoc(doc(db, RECYCLE_COLLECTION, backupId), backupItem);
      localRecycleBinStore = [backupItem, ...localRecycleBinStore.filter(i => i.id !== backupId)];

      // Kullanıcının statüsünü 'archived' yap
      await updateDoc(userRef, { status: 'archived', updatedAt: new Date().toISOString() });

      return backupItem;
    } catch (error) {
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
      const assessmentsSnap = await getDocs(query(collection(db, 'saved_assessments'), where('studentId', '==', studentId)));
      const assessmentsData = assessmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

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
          student: studentData,
          assessments: assessmentsData
        }
      };

      await setDoc(doc(db, RECYCLE_COLLECTION, backupId), backupItem);
      localRecycleBinStore = [backupItem, ...localRecycleBinStore.filter(i => i.id !== backupId)];

      // Öğrenci statüsünü 'archived' yap
      await updateDoc(studentRef, { status: 'archived', updatedAt: new Date().toISOString() });

      return backupItem;
    } catch (error) {
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
      const items = snapshot.docs.map(d => d.data() as RecycleBinItem);
      
      // Birleştir (Firestore + localStore)
      const combinedMap = new Map<string, RecycleBinItem>();
      localRecycleBinStore.forEach(item => combinedMap.set(item.id, item));
      items.forEach(item => combinedMap.set(item.id, item));

      return Array.from(combinedMap.values()).sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
    } catch (error) {
      logError(error instanceof Error ? error : String(error), { source: 'getAllRecycleBinItems' });
      return localRecycleBinStore;
    }
  },

  /**
    * Silinen / Arşivlenen bir öğretmeni veya öğrenciyi tüm ilişkili verileriyle GERİ YÜKLER.
    */
  restoreItem: async (backupId: string): Promise<boolean> => {
    try {
      const backupRef = doc(db, RECYCLE_COLLECTION, backupId);
      let backupSnap = await getDoc(backupRef);
      let backupItem: RecycleBinItem | null = null;

      if (backupSnap.exists()) {
        backupItem = backupSnap.data() as RecycleBinItem;
      } else {
        backupItem = localRecycleBinStore.find(i => i.id === backupId) || null;
      }

      if (!backupItem) {
        throw new AppError('Yedek kaydı bulunamadı.', 'NOT_FOUND', 404);
      }

      if (backupItem.entityType === 'teacher') {
        const userRef = doc(db, 'users', backupItem.originalId);
        await updateDoc(userRef, { status: 'active', updatedAt: new Date().toISOString() });

        // İlgili öğrencileri de aktif yap
        if (backupItem.originalData?.students) {
          for (const s of backupItem.originalData.students) {
            const stRef = doc(db, 'students', s.id);
            await updateDoc(stRef, { status: 'active' }).catch(() => {});
          }
        }
      } else if (backupItem.entityType === 'student') {
        const studentRef = doc(db, 'students', backupItem.originalId);
        await updateDoc(studentRef, { status: 'active', updatedAt: new Date().toISOString() });
      }

      // Recycle bin kaydını sil
      await deleteDoc(backupRef).catch(() => {});
      localRecycleBinStore = localRecycleBinStore.filter(i => i.id !== backupId);

      return true;
    } catch (error) {
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
      let backupSnap = await getDoc(backupRef);
      let backupItem: RecycleBinItem | null = null;

      if (backupSnap.exists()) {
        backupItem = backupSnap.data() as RecycleBinItem;
      } else {
        backupItem = localRecycleBinStore.find(i => i.id === backupId) || null;
      }

      if (backupItem) {
        if (backupItem.entityType === 'teacher') {
          await deleteDoc(doc(db, 'users', backupItem.originalId)).catch(() => {});
        } else if (backupItem.entityType === 'student') {
          await deleteDoc(doc(db, 'students', backupItem.originalId)).catch(() => {});
        }
      }

      await deleteDoc(backupRef).catch(() => {});
      localRecycleBinStore = localRecycleBinStore.filter(i => i.id !== backupId);

      return true;
    } catch (error) {
      logError(error instanceof Error ? error : String(error), { source: 'permanentlyDeleteItem', backupId });
      throw new AppError('Kalıcı silme esnasında hata oluştu.', 'INTERNAL_ERROR', 500);
    }
  }
};
