import { create } from 'zustand';

interface AppState {
    // UI State
    isSidebarOpen: boolean;
    activeModule: string | null;
    isEditMode: boolean;
    zoomScale: number;

    // Actions
    toggleSidebar: () => void;
    setActiveModule: (module: string | null) => void;
    setEditMode: (mode: boolean) => void;
    setZoomScale: (scale: number) => void;

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
export const useAppStore = create<AppState>((set: any) => ({
    // Initial State
    isSidebarOpen: true,
    activeModule: null,
    isEditMode: false,
    zoomScale: 0.85,
    lastNotification: null,

    // Methods
    toggleSidebar: () => set((state: AppState) => ({ isSidebarOpen: !state.isSidebarOpen })),

    setActiveModule: (module: string | null) => set({ activeModule: module }),

    setEditMode: (mode: boolean) => set({ isEditMode: mode }),

    setZoomScale: (scale: number) => set({ zoomScale: scale }),

    notify: (message: string, type: 'success' | 'error' | 'info' = 'info') => set({
        lastNotification: { message, type }
    }),

    clearNotification: () => set({ lastNotification: null }),
}));
