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
} from 'firebase/firestore';

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

const sanitizeStudent = (data: unknown): Partial<Student> => {
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

  fetchStudents: (teacherId: string, isAdmin = false) => {
    set({ isLoading: true });
    
    // Admin ise tüm öğrencileri getir, değilse sadece kendi öğrencilerini
    const q = isAdmin
      ? query(collection(db, 'students'))
      : query(collection(db, 'students'), where('teacherId', '==', teacherId));

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const studentList: Student[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        studentList.push({
          id: doc.id,
          teacherId: data.teacherId || '',
          createdAt: data.createdAt || new Date().toISOString(),
          ...sanitizeStudent(data),
        } as Student);
      });
      set({ students: studentList, isLoading: false });

      const { activeStudent } = get();
      if (activeStudent && !studentList.find((s) => s.id === activeStudent.id)) {
        set({ activeStudent: null });
      }
    });
  },

  addStudent: async (teacherId: string, studentData: unknown) => {
    const sanitized = sanitizeStudent(studentData);
    await addDoc(collection(db, 'students'), {
      ...sanitized,
      teacherId,
      createdAt: new Date().toISOString(),
    });
  },

  updateStudent: async (id: string, updates: Partial<Student>) => {
    const sanitizedUpdates: Record<string, unknown> = {};
    const baseSanitized = sanitizeStudent(updates);
    Object.keys(updates).forEach((key) => {
      if (key in baseSanitized)
        sanitizedUpdates[key] = (baseSanitized as Record<string, unknown>)[key];
    });

    await updateDoc(doc(db, 'students', id), sanitizedUpdates as { [x: string]: import('firebase/firestore').FieldValue | Partial<unknown> | undefined });
    const { activeStudent } = get();
    if (activeStudent?.id === id) {
      set({ activeStudent: { ...activeStudent, ...sanitizedUpdates } });
    }
  },

  deleteStudent: async (id: string) => {
    await deleteDoc(doc(db, 'students', id));

    // Fix race condition: Clear activeStudent if it's the one being deleted
    const { activeStudent } = get();
    if (activeStudent?.id === id) {
      set({ activeStudent: null });
    }
  },
}));
