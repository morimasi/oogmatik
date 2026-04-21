import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  updateDoc, 
  writeBatch,
  Timestamp 
} from './firebaseClient';
import { 
  ActivityAssignment, 
  CreateAssignmentPayload, 
  AssignmentUpdatePayload 
} from '../types/assignment';
import { AppError, DatabaseError, ValidationError, isAppError, toAppError } from '../utils/AppError';
import { wrapAsync } from '../utils/errorHandler';

const COLLECTION_NAME = 'assignments';

export const assignmentService = {
  /**
   * Yeni bir atama (veya toplu atama) oluşturur.
   */
  createAssignments: wrapAsync(
    async (payload: CreateAssignmentPayload, assignedBy: string): Promise<ActivityAssignment[]> => {
      if (!payload.studentIds || payload.studentIds.length === 0) {
        throw new ValidationError("En az bir öğrenci seçmelisiniz.");
      }
      if (!payload.worksheetId) {
        throw new ValidationError("Atanacak çalışma kağıdı ID'si eksik.");
      }

      const batch = writeBatch(db);
      const assignments: ActivityAssignment[] = [];
      const now = new Date().toISOString();

      const assignmentsRef = collection(db, COLLECTION_NAME);

      for (const studentId of payload.studentIds) {
        const newDocRef = doc(assignmentsRef);
        const assignment: ActivityAssignment = {
          id: newDocRef.id,
          worksheetId: payload.worksheetId,
          studentId,
          assignedBy,
          assignedAt: now,
          status: 'pending',
          statusUpdatedAt: now,
          dueDate: payload.dueDate,
          teacherNotes: payload.teacherNotes
        };

        batch.set(newDocRef, assignment);
        assignments.push(assignment);
      }

      await batch.commit().catch(err => {
        throw new DatabaseError("Atamalar kaydedilirken bir hata oluştu.", err);
      });

      return assignments;
    },
    'Atama oluşturma başarısız',
    'CREATE_ASSIGNMENT_ERROR'
  ),

  /**
   * Bir öğretmenin atadığı tüm görevleri getirir.
   */
  getAssignmentsByTeacher: wrapAsync(
    async (teacherId: string): Promise<ActivityAssignment[]> => {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("assignedBy", "==", teacherId)
      );
      
      const querySnapshot = await getDocs(q).catch(err => {
        throw new DatabaseError("Atamalar yüklenirken hata oluştu.", err);
      });

      return querySnapshot.docs.map(doc => doc.data() as ActivityAssignment);
    },
    'Atamalar getirilemedi',
    'FETCH_TEACHER_ASSIGNMENTS_ERROR'
  ),

  /**
   * Bir öğrenciye ait atamaları getirir.
   */
  getAssignmentsByStudent: wrapAsync(
    async (studentId: string): Promise<ActivityAssignment[]> => {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("studentId", "==", studentId)
      );
      
      const querySnapshot = await getDocs(q).catch(err => {
        throw new DatabaseError("Atamalar yüklenirken hata oluştu.", err);
      });

      return querySnapshot.docs.map(doc => doc.data() as ActivityAssignment);
    },
    'Atamalar getirilemedi',
    'FETCH_STUDENT_ASSIGNMENTS_ERROR'
  ),

  /**
   * Atamanın durumunu vs günceller.
   */
  updateAssignment: wrapAsync(
    async (assignmentId: string, payload: AssignmentUpdatePayload): Promise<void> => {
      if (!assignmentId) {
        throw new ValidationError("Atama ID'si eksik.");
      }

      const docRef = doc(db, COLLECTION_NAME, assignmentId);
      
      // Belgenin var olup olmadığını kontrol et
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new DatabaseError(`Atama bulunamadı: ${assignmentId}`);
      }

      const updateData: Partial<ActivityAssignment> = {
        ...payload,
        statusUpdatedAt: new Date().toISOString()
      };

      // Undefined değerleri temizleyelim (Firestore hata vermesin)
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof ActivityAssignment] === undefined) {
          delete updateData[key as keyof ActivityAssignment];
        }
      });

      await updateDoc(docRef, updateData).catch((err) => {
         throw new DatabaseError("Atama güncellenirken bir veritabanı hatası oluştu.", err);
      });
    },
    'Atama güncellenemedi',
    'UPDATE_ASSIGNMENT_ERROR'
  )
};
