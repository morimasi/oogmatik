import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authService } from '../services/authService';
import { auth } from '../services/firebaseClient';
// @ts-ignore
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

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
                // Check if we're coming back from a Google Redirect
                authService.handleRedirectResult().then(user => {
                    if (user) {
                        set({ user, isLoading: false });
                    }
                });

                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
                    if (firebaseUser) {
                        try {
                            const currentUser = await authService.getCurrentUser();
                            set({ user: currentUser, isLoading: false });
                        } catch (e: unknown) {
                            const appError = e instanceof AppError ? e : new AppError(
                                'AuthStore initialize error',
                                'AUTH_INIT_ERROR',
                                500,
                                { originalError: e }
                            );
                            logError(appError);
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
                set({ user: loggedUser });
            },

            loginWithGoogle: async () => {
                set({ isLoading: true });
                await authService.loginWithGoogle();
                // Sayfa yönleneceği için set({ user }) burada çağrılmaz
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
            partialize: (state: AuthState): AuthState => ({
                user: state.user,
                isLoading: state.isLoading,
                initialize: state.initialize,
                login: state.login,
                loginWithGoogle: state.loginWithGoogle,
                register: state.register,
                logout: state.logout,
                updateProfile: state.updateProfile,
            }),
        }
    )
);
