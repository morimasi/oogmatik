import { useState, useEffect } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MessageFile } from '../../../types';
import { getFileCategory, formatFileSize } from '../services/fileUploadService';

interface FilePreviewProps {
  file: MessageFile | null;
  onClose: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (file) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [file?.url]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!file) return null;

  const category = getFileCategory(file.type);

  return (
    <AnimatePresence>
      {file && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-color)] shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-[var(--accent-color)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {file.name}
                  </p>
                  <p className="text-[9px] font-medium text-[var(--text-muted)]">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={file.url}
                  download={file.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--surface-glass)] transition-all"
                  title="İndir"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--surface-glass)] transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-[var(--bg-primary)] p-4">
              {loading && (
                <div className="flex items-center justify-center h-48">
                  <div className="w-6 h-6 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {category === 'image' && (
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-w-full max-h-[65vh] mx-auto rounded-xl object-contain"
                  onLoad={() => setLoading(false)}
                  onError={() => setLoading(false)}
                />
              )}

              {category === 'video' && (
                <video
                  controls
                  className="w-full max-h-[65vh] rounded-xl"
                  onLoadedData={() => setLoading(false)}
                  onError={() => setLoading(false)}
                >
                  <source src={file.url} type={file.type} />
                </video>
              )}

              {category === 'audio' && (
                <div className="flex flex-col items-center justify-center h-48 gap-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--accent-muted)] flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-color)] animate-pulse" />
                  </div>
                  <audio controls className="w-full max-w-sm" onLoadedData={() => setLoading(false)}>
                    <source src={file.url} type={file.type} />
                  </audio>
                </div>
              )}

              {category === 'document' && file.type === 'application/pdf' && (
                <iframe
                  src={file.url}
                  className="w-full h-[65vh] rounded-xl border border-[var(--border-color)]"
                  title={file.name}
                  onLoad={() => setLoading(false)}
                />
              )}

              {(category === 'document' || category === 'archive' || category === 'unknown') &&
                file.type !== 'application/pdf' && (
                  <div className="flex flex-col items-center justify-center h-48 gap-4">
                    <FileText className="w-16 h-16 text-[var(--text-muted)]" />
                    <p className="text-sm text-[var(--text-secondary)] font-medium">
                      Bu dosya türü önizlenemiyor. İndirerek görüntüleyin.
                    </p>
                    <a
                      href={file.url}
                      download={file.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[var(--accent-color)] text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all hover:opacity-90 active:scale-95"
                    >
                      İndir
                    </a>
                  </div>
                )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
