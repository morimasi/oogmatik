import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Download, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MessageFile } from '../../../types';
import { getFileCategory, formatFileSize } from '../services/fileUploadService';

interface FilePreviewProps {
  file: MessageFile | null;
  allFiles?: MessageFile[]; // çoklu dosya navigasyonu için
  onClose: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, allFiles, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);

  const files = allFiles ?? (file ? [file] : []);
  const activeFile = files[currentIndex] ?? file;

  useEffect(() => {
    if (file && allFiles) {
      const idx = allFiles.findIndex((f) => f.id === file.id);
      setCurrentIndex(idx >= 0 ? idx : 0);
    }
  }, [file, allFiles]);

  useEffect(() => {
    if (activeFile) {
      setLoading(true);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [activeFile?.url]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') navigatePrev();
      if (e.key === 'ArrowRight') navigateNext();
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z + 0.25, 4));
      if (e.key === '-') setZoom((z) => Math.max(z - 0.25, 0.5));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, currentIndex, files.length]);

  const navigatePrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const navigateNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, files.length - 1));
  }, [files.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    });
  };
  const handleMouseUp = () => setIsPanning(false);

  if (!file) return null;

  const category = getFileCategory(activeFile?.type ?? '');

  return (
    <AnimatePresence>
      {file && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-color)] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-[var(--accent-color)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {activeFile?.name}
                  </p>
                  <p className="text-[9px] font-medium text-[var(--text-muted)]">
                    {formatFileSize(activeFile?.size ?? 0)}
                    {files.length > 1 && ` • ${currentIndex + 1}/${files.length}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Zoom controls (sadece resim için) */}
                {category === 'image' && (
                  <>
                    <button
                      onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                      disabled={zoom <= 0.5}
                      className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all disabled:opacity-30"
                      title="Küçült"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[9px] font-bold text-[var(--text-muted)] min-w-[32px] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
                      disabled={zoom >= 4}
                      className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all disabled:opacity-30"
                      title="Büyüt"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                      className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                      title="Sıfırla"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <a
                  href={activeFile?.url}
                  download={activeFile?.name}
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

            {/* Content */}
            <div
              className="flex-1 overflow-hidden bg-[var(--bg-primary)] relative flex items-center justify-center"
              style={{ cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {loading && (
                <div className="flex items-center justify-center h-48">
                  <div className="w-6 h-6 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {category === 'image' && activeFile && (
                <img
                  src={activeFile.url}
                  alt={activeFile.name}
                  className="max-w-full max-h-full object-contain select-none transition-transform duration-150"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  }}
                  draggable={false}
                  onLoad={() => setLoading(false)}
                  onError={() => setLoading(false)}
                />
              )}

              {category === 'video' && activeFile && (
                <video
                  controls
                  className="max-w-full max-h-[65vh] rounded-xl"
                  onLoadedData={() => setLoading(false)}
                  onError={() => setLoading(false)}
                >
                  <source src={activeFile.url} type={activeFile.type} />
                </video>
              )}

              {category === 'audio' && activeFile && (
                <div className="flex flex-col items-center justify-center h-48 gap-4 p-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent-color)] to-purple-600 flex items-center justify-center shadow-xl">
                    <div className="w-8 h-8 rounded-full bg-white/30 animate-pulse" />
                  </div>
                  <p className="text-sm font-bold text-[var(--text-primary)] text-center">{activeFile.name}</p>
                  <audio controls className="w-full max-w-md" onLoadedData={() => setLoading(false)}>
                    <source src={activeFile.url} type={activeFile.type} />
                  </audio>
                </div>
              )}

              {category === 'document' && activeFile?.type === 'application/pdf' && (
                <iframe
                  src={activeFile.url}
                  className="w-full h-full min-h-[60vh] border-none"
                  title={activeFile.name}
                  onLoad={() => setLoading(false)}
                />
              )}

              {(category === 'document' || category === 'archive' || category === 'unknown') &&
                activeFile?.type !== 'application/pdf' && (
                  <div className="flex flex-col items-center justify-center h-48 gap-4">
                    <FileText className="w-16 h-16 text-[var(--text-muted)]" />
                    <p className="text-sm text-[var(--text-secondary)] font-medium">
                      Bu dosya türü önizlenemiyor.
                    </p>
                    <a
                      href={activeFile?.url}
                      download={activeFile?.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[var(--accent-color)] text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all hover:opacity-90 active:scale-95"
                    >
                      İndir
                    </a>
                  </div>
                )}
            </div>

            {/* Multi-file navigation */}
            {files.length > 1 && (
              <div className="flex items-center justify-center gap-3 py-2.5 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] shrink-0">
                <button
                  onClick={navigatePrev}
                  disabled={currentIndex === 0}
                  className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {files.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === currentIndex
                          ? 'bg-[var(--accent-color)] w-4'
                          : 'bg-[var(--text-muted)] opacity-40'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={navigateNext}
                  disabled={currentIndex === files.length - 1}
                  className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
