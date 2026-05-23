import { create } from 'zustand';
import { Student } from '../types';
import { db } from '../services/firebaseClient';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  QuerySnapshot,
  DocumentData,
  // @ts-ignore
} from 'firebase/firestore';
import { createAdvancedStudent, AdvancedStudent } from '../types/student-advanced';
import { activityLogService } from '../services/activityLogService';

interface StudentState {
  students: Student[];
  activeStudent: Student | null;
  isLoading: boolean;

  // Actions
  setActiveStudent: (student: Student | null) => void;
  fetchStudents: (teacherId: string, isAdmin?: boolean) => () => void;
  addStudent: (teacherId: string, studentData: unknown) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
}

const sanitizeBaseStudent = (data: unknown): Partial<Student> => {
  if (typeof data !== 'object' || data === null) return {};
  const d = data as Record<string, unknown>;
  return {
    name: typeof d.name === 'string' ? d.name : 'İsimsiz Öğrenci',
    age: Number(d.age) || 0,
    grade: typeof d.grade === 'string' ? d.grade : '',
    avatar: typeof d.avatar === 'string' ? d.avatar : '',
    diagnosis: Array.isArray(d.diagnosis) ? (d.diagnosis as string[]) : [],
    interests: Array.isArray(d.interests) ? (d.interests as string[]) : [],
    strengths: Array.isArray(d.strengths) ? (d.strengths as string[]) : [],
    weaknesses: Array.isArray(d.weaknesses) ? (d.weaknesses as string[]) : [],
    learningStyle: (d.learningStyle as 'Görsel' | 'İşitsel' | 'Kinestetik' | 'Karma') || 'Karma',
    parentName: typeof d.parentName === 'string' ? d.parentName : '',
    contactPhone: typeof d.contactPhone === 'string' ? d.contactPhone : '',
    contactEmail: typeof d.contactEmail === 'string' ? d.contactEmail : '',
    notesHistory: typeof d.notesHistory === 'string' ? d.notesHistory : '[]',
    notes: typeof d.notes === 'string' ? d.notes : '',
  };
};

export const useStudentStore = create<StudentState>()((set: any, get: any) => ({
  students: [],
  activeStudent: null,
  isLoading: false,

  setActiveStudent: (student: Student | null) => set({ activeStudent: student }),

  fetchStudents: (teacherId: string, _isAdmin = true) => {
    set({ isLoading: true });
    
    // Herkes tüm öğrencileri görebilir ve değiştirebilir
    const q = query(collection(db, 'students'));

    return onSnapshot(q, {
      next: (snapshot: QuerySnapshot<DocumentData>) => {
        const studentList: Student[] = [];
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          const baseSanitized = sanitizeBaseStudent(data);
          
          // Eğer db'den gelen veride eksik AdvancedStudent fieldları varsa ekle (Migration strategy)
          const isLegacy = !data.iep || !data.financial;
          
          let completeStudent = {
            id: doc.id,
            teacherId: data.teacherId || '',
            createdAt: data.createdAt || new Date().toISOString(),
            ...baseSanitized,
            ...data, // DB'deki diğer advanced fieldları ezmesin diye
          } as Student;

          if (isLegacy) {
            completeStudent = createAdvancedStudent(completeStudent) as Student;
          }

          studentList.push(completeStudent);
        });
        set({ students: studentList, isLoading: false });

        const { activeStudent } = get();
        if (activeStudent && !studentList.find((s: Student) => s.id === activeStudent.id)) {
          // Eğer silindiyse aktif öğrenciden çıkar, fakat başka bir sekmede seçili kaldıysa sıfırlamasın diye ufak kontrol
          // (Opsiyonel olarak kalsın)
          set({ activeStudent: null });
        }
      },
      error: (err) => {
        console.error("fetchStudents Error:", err);
        set({ isLoading: false });
      }
    });
  },

  addStudent: async (teacherId: string, studentData: unknown) => {
    try {
      const sanitized = sanitizeBaseStudent(studentData);
      
      const tempStudent = {
        id: 'temp',
        teacherId,
        createdAt: new Date().toISOString(),
        ...sanitized,
      } as Student;

      const advancedStudent = createAdvancedStudent(tempStudent);
      const { id, ...dataToSave } = advancedStudent; // id'yi firebase atayacak

      const docRef = await addDoc(collection(db, 'students'), dataToSave);

      const studentName = (studentData as Record<string, unknown>)?.name as string || sanitized.name || 'Öğrenci';
      activityLogService.logActivity(teacherId, 'student_added', 'Öğrenci Eklendi', studentName, docRef.id);

      return docRef.id;
    } catch (error) {
      console.error("addStudent Hatası:", error);
      throw error;
    }
  },

  updateStudent: async (id: string, updates: Partial<Student>) => {
    // updates direkt db'ye aktarılsın (advanced fieldlar kaybolmasın)
    await updateDoc(doc(db, 'students', id), updates as any);
  },

  deleteStudent: async (id: string) => {
    await deleteDoc(doc(db, 'students', id));
  },
}));
