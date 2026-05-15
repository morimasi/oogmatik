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

                // Redirect'ten döndüyse hemen işle
                getRedirectResult(auth).then(async (result) => {
                    if (result?.user) {
                        isRedirectProcessing = true;
                        try {
                            // Önce Firestore'da kullanıcının oluşturulduğundan/var olduğundan emin ol
                            await authService._handleGoogleUser(result.user);
                            const currentUser = await authService.getCurrentUser();
                            if (currentUser) {
                                set({ user: currentUser, isLoading: false });
                            } else {
                                set({ user: null, isLoading: false });
                            }
                        } catch (error) {
                            console.error("Redirect işleme hatası (Firestore vb):", error);
                            // Kritik hata fallback: Kullanıcı giriş yaptı ama Firestore çöktü.
                            const safeUser: User = {
                                id: result.user.uid,
                                email: result.user.email || '',
                                name: result.user.displayName || 'Kullanıcı',
                                role: 'user',
                                avatar: result.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.email}`,
                                createdAt: new Date().toISOString(),
                                lastLogin: new Date().toISOString(),
                                worksheetCount: 0,
                                status: 'active',
                                subscriptionPlan: 'free',
                                favorites: [],
                                profession: '',
                                institution: '',
                                phone: '',
                                bio: ''
                            };
                            set({ user: safeUser, isLoading: false });
                        } finally {
                            isRedirectProcessing = false;
                        }
                    }
                }).catch((error) => {
                    console.error("getRedirectResult hatası:", error);
                    set({ isLoading: false });
                });

                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
                    if (isRedirectProcessing) return;

                    if (firebaseUser) {
                        try {
                            const currentUser = await authService.getCurrentUser();
                            if (currentUser) {
                                set({ user: currentUser, isLoading: false });
                            } else {
                                // Kritik hata: Firestore okunamadı ama auth var. Güvenli fallback.
                                console.warn("Firestore'dan kullanıcı okunamadı, fallback nesnesi oluşturuluyor.");
                                const safeUser: User = {
                                    id: firebaseUser.uid,
                                    email: firebaseUser.email || '',
                                    name: firebaseUser.displayName || 'Kullanıcı',
                                    role: 'user',
                                    avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`,
                                    createdAt: new Date().toISOString(),
                                    lastLogin: new Date().toISOString(),
                                    worksheetCount: 0,
                                    status: 'active',
                                    subscriptionPlan: 'free',
                                    favorites: [],
                                    profession: '',
                                    institution: '',
                                    phone: '',
                                    bio: ''
                                };
                                set({ user: safeUser, isLoading: false });
                            }
                        } catch (error) {
                            console.error("onAuthStateChanged currentUser hatası:", error);
                            // Fallback nesnesi
                            const fallbackUser: User = {
                                id: firebaseUser.uid,
                                email: firebaseUser.email || '',
                                name: firebaseUser.displayName || 'Kullanıcı',
                                role: 'user',
                                avatar: firebaseUser.photoURL || '',
                                createdAt: new Date().toISOString(),
                                lastLogin: new Date().toISOString(),
                                worksheetCount: 0,
                                status: 'active',
                                subscriptionPlan: 'free',
                                favorites: [],
                                profession: '',
                                institution: '',
                                phone: '',
                                bio: ''
                            };
                            set({ user: fallbackUser, isLoading: false });
                        }
                    } else {
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
