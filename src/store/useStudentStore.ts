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
import { StudentProfile, StudentAIProfile } from '../types';
import { logError } from '../utils/logger';
import { toAppError } from '../utils/AppError';
import { createAdvancedStudent, AdvancedStudent } from '../types/student-advanced';
import { activityLogService } from '../services/activityLogService';

interface StudentState {
  students: Student[];
  activeStudent: Student | null;
  isLoading: boolean;

  // Actions
  setActiveStudent: (student: Student | null) => void;
  fetchStudents: (teacherId: string, isAdmin?: boolean) => () => void;
  addStudent: (teacherId: string, studentData: unknown) => Promise<string>;
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

export const useStudentStore = create<StudentState>()((set, get) => ({
  students: [],
  activeStudent: null,
  isLoading: false,

  setActiveStudent: (student: Student | null) => set({ activeStudent: student }),

  fetchStudents: (teacherId: string, isAdmin = true) => {
    set({ isLoading: true });

    const buildStudentList = (...snapshots: QuerySnapshot<DocumentData>[]) => {
      const seen = new Set<string>();
      const studentList: Student[] = [];
      for (const snap of snapshots) {
        snap.forEach((doc: any) => {
          if (seen.has(doc.id)) return;
          seen.add(doc.id);
          const data = doc.data();
          const baseSanitized = sanitizeBaseStudent(data);
          const isLegacy = !data.iep || !data.financial;
          let completeStudent = {
            id: doc.id,
            teacherId: data.teacherId || '',
            createdAt: data.createdAt || new Date().toISOString(),
            ...baseSanitized,
            ...data,
          } as Student;
          if (isLegacy) completeStudent = createAdvancedStudent(completeStudent) as Student;
          studentList.push(completeStudent);
        });
      }
      return studentList;
    };

    if (isAdmin) {
      const q = query(collection(db, 'students'));
      return onSnapshot(q, {
        next: (snapshot) => {
          const studentList = buildStudentList(snapshot);
          set({ students: studentList, isLoading: false });
          const { activeStudent } = get();
          if (activeStudent && !studentList.find((s: Student) => s.id === activeStudent.id)) set({ activeStudent: null });
        },
        error: (err) => { logError(toAppError(err), { context: 'fetchStudents Error' }); set({ isLoading: false }); }
      });
    }

    const qOwn = query(collection(db, 'students'), where('teacherId', '==', teacherId));
    const qAssigned = query(collection(db, 'students'), where('assignedTeachers', 'array-contains', teacherId));

    let lastOwn: QuerySnapshot<DocumentData> | null = null;
    let lastAssigned: QuerySnapshot<DocumentData> | null = null;

    const mergeAndSet = () => {
      if (!lastOwn || !lastAssigned) return;
      const studentList = buildStudentList(lastOwn, lastAssigned);
      set({ students: studentList, isLoading: false });
      const { activeStudent } = get();
      if (activeStudent && !studentList.find((s: Student) => s.id === activeStudent.id)) set({ activeStudent: null });
    };

    const unsubOwn = onSnapshot(qOwn, {
      next: (snap) => { lastOwn = snap; mergeAndSet(); },
      error: (err) => { logError(toAppError(err), { context: 'fetchStudents own Error' }); set({ isLoading: false }); }
    });
    const unsubAssigned = onSnapshot(qAssigned, {
      next: (snap) => { lastAssigned = snap; mergeAndSet(); },
      error: (err) => { logError(toAppError(err), { context: 'fetchStudents assigned Error' }); set({ isLoading: false }); }
    });

    return () => { unsubOwn(); unsubAssigned(); };
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
      logError(toAppError(error), { context: 'addStudent Hatası' });
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
