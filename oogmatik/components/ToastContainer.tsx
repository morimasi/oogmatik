/**
 * ToastContainer — Global bildirim gösterici
 * App.tsx kök bileşenine bir kez eklenir.
 */
import React, { useEffect, useState } from 'react';
import { useToastStore, Toast, ToastType } from '../store/useToastStore';

const ICONS: Record<ToastType, string> = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info',
};

const COLORS: Record<ToastType, { bar: string; icon: string; bg: string; border: string }> = {
    success: {
        bar: 'bg-emerald-500',
        icon: 'text-emerald-500',
        bg: 'bg-[var(--bg-paper)]',
        border: 'border-emerald-500/30',
    },
    error: {
        bar: 'bg-red-500',
        icon: 'text-red-500',
        bg: 'bg-[var(--bg-paper)]',
        border: 'border-red-500/30',
    },
    warning: {
        bar: 'bg-amber-500',
        icon: 'text-amber-500',
        bg: 'bg-[var(--bg-paper)]',
        border: 'border-amber-500/30',
    },
    info: {
        bar: 'bg-blue-500',
        icon: 'text-blue-500',
        bg: 'bg-[var(--bg-paper)]',
        border: 'border-blue-500/30',
    },
};

const ToastItem = ({ toast }: { toast: Toast }) => {
    const { dismiss } = useToastStore();
    const [visible, setVisible] = useState(false);
    const colors = COLORS[toast.type];

    useEffect(() => {
        // Giriş animasyonu
        const enterTimer = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(enterTimer);
    }, []);

    return (
        <div
            className={`relative flex items-start gap-3 min-w-[280px] max-w-sm w-full
        ${colors.bg} border ${colors.border} rounded-2xl shadow-2xl overflow-hidden
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
        >
            {/* Sol renk çubuğu */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bar} rounded-l-2xl`} />

            {/* İkon */}
            <div className="pl-4 pt-3.5">
                <i className={`fa-solid ${ICONS[toast.type]} text-lg ${colors.icon}`} />
            </div>

            {/* Mesaj */}
            <div className="flex-1 py-3 pr-2">
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                    {toast.message}
                </p>
            </div>

            {/* Kapat butonu */}
            <button
                onClick={() => dismiss(toast.id)}
                className="pt-2.5 pr-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
            >
                <i className="fa-solid fa-xmark text-sm" />
            </button>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts } = useToastStore();

    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
            aria-live="polite"
            aria-label="Bildirimler"
        >
            {toasts.map((toast: Toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} />
                </div>
            ))}
        </div>
    );
};
