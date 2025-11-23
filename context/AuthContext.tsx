
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { supabase } from '../services/supabaseClient';

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

    // Initial Check
    useEffect(() => {
        const initAuth = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();

        // Subscribe to auth changes
        const { data: { subscription } } = supabase?.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        }) || { data: { subscription: { unsubscribe: () => {} } } };

        return () => {
            subscription.unsubscribe();
        };
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
