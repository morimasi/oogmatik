import React, { useState } from 'react';
import { Attachment } from '../../../types/messaging';
import { Download, LockKeyhole as Lock, FileText, Shield } from 'lucide-react';
import { fileSharingService } from '../../../services/messaging/fileSharingService';
import { motion, AnimatePresence } from 'framer-motion';

interface SafeDocViewerProps {
  attachment: Attachment;
  userId: string;
  onClose: () => void;
}

export const SafeDocViewer: React.FC<SafeDocViewerProps> = ({ attachment, userId, onClose }) => {
  const [secureUrl, setSecureUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSecureDownload = async () => {
    setIsLoading(true);
    try {
      const tokenUrl = await fileSharingService.generateSecureTokenUrl(attachment.url, userId);
      setSecureUrl(tokenUrl);
      window.open(tokenUrl, '_blank', 'noopener,noreferrer');
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const isImage = attachment.type === 'image';
  const isVideo = attachment.type === 'video';
  const isAudio = attachment.type === 'audio';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-10"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[90vh] bg-[#0f1115]/90 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-3 bg-accent-primary/10 rounded-2xl border border-accent-primary/20">
              <FileText className="w-6 h-6 text-accent-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-bold text-lg truncate">{attachment.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white/40">{fileSharingService.getFileCategory(attachment.mimeType)}</span>
                <span className="text-white/10">•</span>
                <span className="text-xs text-white/40">{fileSharingService.formatFileSize(attachment.size)}</span>
                <span className="text-white/10">•</span>
                <Shield className="w-3 h-3 text-green-500/60" />
                <span className="text-[10px] text-green-500/60 font-medium">Güvenli</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSecureDownload}
              disabled={isLoading}
              className="p-3 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary rounded-2xl border border-accent-primary/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span className="text-xs font-semibold hidden md:inline">Güvenli İndir</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-[#050505] flex items-center justify-center min-h-[400px]">
          {isImage ? (
            <img
              src={attachment.url}
              alt={attachment.name}
              className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
            />
          ) : isVideo ? (
            <video
              src={attachment.url}
              controls
              className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl"
              style={{ maxWidth: '100%' }}
            />
          ) : isAudio ? (
            <div className="w-full max-w-lg p-12 bg-white/[0.02] rounded-[40px] border border-white/5 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-accent-primary/20 rounded-full flex items-center justify-center border border-accent-primary/30">
                <svg className="w-12 h-12 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <audio src={attachment.url} controls className="w-full" />
              <p className="text-white/40 text-sm mt-4">{attachment.name}</p>
            </div>
          ) : (
            <div className="text-center p-12">
              <div className="w-32 h-32 mx-auto mb-8 bg-white/[0.02] rounded-[40px] border border-white/5 flex items-center justify-center">
                <FileText className="w-16 h-16 text-white/20" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-green-500/60" />
                <span className="text-white/40 text-sm">256-bit şifreli belge görüntüleyici</span>
              </div>
              <button
                onClick={handleSecureDownload}
                disabled={isLoading}
                className="px-8 py-4 bg-accent-primary hover:bg-accent-primary/80 text-white rounded-[20px] transition-all font-semibold flex items-center gap-3 mx-auto shadow-[0_10px_40px_rgba(59,130,246,0.3)]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Belgeyi Güvenle İndir
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
