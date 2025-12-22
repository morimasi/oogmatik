
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
        
        // Firestore Index Error Fix: Removed orderBy("createdAt", "desc") from query.
        // Sorting will be done client-side.
        const q = query(
            collection(db, "students"),
            where("teacherId", "==", user.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const studentList: Student[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Safe mapping to avoid undefined errors
                if (data) {
                    studentList.push({ 
                        id: doc.id, 
                        teacherId: data.teacherId || '',
                        name: data.name || 'İsimsiz Öğrenci',
                        age: data.age || 0,
                        grade: data.grade || '',
                        avatar: data.avatar || '',
                        createdAt: data.createdAt || new Date().toISOString(),
                        diagnosis: data.diagnosis || [],
                        interests: data.interests || [],
                        strengths: data.strengths || [],
                        weaknesses: data.weaknesses || [],
                        learningStyle: data.learningStyle,
                        parentName: data.parentName,
                        contactPhone: data.contactPhone,
                        contactEmail: data.contactEmail,
                        notesHistory: data.notesHistory,
                        notes: data.notes || ''
                    } as Student);
                }
            });

            // Client-side sort
            studentList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setStudents(studentList);
            
            // If active student was deleted, clear selection
            if (activeStudent && !studentList.find(s => s.id === activeStudent.id)) {
                setActiveStudent(null);
            }
            
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching students:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, activeStudent]);

    const addStudent = async (studentData: Omit<Student, 'id' | 'teacherId' | 'createdAt'>) => {
        if (!user) return;
        
        try {
            const newStudent = {
                ...studentData,
                teacherId: user.id,
                createdAt: new Date().toISOString(),
                // Ensure array fields are initialized
                diagnosis: studentData.diagnosis || [],
                interests: studentData.interests || [],
                strengths: studentData.strengths || [],
                weaknesses: studentData.weaknesses || []
            };
            
            await addDoc(collection(db, "students"), newStudent);
        } catch (error) {
            console.error("Error adding student:", error);
            throw error;
        }
    };

    const updateStudent = async (id: string, updates: Partial<Student>) => {
        try {
            const studentRef = doc(db, "students", id);
            await updateDoc(studentRef, updates);
            
            // Update active student state if it's the one being updated
            if (activeStudent && activeStudent.id === id) {
                setActiveStudent({ ...activeStudent, ...updates });
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
