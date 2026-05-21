import React from 'react';
import { useToastStore, ToastType, Toast } from '../../../store/useToastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react';

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-400" />,
  error: <AlertCircle className="w-5 h-5 text-red-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  info: <Info className="w-5 h-5 text-accent-primary" />,
};

const borderMap: Record<ToastType, string> = {
  success: 'border-l-green-500/50',
  error: 'border-l-red-500/50',
  warning: 'border-l-yellow-500/50',
  info: 'border-l-accent-primary/50',
};

export const ToastNotification: React.FC = () => {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast: Toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
            className={`
              pointer-events-auto relative overflow-hidden
              bg-[#0f1115]/98 backdrop-blur-[40px] 
              border border-white/[0.08] 
              rounded-[24px] shadow-2xl
              border-l-4 ${borderMap[toast.type as ToastType]}
              cursor-pointer
              ${toast.onClick ? 'hover:bg-white/[0.03]' : ''}
              transition-all duration-300
            `}
            onClick={() => {
              if (toast.onClick) {
                toast.onClick();
                dismiss(toast.id);
              }
            }}
          >
            <div className="flex items-start gap-4 p-5">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {iconMap[toast.type as ToastType]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-3 h-3 text-white/40" />
                    <h4 className="text-sm font-bold text-white truncate">{toast.title}</h4>
                  </div>
                )}
                <p className={`text-sm text-white/70 leading-relaxed ${toast.title ? '' : 'pt-1'}`}>
                  {toast.message}
                </p>
                {toast.action && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.action?.onClick();
                      dismiss(toast.id);
                    }}
                    className="mt-2 text-xs font-semibold text-accent-primary hover:text-accent-primary/80 transition-colors"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>

              {/* Close */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(toast.id);
                }}
                className="flex-shrink-0 p-1.5 rounded-xl hover:bg-white/5 text-white/20 hover:text-white/60 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
