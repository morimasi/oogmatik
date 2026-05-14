import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileImage, FileVideo, Music, FileText, Archive } from 'lucide-react';

interface DragDropZoneProps {
  isActive: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  children: React.ReactNode;
}

export const DragDropZone: React.FC<DragDropZoneProps> = ({
  isActive,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}) => {
  return (
    <div
      className="relative flex-1 flex flex-col overflow-hidden"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-20 bg-[var(--accent-color)]/10 backdrop-blur-sm border-2 border-dashed border-[var(--accent-color)] rounded-xl flex flex-col items-center justify-center gap-3 pointer-events-none"
          >
            {/* Pulsing upload icon */}
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/40 flex items-center justify-center"
            >
              <Upload className="w-8 h-8 text-[var(--accent-color)]" />
            </motion.div>

            <div className="text-center">
              <p className="text-sm font-black text-[var(--accent-color)] uppercase tracking-widest">
                Dosyaları bırakın
              </p>
              <p className="text-[10px] text-[var(--text-muted)] font-medium mt-1">
                PDF, DOCX, XLSX, PNG, JPEG, MP4, MP3 ve daha fazlası
              </p>
            </div>

            {/* Dosya tipi ikonları */}
            <div className="flex items-center gap-2 opacity-60">
              {[FileImage, FileVideo, Music, FileText, Archive].map((Icon, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-7 h-7 rounded-lg bg-[var(--bg-paper)] border border-[var(--border-color)] flex items-center justify-center"
                >
                  <Icon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
