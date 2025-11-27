import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { auth } from '../services/firebaseClient';
import { onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, name: string) => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Kullanıcı verisini Firestore'dan çek (veya oluştur)
                    // authService.getCurrentUser bu mantığı içerir
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser);
                } catch(e) {
                    console.error("Auth state change user fetch error:", e);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        const loggedUser = await authService.login(email, pass);
        setUser(loggedUser);
    };

    const register = async (email: string, pass: string, name: string) => {
        const newUser = await authService.register(email, pass, name);
        setUser(newUser);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const updateUser = async (updates: Partial<User>) => {
        if (!user) return;
        const updated = await authService.updateProfile(user.id, updates);
        setUser(updated);
    };

    const updatePassword = async (newPassword: string) => {
        if (!user) return;
        await authService.updatePassword(newPassword);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser, updatePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
