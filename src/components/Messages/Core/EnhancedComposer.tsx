import React, { useState, useRef } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { Paperclip, Send, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fileSharingService } from '../../../services/messaging/fileSharingService';
import { messageService } from '../../../services/messaging/messageService';
import { useAuthStore } from '../../../store/useAuthStore';
import { IAttachment } from '../../../types/messaging';
import { useToastStore } from '../../../store/useToastStore';

export const EnhancedComposer: React.FC = () => {
  const { activeConversationId, activeThreadId, quotingMessage, editingMessage, clearComposerState } = useMessageStore();
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
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
        await messageService.sendMessage({
          conversationId: activeConversationId,
          senderId: user.id,
          type: pendingAttachment ? 'file' : 'text',
          text: text.trim(),
          attachments: pendingAttachment ? [pendingAttachment as IAttachment] : [],
          threadId: activeThreadId || undefined,
          quoteData: quotingMessage ? { messageId: quotingMessage.id, originalSenderId: quotingMessage.senderId, originalSenderName: user.name || 'Kullanıcı', originalText: quotingMessage.text || 'Dosya' } : undefined,
        });
      }
      setText(''); setPendingAttachment(null); clearComposerState();
    } catch { useToastStore.getState().error('Gönderilemedi'); }
    finally { setIsUploading(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const r = await fileSharingService.uploadFile(file);
      setPendingAttachment(r);
    } catch (err: unknown) { useToastStore.getState().error(err instanceof Error ? err.message : 'Yüklenemedi'); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

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
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0"><FileText className="w-4 h-4 text-accent-primary" /></div>
              <div className="min-w-0"><span className="text-[11px] font-semibold text-white/70 truncate block">{pendingAttachment.name}</span><span className="text-[8px] text-white/20">{fileSharingService.getFileCategory(pendingAttachment.mimeType)}</span></div>
            </div>
            <button onClick={() => setPendingAttachment(null)} className="p-1 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500"><X className="w-3 h-3" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-1.5">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.webp,.mp3,.wav,.mp4,.webm,.txt,.csv" />
        <button onClick={() => fileInputRef.current?.click()} disabled={isUploading || !!editingMessage}
          className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/20 hover:text-white border border-white/5 disabled:opacity-20 active:scale-90 flex-shrink-0">
          <Paperclip className="w-4 h-4" />
        </button>
        <div className="flex-1 bg-white/[0.02] border border-white/[0.08] rounded-xl focus-within:ring-2 focus-within:ring-accent-primary/20 transition-all">
          <textarea ref={textareaRef} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={editingMessage ? 'Düzenlemeyi kaydet...' : 'Mesaj yazın...'} rows={1}
            className="w-full bg-transparent text-white placeholder-white/10 px-3 py-2 max-h-28 min-h-[36px] resize-none focus:outline-none custom-scrollbar font-lexend text-sm" />
        </div>
        <button onClick={handleSend} disabled={(!text.trim() && !pendingAttachment) || isUploading}
          className={`p-2.5 rounded-xl transition-all disabled:opacity-30 active:scale-90 flex-shrink-0 ${(!text.trim() && !pendingAttachment) ? 'bg-white/[0.03] text-white/10 border border-white/5' : 'bg-accent-primary text-white shadow-lg'}`}>
          {isUploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
