import React, { useState, useRef } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { Paperclip, Send, X, FileText, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fileSharingService, UploadProgress } from '../../../services/messaging/fileSharingService';
import { messageService } from '../../../services/messaging/messageService';
import { useAuthStore } from '../../../store/useAuthStore';
import { IAttachment } from '../../../types/messaging';
import { useToastStore } from '../../../store/useToastStore';

export const EnhancedComposer: React.FC = () => {
  const { activeConversationId, activeThreadId, quotingMessage, editingMessage, clearComposerState } = useMessageStore();
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'fallback'>('idle');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [pendingAttachment, setPendingAttachment] = useState<(Omit<IAttachment, "id"> & { _fallback?: boolean; _base64?: string }) | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (editingMessage) { setText(editingMessage.text || ''); textareaRef.current?.focus(); }
    else if (!quotingMessage) setText('');
  }, [editingMessage, quotingMessage]);

  const handleSend = async () => {
    if ((!text.trim() && !pendingAttachment) || !activeConversationId || !user) return;
    try {
      if (editingMessage) {
        await messageService.editMessage(activeConversationId, editingMessage.id, text, editingMessage.text || '');
        useToastStore.getState().success('Düzenlendi', 1500);
      } else {
        const senderName = user.name || 'Kullanıcı';
        await messageService.sendMessage({
          conversationId: activeConversationId,
          senderId: user.id,
          type: pendingAttachment ? 'file' : 'text',
          text: text.trim(),
          attachments: pendingAttachment ? [{ ...pendingAttachment, id: `att-${Date.now()}` } as IAttachment] : [],
          threadId: activeThreadId || undefined,
          quoteData: quotingMessage
            ? { messageId: quotingMessage.id, originalSenderId: quotingMessage.senderId, originalSenderName: senderName, originalText: quotingMessage.text || 'Dosya' }
            : undefined,
        });
        useToastStore.getState().success('Mesaj gönderildi', 1500);
      }
      setText(''); setPendingAttachment(null); clearComposerState();
      setUploadState('idle'); setUploadError(null);
    } catch {
      useToastStore.getState().error('Gönderilemedi');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !activeConversationId) return;

    setUploadState('uploading');
    setUploadProgress({ bytesTransferred: 0, totalBytes: file.size, percentage: 0 });
    setUploadError(null);

    // 30sn görsel timeout — eğer hiç progress gelmezse kullanıcıyı uyar
    uploadTimeoutRef.current = setTimeout(() => {
      if (uploadState === 'uploading' && uploadProgress?.percentage === 0) {
        setUploadError('Storage bağlanamıyor, Base64 yedekleme deneniyor...');
      }
    }, 8000);

    try {
      const result = await fileSharingService.uploadFile(file, user.id, activeConversationId, (progress) => {
        setUploadProgress(progress);
      });

      if (result._fallback) {
        setUploadState('fallback');
        useToastStore.getState().warning(
          'Firebase Storage bağlantısı kurulamadı. Dosya geçici olarak eklendi. Mesajı gönderdikten sonra base64 olarak saklanacak, sayfa yenilemede kaybolmaz.',
          6000,
          'Yedek Depolama'
        );
      } else {
        setUploadState('done');
      }
      setPendingAttachment(result);
      setUploadProgress(null);
    } catch (err: unknown) {
      setUploadState('idle');
      setUploadProgress(null);
      useToastStore.getState().error(err instanceof Error ? err.message : 'Dosya yüklenemedi');
    } finally {
      if (uploadTimeoutRef.current) clearTimeout(uploadTimeoutRef.current);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = () => {
    setPendingAttachment(null);
    setUploadProgress(null);
    setUploadState('idle');
    setUploadError(null);
  };

  const isSendDisabled = (!text.trim() && !pendingAttachment) || uploadState === 'uploading';

  return (
    <div className="p-2 md:p-3">
      <AnimatePresence>
        {(quotingMessage || editingMessage) && (
          <motion.div initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 5, opacity: 0 }}
            className="flex items-center justify-between mb-2 p-2 rounded-xl bg-accent-primary/10 border border-accent-primary/20">
            <div className="flex-1 min-w-0 pl-1.5 pr-2">
              <div className="text-[9px] font-semibold tracking-wide text-accent-primary uppercase">{editingMessage ? 'Düzenleniyor' : 'Alıntı'}</div>
              <div className="text-[11px] text-white/50 truncate">{editingMessage ? editingMessage.text : quotingMessage?.text}</div>
            </div>
            <button onClick={clearComposerState} className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white"><X className="w-3 h-3" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadState === 'uploading' && (
          <motion.div initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 5, opacity: 0 }}
            className="mb-2 p-2.5 rounded-xl bg-accent-primary/5 border border-accent-primary/10">
            <div className="flex items-center gap-2 mb-1.5">
              <Loader2 className="w-3.5 h-3.5 text-accent-primary animate-spin" />
              <span className="text-[10px] text-accent-primary font-medium">
                {uploadError ? uploadError : 'Firebase Storage\'a yükleniyor...'}
              </span>
              {uploadProgress && <span className="text-[9px] text-white/30 ml-auto">{uploadProgress.percentage}%</span>}
            </div>
            {uploadProgress && (
              <>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress.percentage}%` }}
                    className="h-full bg-accent-primary rounded-full" transition={{ duration: 0.3 }} />
                </div>
                <p className="text-[8px] text-white/20 mt-1">
                  {(uploadProgress.bytesTransferred / 1024 / 1024).toFixed(1)}MB / {(uploadProgress.totalBytes / 1024 / 1024).toFixed(1)}MB
                </p>
              </>
            )}
            {uploadError && (
              <p className="text-[9px] text-yellow-400/70 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {uploadError}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload result warning (fallback) */}
      <AnimatePresence>
        {uploadState === 'fallback' && pendingAttachment && !quotingMessage && !editingMessage && (
          <motion.div initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 5, opacity: 0 }}
            className="mb-2 p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-semibold text-yellow-400">Firebase Storage bağlanamadı</span>
              <p className="text-[9px] text-white/40 mt-0.5">
                Dosya base64 olarak mesaj içinde saklanacak. 1MB altı dosyalar için kalıcıdır.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Attachment Preview */}
      <AnimatePresence>
        {pendingAttachment && !quotingMessage && !editingMessage && uploadState !== 'uploading' && (
          <motion.div initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 5, opacity: 0 }}
            className="flex items-center justify-between mb-2 p-2 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              {pendingAttachment.type === 'image' ? (
                <img src={pendingAttachment.url} alt={pendingAttachment.name}
                  className="w-9 h-9 rounded-lg object-cover bg-white/5 border border-white/10 flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                  <FileText className="w-4 h-4 text-accent-primary" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-white/70 truncate block max-w-[160px]">{pendingAttachment.name}</span>
                  {uploadState === 'done' && <CheckCircle className="w-3 h-3 text-green-400" />}
                  {uploadState === 'fallback' && <AlertCircle className="w-3 h-3 text-yellow-400" />}
                </div>
                <span className="text-[8px] text-white/30">
                  {fileSharingService.getFileCategory(pendingAttachment.mimeType)} &middot; {fileSharingService.formatFileSize(pendingAttachment.size)}
                  {uploadState === 'fallback' && <span className="text-yellow-400/60 ml-1">(base64)</span>}
                </span>
              </div>
            </div>
            <button onClick={removeAttachment} className="p-1 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500 flex-shrink-0"><X className="w-3 h-3" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-1.5">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden"
          accept=".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.webp,.gif,.svg,.mp3,.wav,.ogg,.mp4,.webm,.txt,.csv" />
        <button onClick={() => fileInputRef.current?.click()} disabled={uploadState === 'uploading' || !!editingMessage}
          className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/20 hover:text-white border border-white/5 disabled:opacity-20 active:scale-90 flex-shrink-0">
          <Paperclip className="w-4 h-4" />
        </button>
        <div className="flex-1 bg-white/[0.02] border border-white/[0.08] rounded-xl focus-within:ring-2 focus-within:ring-accent-primary/20 transition-all">
          <textarea ref={textareaRef} value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={editingMessage ? 'Düzenlemeyi kaydet...' : 'Mesaj yazın...'} rows={1}
            className="w-full bg-transparent text-white placeholder-white/10 px-3 py-2 max-h-28 min-h-[36px] resize-none focus:outline-none custom-scrollbar font-lexend text-sm" />
        </div>
        <button onClick={handleSend} disabled={isSendDisabled}
          className={`p-2.5 rounded-xl transition-all disabled:opacity-30 active:scale-90 flex-shrink-0 ${isSendDisabled ? 'bg-white/[0.03] text-white/10 border border-white/5' : 'bg-accent-primary text-white shadow-lg'}`}>
          {uploadState === 'uploading' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
