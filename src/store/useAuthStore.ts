import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authService } from '../services/authService';
import { auth } from '../services/firebaseClient';
// @ts-ignore
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getUserRoleInfo } from '../services/rbac.js';

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
                // Check if we're coming back from a Google Redirect
                authService.handleRedirectResult().then(async (user) => {
                    if (user) {
                        const info = await getUserRoleInfo(user.id, user.role);
                        set({ 
                            user: { ...user, permissions: info.permissions, accessibleModules: info.accessibleModules }, 
                            isLoading: false 
                        });
                    }
                });

                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
                    if (firebaseUser) {
                        try {
                            const currentUser = await authService.getCurrentUser();
                            if (currentUser) {
                                const info = await getUserRoleInfo(currentUser.id, currentUser.role);
                                set({ 
                                    user: { ...currentUser, permissions: info.permissions, accessibleModules: info.accessibleModules }, 
                                    isLoading: false 
                                });
                            } else {
                                set({ user: null, isLoading: false });
                            }
                        } catch (e: any) {
                            logError("AuthStore initialize error:", e);
                            set({ user: null, isLoading: false });
                        }
                    } else {
                        set({ user: null, isLoading: false });
                    }
                });
                return unsubscribe;
            },

            login: async (email: string, pass: string) => {
                const loggedUser = await authService.login(email, pass);
                if (loggedUser) {
                    const info = await getUserRoleInfo(loggedUser.id, loggedUser.role);
                    set({ user: { ...loggedUser, permissions: info.permissions, accessibleModules: info.accessibleModules } });
                }
            },

            loginWithGoogle: async () => {
                set({ isLoading: true });
                await authService.loginWithGoogle();
                // Sayfa yönleneceği için set({ user }) burada çağrılmaz
            },

            register: async (email: string, pass: string, name: string) => {
                const newUser = await authService.register(email, pass, name);
                if (newUser) {
                    const info = await getUserRoleInfo(newUser.id, newUser.role);
                    set({ user: { ...newUser, permissions: info.permissions, accessibleModules: info.accessibleModules } });
                }
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
            partialize: (state: AuthState) => ({ user: state.user } as any),
        }
    )
);
