import React, { useState, useRef, useCallback } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { Paperclip, Send, X, FileText, AlertCircle, Loader2 } from 'lucide-react';
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [pendingAttachment, setPendingAttachment] = useState<Omit<IAttachment, "id"> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (editingMessage) { setText(editingMessage.text || ''); textareaRef.current?.focus(); }
    else if (!quotingMessage) setText('');
  }, [editingMessage, quotingMessage]);

  const handleSend = async () => {
    if ((!text.trim() && !pendingAttachment) || !activeConversationId || !user) return;
    try {
      setIsUploading(true);
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
          attachments: pendingAttachment ? [pendingAttachment as IAttachment] : [],
          threadId: activeThreadId || undefined,
          quoteData: quotingMessage
            ? { messageId: quotingMessage.id, originalSenderId: quotingMessage.senderId, originalSenderName: senderName, originalText: quotingMessage.text || 'Dosya' }
            : undefined,
        });
        useToastStore.getState().success('Mesaj gönderildi', 1500);
      }
      setText(''); setPendingAttachment(null); clearComposerState();
    } catch {
      useToastStore.getState().error('Gönderilemedi');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !activeConversationId) return;
    try {
      setIsUploading(true);
      setUploadProgress({ bytesTransferred: 0, totalBytes: file.size, percentage: 0 });
      const result = await fileSharingService.uploadFile(file, user.id, activeConversationId, (progress) => {
        setUploadProgress(progress);
      });
      setPendingAttachment(result);
      setUploadProgress(null);
      useToastStore.getState().success(`"${file.name}" kalıcı olarak yüklendi`, 2500);
    } catch (err: unknown) {
      setUploadProgress(null);
      useToastStore.getState().error(err instanceof Error ? err.message : 'Yüklenemedi');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isSendDisabled = (!text.trim() && !pendingAttachment) || isUploading;

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

      <AnimatePresence>
        {pendingAttachment && !quotingMessage && !editingMessage && (
          <motion.div initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 5, opacity: 0 }}
            className="flex items-center justify-between mb-2 p-2 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              {pendingAttachment.type === 'image' ? (
                <img src={pendingAttachment.url} alt={pendingAttachment.name} className="w-8 h-8 rounded-lg object-cover bg-white/5 border border-white/10 flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                  <FileText className="w-4 h-4 text-accent-primary" />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-white/70 truncate block max-w-[180px]">{pendingAttachment.name}</span>
                <span className="text-[8px] text-white/30">{fileSharingService.getFileCategory(pendingAttachment.mimeType)} &middot; {fileSharingService.formatFileSize(pendingAttachment.size)}</span>
              </div>
            </div>
            <button onClick={() => { setPendingAttachment(null); setUploadProgress(null); }} className="p-1 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500 flex-shrink-0"><X className="w-3 h-3" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {uploadProgress && (
        <div className="mb-2 p-2 rounded-xl bg-accent-primary/5 border border-accent-primary/10">
          <div className="flex items-center gap-2 mb-1.5">
            <Loader2 className="w-3 h-3 text-accent-primary animate-spin" />
            <span className="text-[10px] text-accent-primary font-medium">Firebase Storage'a yükleniyor...</span>
            <span className="text-[9px] text-white/30 ml-auto">{uploadProgress.percentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress.percentage}%` }}
              className="h-full bg-accent-primary rounded-full"
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-[8px] text-white/20 mt-1">
            {(uploadProgress.bytesTransferred / 1024 / 1024).toFixed(1)}MB / {(uploadProgress.totalBytes / 1024 / 1024).toFixed(1)}MB
          </p>
        </div>
      )}

      <div className="flex items-end gap-1.5">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden"
          accept=".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.webp,.gif,.svg,.mp3,.wav,.ogg,.mp4,.webm,.txt,.csv" />
        <button onClick={() => fileInputRef.current?.click()} disabled={isUploading || !!editingMessage}
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
          {isUploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
