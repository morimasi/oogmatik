
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, name: string) => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsLoading(false);
    }, []);

    const login = async (email: string, pass: string) => {
        const loggedUser = await authService.login(email, pass);
        setUser(loggedUser);
    };

    const register = async (email: string, pass: string, name: string) => {
        const newUser = await authService.register(email, pass, name);
        setUser(newUser);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const updateUser = async (updates: Partial<User>) => {
        if (!user) return;
        const updated = await authService.updateProfile(user.id, updates);
        setUser(updated);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
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
