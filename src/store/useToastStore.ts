import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  title?: string;
  action?: ToastAction;
  onClick?: () => void;
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, type?: ToastType, duration?: number, title?: string, onClick?: () => void, action?: ToastAction) => void;
  success: (message: string, duration?: number, title?: string) => void;
  error: (message: string, duration?: number, title?: string) => void;
  info: (message: string, duration?: number, title?: string, onClick?: () => void) => void;
  warning: (message: string, duration?: number, title?: string) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  show: (message: string, type: ToastType = 'info', duration: number = 3500, title?: string, onClick?: () => void, action?: ToastAction) => {
    toastCounter += 1;
    const id = `toast-${Date.now()}-${toastCounter}`;
    const toast: Toast = { id, message, type, duration, title, onClick, action };

    set((state) => ({ toasts: [...state.toasts, toast] }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },

  success: (message: string, duration?: number, title?: string) => {
    useToastStore.getState().show(message, 'success', duration ?? 3500, title);
  },
  error: (message: string, duration?: number, title?: string) => {
    useToastStore.getState().show(message, 'error', duration ?? 5000, title);
  },
  info: (message: string, duration?: number, title?: string, onClick?: () => void) => {
    useToastStore.getState().show(message, 'info', duration ?? 3500, title, onClick);
  },
  warning: (message: string, duration?: number, title?: string) => {
    useToastStore.getState().show(message, 'warning', duration ?? 4000, title);
  },

  dismiss: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  clear: () => set({ toasts: [] }),
}));
