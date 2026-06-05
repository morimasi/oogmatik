import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
}: ModalProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className={`relative bg-[var(--bg-paper)] rounded-[2.5rem] shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-hidden flex flex-col border border-[var(--border-color)] font-['Lexend']`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-color)] bg-[var(--surface-glass)]">
                <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight uppercase">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all active:scale-90"
                >
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
