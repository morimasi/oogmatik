import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authService } from '../services/authService';
import { auth } from '../services/firebaseClient';
// @ts-ignore
import { onAuthStateChanged, getRedirectResult, User as FirebaseUser } from "firebase/auth";

import { AppError } from '../utils/AppError.js';
import { logError } from '../utils/logger.js';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    initialize: () => () => void;
    login: (email: string, pass: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    register: (email: string, pass: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist<AuthState>(
        (set, get) => ({
            user: null,
            isLoading: true,

            initialize: () => {
                // Redirect'ten döndüyse hemen işle (dynamic import gecikmesiz)
                getRedirectResult(auth).then(async (result) => {
                    if (result?.user) {
                        try {
                            const userDocRef = (await import('../services/firebaseClient')).doc(
                                (await import('../services/firebaseClient')).db, "users", result.user.uid
                            );
                            const userDocSnap = await (await import('../services/firebaseClient')).getDoc(userDocRef);
                            if (userDocSnap.exists()) {
                                const mapped = {
                                    id: result.user.uid,
                                    email: result.user.email || '',
                                    ...userDocSnap.data(),
                                } as User;
                                set({ user: mapped, isLoading: false });
                            }
                        } catch {
                            // Kullanıcı firestore'da yoksa redirect bunu halleder
                        }
                    }
                });

                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
                    if (firebaseUser) {
                        try {
                            const currentUser = await authService.getCurrentUser();
                            if (currentUser) {
                                set({ user: currentUser, isLoading: false });
                            } else {
                                // Firestore'da kaydı yoksa redirectResult'tan oluşturulacak
                                set({ isLoading: false });
                            }
                        } catch {
                            set({ user: null, isLoading: false });
                        }
                    } else {
                        const { user } = get();
                        if (!user) {
                            set({ user: null, isLoading: false });
                        }
                    }
                });
                return unsubscribe;
            },

            login: async (email: string, pass: string) => {
                const loggedUser = await authService.login(email, pass);
                set({ user: loggedUser });
            },

            loginWithGoogle: async () => {
                set({ isLoading: true });
                await authService.loginWithGoogle();
            },

            register: async (email: string, pass: string, name: string) => {
                const newUser = await authService.register(email, pass, name);
                set({ user: newUser });
            },

            logout: async () => {
                await authService.logout();
                set({ user: null });
            },

            updateUser: async (updates: Partial<User>) => {
                const { user } = get();
                if (!user) return;
                const updated = await authService.updateProfile(user.id, updates);
                set({ user: updated });
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);
