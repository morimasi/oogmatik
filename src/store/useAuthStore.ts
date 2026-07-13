import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authService } from '../services/authService';
import { auth } from '../services/firebaseClient';
// @ts-ignore
import { onAuthStateChanged, getRedirectResult, User as FirebaseUser } from "firebase/auth";

import { AppError, toAppError } from '../utils/AppError.js';
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

let snapshotUnsub: (() => void) | null = null;

export const useAuthStore = create<AuthState>()(
    persist<AuthState>(
        (set, get) => ({
            user: null,
            isLoading: true,

            initialize: () => {
                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
                    // Clean up any existing snapshot listener
                    if (snapshotUnsub) {
                        snapshotUnsub();
                        snapshotUnsub = null;
                    }

                    if (firebaseUser) {
                        set({ isLoading: true });
                        snapshotUnsub = authService.subscribeToCurrentUser(
                            firebaseUser.uid,
                            firebaseUser.email || '',
                            (updatedUser) => {
                                if (updatedUser) {
                                    set({ user: updatedUser, isLoading: false });
                                } else {
                                    // Belge yoksa boş döndür (fallback yapısı daha evvel get'de idi, abone sildiğimizde null)
                                    set({ user: null, isLoading: false });
                                }
                            },
                            (error) => {
                                // Hata durumunda isLoading kilidini kaldırıp logluyoruz
                                set({ isLoading: false });
                                logError("Firestore onSnapshot subscription failed:", { error });
                            }
                        );
                    } else {
                        // Çıkış yapılmışsa
                        set({ user: null, isLoading: false });
                    }
                });
                return () => {
                    unsubscribe();
                    if (snapshotUnsub) {
                        snapshotUnsub();
                        snapshotUnsub = null;
                    }
                };
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
            partialize: (state) => ({ user: state.user }) as any,
        }
    )
);
