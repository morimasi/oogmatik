import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authService } from '../services/authService';
import { auth } from '../services/firebaseClient';
import { onAuthStateChanged } from "firebase/auth";

interface AuthState {
    user: User | null;
    isLoading: boolean;
    initialize: () => () => void;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: true,

            initialize: () => {
                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                    if (firebaseUser) {
                        try {
                            const currentUser = await authService.getCurrentUser();
                            set({ user: currentUser, isLoading: false });
                        } catch (e) {
                            console.error("AuthStore initialize error:", e);
                            set({ user: null, isLoading: false });
                        }
                    } else {
                        set({ user: null, isLoading: false });
                    }
                });
                return unsubscribe;
            },

            login: async (email, pass) => {
                const loggedUser = await authService.login(email, pass);
                set({ user: loggedUser });
            },

            register: async (email, pass, name) => {
                const newUser = await authService.register(email, pass, name);
                set({ user: newUser });
            },

            logout: async () => {
                await authService.logout();
                set({ user: null });
            },

            updateUser: async (updates) => {
                const { user } = get();
                if (!user) return;
                const updated = await authService.updateProfile(user.id, updates);
                set({ user: updated });
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user }), // Sadece user bilgisini sakla
        }
    )
);
