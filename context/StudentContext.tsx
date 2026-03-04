
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student } from '../types';
import { db } from '../services/firebaseClient';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface StudentContextType {
    students: Student[];
    activeStudent: Student | null;
    isLoading: boolean;
    setActiveStudent: (student: Student | null) => void;
    addStudent: (studentData: Omit<Student, 'id' | 'teacherId' | 'createdAt'>) => Promise<void>;
    updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
    deleteStudent: (id: string) => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

// --- SANITIZATION LAYER ---
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

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [activeStudent, setActiveStudent] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setStudents([]);
            setActiveStudent(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        
        const q = query(
            collection(db, "students"),
            where("teacherId", "==", user.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const studentList: Student[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data) {
                    studentList.push({ 
                        id: doc.id, 
                        teacherId: data.teacherId || '',
                        createdAt: data.createdAt || new Date().toISOString(),
                        ...sanitizeStudent(data)
                    } as Student);
                }
            });

            studentList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setStudents(studentList);
            
            if (activeStudent && !studentList.find(s => s.id === activeStudent.id)) {
                setActiveStudent(null);
            }
            
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching students:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, activeStudent?.id]);

    const addStudent = async (studentData: Omit<Student, 'id' | 'teacherId' | 'createdAt'>) => {
        if (!user) return;
        
        try {
            const sanitized = sanitizeStudent(studentData);
            const newStudent = {
                ...sanitized,
                teacherId: user.id,
                createdAt: new Date().toISOString(),
            };
            
            await addDoc(collection(db, "students"), newStudent);
        } catch (error) {
            console.error("Error adding student:", error);
            throw error;
        }
    };

    const updateStudent = async (id: string, updates: Partial<Student>) => {
        try {
            // Only sanitize keys that are present in updates to allow partial updates
            const sanitizedUpdates: any = {};
            const baseSanitized = sanitizeStudent(updates);
            
            Object.keys(updates).forEach(key => {
                if (key in baseSanitized) {
                    sanitizedUpdates[key] = (baseSanitized as any)[key];
                }
            });

            const studentRef = doc(db, "students", id);
            await updateDoc(studentRef, sanitizedUpdates);
            
            if (activeStudent && activeStudent.id === id) {
                setActiveStudent({ ...activeStudent, ...sanitizedUpdates });
            }
        } catch (error) {
            console.error("Error updating student:", error);
            throw error;
        }
    };

    const deleteStudent = async (id: string) => {
        try {
            await deleteDoc(doc(db, "students", id));
        } catch (error) {
            console.error("Error deleting student:", error);
            throw error;
        }
    };

    return (
        <StudentContext.Provider value={{ 
            students, 
            activeStudent, 
            isLoading, 
            setActiveStudent, 
            addStudent, 
            updateStudent, 
            deleteStudent 
        }}>
            {children}
        </StudentContext.Provider>
    );
};

export const useStudent = () => {
    const context = useContext(StudentContext);
    if (context === undefined) {
        throw new Error('useStudent must be used within a StudentProvider');
    }
    return context;
};
