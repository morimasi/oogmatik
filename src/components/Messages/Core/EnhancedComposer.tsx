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
    if (editingMessage) {
      setText(editingMessage.text || '');
      textareaRef.current?.focus();
    } else if (!quotingMessage) {
      setText('');
    }
  }, [editingMessage, quotingMessage]);

  const handleSend = async () => {
    if ((!text.trim() && !pendingAttachment) || !activeConversationId || !user) return;

    try {
      setIsUploading(true);

      if (editingMessage) {
        await messageService.editMessage(activeConversationId, editingMessage.id, text, editingMessage.text || "");
        useToastStore.getState().success("Mesaj düzenlendi.", 2000);
      } else {
        const senderName = user.name || "Kullanıcı";

        await messageService.sendMessage({
          conversationId: activeConversationId,
          senderId: user.id,
          type: pendingAttachment ? "file" : "text",
          text: text.trim(),
          attachments: pendingAttachment ? [pendingAttachment as IAttachment] : [],
          threadId: activeThreadId || undefined,
          quoteData: quotingMessage ? {
            messageId: quotingMessage.id,
            originalSenderId: quotingMessage.senderId,
            originalSenderName: senderName,
            originalText: quotingMessage.text || "Dosya"
          } : undefined
        });
      }

      setText('');
      setPendingAttachment(null);
      clearComposerState();
    } catch {
      useToastStore.getState().error("Mesaj gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadResult = await fileSharingService.uploadFile(file);
      setPendingAttachment(uploadResult);
      useToastStore.getState().success(`"${file.name}" yüklendi ve tarandı.`, 2000);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Dosya yüklenemedi.";
      useToastStore.getState().error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-3 md:p-6 pb-1 md:pb-2 border-t border-white/[0.03] bg-transparent">
      <div className="max-w-screen-xl mx-auto">
        {/* Quote/Edit Bar */}
        <AnimatePresence>
          {(quotingMessage || editingMessage) && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="flex items-center justify-between mb-3 md:mb-4 p-3 md:p-4 rounded-[20px] md:rounded-[26px] bg-accent-primary/10 border border-accent-primary/20 backdrop-blur-2xl relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 bg-accent-primary" />
              <div className="flex-1 min-w-0 pr-4 md:pr-6 pl-2">
                <div className="text-[9px] md:text-[10px] font-black tracking-[0.1em] md:tracking-[0.2em] text-accent-primary mb-0.5 md:mb-1 uppercase">
                  {editingMessage ? 'Mesaj Düzenleniyor' : 'Alıntılanan Mesaj'}
                </div>
                <div className="text-[12px] md:text-[14px] text-white/60 truncate font-lexend font-medium">
                  {editingMessage ? editingMessage.text : quotingMessage?.text}
                </div>
              </div>
              <button
                onClick={clearComposerState}
                className="p-2 md:p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5 flex-shrink-0"
              >
                <X className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending Attachment Preview */}
        <AnimatePresence>
          {pendingAttachment && !quotingMessage && !editingMessage && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="flex items-center justify-between mb-3 md:mb-4 p-3 md:p-4 rounded-[20px] md:rounded-[26px] bg-white/[0.02] border border-white/10 backdrop-blur-3xl"
            >
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-accent-primary" />
                </div>
                <div className="min-w-0">
                  <span className="text-[12px] md:text-[13px] font-black text-white/80 truncate block">{pendingAttachment.name}</span>
                  <span className="text-[9px] md:text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    {fileSharingService.getFileCategory(pendingAttachment.mimeType)} - {fileSharingService.formatFileSize(pendingAttachment.size)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPendingAttachment(null)}
                className="p-2 md:p-3 rounded-2xl bg-white/5 hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all border border-white/5 flex-shrink-0"
              >
                <X className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="flex items-end gap-2 md:gap-3 px-1 md:px-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.webp,.mp3,.wav,.mp4,.webm,.txt,.csv"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !!editingMessage}
            className="p-3 md:p-5 rounded-[20px] md:rounded-[28px] bg-white/[0.03] hover:bg-white/[0.08] text-white/20 hover:text-white transition-all border border-white/5 ring-1 ring-white/5 disabled:opacity-20 transform active:scale-90 group flex-shrink-0"
          >
            <Paperclip className="w-4 h-4 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
          </button>

          <div className="flex-1 bg-white/[0.02] border border-white/[0.08] rounded-[24px] md:rounded-[32px] relative focus-within:ring-4 focus-within:ring-accent-primary/20 focus-within:bg-white/[0.04] transition-all p-1 md:p-1.5 ring-1 ring-white/5">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={editingMessage ? "Düzenlemeyi kaydet..." : "Bir iletişim sinyali gönderin..."}
              rows={1}
              className="w-full bg-transparent text-white placeholder-white/10 px-4 md:px-6 py-3 md:py-4 max-h-32 md:max-h-48 min-h-[40px] md:min-h-[52px] resize-none focus:outline-none custom-scrollbar font-lexend text-sm md:text-base font-medium"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={(!text.trim() && !pendingAttachment) || isUploading}
            className={`p-3 md:p-5 rounded-[20px] md:rounded-[28px] transition-all duration-500 disabled:opacity-30 disabled:grayscale transform active:scale-90 group relative overflow-hidden flex-shrink-0 ${
              (!text.trim() && !pendingAttachment) ? 'bg-white/[0.03] text-white/10 border border-white/5' : 'bg-accent-primary text-white shadow-[0_15px_40px_rgba(59,130,246,0.4)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.6)]'
            }`}
          >
            {isUploading ? (
              <div className="w-4 h-4 md:w-6 md:h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4 md:w-6 md:h-6 group-hover:translate-x-0.5 md:group-hover:translate-x-1 group-hover:-translate-y-0.5 md:group-hover:-translate-y-1 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
