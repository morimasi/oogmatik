/**
 * Global Toast / Notification Sistemi
 * alert() yerine kullanılacak, tema uyumlu bildirim altyapısı
 */
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number; // ms, default 3500
}

interface ToastState {
    toasts: Toast[];
    show: (message: string, type?: ToastType, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    dismiss: (id: string) => void;
    clear: () => void;
}

export const useToastStore = create<ToastState>((set: (fn: (s: ToastState) => Partial<ToastState>) => void) => ({
    toasts: [],

    show: (message: string, type: ToastType = 'info', duration: number = 3500) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        set((state: ToastState) => ({ toasts: [...state.toasts, { id, message, type, duration }] }));
        // Otomatik kapat
        setTimeout(() => {
            set((state: ToastState) => ({ toasts: state.toasts.filter((t: Toast) => t.id !== id) }));
        }, duration);
    },

    success: (message: string, duration?: number) => {
        useToastStore.getState().show(message, 'success', duration);
    },
    error: (message: string, duration?: number) => {
        useToastStore.getState().show(message, 'error', duration ?? 5000);
    },
    info: (message: string, duration?: number) => {
        useToastStore.getState().show(message, 'info', duration);
    },
    warning: (message: string, duration?: number) => {
        useToastStore.getState().show(message, 'warning', duration);
    },

    dismiss: (id: string) => {
        set((state: ToastState) => ({ toasts: state.toasts.filter((t: Toast) => t.id !== id) }));
    },

    clear: () => set((_: ToastState) => ({ toasts: [] })),
}));
