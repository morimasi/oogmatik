import { create } from 'zustand';
import { Student } from '../types';
import { db } from '../services/firebaseClient';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

interface StudentState {
    students: Student[];
    activeStudent: Student | null;
    isLoading: boolean;

    // Actions
    setActiveStudent: (student: Student | null) => void;
    fetchStudents: (teacherId: string) => () => void;
    addStudent: (teacherId: string, studentData: any) => Promise<void>;
    updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
    deleteStudent: (id: string) => Promise<void>;
}

const sanitizeStudent = (data: any): Partial<Student> => {
    return {
        name: data.name || 'İsimsiz Öğrenci',
        age: Number(data.age) || 0,
        grade: data.grade || '',
        avatar: data.avatar || '',
        diagnosis: Array.isArray(data.diagnosis) ? data.diagnosis : [],
        interests: Array.isArray(data.interests) ? data.interests : [],
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
        learningStyle: data.learningStyle || 'Karma',
        parentName: data.parentName || '',
        contactPhone: data.contactPhone || '',
        contactEmail: data.contactEmail || '',
        notesHistory: data.notesHistory || '[]',
        notes: data.notes || ''
    };
};

export const useStudentStore = create<StudentState>((set, get) => ({
    students: [],
    activeStudent: null,
    isLoading: false,

    setActiveStudent: (student) => set({ activeStudent: student }),

    fetchStudents: (teacherId) => {
        set({ isLoading: true });
        const q = query(
            collection(db, "students"),
            where("teacherId", "==", teacherId)
        );

        return onSnapshot(q, (snapshot) => {
            const studentList: Student[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                studentList.push({
                    id: doc.id,
                    teacherId: data.teacherId || '',
                    createdAt: data.createdAt || new Date().toISOString(),
                    ...sanitizeStudent(data)
                } as Student);
            });

            studentList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            set({ students: studentList, isLoading: false });

            const { activeStudent } = get();
            if (activeStudent && !studentList.find(s => s.id === activeStudent.id)) {
                set({ activeStudent: null });
            }
        });
    },

    addStudent: async (teacherId, studentData) => {
        const sanitized = sanitizeStudent(studentData);
        await addDoc(collection(db, "students"), {
            ...sanitized,
            teacherId,
            createdAt: new Date().toISOString(),
        });
    },

    updateStudent: async (id, updates) => {
        const sanitizedUpdates: any = {};
        const baseSanitized = sanitizeStudent(updates);
        Object.keys(updates).forEach(key => {
            if (key in baseSanitized) sanitizedUpdates[key] = (baseSanitized as any)[key];
        });

        await updateDoc(doc(db, "students", id), sanitizedUpdates);
        const { activeStudent } = get();
        if (activeStudent?.id === id) {
            set({ activeStudent: { ...activeStudent, ...sanitizedUpdates } });
        }
    },

    deleteStudent: async (id) => {
        await deleteDoc(doc(db, "students", id));
    }
}));
