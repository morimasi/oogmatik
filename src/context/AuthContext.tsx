import { AppError } from '../utils/AppError';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { User } from '../types';
import { useAuthStore } from '../store/useAuthStore';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const store = useAuthStore();

    useEffect(() => {
        const unsubscribe = store.initialize();
        return () => unsubscribe();
    }, []);

    const value = useMemo(() => ({
        ...store,
        updatePassword: async (_pass: string) => { /* useAuthStore'da henüz yok, gerekirse eklenebilir */ }
    }), [store]);

    return (
        <AuthContext.Provider value={value as any}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new AppError('useAuth must be used within an AuthProvider', 'INTERNAL_ERROR', 500);
    }
    return context;
};
