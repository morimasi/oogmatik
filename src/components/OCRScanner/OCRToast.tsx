import React from 'react';

export type ToastType = 'error' | 'warning' | 'info' | 'success';

interface OCRToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}
export const OCRToast = ({ message, type, onClose }: OCRToastProps) => {
  const colors: Record<ToastType, string> = {
    error: 'bg-red-900/90 border-red-500/50 text-red-200',
    warning: 'bg-amber-900/90 border-amber-500/50 text-amber-200',
    info: 'bg-indigo-900/90 border-indigo-500/50 text-indigo-200',
    success: 'bg-emerald-900/90 border-emerald-500/50 text-emerald-200',
  };
  const icons: Record<ToastType, string> = {
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info',
    success: 'fa-circle-check',
  };
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-start gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl max-w-sm w-full ${colors[type]} animate-in slide-in-from-bottom-4 duration-300`}
    >
      <i className={`fa-solid ${icons[type]} text-lg mt-0.5 shrink-0`}></i>
      <p className="text-sm font-semibold leading-snug flex-1">{message}</p>
      <button
        onClick={onClose}
        className="opacity-50 hover:opacity-100 transition-opacity shrink-0 mt-0.5"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};
