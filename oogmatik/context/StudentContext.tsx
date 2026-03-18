import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { Student } from '../types';
import { useAuth } from './AuthContext';
import { useStudentStore } from '../store/useStudentStore';

interface StudentContextType {
    students: Student[];
    activeStudent: Student | null;
    isLoading: boolean;
    setActiveStudent: (student: Student | null) => void;
    addStudent: (studentData: any) => Promise<void>;
    updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
    deleteStudent: (id: string) => Promise<void>;
}

export const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const store = useStudentStore();

    useEffect(() => {
        if (!user) return;
        const unsubscribe = store.fetchStudents(user.id);
        return () => unsubscribe();
    }, [user]);

    const value = useMemo(() => ({
        ...store,
        addStudent: (data: any) => store.addStudent(user?.id || '', data)
    }), [store, user]);

    return (
        <StudentContext.Provider value={value as any}>
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
