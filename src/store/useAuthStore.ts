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
                let isRedirectProcessing = false;

                // Redirect'ten döndüyse hemen işle (dynamic import gecikmesiz)
                getRedirectResult(auth).then(async (result) => {
                    if (result?.user) {
                        isRedirectProcessing = true;
                        try {
                            // Önce Firestore'da kullanıcının oluşturulduğundan/var olduğundan emin ol
                            await authService._handleGoogleUser(result.user);
                            const currentUser = await authService.getCurrentUser();
                            if (currentUser) {
                                set({ user: currentUser, isLoading: false });
                            }
                        } catch {
                            // Hata durumunda sessizce devam et
                        } finally {
                            isRedirectProcessing = false;
                        }
                    }
                });

                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
                    // Eğer redirect sonucu işleniyorsa, onAuthStateChanged'in durumu bozmasına izin verme
                    if (isRedirectProcessing) return;

                    if (firebaseUser) {
                        try {
                            const currentUser = await authService.getCurrentUser();
                            if (currentUser) {
                                set({ user: currentUser, isLoading: false });
                            } else {
                                // Firestore'da kaydı yoksa ve redirect de çalışmıyorsa fallback user nesnesi ile devam et
                                set({ isLoading: false });
                            }
                        } catch {
                            set({ user: null, isLoading: false });
                        }
                    } else {
                        // Çıkış yapılmışsa
                        set({ user: null, isLoading: false });
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
