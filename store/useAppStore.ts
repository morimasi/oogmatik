import { create } from 'zustand';

interface AppState {
    // UI State
    isSidebarOpen: boolean;
    activeModule: string | null;
    designMode: boolean;

    // Actions
    toggleSidebar: () => void;
    setActiveModule: (module: string | null) => void;
    setDesignMode: (mode: boolean) => void;

    // Global App State
    lastNotification: { message: string, type: 'success' | 'error' | 'info' } | null;
    notify: (message: string, type?: 'success' | 'error' | 'info') => void;
    clearNotification: () => void;
}

/**
 * useAppStore - Merkezi Uygulama Deposu
 * Zustand kullanılarak yüksek performanslı ve basit durum yönetimi sağlar.
 * Named export 'create' kullanılarak eski versiyon uyarıları engellenmiştir.
 */
export const useAppStore = create<AppState>((set) => ({
    // Initial State
    isSidebarOpen: true,
    activeModule: null,
    designMode: false,
    lastNotification: null,

    // Methods
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    setActiveModule: (module) => set({ activeModule: module }),

    setDesignMode: (mode) => set({ designMode: mode }),

    notify: (message, type = 'info') => set({
        lastNotification: { message, type }
    }),

    clearNotification: () => set({ lastNotification: null }),
}));
