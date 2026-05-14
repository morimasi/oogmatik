import React, { useState, useRef } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { Paperclip, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fileSharingService } from '../../../services/messaging/fileSharingService';
import { messageService } from '../../../services/messaging/messageService';
import { useAuthStore } from '../../../store/useAuthStore';
import { IAttachment } from '../../../types/messaging';

export const EnhancedComposer: React.FC = () => {
    const { activeConversationId, activeThreadId, quotingMessage, editingMessage, clearComposerState } = useMessageStore();
    const { user } = useAuthStore();
    const [text, setText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [pendingAttachment, setPendingAttachment] = useState<Omit<IAttachment, "id"> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Editing mode ise text'i doldur (Gerçekte effect ile yapılır ama UI mockupı için basit tutuyoruz)
    React.useEffect(() => {
        if (editingMessage) {
            setText(editingMessage.text || '');
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
            } else {
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
                        originalSenderName: "Kullanıcı", // Mock or fetch user name
                        originalText: quotingMessage.text || "Dosya"
                    } : undefined
                });
            }

            setText('');
            setPendingAttachment(null);
            clearComposerState();
        } catch (error: any) {
            console.error("Mesaj gönderme hatası:", error);
            alert(error.userMessage || "Mesaj gönderilemedi.");
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
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="p-6 pb-2 border-t border-white/[0.03] bg-transparent">
            {/* SaaS Style Composer Bar */}
            <div className="max-w-screen-xl mx-auto">
                {/* Alıntı / Düzenleme Üst Barı - Premium Slide */}
                <AnimatePresence>
                    {(quotingMessage || editingMessage) && (
                        <motion.div 
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 10, opacity: 0 }}
                            className="flex items-center justify-between mb-4 p-4 rounded-[26px] bg-accent-primary/10 border border-accent-primary/20 backdrop-blur-2xl relative overflow-hidden group/context"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent-primary" />
                            <div className="flex-1 min-w-0 pr-6 pl-2">
                                <div className="text-[10px] font-black tracking-[0.2em] text-accent-primary mb-1 uppercase">
                                    {editingMessage ? 'Diyalog Revizyonu' : 'Sinyal Alıntısı'}
                                </div>
                                <div className="text-[14px] text-white/60 truncate font-lexend font-medium">
                                    {editingMessage ? editingMessage.text : quotingMessage?.text}
                                </div>
                            </div>
                            <button 
                                onClick={clearComposerState}
                                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all shadow-xl border border-white/5"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {pendingAttachment && !quotingMessage && !editingMessage && (
                        <motion.div 
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 10, opacity: 0 }}
                            className="flex items-center justify-between mb-4 p-4 rounded-[26px] bg-white/[0.02] border border-white/10 backdrop-blur-3xl group/file"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner group-hover/file:bg-accent-primary/20 transition-colors">
                                    <Paperclip className="w-5 h-5 text-accent-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-black text-white/80 group-hover/file:text-white transition-colors">{pendingAttachment.name}</span>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Digital Asset Ready</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setPendingAttachment(null)}
                                className="p-3 rounded-2xl bg-white/5 hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all border border-white/5"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-end gap-3 px-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.mp3,.mp4"
                    />
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || !!editingMessage}
                        className="p-5 rounded-[28px] bg-white/[0.03] hover:bg-white/[0.08] text-white/20 hover:text-white transition-all border border-white/5 ring-1 ring-white/5 disabled:opacity-20 transform active:scale-90 group"
                    >
                        <Paperclip className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    </button>

                    <div className="flex-1 bg-white/[0.02] border border-white/[0.08] rounded-[32px] relative focus-within:ring-4 focus-within:ring-accent-primary/20 focus-within:bg-white/[0.04] transition-all p-1.5 ring-1 ring-white/5">
                        <textarea 
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Bir iletişim sinyali gönderin..."
                            rows={1}
                            className="w-full bg-transparent text-white placeholder-white/10 px-6 py-4 max-h-48 min-h-[52px] resize-none focus:outline-none custom-scrollbar-hidden font-lexend text-base font-medium"
                        />
                    </div>

                    <button 
                        onClick={handleSend}
                        disabled={(!text.trim() && !pendingAttachment) || isUploading}
                        className={`p-5 rounded-[28px] transition-all duration-500 disabled:opacity-30 disabled:grayscale transform active:scale-90 group relative overflow-hidden overflow-hidden ${
                            (!text.trim() && !pendingAttachment) ? 'bg-white/[0.03] text-white/10 border border-white/5' : 'bg-accent-primary text-white shadow-[0_15px_40px_rgba(59,130,246,0.4)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.6)]'
                        }`}
                    >
                        {isUploading ? (
                             <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        )}
                    </button>
                    
                    {/* SaaS Style Status Indicator */}
                    <div className="absolute -bottom-8 right-16 flex items-center gap-2 opacity-10">
                        <span className="text-[8px] font-black text-white uppercase tracking-[0.5em]">Network Ready: TLS 1.3</span>
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
};
